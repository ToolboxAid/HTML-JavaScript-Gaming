# PR — Tool Layout Workflow Baseline

## Purpose

Validate the tool workflow needed to create, load, edit, inspect, and save a simple King of the Iceberg platform layout.

This PR is workflow validation only. Do not implement King of the Iceberg gameplay.

---

## Scope

Use the existing stabilized tools to validate the layout pipeline:

- Vector Map Editor
- Vector Asset Studio
- Sprite Editor
- State Inspector

The main focus is the Vector Map Editor workflow.

---

## Goal

Confirm the tools can support a basic screen layout workflow for King of the Iceberg:

- Create or load a simple layout
- Represent fragmented ice platforms
- Verify explicit selection behavior
- Verify object/property visibility
- Save/export the layout state
- Inspect the saved/exported state

---

## Baseline Layout Definition

Create a simple non-gameplay test layout representing the first King of the Iceberg arena concept.

### Layout Requirements

- One main iceberg area
- 3 to 5 fragmented horizontal platforms
- Visible gaps between platforms
- Lowest platform reachable from water zone
- Top platform clearly marked as control/top area
- Background/midground placeholders may be represented as non-collision objects only

### Platform Mode Note

This PR does not implement pass-through or solid platform behavior.

It only validates that the layout can represent platforms and gaps clearly enough for later gameplay work.

---

## Workflow Steps

### 1. Vector Map Editor

- Launch the tool fresh.
- Confirm no hidden/default map loads.
- Create or load an explicit test layout.
- Add 3 to 5 platform objects.
- Ensure each platform is individually selectable.
- Verify no object is auto-selected unless the user selects it.
- Select each platform and confirm selected-state display updates.
- Clear selection and confirm explicit no-selection state appears.
- Save/export the layout state.

### 2. State Inspector

- Load or paste the exported layout state.
- Confirm JSON formats correctly.
- Confirm platform objects are visible in the state.
- Confirm no silent fallback state appears.

### 3. Vector Asset Studio

- Open or create a simple ice platform/vector object if supported by existing workflow.
- Confirm fill/paint/stroke controls work on selected object.
- Confirm no-selection state disables controls with reason.

### 4. Sprite Editor

- Launch only as sanity check.
- Confirm no invalid fallback sprite loads.
- Confirm header behavior remains correct.

---

## Expected Layout Object Shape

Use existing project conventions where available.

The exported layout should make it possible to identify:

- layout/map id
- object list
- platform objects
- position
- size/bounds
- collision intent if already supported
- render/layer role if already supported

Do not invent a new runtime schema in this PR unless the existing tool requires a local test-only shape.

---

## Acceptance Criteria

- Vector Map Editor can create/load a baseline platform layout.
- 3 to 5 platform objects are visible and individually selectable.
- Explicit no-selection state is visible after clearing selection.
- Layout can be saved/exported.
- State Inspector can read/format the exported layout state.
- No silent fallback map, object, sprite, or state data appears.
- Vector Asset Studio paint/stroke behavior still works on a selected object.
- Sprite Editor launches without fallback/invalid-state regression.
- No gameplay code is added.

---

## Out of Scope

- King of the Iceberg gameplay
- Player movement
- Platform collision behavior
- Pass-through platform physics
- Solid platform physics
- Tile slicing
- Tileset breakout
- Parallax asset production
- Runtime engine refactors
- start_of_day changes

---

## Reporting

Create a short report under:

```txt
dev/reports/PR_tool_layout_workflow_baseline_report.md
```

The report must include:

- PASS/FAIL
- Changed files, if any
- Layout workflow notes
- Export/save result location
- Any blockers found
- Screenshots optional
