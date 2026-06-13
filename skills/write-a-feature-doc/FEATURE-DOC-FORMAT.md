# Feature Doc Format

One doc per user-recognizable capability (see Scope in SKILL.md). Default location `docs/features/<slug>.md`; follow the repo's existing convention if it has one.

## Template

```md
---
feature: watchlists
status: live          # live | beta | deprecated | planned
platforms: [web, native]
tiers: { free: none, basic: full, premium: full }   # omit if no tiering
adrs: []              # slugs of related ADRs, if any
---

# Watchlists

{2-3 sentence summary: what it is, who it's for, why it exists.}

## Behavior

{The contract. Prose-first, with bulleted "when X → Y" rules where
precision matters. Every behavior a redesign must preserve, including
edge cases: offline, unauthenticated, at-limit, errors, rollback.}

## Platform differences

{Only divergences. An empty section is an explicit claim of parity.
Omit entirely for single-platform projects.}

## Gating

{What each tier/role sees and can do; the upgrade or permission path.
Omit if the feature has no gating.}

## Code map

{Pointers only — packages, routes, tables, key hooks. No explanations;
explanation belongs in code or ADRs.}

## Open questions

{Known gaps, suspected bugs, current-vs-intended deltas, and behaviors
nobody is sure are intentional.}
```

## Rules

- **Frontmatter is machine-scannable.** Keep keys stable so tooling can answer "what features touch native?" or "what's gated at basic?" without reading bodies. Drop keys that don't apply (`tiers`, `platforms`) rather than faking them.
- **Behavior is prose-first.** Use strict scenario rigor only for complex flows; don't bureaucratize simple features.
- **No why, no glossary.** Decision rationale → ADRs. Term definitions → the glossary. The feature doc links, never duplicates.
- **No visuals/design intent.** Design files and design docs own that — screenshots go stale.
- **Analytics events** only when the feature has bespoke funnels worth preserving.
- **Honest uncertainty.** Unconfirmed behavior lives in Open questions, never stated as fact in Behavior. Record current behavior even when the user wants it changed; put the desired change in Open questions.

## Index maintenance

If the feature-docs directory has an index (e.g. `README.md`), add a line after writing a doc:

```md
- [Watchlists](watchlists.md) — named, curated venue collections
```
