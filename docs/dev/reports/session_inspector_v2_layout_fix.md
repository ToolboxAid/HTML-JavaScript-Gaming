# PR_26128_013 Session Inspector V2 Layout Fix

## Summary
Session Inspector V2 layout was tightened so controls, counts, and the local shell match the V2 tool frame pattern.

## Changes
- Added a `Return to Workspace` control to Session Inspector V2.
- Moved `Refresh`, `Delete All`, and `Clear Status` into a `Controls` accordion above `Filters`.
- Updated the count display to the requested three-line format:
  - `(N) Entries shown.`
  - `(N) SessionStorage.`
  - `(N) LocalStorage.`
- Kept all Session Inspector V2 accordions mounted through the shared accordion behavior.
- Fixed accordion header child-click handling so clicking header labels or icons toggles button-backed accordions, matching the Status accordion behavior.
- Boxed the Session Inspector V2 header frame and app shell with V2 frame/display-box styling and existing theme tokens.
- Preserved per-entry Delete and Delete All behavior.

## Boundaries
- No cross-tool communication was added.
- Preview Generator V2 behavior was not changed.
- No sample JSON was modified.
- Roadmap content was not modified.

## Validation
- `npm run test:workspace-v2`: PASS, 14 tests passed.
- Verified Session Inspector V2 has `Return to Workspace`.
- Verified the count display uses the requested parenthesized three-line format.
- Verified `Refresh`, `Delete All`, and `Clear Status` are inside the `Controls` accordion above `Filters`.
- Verified every Session Inspector V2 accordion opens and closes from header label and icon clicks.
- Verified below-header content uses boxed V2 frame styling.
- Verified per-item Delete and Delete All still work and update the UI immediately.

## Skipped
Full samples smoke test was skipped as requested. This PR is scoped to Session Inspector V2 layout, controls, and targeted Workspace Manager V2 launch coverage; sample runtime behavior is outside the changed surface.
