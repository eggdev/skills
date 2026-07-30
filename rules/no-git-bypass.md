---
description: "Never bypass repository safety machinery: no --no-verify, no force pushes without lease protection."
condition: "(?m)git\\s+commit\\b[^;&|\\n]*(\\s--no-verify\\b|\\s-n\\b)|git\\s+push\\b[^;&|\\n]*(\\s--no-verify\\b|\\s(--force(?!-with-lease)|-f)\\b)"
scope: "tool:bash"
tier: block
interruptMode: always
---

Pre-commit hooks and push protection are the repository's own quality gates.
Bypassing them (`--no-verify`, `git commit -n`, `git push --force`,
`git push -f`) defeats the enforcement layer this project relies on.

Instead:

- If a hook fails, fix the underlying problem the hook found.
- If you must rewrite already-pushed history, use `--force-with-lease` so you
  cannot clobber work you have not seen.
- If a hook is itself broken, report that to the user; do not route around it.
