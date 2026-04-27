# Tool UI Readiness Definition of Done

## PR
BUILD_PR_LEVEL_10_6P_COMPLETE_TOOL_UI_READINESS_DOD

## Purpose
Finish the tool Definition of Done so UAT can validate tools systematically instead of picking failures one by one.

This DoD applies to tools opened from `games/index.html`, `samples/index.html`, Workspace Manager, and any sample/game manifest-driven launch.

## Global success rule

A tool is not considered loaded when a JSON file fetch succeeds.

A tool is only considered loaded when all of the following are true:

```text
manifest loaded
declared tool id resolved
all required input paths resolved from manifest/sample data
all required files fetched
all required file shapes validated
all required UI controls populated from loaded data
all required controls emit readiness diagnostics
no required control uses fallback/demo/default data
no required control silently self-populates
```

## Global failure rule

Any one of these is a failure:

```text
required file missing
required file wrong path
required file wrong shape
required file loaded but required control empty
required control populated from default/demo/fallback data
required control resets after initialization
accordion/section auto-closes without user action
tool says success before controls are ready
tool loads from hardcoded sample path
tool loads duplicate wrapper data instead of canonical data
```

## Mandatory diagnostic events

Every tool with required data must emit these diagnostics during launch:

```text
[tool-load:request]
[tool-load:fetch]
[tool-load:loaded]
[tool-load:warning]
[tool-load:error]
[tool-load:classification]
[tool-ui:control-ready]
[tool-ui:lifecycle]
```

### Required diagnostic fields

Each diagnostic must include:

```text
toolId
sampleId or gameId when available
manifestPath when available
expected.requiredInputs
expected.requiredControls
expected.requiredOutputFields
actual.requestedPaths
actual.loadedKeys
actual.controlValues
actual.outputValues
actual.expectedCount
actual.actualCount
classification
```

### Classification values

Allowed load/control classifications:

```text
success
missing
wrong-path
wrong-shape
empty
defaulted
stale
reset
```

## Required output fields (all tools)

Every launchable tool must expose output fields that prove loaded data reached UI state.

```text
status text/readout field that reports Loaded preset vs failure
loaded source field (sample/game/preset path or equivalent)
output/result panel bound to loaded data or derived result
expected vs actual count/value readout for at least one required control
warning/error output field that remains visible until user action
```

## Lifecycle / timer DoD

All tools must prove there is no unintended timer-driven UI reset.

### Success

```text
accordion state remains user-controlled
opening an accordion does not auto-close after about one second
tool initialization does not repeatedly re-render and collapse user-open sections
tool diagnostics report lifecycle initialization once unless a user action causes reload
```

### Required lifecycle diagnostics

```text
[tool-ui:lifecycle]
toolId
phase: init | bind | render | user-action | reload | reset
cause
classification
```

### Failure

```text
accordion closes without user action
controls clear after being populated
palette/asset/tile/vector panels reset after first render
diagnostics show repeated init/reload/reset without user action
```

---

# Per-tool DoD

## 1. Sprite Editor

### Required inputs

```text
sprite project json
canonical palette json
```

### Required controls

```text
palette swatch grid
Color 1 selector
Color 2 selector
active drawing color
palette lock-state readout
sprite canvas
sprite/frame list
preview play/pause + FPS controls
tool mode buttons
asset registry load/save controls
save/export controls
sample source status/readout
palette selection status/readout
load status text
```

### Required output fields

```text
status text that reports Loaded preset or load failure
sample source path/id readout
palette source path readout
frame count output
export/package output/status text
```

### Success

```text
palette swatch grid populated from canonical *.palette.json
Color 1 set from first valid palette swatch
Color 2 set from second valid palette swatch
active drawing color equals Color 1 after load
sprite canvas renders loaded sprite/project with canonical palette
sprite/frame list populated from loaded sprite project
save/export uses loaded sprite project plus canonical palette
```

### Failure

```text
palette is missing
palette grid empty
Color 1/Color 2 defaulted or hardcoded
canvas renders before palette is bound
sprite preset loads but does not include expected sprite project shape
*.palette-browser.json used as palette source
```

## 2. Palette Browser

### Required inputs

```text
canonical palette json
```

### Required controls

```text
palette title/name
swatch grid
selected swatch detail
palette summary text
palette selection/load status text
copy/export controls
filter/search controls when visible
```

### Required output fields

```text
status text that reports Loaded preset or load failure
swatch count summary output
selected swatch output values (name/symbol/hex)
```

### Success

```text
title uses palette.name
swatch grid uses palette.swatches
selected swatch detail binds an actual loaded swatch
copy/export controls use selected loaded swatch
```

### Failure

```text
uses *.palette-browser.json as source
swatches nested under config.palette as primary contract
duplicate palette source required
grid empty while palette loaded
```

