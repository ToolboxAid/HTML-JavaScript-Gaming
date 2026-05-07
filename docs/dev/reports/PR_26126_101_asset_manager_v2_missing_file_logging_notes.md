# PR_26126_101 Asset Manager V2 Missing File Logging Notes

## Availability Check
- After Workspace V2 asset payload load, Asset Manager V2 checks file-backed asset paths after schema validation succeeds.
- After NAV Import JSON, Asset Manager V2 checks file-backed asset paths after schema validation succeeds.
- Color assets and protocol paths such as `palette://workspace/...` are skipped because they are not referenced files.

## Warning Behavior
- Missing files are logged to Status as informational file availability warnings.
- Missing files do not make otherwise valid schema payloads fail.
- The warning includes the asset ID and original path.

## Example
- `File availability warning: Missing referenced file for assets.font.ui.vector-battle: assets/fonts/vector_battle.ttf.`

## Validation
- Playwright imports valid Asset Manager V2 JSON with missing referenced file paths.
- Playwright validates Status contains missing-file warnings for both imported assets while import and export still succeed.
