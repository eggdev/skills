import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseFrontmatter,
  compileCondition,
  globMatches,
  parseScope,
  scopeMatches,
  loadRules,
  normalizeToolCall,
  evaluate,
} from "./rule-gate.mjs";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const rulesDir = path.join(repoRoot, "rules");
const rules = loadRules([rulesDir]);

test("frontmatter: double-quoted regex with escapes survives parsing", () => {
  const { meta, body } = parseFrontmatter(
    '---\ndescription: "x"\ncondition: "useEffect\\\\("\ntier: block\n---\n\nBody text.\n',
  );
  assert.equal(meta.condition, "useEffect\\(");
  assert.equal(meta.tier, "block");
  assert.equal(body, "Body text.");
  assert.doesNotThrow(() => compileCondition(meta.condition));
});

test("frontmatter: inline flags compile to RegExp flags", () => {
  const re = compileCondition("(?m)^assert True$");
  assert.ok(re.multiline);
  assert.ok(re.test("x = 1\nassert True"));
});

test("glob: bare globs match basenames anywhere in the tree", () => {
  assert.ok(globMatches("*.test.*", "src/deep/foo.test.ts"));
  assert.ok(globMatches("test_*.py", "tests/test_api.py"));
  assert.ok(!globMatches("*.test.*", "src/foo.ts"));
});

test("scope: tool tokens parse and filter by kind + glob", () => {
  const tokens = parseScope("tool:edit(*.test.*), tool:bash, text");
  assert.ok(scopeMatches(tokens, "edit", "a/b.test.ts"));
  assert.ok(!scopeMatches(tokens, "edit", "a/b.ts"));
  assert.ok(scopeMatches(tokens, "bash", undefined));
  assert.ok(!scopeMatches(tokens, "write", "a/b.test.ts"));
});

test("repo rules load with conditions and tiers", () => {
  const names = rules.map((r) => r.name).sort();
  assert.ok(names.includes("no-internal-mocks"));
  assert.ok(names.includes("no-git-bypass"));
  assert.equal(rules.find((r) => r.name === "no-internal-mocks").tier, "block");
  assert.equal(rules.find((r) => r.name === "no-lint-suppressions").tier, "nudge");
});

test("no-internal-mocks: blocks relative-path mocks in test files at PreToolUse", () => {
  const targets = normalizeToolCall("Edit", {
    file_path: "/repo/src/user.test.ts",
    new_string: 'jest.mock("../db/client");',
  });
  const v = evaluate(rules, "PreToolUse", targets);
  assert.equal(v.length, 1);
  assert.equal(v[0].rule.name, "no-internal-mocks");
});

test("no-internal-mocks: vitest and ESM variants match", () => {
  for (const snippet of [
    "vi.mock('./service')",
    "vi.doMock('@/lib/auth')",
    "jest.unstable_mockModule('../x.mjs', () => ({}))",
  ]) {
    const targets = normalizeToolCall("Write", { file_path: "a.spec.ts", content: snippet });
    assert.equal(evaluate(rules, "PreToolUse", targets).length, 1, snippet);
  }
});

test("no-internal-mocks: boundary mocks and non-test files pass", () => {
  const external = normalizeToolCall("Edit", {
    file_path: "a.test.ts",
    new_string: 'vi.mock("stripe")',
  });
  assert.equal(evaluate(rules, "PreToolUse", external).length, 0);
  const nonTest = normalizeToolCall("Edit", {
    file_path: "src/setup.ts",
    new_string: 'jest.mock("./db")',
  });
  assert.equal(evaluate(rules, "PreToolUse", nonTest).length, 0);
});

test("no-test-tautologies: catches placeholder assertions", () => {
  const hits = normalizeToolCall("Edit", {
    file_path: "x.test.js",
    new_string: "expect(true).toBe(true);",
  });
  assert.equal(evaluate(rules, "PreToolUse", hits)[0]?.rule.name, "no-test-tautologies");
  const real = normalizeToolCall("Edit", {
    file_path: "x.test.js",
    new_string: "expect(result.total).toBe(42);",
  });
  assert.equal(evaluate(rules, "PreToolUse", real).length, 0);
});

test("no-git-bypass: force push blocked, lease-protected push allowed", () => {
  const forced = normalizeToolCall("Bash", { command: "git push origin main --force" });
  assert.equal(evaluate(rules, "PreToolUse", forced)[0]?.rule.name, "no-git-bypass");
  const noVerify = normalizeToolCall("Bash", { command: "git commit -m x --no-verify" });
  assert.equal(evaluate(rules, "PreToolUse", noVerify).length, 1);
  const lease = normalizeToolCall("Bash", { command: "git push --force-with-lease origin main" });
  assert.equal(evaluate(rules, "PreToolUse", lease).length, 0);
});

test("no-lint-suppressions: nudges at PostToolUse only", () => {
  const targets = normalizeToolCall("Edit", {
    file_path: "src/a.ts",
    new_string: "// eslint-disable-next-line no-console",
  });
  assert.equal(evaluate(rules, "PreToolUse", targets).length, 0);
  assert.equal(evaluate(rules, "PostToolUse", targets)[0]?.rule.name, "no-lint-suppressions");
});

test("codex apply_patch: added lines are extracted per file and matched", () => {
  const patch = [
    "*** Begin Patch",
    "*** Update File: src/order.test.ts",
    "@@",
    "-import { db } from '../db';",
    "+jest.mock('../db');",
    "*** Add File: src/notes.md",
    "+jest.mock('../db') is discouraged",
    "*** End Patch",
  ].join("\n");
  const targets = normalizeToolCall("apply_patch", { input: patch });
  assert.equal(targets.length, 2);
  const v = evaluate(rules, "PreToolUse", targets);
  assert.equal(v.length, 1); // .md target is outside the rule's scope
  assert.equal(v[0].target.filePath, "src/order.test.ts");
});

test("codex shell: array argv is joined before matching", () => {
  const targets = normalizeToolCall("shell", {
    command: ["bash", "-lc", "git push -f origin main"],
  });
  assert.equal(evaluate(rules, "PreToolUse", targets).length, 1);
});

test("process integration: PreToolUse deny JSON on stdout, exit 0", () => {
  const input = JSON.stringify({
    hook_event_name: "PreToolUse",
    session_id: "test-session",
    cwd: "/tmp",
    tool_name: "Edit",
    tool_input: { file_path: "a.test.ts", new_string: "vi.mock('./x')" },
  });
  const stdout = execFileSync(process.execPath, [path.join(repoRoot, "hooks", "rule-gate.mjs")], {
    input,
    env: { ...process.env, RULE_GATE_RULES_DIR: rulesDir },
  }).toString();
  const out = JSON.parse(stdout);
  assert.equal(out.hookSpecificOutput.permissionDecision, "deny");
  assert.match(out.hookSpecificOutput.permissionDecisionReason, /no-internal-mocks/);
});

test("process integration: clean call produces no output", () => {
  const input = JSON.stringify({
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    tool_input: { command: "git status" },
  });
  const stdout = execFileSync(process.execPath, [path.join(repoRoot, "hooks", "rule-gate.mjs")], {
    input,
    env: { ...process.env, RULE_GATE_RULES_DIR: rulesDir },
  }).toString();
  assert.equal(stdout, "");
});

test("process integration: garbage stdin fails open", () => {
  const stdout = execFileSync(process.execPath, [path.join(repoRoot, "hooks", "rule-gate.mjs")], {
    input: "not json",
    env: { ...process.env, RULE_GATE_RULES_DIR: rulesDir },
  }).toString();
  assert.equal(stdout, "");
});
