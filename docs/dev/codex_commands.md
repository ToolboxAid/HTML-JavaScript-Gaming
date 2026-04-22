# Codex Commands

MODEL: GPT-5.4
REASONING: high

## Command
Implement `BUILD_PR_LEVEL_20_1_PHASE20_TOOL_PRESET_INTEGRATION` in `HTML-JavaScript-Gaming` as one small executable PR.

Requirements:
- use numbered sample folders only
- use `samples/phase-20/2001` through `samples/phase-20/2051`
- allocate exactly 3 Phase 20 samples per listed tool
- do not create `samples/phase-20/<tool>` folders
- when a Phase 20 sample is clicked, open the matching tool with that sample's preset data already applied
- fullscreen is already complete; do not modify it
- preserve repo conventions for sample folder contents and sample discovery
- keep the change surgical; do not scan or rewrite unrelated areas
- update roadmap status only if execution-backed and only with marker transitions

Listed tools:
- 3D Asset Viewer
- 3D Camera Path Editor
- 3D JSON Payload Normalizer
- Asset Browser
- Asset Pipeline Tool
- Palette Browser
- Parallax Scene Studio
- Performance Profiler
- Physics Sandbox
- Replay Visualizer
- Sprite Editor
- State Inspector
- Tile Model Converter
- Tilemap Studio
- Vector Asset Studio
- Vector Map Editor
- Workspace Manager

Implementation target:
- executable sample lane under `samples/phase-20`
- clickable sample-to-tool launch path
- preset data applied at open

Validation:
- prove all 51 Phase 20 samples are mapped
- prove each sample opens the correct tool
- prove preset data is visible/applied after open
- place findings in `docs/dev/reports`
