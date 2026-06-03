# Middle Rounding And Snap Angle UI Verification

PR: PR_26133_084-fix-actual-middle-rounding-and-snap-angle-rotate-ui

## Status

- PASS: middle/interior point rounding visibly changes rendered geometry.
- PASS: Snap Angle Rotate uses constrained dropdown controls when enabled.

## Middle/Interior Rounding

- Verified polygon point rows still have one rounding checkbox per row.
- Verified checking point 2 changes the rendered polygon from a straight `polygon` to a rendered `path` with a quadratic `Q` curve.
- Verified checking point 3 adds a second independent `Q` curve.
- Verified unchecking point 2 leaves point 3 rounded and point 2 square.
- Verified polyline middle points use the same rendered `path` + `Q` curve behavior.
- Verified start/end rounding remains covered by independent arc endpoint checks.
- Verified `[+]` still copies and inserts a point after the current row.
- Verified trash still deletes only that row and keeps schema minimum-point guards.

## Snap Angle Rotate UI

- Verified Snap Angle disabled:
  - numeric Rotate textbox enabled
  - Rotate dropdown disabled
  - Snap Angle Step selector disabled
- Verified Snap Angle enabled:
  - numeric Rotate textbox disabled
  - Rotate dropdown enabled
  - Snap Angle Step selector enabled
- Verified default Step `15` dropdown values:
  - `0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345`
- Verified Step `45` dropdown values:
  - `0, 45, 90, 135, 180, 225, 270, 315`
- Verified selecting `45` from the dropdown rotates the selected shape by `45` degrees.
- Verified disabling Snap Angle restores raw numeric rotation input; entering `-30` applies the raw delta.

## Validation

- PASS: npm run test:workspace-v2
- Result: 54 passed
- Console/runtime errors: none observed in the exercised Object Vector Studio V2 flows.
