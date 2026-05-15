# PR_26133_050 Object State Shape Behavior Report

Task: PR_26133_050-object-state-shape-grouping-and-order-controls
Date: 2026-05-15

## Shape Membership

- Object shapes remain base object geometry: `objects[*].shapes[*]` is the canonical shape list for the object.
- States own frame timelines: `objects[*].states[*].frames[*]` selects state-specific animation and visibility/transform overrides.
- Frames reference base shapes by local `shapeIndex` through `shapeOverrides`.
- Base shapes are not duplicated per state.

## Delete Behavior

- The shape tile delete button is an explicit base-shape delete.
- Base-shape delete removes that shape from the object for every state, then cleans or remaps all frame `shapeOverrides` that referenced later shape indexes.
- State/frame visibility changes do not delete the base shape.
- When an active state/frame exists, the shape visibility eye writes `shapeOverrides[*].visible` for that selected frame.
- When no active state/frame exists, visibility falls back to base shape `visible` because there is no state-specific frame to own the override.

## Group Behavior

- The schema/editor contract supports one `groupId` per shape.
- This PR enforces one group per shape; grouping selected shapes assigns a new single `groupId`.
- Selecting any member of a group selects every shape with the same `groupId`.
- Grouped shape tiles render a group icon with a deterministic color derived from the group id.
- Ungroup removes `groupId` from the selected shapes and immediately removes the tile group icons.

## Validation Evidence

- `npm run test:workspace-v2` passed with 51 tests.
- Playwright verified grouped shape selection, group indicators, ungroup behavior, state/frame visibility override behavior, and base-shape delete cleanup.
