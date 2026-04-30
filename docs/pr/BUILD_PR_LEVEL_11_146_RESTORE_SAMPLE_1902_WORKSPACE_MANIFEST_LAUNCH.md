# BUILD_PR_LEVEL_11_146_RESTORE_SAMPLE_1902_WORKSPACE_MANIFEST_LAUNCH

## Purpose
Restore Sample 1902 so it launches Workspace Manager using the existing workspace manifest file.

## Context
Sample 1902 currently has the launch removed from the detail page text:

- `index.html` says:
  `Direct Workspace Manager roundtrip link removed pending schema-aligned workspace preset migration.`

- `main.js` says:
  `Workspace launch relationship intentionally removed until the sample preset is migrated...`

But the manifest file exists:

- `sample.1902.workspace-all-tools.json`

Sample 1902 should launch Workspace Manager with that manifest file.

## STRICT SCOPE

### ALLOWED FILES

- samples/phase-19/1902/index.html
- samples/phase-19/1902/main.js
- samples/metadata/samples.index.metadata.json
- docs/dev/reports/sample_1902_workspace_manifest_launch_11_146.txt

### ALLOWED CHANGES

- restore the Sample 1902 Workspace Manager launch link
- wire Sample 1902 to pass `/samples/phase-19/1902/sample.1902.workspace-all-tools.json`
- update sample metadata only if needed so the samples hub shows the correct Workspace Manager link
- create the report

## Forbidden

Codex MUST NOT:

- modify schemas
- modify tool runtime
- modify routing files
- modify other samples
- add fallback/default/preset data
- transform the manifest
- wrap the manifest
- inline tool payload details elsewhere

## Required Behavior

Sample 1902 launch must:

1. Point to Workspace Manager.
2. Pass the manifest file path:
   `/samples/phase-19/1902/sample.1902.workspace-all-tools.json`
3. Let Workspace Manager validate/load the manifest.
4. Not convert or transform the manifest.
5. Not pass individual child tool payloads directly from the sample page.

## Required Fix

In `samples/phase-19/1902/index.html`:
- replace the removed/pending launch message with a real Workspace Manager launch link.

In `samples/phase-19/1902/main.js`:
- remove the stale "relationship intentionally removed" state/comment if it blocks launch.
- add only the minimal code needed if the sample detail page requires JS to build the launch URL.

In `samples/metadata/samples.index.metadata.json`:
- if Sample 1902 lacks the Workspace Manager tool relationship, add the correct relationship.
- only update Sample 1902 metadata.
- do not change unrelated samples.

## Validation

Run targeted validation only.

Required checks:
- `samples/phase-19/1902/index.html` contains a Workspace Manager launch link.
- the launch link includes the manifest path.
- `samples/phase-19/1902/sample.1902.workspace-all-tools.json` remains unchanged unless explicitly necessary.
- changed JSON parses.
- no schema files changed.
- `git diff --name-only` contains only ALLOWED FILES.

## Report

Write:

- `docs/dev/reports/sample_1902_workspace_manifest_launch_11_146.txt`

Report must include:
- files changed
- exact launch URL/path restored
- whether metadata changed
- validation command/result
- confirmation strict scope respected

## Full Samples Smoke Test

Skipped.

Reason:
- targeted Sample 1902 launch restoration only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- Sample 1902 launches Workspace Manager with its manifest file.
- No schemas changed.
- No runtime/routing changes.
- No unrelated files changed.
