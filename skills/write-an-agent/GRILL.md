# Grill Question Banks

Conduct: one question at a time, each with your recommended answer; if the codebase or roster can answer a question, explore instead of asking; stop when the tree is resolved, then summarize all decisions before drafting. If the user says "quick", skip to drafting with house defaults and mark assumptions in the draft for review.

## Universal (every agent, in this order)

1. **Job** — In one sentence, what does this agent do that the main loop shouldn't just do inline? If there's no good answer, recommend against creating it.
2. **Trigger** — When should work be routed here? (Becomes the `description`'s "Use when ...".)
3. **Input** — What does it receive: a diff, a question, a spec, file paths? What context can it assume?
4. **Output** — What does the caller need back, element by element? (Becomes the output contract.)
5. **Fence** — What must this agent never do, even when it would seem helpful in the moment?
6. **Overlap** — Answer by exploring: does `agents/README.md` or `~/.claude/agents/` already cover this? If close, propose revising that agent instead.

## Reviewers

- Which failure modes matter most, ranked — and what should it deliberately ignore?
- What earns a 🔴 blocker here? What's merely 🟡? (Severity philosophy.)
- Precision vs recall: tolerate false positives to catch more, or report only near-certain findings?
- Stance: skeptic, mentor, or pedant — which way should borderline calls tilt?
- What must it read before judging (specs, callers, tests, prior reviews)?
- Should it run anything (tests, build, linters) as evidence, or judge from source alone?

## Researchers

- Depth or breadth: exhaustive map, or fast answer with confidence levels?
- Sources in scope: code only? Plus git history? Plus web/docs?
- What does "done" look like — an answer, a map, or options with a recommendation?
- How fresh must sources be, and does recency outrank authority?
- What's worth reporting about dead ends and gaps?

## Implementers

- Scope discipline: what counts as scope creep vs necessary collateral change?
- Verification bar: exactly which commands must pass before claiming done?
- Idiom: which existing files exemplify the style to match?
- Failure policy: on a failing test, fix-and-retry how many times before stopping to report?
- Should it write tests for its changes, or only keep existing ones green?

## Team mode (grill the workflow before any agent)

1. Walk the workflow end to end: phases, what artifact flows between them, where quality gates sit.
2. Decompose into roles. Challenge each one: could the main loop, a Workflow script stage, or an existing agent do this instead?
3. Contract compatibility: stage N's output contract must be sufficient input for stage N+1 — check each seam explicitly.
4. Shared vocabulary: one severity/confidence scale across the whole set.
5. Naming: common domain token across the set (e.g. `review-relsafety`, `research-relsafety`, `build-relsafety`).
6. Then run a shortened universal bank per agent (job, fence, output) — the workflow grill already answered the rest.

## Revising an existing agent

Re-grill only the branch that's failing: wrong things flagged → severity framework and noise exclusions; output unusable → output contract; agent overstepped → critical rules and fence; missed things → method and recall calibration. Diff the revision against real past output when available.
