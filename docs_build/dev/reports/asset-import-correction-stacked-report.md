# Asset Import Correction Stacked Report

PR bundle:
- PR_26156_154-asset-library-naming-order
- PR_26156_155-asset-storage-path-generation
- PR_26156_156-asset-import-dynamic-inputs
- PR_26156_157-asset-import-layout-correction
- PR_26156_158-asset-selection-rollback

## Scope

Updated only the active Asset Tool and its targeted validation:
- `toolbox/assets/index.html`
- `toolbox/assets/assets.js`
- `toolbox/assets/assets-mock-repository.js`
- `assets/theme-v2/css/tables.css`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`

Reference note:
- Read `archive/v1-v2/tools/old_asset-manager-v2/js/assetManagerMetadata.js` only for functionality expectations around role usage values, accept lists, file roles, and Color palette ownership.
- Did not copy archive/reference code.

No archived V1/V2 files were modified.
No `start_of_day` folders were modified.

## PR_26156_154 Naming And Order

Changes:
- Kept `Asset Role` as the singular form for the Import Asset form field.
- Renamed the supporting role list heading to `Asset Roles`.
- Moved `Library Records` above the informational `Asset Roles` table.
- Renamed the center workspace heading to `Project Assets` so Library Records reads as the primary project asset surface.

Validation:
- Targeted Playwright verifies `Library Records` appears before `Asset Roles`.
- Targeted Playwright verifies the form field still uses singular `Asset Role`.

## PR_26156_155 Storage Path Generation

Storage Path now documents and generates:

`projects/<projectId>/<assetRole>/<usage>/<filename>`

Changes:
- Storage Path remains read-only.
- Storage path preview updates from active project, selected asset role, selected usage, and selected filename.
- Imported asset records and storage object records now use the usage-aware project-owned path.
- No global, site, theme, or public static asset path is used for uploads.

Validation:
- Repository test verifies `projects/<ULID>/image/sprite/hero.png`.
- UI upload tests verify Image, Audio, Video, and Data paths include role and usage.

## PR_26156_156 Dynamic Inputs

Changes:
- File-based roles use the native Choose File input:
  - Audio
  - Data
  - Font
  - Image
  - Localization
  - Shader
  - Video
- File input `accept` now reflects role-specific extensions and MIME types.
- Usage dropdown remains role-specific.
- Color switches to palette-prep mode:
  - File input is disabled.
  - Visible diagnostic shows `Palette Tool required.`
  - Color upload remains blocked until Palette Tool ownership is ready.

Validation:
- Targeted Playwright checks every role-specific Usage list.
- Targeted Playwright checks file input enabled/disabled state by role.
- Targeted Playwright checks role-specific `accept` values for file-based roles.
- Targeted Playwright checks Color shows the Palette Tool required diagnostic.

## PR_26156_157 Layout Correction

Changes:
- Kept File label and native Choose File control in the existing File row.
- Kept selected filename in the row directly under File.
- Kept selected filename row spanning both columns.
- Kept explanatory help text in its own row spanning both columns.
- Tightened the reusable Theme V2 `tool-form-table` pattern so inputs use available panel width without creating horizontal scroll.

Theme V2 gap:
- The reusable `tool-form-table` pattern did not yet prevent overflow for long generated-path guidance and native file inputs inside a narrow tool panel.
- Fixed in `assets/theme-v2/css/tables.css` with reusable table layout, compact wrapping labels, `max-width: 100%` controls, and wrapping `colspan` cells.
- No page-local CSS, tool-local CSS, inline styles, or style blocks were added.

Validation:
- Targeted Playwright verifies no horizontal scrollbar on the Import Asset table wrapper.
- Targeted Playwright verifies controls remain usable and fill the available value column.

## PR_26156_158 Selection Rollback

Changes:
- Removed selected row highlighting from Library Records.
- Removed the reusable selected-row styling from Theme V2 tables.
- The selected record button is now highlighted with the existing `btn primary` style.
- Metadata, preview, output, and log updates from selected records are preserved.

Validation:
- Targeted Playwright verifies `tr.is-selected` does not appear.
- Targeted Playwright verifies exactly one selected record button is highlighted.
- Targeted Playwright verifies selecting another record updates metadata and moves the highlighted button.

## Validation Summary

Impacted lane:
- `asset-tool`

Commands run:
- `node --check toolbox/assets/assets-mock-repository.js`
- `node --check toolbox/assets/assets.js`
- `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `node ./scripts/run-targeted-test-lanes.mjs --lane asset-tool`
- `rg --pcre2 -n "<style|style=|on(click|change|input|submit)=|<script(?![^>]*\\bsrc=)" toolbox/assets/index.html toolbox/assets/assets.js toolbox/assets/assets-mock-repository.js assets/theme-v2/css/tables.css tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `git diff --check`

Results:
- Asset Tool lane passed: 5/5 Playwright tests.
- Changed runtime JavaScript V8 coverage was generated.
- Changed runtime JavaScript guardrail warnings: none.
- Inline style/script/event handler guard found no violations.
- `git diff --check` passed with CRLF warnings only.

Skipped lanes:
- Workspace, Project Workspace, Game Design, Game Configuration, Build Path, Tools Progress, Tool Navigation, Tool Display Mode, Tool Images, Tool Runtime, Game Runtime, Integration, Engine Src, and Samples.

Skipped-lane rationale:
- Changes are limited to Asset Tool import/library rendering, Asset Tool mock repository behavior, reusable Theme V2 table layout, and the Asset Tool targeted Playwright lane.
- No shared launch/navigation behavior changed.
- No sample JSON or sample loader/framework behavior changed.
- Full samples smoke was skipped by request and because samples were not changed.

Manual test notes:
- Open `toolbox/assets/index.html`.
- Confirm `Library Records` is above `Asset Roles`.
- Confirm Storage Path shows the generated format and includes usage after selecting a file.
- Switch Asset Role through Audio, Data, Font, Image, Localization, Shader, and Video; confirm Choose File remains enabled and Usage options change.
- Switch Asset Role to Color; confirm Choose File is disabled and `Palette Tool required.` is visible.
- Confirm Import Asset has no horizontal scrollbar.
- Confirm selected filename appears in the row directly under File.
- Click library record buttons; confirm only the selected button is highlighted and metadata updates.
