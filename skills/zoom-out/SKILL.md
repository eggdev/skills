---
name: zoom-out
description: Steps the agent up one level of abstraction to recover the bigger picture — either by mapping the relevant modules and callers in the project's domain vocabulary, or by questioning whether the current approach or abstraction is wrong. Use when the user says "zoom out"; when you're unfamiliar with an area of code and need to see how it fits the larger system; when you're stuck, overcomplicating, or the abstraction feels wrong; or as a deliberate step-back when a red behavioral test won't go green after several distinct root-cause hypotheses.
---

# Zoom out

Go up a layer of abstraction. You're too close to the code — stop working at the current level and reorient against the bigger picture. There are two senses; pick the one the situation calls for, or do both.

## Navigation zoom-out — "I don't know this area"

Use when you're unfamiliar with a section of code and need to understand how it fits into the whole.

The move:

1. **Go up one level.** Stop reading the line in front of you; find the module, package, or subsystem it lives in.
2. **Map the neighborhood.** List the relevant modules and their callers — what calls into this code, and what it calls out to. A dependency sketch beats a wall of source.
3. **Speak the domain.** Name things using the project's domain glossary / ubiquitous-language vocabulary, not raw file or function names. The map should read in the domain's terms.

Output a short map (modules + callers + how they connect), then return to the task with that context.

## Design zoom-out — "I'm stuck or overcomplicating"

Use when you're spinning: a red behavioral test won't go green after ~3 distinct root-cause hypotheses, the solution keeps growing in complexity, or the abstraction just feels wrong. Before escalating to a human, step up a level and challenge the approach itself.

Ask, in order:

1. **Is the abstraction wrong?** Are you forcing the problem through a shape that doesn't fit it? The repeated failures may be the design pushing back, not a bug.
2. **Are we overcomplicating?** Is there a simpler framing that dissolves the hard part instead of solving it?
3. **Should we reset and rebuild simple?** Sometimes the fastest path is to throw away the tangled attempt and rebuild the smallest thing that satisfies the test. Reaching for the same level of abstraction that created the mess rarely escapes it.

If stepping up surfaces a wrong approach, say so plainly and propose the simpler one. If it doesn't, you've earned the right to escalate — report what you tried and why you're stuck.
