#!/usr/bin/env node
// rule-gate: evaluates the rule files in ~/.agents/rules (plus <cwd>/.agents/rules)
// against agent tool calls. Speaks the Claude Code hook protocol, which Codex CLI
// hooks are compatible with: JSON on stdin, decision JSON on stdout.
//
//   PreToolUse  -> tier "block" rules; a match denies the tool call.
//   PostToolUse -> tier "nudge" rules; a match feeds the rule body back to the agent.
//
// Rule files are omp-compatible markdown + frontmatter (condition/scope/tier).
// Fail-open by design: any internal error exits 0. RULE_GATE_DISABLE=1 skips all.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

// ---------- frontmatter ----------

function parseScalar(raw) {
  const v = raw.trim();
  if (v === "") return "";
  if (v === "true") return true;
  if (v === "false") return false;
  if (v.startsWith("[") && v.endsWith("]")) {
    try {
      return JSON.parse(v);
    } catch {
      return v
        .slice(1, -1)
        .split(",")
        .map((s) => parseScalar(s))
        .filter((s) => s !== "");
    }
  }
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
    try {
      return JSON.parse(v);
    } catch {
      return v.slice(1, -1).replace(/\\(["\\])/g, "$1");
    }
  }
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) {
    return v.slice(1, -1).replace(/''/g, "'");
  }
  return v;
}

export function parseFrontmatter(src) {
  if (!src.startsWith("---")) return { meta: {}, body: src };
  const end = src.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: src };
  const header = src.slice(src.indexOf("\n") + 1, end);
  const body = src.slice(src.indexOf("\n", end + 1) + 1);
  const meta = {};
  let listKey = null;
  for (const line of header.split("\n")) {
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && listKey) {
      if (!Array.isArray(meta[listKey])) meta[listKey] = [];
      meta[listKey].push(parseScalar(item[1]));
      continue;
    }
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (kv[2].trim() === "") {
      listKey = key;
      meta[key] = [];
    } else {
      listKey = null;
      meta[key] = parseScalar(kv[2]);
    }
  }
  return { meta, body: body.trim() };
}

// ---------- condition / scope / glob ----------

export function compileCondition(pattern) {
  let flags = "";
  let source = pattern;
  const inline = source.match(/^\(\?([imsu]+)\)/);
  if (inline) {
    flags = inline[1];
    source = source.slice(inline[0].length);
  }
  return new RegExp(source, flags);
}

export function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        re += ".*";
        i++;
        if (glob[i + 1] === "/") i++;
      } else {
        re += "[^/]*";
      }
    } else if (c === "?") {
      re += "[^/]";
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp("^" + re + "$");
}

export function globMatches(glob, filePath) {
  if (!filePath) return false;
  const p = filePath.split(path.sep).join("/");
  const re = globToRegExp(glob);
  if (glob.includes("/")) return re.test(p);
  return re.test(path.posix.basename(p));
}

