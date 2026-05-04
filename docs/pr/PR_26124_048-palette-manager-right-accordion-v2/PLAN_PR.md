# PLAN_PR - PR_26124_048-palette-manager-right-accordion-v2

## Goal
Replace Palette Manager V2 right-column `details`/`summary` accordions with shared accordionV2 markup and right-column sizing rules.

## Scope
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/paletteManagerV2.css`
- Workflow docs/reports required by `docs/dev/PROJECT_INSTRUCTIONS.md`

## Boundaries
- Do not touch workspace/toolState/session logic.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not modify shared accordionV2 behavior.
- Do not add dependencies.
- Do not broadly refactor Palette Manager V2.
- Do not change left or center panel behavior.

## Implementation Plan
1. Replace right-column Import/Export `details` markup with shared accordionV2 markup.
2. Replace right-column Validation/Error Viewer `details` markup with shared accordionV2 markup.
3. Keep existing right-column button/input/status/list IDs so Palette Manager controls continue binding without behavior changes.
4. Add right-column-only accordionV2 CSS so:
   - collapsed Import/Export is header-only,
   - open Import/Export fills the remaining height above Validation/Error Viewer,
   - JSON preview fills the Import/Export content area and scrolls internally,
   - Validation/Error Viewer remains bottom-anchored, compact, and internally scrollable.
5. Remove obsolete right-column details/summary CSS overrides.
6. Run targeted syntax/layout validation and the requested Workspace V2 command.

## Playwright
- Command: `npm run test:workspace-v2`
- Expected pass behavior: Workspace V2 validation remains green after the Palette Manager V2 right-column markup/CSS change.
- Expected fail behavior: failures identify Workspace V2 regressions or a missing validation command.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2 through a local server.
2. Confirm Import/Export and Validation/Error Viewer use the same accordionV2 toggle behavior as the center column.
3. Collapse Import/Export and confirm it is header-only.
4. Open Import/Export and confirm it fills remaining right-column height above Validation/Error Viewer.
5. Confirm JSON preview starts near the buttons, stretches to the bottom of Import/Export, and scrolls internally.
6. Confirm Validation/Error Viewer remains compact at the bottom and scrolls internally when needed.
