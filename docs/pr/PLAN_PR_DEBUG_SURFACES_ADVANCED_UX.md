# PLAN_PR_DEBUG_SURFACES_ADVANCED_UX

## Objective
Plan a reusable advanced UX layer for promoted debug surfaces that improves operator speed while remaining small, opt-in, and boundary-safe.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
One PR purpose only: advanced UX planning for debug surfaces.

## Scope
In scope:
- panel group infrastructure
- quick toggles
- macro registry + macro executor
- optional shortcut helpers
- command surfaces
- naming conventions
- target structure

Out of scope:
- implementation in this PR
- layout editors
- docking systems
- 3D-specific UX
- network-specific UX
- project-specific workflow implementations in shared layer

## Design Constraints
- docs-first only
- keep v1 small and opt-in
- preserve Dev Console (command/control) and Debug Overlay (telemetry/visual) separation
- macros compose only public APIs and approved commands/actions

## Advanced UX Components (v1)
### Panel Group Infrastructure
Purpose:
- register reusable panel groups and apply group visibility actions.

Planned shared contracts:
- `DebugPanelGroupRegistry`
- `registerStandardPanelGroups()`

Initial shared groups:
- `group.systems`
- `group.rendering`
- `group.scene`
- `group.input`
- `group.qa`

### Quick Toggles
Purpose:
- fast common workflow switches without manual multi-command sequences.

Initial shared toggles:
- `toggle.overlay`
- `toggle.minimal`
- `toggle.systems`
- `toggle.rendering`

### Macro Registry + Executor
Purpose:
- run named macro workflows composed from approved commands/actions.

Planned shared contracts:
- `DebugMacroRegistry`
- `DebugMacroExecutor`
- `registerStandardDebugMacros()`

Initial shared macros:
- `macro.minimal.focus`
- `macro.qa.start`
- `macro.render.inspect`
- `macro.scene.inspect`

Macro composition rules (hard):
1. Macros may call only approved public commands/actions.
2. Macros may not call private runtime/overlay internals.
3. Macros may not mutate panel objects directly.
4. Macro execution reports must be deterministic and structured.

### Optional Shortcut Helpers
Purpose:
- optional debug-only shortcut binding helpers for groups/macros/toggles.

Planned shared contracts:
- `registerDebugShortcutBindings()`

Rules:
- optional opt-in registration only
- no mandatory global bindings
- no shortcut logic in engine-core

## Command Surface (v1)
### Group Commands
- `group.list`
- `group.show <groupId>`
- `group.hide <groupId>`
- `group.toggle <groupId>`

### Macro Commands
- `macro.list`
- `macro.show <macroId>`
- `macro.run <macroId>`

### Toggle Commands
- `toggle.overlay`
- `toggle.minimal`
- `toggle.systems`
- `toggle.rendering`

## Naming Conventions
- Group IDs: `group.<domain>` (example: `group.rendering`)
- Macro IDs: `macro.<domain>.<action>` (example: `macro.render.inspect`)
- Toggle commands: `toggle.<name>`
- Shared IDs must be generic and reusable (no project-specific names)

## Target Structure
```text
engine/
  debug/
    advanced/
      groups/
        DebugPanelGroupRegistry.js
        registerStandardPanelGroups.js
      macros/
        DebugMacroRegistry.js
        DebugMacroExecutor.js
        registerStandardDebugMacros.js
      toggles/
        registerQuickToggleCommands.js
      shortcuts/
        registerDebugShortcutBindings.js
```

Project/sample/tool workflow implementations remain outside shared tree.

## Adoption Models
### Minimal Adoption
- register one panel group
- register one quick toggle
- optional macro commands

### Standard Adoption
- register shared groups/macros/toggles
- optional shortcut helper registration

### Hybrid Adoption
- register shared advanced UX pieces
- extend with project-local groups/macros/shortcuts outside shared layer

## Validation Strategy
- registry/command surfaces register deterministically
- groups and toggles operate through public APIs only
- macro execution enforces approved composition boundaries
- optional shortcuts remain optional and debug-only
- project-specific workflow implementations remain outside shared layer

## Risk Controls
- keep v1 narrow to groups/toggles/macros/optional shortcuts
- block private API access from macros
- keep shared inventory generic
- defer complex UX systems to separate tracks

## Rollout Notes
1. This PLAN PR is docs-only.
2. BUILD PR defines authoritative implementation inventory and acceptance checks.
3. APPLY PR implements incrementally: groups -> toggles -> macros -> optional shortcuts.
4. Excluded scopes require separate PR tracks.

## Next Commands
1. `BUILD_PR_DEBUG_SURFACES_ADVANCED_UX`
2. `APPLY_PR_DEBUG_SURFACES_ADVANCED_UX`
