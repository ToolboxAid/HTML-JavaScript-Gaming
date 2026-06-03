# PLAN_PR - PR_26124_047-palette-manager-right-column-and-hex-fixes

## Goal
Fix Palette Manager V2 right-column accordion height behavior, user-added swatch source handling, and 8-digit hex alpha support.

## Scope
- `toolbox/palette-manager-v2/*`
- Workflow docs_build/reports required by `docs_build/dev/PROJECT_INSTRUCTIONS.md`

## Boundaries
- Do not touch workspace/toolState/session logic.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not modify shared accordionV2.
- Do not add dependencies.
- Do not broadly refactor Palette Manager V2.

## Implementation Plan
1. Inspect Palette Manager V2 right-column markup/CSS and local controls for Import/Export and Validation/Error Viewer behavior.
2. Adjust only Palette Manager V2 CSS/markup/JS as needed so collapsed Import/Export does not consume free height, open Import/Export fills available height, and Validation/Error Viewer remains bottom-anchored with usable height.
3. Inspect Add User Swatch and selected swatch editor source handling.
4. Ensure newly created user swatches store and display `User Added` as source, and prevent editing that source value from the selected swatch editor.
5. Inspect local hex validation and input hints.
6. Accept both `#RRGGBB` and `#RRGGBBAA`, preserve alpha, and update hint text to `#RRGGBBAA`.
7. Run requested validation and produce required review artifacts and delta ZIP.

## Playwright
- Command: `npm run test:workspace-v2`
- Expected pass behavior: Workspace V2 validation remains green after Palette Manager V2-only changes.
- Expected fail behavior: failures identify Workspace V2 regressions or a missing validation command.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Collapse Import/Export and confirm it no longer consumes available vertical space.
3. Open Import/Export and confirm it fills available height above Validation/Error Viewer.
4. Confirm Validation/Error Viewer remains anchored at the bottom with usable height.
5. Add a user swatch and confirm Source displays exactly `User Added`.
6. Confirm the selected swatch Source field is not editable for user-added swatches.
7. Enter `#RRGGBB` and `#RRGGBBAA` hex values and confirm both validate and persist exactly.