// scope grammar (omp-compatible): "tool:edit(*.ts), tool:bash, text, thinking"
export function parseScope(scope) {
  const raw = Array.isArray(scope)
    ? scope
    : String(scope ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  const tokens = [];
  for (const t of raw) {
    const m = String(t).match(/^tool(?::([\w-]+))?(?:\((.+)\))?$/);
    if (m) tokens.push({ tool: m[1] ?? "*", glob: m[2] });
    // "text" / "thinking" are stream-only scopes; hooks never see them.
  }
  return tokens;
}

export function scopeMatches(tokens, kind, filePath) {
  if (tokens.length === 0) return true; // omitted scope = all tool calls
  return tokens.some((t) => {
    if (t.tool !== "*" && t.tool !== kind) return false;
    if (t.glob) return globMatches(t.glob, filePath);
    return true;
  });
}

// ---------- rule loading ----------

export function loadRules(dirs) {
  const rules = new Map(); // name -> rule; first dir wins (global is the floor)
  for (const dir of dirs) {
    let entries;
    try {
      entries = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const entry of entries.sort()) {
      if (!/\.(md|mdc)$/.test(entry)) continue;
      const name = entry.replace(/\.(md|mdc)$/, "");
      if (name.toUpperCase() === "README" || rules.has(name)) continue;
      let src;
      try {
        src = fs.readFileSync(path.join(dir, entry), "utf8");
      } catch {
        continue;
      }
      const { meta, body } = parseFrontmatter(src);
      const conditions = (Array.isArray(meta.condition) ? meta.condition : [meta.condition])
        .filter(Boolean)
        .map((c) => {
          try {
            return compileCondition(String(c));
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      if (conditions.length === 0) continue; // context-only rule; nothing to gate
      const tier =
        meta.tier === "block" || meta.tier === "nudge"
          ? meta.tier
          : meta.interruptMode === "always"
            ? "block"
            : "nudge";
      rules.set(name, {
        name,
        path: path.join(dir, entry),
        body,
        conditions,
        scope: parseScope(meta.scope),
        globs: Array.isArray(meta.globs) ? meta.globs : meta.globs ? [meta.globs] : [],
        tier,
        repeat: meta.repeat === "always" ? "always" : "once",
      });
    }
  }
  return [...rules.values()];
}

export function defaultRuleDirs(cwd) {
  if (process.env.RULE_GATE_RULES_DIR) return [process.env.RULE_GATE_RULES_DIR];
  return [
    path.join(os.homedir(), ".agents", "rules"),
    path.join(cwd ?? process.cwd(), ".agents", "rules"),
  ];
}

// ---------- tool-call normalization ----------

const EDIT_TOOLS = new Set(["Edit", "MultiEdit", "NotebookEdit", "edit", "str_replace"]);
const WRITE_TOOLS = new Set(["Write", "write", "create_file", "write_file"]);
const BASH_TOOLS = new Set(["Bash", "shell", "local_shell", "shell_command", "exec_command"]);

function parseApplyPatch(patch) {
  const targets = [];
  let current = null;
  for (const line of String(patch).split("\n")) {
    const file = line.match(/^\*\*\* (Add|Update|Delete) File: (.+)$/);
    if (file) {
      if (current) targets.push(current);
      current =
        file[1] === "Delete"
          ? null
          : { kind: file[1] === "Add" ? "write" : "edit", filePath: file[2].trim(), lines: [] };
      continue;
    }
    if (current && line.startsWith("+")) current.lines.push(line.slice(1));
  }
  if (current) targets.push(current);
  return targets.map((t) => ({ kind: t.kind, filePath: t.filePath, text: t.lines.join("\n") }));
}

// Returns [{kind: edit|write|bash, filePath, text}] for the payloads a rule can match.
export function normalizeToolCall(toolName, toolInput) {
  const ti = toolInput ?? {};
  if (toolName === "apply_patch") return parseApplyPatch(ti.input ?? ti.patch ?? ti);
  if (BASH_TOOLS.has(toolName)) {
    const cmd = Array.isArray(ti.command) ? ti.command.join(" ") : (ti.command ?? "");
    return cmd ? [{ kind: "bash", filePath: undefined, text: String(cmd) }] : [];
  }
  if (WRITE_TOOLS.has(toolName)) {
    return [{ kind: "write", filePath: ti.file_path ?? ti.path, text: String(ti.content ?? "") }];
  }
  if (EDIT_TOOLS.has(toolName)) {
    const filePath = ti.file_path ?? ti.notebook_path ?? ti.path;
    const text = Array.isArray(ti.edits)
      ? ti.edits.map((e) => e.new_string ?? "").join("\n")
      : String(ti.new_string ?? ti.new_source ?? ti.new_str ?? "");
    return [{ kind: "edit", filePath, text }];
  }
  return [];
}

// ---------- evaluation ----------

export function evaluate(rules, phase, targets, cwd) {
  const wantTier = phase === "PreToolUse" ? "block" : "nudge";
  const violations = [];
  for (const rule of rules) {
    if (rule.tier !== wantTier) continue;
    for (const target of targets) {
      if (!scopeMatches(rule.scope, target.kind, target.filePath)) continue;
      if (rule.globs.length > 0 && !rule.globs.some((g) => globMatches(g, target.filePath))) {
        continue;
      }
      if (!rule.conditions.some((re) => re.test(target.text))) continue;
      violations.push({ rule, target });
      break; // one violation per rule per call is enough
    }
  }
  return violations;
}

// "once per session" memory for nudge rules, mirroring omp's repeatMode: once.
function firedStatePath(sessionId) {
  const dir = path.join(os.tmpdir(), "rule-gate");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${String(sessionId).replace(/[^\w-]/g, "_")}.json`);
}

function filterAlreadyFired(violations, sessionId) {
  if (!sessionId) return violations;
  let fired = [];
  const file = firedStatePath(sessionId);
  try {
    fired = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    /* first firing this session */
  }
  const fresh = violations.filter(
    (v) => v.rule.repeat === "always" || !fired.includes(v.rule.name),
  );
  if (fresh.length > 0) {
    try {
      fs.writeFileSync(file, JSON.stringify([...new Set([...fired, ...fresh.map((v) => v.rule.name)])]));
    } catch {
      /* fail open */
    }
  }
  return fresh;
}

function formatReason(violations, phase) {
  const parts = violations.map(({ rule, target }) => {
    const where = target.filePath ? ` in ${target.filePath}` : "";
    const head =
      phase === "PreToolUse"
        ? `Blocked by rule "${rule.name}"${where}. Rewrite the change so it complies; do not attempt to bypass the rule.`
        : `Rule "${rule.name}" flagged this change${where}. Address it now if the flag is correct; if it is a false positive, say why and continue.`;
    return `${head}\n\n${rule.body}`;
  });
  return parts.join("\n\n---\n\n");
}

// ---------- entrypoints ----------

export function runHook(input) {
  const phase = input.hook_event_name;
  if (phase !== "PreToolUse" && phase !== "PostToolUse") return null;
  const targets = normalizeToolCall(input.tool_name, input.tool_input);
  if (targets.length === 0) return null;
  const rules = loadRules(defaultRuleDirs(input.cwd));
  let violations = evaluate(rules, phase, targets, input.cwd);
  if (phase === "PostToolUse") violations = filterAlreadyFired(violations, input.session_id);
  if (violations.length === 0) return null;
  const reason = formatReason(violations, phase);
  if (phase === "PreToolUse") {
    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    };
  }
  return { decision: "block", reason };
}

function checkCli(argv) {
  // rule-gate.mjs check --tool edit --path src/x.test.ts 'jest.mock("./db")'
  const args = { tool: "edit", path: undefined, text: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--tool") args.tool = argv[++i];
    else if (argv[i] === "--path") args.path = argv[++i];
    else args.text.push(argv[i]);
  }
  const targets = [{ kind: args.tool, filePath: args.path, text: args.text.join(" ") }];
  const rules = loadRules(defaultRuleDirs(process.cwd()));
  const hits = [
    ...evaluate(rules, "PreToolUse", targets),
    ...evaluate(rules, "PostToolUse", targets),
  ];
  if (hits.length === 0) {
    console.log(`no rule matched (${rules.length} rules loaded)`);
    return;
  }
  for (const { rule } of hits) console.log(`${rule.tier.toUpperCase()}  ${rule.name}  (${rule.path})`);
}

function main() {
  if (process.env.RULE_GATE_DISABLE === "1") return;
  if (process.argv[2] === "check") {
    checkCli(process.argv.slice(3));
    return;
  }
  let input;
  try {
    input = JSON.parse(fs.readFileSync(0, "utf8"));
  } catch {
    return;
  }
  const output = runHook(input);
  if (output) process.stdout.write(JSON.stringify(output));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch {
    /* fail open: a broken gate must never break the harness */
  }
}
