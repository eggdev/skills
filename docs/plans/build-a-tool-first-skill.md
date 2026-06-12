# Plan: build-a-tool-first skill (Zero-Token Deterministic Tools)

- **Assessment**: ledger assessment id 3 (proposal id 3, "Zero-Token Deterministic Tools")
- **Source proposal**: /Users/clyde/dev/skills/research/agentic-tooling/proposals/zero-token-deterministic-tools.md
- **Effort class**: hours (assessed 3.0h — looks right; see note at end)

## Goal & expected benefit

Codify the "build a tool first" convention as a mintable skill so every agent loop produced
from this repo extracts repeated deterministic steps (parsing, validation, SQL, batch edits)
into bundled `scripts/` run at zero token cost, instead of re-deriving them with the model
each session. Dogfood it immediately by extracting the duplicated ledger-SQL boilerplate from
the scout/assess/plan loop prompts into a shared script.

Expected benefit: lower token spend and flakiness in every loop minted from this repo;
shorter, more deterministic loop transcripts; reusable `scripts/` directories appearing in
skills.

## Steps

1. **Mint the skill** using `skills/write-a-skill` conventions: create
   `skills/build-a-tool-first/SKILL.md` with frontmatter (`name: build-a-tool-first`,
   trigger-rich description) instructing agents to:
   - Recognize repeated deterministic steps (parsing, sorting, validation, schema setup,
     batch edits, ledger queries) during any task.
   - Extract each into a small CLI script under the consuming artifact's `scripts/` dir
     (one `scripts/` dir per skill/prompt family — no sprawl).
   - Register every script in a manifest (`scripts/MANIFEST.md`: name, purpose, usage line)
     so future sessions discover instead of re-derive.
   - Treat tools like code: deterministic, idempotent, exit non-zero on failure, reviewed.
   - Keep judgment in the agent, coordination/determinism in code.
   *Verify*: file exists, frontmatter parses, body under ~150 lines.

2. **Dogfood — shared ledger script**: create
   `prompts/scripts/ledger.sh` (plus `prompts/scripts/MANIFEST.md`) wrapping the
   agentic-tooling ledger boilerplate currently duplicated across
   `prompts/scout-agentic-tooling/PROMPT.md`, `prompts/assess-proposals-for-project/PROMPT.md`,
   and `prompts/proposal-to-plan/PROMPT.md`: subcommands `init` (idempotent CREATE TABLEs for
   finds/assessments/plans), `unassessed`, `unplanned <project>`, `insert-*`.
   *Verify*: `prompts/scripts/ledger.sh init && prompts/scripts/ledger.sh unplanned skills-repo`
   runs against `research/agentic-tooling/ledger.db` and matches the inline SQL's output.

3. **Update loop prompts to call the script**: in the three PROMPT.md files (and bump their
   versioned copies per the prompt-library convention — write new `v2.md`, don't edit `v1.md`),
   replace inline SQL setup/query blocks with invocations of `prompts/scripts/ledger.sh`,
   keeping the inline SQL as a fallback comment for portability.
   *Verify*: diff shows no remaining duplicated CREATE TABLE blocks; a dry read of each prompt
   still makes sense standalone.

4. **Cross-reference**: add a one-line pointer in `skills/write-a-skill/SKILL.md` (step
   "Utility scripts if deterministic operations needed") referencing `build-a-tool-first`
   for when/why to extract scripts.
   *Verify*: grep for `build-a-tool-first` in write-a-skill/SKILL.md.

## Files/configs touched

- `skills/build-a-tool-first/SKILL.md` (new)
- `prompts/scripts/ledger.sh`, `prompts/scripts/MANIFEST.md` (new)
- `prompts/scout-agentic-tooling/PROMPT.md` + new `v2.md`
- `prompts/assess-proposals-for-project/PROMPT.md` + new `v2.md`
- `prompts/proposal-to-plan/PROMPT.md` + new `v2.md`
- `skills/write-a-skill/SKILL.md` (one-line cross-reference)

## Verification

- `bash -n prompts/scripts/ledger.sh` (syntax) and run `init` twice (idempotence).
- `prompts/scripts/ledger.sh unplanned skills-repo` output equals the original inline query
  run via `sqlite3` directly.
- New skill loads: frontmatter name/description present; no references to nonexistent files.
- `grep -rn "CREATE TABLE" prompts/*/PROMPT.md` returns only fallback comments (or nothing).

## Rollback

All changes are additive files plus prompt edits in a git repo:
`git checkout -- prompts/ skills/write-a-skill/SKILL.md && rm -rf skills/build-a-tool-first prompts/scripts`
(or revert the commit). The ledger database is untouched by this plan's implementation.

## Launch line

```
claude "Use superpowers:using-git-worktrees to create a worktree, then use superpowers:executing-plans to execute /Users/clyde/dev/skills/docs/plans/build-a-tool-first-skill.md"
```

## Effort note

Assessed 3.0h / "hours" looks accurate. The skill alone is ~1h; the dogfooding (script +
three prompt updates with versioning) accounts for the rest. No mismatch flagged.
