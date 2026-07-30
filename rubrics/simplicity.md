---
description: "The diff is the smallest change that solves the task."
scope: "**/*"
criteria:
  - id: no-single-use-abstraction
    check: "The diff does not introduce an interface, base class, wrapper, or indirection layer that has exactly one implementation and one call site in the diff."
    severity: advisory
  - id: no-speculative-generality
    check: "Every parameter, option, field, and branch the diff adds is read or exercised by code in the diff."
    severity: advisory
  - id: no-dead-code
    check: "The diff does not add definitions, branches, or variables that nothing in the diff references."
    severity: blocker
  - id: no-commented-out-code
    check: "The diff does not add commented-out executable code outside documentation examples."
    severity: blocker
  - id: no-orphaned-references
    check: "The diff does not remove the last visible reference to a definition or file while leaving that definition in place."
    severity: advisory
  - id: smallest-change
    check: "Every hunk serves the stated task or repairs a defect the work uncovered."
    severity: advisory
---

Ask one question of every added line: does it do work now?

Good work adds the code the task needs and stops. Abstraction earns its slot
when the second implementation arrives. Add an option once a caller needs a
second value. A change that unplugs a definition also deletes it.

**Pass example.** A polish commit restyles a hero nameplate and deletes a CSS
rule whose last user disappeared in an earlier commit. Each added property
styles an element in the same component. Every criterion passes.

**Fail example.** A commit replaces a homepage section. It removes
`import Builds` and the `<Builds />` render site, and it wires in a new Blog
component. `Builds.astro` stays in the tree with no remaining reference.
`no-orphaned-references` fails, evidence `src/pages/index.astro:3` and
`src/pages/index.astro:22`.

Known false positives. Accept these:

- A framework extension shape with one consumer, such as an Astro layout or a
  route file. The framework names the shape and discovers the file.
- Public API of a library. Consumers live outside the repository, so a new
  export with no in-diff caller can be live code.
- The diff defines a symbol that unchanged code already references, such as a
  missing function or a required interface member.
- Drive-by repairs in touched files: lint fixes and flaky-test fixes. House
  policy asks for these, so `smallest-change` passes them.
- A definition whose only caller is a test file in the same diff. A test is a
  reference.
