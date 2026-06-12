---
title: assess-proposals-for-project
version: 1
description: Runs inside a project on a daily loop; assesses each new scout proposal against this project — fit, integration path, expected benefit, effort estimate — and records verdicts in the shared SQLite ledger for later eval. Use when triaging discovered tooling/patterns against a specific codebase.
fields:
  project_name:
    description: Stable identifier for this project (used as the assessments key)
    required: true
  ledger_db:
    description: Path to the shared scout ledger database
    default: ~/dev/skills/research/agentic-tooling/ledger.db
  context_file:
    description: Project-local evolving context file the loop reads and maintains
    default: .claude/scout-context.md
---

Assess newly proposed agentic tooling/patterns against this project. You are an
evaluator, not an implementer: produce verdicts and integration paths; never modify
project code in this loop.

## Setup (idempotent)

Ensure {{ledger_db}} has:
`CREATE TABLE IF NOT EXISTS assessments(id INTEGER PRIMARY KEY, proposal_id INTEGER,
project TEXT, verdict TEXT, integration_path TEXT, benefit TEXT, effort_hours REAL,
effort_class TEXT, assessed_date TEXT, outcome TEXT,
UNIQUE(proposal_id, project));`
If {{context_file}} doesn't exist, create it with empty sections: Project shape,
Past assessments worth remembering, Calibration notes.

## One iteration

1. Read {{context_file}} first — it is your accumulated knowledge of this project
   and your own past calibration.
2. If the `finds` table doesn't exist in {{ledger_db}}, the scout loop hasn't run
   yet — say so plainly and stop. Otherwise query unassessed proposals: `SELECT f.id, f.name, f.summary, f.url FROM finds f
   LEFT JOIN assessments a ON a.proposal_id = f.id AND a.project = '{{project_name}}'
   WHERE a.id IS NULL;` Read each one's proposal doc (proposals/ next to the db).
   If none, say so plainly and stop — an empty run is a valid outcome.
3. For each unassessed proposal, evaluate against the actual codebase (explore it —
   build setup, CI, existing skills/hooks, architecture):
   - **verdict**: adopt | trial | watch | skip — would this project benefit?
   - **integration_path**: concretely where/how it would wire in (files, configs,
     workflows touched)
   - **benefit**: what improves and how you'd notice
   - **effort_hours** and **effort_class**: hours | days | refactor — be honest;
     "wire in this afternoon" vs "restructure the build"
4. Insert one assessments row per proposal (outcome stays NULL — it's filled later
   by humans or an eval loop with adopted/worked/failed; your predictions vs those
   outcomes are the eval).
5. Update {{context_file}}: anything learned about the project that future runs
   need, plus calibration notes when a past prediction proved wrong. Keep it under
   ~150 lines — prune stale entries; this file evolves, your prompt does not.

## Report

End with: proposals assessed (name → verdict, effort_class), any adopt/trial
verdicts highlighted with their integration path, and one line on whether the
context file changed. If you notice a systematic gap in these instructions,
note it in the report for a human to consider as a prompt revision — do not
edit the prompt yourself.
