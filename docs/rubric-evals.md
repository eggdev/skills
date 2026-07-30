# Rubric evaluation layer

Status: confirmed design, 2026-07-29. Not yet built.

## Purpose

The rubric layer evaluates the quality of finished agent work. It is a
corrective gate: the producing agent receives the verdicts and must repair the
work before it yields or commits. Verdicts persist as telemetry, so
cross-agent comparison accrues as a byproduct.

The rule gate checks each tool call against hard rules. Rubrics judge the
finished unit of work.

## The tier ladder

| Tier | Holds | Enforcement |
|---|---|---|
| [`home/AGENTS.md`](../home/AGENTS.md) | Taste and context, as prose | None. Loads into every session. |
| `rubrics/` | Judgment, encoded as binary criteria | LLM judge panel at stop and at commit. |
| [`rules/`](../rules/) | Mechanical checks with near-zero false positives | Regex gate on every tool call. |

A finding lives in the cheapest tier that can hold it. The `/eval-review`
skill migrates findings down the ladder once they prove regex-able.

## Triggers

Two moments trigger an evaluation.

1. **Stop hook** (advisory-corrective). The agent ends its turn with a
   nonempty code diff. The panel judges the working tree against the rubrics.
   Failures bounce the agent back to repair the work.
2. **Commit boundary** (hard gate). A pre-commit hook judges the staged diff.
   Remaining blockers deny the commit.

## Judge panel

The runner invokes one judge per vendor: `claude -p` and `codex exec`. The
panel is constant no matter which harness produced the code, so verdicts stay
comparable across Claude, Codex, and omp. Both judges must return zero failing
blockers.

Same-vendor passes (Claude judging Claude, Codex judging Codex) sit behind a
config flag. The flag is off by default in v1.

Each judge prompt is assembled as: the rubric file, its anchored exemplars,
then the diff under judgment. Anchors come from the calibration corpus (see
Calibration below).

## Verdicts

Each judge returns JSON keyed by criterion id. A verdict is pass or fail. Each
failure carries a severity (`blocker` or `advisory`) and evidence in
`file:line` form. The gate fails when any blocker fails for either judge.

The runner derives a numeric score from the verdicts for telemetry. No gate
reads the number.

## Rubric format

One markdown file per quality dimension in `rubrics/`. Frontmatter carries the
machine-readable criteria. The body carries judge guidance: what good looks
like, pass and fail examples, and known false positives.

```markdown
---
description: "New code reuses existing helpers instead of reimplementing them."
scope: "**/*"
criteria:
  - id: reuse-existing
    check: "The diff does not reimplement a helper that already exists in the repository."
    severity: blocker
  - id: consolidate-copies
    check: "The diff does not leave two near-identical blocks where one shared function serves both."
    severity: blocker
  - id: extract-on-second-caller
    check: "Logic that gains a second caller in this diff moves to a shared function."
    severity: advisory
---

Judge guidance goes here.
```

Criterion ids are stable keys. Telemetry trends them over time, and the runner
merges the two judges' verdicts on them.

## v1 dimensions

| File | Judges |
|---|---|
| `rubrics/simplicity.md` | No unnecessary abstraction, no speculative generality, no dead code. The smallest change that solves the task. |
| `rubrics/duplication.md` | New code reuses existing helpers. Near-copies introduced by the diff get consolidated. |
| `rubrics/placement.md` | Code lands in the module that owns the concern. Dependencies point the right direction. |
| `rubrics/test-quality.md` | Changed behavior has tests that fail if the change is reverted. Tests assert outcomes. |

Placement is the hardest to judge repo-agnostically. Its body needs the most
guidance.

## Commit gate

`install.sh` sets global `core.hooksPath` to this repo's `git-hooks/`
directory. The `pre-commit` script there runs the judge panel on the staged
diff, then chains to the repository's own hooks (`.git/hooks/pre-commit`,
husky, lefthook) when present.

Every commit blocks, human or agent. Humans can bypass with
`git commit --no-verify`. The [`no-git-bypass`](../rules/no-git-bypass.md)
rule denies that flag to agents.

## Stop-hook loop

The Stop hook denies the stop and returns the failure payload to the agent.
It does this at most twice per diff hash. The runner re-judges only when the
diff hash changed since the last verdict. After the cap, the agent may stop
and the unresolved findings print for the user. The commit gate still stands
behind it.

