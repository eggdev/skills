# Rubrics

The judgment tier of engineering standards. One markdown file per quality
dimension. A cross-vendor judge panel scores each finished diff against these
files at two moments: agent stop and git commit. The full design is in
[`docs/rubric-evals.md`](../docs/rubric-evals.md).

Status: the runner (`hooks/rubric-judge.mjs`) and its hooks are not built yet.
Rubric files authored now are consumed the moment the runner lands.

## Format

```markdown
---
description: "One-line statement of the dimension."
scope: "**/*"
criteria:
  - id: stable-key
    check: "Binary statement a judge answers pass or fail from the diff alone."
    severity: blocker
---

Judge guidance: what good looks like, a pass example, a fail example, and the
known false positives.
```

| Field | Meaning |
|---|---|
| `description` | One line. States the dimension. |
| `scope` | File globs the rubric applies to. Omit for all files. |
| `criteria[].id` | Stable key. Telemetry trends it and the runner merges the two judges' verdicts on it. A shipped id keeps its name forever. |
| `criteria[].check` | One sentence. A judge answers pass or fail from the diff alone. |
| `criteria[].severity` | `blocker` denies the gate. `advisory` reports only. |

## Authoring standard

- Every criterion is binary-decidable: a judge answers pass or fail from the
  diff alone.
- Every failure cites evidence as `file:line`.
- The body lists the known false positives a judge must accept.
- Probe the rubric against two real diffs before it ships: one expected to
  pass, one expected to fail.

The [`write-rubric`](../skills/write-rubric/SKILL.md) skill walks these steps
in order.

## Where a finding belongs

A finding lives in the cheapest tier that can hold it.

| The finding is | It belongs in |
|---|---|
| Catchable by a regex over added text | [`rules/`](../rules/) |
| Decidable by judgment over a diff | A criterion here |
| Taste, context, or style | [`home/AGENTS.md`](../home/AGENTS.md) prose |

Reserve `blocker` for checks with near-zero false positives, the same bar
`rules/` sets for its `block` tier. A wrong blocker denies a commit; a wrong
advisory costs almost nothing.
