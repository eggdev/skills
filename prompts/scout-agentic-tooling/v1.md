---
title: scout-agentic-tooling
version: 1
description: Daily sweep of last-30-days discourse for up-and-coming agentic dev tooling; proposes new skills, plugins, and patterns as proposal docs, deduped against a SQLite ledger. Use when scouting tooling to improve the team's ability to ship code.
fields:
  org_context:
    description: One or two sentences on the org's current priorities, stack, and pain points — used to judge fit
    required: true
  max_proposals:
    description: Maximum new proposals to write this run
    default: 3
  research_dir:
    description: Root for ledger and proposals
    default: ~/dev/skills/research/agentic-tooling
---

Sweep the last 30 days of developer discourse for up-and-coming agentic tooling —
skills, plugins, MCP servers, agent patterns, workflow techniques — and propose the
best new finds for adoption. Org context for judging fit: {{org_context}}

## Setup (idempotent)

Ensure {{research_dir}}/proposals/ exists and {{research_dir}}/ledger.db has:
`CREATE TABLE IF NOT EXISTS finds(id INTEGER PRIMARY KEY, name TEXT, url TEXT UNIQUE,
summary TEXT, found_date TEXT, status TEXT DEFAULT 'proposed');
CREATE VIRTUAL TABLE IF NOT EXISTS finds_fts USING fts5(name, summary, content=finds, content_rowid=id);`
(Keep finds_fts in sync: insert into both.)

## One iteration

1. Use the /last30days skill to research current agentic-tooling discourse. Cover at
   least: new Claude Code skills/plugins/MCP servers, agent orchestration patterns,
   AI code-review/CI tooling, and team workflow practices for shipping with agents.
2. For each candidate find, dedup against the ledger: skip if its URL matches, or if
   `SELECT * FROM finds_fts WHERE finds_fts MATCH '<name or key terms>'` returns a
   clear prior hit. Only genuinely new items survive.
3. Rank survivors by (a) evidence of real traction in the research, (b) fit to the org
   context, (c) adoption effort. Take the top {{max_proposals}} at most — quality over
   quota; propose fewer if fewer are credible.
4. For each chosen find, write {{research_dir}}/proposals/<kebab-slug>.md containing:
   what it is, evidence (sources + engagement from the research), why it fits the org,
   adoption effort, risks, and a concrete next step (e.g. "mint via /write-a-skill",
   "install plugin X", "trial in repo Y"). Then insert it into finds and finds_fts
   with today's date.
5. If nothing new and credible surfaced, say so plainly and stop — write no proposal
   docs and add nothing to the ledger. An empty run is a valid outcome.

## Report

End with: number of candidates seen, number deduped as known, proposals written
(name + path), and one line on any emerging theme worth a dedicated future sweep.
Never re-propose or edit an existing proposal doc; revisions to a proposal's status
(adopted/rejected) are made by humans in the ledger's status column.
