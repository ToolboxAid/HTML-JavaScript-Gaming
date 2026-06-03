# PR_26152_001-gamefoundry-nav-tools-games-cleanup Validation

## Scope

- Scope limited to `GameFoundryStudio` implementation files plus required `docs_build/dev` reports.
- No new CSS files were created.
- No inline CSS, inline JavaScript, or inline event handlers were added.

## Changes

- Renamed the top-level shared NAV item from Arcade to Games.
- Moved Arcade under the Games submenu.
- Added Games submenu category links:
  - Arcade
  - Action
  - Adventure
  - Puzzle
  - Racing
  - Retro
  - Strategy
- Alphabetized the Tools submenu by visible tool name.
- Alphabetized the Tools page tiles by visible title.
- Kept only implemented tool pages in the Tools submenu.
- Moved non-real tool/group links to the Account submenu:
  - Assets / Content
  - Building / Creation
  - Settings and Admin
  - Design / Animation
  - Media / Community
  - Technology / System
  - Tool Builder
  - Tool Creator
- Removed the Settings Studio group tile from the Tools page.
- Updated `gamefoundry-partials.js` route mappings and active-state logic for Games, real Tools, and Account utility pages.

## Validation

Passed:

- `rg -n 'Arcade</a>|Games|Action|Adventure|Puzzle|Racing|Retro|Strategy' GameFoundryStudio/assets/partials/header-nav.html`
  - Result: top-level `Games` is present; `Arcade` appears only in the Games submenu.
- `rg -n '<a data-nav-link' GameFoundryStudio/assets/partials/header-nav.html`
  - Result: Tools submenu is alphabetized and Account submenu contains the moved non-real tool/group links.
- `rg -n '<h3>' GameFoundryStudio/tools/index.html`
  - Result: Tools page tiles are alphabetized by visible title.
- `rg --pcre2 -n '<style\b|<script(?![^>]*\bsrc=)|\son[a-zA-Z]+\s*=|\sstyle\s*=' GameFoundryStudio -g '*.html'`
  - Result: no matches.
- `node --check GameFoundryStudio/assets/js/gamefoundry-partials.js`
- `npm run test:playwright:static`

Blocked or not run:

- Targeted Node/PowerShell local link-resolution script attempts were intermittently blocked by the sandbox with `windows sandbox: spawn setup refresh`.
- `git diff --check` was intermittently blocked by the sandbox with `windows sandbox: spawn setup refresh`.
- Delta ZIP packaging to `tmp/PR_26152_001-gamefoundry-nav-tools-games-cleanup_delta.zip` was blocked by the sandbox with `windows sandbox: spawn setup refresh`.
- Full samples smoke test was not run per instruction.

## Playwright Impact

Playwright impacted: No. This PR changes static GameFoundryStudio navigation/catalog HTML and shared partial route mapping, not Workspace V2/toolState/runtime behavior. Existing Playwright coverage does not target GameFoundryStudio navigation pages.
