# PR_26126_098 Asset Manager V2 NAV Import-Export Notes

## NAV Controls
- Removed the old page-body controls: `Export Assets`, `Copy JSON`, and `Export toolState`.
- Added Asset Manager V2 NAV controls: `Import JSON` and `Export JSON`.
- Import and export are enabled only when schema-backed asset payload actions are available.

## Import JSON
- `Import JSON` opens a JSON file picker.
- The selected JSON is parsed as an Asset Manager V2 asset payload.
- Imported JSON must pass `asset-browser.schema.json` validation before replacing current assets.
- Successful import loads the validated assets and selects the first asset.
- Import success and failure messages are written to Status only.

## Export JSON
- `Export JSON` validates the current Asset Manager V2 payload.
- Successful export downloads `asset-manager-v2-assets.json`.
- Export success and failure messages are written to Status only.
- Export does not write success/failure prose into Output Summary.

## Validation
- Playwright validates the old body controls are absent.
- Playwright validates NAV Import JSON and Export JSON labels and enabled state.
- Playwright validates invalid import failure, valid import success, and exported JSON contents.
- Playwright validates import/export messages are Status-only.
