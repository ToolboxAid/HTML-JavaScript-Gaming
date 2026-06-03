# PR 11.164 Badge Ownership Map

## Question
Who owns the visible `Asset: none` text: Workspace Manager tile state, shared shell badge rendering, or SVG Asset Studio state export?

## Ownership Verdict
- Primary owner: `tools/shared/platformShell.js`
- Owner function: `renderToolAssetBadge(toolId)`
- Owner call sites: `renderToolLinks(currentToolId)` row templates that call `renderToolAssetBadge(tool.id)`

## Exact Emit Path
1. `renderToolLinks(...)` builds visible tool rows/cards.
2. Each row calls `renderToolAssetBadge(tool.id)`.
3. `renderToolAssetBadge` emits template text:
- `Asset: ${nonAssetLabel}` for non-asset branch.
- `Asset: ${assetLabel}` for main branch.
4. When no compatible label resolves, branch fallback becomes `none`, producing visible `Asset: none`.

## Input Contract Consumed By Emitter
### Contract A: shared handoff storage
- Reader: `readSharedAssetHandoff()` from `tools/shared/assetUsageIntegration.js`
- Backing key: `toolboxaid.shared.assetHandoff`
- Normalized mandatory fields: `assetId`, `sourcePath`
- Label fields considered by shell: `displayName`, `sourceName`, `name`, `label`, `path`, `sourcePath`
- Compatibility fields considered: `assetType`, `kind`, `type`

### Contract B: hosted context payload (SVG-specific)
- Reader: `readToolHostSharedContextFromLocation(window.location)`
- Path: `sharedContext.payloadJson.vectorAssetDocument.sourceName`
- Fallback within same payload path: `vectorAssetDocument.svgText -> Inline SVG`

### Contract C: workspace preset-derived SVG label caches (shell-local)
- Scoped preset path (when available): `workspaceScopedToolPresetForStatus[...].vectorAssetDocument.sourceName`
- Manifest preset path (shell-local cache): `tools["svg-asset-studio"].vectorAssetDocument.sourceName`

## Responsibility Split
- Workspace Manager responsibility: write handoff payloads and launch hosted tool context.
- SVG Asset Studio responsibility: consume SVG payload and render tool UI/status.
- Shared shell responsibility: render visible tool-row `Asset:` badge text.

## Practical Conclusion
- The visible `Asset: none` symptom is owned at the shared-shell renderer boundary.
- Workspace Manager and SVG Asset Studio can both succeed while badge text remains `none` if shared-shell row resolution does not map the active label contract at render time.

## Smallest Next Fix Candidate
- Restrict next change to `tools/shared/platformShell.js`.
- For `toolId === "svg-asset-studio"`, resolve label from the active workspace manifest node (`getManifest()?.tools?.[toolId]?.vectorAssetDocument.sourceName`) before generic `none` fallback.
- Keep contracts unchanged; no schema/sample/SVG payload rewrites.

## Smallest Rollback Candidate
- If fixing is deferred, rollback only SVG-specific shell label branches added after PR 11.158 while preserving baseline handoff rendering path.