## 3. Asset Browser / Import Hub

### Required inputs

```text
asset manifest/catalog json
approved asset list or approval metadata
asset references declared by manifest
palette json when assets require palette-backed color
```

### Required controls

```text
approved asset count
asset grid/list
asset preview
selected asset detail
import/select action
filter/search controls when visible
empty/error state panel
```

### Required output fields

```text
status text that reports Loaded preset or load failure
import plan status text/output
selected destination/category output values
approved asset count output
```

### Success

```text
approved asset count reflects loaded approved assets
asset grid/list populated from loaded catalog
asset preview renders selected loaded asset
selected asset detail binds real asset metadata
import/select action is enabled only for valid loaded asset
empty state is shown only when loaded catalog truly has zero approved assets
```

### Failure

```text
0 approved assets shown when approved assets exist
asset grid empty after successful catalog fetch
preview uses fallback/demo asset
import action enabled with no selected loaded asset
```

## 4. Tilemap Studio / Tilemap Editor

### Required inputs

```text
tilemap json
tileset or sprite asset json
palette json when tiles depend on palette
```

### Required controls

```text
map canvas
tile palette/grid
selected tile control
layer list
map dimensions/status
tile/tileset status
tileset atlas controls (tile width/height/spacing/margin)
tileset source/load controls
save/export controls
```

### Required output fields

```text
status text that reports Loaded preset or load failure
layer count output
tile count output
tileset resolution/status output
```

### Success

```text
map canvas renders loaded tilemap
tile palette/grid populated from loaded tileset
selected tile defaults to first valid loaded tile
layer list populated from tilemap layers
map dimensions/status reflects loaded tilemap
tile/tileset status confirms tile IDs resolve
```

### Failure

```text
map not loaded
tile palette empty
tiles uncertain or unresolved
demo map appears
selected tile hardcoded/defaulted
tile IDs reference missing tiles
```

## 5. Vector Asset Studio

### Required inputs

```text
vector asset json or SVG/vector source
canonical palette json when color controls are visible
paint/fill data
stroke data
background/canvas data when declared
```

### Required controls

```text
asset preview
SVG/background canvas
shape/path list
selected shape editor
palette control
palette target controls (paint/stroke/gradient start/gradient end)
paint/fill control
stroke control
transform controls
save/export controls
```

### Required output fields

```text
status text that reports Loaded preset or load failure
element/path count output
palette target binding output values
```

### Success

```text
preview renders loaded vector asset
SVG/background canvas renders declared background/canvas data
shape/path list populated from loaded vector data
selected shape editor binds selected loaded shape/path
palette control populated from canonical palette when visible
paint/fill control binds loaded paint/fill data
stroke control binds loaded stroke data
transform controls bind selected loaded shape/path
```

### Failure

```text
SVG background canvas loads but palette missing
paint/fill control empty
stroke control empty
palette control defaulted
preview uses hardcoded sample asset
shape/path list empty after asset fetch
```

## 6. Vector Map Editor

### Required inputs

```text
vector map json
entity/layer data
canonical palette json when colorized controls are visible
```

### Required controls

```text
map canvas
layer list
entity list
selected entity panel
selected entity transform controls
selected entity style/flags controls
palette/color controls when visible
zoom/pan controls
save/export controls
```

### Required output fields

```text
status text that reports Loaded preset or load failure
layer count output
entity count output
selected entity id/type output
```

### Success

```text
map canvas renders loaded vector map
layer list populated from vector map layers
entity list populated from vector map entities
selected entity panel binds selected loaded entity
palette/color controls bind canonical palette when required
zoom/pan controls operate on loaded map
```

### Failure

```text
no data loaded
canvas empty after vector map fetch
layer/entity lists empty
color controls default while palette exists
tool reports success with no entities/layers
```

## 7. Replay / Event Tool

### Required inputs

```text
events json
```

### Required controls

```text
replay JSON input
load replay action
event list
timeline/scrubber
play/pause controls
reset control
current event display
time readout
status/result panel
```

### Required output fields

```text
status text that reports Loaded preset or load failure
event count output
current replay index/time output
```

### Success

```text
event list populated from events array
timeline/scrubber range matches loaded events
playback uses loaded events
current event display updates from loaded event data
speed control affects loaded replay
```

### Failure

```text
events array missing
events empty when replay expected
fake replay events generated
timeline empty
tool reports success with zero events
```

## 8. Manifest / Data Flow Inspector

### Required inputs

```text
manifest json
declared tool input paths
loaded tool data
```

### Required controls

```text
manifest summary
declared paths table
fetch results table
expected vs actual table
classification/status panel
control readiness table
```

### Success

