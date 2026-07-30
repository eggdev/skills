---
description: "Use an Effect only to synchronize with a system outside React. Derive data in render. Put user actions in event handlers."
condition: "useEffect\\("
scope: "tool:edit(*.ts), tool:write(*.ts), tool:edit(*.tsx), tool:write(*.tsx)"
tier: nudge
interruptMode: never
---

You added or changed an Effect. Apply this test before you keep it.

Name the external system this Effect synchronizes with. Examples: network,
browser API, timer, subscription, imperative non-React widget. If there is
no external system, remove the Effect:

- Derive renderable data during render. Do not mirror props or state into
  more state.
- Use `useMemo` only for expensive pure calculations.
- Put work caused by a user action in that event handler.
- Reset subtree state with a `key`, not with an Effect.
- Subscribe to external stores with `useSyncExternalStore`.

If the Effect is valid, keep it small. Give it one synchronization target.
Include every reactive dependency. Do not suppress `exhaustive-deps`. Add
cleanup, and protect fetches from stale responses.

Full guidance: https://react.dev/learn/you-might-not-need-an-effect
