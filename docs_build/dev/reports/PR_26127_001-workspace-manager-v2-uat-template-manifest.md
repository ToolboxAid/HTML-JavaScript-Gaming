# PR_26127_001-workspace-manager-v2-uat-template-manifest

## Scope

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Renamed the template source manifest from `games/_template/game.manifest.json` to `games/_template/workspace-manager-v2-template.manifest.json`.
- Added real UAT manifest `games/_template/workspace-manager-v2-UAT.manifest.json`.
- Updated Workspace Manager V2 UAT button flow to load the real UAT manifest from disk instead of constructing UAT manifest data in code.
- Updated new-game scaffold logic so generated games still receive `game.manifest.json` created from `workspace-manager-v2-template.manifest.json`.
- Added canonical V2 launch tiles for `toolbox/templates-v2`, `toolbox/asset-manager-v2`, `toolbox/workspace-manager-v2`, `toolbox/palette-manager-v2`, and `toolbox/preview-generator-v2`.

## Validation

- `npm run test:workspace-v2` - PASS, 24 Playwright tests.
- Explicit schema validation:
  - `games/_template/workspace-manager-v2-UAT.manifest.json` - PASS against `toolbox/schemas/workspace.manifest.schema.json`.
  - `games/_template/workspace-manager-v2-template.manifest.json` - PASS against `toolbox/schemas/workspace.manifest.schema.json`.
- `git diff --check` - PASS with only Git line-ending warnings.
- Full samples smoke test skipped by request; this PR is Workspace V2/tool UAT scoped.

## Playwright Impacted

Yes. This PR changes Workspace Manager V2 UAT loading, workspace tool launch tiles, and Tool Template V2 workspace nav when launched from Workspace Manager V2.

Validated behavior:
- UAT button loads `games/_template/workspace-manager-v2-UAT.manifest.json`.
- Asset Manager V2 no longer receives direct `?workspace=UAT` access and still launches through Workspace Manager V2 session/context.
- Five canonical V2 tool tiles render and become launch-ready after a schema-valid manifest is active.
- Tool Template V2 launched from Workspace Manager V2 shows only `Return to Workspace`.
- Workspace Manager V2 self tile restores the active session by `hostContextId`.
- Import/export manifest behavior remains schema-gated.

Expected pass behavior:
- Workspace Manager V2 logs successful UAT manifest load from `games/_template/workspace-manager-v2-UAT.manifest.json`.
- Canonical V2 tiles launch through session/context without direct workspace query fallback.
- Return to Workspace restores the active manifest/session.

Expected fail behavior:
- Direct Asset Manager V2 workspace query launch remains blocked by the launch guard.
- Invalid manifests block export and log the exact schema failure.

## Manual Validation Notes

1. Open `/toolbox/workspace-manager-v2/index.html?workspace=uat`.
2. Confirm the UAT button is visible.
3. Click UAT and confirm Status logs loading from `/games/_template/workspace-manager-v2-UAT.manifest.json`.
4. Confirm tool tiles are present for First-Class Tool Starter V2, Asset Manager V2, Workspace Manager V2, Palette Manager V2, and Preview Generator V2.
5. Launch Asset Manager V2 and confirm it opens through `launch=workspace` plus `hostContextId`, not `?workspace=uat`.
6. Use Return to Workspace and confirm the active Asteroids UAT session is restored.

Out of scope:
- Full samples smoke test.
- Deprecated `toolbox/workspace-v2`.
- Sample JSON alignment.

