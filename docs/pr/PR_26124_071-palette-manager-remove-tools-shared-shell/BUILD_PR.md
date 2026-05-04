# BUILD_PR - PR_26124_071-palette-manager-remove-tools-shared-shell

## Purpose
Perform one scoped Palette Manager V2 shell extraction by removing direct `tools/shared` platform shell imports and replacing the required visible shell behavior with tool-local code and CSS.

## Scope
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/paletteManagerV2.css`
- `tools/palette-manager-v2/paletteManagerShell.js`
- PR workflow docs and required review artifacts.

## Implementation
1. Remove these Palette Manager V2 dependencies:
   - `<link rel="stylesheet" href="../shared/platformShell.css" />`
   - `<script type="module" src="../shared/platformShell.js"></script>`
2. Add a local shell script at `tools/palette-manager-v2/paletteManagerShell.js` with no imports from `tools/shared`.
3. The local shell script must:
   - add the surface classes/attributes Palette Manager CSS needs,
   - render a local Palette Manager header frame into the header host,
   - render a local status bar into the status host,
   - set summary text and attributes for expanded/collapsed/fullscreen states,
   - preserve Hide Header and Details / Show Header and Details behavior,
   - preserve fullscreen state class/attribute synchronization.
4. Update Palette Manager HTML hosts from shared-shell ownership to local shell ownership while preserving visible structure.
5. Add local CSS in `paletteManagerV2.css` for the header/status/app-shell/resize/fullscreen/control styles that were previously supplied by `platformShell.css`.
6. Keep menuSample, accordionV2 behavior, scroll behavior, right-column spacing, pin styling, and palette behavior unchanged.

## Boundaries
- Do not modify `tools/shared`.
- Do not import from `tools/shared`.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not change shared accordionV2 behavior.
- Do not clean up unrelated CSS.
- Do not remove manual CSS comments unless directly required.
- Do not change pin styling or size.
- Do not add dependencies.
- Avoid broad refactor.

## Validation
- Syntax check changed JavaScript files.
- Run a local dependency validation confirming Palette Manager V2 no longer references `../shared/platformShell.css` or `../shared/platformShell.js`.
- Run a CSS structural validation confirming braces are balanced and the EOF pin override remains in place.
- Run targeted Palette Manager V2 served-browser Playwright validation if Playwright/browser support is available.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
