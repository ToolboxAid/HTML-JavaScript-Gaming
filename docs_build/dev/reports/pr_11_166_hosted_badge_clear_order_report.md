# PR 11.166 Hosted Badge Clear Order Report

## Result
Implemented the targeted shared shell clear-order fix in `toolbox/shared/platformShell.js`.

## Root Cause
Hosted Workspace Manager iframe launches forward launch context such as `samplePresetPath`, `hosted=1`, `hostToolId`, and `hostContextId`.

Before this pass, the hosted iframe shell still called `clearSharedBindingsForNewLaunch(...)` from `initPlatformShell()`. When the forwarded launch signature changed, that path cleared:

- `toolboxaid.shared.assetHandoff`
- `toolboxaid.shared.paletteHandoff`

That removed the handoff written by Workspace Manager before the shared shell badge rendered.

## Change
Added `isHostedToolLaunch(searchParams)` and skipped `clearSharedBindingsForNewLaunch(...)` when the current shell is hosted by Workspace Manager.

Hosted launch detection uses existing URL facts:

- `hosted=1`
- `hostToolId`
- `hostContextId`

Standalone launches still run the existing cleanup path.

## Files Changed
- `toolbox/shared/platformShell.js`
- `docs_build/dev/reports/pr_11_166_hosted_badge_clear_order_report.md`

## Validation
- `node --check toolbox/shared/platformShell.js`
- `node --check "toolbox/Workspace Manager/main.js"`
- `node --check "toolbox/SVG Asset Studio/main.js"`

## Full Samples Smoke
Skipped.

Reason: targeted shared shell badge clear-order fix; full samples test takes about 20 minutes and is not required.
