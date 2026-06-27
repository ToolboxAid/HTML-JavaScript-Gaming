# King of the Iceberg Layout Contract

## 1. Purpose

Define the minimal, explicit data contract for a King of the Iceberg (KOTI) baseline layout using validated tool workflow artifacts. This contract is documentation-only and does not introduce gameplay or runtime behavior.

## 2. Source Artifacts Used

- `dev/workspace/artifacts/tmp/uat_exports/king_of_the_iceberg_layout_snapshot.json`
- `dev/workspace/artifacts/tmp/uat_tool_layout_workflow_results.json`
- `dev/reports/PR_tool_layout_workflow_baseline_report.md`

Observed baseline facts from these artifacts:

- Exported baseline layout contains 4 fragmented ice platform objects.
- Selection behavior includes explicit no-selection state.
- Save/export workflow completed and produced the snapshot artifact.

## 3. Minimal Layout Object Shape

The minimal KOTI layout uses explicit map metadata and explicit object roles.

```json
{
  "documentData": {
    "name": "koti_first_arena",
    "mode": "2d",
    "width": 1600,
    "height": 900,
    "objects": [
      {
        "id": "obj-001",
        "name": "Top Control Platform",
        "kind": "polyline",
        "role": "top-control-platform",
        "points": [
          { "x": 640, "y": 300, "z": 0 },
          { "x": 840, "y": 300, "z": 0 }
        ]
      }
    ]
  }
}
```

## 4. Platform Object Requirements

- Platform objects are objects whose `role` is `platform` or `top-control-platform`.
- MVP requires 3 to 5 platform objects total.
- Each platform object must include:
  - `id` (non-empty string)
  - `name` (non-empty string)
  - `kind` (for baseline exports, `polyline` is valid)
  - `role` (explicit role value)
  - `points` (at least 2 points with numeric `x` and `y`)
- Platform objects must be explicitly authored in layout data. Hidden/generated fallback platforms are not allowed.

## 5. Required Roles

The layout contract requires explicit use of these roles:

- `platform`
- `top-control-platform`
- `water-zone`
- `visual-background`
- `visual-midground`

Role notes:

- At least one object must have role `top-control-platform`.
- Exactly one object must represent the `water-zone` for MVP validation.
- `visual-background` and `visual-midground` may be represented as geometry or non-interactive scene objects, but roles must still be explicit.

## 6. Optional Fields

Optional fields are permitted when present in authored data:

- Layout-level: `version`, `background`
- Object-level: `style`, `flags`, `center`, `rotation`, `space`, `closed`
- Point-level: `z`, `color`

Optional fields do not replace required fields and cannot be used to infer missing required roles.

## 7. Validation Rules

A KOTI layout is valid only when all rules pass:

1. Layout/map id is required:
   - `documentData.name` must exist and be non-empty.
2. At least one `top-control-platform` is required.
3. One `water-zone` is required.
4. MVP layout has 3 to 5 platform objects (`platform` + `top-control-platform`).
5. Roles must be explicit (`role` is required on each contract-relevant object).
6. Hidden fallback objects are not allowed.
7. Missing required fields produce actionable errors.

Actionable error examples:

- `Missing required layout id: documentData.name`
- `Missing required role: top-control-platform`
- `Missing required role: water-zone`
- `Invalid platform count: expected 3-5, found <n>`
- `Object <id> is missing explicit role`

## 8. Example Minimal Layout JSON

```json
{
  "documentData": {
    "name": "koti_first_arena",
    "mode": "2d",
    "width": 1600,
    "height": 900,
    "objects": [
      {
        "id": "obj-top-01",
        "name": "Top Control Platform",
        "kind": "polyline",
        "role": "top-control-platform",
        "points": [
          { "x": 700, "y": 290, "z": 0 },
          { "x": 900, "y": 290, "z": 0 }
        ]
      },
      {
        "id": "obj-plat-01",
        "name": "Platform 01",
        "kind": "polyline",
        "role": "platform",
        "points": [
          { "x": 420, "y": 520, "z": 0 },
          { "x": 620, "y": 520, "z": 0 }
        ]
      },
      {
        "id": "obj-plat-02",
        "name": "Platform 02",
        "kind": "polyline",
        "role": "platform",
        "points": [
          { "x": 760, "y": 570, "z": 0 },
          { "x": 980, "y": 570, "z": 0 }
        ]
      },
      {
        "id": "obj-water-01",
        "name": "Water Zone",
        "kind": "rectangle",
        "role": "water-zone",
        "points": [
          { "x": 0, "y": 760, "z": 0 },
          { "x": 1600, "y": 900, "z": 0 }
        ]
      },
      {
        "id": "obj-bg-01",
        "name": "Background Visual",
        "kind": "rectangle",
        "role": "visual-background",
        "points": [
          { "x": 0, "y": 0, "z": 0 },
          { "x": 1600, "y": 900, "z": 0 }
        ]
      },
      {
        "id": "obj-mg-01",
        "name": "Midground Visual",
        "kind": "polyline",
        "role": "visual-midground",
        "points": [
          { "x": 120, "y": 680, "z": 0 },
          { "x": 1480, "y": 680, "z": 0 }
        ]
      }
    ]
  }
}
```

## 9. Out-of-Scope Items

- Gameplay logic
- Runtime engine loader implementation details
- Collision physics tuning
- Platform pass-through/solid behavior implementation
- Tileset breakout and art slicing
- Sample game/runtime code changes