```text
manifest summary shows loaded manifest
declared paths table shows every required path
fetch results table shows every required fetch
expected vs actual table shows shape validation
classification/status panel shows final state
control readiness table shows required UI controls and classification
```

### Failure

```text
missing paths hidden
wrong-shape normalized away
success shown with missing inputs
control readiness omitted
```

## 9. Workspace Manager / Launcher Tool

### Required inputs

```text
game/sample manifest
declared tool id
required input paths
```

### Required controls

```text
workspace title
tool launch buttons
required input summary
forwarded launch query summary
status/error panel
validation indicator
mount diagnostic panel
```

### Required output fields

```text
current selected tool output
mount status output
pre-launch required input readiness output
launch error output (missing tool, missing gameId, invalid path)
```

### Success

```text
workspace title reflects selected game/sample
tool launch buttons match manifest-declared tools
required input summary lists all required files
status/error panel shows missing/wrong-shape before launch
validation indicator reflects readiness
```

### Failure

```text
launch hardcodes paths
missing required files hidden
tool opens with partial data
validation indicator says ready before required data exists
```

## 10. Game/Sample launch tiles

### Required inputs

```text
sample/game manifest
tool id
required data paths
```

### Required controls

```text
tile title
tile description/status
launch action
validation indicator
launch issue panel/readout
```

### Required output fields

```text
resolved launch href output
required dependency keys output (not only samplePresetPath)
launch validation status output
```

### Success

```text
tile launches manifest-declared tool
tile passes manifest-declared paths
validation indicator reflects required input readiness
```

### Failure

```text
tile bypasses manifest
tile launches with only preset path when more inputs are required
tile does not include required palette/data paths
```

## 11. Parallax Scene Studio (`parallax-editor`)

### Required inputs

```text
parallax document json
layer entries
map metadata (width/height/tile size)
```

### Required controls

```text
layer list
layer selection controls
camera controls
viewport/canvas
save/export/package controls
status text
```

### Required output fields

```text
status text that reports Loaded preset or load failure
layer count output
camera readout output
```

### Success

```text
status text reports Loaded preset
layer list count equals loaded parallaxDocument.layers length
selected layer controls bind loaded layer values
```

### Failure

```text
preset load failed
layer list empty after successful fetch
seeded/demo layers shown instead of loaded layers
```

## 12. Skin Editor (`skin-editor`)

### Required inputs

```text
gameId context
skin payload json when samplePresetPath is provided
palette/context handoff from workspace or game context
```

### Required controls

```text
object list/workbench
selected object controls
palette list
preview canvas
status/summary/context fields
```

### Required output fields

```text
status text that reports Loaded preset or load failure
active game context output
palette availability output
selected object output
```

### Success

```text
game context fields match loaded launch context
palette list is populated when palette context is required
selected object controls bind loaded skin payload
preview canvas renders loaded object state
```

### Failure

```text
missing game context hidden
palette context missing while editor reports ready
preview uses fallback/default object data
```

## 13. State Inspector (`state-inspector`)

### Required inputs

```text
state snapshot payload json
samplePresetPath when sample-launched
```

### Required controls

```text
state JSON input
snapshot output panel
refresh/load controls
status text
```

### Required output fields

```text
status text that reports Loaded preset or load failure
snapshot key count output
current source path/id output
```

### Success

```text
status text reports Loaded preset
state JSON input equals loaded snapshot payload
snapshot output panel reflects parsed loaded payload
```

### Failure

```text
snapshot output empty with successful preset load
status reports success with invalid/empty snapshot
```

## 14. Performance Profiler (`performance-profiler`)

### Required inputs

```text
profileSettings payload (workloadIterations, workSize, frameSamples)
samplePresetPath when sample-launched
```

### Required controls

```text
workloadIterations input
workSize input
frameSamples input
run/stop controls
output panel
status text
```

### Required output fields

```text
status text that reports Loaded preset or load failure
loaded settings output values
run result output
```

### Success

```text
settings controls equal loaded profileSettings values
status text reports Loaded preset
output panel uses loaded settings run context
```

### Failure

```text
settings controls remain defaulted after preset load
status reports success while required settings are empty
```

## 15. Physics Sandbox (`physics-sandbox`)

### Required inputs

```text
physicsBody payload json
samplePresetPath when sample-launched
```

### Required controls

```text
physics body input
run step control
output panel
status text
```

### Required output fields

```text
status text that reports Loaded preset or load failure
loaded body key/value output
physics step result output
```

### Success

```text
physics body input equals loaded physicsBody payload
status text reports Loaded preset
output panel reflects processed loaded body
```

### Failure

```text
physics body input empty/defaulted after preset load
status reports success with missing physics body
```

## 16. Asset Pipeline Tool (`asset-pipeline-tool`)

