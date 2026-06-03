# PR_26139_025-schema-regression-followup

## Summary
- Normalized Workspace Manager V2 schema reference loading through one recursive external `$ref` registry builder.
- Updated game manifest and generated workspace manifest validation to resolve referenced tool schemas relative to their owning schema roots.
- Removed the duplicate generated-workspace shallow validation plus separate tool-payload validation path.
- Added a Workspace Manager V2 regression proving workspace schema refs validate `asset-manager-v2` and `palette-manager-v2` payloads without unresolved-ref errors.

## Scope Notes
- Changed only Workspace Manager V2 schema validation/discovery code and targeted Workspace Manager V2 Playwright coverage.
- Tool schemas and game manifests were not changed.
- Status-log spam cleanup was handled by removing the repeated validation path; no unrelated UI logging behavior was changed.

## Validation
- PASS: `npm run build:manifest`
- PASS: `node scripts\validate-json-contracts.mjs --mode=games --details`
  - `game_manifest_schema_validation: total=11 invalid=0`
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "resolves workspace manifest tool schema refs|resolves game manifest schema refs"`
  - 2 passed.
- PASS: `npm run test:workspace-v2`
  - 58 passed.

## Workspace Manager Checks
- Select Repo path is covered by Workspace Manager V2 Playwright.
- Game dropdown validation confirmed all 11 schema-valid games populate:
  `AITargetDummy`, `Asteroids`, `Bouncing-ball`, `Breakout`, `GravityWell`, `Pacman`, `Pong`, `SolarSystem`, `SpaceDuel`, `SpaceInvaders`, `vector-arcade-sample`.
- Regression assertions confirm no unresolved `asset-manager-v2.schema.json` or `palette-manager-v2.schema.json` refs appear during repo discovery.
- Generated workspace validation now reports real schema failures for invalid Asset Manager V2 and Palette Manager V2 payload fields instead of unresolved schema refs.

## Coverage
- Playwright impacted: Yes.
- V8 coverage report includes changed runtime JS:
  `(93%) toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js - executed lines 1778/1778; executed functions 156/168`

## Full Samples
- Full samples smoke test was skipped.
- Reason: scope is limited to Workspace Manager V2 schema validation/discovery stabilization; full Workspace V2 Playwright and all game manifest validation cover the impacted paths.

## Manual Validation
1. Open Workspace Manager V2.
2. Click `Pick Repo Folder` and select the repo root.
3. Confirm the Game dropdown populates with all schema-valid games, including `Asteroids` and `AITargetDummy`.
4. Confirm the Status log has no unresolved `asset-manager-v2.schema.json` or `palette-manager-v2.schema.json` messages.
5. Select `Asteroids` and confirm workspace JSON is generated and tools remain launchable.
