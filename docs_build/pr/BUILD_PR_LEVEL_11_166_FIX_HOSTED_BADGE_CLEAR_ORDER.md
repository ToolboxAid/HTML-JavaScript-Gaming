# BUILD_PR_LEVEL_11_166_FIX_HOSTED_BADGE_CLEAR_ORDER

## Purpose
Fix the SVG Asset Studio hosted badge by correcting launch-state clear order instead of adding more SVG/tool/schema logic.

## Confirmed Finding
The repo dump shows the payload path is already good, but the hosted shell clears the handoff before rendering the badge.

Flow:
1. Workspace Manager reads `payload.vectorAssetDocument`.
2. Workspace Manager derives the label from `sourceName` or inline SVG.
3. Workspace Manager writes shared asset handoff.
4. ToolHostRuntime launches SVG Asset Studio with `hosted=1` and `hostContextId`.
5. SVG Asset Studio iframe initializes `tools/shared/platformShell.js`.
6. `platformShell.js` calls `clearSharedBindingsForNewLaunch(...)`.
7. That clears `toolboxaid.shared.assetHandoff`.
8. Badge renders from `readSharedAssetHandoff()` and shows `Asset: none`.

## Scope
One PR purpose only: stop hosted tool shell initialization from clearing Workspace Manager handoff before hosted badge render.

## Codex Implementation Requirements
1. Update `tools/shared/platformShell.js` only unless a directly related validation doc/report is needed.
2. Hosted Workspace Manager iframe launches must not clear shared asset/palette handoffs written by the parent Workspace Manager.
3. Detect hosted launches using existing URL facts:
   - `hosted=1`
   - `hostToolId`
   - `hostContextId`
4. Preserve standalone/new top-level tool launch cleanup behavior.
5. Do not modify schemas.
6. Do not modify sample 1902 JSON.
7. Do not modify SVG Asset Studio payload parsing.
8. Do not add fallback data or guessed asset names.
9. Do not broaden to other tools.

## Acceptance
- Launch sample 1902 Workspace Manager.
- Mount SVG Asset Studio.
- Badge shows `Asset: sample-0901-ship.svg` or the actual `vectorAssetDocument.sourceName`.
- Browser console has no new errors.
- Targeted syntax checks pass.
- Full samples smoke is skipped with documented reason.
