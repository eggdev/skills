---
name: write-a-prompt
description: Create or revise reusable, parameterized prompts for looped agent sessions through a deep interview — refine a rough desire into a loop-safe prompt with {{placeholder}} fields, then save it to the central prompt library with versioning. Use when the user wants to create, write, refine, or version a reusable prompt, loop prompt, or prompt template.
---

# Write a Prompt

Mint reusable prompts for looped agent sessions. This skill is an interviewer first and a generator second: grill until the prompt's job is settled, then draft, loop-check, test-drive, and save.

## House format (non-negotiable)

Every prompt is a directory in the library: `~/dev/skills/prompts/<title>/` (central default; a project may override the destination at session start — honor that for the whole session). Contents:

- `PROMPT.md` — the current version, symlink-free copy of the highest `vN.md`
- `v1.md`, `v2.md`, … — immutable versions; a revision creates a new file, never edits an old one
- Each version file has frontmatter, then the prompt body:

```markdown
---
title: <kebab-case>
version: N
description: <what it does; "Use when ..." triggers>
fields:
  target:
    description: What to operate on (path, URL, topic)
    required: true
  focus:
    description: Dimension to emphasize
    options: [correctness, performance, clarity]
    default: correctness
---

<prompt body using {{target}}, {{focus}}>
```

- **Fields**: every `{{placeholder}}` in the body must be declared in `fields`; declared fields with `options` constrain allowed values; `default` makes a field optional.
- **Loop-safety is mandatory.** The body must contain: a concrete goal, an explicit per-iteration unit of work, a stop/exit condition ("if nothing qualifies, say so and stop" — never invent work), and idempotence guidance (re-running on an already-improved target must not thrash or undo prior iterations).
- **Length budget**: 20–80 lines of body. No persona fluff, no restating what the harness already does.

## Process

1. **Scope it.** Check `~/dev/skills/prompts/` for an existing prompt that covers the desire — revise (new version) rather than mint a near-duplicate.
2. **Grill** (the default; skip only if the user says "quick"). One question at a time, each with a recommended answer; explore the codebase instead of asking when it can answer. Use the bank in [GRILL.md](GRILL.md). Stop when goal, unit of work, exit condition, fields, and output expectations are all resolved; summarize decisions before drafting.
3. **Draft** the version file. Extract anything situational into a `{{field}}`; keep the invariant instructions in the body.
4. **Loop-check** against the checklist below — a prompt that fails loop-safety doesn't ship.
5. **Test-drive.** Spawn a general-purpose agent with the prompt body, fields filled with real values from the user's current context. Review the result together; iterate until one iteration's output matches expectations.
6. **Save.** Write `prompts/<title>/v1.md` (or next N), copy to `PROMPT.md`, and add/update a roster row in `prompts/README.md` (create it if missing: title, description, fields, current version).

## Revising an existing prompt

Read the current version and any feedback from loop runs, grill only on what's changing, write `v(N+1).md`, update `PROMPT.md` and the roster row. Note in the new version's frontmatter what changed: `changelog: <one line>`.

## Checklist

- [ ] Goal is concrete enough that two different agents would attempt the same work
- [ ] One iteration = one bounded unit of work (not "improve everything")
- [ ] Explicit exit condition; "find nothing" is a valid, stated outcome
- [ ] Idempotent: safe to re-run on an already-processed target
- [ ] Every `{{placeholder}}` declared in `fields`; every field used in the body
- [ ] Output expectations stated (what the iteration should report/produce)
- [ ] No time-sensitive or session-specific details baked into the body
- [ ] Versions are immutable; `PROMPT.md` matches the latest version
