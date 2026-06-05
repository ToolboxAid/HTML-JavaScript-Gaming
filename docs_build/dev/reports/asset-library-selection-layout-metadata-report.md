# Asset Library Selection, Layout, and Metadata Report

PR bundle:
- PR_26156_151-asset-library-selection-state
- PR_26156_152-asset-import-field-layout-polish
- PR_26156_153-asset-metadata-formatting

## Scope

Updated the active Asset Tool only:
- `toolbox/assets/index.html`
- `toolbox/assets/assets.js`
- `assets/theme-v2/css/tables.css`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`

No archived V1/V2 files were modified.
No `start_of_day` folders were modified.
No archive/reference code was copied.

## PR_26156_151 Selection State

Implemented selected library-record highlighting in Project Assets > Library Records.

Behavior:
- The selected asset row receives `class="is-selected"`.
- Rows expose `aria-selected="true"` or `aria-selected="false"`.
- The selected row button exposes `aria-pressed="true"`.
- Re-rendering the table from the selected repository snapshot guarantees only one selected row is highlighted at a time.
- Existing record click behavior is preserved; selecting a record still updates preview, metadata, output, and log state.

Theme V2 gap:
- Existing shared table styling had no reusable selected-row state.
- Added the reusable `.data-table tr.is-selected td` pattern in `assets/theme-v2/css/tables.css`.

## PR_26156_152 Import Field Layout

Updated Import Asset form layout while preserving the reusable tool form table pattern.

Changes:
- Reduced shared tool form table header/value cell padding using Theme V2 spacing tokens.
- Confirmed Storage Path remains read-only.
- Preserved File label and native Choose file control in the existing row.
- Added a selected filename row directly under File.
- The selected filename row spans both table columns.
- Native file picker behavior remains unchanged.

Theme V2 gap:
- Existing shared `tool-form-table` spacing was still too wide for the narrow left panel after the Asset Tool import workflow grew.
- The adjustment was made in the reusable Theme V2 table stylesheet instead of page-local or tool-local CSS.

## PR_26156_153 Metadata Formatting

Removed semicolon-separated metadata from Project Assets > Metadata and Library Records.

Metadata now renders as separate lines:
- `<filename> <mime type>`
- `<byte size> bytes`
- `<checksum>`

Example:
- `forge-bot-single.png image/png`
- `2596257 bytes`
- `mock-sha256-b12c5f4e`

Internal project/path details remain available below those user-facing lines.
No raw JSON output was introduced.

## Validation

Impacted lane:
- `asset-tool`

Commands run:
- `node --check toolbox/assets/assets.js`
- `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `node --check toolbox/assets/assets-mock-repository.js`
- `node ./scripts/run-targeted-test-lanes.mjs --lane asset-tool`
- `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list`

Results:
- Asset Tool lane passed: 5/5 Playwright tests.
- Direct Asset Tool Playwright run passed: 5/5 Playwright tests.
- V8 coverage refreshed for changed runtime JavaScript; no changed runtime JS guardrail warnings.

Skipped lanes:
- Workspace, Project Workspace, Game Design, Game Configuration, Build Path, Tools Progress, Tool Navigation, Tool Display Mode, Tool Images, Tool Runtime, Game Runtime, Integration, Engine Src, and Samples.

Skipped-lane rationale:
- The change is limited to the active Asset Tool import form, library rendering, metadata rendering, shared Theme V2 table styling, and the targeted Asset Tool test file.
- No shared launch/navigation behavior changed.
- No sample JSON or sample loader/framework behavior changed.

Manual test notes:
- Open `toolbox/assets/index.html`.
- Confirm Library Records highlights the selected row.
- Click another library record and confirm the previous row loses highlight while metadata updates.
- Confirm Storage Path is read-only.
- Choose a file and confirm the selected filename appears in the row directly under File.
- Confirm metadata renders on separate lines without semicolons.
