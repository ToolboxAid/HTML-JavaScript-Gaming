# PR 11.98 - Strict Schema Validation And Usage Review

## Scope Executed
- Tightened schema contracts for workspace/tool usage in scoped targets.
- Added contract validation scripts:
  - `scripts/PS/validate-tool-schemas.ps1`
  - `scripts/PS/validate-sample-json.ps1`
  - `scripts/PS/validate-game-manifests.ps1`
  - `scripts/PS/validate-all-json-contracts.ps1`
  - `scripts/validate-json-contracts.mjs`
- Updated workspace runtime validator coverage in `toolbox/Workspace Manager/main.js` for strict constructs (`anyOf`, `allOf`, `not`, `propertyNames`, typed `additionalProperties`).
- Enforced flat asset-browser schema contract updates and removed duplicate workspace palette alias key.

## Required Reports Generated
- `docs_build/dev/reports/schema_strictness_inventory.md`
- `docs_build/dev/reports/schema_strictness_inventory.csv`
- `docs_build/dev/reports/sample_json_schema_validation.csv`
- `docs_build/dev/reports/game_manifest_schema_validation.csv`
- `docs_build/dev/reports/tool_payload_schema_validation.csv`
- `docs_build/dev/reports/schema_usage_code_updates.md`

## Validation Commands Run
1. `powershell -ExecutionPolicy Bypass -File .\\scripts\\PS\\validate-all-json-contracts.ps1 -Details`
2. `powershell -ExecutionPolicy Bypass -File .\\scripts\\PS\\validate-tool-schemas.ps1`
3. `powershell -ExecutionPolicy Bypass -File .\\scripts\\PS\\validate-sample-json.ps1`
4. `powershell -ExecutionPolicy Bypass -File .\\scripts\\PS\\validate-game-manifests.ps1`
5. `node tests/tools/ToolSchemaStrictModeValidation.test.mjs`
6. `node tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools`
7. `node --check scripts/validate-json-contracts.mjs`
8. `node --check "toolbox/Workspace Manager/main.js"`
9. `node --check tests/tools/ToolSchemaStrictModeValidation.test.mjs`
10. `node -e "...Asteroids manifest asset checks..."`
11. `rg -n "assets/images/bezel\\.png|assets/images/background\\.png|bezel1\\.png" src tools games samples`
12. `rg -n "asset-browser\\.assets\\.media|\\.assets\\.media" src tools games samples`

## Validation Results
- Tool schema validation: `total=17 invalid=0`
- Sample JSON validation: `total=66 invalid=38`
- Game manifest validation: `total=12 invalid=0`
- Sample 1902 strict workspace validation test: PASS
- Sample 1902 targeted launch smoke (with tools): PASS (19/19)
- Asteroids manifest asset checks: PASS
  - `image.asteroids.bezel.path = /games/Asteroids/assets/images/bezel.png`
  - `image.asteroids.background.path = /games/Asteroids/assets/images/deluxe.png`
  - `font.asteroids.vector-battle` present
- Guessed chrome-path search:
  - only expected manifest declaration hit for `bezel.png`
  - no `assets.media` usage hits in scanned runtime/tool/sample paths

## Blockers / Remaining Invalid Rows
- 38 sample JSON files remain invalid under strict schema review.
- Exact file-level errors are recorded in:
  - `docs_build/dev/reports/sample_json_schema_validation.csv`
- Dominant blocker patterns:
  - legacy top-level `$schema` fields not accepted by strict tool schemas
  - legacy `config` vs strict `payload` contract mismatches
  - payload shape mismatches in older sample payload documents

## Notes
- No fallback/default payloads were introduced.
- Full samples suite was skipped by design: this PR used targeted schema + targeted smoke validation only, and did not require a broad full-samples run.
