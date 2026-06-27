# PR_26133_038 Object Transform Scale Resize Geometry Report

Task: PR_26133_038-object-transform-scale-resize-geometry
Date: 2026-05-15

## Implementation

- Replaced the old dead resize textbox flow with a live Scale row and explicit Resize Geometry action.
- Scale controls now render in the requested order:
  `Scale [--] [-] [scale input] [+] [++] [Resize]`.
- Added scale step buttons:
  - `--` decreases by 0.10.
  - `-` decreases by 0.01.
  - `+` increases by 0.01.
  - `++` increases by 0.10.
- Scale input validates finite positive values, rejects invalid values visibly, and does not silently restore a previous value.
- Valid scale input updates the selected shape preview live and keeps JSON details and transform summary in sync.
- Resize Geometry applies the current scale to selected shape geometry, resets transform `scaleX` and `scaleY` to 1, validates the payload, marks workspace state dirty on persisted changes, and logs OK/FAIL status messages.

## Geometry Resize Support

- Polygon and triangle: scales each point around transform origin.
- Line: scales `point1` and `point2` around transform origin.
- Rectangle: scales x/y around transform origin and multiplies width/height.
- Circle: scales center and radius, requiring uniform scale.
- Ellipse: scales center and rx/ry.
- Arc: scales center and radius, requiring uniform scale.
- Text: scales x/y and font size, requiring uniform scale.

## Validation

- `npm run test:workspace-v2` passed with 51 tests.
- Added Playwright coverage for supported shape resize baking and scale reset.
- Existing Object Vector Studio V2 layout coverage now verifies the one-line Scale row and Resize Geometry tooltip.
- Existing transform coverage now verifies invalid scale rejection, live preview updates, step buttons, geometry rewrite, scale reset, and transformed bounds refresh.
- No Object Vector Studio V2 sample JSON or manifest data changes were kept.