### Required inputs

```text
pipeline payload json
pipelinePayload.gameId
pipelinePayload.domainInputs
samplePresetPath when sample-launched
```

### Required controls

```text
pipeline input panel
run/load controls
output panel
status text
```

### Required output fields

```text
status text that reports Loaded preset or load failure
loaded gameId output
domain input record count output
pipeline result output
```

### Success

```text
status text reports Loaded preset
pipeline input panel contains loaded gameId and non-empty domainInputs
output panel reflects loaded pipeline run context
```

### Failure

```text
domainInputs empty after successful preset load
status reports success while gameId is missing
```

## 17. Tile Model Converter (`tile-model-converter`)

### Required inputs

```text
candidate payload json
conversion payload json
samplePresetPath when sample-launched
```

### Required controls

```text
converter input panel
run converter control
output panel
status text
```

### Required output fields

```text
status text that reports Loaded preset or load failure
candidate key count output
conversion key count output
conversion result output
```

### Success

```text
input panel includes loaded candidate and conversion payload objects
status text reports Loaded preset
output panel reflects conversion using loaded payload
```

### Failure

```text
candidate or conversion payload empty/defaulted after preset load
status reports success with missing converter inputs
```

## 18. 3D JSON Payload Normalizer (`3d-json-payload-normalizer`)

### Required inputs

```text
mapPayload.points
mapPayload.segments
samplePresetPath when sample-launched
```

### Required controls

```text
map JSON input panel
normalize action
output panel
status text
```

### Required output fields

```text
status text that reports Loaded preset or load failure
point count output
segment count output
normalized output payload
```

### Success

```text
input panel point/segment counts equal loaded preset payload counts
status text reports Loaded preset
output panel reflects normalized loaded payload
```

### Failure

```text
point or segment arrays empty after preset load
status reports success with missing map payload data
```

## 19. 3D Asset Viewer (`3d-asset-viewer`)

### Required inputs

```text
asset3d.vertices payload
samplePresetPath when sample-launched
```

### Required controls

```text
asset input panel
inspect action
output panel
status text
```

### Required output fields

```text
status text that reports Loaded preset or load failure
vertex count output
inspection output
```

### Success

```text
input panel vertex count equals loaded preset payload vertex count
status text reports Loaded preset
inspection output binds loaded asset payload
```

### Failure

```text
vertex list empty/defaulted after preset load
status reports success with missing vertex data
```

## 20. 3D Camera Path Editor (`3d-camera-path-editor`)

### Required inputs

```text
cameraPath.waypoints payload
samplePresetPath when sample-launched
```

### Required controls

```text
camera path input panel
add/normalize controls
output panel
status text
```

### Required output fields

```text
status text that reports Loaded preset or load failure
waypoint count output
camera path output
```

### Success

```text
input panel waypoint count equals loaded preset payload waypoint count
status text reports Loaded preset
output panel reflects loaded camera path payload
```

### Failure

```text
waypoint list empty/defaulted after preset load
status reports success with missing camera path data
```

---

# Palette SSoT DoD

## Canonical source

Only this file owns palette swatches:

```text
sample.XXXX.palette.json
```

## Duplicate wrapper

This file must not be required as a palette source:

```text
sample.XXXX.palette-browser.json
```

Preferred result:

```text
remove/de-reference *.palette-browser.json when it duplicates canonical palette data
make Palette Browser consume canonical *.palette.json directly
make Sprite Editor and other palette-backed tools consume canonical *.palette.json directly
```

## Canonical palette shape

```json
{
  "$schema": ".../palette.schema.json",
  "schema": "html-js-gaming.palette",
  "version": 1,
  "name": "...",
  "source": "...",
  "swatches": []
}
```

## Failure

```text
same palette swatches exist in two files
tool consumes config.palette wrapper instead of canonical palette
tools disagree on palette source
palette exists but required color controls are empty
```

---

# Codex review requirement

Before implementing fixes, Codex must inspect the current tool UIs and report whether this DoD misses any:

```text
required input fields
required output fields
required UI controls
control-to-data bindings
tool-specific ready states
error/empty states
lifecycle/timer reset checks
```

Codex must write findings to:

```text
docs/dev/reports/level_10_6p_tool_ui_readiness_dod_gap_report.md
```

If Codex finds a missing field/control/check, it must update this DoD document in the same PR before implementing any stabilization logic.

---

# Required validation commands

Codex must run the fastest relevant checks available:

```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```

If tool-specific tests exist, Codex must run the smallest relevant ones for changed tools.

# Final acceptance

Codex is done only when:

```text
all required input classifications are success
all required control classifications are success
no required control classification is missing, wrong-shape, empty, defaulted, stale, or reset
Generic failure signals detected: 0
```
