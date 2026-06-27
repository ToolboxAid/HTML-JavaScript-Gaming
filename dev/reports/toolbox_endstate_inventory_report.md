# Toolbox End-State Inventory Report

Task: `PR_26154_047-toolbox-endstate-inventory`

## Active Toolbox Tools

Every active tool lives at `toolbox/[toolname]/index.html`, uses `assets/theme-v2`, appears in the shared header navigation, and appears in the Toolbox index grouping.

| Tool | Path |
| --- | --- |
| AI Assistant | `toolbox/ai-assistant/index.html` |
| Animation | `toolbox/animation/index.html` |
| Assets | `toolbox/assets/index.html` |
| Cloud | `toolbox/cloud/index.html` |
| Custom Extensions | `toolbox/code/index.html` |
| Game Design | `toolbox/game-design/index.html` |
| Input | `toolbox/input/index.html` |
| Localization | `toolbox/localization/index.html` |
| MIDI | `toolbox/midi/index.html` |
| Object Vector | `toolbox/object-vector/index.html` |
| Palette | `toolbox/palette/index.html` |
| Particles | `toolbox/particles/index.html` |
| Publish | `toolbox/publish/index.html` |
| Sound | `toolbox/sound/index.html` |
| Storage | `toolbox/storage/index.html` |
| World Vector | `toolbox/world-vector/index.html` |

## Archived Tool Material

Top-level archived tool/reference folders under `archive/v1-v2/tools/`:

- `_templates-v2_deprecated`
- `codex`
- `common`
- `game-builder-reference`
- `localization_pre_template_rebuild`
- `old_3D Asset Viewer`
- `old_3D Camera Path Editor`
- `old_3D JSON Payload`
- `old_Asset Pipeline`
- `old_Parallax Scene Studio`
- `old_Performance Profiler`
- `old_Physics Sandbox`
- `old_Replay Visualizer`
- `old_Sprite Editor`
- `old_State Inspector`
- `old_Tilemap Studio`
- `old_asset-manager-v2`
- `old_audio-sfx-playground-v2`
- `old_collision-inspector-v2`
- `old_input-mapping-v2`
- `old_localization-studio`
- `old_midi-studio-v2`
- `old_object-vector-studio-v2`
- `old_palette-manager-v2`
- `old_preview-generator-v2`
- `old_storage-inspector-v2`
- `old_text2speech-V2`
- `old_workspace-manager-v2`
- `old_world-vector-studio-v2`
- `shared-preview`
- `toolbox-reduction-reference/configuration-admin`
- `toolbox-reduction-reference/tool-creator`

## Confirmations

- PASS: `toolbox/_tool_template-v2` is the only active tool template.
- PASS: active tools use `assets/theme-v2`.
- PASS: active tools appear in header navigation and `toolbox/index.html` grouping.
- PASS: Marketplace is not a Toolbox tool.
- PASS: Game Design is the active design/build planning surface.
- PASS: `npm run test:workspace-v2` passed.

## Remaining Ambiguous Items

| Item | Reason |
| --- | --- |
| `toolbox/code` | Kept active because creator-extension contracts and shared code still reference it. |
| `toolbox/toolRegistry.js` | Still imported by active shared code/tests, but contains hidden legacy/archive registry metadata. Needs a dedicated active-registry split before relocation. |
| `toolbox/renderToolsIndex.js` | Not used by the current `toolbox/index.html`, but still referenced by tests/docs and imports `toolbox/toolRegistry.js`. |
| `archive/v1-v2/docs_build/archive/tools/SpriteEditor_old_keep/` | Existing archive policy location; moving it into `archive/v1-v2/tools/` is a policy decision, not a clear ownership move in this PR. |
| Runtime compatibility strings for `old_games` / `old_samples` | Left in place where active runtime/shared code accepts legacy input. Requires a separate behavior/convention PR. |
