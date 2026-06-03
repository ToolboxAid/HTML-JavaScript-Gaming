# PR — King of the Iceberg Layout Contract

## Purpose

Define the minimal layout data contract needed for the first King of the Iceberg playable map, based on the validated tool workflow and exported baseline layout snapshot.

This PR is documentation/contract only. Do not implement gameplay.

---

## Inputs

Use the validated artifacts from the prior workflow pass:

- `tmp/uat_exports/king_of_the_iceberg_layout_snapshot.json`
- `tmp/uat_tool_layout_workflow_results.json`
- `docs_build/dev/reports/PR_tool_layout_workflow_baseline_report.md`

---

## Scope

Create a documented layout contract for the first playable King of the Iceberg arena.

The contract should describe only the fields needed to represent:

- map/layout id
- platform objects
- platform position
- platform size/bounds
- platform role
- top/control platform marker
- water zone marker
- optional render layer
- optional collision intent

---

## Contract Goals

The layout contract must support:

- 3 to 5 fragmented platforms
- visible gaps between platforms
- lowest platform reachable from water
- top platform marked as the scoring/control area
- future pass-through vs solid platform behavior
- future tile/collision refinement
- no hidden fallback data

---

## Required Contract Sections

Create:

```txt
docs_build/dev/koti_layout_contract.md
```

Include:

1. Purpose
2. Source artifacts used
3. Minimal layout object shape
4. Platform object requirements
5. Required roles
6. Optional fields
7. Validation rules
8. Example minimal layout JSON
9. Out-of-scope items

---

## Required Roles

At minimum, define these roles:

- `platform`
- `top-control-platform`
- `water-zone`
- `visual-background`
- `visual-midground`

Do not require runtime collision behavior in this PR.

---

## Validation Rules

The contract must state that a valid KOTI layout:

- Has a layout/map id
- Has at least one `top-control-platform`
- Has one `water-zone`
- Has 3 to 5 platform objects for MVP
- Has no auto-generated hidden objects
- Uses explicit roles
- Provides actionable errors for missing required fields

---

## Example Minimal Shape

The document should include a small example only, such as:

```json
{
  "id": "koti_first_arena",
  "name": "King of the Iceberg First Arena",
  "objects": [
    {
      "id": "platform_top_01",
      "role": "top-control-platform",
      "x": 420,
      "y": 140,
      "width": 180,
      "height": 24
    },
    {
      "id": "water_zone",
      "role": "water-zone",
      "x": 0,
      "y": 520,
      "width": 960,
      "height": 120
    }
  ]
}
```

Adjust field names to match the existing exported snapshot if the tool already has established names.

---

## Testing / Validation

Do not run the full samples test unless required.

Run only targeted checks:

- Confirm the contract document exists.
- Confirm it references the prior exported snapshot.
- If any script/docs check exists for markdown, run only that targeted check.
- If no code changed, `node --check` is not required.
- Do not run long sample suites for this docs-only PR.

---

## Acceptance Criteria

- `docs_build/dev/koti_layout_contract.md` exists.
- Contract is based on the validated exported layout snapshot.
- Contract defines the minimal first-playable layout shape.
- Contract includes validation rules and example JSON.
- No gameplay/runtime code is added.
- No sample games are changed.
- No `start_of_day` folders are changed.
- No full samples test is run unless a changed file requires it.

---

## Out of Scope

- Gameplay implementation
- Runtime loader implementation
- Collision physics
- Pass-through platform behavior
- Solid platform behavior
- Tileset breakout
- Parallax asset slicing
- Monetization
