# Rules

Universal engineering rules, defined once here and enforced in every harness.
Each rule is one markdown file: a machine-checkable trigger in the frontmatter,
and the instruction an agent reads when it trips. Rules are keyed by filename.
The rule costs no context until it is violated.

This is the paradigm from [oh-my-pi](https://github.com/can1357/oh-my-pi)'s
TTSR rules, made portable. The files use omp's frontmatter schema, so omp
consumes this directory natively (via the `~/.agents/rules` symlink). Claude
Code and Codex CLI enforce the same files through
[`hooks/rule-gate.mjs`](../hooks/rule-gate.mjs), wired as PreToolUse and
PostToolUse hooks by [`install.sh`](../install.sh).

## Format

```markdown
---
description: "One-line statement of the rule."
condition: "regex matched against the change payload"
scope: "tool:edit(*.test.*), tool:write(*.test.*), tool:bash"
tier: block
interruptMode: always
---

The instruction the agent receives when the rule trips. Say what to do
instead, not just what is forbidden.
```

| Field | Meaning |
|---|---|
| `condition` | Regex (string or list; any match trips). Leading `(?i)`/`(?m)`/`(?s)` inline flags supported. Matched against added text only: `new_string`, written content, patch `+` lines, or the shell command. |
| `scope` | Comma-separated tokens: `tool:edit(GLOB)`, `tool:write(GLOB)`, `tool:bash`, bare `tool`. Globs without `/` match basenames. Omitted scope means all tool calls. `text`/`thinking` tokens are omp-stream-only; the gate ignores them. |
| `tier` | `block` or `nudge`. See below. Defaults to `nudge`. |
| `interruptMode` | omp's field; keep it consistent with tier (`always` for block, `never` for nudge) so omp behaves the same way. |
| `repeat` | Nudge tiers only: `once` (default, once per session) or `always`. |

## Tiers

| Tier | Semantics | Claude Code / Codex | omp |
|---|---|---|---|
| `block` | The tool call is denied; the rule body is the reason. | PreToolUse deny | TTSR stream interrupt |
| `nudge` | The change lands; the rule body is fed back to the agent once per session. | PostToolUse feedback | TTSR tool reminder |

Reserve `block` for rules with near-zero false positives. A wrong block wastes
an agent turn; a wrong nudge costs almost nothing. Rules that need judgment
belong in prose ([`home/AGENTS.md`](../home/AGENTS.md)) or a skill, not here.
Rules a repository can enforce itself (lint, CI) should also live there; the
gate is the floor for repositories that have no such tooling.

## Authoring a rule

1. Write the file here. Name it for the violation: `no-<thing>.md`.
2. Write the body in ASD-STE100 Simplified Technical English: imperative
   mood, short sentences, one instruction per sentence. Keep it under 20
   lines. A tripped rule is an interrupt, so carry only the corrective
   payload: what to do instead, then a link to the canonical reference.
   Long-form guidance belongs in a skill, not in a rule body.
3. Probe it: `node hooks/rule-gate.mjs check --tool edit --path a.test.ts 'offending snippet'`.
4. Add positive and negative cases to `hooks/rule-gate.test.mjs` and run
   `npm test`. The negative cases matter more: they are the false positives
   that would make agents distrust the gate.
5. Sessions pick the file up immediately; the gate re-reads this directory
   on every tool call.

## Escape hatches and limits

- `RULE_GATE_DISABLE=1` disables the gate for a command or session.
- The gate fails open: any internal error allows the tool call.
- Matching is regex over added text. A violating string quoted inside an
  innocent command (for example an `echo` of a forbidden git flag) still
  trips the rule; rephrase or move the payload into a file.
- Projects can add rules in `<repo>/.agents/rules/`, but global names win:
  this directory is the floor and a project cannot weaken it.
