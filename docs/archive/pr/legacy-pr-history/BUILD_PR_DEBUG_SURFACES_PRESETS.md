# BUILD_PR_DEBUG_SURFACES_PRESETS

## Objective
Build an authoritative docs-only bundle for the first reusable presets system for promoted debug surfaces.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## Build Constraints
- docs-first only
- one PR purpose only
- first version is small and opt-in
- visibility + optional ordering only
- no feature expansion beyond preset infrastructure and baseline presets

## Required Shared Components
- `DebugPresetRegistry`
- `DebugPresetApplier`
- `registerStandardDebugPresets()`
- `registerPresetCommands()`

## Authoritative Target Structure
```text
src/engine/
  debug/
    presets/
      DebugPresetRegistry.js
      DebugPresetApplier.js
    standard/
      presets/
        registerStandardDebugPresets.js
        preset.minimal.js
        preset.gameplay.js
        preset.rendering.js
        preset.systems.js
        preset.qa.js
      commands/
        registerPresetCommands.js
```

## Shared Preset Inventory (v1)
- `preset.minimal`
- `preset.gameplay`
- `preset.rendering`
- `preset.systems`
- `preset.qa`

Preset content scope:
- `panels.enabled[]`
- `panels.disabled[]`
- `panels.order[]` (optional)

## Preset Commands (v1)
- `preset.help`
- `preset.list`
- `preset.current`
- `preset.apply <presetId>`
- `preset.reset`

## Registration Pattern
1. `registerStandardDebugPresets()` registers shared preset descriptors.
2. `registerPresetCommands()` registers shared `preset.*` commands.
3. Commands resolve presets via `DebugPresetRegistry`.
4. Apply flows execute via `DebugPresetApplier` only.

Rules:
- deterministic registration and lookup
- public APIs only
- no direct panel object mutation from command handlers

## Precedence Rules with Persistence (authoritative)
1. Base registry panel defaults.
2. Persisted panel state restore.
3. Explicit `preset.apply` override.
4. Subsequent explicit operator panel commands.

Save behavior:
- after successful `preset.apply`, persist resulting panel state snapshot.

## Adoption Modes
- Minimal: registry + applier + 1 shared preset (+ optional commands)
- Standard: full shared preset set + shared preset commands
- Hybrid: shared presets plus project-local presets outside shared layer

## Exclusions (hard)
- layout editors
- docking systems
- role permissions
- 3D-specific preset content
- network-specific preset content
- project-specific preset implementations in shared layer

## Validation Goals
- registry accepts and lists shared presets deterministically
- applier applies visibility/ordering deterministically
- unknown panel IDs are ignored safely
- commands route through registry/applier only
- persistence precedence behaves as defined
- minimal and standard adoption both validate

## Rollback Strategy
If v1 is unstable or too broad:
1. keep structure and core component names intact
2. reduce preset inventory to `preset.minimal` + one focused preset
3. preserve command surface and precedence rules
4. revalidate minimal adoption before expansion

## Rollout Notes
- BUILD bundle is docs-only and implementation-ready
- APPLY should proceed incrementally: registry -> applier -> shared presets -> preset commands
- do not expand scope into excluded areas in this track

## Deliverables
- `docs/pr/PLAN_PR_DEBUG_SURFACES_PRESETS.md`
- `docs/pr/BUILD_PR_DEBUG_SURFACES_PRESETS.md`
- `docs/pr/APPLY_PR_DEBUG_SURFACES_PRESETS.md`
- `docs/operations/dev/codex_commands.md`
- `docs/operations/dev/commit_comment.txt`
- `docs/reports/change_summary.txt`
- `docs/reports/validation_checklist.txt`
- `docs/reports/file_tree.txt`
