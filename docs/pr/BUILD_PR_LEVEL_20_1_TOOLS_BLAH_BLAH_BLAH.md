# BUILD_PR_LEVEL_20_1_TOOLS_BLAH_BLAH_BLAH

## Purpose
Implement the Phase 20 tools lane so each tool can open from three curated Phase 20 presets stored under `samples/`. Clicking a preset must open that tool with that preset's data already applied.

## Boundaries
- One PR purpose only: Phase 20 tools lane preset-opening flow
- Fullscreen is already complete and is out of scope
- Do not rename existing tools
- Do not create a new top-level feature outside `samples/`
- Do not add unrelated UX work
- Do not modify `start_of_day`
- Do not write fallback mock data outside the Phase 20 path

## Required outcome
For every tool listed below:
1. create exactly 3 Phase 20 preset files under `samples/`
2. expose those 3 presets from the tool UI
3. when a preset is clicked, the tool opens with that preset's data applied
4. preserve tool-specific data shape; do not force one schema across all tools unless already supported
5. keep implementation small and local to each tool plus shared helper(s) only if necessary

## Phase placement
This belongs in **Phase 20** because it productizes the tool suite with built-in ready-to-open presets across all tools, without changing fullscreen work or engine/runtime behavior.

## Canonical storage rule
All new preset content for this PR must live under:

`samples/phase-20/tools-blah-blah-blah/<tool-folder>/`

Use repo-safe folder slugs based on tool names.

## Tool coverage matrix

| Tool | Folder slug | Preset A | Preset B | Preset C |
|---|---|---|---|---|
| 3D Asset Viewer | `3d-asset-viewer` | `crate_turntable` | `robot_parts_breakout` | `retro_arcade_cabinet` |
| 3D Camera Path Editor | `3d-camera-path-editor` | `intro_flythrough` | `boss_reveal_orbit` | `side_scroll_pan` |
| 3D Map Editor | `3d-map-editor` | `mini_dungeon_room` | `outdoor_hub_blockout` | `stacked_platform_arena` |
| Asset Browser | `asset-browser` | `retro_ui_pack` | `platformer_tiles_pack` | `enemy_sprite_pack` |
| Asset Pipeline Tool | `asset-pipeline-tool` | `png_to_atlas` | `svg_to_runtime_mesh` | `tileset_batch_import` |
| Palette Browser | `palette-browser` | `cga_classic` | `sunset_arcade` | `forest_night` |
| Parallax Scene Studio | `parallax-scene-studio` | `city_rooftops_dusk` | `forest_depth_scroll` | `desert_highway_sunset` |
| Performance Profiler | `performance-profiler` | `entity_stress_200` | `particle_burst_peak` | `camera_scroll_trace` |
| Physics Sandbox | `physics-sandbox` | `stacked_crates` | `pinball_bounce_lab` | `ramp_and_slide` |
| Replay Visualizer | `replay-visualizer` | `perfect_run_short` | `collision_debug_case` | `boss_attempt_timeline` |
| Sprite Editor | `sprite-editor` | `hero_walk_cycle` | `explosion_strip` | `enemy_idle_blink` |
| State Inspector | `state-inspector` | `platformer_session` | `boss_phase_machine` | `menu_to_game_flow` |
| Tile Model Converter | `tile-model-converter` | `orthogonal_tileset` | `isometric_block_set` | `collision_overlay_set` |
| Tilemap Studio | `tilemap-studio` | `overworld_scroll_test` | `metroid_room_chain` | `town_square_layered` |
| Vector Asset Studio | `vector-asset-studio` | `ui_icon_sheet` | `enemy_ship_shapes` | `pickup_symbols_pack` |
| Vector Map Editor | `vector-map-editor` | `route_network_small` | `arena_spawn_layout` | `zone_trigger_map` |
| Workspace Manager | `workspace-manager` | `solo_toolkit_workspace` | `pixel_art_pipeline` | `level_build_workspace` |


## File shape rule
For each tool, create:
- 3 preset data files under that tool's Phase 20 folder
- 1 manifest file for that tool if the tool benefits from metadata-driven rendering
- no extra placeholder files

Example pattern:
- `samples/phase-20/tools-blah-blah-blah/<tool-folder>/manifest.json`
- `samples/phase-20/tools-blah-blah-blah/<tool-folder>/<preset-name>.<tool-native-extension-or-json>`

## Implementation rule
Each tool must resolve its own Phase 20 folder and present exactly its three presets from that folder. Selecting a preset must hydrate the current tool state immediately using the tool's existing import/open/state path where possible.

## Tool-by-tool acceptance
- **3D Asset Viewer** opens each preset with the correct asset/model selection and default view state.
- **3D Camera Path Editor** opens each preset with path nodes/timings ready for editing.
- **3D Map Editor** opens each preset as an editable map scene.
- **Asset Browser** opens each preset as a filtered/organized asset view.
- **Asset Pipeline Tool** opens each preset as a ready pipeline configuration.
- **Palette Browser** opens each preset palette collection.
- **Parallax Scene Studio** opens each preset scene with layers already present.
- **Performance Profiler** opens each preset capture/session or deterministic stub fixture.
- **Physics Sandbox** opens each preset world/setup.
- **Replay Visualizer** opens each preset replay/timeline.
- **Sprite Editor** opens each preset sprite project.
- **State Inspector** opens each preset inspection state/session fixture.
- **Tile Model Converter** opens each preset conversion source/settings package.
- **Tilemap Studio** opens each preset map.
- **Vector Asset Studio** opens each preset vector project.
- **Vector Map Editor** opens each preset map/project.
- **Workspace Manager** opens each preset workspace arrangement/config.

## Test checklist
1. Every listed tool shows exactly 3 Phase 20 presets.
2. Every preset comes from `samples/phase-20/tools-blah-blah-blah/...`.
3. Clicking a preset opens the tool with data already applied.
4. No tool uses data outside the Phase 20 path for this feature.
5. Fullscreen behavior is unchanged.
6. Existing non-Phase-20 open/import flows still work.

## Execution notes for Codex
- Smallest valid change only
- Prefer one shared helper only if at least 3 tools benefit from the same utility
- Otherwise keep loading/opening logic local per tool
- Use the tool's current import/open mechanism instead of inventing a new runtime model
- Roadmap handling is status-only if a matching Phase 20 item already exists; do not rewrite roadmap text

## Deliverables to include in Codex output ZIP
- updated tool files only
- `samples/phase-20/tools-blah-blah-blah/**`
- `docs/dev/reports/file_tree.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`
- updated roadmap status only if execution-backed and already present
