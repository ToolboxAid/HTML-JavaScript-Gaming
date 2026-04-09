# BUILD PR — Samples Phase Grouping (Index Only, FIXED)

## Purpose
Continue samples phase normalization without creating or moving directories.
This PR is limited to organizing the existing samples index presentation only.

## Exact Target Files
- `samples/index.html`

## Required Code Changes
- update `samples/index.html` to group existing sample links into phase sections using the current existing paths only
- preserve all currently resolving links
- do not introduce references to non-existent `samples/phase-*` directories
- do not rename or move any sample files or folders

## Hard Constraints
- exact file only
- do not create directories
- do not create new files
- do not move or rename sample files
- do not change sample content
- do not add links that do not already resolve
- no scope expansion beyond index presentation/grouping

## Validation Steps
- confirm only `samples/index.html` changed
- confirm all sample links in the updated index still resolve
- confirm no `samples/phase-*` directory references were introduced unless they already exist
- confirm no file creation or file moves occurred

## Acceptance Criteria
- `samples/index.html` presents existing samples in clearer phase-grouped sections
- all links continue to resolve
- no non-existent phase directories are referenced
- no file-system changes were made
