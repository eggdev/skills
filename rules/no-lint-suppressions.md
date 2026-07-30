---
description: "Fix lint and type errors instead of suppressing them. Suppression comments require explicit justification."
condition: "eslint-disable|@ts-ignore|@ts-nocheck|type:\\s*ignore|#\\s*noqa|rubocop:disable|//\\s*nolint|#\\[allow\\("
scope: "tool:edit(*.ts), tool:write(*.ts), tool:edit(*.tsx), tool:write(*.tsx), tool:edit(*.js), tool:write(*.js), tool:edit(*.jsx), tool:write(*.jsx), tool:edit(*.mjs), tool:write(*.mjs), tool:edit(*.cjs), tool:write(*.cjs), tool:edit(*.py), tool:write(*.py), tool:edit(*.rb), tool:write(*.rb), tool:edit(*.go), tool:write(*.go), tool:edit(*.rs), tool:write(*.rs)"
tier: nudge
interruptMode: never
---

You added a lint or type-checker suppression. The default answer to a lint
failure is to fix the code, not silence the tool.

Before keeping this suppression:

1. Try to resolve the underlying finding. Most suppressions paper over a real
   defect or a fixable type hole.
2. If the tool is provably wrong here, keep the suppression but say so in the
   surrounding code or your summary, with the concrete reason.
3. Never suppress file-wide (`@ts-nocheck`, blanket `eslint-disable`) to fix a
   single line.
