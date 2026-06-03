# BUILD_PR_11_193_V2_HTML_FIRST_BATCH

## Objective
Perform a batch correction for the active V2 tools so the UI shell lives in HTML and JavaScript remains behavior-only.

## Files Codex May Modify
Only these folders may be modified if present:

- `toolbox/palette-manager-v2/`
- `toolbox/svg-asset-studio-v2/`
- `toolbox/vector-map-editor-v2/`
- `toolbox/tilemap-studio-v2/`
- `toolbox/asset-manager-v2/`
- `docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status markers only
- `docs_build/dev/reports/` for evidence only

## Files Codex Must Not Modify
- schemas
- samples
- games
- Workspace Manager v1
- legacy tools without `-v2`
- `platformShell`
- `toolbox/shared/*`
- root `/index.html`
- `/toolbox/index.html`

## Implementation Requirements
For each active V2 tool folder listed above that exists:

1. Ensure `index.html` contains:
   - document title ending with `V2`
   - stylesheet links to:
     - `../../src/engine/theme/main.css`
     - `../../src/engine/ui/hubCommon.css`
   - `<body data-tool-id="<tool-id>-v2">`
   - `<div id="shared-theme-header"></div>`
   - a static `<main class="page-shell">` shell
   - static tool UI containers and ids needed by `index.js`
   - `<script type="module" src="../../src/engine/theme/mount-shared-header.js"></script>`
   - `<script type="module" src="./index.js"></script>`

2. Ensure `index.js` does not contain:
   - `document.body.innerHTML`
   - `document.head.insertAdjacentHTML`
   - inline `<style>` string injection
   - dynamic creation of the shared header script
   - full page shell construction
   - legacy v1 aliases
   - fallback data

3. Ensure `index.js` may:
   - set `document.title`
   - set or verify `document.body.dataset.toolId`
   - read session data only
   - validate the session contract
   - populate existing DOM nodes
   - render tool output into existing containers
   - show empty/error state in existing containers

4. Tool naming must be explicit:
   - `Palette Manager V2`
   - `SVG Asset Studio V2`
   - `Vector Map Editor V2`
   - `Tilemap Studio V2`
   - `Asset Browser V2`

## Validation Commands
Run targeted checks only:

```powershell
node --check toolbox/palette-manager-v2/index.js
node --check toolbox/svg-asset-studio-v2/index.js
node --check toolbox/vector-map-editor-v2/index.js
node --check toolbox/tilemap-studio-v2/index.js
node --check toolbox/asset-manager-v2/index.js
```

If a listed folder does not exist yet, record it as `NOT PRESENT - SKIPPED` in the report and do not create unrelated scaffolding unless this PR's tool folder already exists in the active V2 lane.

## Full Samples Smoke Test
Do not run the full samples smoke test. It is skipped because this PR is limited to isolated V2 tool entry shells and behavior-only JS separation, not shared sample loader/framework logic.

## Roadmap Rule
Update `docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status markers only if execution-backed. Do not rewrite roadmap text.
