# PLAN_PR_OVERLAY_PANEL_PERSISTENCE

## Goal
Plan a clean, sample-level overlay panel persistence boundary that stores only panel enabled/disabled state while keeping runtime authority in the overlay registry.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- debug-only persistence adapter boundary
- versioned persistence snapshot shape
- restore/apply behavior for known panel IDs
- safe handling of unknown/invalid IDs
- operator-command save rules via public APIs only
- integration reference: `MultiSystemDemoScene.js`

## Out of Scope
- engine core changes
- panel layout persistence
- provider/state redesign
- production/user profile persistence

## Boundary Contract
- Registry is the runtime source of truth.
- Persistence adapter is read/write storage only.
- Operator commands mutate registry through public APIs.
- Save pipeline reads normalized state from registry snapshots.

## Persistence Adapter Contract
```js
{
  load(),
  save(snapshot),
  clear()
}
```

Rules:
- adapter must not mutate registry directly
- adapter must return parsed object or null/failure signal
- adapter remains debug-only and sample-scoped

## Versioned Snapshot Shape
```json
{
  "contract": "overlay.panel-state",
  "version": 1,
  "panels": {
    "runtime-summary": true,
    "render-stage": false
  },
  "savedAt": 0
}
```

## Restore and Save Rules
Restore:
1. Registry registers descriptors and defaults.
2. Adapter `load()` returns snapshot.
3. Registry applies only recognized `panels` IDs.
4. Unknown IDs are ignored safely.

Save:
- save only after operator state-change commands:
  - `overlay.show <panelId>`
  - `overlay.hide <panelId>`
  - `overlay.toggle <panelId>`
  - `overlay.showAll`
  - `overlay.hideAll`
- no save on read/help commands:
  - `overlay.help`
  - `overlay.list`
  - `overlay.status`
  - `overlay.order`

## Safety Rules
- corrupt snapshot -> safe fallback to defaults
- missing `panels` map -> safe fallback to defaults
- unknown panel IDs -> ignore only, no crash
- write failures -> non-fatal warning path

## Validation Goals
- enable/disable state survives reload
- registry authority remains intact
- unknown IDs do not break startup
- command path persists state via public APIs only
- no engine core changes
