# Tool Migration Prioritization

PR: PR_26152_120-tool-migration-prioritization
Date: 2026-06-02

## Scope

- Defined tool migration priority order.
- Grouped tools by dependency, risk, and ProjectWorkspace readiness.
- Did not fix tools.
- Did not run tool runtime tests as blockers.

## Prioritization Rules

- Prefer tools with read-only or explicit input/output boundaries before content editors.
- Prefer tools with existing V2 folders and schema references before older folder-based tools.
- Prefer low ProjectWorkspace payload ownership risk before tools that own assets, palettes, maps, or publishable content.
- Keep currently ProjectWorkspace-launchable tools out of migration blocker lists.
- Keep unmigrated tools as SKIP / not migrated until their exact PR names them.

## Already ProjectWorkspace Launchable

No migration priority is assigned to these tools in this lane because they are already in the current ProjectWorkspace child launch list:

- `asset-manager-v2`
- `palette-manager-v2`
- `object-vector-studio-v2`
- `world-vector-studio-v2`
- `collision-inspector-v2`
- `input-mapping-v2`
- `preview-generator-v2`
- `text2speech-V2`
- `audio-sfx-playground-v2`
- `midi-studio-v2`
- `storage-inspector-v2`

`workspace-manager-v2` remains the ProjectWorkspace host/bootstrap surface.

## Priority Order

| Priority | Tools | Dependency / Risk / Readiness |
| --- | --- | --- |
| Wave 1 | `state-inspector`, `replay-visualizer`, `performance-profiler`, `physics-sandbox`, `3d-json-payload`, `3d-asset-viewer` | Lower write risk, mostly viewer/inspector/utility surfaces, suitable for explicit ProjectWorkspace launch inputs and boundary validation. |
| Wave 2 | `tile-map-editor`, `parallax-editor`, `sprite-editor`, `asset-pipeline`, `3d-camera-path-editor` | Higher content ownership and Tool State/payload risk; requires stricter save/open/palette/asset boundaries. |
| Future activation backlog | `asset-studio`, `game-builder`, `game-design-studio`, `publish-studio`, `animation-studio`, `particle-studio`, `sound-studio`, `ai-assistant`, `code-studio`, `input-studio`, `localization-studio` | Contracted planning surfaces not active in the current registry; scope when a future PR explicitly activates or migrates them. |

## Non-Blockers

- Tool runtime tests are not blockers for this prioritization PR.
- Unmigrated tools are not failures.
- Samples remain SKIP / pending rebuild.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- docs/report prioritization only.

## Lanes Skipped

- runtime - no tool runtime code changed.
- tool runtime tests - not required and not run.
- samples - SKIP / pending rebuild.
- Playwright - not impacted.

## Samples Decision

SKIP / pending rebuild. No samples were touched.

## Tools Decision

Only future PRs that name exact tools should validate tool runtime behavior, and only for those migrated tools.
