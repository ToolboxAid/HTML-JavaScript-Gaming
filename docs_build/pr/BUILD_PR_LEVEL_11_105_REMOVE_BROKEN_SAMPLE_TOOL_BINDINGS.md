# BUILD_PR_LEVEL_11_105_REMOVE_BROKEN_SAMPLE_TOOL_BINDINGS

## Purpose
Remove sample/tool references that do not currently load usable input in the aligned tool contracts, while preserving only proven-working bindings.

## Scope
- docs-first
- no implementation code
- no schema lock
- no schema loosening
- runtime-alignment cleanup only
- remove broken sample/tool manifest references instead of keeping misleading entries

## Required Contract Rule

If a sample cannot be used in the aligned tool, remove that tool reference from the sample/game/workspace manifest.

Do not keep placeholder/default/fallback entries to make the tool appear available.

## Canonical Naming

### 3D JSON Payload
Remove `Normalizer` everywhere user-facing and reference-facing.

Use:
- `3D JSON Payload`
- `3d-json-payload`
- `3d-json-payload.schema.json`

Do not use:
- `3D JSON Payload Normalizer`
- `3d-json-payload-normalizer`
- `3d-json-payload-normalizer.schema.json`

### Asset Pipeline
Remove `Tool` everywhere user-facing and reference-facing.

Use:
- `Asset Pipeline`
- `asset-pipeline`
- `asset-pipeline.schema.json`

Do not use:
- `Asset Pipeline Tool`
- `asset-pipeline-tool`
- `asset-pipeline-tool.schema.json`

## Remove Broken Tool References

Codex must inspect and remove/repair the following based on actual aligned input availability.

### 3D Camera Path Editor
Problem:
- 3D Camera Path Editor does not load Path input.

Action:
- Remove 3D camera path tool references from samples/manifests that do not provide a valid path input.

### 3D JSON Payload
Problems:
- name still says Normalizer in places.
- does not load payload input.

Action:
- Remove `Normalizer` naming everywhere.
- Remove 3D JSON Payload tool references where no valid payload input exists.

### Asset Browser / Import Hub
Problem:
- loads 0 approved assets with:
  `source missing. Source checked: active-project-manifest.tools.asset-browser.assets.`

Action:
- If a sample/tool manifest has no valid `tools.asset-browser.assets`, remove the asset-browser reference.
- If the sample is intended to use Asset Browser and has valid approved assets, align the JSON to the schema and source path.
- Do not add fake/default assets.

### Asset Pipeline
Problems:
- name still says Tool in places.
- does not load Pipeline Input.

Action:
- Remove `Tool` naming everywhere.
- Remove Asset Pipeline references where no valid pipeline input exists.

### Parallax Scene Studio
Problem:
- appears to load but shows bars, not a valid parallax scene.

Action:
- Remove the Parallax Scene Studio reference from the affected sample unless a valid parallax scene JSON exists and renders correctly.

### Performance Profiler
Problems:
- loads default values.
- Sample 0512 does not have a performance JSON file to pass.

Action:
- Remove Performance Profiler references that rely on default values.
- Remove Performance Profiler from Sample 0512 unless a real performance JSON input exists.

### Physics Sandbox
Problems:
- loads defaults.
- Sample 0210 does not have a JSON file to pass.

Action:
- Remove Physics Sandbox references that rely on defaults.
- Remove Physics Sandbox from Sample 0210 unless a real physics JSON input exists.

### Primitive Skin Editor
Problems:
- does not load samples 0226, 0227.
- displays:
  Game: n/a
  Schema: n/a
  Source: n/a

Action:
- Remove Primitive Skin Editor references from samples 0226 and 0227 unless valid skin JSON input and schema/source metadata exist.

### Replay Visualizer
Problem:
- does not load anything.

Action:
- Remove Replay Visualizer references where no valid replay input exists.

### State Inspector
Problem:
- refresh does nothing.
- likely needs inspection snapshot JSON input.
- sample folder does not contain JSON input.

Action:
- Remove State Inspector references from samples without valid inspection snapshot JSON input.
- Do not keep a no-op tool reference.

### SVG Asset Studio
Problems:
- does not load samples 0901, 1204, 1208.
- works for 1215, 1216, 0127.

Action:
- Remove SVG Asset Studio references from samples 0901, 1204, 1208.
- Keep SVG Asset Studio references for samples 1215, 1216, 0127 if validation still passes and they load.

### Vector Map Editor
Problems:
- samples 0901, 1204, 1205 do not load.

Action:
- Remove Vector Map Editor references from samples 0901, 1204, 1205 unless valid vector map JSON exists and loads.

## Validation

Run targeted validation only.

Required:
- JSON parse validation.
- Schema validation for changed sample/tool/game manifests.
- Tool reference audit after cleanup.
- Verify no broken default-only bindings remain for the listed samples/tools.
- Verify no old user-facing names remain:
  - `Normalizer`
  - `Asset Pipeline Tool`

## Full Samples Smoke Test

Skipped.

Reason:
- This PR is targeted sample/tool binding cleanup.
- Do not run the full 20-minute sample smoke test unless Codex changes shared loader/framework behavior.

## Reports

Codex must write:

- `docs_build/dev/reports/broken_sample_tool_bindings_11_105.txt`
- `docs_build/dev/reports/tool_reference_cleanup_11_105.txt`
- `docs_build/dev/reports/canonical_tool_names_11_105.txt`

Each report must include:
- files changed
- references removed
- references kept
- reason for each kept reference

## Acceptance

- Broken sample/tool bindings listed in this PR are removed or backed by real aligned input.
- No sample advertises a tool that cannot load usable data.
- No fake/default/fallback data is introduced.
- Canonical naming is consistent.
- Targeted validation passes or lists exact remaining failures.
