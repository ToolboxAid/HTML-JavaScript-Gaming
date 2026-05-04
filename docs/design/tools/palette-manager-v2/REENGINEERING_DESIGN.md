# Palette Manager V2 Transitional Reference

Task: PR_26124_023-finalize-tool-design-docs
Classification: transitional/quarantine tool
Core priority: none
Source folder: `tools/palette-manager-v2`

## Purpose
Transitional hosted payload reader for `payloadJson.paletteDocument` only.

This folder is not a core rebuild anchor. Keep it as a deferred reference until a later cleanup PR explicitly chooses to migrate, retain, or delete it.

## Exact Folder/Files Inspected
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/index.js`

## Current Controls Found
- `tools/palette-manager-v2/index.html`: `button[button]#paletteManagerBackButton` - Back
- `tools/palette-manager-v2/index.html`: `button[button]#paletteManagerOpenVectorMapEditorV2Button` - Open in Vector Map Editor V2

## Current Functions And Classes
- `tools/palette-manager-v2/index.js`: class PaletteManagerV2; method buildRuntimeSnapshot; method buildToolUrl; method goBack; method handleNavigationState; method handleSessionVersion; method loadContract; method logStructuredError; method openVectorMapEditorV2; method optionalUrlStateSummary; method readSession; method readUrlState; method registerSnapshotHook; method renderError; method renderMissing; method renderNavigation; method renderPalette; method toolLabel

## Quarantine Rules
- Do not use this folder as the JSON contract source for a core rebuild.
- Hosted payload or toolState behavior documented here is transitional reference behavior only.
- Browser storage details are reference-only and must not become a rebuilt core tool contract.
- Core tool docs must not import V2 behavior from this folder.
