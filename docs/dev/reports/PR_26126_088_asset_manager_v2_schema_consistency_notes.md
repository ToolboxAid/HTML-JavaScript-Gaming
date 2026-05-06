# PR_26126_088 Asset Manager V2 Schema Consistency Notes

Date: 2026-05-06

## Scope

- Asset Manager V2 keeps the persisted Workspace V2 asset schema contract strict.
- Stored Workspace entries continue to use schema fields `path`, `kind`, `role`, and `source`.
- The visible Assets list and default Output Summary now expose compact display fields `id`, `type`, `kind`, `role`, and `path`.
- `type` is the display alias for the schema `kind` value; both are shown in Output Summary and tile tooltips so the UI naming is explicit.

## Naming Changes

- Removed remaining visible "approved asset" wording from the Asset Manager V2 surface and current tools index planned text.
- Replaced visible load messaging with `Kinds` and `Roles`.
- Replaced validation wording that referenced "asset id" with `id`.
- Kept Workspace V2 insertion at `workspaceManifest.tools["asset-browser"].assets`, using schema-valid entries with `kind`, `role`, `path`, and `source`.
- Default Output Summary is a compact display summary and does not include add, delete, or update status messages.

## Validation

- `npm run test:workspace-v2`: passed, 10 tests.
- Playwright validates the first selected image output includes `id`, `type`, `kind`, `role`, and `path`.
- Playwright validates Workspace V2 insertion still writes the schema-valid audio asset entry to `tools.asset-browser.assets`.
- `git diff --name-only -- "*.json"` returned no changed JSON files, so sample JSON was not modified.

