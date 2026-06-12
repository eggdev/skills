# Orchestrated AI Code Review at Scale (Cloudflare pattern)

## What it is
Cloudflare's production architecture for AI code review in CI: a composable plugin system where the review entry point delegates everything to plugins (review policies, per-language checks, severity gates) that compose to define how a review runs. First month in production: 131,246 review runs across merge requests, median review completing in 3m39s.

## Evidence
- Cloudflare engineering blog: https://blog.cloudflare.com/ai-code-review/ - circulating widely in June 2026 agentic-tooling discourse (surfaced top of web results for AI code review + CI)
- Convergent trend signal: Augment Code's June roundups of agent orchestrators and observability tools all foreground "safer review" and CI-integrated agents; Composio AO ships agents that fix CI failures and manage PR lifecycle in isolated worktrees

## Why it fits the org
Directly addresses the "better automated code review" priority. The plugin-composition idea maps cleanly onto the team's existing skills repo: review policies become versioned, team-shared skills/plugins rather than per-developer prompts - which also serves the "team-wide reuse" priority.

## Adoption effort
Medium. This is a pattern, not an installable product. Concrete path: wire Claude Code's /code-review (or the code-review plugin already in the team toolchain) into a GitHub Action on PRs, with review policy expressed as composable skills (security pass, conventions pass, test-coverage pass) and a severity gate for merge blocking.

## Risks
- Review noise/false positives erode trust fast; start comment-only (non-blocking) and tighten
- Same-model-writes-and-reviews blind spots; mitigate with a second model or adversarial review skill
- CI cost per PR; cap diff size and skip docs-only changes

## Next step
Trial in repo Y (highest-traffic web product repo): add a non-blocking PR review workflow using the existing code-review plugin, policies as 2-3 composable skills; measure signal-to-noise over 2 weeks before gating.
