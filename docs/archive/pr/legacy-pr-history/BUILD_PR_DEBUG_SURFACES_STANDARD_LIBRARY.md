# BUILD_PR_DEBUG_SURFACES_STANDARD_LIBRARY

## Objective
Create an authoritative docs-only BUILD bundle for the first shared debug surfaces standard library under `src/engine/debug/standard`.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## Build Constraints
- docs-first only
- one PR purpose only
- keep initial shared library small and opt-in
- extraction/standardization only; no feature expansion
- exclude 3D-specific, network-specific, deep-inspector, and project-specific logic

## Authoritative Target Structure
```text
src/engine/
  debug/
    standard/
      panels/
        system/
        scene/
        render/
        input/
        debug/
      providers/
        system/
        scene/
        render/
        input/
        debug/
      commands/
        registerStandardDebugCommands.js
      presets/
        registerStandardDebugPreset.js
```

## Initial Inventory (v1)
### Shared Panels
- `system.fps`
- `system.timing`
- `scene.summary`
- `scene.entities`
- `render.layers`
- `input.summary`
- `debug.status`

### Shared Providers
- `system.timing`
- `scene.summary`
- `scene.entities`
- `render.layers`
- `input.summary`
- `debug.status`

### Shared Operator Commands
- `debug.help`
- `debug.status`
- `overlay.list`
- `overlay.status`
- `overlay.show <panelId>`
- `overlay.hide <panelId>`
- `overlay.toggle <panelId>`
- `overlay.showAll`
- `overlay.hideAll`
- `overlay.order`

## Registration Pattern (Authoritative)
Main shared adoption entry point:
- `registerStandardDebugPreset()`

Expected registration sequence:
1. register standard providers
2. register standard panels
3. register standard operator commands
4. return a registration summary/report

Rules:
- registration is opt-in
- registration uses public contracts only
- registration is deterministic and idempotent-safe where practical

## Adoption Modes
### Minimal Adoption
- register selected providers and 1-3 panels
- optionally register shared commands

### Standard Adoption
- call `registerStandardDebugPreset()` to register the full baseline set

### Hybrid Adoption
- call `registerStandardDebugPreset()` then extend/override locally with project-owned panels/providers/commands

## Validation Goals
- baseline preset registers successfully end-to-end
- shared panels consume provider data only
- shared commands operate through public overlay/debug APIs only
- partial and full adoption modes both work
- naming remains stable and deterministic
- project-specific logic remains outside shared library

## Rollback Strategy
If v1 library is too broad or unstable:
1. keep target directory structure and preset entry point
2. reduce initial inventory to highest-value subset
3. preserve command/panel/provider naming contracts
4. revalidate minimal adoption before re-expanding

## Rollout Notes
- BUILD bundle is docs-only and implementation-ready
- APPLY should implement inventory incrementally (providers -> panels -> commands -> preset)
- do not widen scope into excluded areas in this track

## Deliverables
- `docs/pr/PLAN_PR_DEBUG_SURFACES_STANDARD_LIBRARY.md`
- `docs/pr/BUILD_PR_DEBUG_SURFACES_STANDARD_LIBRARY.md`
- `docs/pr/APPLY_PR_DEBUG_SURFACES_STANDARD_LIBRARY.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`
- `docs/dev/reports/file_tree.txt`
