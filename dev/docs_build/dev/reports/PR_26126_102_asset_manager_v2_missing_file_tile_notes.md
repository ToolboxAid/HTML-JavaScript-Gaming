# PR_26126_102 Asset Manager V2 Missing File Tile Notes

## Missing File State
- Asset Manager V2 keeps a session-level set of asset IDs whose referenced files are unavailable.
- Missing-file detection still runs after valid Workspace V2 asset load and NAV Import JSON.
- Missing-file detection continues to log Status warnings with asset ID and original path.
- Valid schema payloads are not rejected solely because a referenced file is unavailable.

## Tile Display
- Missing file asset tiles receive `is-missing-file`.
- The tile `type:role` text uses `--asset-manager-danger`, rendering as red.
- Tile ID text, tooltip details, Selected Asset Detail, and Output Summary remain unchanged.

## Validation
- Playwright validates imported missing file assets log Status warnings.
- Playwright validates imported missing file asset tiles render red `type:role` text.
