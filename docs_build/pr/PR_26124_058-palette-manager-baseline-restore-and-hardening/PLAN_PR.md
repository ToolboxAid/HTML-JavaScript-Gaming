# PLAN_PR - PR_26124_058-palette-manager-baseline-restore-and-hardening

## Goal
Create a rollback snapshot of the current working Palette Manager V2, then harden Palette Manager V2 so it can serve as the clean base pattern for future tool rebuilds.

## Scope
- `toolbox/palette-manager-v2/*`
- `docs_build/dev/reports/PR_26124_058-palette-manager-restore-point/*`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Do not create `start_of_day` files.
- Avoid broad refactor.
- Preserve current working Palette Manager V2 behavior.

## Restore Point
Before changing runtime files, copy the current runtime files that will be edited into:
`docs_build/dev/reports/PR_26124_058-palette-manager-restore-point/`

The restore point must include:
- `README.md`
- `toolbox/palette-manager-v2/index.html`
- `toolbox/palette-manager-v2/paletteManagerV2.css`
- `toolbox/palette-manager-v2/modules/PaletteManagerApp.js`
- `toolbox/palette-manager-v2/controls/SourcePaletteBrowserControl.js`

## Implementation Plan
1. Convert the remaining left-column `details`/`summary` accordions to the shared `accordionV2` markup.
2. Replace local left accordion CSS with shared accordionV2 consumption styling.
3. Fix source swatch duplicate detection so source tiles use User Palette duplicate rules instead of source-sensitive `swatchKey`.
4. Ensure individual source pin uses the same duplicate guards as `Pin All`: name, RGB/hex, and symbol.
5. Normalize tag status messages so they use lowercase stored tag values.
6. Fold the patch-style pin button CSS into the primary pin button rules.
7. Remove right-column `justify-content: space-between` and keep the explicit flex sizing rules.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by the Palette Manager V2-only hardening update.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Confirm Selected Swatch, User Defined Swatch, and Tags use the shared accordionV2 expand/collapse behavior.
3. Confirm User Palette and Sample Palette Swatch accordions still work.
4. Pin a source swatch and confirm the source tile shows pinned when name, RGB/hex, or symbol matches a User Palette swatch.
5. Try to pin the same source swatch again and confirm duplicate validation blocks it.
6. Add, remove, toggle, and delete tags and confirm messages use lowercase tag values.
7. Confirm pin button visuals match the prior working UI without patch-style CSS leftovers.
