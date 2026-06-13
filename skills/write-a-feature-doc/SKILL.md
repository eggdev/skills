---
name: write-a-feature-doc
description: Write or update a feature inventory doc — explore the code first, draft the behavioral contract, interview the user only on gaps and contradictions, then validate every claim against code with fresh subagents. Use when the user wants to document a feature, build a feature inventory, capture behavior before a redesign, or says "feature doc".
---

# Write a Feature Doc

Produce one feature doc following [FEATURE-DOC-FORMAT.md](FEATURE-DOC-FORMAT.md). The doc is a **behavioral contract**: everything a redesign or rebuild must preserve. A doc that guesses behavior is worse than no doc — mark uncertainty, never invent.

Default output location: `docs/features/<slug>.md`. If the repo already has a feature-docs convention, follow it instead.

## Scope

One doc per **user-recognizable capability** — the thing a user or PM would name in a pricing table or redesign kickoff. Sub-behaviors are sections within it, not separate docs. Split a doc only when it passes ~300 lines or when two capabilities stop sharing flows.

## Process

### 1. Explore first (code answers what code can answer)

Before asking the user anything, investigate the feature end-to-end. Adapt to the stack; typical targets:

- **UI surfaces**: routes, screens, and components that present the feature (note web vs native/desktop divergence if the repo is multi-platform)
- **State & logic**: stores, hooks, services that drive it
- **Data**: tables, migrations, schema, and any access-control rules (e.g. RLS)
- **Gating/permissions**: tier checks, auth guards, feature flags, paywalls
- **Tests**: behavior gold — assertions encode the intended contract
- **Existing docs**: design docs, ADRs, tickets, glossary

Spawning a read-only exploration subagent for this sweep keeps the main thread clean; have it return file paths and inferred rules, flagging anything ambiguous.

### 2. Draft with uncertainty marked

Draft the full doc per the format. Every behavior you could not verify from code or tests gets a `❓` marker inline. Contradictions between code and existing docs get a `⚠️` marker.

### 3. Interview only the gaps

Walk the user through `❓` and `⚠️` items **one at a time**, each with your best-guess answer attached. Also probe:

- Edge cases the code is silent on: offline, unauthenticated, at-limit, concurrent edits, error/rollback
- "Is this behavior intentional or a bug?" — if the user doesn't know, it goes in **Open questions**, not Behavior
- Platform divergences — an empty "Platform differences" section is a *claim of parity*; confirm it
- Current vs intended — when the user states a target behavior the code doesn't yet match, record current behavior in Behavior and the desired change in Open questions

### 4. Maintain the language (glossary)

If the repo has a glossary (e.g. `CONTEXT.md`), challenge any term the user uses that conflicts with it, and add/sharpen terms inline as the interview resolves them. A glossary is definitions only — no implementation detail. If there's no glossary, skip this.

### 5. Offer ADRs sparingly

If the interview surfaces a decision that is (1) hard to reverse, (2) surprising without context, and (3) a real trade-off, offer to record it as an ADR (e.g. `docs/adr/NNNN-slug.md`) and link it from the doc's `adrs:` frontmatter. Shared architecture (used by several features) gets ONE ADR linked from each. The feature doc holds *what the feature does*; the ADR holds *why a decision was made* — never duplicate.

### 6. Validate against code (required — fresh eyes)

Before finishing, spawn **fresh subagents** (that did not write the draft) to verify the doc against actual code. Split the doc into 2–3 slices (e.g. behavior + data; gating + platform) and give each subagent the doc plus its slice. Instruct each to mark every factual claim CONFIRMED / WRONG (with correction) / UNVERIFIABLE with `file:line` evidence, and to flag any behavior the doc MISSED.

This pass is not optional: a single-pass draft states plausible-but-wrong claims confidently (e.g. asserting a field is mutable when the API rejects it). Apply every correction; move anything the subagents flag as uncertain into **Open questions**.

### 7. Finish

- Add/update the index entry if the feature-docs directory has an index
- Remove the feature from any candidate/backlog list
- Confirm every `❓`/`⚠️` is either resolved or moved to **Open questions**

## Updating an existing doc

Same process, scoped to what changed: re-explore the touched code, diff against the doc, interview on contradictions only, re-run the validation pass over the changed sections. Never silently rewrite behavior the user hasn't confirmed.
