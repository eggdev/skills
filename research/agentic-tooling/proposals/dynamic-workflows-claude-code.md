# Dynamic Workflows in Claude Code

## What it is
Anthropic's runtime agent-orchestration feature (launched 2026-05-28, GA with Opus 4.8): Claude writes task-specific orchestration scripts at runtime that fan out tens to hundreds of parallel subagents in one session, validates results, and returns a synthesized answer. Available in CLI, Desktop, VS Code extension for Pro/Max/Team/Enterprise, plus the API/Bedrock/Vertex.

## Evidence
- Official launch post: https://claude.com/blog/introducing-dynamic-workflows-in-claude-code - 200 pts / 135 comments on Hacker News (2026-05-28)
- InfoQ coverage: "Claude Code Adds Dynamic Workflows for Parallel Agent Coordination"
- Heavy secondary press (testingcatalog, gHacks, Medium case study claiming a 750K-line rewrite in 6 days)
- Anthropic-internal use cases cited: codebase-wide bug hunts, profiler-guided optimization audits, large migrations/framework swaps

## Why it fits the org
Directly targets the "faster shipping via agent loops" priority: migrations, repo-wide audits, and multi-file refactors are exactly the tasks a small web-product team batches up. Already inside Claude Code, which the team standardizes on - no new vendor.

## Adoption effort
Low. Already available on Team plans; first workflow run prompts for confirmation. Main cost: usage is meaningfully higher than a normal session, so budget for it and start with one bounded task.

## Risks
- Token/usage burn on large fan-outs; needs a usage cap policy
- Research-preview-grade behavior on very large swarms; verify outputs (pair with code review gate)

## Next step
Trial in one repo: pick a pending cross-cutting chore (e.g. dependency or API deprecation sweep) and run it as a dynamic workflow; compare wall-clock and review burden vs. manual agent loops. Document the verdict in this folder.
