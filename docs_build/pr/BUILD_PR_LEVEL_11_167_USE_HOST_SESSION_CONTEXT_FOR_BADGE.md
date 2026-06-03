# BUILD_PR_LEVEL_11_167_USE_HOST_SESSION_CONTEXT_FOR_BADGE

## Purpose
Fix the SVG Asset Studio Workspace Manager tile/badge by using the hosted launch session context as the source of truth instead of the shared asset handoff.

## Corrected Mental Model
Workspace Manager launches hosted tools through ToolHostRuntime.

That runtime already writes a session-backed host context:
- `toolboxaid.toolHost.context.<hostContextId>`
- URL carries `hosted=1`
- URL carries `hostToolId`
- URL carries `hostContextId`
- hosted tool can read `sharedContext.payloadJson`

Therefore, hosted badge text must be resolved from the hosted session context first.

The shared asset handoff is legacy/global state and must not be required for hosted Workspace Manager tile labels.

## Root Cause
SVG Asset Studio successfully loads the hosted payload from `readToolHostSharedContextFromLocation(window.location)`.

The badge still shows `Asset: none` because `tools/shared/platformShell.js` badge rendering still prefers/depends on `readSharedAssetHandoff()` instead of reading the hosted session context payload.

This means:
- Data load path works.
- SVG tool works.
- Workspace manifest works.
- Badge source of truth is wrong.

## Scope
One purpose only:
- Hosted shell badge reads direct hosted session payload first.

## Implementation Requirements
1. Update `tools/shared/platformShell.js`.
2. Import/use `readToolHostSharedContextFromLocation` if not already available.
3. When current URL has `hosted=1` and `hostContextId`, read hosted context.
4. For `hostToolId=svg-asset-studio`, if `sharedContext.payloadJson.vectorAssetDocument.sourceName` exists, badge label must use it.
5. If no sourceName exists but `svgText` exists, badge label may be `Inline SVG`.
6. Preserve existing shared asset handoff behavior for non-hosted/standalone launches.
7. Do not modify schemas.
8. Do not modify sample 1902 JSON.
9. Do not modify SVG Asset Studio parsing.
10. Do not add fallback data.
11. Do not broaden to other tools except through a tiny generic helper if already needed in `platformShell.js`.

## Expected Result
In sample 1902 Workspace Manager, SVG Asset Studio badge shows:

`Asset: sample-0901-ship.svg`

or the exact `vectorAssetDocument.sourceName` from the hosted payload.

## Validation
Run targeted checks:
- `node --check tools/shared/platformShell.js`
- `node --check "tools/Workspace Manager/main.js"`
- `node --check "tools/SVG Asset Studio/main.js"`

Manual:
- Open sample 1902.
- Launch Workspace Manager.
- Mount SVG Asset Studio.
- Confirm badge no longer shows `Asset: none`.

Full samples smoke:
- Skip by default.
- Reason: this is a targeted hosted-shell badge source fix; full samples test takes about 20 minutes and is not required.
