# Skills

So frequently, we find ourselves just downloading and toying with some new skills to see how the behavior feels for our workflows. This repository is the new staging ground for my own approved tools.

## Notable engineers

A number of these skills come from engineers that have worked hard and promoted their work publicly. It'd be extremely disingenuous to not support them and the impact that their skills have had on my engineering.

Every skill in this repo came from one of them.

**[Matt Pocock](https://github.com/mattpocock)** — [mattpocock/skills](https://github.com/mattpocock/skills)
The deepest single influence here. Nine started as theirs:
[`codebase-design`](skills/codebase-design/), [`grill-me`](skills/grill-me/),
[`grilling`](skills/grilling/), [`handoff`](skills/handoff/),
[`improve-codebase-architecture`](skills/improve-codebase-architecture/), [`tdd`](skills/tdd/),
[`to-spec`](skills/to-spec/), [`writing-great-skills`](skills/writing-great-skills/),
[`zoom-out`](skills/zoom-out/).

**[shadcn](https://github.com/shadcn)** — [shadcn/improve](https://github.com/shadcn/improve)
[`improve`](skills/improve/) — survey a codebase as a senior advisor and hand off prioritized,
self-contained plans for other agents to execute. Read-only on source.

**[Vercel Labs](https://github.com/vercel-labs)** — [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)
[`agent-browser`](skills/agent-browser/) — the browser automation layer I reach for on every
dogfood and QA pass.

**[Matt Van Horn](https://github.com/mvanhorn)** — [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)
[`last30days`](skills/last30days/) — research what people are actually saying about a topic right
now, across Reddit, X, YouTube, HN and the rest. Nothing else here does that job.

**[Peter Yang](https://github.com/petergyang)** — [petergyang/no-ai-slop](https://github.com/petergyang/no-ai-slop)
[`no-ai-slop`](skills/no-ai-slop/) — edits drafts into sharper, more human writing without
flattening the writer's voice. MIT; the upstream `LICENSE` is retained in the skill directory.

**[Ayoub Ghriss](https://github.com/ayghri)** - [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd)
[`i-have-adhd`](skills/i-have-adhd/) - Shape output for a reader with ADHD: lead with the next action, number multi-step work, restate state across turns, suppress tangents, give specific time estimates, make wins visible.


Vendored copies drift from upstream once adapted. Check the source repo for the canonical
version and its license before redistributing any of these. [`last30days`](skills/last30days/)
ships without its upstream `assets/` directory — 14 MB of demo media that `SKILL.md` never
references.


## Rules

[`rules/`](rules/) holds universal engineering rules: one markdown file per rule, with a
regex trigger and a scope in the frontmatter and the corrective instruction in the body.
They are the minimum standard of care for any project, defined once and enforced in every
harness. [`hooks/rule-gate.mjs`](hooks/rule-gate.mjs) evaluates them as PreToolUse/PostToolUse
hooks in Claude Code and Codex CLI; omp reads the same files natively through the
`~/.agents/rules` symlink and enforces them as TTSR rules. The format and the tier model are
documented in [`rules/README.md`](rules/README.md).

[`home/AGENTS.md`](home/AGENTS.md) is the prose tier: global guidance that loads into every
session but is not mechanically enforced.

## Installing

Run [`install.sh`](install.sh) to deploy everything global: the `~/.agents/rules` symlink,
the `~/.claude/CLAUDE.md` symlink, and the rule-gate hook wiring for Claude Code and Codex.

For skills alone, clone and link the ones you want into `~/.claude/skills`:

```bash
# all of them
for d in skills/*/; do
  ln -sfn "$PWD/$d" ~/.claude/skills/"$(basename "$d")"
done

# or just one
ln -sfn "$PWD/skills/grill-me" ~/.claude/skills/grill-me
```

Symlinks mean `git pull` updates every linked skill in place.

Releases are cut as git tags by [`.github/workflows/release.yaml`](.github/workflows/release.yaml)
via changesets — the package is `private`, so nothing publishes to npm; pin to a tag if you want
a stable snapshot.

> Packaging this as a Claude Code plugin marketplace — so others can
> `/plugin marketplace add eggdev/skills` and install pieces à la carte — is the intended
> distribution path. Not done yet.
