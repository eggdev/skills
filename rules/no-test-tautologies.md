---
description: "No placeholder or tautological test assertions. Every assertion must check real behavior of the code under test."
condition: "(?m)expect\\(\\s*(true|false|[0-9]+)\\s*\\)\\s*\\.\\s*(toBe|toEqual|toStrictEqual)\\(\\s*\\1\\s*\\)|expect\\(true\\)\\.toBeTruthy\\(\\)|expect\\(false\\)\\.toBeFalsy\\(\\)|^\\s*assert\\s+True\\s*(#.*)?$|assertTrue\\(\\s*True\\s*\\)"
scope: "tool:edit(*.test.*), tool:write(*.test.*), tool:edit(*.spec.*), tool:write(*.spec.*), tool:edit(test_*.py), tool:write(test_*.py), tool:edit(*_test.*), tool:write(*_test.*)"
tier: block
interruptMode: always
---

This assertion is a tautology: it passes no matter what the code under test
does. A test that cannot fail is worse than no test, because it reports
coverage that does not exist.

Write an assertion about observable behavior: the return value, the thrown
error, the emitted event, or the state change the code produces. If the
behavior is hard to observe, restructure the code until it is observable, or
delete the test.
