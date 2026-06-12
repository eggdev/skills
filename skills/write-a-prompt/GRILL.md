# Grill question bank

Ask one at a time, always with a recommended answer. Explore the codebase/library instead of asking when possible. Stop when the decision tree is resolved.

## Goal & scope

- What does "done" look like for a single iteration? What artifact or change proves it ran?
- Is this prompt improving something, researching something, or monitoring something? (Each has a different exit shape.)
- What's explicitly out of scope — what should the agent refuse to touch even if it looks adjacent?

## Unit of work

- Per iteration: one item, a batch of N, or "until a budget is spent"?
- How does an iteration pick its target — given via field, discovered by search, or taken from a queue/list file?
- What stops two parallel sessions from grabbing the same work?

## Exit & loop-safety

- When should the loop stop entirely (target count, dry rounds, a condition in the repo)?
- What should the agent do when it finds nothing to do? (Recommended: state that plainly and stop — never invent work.)
- If the loop re-runs on something already processed, how does the agent detect that and skip?
- What's the failure behavior — retry, skip and log, or halt the loop?

## Fields

- Which parts of your description vary per run? Those become `{{fields}}`.
- For each field: free text or a closed `options` list? Sensible `default`?
- Could one field swap the prompt's whole "mode" (e.g. `{{mode}}: audit|fix`)? If so, is that one prompt or two?

## Output & feedback

- What should each iteration report (commit, file, summary line, structured list)?
- Where do results accumulate so later iterations and other sessions can see them?
- How will you judge whether the prompt is working, and what signal should trigger a new version?

## Quality bar

- What does a bad-but-plausible result look like? Add a guard against it in the body.
- Should the agent verify its own work before finishing an iteration? How?
