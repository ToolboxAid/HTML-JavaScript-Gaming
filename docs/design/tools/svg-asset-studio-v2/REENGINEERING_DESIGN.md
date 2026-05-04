# SVG Asset Studio V2 Transitional Reference

Task: PR_26124_023-finalize-tool-design-docs
Classification: transitional/quarantine tool
Core priority: none
Source folder: `tools/svg-asset-studio-v2`

## Purpose
Transitional hosted payload reader for `payloadJson.vectorAssetDocument` only.

This folder is not a core rebuild anchor. Keep it as a deferred reference until a later cleanup PR explicitly chooses to migrate, retain, or delete it.

## Exact Folder/Files Inspected
- `tools/svg-asset-studio-v2/index.html`
- `tools/svg-asset-studio-v2/index.js`

## Current Controls Found
- `tools/svg-asset-studio-v2/index.html`: `button[button]#svgV2BackButton` - Back

## Current Functions And Classes
- `tools/svg-asset-studio-v2/index.js`: class SvgAssetStudioV2; method buildRuntimeSnapshot; method buildToolUrl; method goBack; method handleNavigationState; method handleSessionVersion; method loadContract; method logStructuredError; method optionalUrlStateSummary; method readSession; method readUrlState; method registerSnapshotHook; method renderError; method renderMissing; method renderNavigation; method renderSvg; method toolLabel

## Quarantine Rules
- Do not use this folder as the JSON contract source for a core rebuild.
- Hosted payload or toolState behavior documented here is transitional reference behavior only.
- Browser storage details are reference-only and must not become a rebuilt core tool contract.
- Core tool docs must not import V2 behavior from this folder.
