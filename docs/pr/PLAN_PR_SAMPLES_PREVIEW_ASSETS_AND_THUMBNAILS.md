# PLAN_PR_SAMPLES_PREVIEW_ASSETS_AND_THUMBNAILS

## Objective
Define a narrow, testable plan for preview assets and thumbnail support for samples so launcher/detail UI can show consistent visual previews without changing gameplay behavior.

## Scope
Docs-only planning.
No implementation code changes.
No gameplay changes.
No engine-core changes.
No canonical path normalization.
No start_of_day directory changes.

## Working Targets
- Preview image ownership for canonical samples: `samples/phaseXX/XXYY/`
- Metadata mapping for preview and thumbnail references
- Consumption expectations for:
  - `samples/index.html` tiles
  - sample detail enhancement surface

## Proposed Asset Contract
1. Canonical sample path remains source of truth for runnable sample pages:
- `samples/phaseXX/XXYY/index.html`

2. Preview asset location per sample (planned):
- `samples/phaseXX/XXYY/preview/`
- expected files:
  - `thumb.png` (tile-sized image)
  - `preview.png` (detail-sized image)

3. Metadata fields (planned extension of existing metadata layer):
- `thumbnail` (string, optional): canonical relative path to thumbnail image
- `preview` (string, optional): canonical relative path to preview image

4. Fallback behavior:
- if thumbnail/preview missing, UI renders deterministic placeholder and remains fully functional

## Source-of-Truth Boundaries
1. Canonical folder structure:
- owns sample existence and entrypoints only

2. Preview assets:
- own image binary content only
- must not introduce path aliases or alternate sample IDs

3. Metadata:
- owns which preview/thumbnail path a sample should use
- must reference canonical sample-owned paths only

4. UI rendering:
- consumes metadata + assets
- must not infer non-canonical sample paths

## Validation + Fail-Fast Expectations
Fail fast for future BUILD when:
- duplicate sample IDs in metadata
- metadata points to non-canonical sample IDs
- malformed preview paths
- preview/thumbnail points outside allowed sample-owned scope
- duplicate or conflicting preview entries for same sample
- ambiguous ownership between metadata and filesystem assets

Validation expectations for future BUILD:
- tiles render thumbnail if present
- detail page renders preview if present
- placeholder appears when assets are absent
- representative links still resolve:
  - first sample in first populated phase
  - last sample in last populated phase
  - phase 13: `1316`, `1317`, `1318`
- no console errors on tested pages

## Future BUILD Shape (Narrow + Testable)
1. Extend metadata schema minimally for preview/thumbnail.
2. Validate path safety and ownership constraints.
3. Wire index/detail rendering to read preview fields.
4. Preserve deterministic fallback placeholders.
5. Validate representative sample pages and links.

## Out of Scope
- gameplay logic updates
- engine-core refactors
- broad UI redesign
- sample path renaming or relocation
- automated image generation pipeline expansion

## Acceptance Criteria (Planning PR)
- preview/thumbnail contract defined
- source-of-truth boundaries defined
- fail-fast and validation expectations defined
- future BUILD remains narrow and testable
