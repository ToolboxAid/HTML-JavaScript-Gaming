# PLAN_PR - PR_26124_043-palette-manager-accordion-v2

## Goal
Replace Palette Manager V2 center `details`/`summary` accordions with a local accordionV2 structure so User Palette and Add User Swatch panels share/fill available center height predictably.

## Scope
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/modules/PaletteManagerApp.js`
- `tools/palette-manager-v2/paletteManagerV2.css`
- Workflow docs_build/reports required by `docs_build/dev/PROJECT_INSTRUCTIONS.md`

## Boundaries
- Do not change palette JSON logic.
- Do not change source palette logic.
- Do not touch `tools/shared`.
- Do not touch workspace, toolState, session, games, or sample JSON.
- Do not add dependencies.
- Do not run the full samples smoke test.

## Implementation Plan
1. Replace only the center column User Palette and Add User Swatch `details` blocks with local accordionV2 sections using buttons, ARIA state, and content containers.
2. Add local Palette Manager JS binding for accordionV2 toggle state without changing palette controls or payload behavior.
3. Update Palette Manager CSS so:
   - center panel owns available height
   - both open accordionV2 panels share available height
   - one open panel fills remaining height when the other is collapsed
   - tile grids scroll internally
   - sort, size, source select/search, and pin controls remain usable
4. Run targeted syntax checks for changed JS/HTML where applicable.
5. Run `npm run test:workspace-v2`.
6. Produce required review artifacts, workflow docs, command/comment docs, and repo-structured ZIP.

## Playwright
- Command: `npm run test:workspace-v2`
- Expected pass behavior: Workspace V2 validation remains green after the Palette Manager center UI structural change.
- Expected fail behavior: failures indicate the local accordionV2 rewrite broke Workspace V2 tool launch or tool coverage assumptions.
- Full samples smoke test: skipped by instruction and because sample JSON is out of scope.

## Manual Validation
1. Open `tools/palette-manager-v2/index.html`.
2. Confirm User Palette and Add User Swatch use button-based accordionV2 headers, not center `details`/`summary`.
3. With both panels open, confirm both share center height and each tile grid scrolls internally.
4. Collapse User Palette and confirm Add User Swatch fills remaining center height.
5. Collapse Add User Swatch and confirm User Palette fills remaining center height.
6. Confirm source palette selection, search, sort, size, pin, and unpin still work.
