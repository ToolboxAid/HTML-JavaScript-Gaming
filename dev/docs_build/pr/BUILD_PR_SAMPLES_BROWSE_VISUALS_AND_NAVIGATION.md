# BUILD_PR_SAMPLES_BROWSE_VISUALS_AND_NAVIGATION

## Objective
Implement the first bundled samples finalization wave by improving browse-time visuals and movement without changing canonical sample ownership or runtime sample behavior.

This BUILD covers:
- preview assets and thumbnails
- hover preview
- navigation polish

Canonical path contract remains:
- `samples/phaseXX/XXYY/index.html`

## PR Purpose
One purpose only:
- improve sample browsing presentation and navigation

## In Scope
- add thumbnail / preview asset support for sample tiles and sample detail presentation
- render clean fallback behavior when preview assets are missing
- add or polish hover preview behavior where it improves browse-time clarity
- polish sample navigation surfaces such as:
  - next / previous movement
  - related navigation presentation
  - browse-time movement consistency between index and detail contexts
- preserve metadata-driven readable UI behavior
- preserve canonical sample paths

## Out of Scope
- no gameplay changes
- no engine-core changes
- no path normalization changes
- no metadata schema redesign
- no metadata validation hardening beyond exact immediate needs for this wave
- no favorites / pinning
- no performance-only tuning unless required to keep this wave functional

## Required Behavior
1. Index tiles can display preview thumbnails when available.
2. Missing thumbnails must fall back cleanly with no broken UI.
3. Hover preview behavior must be lightweight and dependency-free.
4. Detail-page navigation must remain correct and readable.
5. Related and adjacent navigation must still resolve to canonical paths.
6. Representative Phase 13 samples including 1316–1318 must continue to load correctly.

## Expected Targets
Codex should keep reads narrow and stop if the actual required target list expands materially.

Expected implementation targets:
- `samples/index.html`
- minimal JS/CSS directly supporting index browse visuals and hover behavior
- minimal sample detail page rendering files directly needed for navigation polish
- metadata-driven files directly needed for preview or navigation rendering
- report files under `docs/` only for output packaging

## Windows / Execution Constraints
- target platform: Windows
- prefer Node.js or vanilla JS where scripting support is needed
- no `npm install`
- no `node_modules`
- no PowerShell path interpolation
- ZIP output under `<project folder>/tmp/` is mandatory

## Validation Requirements
Minimum required validation:
- load `samples/index.html`
- verify thumbnails render when assets exist
- verify fallback renders cleanly when assets do not exist
- verify hover preview behavior does not break layout
- open representative sample pages and verify:
  - header still renders
  - next / previous navigation works
  - related links resolve
- verify Phase 13 samples 1316, 1317, 1318 still load
- verify console stays clean for tested pages

## Acceptance Criteria
- browse visuals improve without changing canonical paths
- missing preview assets do not break index or detail pages
- navigation polish works and remains testable
- no gameplay changes
- no engine-core changes
- changed-file count stays minimal
- repo-structured delta ZIP is produced under `<project folder>/tmp/`

## Fail Fast
Stop and report if:
- preview support would require broad asset reorganization
- thumbnail conventions are ambiguous across many samples
- navigation changes would require unrelated page rewrites
- implementation expands beyond browse visuals and navigation
- the ZIP cannot be produced at the exact requested path
