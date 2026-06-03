# PR_26126_084 Asset Manager V2 Manual Validation Notes

Date: 2026-05-06

## Validation Performed

- Ran `npm run test:workspace-v2`.
- Confirmed Asset Manager V2 tool mode launch through the Playwright workspace-v2 suite.
- Confirmed Asset Manager V2 Workspace V2 launch mode through the Playwright workspace-v2 suite.
- Confirmed the old per-kind file inputs are absent and the single `Pick Asset File` control is present.
- Confirmed kind derivation from selected file extension/MIME type for image and audio files.
- Confirmed role selection is required before Add and restricted to the approved kind's roles.
- Confirmed asset ID assignment includes approved kind, filename slug, and role.
- Confirmed project-root path normalization for selected open-dialog paths.
- Confirmed unsupported file rejection, invalid role schema rejection, and Workspace V2 insertion through Playwright.
- Searched Asset Manager V2 targets for legacy Asset Browser implementation reuse.
- Kept sample JSON files unmodified; the old sample schema path is a compatibility pointer to the moved canonical schema.

## Results

- `npm run test:workspace-v2`: passed, 10 tests.
- Tool mode: passed. Asset Manager V2 shows the tool action nav, hides workspace action nav, loads `asset-browser.schema.json`, exposes one picker, derives approved kind, and validates selected files before Add.
- Selected file validation: passed. `nebula-backdrop.png` selected from a project-root path derived `image`, required `background`, assigned `image.assets.nebula-backdrop.background`, normalized `assets/images/nebula-backdrop.png`, validated, and added successfully.
- Picker rejection: passed. `notes.exe` was rejected as an unapproved asset type and Add stayed disabled.
- Role validation: passed. A JSON payload with an audio asset using the image-only `background` role was rejected.
- Workspace mode: passed. Workspace V2 launched Asset Manager V2 with `launch=workspace`, inserted `audio.assets.fire.sound` into `tools.asset-browser.assets`, and did not create `asset-manager-v2` or `workspace-v2` manifest entries.
- Asset Browser reuse check: passed. No legacy Asset Browser implementation imports or app references were added.

## Reports

- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/PR_26126_084_asset_manager_v2_schema_validation_notes.md`
- `docs_build/dev/reports/PR_26126_084_asset_manager_v2_path_normalization_notes.md`
- `docs_build/dev/reports/PR_26126_084_asset_manager_v2_manual_validation_notes.md`
