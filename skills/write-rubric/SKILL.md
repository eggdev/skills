---
name: write-rubric
description: Author one rubric file for the judge panel in the rubric evaluation layer.
disable-model-invocation: true
---

Author one rubric: a single quality dimension, encoded as binary criteria the
judge panel scores diffs against.

## Steps

1. **Read the standard.** Read `~/.agents/rubrics/README.md` (in the skills
   repository: `rubrics/README.md`). It holds the format table and the
   authoring standard. Done when the file is read.

2. **Gate the tier.** State the dimension in one line. A finding lives in the
   cheapest tier that can hold it, so confirm this one needs judgment: a regex
   over added text is too weak to decide it, and it demands a verdict on a
   diff rather than taste. A regex-decidable finding becomes a rule in
   `rules/`; a taste finding goes to `home/AGENTS.md`. Check every file in
   `rubrics/` for overlap. Done when the dimension is one line, tier-checked,
   and absent from every existing rubric.

3. **Draft the criteria.** Write 3 to 6 criteria in the frontmatter, each
   `{id, check, severity}`. Each check is one sentence a judge answers pass or
   fail from the diff alone (decidable), and each failure can cite `file:line`
   (evidence). Reserve `blocker` for checks with near-zero false positives;
   default to `advisory`. Done when every criterion passes both tests,
   decidable and evidence-citable.

4. **Write the body.** Judge guidance: what good looks like for this
   dimension, one pass example, one fail example, and the known false
   positives. Done when the body names at least two false positives a judge
   must accept.

5. **Probe with real diffs.** Take two diffs: one you expect to pass this
   rubric and one you expect to fail it. Draw them from the corpus
   (`~/.agents/corpus/`) when it holds exemplars tagged for this dimension;
   fall back to commits from a real repository's history. Judge each diff
   yourself, criterion by criterion. A corpus exemplar carries the user's
   verdict, and the criteria must agree with it. Done when every criterion
   returns a clean verdict on both diffs, with `file:line` evidence on each
   failure. A criterion that wobbles (the diff alone is too little context, or
   pass and fail both feel defensible) goes back to step 3.

6. **Ship it.** Save the file as `rubrics/<dimension>.md`. Done when the
   frontmatter matches the format table and the file sits in `rubrics/`. The
   ids are now stable keys; a shipped id keeps its name forever.
