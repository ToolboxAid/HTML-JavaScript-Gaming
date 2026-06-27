# PR_26126_091 Asset Manager V2 Bezel StretchOverride Notes

Date: 2026-05-06

## Behavior

- The Stretch Override control is hidden and disabled unless Role is `bezel`.
- Selecting or auto-detecting the `bezel` role shows the Stretch Override control.
- Bezel assets include `stretchOverride.uniformEdgeStretchPx` with default value `10`.
- Background assets do not include `stretchOverride`.
- Non-bezel assets do not apply or persist `stretchOverride`.

## Schema Enforcement

- `stretchOverride` remains allowed only for `assets.image.bezel.*` entries.
- Generic/non-bezel asset IDs reject `stretchOverride` through schema validation.

## Validation

- `npm run test:workspace-v2`: passed, 10 tests.
- Playwright validates hidden initial stretch controls, hidden background stretch controls, visible bezel stretch controls, default value `10`, and Output Summary bezel-only persistence.
