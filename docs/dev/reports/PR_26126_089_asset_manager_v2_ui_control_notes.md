# PR_26126_089 Asset Manager V2 UI Control Notes

Date: 2026-05-06

## Control Changes

- Asset Manager V2 ID is read-only and cannot be edited directly.
- Asset Manager V2 Path is read-only and cannot be edited directly.
- Asset state changes continue through Pick Asset File, Add Asset, tile selection, tile delete, Undo, and Redo.
- Undo and Redo moved into a dedicated Asset history control section.
- The Role dropdown keeps its allowed options based on the selected kind.
- The Role dropdown exposes a tooltip listing allowed roles for the currently selected kind.
- Asset tiles no longer render a separate Delete button below the tile content.
- Each asset tile renders one tile button with an inline X delete control positioned to the left of the `type:role` display.
- `assetValidationMessage` and selected-file picker message text were removed from the visible Asset Controls UI.

## Coverage Naming

- Playwright/V8 coverage display naming now reports `Palette Manager V2`.
- The PR validation gate remains the workspace-v2 suite with Asset Manager V2 coverage included.
- No Palette Manager-only validation was used as the PR gate.

## Validation

- `npm run test:workspace-v2`: passed, 10 tests.
- Playwright validates read-only ID/Path controls, Role tooltip contents, dedicated Undo/Redo section, inline tile X delete placement, and removed validation/picker message controls.
- `docs/dev/reports/playwright_v8_coverage_report.txt` shows `Palette Manager V2` and `Asset Manager V2` coverage entries.
