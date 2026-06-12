# Scout Context — skills-repo

## Project shape
- Meta-library, not an app: no build, CI, tests, or runtime code. Pure markdown tooling.
- Layout: `skills/` (write-a-skill, write-a-prompt, write-an-agent, grill-me),
  `prompts/` (loop prompts with versioned v1.md + PROMPT.md; README table is the index),
  `agents/` (roster README, empty so far), `research/agentic-tooling/` (ledger.db + proposals/).
- Minting conventions: new skills via `skills/write-a-skill`, prompts via `write-a-prompt`
  (immutable versions), agents via `write-an-agent`. New artifacts must be added to the
  relevant README index table.
- This repo's role for org-wide patterns: host the reusable/versioned artifact (skill,
  policy, prompt); CI/infra wiring belongs to consumer repos.

## Past assessments worth remembering
- 2026-06-12, proposal 1 (Dynamic Workflows) → watch: platform feature, nothing to wire in
  here; revisit when consumer projects prove patterns worth encoding as a skill/prompt.
- 2026-06-12, proposal 2 (Cloudflare orchestrated review) → trial: only the
  policies-as-composable-skills half fits — mint review-policy skills here, leave CI
  wiring to consumer repos.
- 2026-06-12, proposal 3 (zero-token deterministic tools) → adopt: mint
  `build-a-tool-first` skill; dogfood on the scout/assess loops (their ledger SQL
  boilerplate is itself a candidate for a shared script).

## Calibration notes
- Effort here is almost always `hours`: artifacts are markdown skills/prompts, no
  integration testing. Reserve `days` for proposals requiring multiple coordinated
  skills + dogfooding.
- Useful split for vague proposals: "reusable artifact" portion (assess for this repo)
  vs "infrastructure/wiring" portion (belongs to consumer projects — note it in
  integration_path but don't count its effort here).
- Platform features with no encodable artifact default to `watch`, not `skip` — they
  often later yield a skill/prompt once usage patterns stabilize.
