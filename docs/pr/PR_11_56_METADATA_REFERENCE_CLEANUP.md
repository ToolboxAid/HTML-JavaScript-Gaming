# PR 11.56 — Controlled JSON Cleanup With Metadata Reference Removal

## Purpose
Fix the cleanup loop so audit-counted unused JSON files are actually removed from the missing-reference/NO count.

## Problem
Some unused JSON files are reported as blocked because the broad repo check finds references only in metadata/index JSON files, for example:

- `samples/metadata/samples.index.metadata.json`

A metadata/index reference to an otherwise unused sample JSON is not a keep reason. If the file is not directly used by JS/tool runtime and the only remaining references are generated/index metadata, remove both:

1. the unused JSON file
2. the stale metadata/index reference to that file

## Scope
- Continue controlled cleanup mode.
- Select exactly 8 audit `NO` JSON files if available.
- For each candidate, classify references into runtime references vs metadata/index references.
- Delete files only when there are no runtime references.
- Remove stale metadata/index entries that reference deleted JSON files.
- Do not modify sample 1902.
- Do not modify `palette.json`.
- Do not modify `tile-map-editor-document.json`.
- Do not rewrite roadmap content.
- Roadmap status changes only if execution-backed and status-only.

## Required Reference Classification
For each audit `NO` candidate:

### Runtime keep references
Keep the file if referenced by:
- `.js`
- `.html`
- source/tool runtime loader code
- manifest fields that are actively consumed by the sample/tool runtime

### Non-blocking stale metadata references
These are not keep reasons by themselves:
- `samples/metadata/samples.index.metadata.json`
- generated/index/cache JSON files
- documentation references
- prior reports
- tmp output

If these are the only references, delete the unused JSON and remove the stale metadata/index references.

## Required Build Steps
1. Run:
   ```powershell
   .\scripts\PS\audit-sample-json-js-references.ps1
   ```
2. Save before counts in `docs/dev/reports/pr_11_56_before_audit.txt`.
3. Select up to exactly 8 audit `NO` JSON files that are safe after reference classification.
4. For each selected file:
   - run a direct JS check
   - run a runtime reference check
   - run a broad repo check
   - document why metadata/index references are stale/non-blocking when applicable
5. Delete selected unused JSON files.
6. Remove stale entries from `samples/metadata/samples.index.metadata.json` for deleted files.
7. Run targeted validation.
8. Re-run audit and save after counts in `docs/dev/reports/pr_11_56_after_audit.txt`.
9. Confirm `NO count` decreases by the number of deleted audit-counted JSON files.
10. If the NO/missing-reference count does not decrease, stop and report failure instead of claiming success.

## Acceptance
- Deleted JSON files were audit `NO` items before the PR.
- Deleted files had no runtime references.
- Metadata/index-only references were removed with the file.
- Audit NO/missing-reference count decreases.
- Targeted validation documented.
- Full sample suite skipped unless shared loader/framework files changed.
