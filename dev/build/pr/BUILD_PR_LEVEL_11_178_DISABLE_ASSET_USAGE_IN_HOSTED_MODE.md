
# BUILD_PR_LEVEL_11_178_DISABLE_ASSET_USAGE_IN_HOSTED_MODE

## Purpose
Fully disable assetUsageIntegration in hosted Workspace mode.
This removes the last active global system overwriting SVG state.

## Root Cause
Logs prove:
- assetUsageIntegration is still running globally
- It continuously reads sharedAssetHandoff (vector-map)
- platformShell is now partially blocked, but assetUsageIntegration still feeds it

## Fix
In hosted mode:
- Completely disable ALL reads from assetUsageIntegration

## Implementation

### 1. Detect hosted mode globally
Condition:
- hosted=1
- hostContextId exists

### 2. In assetUsageIntegration.js
For functions:
- readSharedAssetHandoff
- readSharedPaletteHandoff

Add early exit:

if (isHosted) {
  console.log("[ASSET_USAGE_DISABLED_HOSTED]");
  return null;
}

### 3. Prevent writes as well
For:
- writeSharedAssetHandoff
- writeSharedPaletteHandoff

Add same guard:
→ do nothing in hosted mode

### 4. No fallback allowed
Do not substitute values
Do not guess labels
Return null only

## Acceptance
Console shows:
[ASSET_USAGE_DISABLED_HOSTED]

Console does NOT show:
readSharedAssetHandoff
readSharedPaletteHandoff

SVG no longer influenced by vector-map

## Validation
node --check assetUsageIntegration.js

Manual:
1902 → mount SVG
Verify no shared reads
