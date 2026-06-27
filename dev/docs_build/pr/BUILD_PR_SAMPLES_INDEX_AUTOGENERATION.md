# BUILD_PR_SAMPLES_INDEX_AUTOGENERATION

## Objective
Create a testable, minimal-scope BUILD PR that replaces manual `samples/index.html` maintenance with generated sample tiles derived from the normalized samples directory structure.

Canonical structure assumed:
- `samples/phaseXX/XXYY/index.html`

This BUILD must produce a testable result:
- `samples/index.html` remains usable
- generated output is visible at runtime
- sample tiles resolve correctly
- representative phases/samples can be smoke-tested

## PR Purpose
One purpose only:
- auto-generate the samples index from canonical sample folders

## In Scope
- implement a generator or build-time/update-time utility that derives sample tile/link data from `samples/phaseXX/XXYY/`
- update `samples/index.html` integration so generated data is actually used
- preserve human-readable labels in UI
- keep existing sample behavior unchanged
- include only exact target files and immediate dependencies
- provide a testable result

## Out of Scope
- no gameplay changes
- no engine-core changes
- no tool rewrites
- no broad sample content rewrites
- no repo-wide cleanup
- no APPLY instructions

## Required Behavior
Generated index behavior must:
1. discover phases from `samples/phaseXX/`
2. discover samples from `samples/phaseXX/XXYY/`
3. link each tile to `samples/phaseXX/XXYY/index.html`
4. preserve readable phase/sample text in the UI
5. fail fast on malformed sample paths or duplicate sample numbers
6. remain testable in the repo’s normal workflow

## Testability Gate
This BUILD is valid only if the result can be meaningfully validated.

Minimum validation:
- open `samples/index.html`
- verify generated tiles render
- verify representative links load:
  - first sample in a populated phase
  - last sample in a populated phase
  - Phase 13 samples including 1316–1318
- verify no stale manual-only references remain in the active generation path
- verify console is clean for tested pages

## Target Files (expected)
Codex must keep file reads narrow and stop if the actual required targets differ materially.

Expected targets:
- `samples/index.html`
- generator/helper file(s) directly used for sample index generation
- minimal supporting data/config file(s), if needed
- BUILD doc support files under `docs/` for reporting only

If the implementation would require broader repo analysis or unrelated targets, STOP and report.

## Windows Execution Constraint
Target platform is Windows.

For discovery, path normalization, and file generation:
- prefer Node.js
- Python allowed if clearly safer
- do not use PowerShell for path-building, rename-heavy work, or ZIP path generation

## Acceptance Criteria
- sample index is generated from canonical sample folders
- runtime result is testable
- `samples/index.html` stays usable and readable
- links resolve to canonical normalized sample paths
- Phase 13 samples 1316–1318 are reachable
- no gameplay behavior changes
- changed-file count stays minimal
- repo-structured delta ZIP is produced under `<project folder>/tmp/`

## Validation Checklist Summary
- generated index renders
- representative tiles open correct sample pages
- malformed paths fail fast instead of silently corrupting output
- exact ZIP exists at requested path
