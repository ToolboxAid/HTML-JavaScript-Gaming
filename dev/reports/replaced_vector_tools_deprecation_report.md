# PR_26140_082 Replaced Vector Tools Deprecation Report

## Summary
- Removed the deprecated `toolbox/SVG Asset Studio` tool folder and ZIP package.
- Removed the deprecated `toolbox/Vector Map Editor` tool folder and ZIP package.
- Migrated active SVG Asset Studio launch, registry, sample mapping, workspace, and docs references to Object Vector Studio V2.
- Migrated active Vector Map Editor launch, registry, sample mapping, workspace, and docs references to World Vector Studio V2.
- Added World Vector Studio V2 to the Workspace Manager V2 launch surface.
- Removed the duplicate Planned Next Asset Manager V2 card from the tools index.

## Tool Replacement Mapping
- SVG Asset Studio -> Object Vector Studio V2.
- Vector Map Editor -> World Vector Studio V2.

## Description Updates
- Object Vector Studio V2 is described as the tool for building vector assets.
- World Vector Studio V2 is described as the tool for placing assets, maps, layers, parallax, and scene/world layout.

## Workspace And Launch Wiring
- `toolbox/toolRegistry.js` no longer registers `svg-asset-studio` or `vector-map-editor`.
- `toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js` now exposes World Vector Studio V2 as a workspace-launchable editor.
- `toolbox/workspace-manager-v2/js/controls/ToolTilesControl.js` now describes World Vector Studio V2 with scene/world layout language.
- `samples/samples.to.tools.json` maps the replaced tool categories to the V2 tools.
- Active sample launch links now route to Object Vector Studio V2 or World Vector Studio V2 while preserving sample JSON content.

## Intentional Scope Boundaries
- No schema files were changed.
- Sample JSON files were not changed. Existing sample preset filenames that include old tool names remain as historical sample data and were not rewritten.
- Historical/archive documentation references are preserved where they are not active launch, registry, or workspace wiring.
- Negative tests may reference deleted legacy paths only to verify that the old tools are no longer active launch targets.

## Validation
- `git diff --check` passed.
- Targeted JavaScript syntax/import validation for changed active runtime/tool/test files passed.
- Targeted JSON parse validation for changed registry/mapping/config files passed.
- Tool registry validation confirmed Object Vector Studio V2 and World Vector Studio V2 are registered, and SVG Asset Studio and Vector Map Editor are not registered.
- `npm run test:workspace-v2` passed.
- Tool launch validation confirmed launch definitions and index files exist for:
  - Object Vector Studio V2
  - World Vector Studio V2
  - Asset Manager V2
  - Workspace Manager V2
- Legacy tool path validation confirmed the removed tool folders and ZIPs are absent.
- Active old-path reference validation found only intentional negative-test and historical-doc references.
- Planned Next validation confirmed there is no duplicate Asset Manager V2 card.

## Full Samples Smoke Test
- Not run. This PR is limited to replaced tool deprecation and launch/wiring migration; full samples smoke was explicitly out of scope.
