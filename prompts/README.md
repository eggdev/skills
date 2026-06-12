# Prompt Library

Reusable, parameterized prompts for looped agent sessions. Minted and revised via the `write-a-prompt` skill — each prompt lives in `prompts/<title>/` with immutable versions (`v1.md`, `v2.md`, …) and `PROMPT.md` as the current copy.

| Title | Description | Fields | Current |
|-------|-------------|--------|---------|
| [assess-proposals-for-project](assess-proposals-for-project/PROMPT.md) | In-project daily loop assessing new scout proposals: verdict, integration path, benefit, effort; records to shared ledger for eval | project_name (req), ledger_db, context_file | v1 |
| [proposal-to-plan](proposal-to-plan/PROMPT.md) | In-project loop converting adopt-verdict assessments into implementation plans (steps, verification, rollback, launch line); records to shared ledger | project_name (req), ledger_db, plans_dir | v2 |
| [scout-agentic-tooling](scout-agentic-tooling/PROMPT.md) | Daily last30days sweep for new agentic dev tooling; writes proposal docs, dedupes via SQLite ledger | org_context (req), max_proposals=3, research_dir | v1 |
