# BUILD_PR - PR_26124_058-palette-manager-baseline-restore-and-hardening

## Purpose
Create a pre-hardening rollback snapshot of Palette Manager V2 and apply one scoped hardening pass so Palette Manager V2 becomes the clean base pattern for future tools.

## Scope
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/paletteManagerV2.css`
- `tools/palette-manager-v2/modules/PaletteManagerApp.js`
- `tools/palette-manager-v2/controls/SourcePaletteBrowserControl.js`
- `docs/dev/reports/PR_26124_058-palette-manager-restore-point/*`
- PR workflow docs and required review artifacts only.

## Restore Point
Before changing runtime files, create:
`docs/dev/reports/PR_26124_058-palette-manager-restore-point/`

Include copies of the current runtime files that will be edited:
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/paletteManagerV2.css`
- `tools/palette-manager-v2/modules/PaletteManagerApp.js`
- `tools/palette-manager-v2/controls/SourcePaletteBrowserControl.js`

Include a `README.md` explaining that this is the pre-hardening rollback snapshot.

## Implementation
1. Convert remaining left-column `details`/`summary` accordions to shared `accordionV2`.
2. Remove local left accordion implementation CSS that is no longer used.
3. Add local left-panel styling only as needed to consume shared accordionV2.
4. Remove right-column `justify-content: space-between`; keep existing explicit flex sizing behavior.
5. Fold pin button patch CSS into the primary pin button and tile pin button rules.
6. Remove redundant patch-style pin button CSS leftovers.
7. Replace source-sensitive source tile duplicate detection with User Palette duplicate-rule detection.
8. Ensure individual source pin validates duplicates with name, RGB/hex, and symbol before adding.
9. Keep `Pin All` duplicate behavior intact.
10. Normalize tag status messages to use lowercase stored tag values.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Do not create `start_of_day` files.
- Do not broadly refactor Palette Manager V2.

## Validation
- Syntax check changed JavaScript files.
- Run targeted served-browser Palette Manager V2 hardening validation.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
