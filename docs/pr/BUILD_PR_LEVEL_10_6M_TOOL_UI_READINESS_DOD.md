# BUILD_PR_LEVEL_10_6M_TOOL_UI_READINESS_DOD

## Purpose
Create a strict Definition of Done for every tool that launches from games and samples, including required data, required UI controls, diagnostics, and acceptance checks.

## Scope
- Documentation and validation guidance only.
- Do not implement UI/runtime changes in this PR.
- Do not modify start_of_day folders.
- Do not rewrite roadmap content except status-only marker progression if an execution-backed roadmap item exists.
- Keep one PR purpose: tool UI readiness DoD and Codex gap review.

## Problem
Current diagnostics can show request/fetch/load/classification, but success still needs one more layer: each visible required control must prove that it consumed loaded data. A tool is not done when a JSON file merely loads; it is done when required inputs are validated and required controls are populated from those inputs.

## Global Tool UI Readiness DoD
A tool is successful only when:

```text
manifest input loaded
required data fetched
data shape validated
required screen controls populated
controls prove they consumed loaded data
diagnostics show success per control
```

A tool is not done if:

```text
file loaded but control is empty
control uses default/demo data
control uses hardcoded values
tool reports success before UI is bound
missing data creates fake content
```

Required diagnostic shape:

```text
[tool-ui:control-ready]
toolId
controlId
requiredData
loaded
value/count
classification: success | missing | wrong-shape | empty | defaulted
```

## Sprite Editor DoD

Required data:

```text
sprite project json
palette json
```

Required controls:

```text
palette grid
Color 1 selector
Color 2 selector
active drawing color
sprite canvas
sprite/frame list
tool mode buttons
save/export controls
```

Success:

```text
palette grid populated from canonical palette
Color 1 set from palette swatch 1
Color 2 set from palette swatch 2
active drawing color = Color 1
canvas renders loaded sprite/project
sprite/frame list populated
save/export uses loaded project + palette
```

Failure:

```text
palette loaded but grid empty
Color 1/Color 2 defaulted
canvas renders before palette is bound
preset loaded but no sprite project
```

## Palette Browser DoD

Required data:

```text
canonical palette json
```

Required controls:

```text
palette title/name
swatch grid
swatch detail panel
copy/export controls
filter/search if present
```

Success:

```text
title uses palette.name
swatch grid uses palette.swatches
detail panel binds selected swatch
copy/export uses selected loaded swatch
```

Failure:

```text
uses palette-browser wrapper
swatches nested under config.palette
grid empty while palette loaded
duplicate palette source exists
```

## Animation / Sprite Animation Tool DoD

Required data:

```text
sprite project json
palette json
animation data
```

Required controls:

```text
animation list
frame list/timeline
preview canvas
play/pause controls
speed/FPS control
current frame indicator
```

Success:

```text
animation list populated
timeline populated from animation frames
preview renders frames with canonical palette
play/pause works on loaded animation
FPS control affects loaded animation
```

Failure:

```text
fake/default animation appears
timeline empty
preview renders without palette
frame references missing sprites
```

## Tilemap / Map Editor DoD

Required data:

```text
tilemap json
tileset/sprite asset json
palette json
```

Required controls:

```text
map canvas
tile palette/grid
selected tile control
layer list
map dimensions/status
save/export controls
```

Success:

```text
map canvas renders loaded tilemap
tile palette populated from loaded tileset
selected tile defaults to first valid tile
layers populated from tilemap
dimensions reflect loaded map
```

Failure:

```text
demo map appears
tile palette empty
selected tile defaulted/hardcoded
tile IDs reference missing tiles
```

## Vector Map Editor DoD

Required data:

```text
vector map json
palette json if colorized
```

Required controls:

```text
map canvas
layer/entity list
selected entity panel
color controls if palette used
zoom/pan controls
save/export controls
```

Success:

```text
canvas renders loaded vector map
layer/entity list populated
selection panel binds selected entity
color controls bind canonical palette when declared
```

Failure:

```text
hidden default vector map
empty entity list
color controls default while palette exists
```

## Vector Asset Studio DoD

Required data:

```text
vector asset json
palette json if colorized
```

Required controls:

```text
asset preview
shape/path list
selected shape editor
color controls
transform controls
save/export controls
```

Success:

```text
preview renders loaded asset
shape/path list populated
selected shape binds real asset data
color controls use canonical palette when required
```

Failure:

```text
tool creates sample asset silently
preview shows hardcoded asset
color controls defaulted
```

## Replay / Event Tool DoD

Required data:

```text
events json
```

Required controls:

```text
event list
timeline/scrubber
play/pause controls
current event display
speed control
status/result panel
```

Success:

```text
event list populated
timeline count matches events array
scrubber range matches event count/time range
playback uses loaded events
current event display updates from loaded data
```

Failure:

```text
events array missing
events empty but tool reports success
fake replay events generated
timeline empty
```

## Manifest / Data Flow Inspector DoD

Required data:

```text
manifest json
declared tool input paths
loaded tool data
```

Required controls:

```text
manifest summary
declared paths table
fetch results table
expected vs actual table
classification/status panel
```

Success:

```text
manifest summary shows loaded manifest
paths table shows declared inputs
fetch table shows every required fetch
expected vs actual table shows shape validation
status panel reports final classification
```

Failure:

```text
missing paths hidden
wrong-shape normalized away
success shown with missing inputs
```

## Workspace Manager / Launcher Tool DoD

Required data:

```text
game/sample manifest
tool declaration
required input paths
```

Required controls:

```text
workspace title
tool launch buttons
required input summary
status/error panel
```

Success:

```text
title reflects selected game/sample
launch buttons match manifest-declared tools
input summary shows all required files
status panel shows missing/wrong-shape before launch
```

Failure:

```text
launch hardcodes paths
missing required files are hidden
tool opens with partial data
```

## Game/Sample Launch Tiles DoD

Required data:

```text
sample/game manifest
tool id
required data paths
```

Required controls:

```text
tile title
tile description/status
launch action
validation indicator
```

Success:

```text
tile launches declared tool
tile passes manifest-declared paths
validation indicator reflects required input readiness
```

Failure:

```text
tile bypasses manifest
tile launches with only preset path
tile does not include required palette/data paths
```

## Universal Acceptance
Codex is not done until each relevant tool can prove:

```text
loaded files != success
loaded files + required controls ready = success
```

Final success signal:

```text
all required inputs classification: success
all required controls classification: success
no required control classification: missing | empty | wrong-shape | defaulted
```

## Codex Gap Review Requirement
Codex must review current games/sample tools and report whether this DoD missed any required fields or controls.

Codex must create:

```text
docs/dev/reports/level_10_6m_tool_ui_readiness_dod_gap_review.md
```

The report must include:

```text
Tool reviewed
Observed required controls
Observed required fields/data
DoD gaps found
Suggested DoD additions
Files inspected
No implementation changes made
```

Codex must not change runtime code in this PR. If gaps are found, report them only. The next PR will implement or refine the DoD.

## Validation
Run the lightest validation possible for docs-only changes:

```powershell
git status
```

If a roadmap status marker is updated, verify the diff is status-only.
