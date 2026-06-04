# PR_26154_036 Legacy Ownership Final Audit

Baseline used: `PR_26154_035-theme-v2-asset-wiring-closeout`.

## Scope

Audited:

- `toolbox`
- `old-tools`
- `games`
- `old_games`
- `old_samples`
- `scripts`
- `tests`

Moved only clearly deprecated ownership. Ambiguous items were reported and left in place.

## Ownership Classifications

| Surface | Classification | Notes |
| --- | --- | --- |
| `toolbox/[toolname]/index.html` | Active | 20 active toolbox pages are template-aligned, header-wired, and index-wired. |
| `toolbox/_tool_template-v2/` | Active template source | Required first-class toolbox template source. |
| `toolbox/tools-page-accordions.js` | Active | Drives the active toolbox index grouping. |
| `toolbox/toolRegistry.js` | Ambiguous active/legacy bridge | Still imported by active shared modules, scripts, and tests, but contains legacy `old-tools` and `old_samples` entries. Not moved. |
| `toolbox/renderToolsIndex.js` | Ambiguous legacy renderer | Referenced by active validation/tests but not by the current `toolbox/index.html`; not moved. |
| `toolbox/dev/` | Ambiguous active tooling | Package scripts and validation guards still reference this folder. Not moved. |
| `toolbox/shared/` | Active/ambiguous shared tooling | Many modules are imported by active tests and shared tool contracts. Not moved wholesale. |
| `toolbox/shared/preview/` | Deprecated | Moved to `old-tools/shared-preview/`. It only referenced `old_samples` and had no active imports outside itself. |
| `toolbox/schemas/` | Active/ambiguous contract schemas | Active tests and scripts still reference toolbox schemas. Not moved. |
| `old-tools/` | Deprecated | Retained as deprecated tool/reference ownership. New `shared-preview/` added here. |
| `games/` | Active | Owns active public game-type pages and game assets. |
| `old_games/` | Deprecated playable references | Retained; no tests were run against it. |
| `old_samples/` | Deprecated sample references | Retained; no tests were run against it. |
| `scripts/` | Active/ambiguous validation tooling | Current validation and artifact scripts remain active. No clear deprecated script was moved in this PR. |
| `tests/` | Active/ambiguous validation inventory | Active runner, Playwright future-state test, and retained legacy boundary fixtures coexist. No ambiguous tests were deleted. |

## Move Completed

| From | To | Reason |
| --- | --- | --- |
| `toolbox/shared/preview/` | `old-tools/shared-preview/` | Self-contained preview-generator support for `old_samples`; no active imports outside the folder were found. |

Moved files:

- `old-tools/shared-preview/generate-list-previews.html`
- `old-tools/shared-preview/generate-previews.html`
- `old-tools/shared-preview/move-preview-svg-to-assets.ps1`
- `old-tools/shared-preview/preview-pages.css`

## Remaining Legacy References

- `toolbox/toolRegistry.js` keeps hidden legacy `old-tools` and `old_samples` entries. It is still imported by active validation/shared code, so it needs a dedicated registry split before relocation.
- `toolbox/renderToolsIndex.js` still references `old_samples` and is read by active validation/tests. It needs a dedicated renderer retirement or validation rewrite.
- Some historical docs still mention `toolbox/shared/preview/`; they were left untouched because they are historical PR/design documents rather than active runtime wiring.
- `tests/games/` and parts of `tests/validation/` still preserve old-game/sample boundary coverage. They were classified as ambiguous or deprecated-adjacent and left in place.

## Validation

- PASS: active reference scan found no imports of `toolbox/shared/preview/` after the move.
- PASS: `old-tools/shared-preview/` exists with the moved preview files.
- PASS: `node --check toolbox/tools-page-accordions.js`.
- PASS: `npm run test:playwright:static`.
- PASS: `npm run test:workspace-v2`.
- SKIPPED tests against `old-tools`, `old_games`, and `old_samples` per request.
