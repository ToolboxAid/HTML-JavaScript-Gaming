# Root Tools Original Parity Recovery Validation

PR: PR_26152_051-root-tools-original-parity-recovery

## Scope

Restored only these already-migrated root Tools pages:

- toolbox/index.html
- toolbox/ai-assistant.html
- toolbox/animation-studio.html
- toolbox/asset-studio.html
- toolbox/code-studio.html
- toolbox/input-studio.html
- toolbox/midi-studio.html
- toolbox/object-vector-studio.html
- toolbox/palette-manager.html
- toolbox/particle-studio.html
- toolbox/sound-studio.html
- toolbox/storage-inspector.html

No Admin, Account, Company, Games, Samples, root index, CSS, Theme V2 CSS, or additional tool pages were changed.

Continuation note: this work started from the approved PR_26152_050 delta_2 state. A leftover prior report artifact was normalized back to the committed delta_2 content before this Tools work began.

Historical source of truth used: `870cc75d97ac787664e2cb4d8b960194c0b82772:GameFoundryStudio/tools/*.html`, the parent of `8f326e43b` (`PR_26152_038-root-tools-index-migration`), which is the first root/Theme V2 Tools migration commit.

## Source Match Validation

Result: PASS

Each restored root page was compared against its matching historical `GameFoundryStudio/tools` source after only these root-path transforms:

- Insert `<base href="../GameFoundryStudio/">` so root `/toolbox/*.html` pages can load the approved GameFoundryStudio assets and partials.
- Convert source `../assets/*` references to `assets/*` under the base path.
- Convert the missing center image filename `assets/images/forge-bot.png` to existing `assets/images/forge-bot-single.png`; the old filename is absent from both the current and historical image tree.
- Add `data-asset-root`, `data-tool-slug`, and `data-tool-icon-src` to each standalone page's `data-tool-display-mode` slot so external `tool-display-mode.js` loads badges and character images correctly from root pages.

## Static Affected Tools Validation

Result: PASS

Validated:

- 12 restored root Tools pages match transformed historical source content.
- 193 path and metadata references resolve, including CSS, JS, partials, center images, badge images, character images, generated tool tile images, generated badge object paths, and root migrated tool links.
- `/toolbox/index.html` includes sorting and grouping controls, accordion list slot, and legacy accordion stack/tile layout marker.
- Existing `GameFoundryStudio/assets/js/tools-page-accordions.js` contains the expected grouping, sorting, group label, badge, tile, and card-grid behavior markers.
- All affected pages include header/footer partial slots.
- No affected page contains inline `style` attributes, `<style>` blocks, inline script blocks, inline event handlers, or `imageDataUrl`.
- `git diff --check` passed for the affected root Tools pages.

## Targeted Browser Validation

Result: PASS

A temporary local HTTP server was started inside the validation script and closed after validation. Only affected root Tools pages were opened.

Validated in browser:

- `/toolbox/index.html` loads header and footer partials.
- `/toolbox/index.html` renders 18 tool cards from the existing tool metadata.
- Tool tile images load successfully.
- Badge object paths are present for rendered cards.
- Sorting/grouping controls exist.
- Grouped mode renders 9 grouped accordions.
- A migrated root tool link resolves to `/toolbox/ai-assistant.html`.
- Each of the 11 standalone root tool pages loads header and footer partials.
- Each standalone page loads display badge, display character, center ForgeBot image, left/right tool columns, vertical accordions, and horizontal accordion toggles.
- No browser console errors were reported during the targeted affected-page pass.

## CSS Validation

Result: PASS

No CSS files changed. Theme V2 CSS was not modified. No CSS was added.

## Unrelated Page Validation

Result: PASS

Before report generation, `git diff --name-only` listed only the 12 affected root Tools HTML pages. No Admin, Account, Company, Games, Samples, root index, or unrelated tool directories were changed.

## Commands Run

- Read: `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- Source discovery: `git log --all -- GameFoundryStudio/tools/*.html toolbox/*.html`
- Source read/restore: `git show 870cc75d97ac787664e2cb4d8b960194c0b82772:GameFoundryStudio/tools/<page>.html`
- Static affected Tools validation with Node.
- Targeted browser validation with an in-script local HTTP server and Playwright Chromium for the affected root Tools pages only.
- Targeted whitespace validation: `git diff --check -- toolbox/index.html toolbox/ai-assistant.html toolbox/animation-studio.html toolbox/asset-studio.html toolbox/code-studio.html toolbox/input-studio.html toolbox/midi-studio.html toolbox/object-vector-studio.html toolbox/palette-manager.html toolbox/particle-studio.html toolbox/sound-studio.html toolbox/storage-inspector.html`

## Tests Not Run

Repo-wide tests were not run, per BUILD instruction. `npm run test:workspace-v2` was not run because this PR does not change Workspace V2, toolState, engine, capture, or runtime handoff behavior and the BUILD requested only affected root Tools validation. Full samples smoke test: SKIP because no sample files or sample runtime were changed.

## Manual Validation

1. Open `/toolbox/index.html`.
2. Confirm the approved legacy title, sorting controls, generated tool cards, images, badges, group labels, tile outlines, header, and footer render.
3. Use `Grouped` and `Order A-Z` controls and confirm grouping/sorting behavior updates the rendered tool list.
4. Open each restored root tool page listed in Scope.
5. Confirm each page shows the approved legacy source content, header/footer partials, left/right tool columns, accordions, display badge/character, and center ForgeBot image.
