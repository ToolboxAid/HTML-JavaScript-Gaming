# PR 11.167 Corrected Badge Ownership Report

## Question
Why is the badge doing a shared handoff instead of using session context?

## Answer
It should not rely on shared handoff for hosted Workspace Manager launches.

The repo already has the correct session-backed launch mechanism:
- `ToolHostRuntime.launch(toolId, payloadJson, paletteJson)` writes host context.
- The hosted iframe URL includes `hostContextId`.
- SVG Asset Studio already reads hosted payload through `readToolHostSharedContextFromLocation(window.location)`.
- SVG Asset Studio loads `vectorAssetDocument.svgText` and `sourceName` from that context.

The remaining bad path is the shared shell badge renderer. It still resolves badge text through the older shared asset handoff path. That is why the tool can load the SVG while the shell badge still says `Asset: none`.

## Ownership
### Correct owner
Hosted launch/session context owns hosted tool input data and hosted badge labels.

### Incorrect owner
Shared asset handoff should not be required for hosted Workspace Manager tile/badge labels.

## Keep
- ToolHostRuntime session context contract.
- SVG Asset Studio direct hosted context loader.
- Workspace Manager explicit payload launch.

## Reclassify as legacy/secondary
- Shared asset handoff for hosted badge rendering.

## Fix
Make `platformShell.js` resolve hosted badge text from the session context first, before falling back to shared asset handoff.
