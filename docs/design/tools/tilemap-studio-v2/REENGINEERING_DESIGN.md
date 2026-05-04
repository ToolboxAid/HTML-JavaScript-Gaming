# Tilemap Studio V2 Transitional Reference

Task: PR_26124_023-finalize-tool-design-docs
Classification: transitional/quarantine tool
Core priority: none
Source folder: `tools/tilemap-studio-v2`

## Purpose
Transitional hosted payload reader for `payloadJson.tileMapDocument` only.

This folder is not a core rebuild anchor. Keep it as a deferred reference until a later cleanup PR explicitly chooses to migrate, retain, or delete it.

## Exact Folder/Files Inspected
- `tools/tilemap-studio-v2/index.html`
- `tools/tilemap-studio-v2/index.js`

## Current Controls Found
- `tools/tilemap-studio-v2/index.html`: `button[button]#tilemapV2BackButton` - Back
- `tools/tilemap-studio-v2/index.html`: `button[button]#tilemapV2OpenAssetBrowserV2Button` - Open in Asset Browser V2

## Current Functions And Classes
- `tools/tilemap-studio-v2/index.js`: class TilemapStudioV2; method buildRuntimeSnapshot; method buildToolUrl; method goBack; method handleNavigationState; method handleSessionVersion; method loadContract; method logStructuredError; method openAssetBrowserV2; method optionalUrlStateSummary; method readSession; method readUrlState; method registerSnapshotHook; method renderError; method renderMissing; method renderNavigation; method renderTilemap; method toolLabel

## Quarantine Rules
- Do not use this folder as the JSON contract source for a core rebuild.
- Hosted payload or toolState behavior documented here is transitional reference behavior only.
- Browser storage details are reference-only and must not become a rebuilt core tool contract.
- Core tool docs must not import V2 behavior from this folder.
