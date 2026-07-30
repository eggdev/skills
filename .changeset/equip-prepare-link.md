---
"@eggdev/skills": minor
---

`npm install` now puts `equip` on your PATH. A `prepare` script symlinks the bin into npm's global bin directory, so both `install.sh` and a plain install wire the command. `install.sh` no longer calls `npm link`.
