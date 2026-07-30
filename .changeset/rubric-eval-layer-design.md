---
"@eggdev/skills": minor
---

Add the rubric evaluation layer design and its first tooling. `docs/rubric-evals.md`
holds the confirmed design: cross-vendor judge panel (Claude and Codex judge every
diff), binary criteria with severities, stop-hook bounces plus a pre-commit gate,
JSONL telemetry, and a calibration corpus of user-graded exemplar diffs at
`~/.agents/corpus/`. `rubrics/README.md` defines the rubric format and authoring
standard. New skills: `write-rubric` (author one rubric, six steps ending in a
real-diff probe) and the vendored `writing-great-skills` from mattpocock/skills.
`install.sh` now links `~/.agents/rubrics`.
