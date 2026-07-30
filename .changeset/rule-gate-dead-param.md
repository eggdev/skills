---
"eggdev/skills": patch
---

Remove the unread `cwd` parameter from `evaluate()` in `hooks/rule-gate.mjs`.
Rule-dir resolution already consumes `cwd` in `defaultRuleDirs()` before
evaluation runs.
