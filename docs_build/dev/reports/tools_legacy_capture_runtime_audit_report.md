# PR_26154_019 Tools Legacy And Capture Runtime Audit Report

Task: `PR_26154_019-tools-legacy-and-capture-runtime-audit`

## Scope

- Investigated `tools/shared/tooling/CapturePreviewRuntime.js`.
- Started a targeted legacy review of current `tools/` content.
- Audited `scripts/` for legacy/V1 cleanup and test-related placement.
- Moved only confirmed test-related skip shims; did not move ambiguous tools.

## Capture Preview Runtime

Classification: `obsolete`.

Evidence:

- Active reference search excluding docs, tests, reports, `old-tools/`, `old_games/`, `old_samples/`, `start_of_day/`, and `tmp/` found no imports or calls for:
  - `tools/shared/tooling/CapturePreviewRuntime.js`
  - `CapturePreviewRuntime.js`
  - `bootCapturePreview`
- Full repository search found only the file itself and historical docs/reports.
- The file existed as a leftover capture-preview helper after earlier theme-runtime cleanup and no longer had an active consumer.

Change:

- Deleted `tools/shared/tooling/CapturePreviewRuntime.js`.

## Tools Legacy Review

| Item | Classification | Action |
| --- | --- | --- |
| `tools/toolRegistry.js` | Active shared registry | Kept; imported by validation scripts and shared tool host code. |
| `tools/renderToolsIndex.js` | Active validation/render helper | Kept; referenced by `scripts/validate-active-tools-surface.mjs`. |
| `tools/dev/` | Active dev guard surface | Kept; package scripts call guard files under this folder. |
| `tools/shared/` | Active shared tool/runtime support | Kept; active scripts, shared runtime code, and tests import this folder. |
| `tools/schemas/` | Active schema surface | Kept; schema validation and engine/runtime references still use it. |
| `tools/_templates-v2/` | Active template/source surface | Kept; project instructions and vector template helpers still reference it. |
| `tools/configuration-admin/` | Active routed page, not listed in active Tools index | Kept; route map references it. |
| `tools/builder/` | Ambiguous standalone tool page | Not moved; no proof in this PR that direct access is deprecated. |
| `tools/creator/` | Ambiguous standalone tool page | Not moved; no proof in this PR that direct access is deprecated. |

No folders were moved from `tools/` to `old-tools/` in this PR because the remaining legacy-looking folders were either actively referenced or ambiguous.

## Scripts Audit

| Script | Classification | Action |
| --- | --- | --- |
| `scripts/skip-deprecated-game-tests.mjs` | Test-related deprecated-games skip shim still used by package scripts | Moved to `tests/validation/skip-deprecated-game-tests.mjs`. |
| `scripts/skip-deprecated-sample-tests.mjs` | Test-related deprecated-samples skip shim still used by package scripts | Moved to `tests/validation/skip-deprecated-sample-tests.mjs`. |
| `scripts/generate-sample-manifest.mjs` | Active package script | Kept. |
| `scripts/normalize-games-presentation.mjs` | Active package script | Kept. |
| Other scripts mentioning `old_samples` or `old_games` | Current deprecated-reference support | Kept; not V1 theme cleanup scripts. |

No obsolete V1 theme cleanup scripts were found with enough evidence to remove.

## Validation Notes

- PASS: No active references remain to `CapturePreviewRuntime.js` or `bootCapturePreview`.
- PASS: Package scripts now point to `tests/validation/skip-deprecated-*.mjs`.
- PASS: Deprecated old-games and old-samples validation remains skipped by explicit shim commands.
