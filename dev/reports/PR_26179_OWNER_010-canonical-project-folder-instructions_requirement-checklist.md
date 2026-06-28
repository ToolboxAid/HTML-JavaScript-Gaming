# PR_26179_OWNER_010-canonical-project-folder-instructions Requirement Checklist

Updated: 2026-06-28T02:02:53Z

- [x] Continued on current branch.
- [x] Documentation/governance only.
- [x] Runtime code not modified.
- [x] Production pages not modified.
- [x] Repo folders outside ProjectInstructions not moved.
- [x] `PROJECT_INSTRUCTIONS.md` is the only manual entry point.
- [x] `PROJECT_INSTRUCTIONS.md` reduced to purpose, version/date, read order, load graph, stop gates, execution modes, and pointers.
- [x] Duplicated folder ownership detail removed from `PROJECT_INSTRUCTIONS.md`.
- [x] Folder ownership points to canonical repository structure SSoT.
- [x] Bootstrap SSoT kept at `bootstrap/codex_start_of_day_bootstrap.md`.
- [x] Unique retired startup guidance merged into bootstrap SSoT.
- [x] Retired startup doc replaced with a superseded pointer.
- [x] `PROJECT_STATE.md` made machine-friendly with required fields.
- [x] Backlog tasks kept out of `PROJECT_STATE.md`.
- [x] `README.txt` reduced to a short pointer.
- [x] Load graph added to `PROJECT_INSTRUCTIONS.md`.
- [x] When-to-load rules added.
- [x] Overloaded addendums docs reorganized into `bootstrap/` and `repository/` buckets.
- [x] No empty ProjectInstructions directories created.
- [x] `git diff --check` passed.
- [x] `npm run validate:canonical-structure` passed.
- [x] `node ./dev/scripts/run-platform-validation-suite.mjs` passed.
- [x] Duplicate bootstrap/startup guidance grep passed.
- [x] Duplicate full folder ownership table grep passed.
