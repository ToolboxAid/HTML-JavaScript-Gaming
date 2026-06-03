# Tool Migration Inventory

PR: PR_26152_119-tool-migration-inventory
Date: 2026-06-02

## Scope

- Inventoried migrated vs unmigrated tools.
- Marked unmigrated tools as SKIP / not migrated.
- Did not classify unmigrated tools as failures.
- Did not modify tool runtime code.
- Did not touch samples.

## Sources

- `src/shared/contracts/tools/toolContractsIndex.js`
- `tools/toolRegistry.js`
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`

## Summary

- First-class tool contracts: 34.
- Active tool registry entries: 23.
- Current ProjectWorkspace child-launchable tools: 11.
- ProjectWorkspace host/bootstrap tool: 1.
- Active registry tools not yet ProjectWorkspace child-launchable: 11, SKIP / not migrated.
- Contract-only backlog tools not active in the current registry: 11, SKIP / not migrated.
- `templates-v2` appears in the ProjectWorkspace launch list as a support template, not a first-class tool contract.

## ProjectWorkspace Migrated / Launchable

| Tool ID | Status | Notes |
| --- | --- | --- |
| `asset-manager-v2` | migrated / ProjectWorkspace launchable | Current launch list includes explicit ProjectWorkspace child launch path. |
| `palette-manager-v2` | migrated / ProjectWorkspace launchable | Current launch list includes explicit ProjectWorkspace child launch path. |
| `object-vector-studio-v2` | migrated / ProjectWorkspace launchable | Current launch list includes explicit ProjectWorkspace child launch path. |
| `world-vector-studio-v2` | migrated / ProjectWorkspace launchable | Current launch list includes explicit ProjectWorkspace child launch path. |
| `collision-inspector-v2` | migrated / ProjectWorkspace launchable | Current launch list includes explicit ProjectWorkspace child launch path. |
| `input-mapping-v2` | migrated / ProjectWorkspace launchable | Current launch list includes explicit ProjectWorkspace child launch path. |
| `preview-generator-v2` | migrated / ProjectWorkspace launchable | Current launch list includes explicit ProjectWorkspace child launch path. |
| `text2speech-V2` | migrated / ProjectWorkspace launchable | Current launch list includes explicit ProjectWorkspace child launch path. |
| `audio-sfx-playground-v2` | migrated / ProjectWorkspace launchable | Current launch list includes explicit ProjectWorkspace child launch path. |
| `midi-studio-v2` | migrated / ProjectWorkspace launchable | Current launch list includes explicit ProjectWorkspace child launch path. |
| `storage-inspector-v2` | migrated / ProjectWorkspace launchable | Current launch list includes explicit ProjectWorkspace child launch path. |

## ProjectWorkspace Host / Support

| Tool ID | Status | Notes |
| --- | --- | --- |
| `workspace-manager-v2` | ProjectWorkspace host/bootstrap | Coordinates ProjectWorkspace launch context; not treated as a child-launched tool. |
| `templates-v2` | support template | Launchable template surface; not a first-class tool contract. |

## Active Registry Tools Not Yet Migrated

These tools are SKIP / not migrated / out of scope for this inventory PR. They are not failures.

| Tool ID | Status | Notes |
| --- | --- | --- |
| `tile-map-editor` | SKIP / not migrated | Active registry entry, not in current ProjectWorkspace launch list. |
| `parallax-editor` | SKIP / not migrated | Active registry entry, not in current ProjectWorkspace launch list. |
| `sprite-editor` | SKIP / not migrated | Active registry entry, not in current ProjectWorkspace launch list. |
| `state-inspector` | SKIP / not migrated | Active registry entry, not in current ProjectWorkspace launch list. |
| `replay-visualizer` | SKIP / not migrated | Active registry entry, not in current ProjectWorkspace launch list. |
| `performance-profiler` | SKIP / not migrated | Active registry entry, not in current ProjectWorkspace launch list. |
| `physics-sandbox` | SKIP / not migrated | Active registry entry, not in current ProjectWorkspace launch list. |
| `asset-pipeline` | SKIP / not migrated | Active registry entry, not in current ProjectWorkspace launch list. |
| `3d-json-payload` | SKIP / not migrated | Active registry entry, not in current ProjectWorkspace launch list. |
| `3d-asset-viewer` | SKIP / not migrated | Active registry entry, not in current ProjectWorkspace launch list. |
| `3d-camera-path-editor` | SKIP / not migrated | Active registry entry, not in current ProjectWorkspace launch list. |

## Contract-Only Backlog

These first-class tool contracts are SKIP / not migrated until a future PR activates them in the current registry or explicitly scopes them into a migration wave. They are not failures.

| Tool ID | Status |
| --- | --- |
| `asset-studio` | SKIP / not migrated |
| `game-builder` | SKIP / not migrated |
| `game-design-studio` | SKIP / not migrated |
| `publish-studio` | SKIP / not migrated |
| `animation-studio` | SKIP / not migrated |
| `particle-studio` | SKIP / not migrated |
| `sound-studio` | SKIP / not migrated |
| `ai-assistant` | SKIP / not migrated |
| `code-studio` | SKIP / not migrated |
| `input-studio` | SKIP / not migrated |
| `localization-studio` | SKIP / not migrated |

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- docs/report inventory only.

## Lanes Skipped

- runtime - no tool runtime code changed.
- tool runtime tests - not required and not run.
- samples - SKIP / pending rebuild.
- Playwright - not impacted.

## Samples Decision

SKIP / pending rebuild. No samples were touched.

## Tools Decision

Unmigrated tools are SKIP / not migrated / out of scope and are not failures.