Wiring: Claude Code and Codex CLI get Stop hooks through the existing
`hooks/install.mjs` path. omp has no hook mechanism, so a TTSR rule halts
`git commit` and instructs the agent to run the runner first. omp receives no
stop-time review in v1.

## Telemetry

The runner appends one JSONL record per judge run to
`~/.agents/evals/log.jsonl`.

```json
{
  "ts": "2026-07-29T21:04:00Z",
  "repo": "/Users/me/dev/skills",
  "producer": "codex",
  "trigger": "stop",
  "judge": "claude",
  "diffHash": "a1b2c3",
  "bounce": 1,
  "outcome": "blocked",
  "verdicts": [
    {
      "rubric": "duplication",
      "criterion": "reuse-existing",
      "pass": false,
      "severity": "blocker",
      "evidence": "src/x.ts:42 reimplements parseArgs from src/cli/args.ts"
    }
  ]
}
```

`producer` is one of `claude`, `codex`, `omp`, `human`, detected from harness
env markers. `outcome` is one of `passed`, `blocked`, `capped`.

## Authoring and evolution

`rubrics/README.md` defines the authoring standard:

- Every criterion is binary-decidable.
- Every failure cites evidence as `file:line`.
- The body lists known false positives.
- A probe command tests the rubric against a sample diff before it ships.

The `/eval-review` skill reads `log.jsonl` on demand. It proposes rule
promotions for recurring failures with regex-able signatures. It flags
criteria the two judges keep disagreeing on for body edits or severity
downgrades. It renders a scorecard by producer. A human approves every change.

## Calibration

A calibration session grounds the rubrics in your graded judgments. The
`calibrate` skill launches a local grading app (`apps/grader/`), queues diffs,
and records your grades to the corpus. The corpus is ground truth: criteria,
anchors, and replays regenerate from it.

- **Grading move.** Per diff you give a block-or-pass verdict, mark the hunks
  that drove it, and write one reason per mark. Same-task variants also get a
  best-to-worst order.
- **Diff sources.** Generated variants of a shared task, real history,
  co-authored cases, and live gate traffic once the layer runs.
- **Corpus.** `~/.agents/corpus/`, one directory per exemplar: `diff.patch`
  plus `meta.json` with id, source, task, producer, verdict, marks as
  `{file, lines, reason}`, rubric tags, anchor flag, rank within its task
  set, and timestamp.
- **Anchors.** You flag exemplars as anchors. The runner packs about three
  per rubric into each judge prompt, spanning the tiers: a clean pass, an
  advisory, a block.
- **Epilogue.** Every session ends with a derivation pass. The agent clusters
  the session's reasons, maps them onto existing criteria or drafts new ones,
  proposes severity moves where your verdicts contradict current blockers,
  and shows the rubric edits as diffs for your approval while the reasoning
  is fresh.
- **Replay.** `/eval-review` runs the judges over the corpus and reports
  judge-vs-you agreement per criterion. That agreement rate is what makes the
  gate defensible.

Code in the corpus stays on the machine. The grading app writes to disk and
publishes nothing.

## Escape hatches and accepted costs

- `RUBRIC_GATE_DISABLE=1` disables the layer for a command or session.
- Judge errors fail open, matching the rule gate.
- The runner skips diffs with no code changes. It never re-judges an
  unchanged diff hash.
- Accepted cost: every commit waits on two vendor API calls, roughly 30 to 60
  seconds.

## Layout

| Path | Contents |
|---|---|
| `rubrics/*.md` | Rubric definitions. |
| `rubrics/README.md` | Format, authoring standard, tier ladder. |
| `hooks/rubric-judge.mjs` | Runner: diff in, panel out, verdicts merged, gate decision. |
| `git-hooks/pre-commit` | hooksPath entry point. Runs the panel, chains to repo hooks. |
| `skills/write-rubric/` | Authoring skill: tier gate, criteria, body, probe, ship. |
| `skills/calibrate/` | Calibration session skill: queue diffs, grade, epilogue derivation. |
| `apps/grader/` | Local grading app. Renders the diff queue, records grades to the corpus. |
| `skills/eval-review/` | Analysis skill over the telemetry log and the corpus replay. |
| `install.sh`, `hooks/install.mjs` | `~/.agents/rubrics` symlink, hooksPath config, Stop hook wiring. |
