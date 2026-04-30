# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

## PR
BUILD_PR_LEVEL_11_105_REMOVE_BROKEN_SAMPLE_TOOL_BINDINGS

## Execute

1. Treat this as runtime-alignment cleanup before schema lock.

2. Apply canonical naming:
   - Replace user-facing/reference-facing `3D JSON Payload Normalizer` with `3D JSON Payload`.
   - Replace ids/refs `3d-json-payload-normalizer` with `3d-json-payload`.
   - Replace `Asset Pipeline Tool` with `Asset Pipeline`.
   - Replace ids/refs `asset-pipeline-tool` with `asset-pipeline`.
   - Do not leave aliases or duplicate names.

3. Remove broken sample/tool references unless a valid aligned input file exists and loads:
   - 3D Camera Path Editor: remove references with no valid Path input.
   - 3D JSON Payload: remove references with no valid payload input.
   - Asset Browser / Import Hub: remove references where `active-project-manifest.tools.asset-browser.assets` is missing/empty/invalid.
   - Asset Pipeline: remove references with no valid Pipeline Input.
   - Parallax Scene Studio: remove affected references that render bars instead of valid parallax content.
   - Performance Profiler: remove default-only references, including Sample 0512 if no real performance JSON exists.
   - Physics Sandbox: remove default-only references, including Sample 0210 if no real physics JSON exists.
   - Primitive Skin Editor: remove references from samples 0226 and 0227 unless real skin input plus schema/source metadata exists.
   - Replay Visualizer: remove references with no valid replay input.
   - State Inspector: remove references with no valid inspection snapshot JSON input.
   - SVG Asset Studio: remove from samples 0901, 1204, 1208; keep 1215, 1216, 0127 only if they still load and validate.
   - Vector Map Editor: remove from samples 0901, 1204, 1205 unless valid vector map input exists and loads.

4. Do not create placeholder JSON to preserve a broken reference.
5. Do not introduce silent fallback/default values.
6. Do not loosen schemas.
7. Do not modify unrelated files.
8. Preserve compact primitive-array formatting rule and formatting.

9. Validate:
   - changed JSON parses
   - changed manifests validate
   - no old names remain:
     - Normalizer
     - Asset Pipeline Tool
   - no sample lists a removed broken tool reference

10. Write reports:
   - docs/dev/reports/broken_sample_tool_bindings_11_105.txt
   - docs/dev/reports/tool_reference_cleanup_11_105.txt
   - docs/dev/reports/canonical_tool_names_11_105.txt

11. Roadmap:
   - status-only update if execution-backed.
   - do not rewrite roadmap text.
   - do not delete roadmap text.

12. Package Codex output ZIP at:
   tmp/PR_11_105_REMOVE_BROKEN_SAMPLE_TOOL_BINDINGS.zip
