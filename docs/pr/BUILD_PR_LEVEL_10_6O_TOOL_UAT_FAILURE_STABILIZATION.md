# BUILD_PR_LEVEL_10_6O_TOOL_UAT_FAILURE_STABILIZATION

## Purpose
Stabilize the exact UAT failures reported after the Level 10.6N Tool UI DoD audit.

## Scope
Fix only these observed tool readiness failures:

1. All tools: accordion sections close about 1 second after opening.
2. Asset Browser / Import Hub: shows `0 approved assets`.
3. Tilemap Studio: reports `map not loaded`; verify tile controls/data are actually loaded.
4. Vector Asset Studio:
   - palette not loaded
   - paint not loaded
   - stroke not loaded
   - samples `1215`, `1216`, `1217` load SVG Background Canvas but are missing palette.
5. Vector Map Editor:
   - no data loaded in failing samples
   - samples `1212`, `1213`, `1214` are working and must not regress.

## Non-goals
- Do not redesign tools.
- Do not add broad abstractions.
- Do not change unrelated samples.
- Do not reintroduce fallback/demo data.
- Do not use hardcoded sample paths.
- Do not modify `start_of_day` folders.
- Do not rewrite roadmap text.

## Required Codex Investigation
Codex must inspect the actual files that own each failing behavior before editing:

- accordion/open-close behavior for shared tool panels and all tool accordions
- asset-browser/import-hub approved asset source and filtering logic
- tilemap studio sample loader, map document binding, tile palette binding, and selected tile binding
- vector asset studio sample loader, SVG canvas binding, palette binding, paint binding, and stroke binding
- vector map editor sample loader and data binding for failing samples while preserving samples `1212`, `1213`, `1214`

## Implementation Requirements

### 1. Accordion stability
- Opening an accordion must persist until the user closes it or changes to another exclusive section intentionally.
- Remove or correct any timer, delayed refresh, rerender, default-state reset, or load callback that collapses accordions after about 1 second.
- Do not mask the issue with CSS only if state is still resetting.

### 2. Asset Browser / Import Hub approved assets
- Determine why the approved asset list is empty.
- Approved assets must come from explicit manifest/input data or an explicit approved asset catalog.
- If no approved assets are declared, show a safe empty state explaining the missing required source.
- Do not fabricate approved assets.

### 3. Tilemap Studio readiness
- A loaded tilemap sample must populate:
  - map document/state
  - map canvas
  - tile palette/grid when tile data is declared
  - selected tile from first valid tile when available
  - layer list/status
- If a tilemap or tileset is missing, classify the exact missing field/source.
- Do not report `map not loaded` when a valid map document was fetched and parsed.

### 4. Vector Asset Studio readiness
- A loaded vector asset sample must populate:
  - SVG/background canvas
  - palette controls when a palette is declared or required
  - paint/fill control
  - stroke control
  - selected element/control state
- Samples `1215`, `1216`, `1217` must not stop at SVG Background Canvas only.
- Resolve palette strictly from declared sample/manifest data.
- Do not load hidden default palette/paint/stroke values.

### 5. Vector Map Editor readiness
- Failing vector-map samples must load their declared vector map data.
- Preserve working behavior for `1212`, `1213`, `1214`.
- Do not make a shared loader change that regresses the working samples.

## Diagnostics Requirements
For every fixed tool path, emit or extend diagnostics so the browser console can prove readiness:

```text
[tool-load:classification]
classification: success | missing | wrong-path | wrong-shape | empty | defaulted
```

and, where controls are involved:

```text
[tool-ui:control-ready]
toolId
sampleId
controlId
requiredData
loaded
value/count
classification
```

At minimum, include control-ready logs for:

- accordion open state
- asset-browser approved asset list
- tilemap map canvas
- tilemap tile palette/grid
- tilemap selected tile
- vector-asset-studio SVG canvas
- vector-asset-studio palette controls
- vector-asset-studio paint/fill control
- vector-asset-studio stroke control
- vector-map-editor document/canvas/data list

## Acceptance Criteria
Codex is done only when:

1. Accordions stay open beyond 5 seconds after user opens them.
2. Asset Browser / Import Hub no longer incorrectly reports `0 approved assets` when approved assets are declared.
3. Tilemap Studio loads map data and tile controls for valid samples.
4. Vector Asset Studio samples `1215`, `1216`, `1217` load SVG Background Canvas plus palette, paint, and stroke state.
5. Vector Map Editor failing samples load data.
6. Vector Map Editor samples `1212`, `1213`, `1214` still work.
7. No hidden fallback/demo/default data is introduced.
8. Diagnostics identify missing/wrong/empty/defaulted states explicitly.
9. The primary tests are run:

```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

10. Write a validation report at:

```text
docs/dev/reports/level_10_6o_tool_uat_failure_stabilization_report.md
```

## Roadmap Handling
- Update only status markers in `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if execution-backed.
- Do not rewrite, delete, reflow, or paraphrase roadmap content.
