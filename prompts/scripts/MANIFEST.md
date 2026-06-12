# Prompt-library scripts

Deterministic tools shared by the loop prompts (see `skills/build-a-tool-first`).

| Script | Purpose | Usage |
|--------|---------|-------|
| `ledger.sh` | Schema setup and common queries/inserts for the scout → assess → plan ledger (`research/agentic-tooling/ledger.db`) | `prompts/scripts/ledger.sh [-d db] init \| unassessed <project> \| unplanned <project> \| insert-find/insert-assessment/insert-plan ...` |
