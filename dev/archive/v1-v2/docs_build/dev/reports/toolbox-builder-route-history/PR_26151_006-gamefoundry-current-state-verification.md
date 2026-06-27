# PR_26151_006-gamefoundry-current-state-verification

## Scope

Verification-only audit of the current `GameFoundryStudio` state.

No `GameFoundryStudio` source files were modified.

## Summary

The current GameFoundryStudio implementation is partially aligned with the intended shared structure. The newer nested pages under `GameFoundryStudio/tools/`, `GameFoundryStudio/tools/groups/`, and `GameFoundryStudio/account/` use shared partial slots and external JS/CSS. Several legacy root-level duplicates still exist and carry hardcoded header/footer markup, older routes, and incomplete Account submenu coverage.

## PRESENT

- The old GameFoundryStudio JSON palette exists and parses as JSON.
- The old JSON palette defines six proposed meaning colors:
  - `molten-orange` - Building / Creation
  - `electric-blue` - Technology / System
  - `forge-gold` - Assets / Content
  - `arcade-cyan` - Media / Audio / Community
  - `purple` - Design / Animation
  - `steel-gray` - Configuration / Admin
- CSS color files exist for all six meanings under `GameFoundryStudio/assets/css/colors/`.
- `GameFoundryStudio/assets/css/styles.css` imports `base.css`, all six color files, `pages.css`, and `tools.css`.
- Shared header/nav/footer partial files exist:
  - `GameFoundryStudio/assets/partials/header-nav.html`
  - `GameFoundryStudio/assets/partials/footer.html`
  - `GameFoundryStudio/assets/partials/page-shell.html`
- `GameFoundryStudio/assets/js/gamefoundry-partials.js` exists and rewrites shared partial links for nested page paths.
- Account submenu entries for `Branding` and `Controls` are present in `header-nav.html`.
- `gamefoundry-partials.js` contains route entries for `branding` and `controls`.
- Nested Account pages exist:
  - `GameFoundryStudio/account/branding.html`
  - `GameFoundryStudio/account/controls.html`
- Nested Tool Builder, Tool Creator, and Tool Publisher pages exist:
  - `GameFoundryStudio/tools/tool-builder.html`
  - `GameFoundryStudio/tools/tool-creator.html`
  - `GameFoundryStudio/tools/tool-publisher.html`
- Tool Display Mode is present on the nested Tool Builder, Tool Creator, and Tool Publisher pages through `id="toolDisplayMode"` plus `tool-display-mode.js`.
- `GameFoundryStudio/assets/partials/tool-page-shell.html` exists.
- Static HTML checks found no inline `<style>` blocks, no inline `<script>` blocks, no inline event handler attributes, and no inline `style=` attributes in GameFoundryStudio HTML.

## MISSING

- `GameFoundryStudio/assets/css/controls.css` does not exist.
- `GameFoundryStudio/assets/partials/tool-shell.html` does not exist.
- No existing GameFoundryStudio-specific Playwright navigation/page-load test was found in the current test tree, so Playwright was not run.

## PARTIAL

- Six meaning/category pages exist in both root-level and nested `toolbox/groups/` forms:
  - root: `building-creation.html`, `technology-system.html`, `assets-content.html`, `media-community.html`, `design-animation.html`, `configuration-admin.html`
  - nested: `toolbox/groups/building-creation.html`, `toolbox/groups/technology-system.html`, `toolbox/groups/assets-content.html`, `toolbox/groups/media-community.html`, `toolbox/groups/design-animation.html`, `toolbox/groups/configuration-admin.html`
- The nested category pages use shared partial slots. The root-level category pages still carry hardcoded header/footer markup and are legacy duplicates.
- Root-level `tool-builder.html`, `tool-creator.html`, and `tool-publisher.html` exist, but the shared header routes now point to nested `toolbox/tool-*.html` pages. The root-level tool pages remain duplicate/legacy surfaces.
- Root-level `controls.html` exists, but the shared Account submenu points to `account/controls.html`. The root-level controls page still has hardcoded navigation and no shared partial slot.
- `page-shell.html` and `tool-page-shell.html` exist as partials, but audited pages do not consume those shell partials directly. Pages use shared header/footer slots and local `<main>` / `.tool-workspace` markup.
- CSS ownership is split across `base.css`, `pages.css`, `tools.css`, and color files. There is no separate controls-specific ownership file.

## BROKEN

- Legacy root-level pages contain stale hardcoded navigation that does not include the Account submenu with Branding and Controls.
- Several legacy root-level pages still link old root routes such as `tools.html`, `games.html`, `account.html`, and root-level category pages while the shared route map points to nested `toolbox/index.html`, `arcade/index.html`, `account/index.html`, and `toolbox/groups/*.html`.
- Root-level duplicate pages can drift from the shared header/nav/footer SSoT because they do not use `data-partial="header-nav"` and `data-partial="footer"`.
- `tool-page-shell.html` is present, but there is no corresponding `tool-shell.html`; any expected `tool-shell.html` consumer would fail until the intended shell name is clarified or implemented.

## Validation

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.
- Ran read-only file discovery for `GameFoundryStudio`.
- Read exact target files and immediate dependencies for colors, CSS, partials, JS partial loader, target pages, and tool display mode.
- Parsed the old GameFoundryStudio JSON palette with Node.
- Ran static inline CSS/JS/event-handler checks:
  - `<style\b`
  - `<script(?![^>]*\bsrc=)`
  - `\son[a-zA-Z]+\s*=`
  - `\sstyle\s*=`
- Ran `git diff --check`.
- Full samples smoke test was not run per instruction.
- Playwright was skipped because no existing GameFoundryStudio navigation/page-load test was found that could run without source changes.

## RECOMMENDED NEXT PR

Create a focused cleanup PR to remove or redirect the root-level legacy GameFoundryStudio duplicates, standardize all active pages on shared header/footer partial slots, and settle the shell ownership decision:

- choose `tool-page-shell.html` as the active tool shell name or add the missing `tool-shell.html` alias intentionally
- move Controls-specific styles into `controls.css` only if separate ownership is desired
- ensure active navigation links only target the canonical nested pages
- add a small GameFoundryStudio Playwright navigation/page-load test after canonical routes are settled
