---
"eggdev/skills": minor
---

Add the universal rules system: canonical rule files in `rules/` (omp-compatible
markdown + frontmatter with regex triggers), the `hooks/rule-gate.mjs` engine that
enforces them as PreToolUse/PostToolUse hooks in Claude Code and Codex CLI, and
`install.sh` to wire the symlinks and hook config globally. Seeded with
no-internal-mocks, no-test-tautologies, no-git-bypass, no-lint-suppressions, and
react-no-unnecessary-effects.
