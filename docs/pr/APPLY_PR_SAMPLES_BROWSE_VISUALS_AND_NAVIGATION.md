# APPLY_PR_SAMPLES_BROWSE_VISUALS_AND_NAVIGATION

## Objective
Apply the completed BUILD wave for samples browse visuals and navigation.

This APPLY covers the already-built scope:
- preview assets and thumbnails
- hover preview
- navigation polish

Canonical path contract remains:
- `samples/phaseXX/XXYY/index.html`

## Apply Scope
- apply the BUILD output exactly
- preserve canonical sample paths
- preserve metadata-driven readable UI
- preserve sample runtime behavior
- preserve Windows-safe zero-dependency execution standards

## Do Not
- do not broaden scope
- do not add unrelated cleanup
- do not modify gameplay
- do not modify engine core
- do not redesign metadata schema
- do not add new PR purpose beyond applying this BUILD

## Required Apply Checks
1. Confirm the BUILD ZIP contents are scoped only to browse visuals and navigation.
2. Apply the BUILD delta cleanly.
3. Validate representative runtime behavior:
   - thumbnails render when available
   - fallback renders cleanly when previews are absent
   - hover preview does not break layout
   - next / previous / related navigation remains correct
   - Phase 13 samples 1316, 1317, 1318 still load
4. Report exact files changed.
5. Produce APPLY ZIP output.

## Acceptance Criteria
- BUILD delta applied cleanly
- no canonical path changes
- no gameplay changes
- no engine-core changes
- browse visuals/navigation behavior works as validated
- repo-structured delta ZIP is produced under `<project folder>/tmp/`

## Fail Fast
Stop and report if:
- BUILD contents exceed the approved scope
- apply would require unrelated conflict resolution
- canonical paths would change
- the ZIP cannot be produced at the exact requested path
