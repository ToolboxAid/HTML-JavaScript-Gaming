# PLAN_PR - PR_26124_045-palette-manager-hidden-header-wide-layout

## Goal
Update Palette Manager V2 layout only when the shared platform header/details area is hidden.

## Existing Platform State
- `tools/shared/platformShell.js` already applies fullscreen/hidden-header state through `html:fullscreen`, `tools-platform-fullscreen-active`, and `data-tools-platform-fullscreen`.
- Palette Manager will consume that existing state with CSS only.

## Scope
- `tools/palette-manager-v2/paletteManagerV2.css`
- Workflow docs_build/reports required by `docs_build/dev/PROJECT_INSTRUCTIONS.md`

## Boundaries
- Do not change normal non-hidden-header layout.
- Do not change accordionV2 behavior.
- Do not change workspace/toolState/session code.
- Do not change sample JSON.
- Do not modify `tools/shared`.
- Do not modify shared `accordionV2`.
- Do not add dependencies.
- Do not broad refactor.

## Implementation Plan
1. Add Palette Manager CSS overrides scoped to the existing hidden-header/fullscreen platform state.
2. In hidden-header state, let the app shell use full available width.
3. Anchor left and right panels to their grid edges and let the center column fill remaining horizontal space.
4. In hidden-header state, make the Palette Manager root/layout/panels consume available viewport height.
5. Preserve normal non-hidden-header layout by keeping all overrides under hidden-header/fullscreen selectors.
6. Run CSS/manual layout validation and requested validation commands.

## Playwright
- Command: `npm run test:workspace-v2`
- Expected pass behavior: Workspace V2 validation remains green after the Palette Manager hidden-header layout override.
- Expected fail behavior: failures identify Workspace V2 validation regressions or a missing validation command.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open `tools/palette-manager-v2/index.html`.
2. Confirm normal layout is unchanged before hiding the header/details area.
3. Click `Hide Header and Details`.
4. Confirm left column anchors left, right column anchors right, and center fills remaining horizontal space.
5. Confirm center panel uses available viewport height.
6. Confirm accordionV2 open/collapse behavior remains unchanged.
