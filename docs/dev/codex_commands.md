# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: high

Apply PR_11_22_WORKSPACE_MANAGER_EMBEDDED_PAYLOAD_ASSET_STATUS_FIX.

Required:
- Fix Workspace Manager asset/status display so tools with embedded data under `manifest.tools[toolId].payload` do not show `Asset: none`.
- Keep tool presence logic from PR 11.21.
- Add payload-document mapping for sample 1902 tool entries:
  vectorMapDocument, vectorAssetDocument, tileMapDocument, parallaxDocument, spriteProject, skin, assetCatalog, palette, snapshot, events, profileSettings, physicsBody, pipelinePayload, candidate, mapPayload, asset3d, cameraPath.
- Derive meaningful display labels from embedded payloads where possible.
- Utilities may show N/A only when intentionally non-asset tools, but payload-backed tools must not be marked missing.
- Do not require external asset pointers or legacy assetRegistry entries to show data present.
- Do not loosen schemas.
- Do not modify other samples.
- Do not add fallback/default/hidden data.
- Do not modify start_of_day folders.
- Add validation report at docs/dev/reports/PR_11_22_WORKSPACE_MANAGER_EMBEDDED_PAYLOAD_ASSET_STATUS_FIX_report.md.
- Return ZIP artifact at tmp/PR_11_22_WORKSPACE_MANAGER_EMBEDDED_PAYLOAD_ASSET_STATUS_FIX_delta.zip.
