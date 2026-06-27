# PLAN_PR_DEBUG_SURFACES_PRESETS

## Objective
Plan the first reusable presets system for promoted debug surfaces as a small, opt-in layer.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
One PR purpose only: plan a shared presets system for debug surfaces.

## Scope
In scope:
- preset registry and preset applier contracts
- shared baseline preset inventory
- preset command surface
- precedence rules with persistence
- adoption modes, naming conventions, and target structure

Out of scope:
- implementation in this PR
- layout editors
- docking systems
- role permissions
- 3D-specific presets
- network-specific presets
- project-specific preset implementations in shared layer

## Core Design (v1)
- opt-in only
- visibility + optional ordering only
- deterministic preset apply behavior
- project-specific presets remain local

## Preset Registry Contract
Planned API:
- `registerPreset(descriptor)`
- `getPreset(presetId)`
- `listPresets()`
- `hasPreset(presetId)`

Descriptor requirements (v1):
- `presetId` (stable string, `preset.*`)
- `title`
- `panels.enabled[]`
- `panels.disabled[]`
- `panels.order[]` (optional)

## Preset Applier Contract
Planned API:
- `applyPreset(presetId, context)`
- `previewPreset(presetId)` (optional)

Apply rules:
- use public panel registry APIs only
- apply enabled/disabled states
- apply optional ordering when supported
- ignore unknown panel IDs safely
- return deterministic apply report

## Shared Baseline Presets (v1)
- `preset.minimal`
- `preset.gameplay`
- `preset.rendering`
- `preset.systems`
- `preset.qa`

## Preset Commands (v1)
- `preset.help`
- `preset.list`
- `preset.current`
- `preset.apply <presetId>`
- `preset.reset`

## Precedence with Persistence (authoritative)
1. Registry descriptor defaults
2. Persisted panel state restore
3. Explicit preset apply command
4. Later operator panel commands

Persistence rule:
- successful preset apply updates runtime state and then persistence records resulting panel state snapshot.

## Naming Conventions
- preset IDs: `preset.<name>`
- preset commands: `preset.*`
- config keys: `panels.enabled`, `panels.disabled`, `panels.order`

## Target Structure
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

Project/sample/tool preset implementations remain outside shared tree.

## Adoption Modes
- Minimal: one preset + optional commands
- Standard: full shared preset set + commands
- Hybrid: shared presets plus project-local presets

## Next Commands
1. `BUILD_PR_DEBUG_SURFACES_PRESETS`
2. `APPLY_PR_DEBUG_SURFACES_PRESETS`
