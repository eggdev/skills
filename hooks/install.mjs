#!/usr/bin/env node
// Wires rule-gate into the harnesses that support Claude-style hooks:
//   ~/.claude/settings.json  (Claude Code)
//   ~/.codex/hooks.json      (Codex CLI)
// Idempotent: existing rule-gate entries are replaced, everything else is preserved.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const command = `node "${path.join(repoRoot, "hooks", "rule-gate.mjs")}"`;

function upsert(hooks, event, matcher) {
  const groups = (hooks[event] ?? []).map((group) => ({
    ...group,
    hooks: (group.hooks ?? []).filter((h) => !String(h.command).includes("rule-gate.mjs")),
  }));
  hooks[event] = groups.filter((g) => g.hooks.length > 0);
  hooks[event].push({ matcher, hooks: [{ type: "command", command, timeout: 10 }] });
}

function updateJson(file, mutate) {
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    /* absent or empty: start fresh */
  }
  mutate(data);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log(`wired rule-gate hooks into ${file}`);
}

const claudeMatcher = "Edit|MultiEdit|Write|NotebookEdit|Bash";

updateJson(path.join(os.homedir(), ".claude", "settings.json"), (settings) => {
  settings.hooks ??= {};
  upsert(settings.hooks, "PreToolUse", claudeMatcher);
  upsert(settings.hooks, "PostToolUse", claudeMatcher);
});

updateJson(path.join(os.homedir(), ".codex", "hooks.json"), (config) => {
  config.hooks ??= {};
  upsert(config.hooks, "PreToolUse", ".*");
  upsert(config.hooks, "PostToolUse", ".*");
});
