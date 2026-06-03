# PLAN_PR - PR_26124_077-palette-manager-final-exit-pass

## Goal
Perform a final Palette Manager V2 stabilization audit before marking the tool complete.

## Scope
- `tools/palette-manager-v2/*`
- Required PR workflow docs and review artifacts.

## Boundaries
- Fix only concrete issues found during the exit-pass audit.
- Do not introduce features.
- Do not refactor structure.
- Do not touch workspace/toolState behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Do not run the full samples smoke test.

## Checks
1. Confirm Palette Manager V2 has no `tools/shared` dependencies.
2. Confirm no stale CSS override artifacts remain where they create layout maintenance risk.
3. Confirm no duplicate controls or duplicate IDs.
4. Confirm required refs exist and are used by controls.
5. Confirm URL preset loading remains stable.
6. Confirm Validation/Error Viewer Clear remains scoped to the viewer.
7. Confirm Tag sort keeps untagged swatches last.
8. Confirm source pin scroll preservation remains stable.
9. Confirm there is no silent fallback data path.

## Implementation Plan
1. Remove only confirmed dead/stale Palette Manager V2 CSS override comments if present.
2. Leave active layout, pin styling, controls, JSON behavior, URL preset loading, and sample data untouched.
3. If no runtime issue is found beyond dead CSS comments, make no JavaScript or HTML changes.

## Playwright
- Targeted Palette Manager V2 Playwright validates baseline load, accordions, validation clear location, source pin scroll preservation, and Tag sort untagged-last behavior.
- Targeted URL preset validation confirms the PR076 startup preset path remains stable.
- Expected pass behavior: Palette Manager V2 loads without console/runtime errors and all targeted behaviors pass.
- Expected fail behavior: any regression in controls, sorting, pin scroll, or URL preset loading fails the targeted validation.
- Default requested gate: `npm run test:workspace-v2`

## Manual Validation
1. Open `/tools/palette-manager-v2/index.html`.
2. Collapse/expand User Palette, Sample Palette Swatch, Tags, Selected Swatch, User Defined Swatch, Palette JSON, and Validation/Error Viewer.
3. Confirm Import JSON, Copy JSON, and Export JSON remain centered and clickable.
4. Confirm Validation/Error Viewer Clear clears displayed messages and future validation messages still appear.
5. Confirm source swatch pinning does not jump the source grid scroll position.
6. Confirm opening with `samplePresetPath=/samples/phase-02/0219/sample.0219.palette.json` loads the sample palette.
