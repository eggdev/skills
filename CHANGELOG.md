# @eggdev/skills

## 0.1.0

### Minor Changes

- b2c2251: Add `bin/equip.mjs`, an interactive installer for this repository's skills,
  linked onto PATH as `equip` by `install.sh`. Pick skills with a clack-prompts
  multiselect, then a scope. Both scopes use the `npx skills` layout: the skill
  lives in `.agents/skills` (globally a symlink to this repo, in a project a
  real copy) and `.claude/skills` links through it. Rename the package to
  `@eggdev/skills` so `npm link` accepts it.
- bec869f: Add the rubric evaluation layer design and its first tooling. `docs/rubric-evals.md`
  holds the confirmed design: cross-vendor judge panel (Claude and Codex judge every
  diff), binary criteria with severities, stop-hook bounces plus a pre-commit gate,
  JSONL telemetry, and a calibration corpus of user-graded exemplar diffs at
  `~/.agents/corpus/`. `rubrics/README.md` defines the rubric format and authoring
  standard. New skills: `write-rubric` (author one rubric, six steps ending in a
  real-diff probe) and the vendored `writing-great-skills` from mattpocock/skills.
  `install.sh` now links `~/.agents/rubrics`.
- f338be2: Author `rubrics/simplicity.md`, the first rubric of the evaluation layer. Six
  criteria: single-use abstraction, speculative generality, dead code (blocker),
  commented-out code (blocker), orphaned references, and smallest change. Probed
  against two real commits from history: one clean pass, one confirmed
  orphaned-component failure.
- ad6dd79: Add the universal rules system: canonical rule files in `rules/` (omp-compatible
  markdown + frontmatter with regex triggers), the `hooks/rule-gate.mjs` engine that
  enforces them as PreToolUse/PostToolUse hooks in Claude Code and Codex CLI, and
  `install.sh` to wire the symlinks and hook config globally. Seeded with
  no-internal-mocks, no-test-tautologies, no-git-bypass, no-lint-suppressions, and
  react-no-unnecessary-effects.

### Patch Changes

- 50b05b9: Remove the unread `cwd` parameter from `evaluate()` in `hooks/rule-gate.mjs`.
  Rule-dir resolution already consumes `cwd` in `defaultRuleDirs()` before
  evaluation runs.
