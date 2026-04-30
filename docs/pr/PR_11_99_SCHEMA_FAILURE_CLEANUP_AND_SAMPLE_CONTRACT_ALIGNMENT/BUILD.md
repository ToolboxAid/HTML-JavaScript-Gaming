# PR_11_99_SCHEMA_FAILURE_CLEANUP_AND_SAMPLE_CONTRACT_ALIGNMENT BUILD

## Codex Role
Apply the smallest executable cleanup that converts PR 11.98 strict-schema failures into schema-valid sample/tool payloads.

## Required Execution Order
1. Read `docs/dev/reports/sample_json_schema_validation.csv` after PR 11.98 is applied.
2. Group invalid sample rows by exact error pattern.
3. Apply mechanical fixes only when the schema contract makes the correct value unambiguous.
4. Do not modify schemas to make invalid samples pass.
5. Do not introduce defaults, fallback media, guessed assets, alias keys, or duplicate concept names.
6. Re-run targeted validation and write reports.

## Mechanical Fix Rules
- Unknown top-level `$schema`: remove it when the target schema rejects it.
- Rejected `config`: move only schema-recognized values into the accepted shape; delete values with no schema contract.
- Legacy `payload.assetCatalog`: convert to flat top-level `assets` only when entries are explicit and valid.
- `spriteProject`, `tileMapDocument`, `parallaxDocument`, and `asset3d` oneOf failures: align existing object shape to the accepted schema branch; do not invent document data.
- Skin editor legacy `gameId`: keep only if represented by an accepted schema field; otherwise remove and document removal.
- Skipped files with no matching schema are not failures unless directly required by a changed valid sample.

## Sample 1902 Requirements
- Keep `samples/phase-19/1902/sample.1902.workspace-all-tools.json` strict-valid.
- Keep asset-browser assets under the flat `assets` contract.
- Do not restore `media` as a fallback bucket.
- Needed assets must be explicit manifest/sample assets with schema-accepted metadata.

## Validation Commands
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\PS\validate-tool-schemas.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\PS\validate-sample-json.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\PS\validate-game-manifests.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\PS\validate-all-json-contracts.ps1 -Details
node tests/tools/ToolSchemaStrictModeValidation.test.mjs
node tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools
```

## Full Samples Smoke Policy
Do not run the full samples smoke test by default. Run it only if a shared sample loader/framework path or broad runtime behavior is changed. Otherwise record that it was skipped because this PR is schema/data-contract cleanup with targeted sample 1902 smoke.

## Required Output Files
- `docs/dev/reports/PR_11_99_schema_failure_cleanup_report.md`
- Updated validation CSVs from validators if generated.
- `docs/dev/commit_comment.txt`
- `<project folder>/tmp/PR_11_99_SCHEMA_FAILURE_CLEANUP_AND_SAMPLE_CONTRACT_ALIGNMENT.zip`

## Commit Comment
Normalize strict sample contracts without weakening schemas - PR 11.99
