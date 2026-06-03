# PLAN_PR - PR_26124_044-accordionv2-theme-extract

## Goal
Move the working Palette Manager accordionV2 implementation into a reusable theme component under `src/engine/theme/accordionV2/`.

## Scope
- `src/engine/theme/accordionV2/accordionV2.css`
- `src/engine/theme/accordionV2/accordionV2.js`
- `toolbox/palette-manager-v2/index.html`
- `toolbox/palette-manager-v2/modules/PaletteManagerApp.js`
- `toolbox/palette-manager-v2/paletteManagerV2.css`
- Workflow docs_build/reports required by `docs_build/dev/PROJECT_INSTRUCTIONS.md`

## Boundaries
- Do not change accordion behavior.
- Do not change palette JSON logic.
- Do not change source palette logic.
- Do not touch workspace, toolState, session, games, or sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Do not introduce abstraction beyond accordionV2.

## Implementation Plan
1. Create `src/engine/theme/accordionV2/accordionV2.css` with generic `accordion-v2` class names and no Palette Manager selectors.
2. Create `src/engine/theme/accordionV2/accordionV2.js` with minimal toggle behavior for existing multi-open accordion behavior.
3. Update Palette Manager center markup to use shared generic accordion class names.
4. Import shared accordionV2 CSS and JS from Palette Manager.
5. Remove Palette Manager local accordionV2 behavior/CSS now owned by the shared theme component.
6. Run syntax checks for changed JS/HTML/CSS where applicable.
7. Run `npm run test:workspace-v2`.
8. Skip the full samples smoke test.

## Playwright
- Command: `npm run test:workspace-v2`
- Expected pass behavior: Workspace V2 validation remains green after Palette Manager consumes the shared accordionV2 component.
- Expected fail behavior: failures identify Workspace V2 launch/tool lifecycle regressions or a missing validation command.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open `toolbox/palette-manager-v2/index.html`.
2. Confirm User Palette and Add User Swatch use shared `.accordion-v2` markup.
3. Confirm both open panels share center height.
4. Collapse either panel and confirm the other fills available center height.
5. Confirm source select, search, sort, size, pin, and unpin still work.
