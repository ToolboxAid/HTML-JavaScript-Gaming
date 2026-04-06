# PLAN_PR_DEBUG_SURFACES_PRESETS

## Objective
Plan the first reusable presets system for promoted debug surfaces as a small, opt-in layer.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
One PR purpose only: presets planning.

## Scope
In scope:
- preset registry contract
- preset applier contract
- shared baseline presets
- preset command surface
- precedence rules with persistence
- adoption models
- naming conventions
- target structure

Out of scope:
- implementation in this PR
- layout editors and docking systems
- 3D-specific presets
- network-specific presets
- deep-inspector presets
- project-specific preset implementations in shared layer

## Design Constraints
- docs-first only
- keep v1 small and opt-in
- focus only on panel visibility and optional ordering
- preserve Dev Console (command/control) and Debug Overlay (telemetry/visual) separation
- keep project-specific presets local

## Preset Registry Contract
### Responsibility
Store and resolve preset definitions by stable preset ID.

### Public surface (planned)
- `registerPreset(presetDescriptor)`
- `getPreset(presetId)`
- `listPresets()`
- `hasPreset(presetId)`

### Validation rules
- unique `presetId`
- deterministic descriptor shape
- panel visibility map required
- optional order list allowed
- reject invalid/duplicate descriptors safely

## Preset Applier Contract
### Responsibility
Apply an existing preset to overlay panel state through public registry APIs only.

### Public surface (planned)
- `applyPreset(presetId, context)`
- `previewPreset(presetId)` (optional read-only summary)

### Apply rules (v1)
- set panel enabled/disabled state from preset
- apply optional ordering hints when supported by public APIs
- ignore unknown panel IDs safely
- produce deterministic apply report

## Shared Baseline Presets (v1)
Small generic set:
- `preset.minimal`
- `preset.gameplay`
- `preset.rendering`
- `preset.systems`
- `preset.qa`

Each preset contains only:
- `panels.enabled[]`
- `panels.disabled[]`
- optional `panels.order[]`

## Preset Commands (v1)
- `preset.list`
- `preset.current`
- `preset.apply <presetId>`
- `preset.reset`
- `preset.help`

Rules:
- commands act through preset registry/applier public contracts only
- no direct panel object mutation

## Precedence with Persistence
### Precedence order (authoritative)
1. Registry descriptor defaults (base state)
2. Persisted panel state restore (startup state)
3. Explicit preset apply command (intentional operator override)
4. Subsequent operator panel commands (latest runtime state)

### Persistence interaction rules
- preset apply is treated as an intentional runtime state change
- after successful preset apply, persistence save path records resulting state
- persistence never mutates presets; it stores final panel state snapshot only

## Naming Conventions
### Preset IDs
- `preset.<name>`
- examples: `preset.minimal`, `preset.rendering`

### Command Namespace
- `preset.*`

### Data Keys
- `panels.enabled`
- `panels.disabled`
- `panels.order` (optional)

## Target Structure
```text
engine/
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

Project/sample/tool preset implementations stay outside shared tree.

## Adoption Models
### Minimal Adoption
- register registry + applier
- register 1 shared preset
- optional preset commands

### Standard Adoption
- register full shared preset set + preset commands
- default to `preset.minimal`

### Hybrid Adoption
- register shared presets
- add project-local presets in project layer
- keep shared and local presets separate

## Validation Strategy
- registry validation rejects invalid/duplicate presets
- preset apply updates visibility deterministically
- unknown panel IDs are ignored safely
- precedence with persistence behaves as defined
- commands route only through public preset APIs
- no excluded scope features introduced

## Risk Controls
- keep v1 narrow to visibility + optional ordering only
- block project-specific presets from shared layer
- require deterministic apply reporting
- defer advanced preset UX/editor features to separate PRs

## Rollout Notes
1. This PLAN PR is docs-only.
2. BUILD PR defines authoritative build inventory and acceptance checks.
3. APPLY PR implements incrementally: registry -> applier -> shared presets -> preset commands.
4. Expansion to excluded scopes requires separate PR tracks.

## Next Commands
1. `BUILD_PR_DEBUG_SURFACES_PRESETS`
2. `APPLY_PR_DEBUG_SURFACES_PRESETS`
