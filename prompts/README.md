# Prompt Library

Reusable, parameterized prompts for looped agent sessions. Minted and revised via the `write-a-prompt` skill — each prompt lives in `prompts/<title>/` with immutable versions (`v1.md`, `v2.md`, …) and `PROMPT.md` as the current copy.

| Title | Description | Fields | Current |
|-------|-------------|--------|---------|
| [scout-agentic-tooling](scout-agentic-tooling/PROMPT.md) | Daily last30days sweep for new agentic dev tooling; writes proposal docs, dedupes via SQLite ledger | org_context (req), max_proposals=3, research_dir | v1 |
