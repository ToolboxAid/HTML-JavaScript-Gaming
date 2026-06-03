# PR_26127_004-workspace-manager-v2-return-context-and-tool-launch-fixes

## Scope
- Updated Workspace Manager V2, workspace-launched V2 tool handoff, and related Playwright coverage.
- Did not modify deprecated `toolbox/workspace-v2`.
- Did not modify sample JSON.
- Did not add fallback behavior.

## Workspace Manager V2 Notes
- Increased Workspace Context tile minimum height and removed internal tile scrolling.
- Aligned Workspace Context tile content to the top.
- Removed the self-launching Workspace Manager V2 tool tile from the Workspace Manager V2 tool launcher.
- Preserved temporary UAT mode on Return to Workspace by passing a launch-only `workspaceMode=uat` marker and returning to `?workspace=uat`.

## Tool Launch Notes
- Palette Manager V2 now reads the Workspace Manager V2 session manifest on workspace launch and imports `tools.palette-manager-v2.swatches` into the active user palette.
- Preview Generator V2 now hydrates workspace launch context by setting Repo selected display, Target Source `games`, asset folder from `assetsPath`, the active game path, and Status log hydration events.
- Preview Generator V2 loads Last Generated Image from `/games/<game>/assets/preview.svg` when that preview file is present.
- Asset Manager V2 launch guard now includes a Return to Tools button for unavailable/direct-launch states.

## Validation
- PASS: JS syntax checks for changed runtime and Playwright files.
- PASS: `npx playwright test tests/playwright/tools/AssetManagerV2.spec.mjs tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list` completed with 17 passed tests.
- PASS: `npm run test:workspace-v2` completed with 24 passed tests.
- PASS: `git diff --check`.
- PASS: Scope check found no diffs under deprecated `toolbox/workspace-v2` or sample schema paths.
- SKIPPED: Full samples smoke test, per PR instructions. This PR is Workspace Manager V2 context/tool launch scoped.

## Manual Validation Notes
- Open `toolbox/workspace-manager-v2/index.html?workspace=uat`, seed UAT, launch Asset Manager V2, then Return to Workspace; the Workspace Manager URL should preserve `workspace=uat`.
- Load Asteroids in Workspace Manager V2; Tool tiles should omit Workspace Manager V2 and include Templates V2, Asset Manager V2, Palette Manager V2, and Preview Generator V2.
- Launch Palette Manager V2 from Workspace Manager V2; active workspace palette swatches should display in the user palette.
- Launch Preview Generator V2 from Workspace Manager V2; Repo selected, Target Source, asset folder, paths, Status log hydration, and existing preview image behavior should reflect the active workspace context.
- Direct-launch Asset Manager V2 unavailable state should show Return to Tools.
