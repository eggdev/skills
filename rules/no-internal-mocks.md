---
description: "Never mock in-project modules in tests. Tests import the real adjacent code. Mock only at true system boundaries: external APIs, time, randomness."
condition: "\\b(jest|vi)\\.(unstable_)?(do)?[mM]ock(Module)?\\s*\\(\\s*['\"](\\.{1,2}/|~/|@/|#|src/)"
scope: "tool:edit(*.test.*), tool:write(*.test.*), tool:edit(*.spec.*), tool:write(*.spec.*), tool:edit(test_*.py), tool:write(test_*.py), tool:edit(*_test.*), tool:write(*_test.*)"
tier: block
interruptMode: always
---

Tests must import in-project code, never mock it. A relative path or project
alias (`./`, `../`, `~/`, `@/`, `#`, `src/`) inside a mock call means you are
mocking code this project owns. Mocked internal modules let tests pass while
the real integration is broken.

Instead:

- Import the real module and exercise it directly.
- If the module is hard to use in a test, that is a design signal: extract the
  boundary dependency and inject it.
- Mock only true system boundaries: external network APIs, payment/email
  providers, clocks, randomness. Bare package specifiers for external SDKs are
  acceptable mock targets.
