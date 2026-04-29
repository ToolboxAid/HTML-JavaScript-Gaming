# PR 11.22 - Workspace Manager Embedded Payload Asset Status Fix

## PASS/FAIL
PASS

## Files Changed
- tools/shared/platformShell.js
- docs/dev/reports/PR_11_22_workspace_embedded_payload_asset_status_evidence.json
- docs/dev/reports/PR_11_22_WORKSPACE_MANAGER_EMBEDDED_PAYLOAD_ASSET_STATUS_FIX_report.md

## Scope Implemented
- Preserved PR 11.21 manifest.tools presence logic (no changes to presence classifier in Workspace Manager).
- Fixed shared shell asset/status badge rendering used during Workspace Manager hosted tool sessions.
- Added embedded payload status derivation from `manifest.tools[toolId].payload` scoped tool state so payload-backed tools do not default to `Asset: none` when shared handoff is empty.

## Embedded Payload Mapping Added
Payload documents recognized for status labels:
- `vectorMapDocument`
- `vectorAssetDocument`
- `tileMapDocument`
- `parallaxDocument`
- `spriteProject`
- `skin`
- `assetCatalog`
- `palette`
- `snapshot`
- `events`
- `profileSettings`
- `physicsBody`
- `pipelinePayload`
- `candidate`
- `mapPayload`
- `asset3d`
- `cameraPath`

## Behavior Change
- For hosted tools launched via Workspace Manager sample workspace manifest:
  - If shared asset/palette handoff exists and is compatible, badge remains shared-handoff driven.
  - If shared handoff is empty but scoped workspace payload contains recognized embedded data, badge now shows an active embedded status label (for example, embedded vector map/asset/tile map/palette/etc.) instead of `Asset: none`.
  - Utility tools with embedded payloads now show embedded status labels rather than missing status.
  - `Asset: N/A` is only retained when a tool intentionally has no shared-asset dependency and no recognized embedded payload document.

## Evidence
Evidence file:
- `docs/dev/reports/PR_11_22_workspace_embedded_payload_asset_status_evidence.json`

Evidence summary for sample 1902:
- visible mapped tools: 17
- payload-backed missing labels: 0
- each visible mapped tool resolves one of the required embedded payload document keys.

## Validation Commands and Results
- `node --check "tools/shared/platformShell.js"` -> PASS
- `node --check "tools/Workspace Manager/main.js"` -> PASS
- `node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools` -> PASS (`PASS=19 FAIL=0`)
- embedded payload evidence generation script (sample 1902 mapping/status export) -> PASS (`payloadBackedMissing=0`)

## Constraint Confirmation
- No schema loosening.
- No fallback/default/hidden data added.
- No modifications to other samples.
- No modifications to `start_of_day` folders.
- No dependency on legacy `assetRegistry`/external pointers for payload-present status.
