# PLAN_PR - PR_26124_071-palette-manager-remove-tools-shared-shell

## Goal
Remove Palette Manager V2 dependency on `src/shared/toolbox/platformShell.css`, `src/shared/toolbox/platformShell.js`, and shared runtime layout behavior while preserving the current Palette Manager surface behavior.

## Scope
- `toolbox/palette-manager-v2/index.html`
- `toolbox/palette-manager-v2/paletteManagerV2.css`
- `toolbox/palette-manager-v2/paletteManagerShell.js`
- PR workflow docs and required review artifacts.

## Boundaries
- Do not modify `toolbox/shared`.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not change shared accordionV2 behavior.
- Do not clean up unrelated CSS.
- Do not remove manual CSS comments unless directly required.
- Do not change pin styling or size.
- Do not add dependencies.
- Avoid broad refactor.

## Implementation Plan
1. Remove Palette Manager V2 imports of `../shared/platformShell.css` and `../shared/platformShell.js`.
2. Keep existing Palette Manager layout class names where local tests already assert them.
3. Add a local `paletteManagerShell.js` that:
   - mounts the Palette Manager header/details shell into the local header host,
   - mounts the local status bar,
   - owns Hide Header and Details / Show Header and Details summary behavior,
   - owns fullscreen state classes/attributes that Palette Manager CSS already consumes.
4. Add local Palette Manager CSS for only the shared-shell styles Palette Manager still needs:
   - body surface variables/background,
   - header/status frame,
   - app-shell bounds,
   - resize-panel behavior,
   - fullscreen summary/layout behavior,
   - local control focus/disabled styling.
5. Preserve menuSample, accordionV2, scroll behavior, right-column spacing, and EOF pin override behavior.

## Playwright
- Targeted Palette Manager V2 served-browser validation will verify:
  - no `src/shared/toolbox/platformShell.*` assets are loaded,
  - header/details summary renders,
  - Hide Header and Details collapse behavior remains,
  - Palette Manager app controls render,
  - menuSample buttons remain centered.
- Command: targeted inline Playwright validation if Playwright is available.
- Default gate: `npm run test:workspace-v2`
- Expected pass behavior: Palette Manager loads without shared shell assets and Workspace V2 validation remains green.
- Expected fail behavior: missing Playwright/browser install, missing `test:workspace-v2` script, or runtime regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Confirm the header/details area is visible on load.
3. Click Hide Header and Details, then confirm the header collapses and the wide layout/fullscreen presentation remains usable.
4. Exit fullscreen or show details and confirm the header returns.
5. Confirm menuSample, accordions, scroll areas, right-column spacing, pin styling, and palette behavior are unchanged.
