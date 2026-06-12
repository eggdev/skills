# Zero-Token Deterministic Tools (workflow technique)

## What it is
A workflow discipline gaining strong traction: use Claude Code to BUILD small deterministic CLI tools/scripts once, then have agents (and humans) RUN them at zero token cost - instead of having the model re-do parsing, sorting, validation, and coordination on every session. In the Dynamic Workflows framing: "code does the deterministic work; agents do the judgment; the glue between them is free."

## Evidence
- r/ClaudeAI: "After 10 years as an engineer, the thing I'd teach new vibe coders first: build tools with Claude Code that cost zero tokens to run" - 560 pts / 78 comments (2026-06-11), https://www.reddit.com/r/ClaudeAI/comments/1u3euwc/
- alexop.dev "Claude Code Workflows: Deterministic Multi-Agent Orchestration" and Geeky Gadgets "Reduce Token Tax and Automate Tasks" - same fan-out -> reduce -> synthesize pattern, coordination in plain code
- Anthropic best-practices docs now echo it: bundled scripts for deterministic jobs ("cheaper, repeatable, no hallucination risk")

## Why it fits the org
Highest leverage-per-effort find of the sweep. Cuts token spend and flakiness in agent loops (faster shipping), and the resulting tools/scripts are naturally team-shared artifacts that live in the skills repo (team-wide reuse). Works for both TypeScript and Python stacks.

## Adoption effort
Low. No installation - it is a convention. Codify it so agents follow it by default.

## Risks
- Tool sprawl/duplication without an index; keep tools in one scripts/ dir per repo with a manifest
- Stale tools drifting from reality; treat them like code (tests, review)

## Next step
Mint via /write-a-skill: a "build-a-tool-first" skill that instructs agents to extract any repeated deterministic step (parsing, validation, batch edits) into a bundled script and register it, instead of re-deriving it with tokens each session.
