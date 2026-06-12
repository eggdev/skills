---
name: build-a-tool-first
description: Extract repeated deterministic work (parsing, validation, SQL, schema setup, batch edits) into small CLI scripts that run at zero token cost, instead of re-deriving it with the model each session. Use when writing or revising skills, prompts, or agent loops that contain repeated deterministic steps, or when the same boilerplate (queries, setup, transforms) appears across multiple artifacts.
---

# Build a Tool First

Code does deterministic work; agents do judgment. When a skill, prompt, or loop makes the
model re-derive the same deterministic steps every session — SQL boilerplate, schema setup,
parsing, validation, batch edits — extract those steps into a script and have the artifact
call it. Tokens are spent on decisions, not plumbing.

## Recognize the smell

Extract to a script when a step is:
- **Deterministic** — same inputs always produce the same output; no judgment involved
- **Repeated** — appears in more than one artifact, or runs every iteration of a loop
- **Error-prone in prose** — multi-line SQL, exact schemas, fiddly text transforms that the
  model can mistype

Do NOT extract judgment calls (ranking, assessment, writing) — those stay with the agent.

## How to extract

1. Write a small CLI script under the consuming artifact family's `scripts/` directory —
   one `scripts/` dir per skill or prompt family, no sprawl. Shell or Python, whichever
   the operation wants.
2. Treat it like production code: deterministic, idempotent (safe to run twice), exits
   non-zero on failure with a clear message, validates its inputs.
3. Register it in `scripts/MANIFEST.md` (name, purpose, one usage line) so future sessions
   discover it instead of re-deriving the logic.
4. Update the consuming artifacts to invoke the script. Keep a one-line comment noting what
   the script replaces, so the artifact still reads standalone.
5. Follow the family's versioning rules when editing artifacts (e.g., prompt-library
   versions are immutable — write the next vN.md).

## Checklist

- [ ] The extracted step is deterministic — no judgment moved into code
- [ ] Script is idempotent and exits non-zero on failure
- [ ] Registered in `scripts/MANIFEST.md` with a usage line
- [ ] Consuming artifacts call the script; no duplicated inline logic remains
- [ ] `bash -n` / syntax check passes; script verified against real data once
