---
name: write-an-agent
description: Create or revise Claude Code agent profiles (subagents) for development workflows through a deep interview — single agents or coordinated teams. Use when the user wants to create, write, design, or refine an agent, agent profile, subagent, or a team of agents for a workflow.
---

# Write an Agent

Mint agent profiles for development workflows. This skill is an interviewer first and a generator second: grill until the agent's substance is settled, then draft, validate, test-drive, and install.

## House format (non-negotiable)

Every profile is a Claude Code-native subagent: the markdown body is the agent's entire system prompt, and the agent's final message is the only thing returned to its caller.

- **Frontmatter**: `name` (kebab-case, archetype prefix: `review-*`, `research-*`, `build-*`) and `description` (third person; what it does, then "Use when ..." routing triggers — the orchestrator reads only this when deciding to delegate). Never add a `tools` field (agents inherit everything; boundaries live in prose). Omit `model` unless there is a stated reason.
- **Body sections, in this exact order** — canonical headers, persona block then operations block, so a converter can split them per-tool later:
  1. Identity line — "You are ..." plus a behavioral stance that tilts judgment calls
  2. `## Critical rules` — ✅/❌ rules including a blunt scope fence (read-only archetypes: "You do not create, modify, or delete files — you report.")
  3. `## Method` — 3–6 steps for working the task
  4. Judgment scale — `## Severity framework` (reviewer), `## Confidence framework` (researcher), or `## Done & blocked` (implementer)
  5. `## When blocked or uncertain` — escalation protocol; never fabricate to satisfy the contract
  6. `## Output contract` — exact structure of the final message
- **Length budget**: 60–120 lines. No "Learning & Memory" sections, no invented metrics, no credential backstory.

Archetype skeletons: [TEMPLATES.md](TEMPLATES.md). Interview question banks: [GRILL.md](GRILL.md).

## Process

1. **Scope it.** Single agent or team? If the user describes a workflow, use team mode: grill the workflow first (phases → roles → contracts between stages), then each agent briefly. Before minting anything, check `agents/README.md` and `~/.claude/agents/` for overlap — revise an existing agent rather than creating a near-duplicate.
2. **Grill** (the default; skip only if the user says "quick"). One question at a time, each with a recommended answer; when the codebase can answer a question, explore instead of asking. Use the banks in [GRILL.md](GRILL.md). Stop when the decision tree is resolved, then summarize the decisions before drafting.
3. **Draft** from the matching skeleton in [TEMPLATES.md](TEMPLATES.md). The grill's answers fill the stance, rules, judgment scale, escalation paths, and output contract.
4. **Validate** against the checklist below.
5. **Test-drive.** Spawn a general-purpose agent whose prompt is the draft profile body plus a small real task from the user's current context; show the result. This is a faithful simulation — profiles inherit all tools, so nothing differs from the registered agent. (The new subagent type itself registers next session.) Iterate until the output contract is honored.
6. **Install.**
   - Source of truth: write to `~/dev/skills/agents/<name>.md` and add a roster row to `agents/README.md`.
   - Cross-project agent: `mkdir -p ~/.claude/agents && ln -sf ~/dev/skills/agents/<name>.md ~/.claude/agents/<name>.md`
   - Project-specific agent: write to that project's `.claude/agents/<name>.md` instead (committed with the project, no symlink), and still add a roster row noting where it lives.

## Checklist

- [ ] `description` is third person and says when to delegate ("Use when ...")
- [ ] `name` is kebab-case with the right archetype prefix
- [ ] identity line carries a stance, not a resume
- [ ] Critical rules include the scope fence, stated bluntly
- [ ] judgment scale present and archetype-appropriate
- [ ] escalation path covers blocked, uncertain, and unverifiable cases
- [ ] output contract specifies the final message structure, element by element
- [ ] 60–120 lines, sections in canonical order, no fabricated metrics or memory claims
- [ ] no overlap with the existing roster
- [ ] test-drive output honored the contract
