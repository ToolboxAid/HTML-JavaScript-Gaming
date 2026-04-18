# BUILD_PR_OVERLAY_PANEL_PERSISTENCE

## Objective
Create the docs-first BUILD bundle for overlay panel persistence with strict runtime registry authority and sample-level integration only.

## Constraints
- one PR purpose only
- no engine core changes
- debug-only scope
- sample-level integration reference: `MultiSystemDemoScene.js`

## Implementation Contract
### Adapter boundary
Use a dedicated overlay persistence adapter that exposes:
- `load()`
- `save(snapshot)`
- `clear()`

### Registry authority
- registry remains source of truth at runtime
- persistence never mutates panel state directly
- persistence restore applies through public registry calls only

### Snapshot contract
Use versioned shape:
```json
{
  "contract": "overlay.panel-state",
  "version": 1,
  "panels": {
    "panelId": true
  },
  "savedAt": 0
}
```

### Save trigger contract
Persist only after these operator commands:
- `overlay.show <panelId>`
- `overlay.hide <panelId>`
- `overlay.toggle <panelId>`
- `overlay.showAll`
- `overlay.hideAll`

### Restore contract
- apply only known registry panel IDs
- ignore unknown stored IDs
- fallback safely for invalid or missing snapshot data

## Validation Matrix
- valid snapshot restores expected enabled/disabled states
- invalid/corrupt snapshot falls back safely
- unknown IDs are ignored without errors
- command-driven state changes save through public APIs only
- no engine core files touched

## APPLY Guidance
A later APPLY implementation should:
- keep persistence logic outside engine core
- keep operator command behavior unchanged except save side-effect
- keep registry the authoritative runtime state owner
- maintain debug-only usage boundary

## Deliverables In This Bundle
- `docs/pr/PLAN_PR_OVERLAY_PANEL_PERSISTENCE.md`
- `docs/pr/BUILD_PR_OVERLAY_PANEL_PERSISTENCE.md`
- `docs/pr/APPLY_PR_OVERLAY_PANEL_PERSISTENCE.md`
- `docs/reports/change_summary.txt`
- `docs/reports/validation_checklist.txt`
- `docs/reports/file_tree.txt`
