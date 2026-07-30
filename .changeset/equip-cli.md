---
"@eggdev/skills": minor
---

Add `bin/equip.mjs`, an interactive installer for this repository's skills,
linked onto PATH as `equip` by `install.sh`. Pick skills with a clack-prompts
multiselect, then a scope. Both scopes use the `npx skills` layout: the skill
lives in `.agents/skills` (globally a symlink to this repo, in a project a
real copy) and `.claude/skills` links through it. Rename the package to
`@eggdev/skills` so `npm link` accepts it.
