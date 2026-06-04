# BUILD_PR_11_189B_SVG_V2_SHARED_THEME_HEADER_CORRECTION

## Goal
Revise SVG Asset Studio v2 so its top header matches `/index.html` by using the existing shared theme header mount and source conventions.

## Files Codex may edit
- `toolbox/SVG Asset Studio v2/main.js`

## Files Codex must not edit
- schemas
- samples
- games
- Workspace Manager v1 files
- `platformShell` files
- `src/shared/toolbox/*`
- legacy Palette Browser files
- Palette Manager files
- start_of_day folders

## Implementation constraints
- Keep one class.
- Keep one file.
- Do not add helper classes.
- Do not add alias variables.
- Do not add abstraction layers.
- Do not copy old v1 code.
- Do not fetch tool data.
- Do not add fallback/default payloads.
- Session-backed data only.

## Required edits
1. Replace the ad-hoc SVG v2 header block with the same header mount used by `/index.html`:

```html
<div id="shared-theme-header"></div>
```

2. Preserve `src/engine/theme` usage.
3. Use existing accordion/content styling only below the shared header mount.
4. Keep the two v2 menus separated:
   - `menuTool` for SVG-specific actions/readout.
   - `menuWorkspace` for workspace-only actions/readout.
5. Keep the expected logs:
   - `[SVG_V2_ENTRY]`
   - `[SESSION_CONTEXT_READ]`
   - `[SVG_V2_CONTRACT_LOADED]`

## Test commands
Run targeted validation only:

```powershell
node --check "toolbox/SVG Asset Studio v2/main.js"
```

Manual browser validation:
- Open SVG Asset Studio v2 direct with no `hostContextId`.
- Confirm empty state is visible and actionable.
- Open with valid session context.
- Confirm SVG renders.
- Confirm header/image visually matches `/index.html`.
- Confirm no v1/platformShell/workspace-v1 coupling.

## Full samples smoke decision
Skipped. This PR changes one v2 tool entry file only and does not modify shared sample loading, schemas, samples, games, or workspace-v1 wiring.

## Roadmap update
Update only execution-backed status markers if an existing roadmap item exactly matches this SVG Asset Studio v2 migration correction. Do not rewrite, move, delete, or reflow roadmap text.
