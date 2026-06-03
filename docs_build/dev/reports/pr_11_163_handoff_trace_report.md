# PR 11.163 Handoff Trace Report

## Scope And Freeze Outcome
- Freeze mode respected.
- No implementation behavior changed in this pass.
- No schema/sample/SVG Asset Studio/fallback-path edits were made for PR 11.163.

## Validation Commands Run
- `git status --short`
- `git diff --name-only HEAD`
- targeted `rg` on: `Asset: none`, `Asset:`, `sourceName`, `vectorAssetDocument`, badge renderers

## Changed Files Since Last Commit
From `git diff --name-only HEAD` (tracked changes):
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/active_asset_tile_renderer_11_159.txt`
- `docs_build/dev/reports/pr_11_162_dead_wiring_report.txt`
- `docs_build/dev/reports/pr_11_162_evidence_template.txt`
- `docs_build/dev/reports/shared_shell_svg_asset_badge_11_160.txt`
- `docs_build/dev/reports/svg_payload_to_shared_asset_badge_11_161.txt`
- `docs_build/pr/BUILD_PR_LEVEL_11_159_FIX_ACTIVE_SHARED_ASSET_TILE_RENDERER.md`
- `docs_build/pr/BUILD_PR_LEVEL_11_160_FIX_SHARED_SHELL_SVG_ASSET_BADGE_COMPATIBILITY.md`
- `docs_build/pr/BUILD_PR_LEVEL_11_161_WIRE_SVG_PAYLOAD_TO_SHARED_ASSET_BADGE.md`
- `docs_build/pr/PR_11_162.md`
- `tools/shared/platformShell.js`

Additional untracked files from `git status --short`:
- `docs_build/dev/reports/pr_11_163_delivery_manifest.md`
- `docs_build/pr/PR_11_163_FREEZE_BADGE_CHURN_AND_TRACE_HANDOFF.md`

## Exact Renderer Emitting Visible `Asset: none`
Primary owner path is shared shell (not SVG tool UI, not Workspace Manager tile component):
- File: `tools/shared/platformShell.js`
- Function: `renderToolAssetBadge(toolId)`
- Template emission:
  - Non-asset tools branch: ``Asset: ${nonAssetLabel}`` (line region ~1449)
  - Main branch: ``Asset: ${assetLabel}`` (line region ~1483)
- Call site used in visible tool rows/tiles:
  - `renderToolLinks(currentToolId)` maps tool rows and calls `renderToolAssetBadge(tool.id)` (line regions ~1581-1584 and ~1644-1646)

Conclusion: the displayed `Asset: none` text is emitted by shared shell tool-row markup in `platformShell.js`.

## Input Contract Read By That Renderer
`renderToolAssetBadge(toolId)` reads these contracts, in order:
1. Shared asset handoff from storage:
- API: `readSharedAssetHandoff()` from `tools/shared/assetUsageIntegration.js`
- Storage key: `toolboxaid.shared.assetHandoff`
- Normalized required fields: `assetId`, `sourcePath`
- Normalized optional fields used by badge logic: `assetType`, `displayName`, `selectedAt`
- Compatibility check fields in shell: `asset.assetType || asset.kind || asset.type`

2. SVG-specific hosted payload label path:
- `readToolHostSharedContextFromLocation(window.location)`
- `hostContext.sharedContext.payloadJson.vectorAssetDocument.sourceName` (or `svgText` => `Inline SVG`)

3. SVG-specific workspace preset label paths currently present in shell:
- `workspaceScopedToolPresetForStatus.payload.vectorAssetDocument.sourceName` (or `svgText`)
- direct manifest preset read: `rawPreset.tools["svg-asset-studio"].vectorAssetDocument.sourceName` (or `svgText`)

## Ownership Finding (Who Actually Owns The Badge)
- Badge/tile text owner: `tools/shared/platformShell.js` shared shell renderer.
- Workspace Manager role: writes shared handoff (`writeSharedAssetHandoff`) when launching/mounting payloads.
- SVG Asset Studio role: consumes payload and renders editor/status internally; it does not render the shared shell `Asset:` tile text.

## Why Churn Happened (Observed Contract Mismatch)
The visible row/tile badge is rendered for many tools via `renderToolLinks(...tool.id...)`, but SVG fallback label sources in shell are page-context globals (`workspaceScopedToolPresetForStatus`, hosted context on current URL), not guaranteed per-row/per-tool inputs.

Net effect:
- Tool content can load correctly in SVG Asset Studio.
- Shared shell row badge can still resolve to `none` when row-level renderer does not have a matching per-tool contract instance at render time.

## Smallest Next Recommendation
Recommended smallest next PR (fix, not rollback):
1. Keep owner in shared shell.
2. In `renderToolAssetBadge(toolId)`, for `toolId === "svg-asset-studio"` when shared handoff is absent/incompatible, derive the label from the active workspace manifest per-tool node (row-scoped):
- `getManifest()?.tools?.[toolId]?.vectorAssetDocument?.sourceName`
- fallback only to `Inline SVG` when that same node has `svgText`.
3. Do not alter schemas/samples/SVG tool behavior.

Why this is smallest:
- Single-file, owner-correct wiring in `tools/shared/platformShell.js`.
- No contract shape changes.
- Aligns row renderer input with the same per-tool manifest object already present in workspace state.

## Smallest Rollback Alternative (If Fix Is Deferred)
If immediate fix is deferred, rollback only the SVG-specific badge derivation additions in `tools/shared/platformShell.js` introduced across PR 11.160-11.162 attempts, while keeping baseline shared handoff behavior intact. Do not perform a broad reset.

## Targeted Validation For Next PR
- `node --check tools/shared/platformShell.js`
- launch Sample 1902 -> Workspace Manager path
- verify `renderToolAssetBadge("svg-asset-studio")` displays `Asset: sample-0901-ship.svg`
- no full samples smoke