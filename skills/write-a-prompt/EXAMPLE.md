# Example prompt: improve-test-coverage/v1.md

```markdown
---
title: improve-test-coverage
version: 1
description: Each iteration adds tests for one undertested module. Use in a loop to ratchet coverage up without thrashing.
fields:
  target_dir:
    description: Directory to scan for undertested modules
    required: true
  focus:
    description: What kind of gaps to prioritize
    options: [edge-cases, error-paths, happy-paths]
    default: error-paths
---

Find the single most undertested module under {{target_dir}} (lowest coverage,
highest usage). Skip any module that already has a test file modified in the
last 5 commits — assume a prior iteration handled it.

For that one module:
1. Write tests covering its {{focus}}, following the project's existing test style.
2. Run the test suite; all tests must pass before you finish.
3. Commit with message `test: cover <module> ({{focus}})`.

If every module under {{target_dir}} meets 80% coverage, or no module qualifies,
say so plainly and stop — do not write tests for already-covered code.

Report: module chosen, coverage before/after, test cases added.
```

Why it passes the checklist: one module per iteration, discovery rule is deterministic,
the 5-commit skip rule makes re-runs idempotent, "nothing qualifies → stop" is explicit,
and the variable parts (`target_dir`, `focus`) are fields rather than baked in.
