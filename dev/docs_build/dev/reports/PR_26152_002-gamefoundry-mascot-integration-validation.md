# PR_26152_002-gamefoundry-mascot-integration Validation

## Scope

- Scope was limited to `GameFoundryStudio` implementation files plus required `docs_build/dev` reports.
- No new CSS files were created.
- No inline CSS, inline JavaScript, or inline event handlers were added.
- Existing fullscreen/display-mode behavior was preserved in the shared `tool-display-mode.js` implementation.

## Changes

- Updated shared Tool Display Mode markup generation:
  - Collapsed state displays the existing ForgeBot image only in the summary.
  - Expanded state displays the summary image plus the ForgeBot mascot image in the expanded body.
- Added shared CSS for Tool Display Mode mascot/icon layout.
- Added nested asset-root hints to tool group pages so the shared Tool Display Mode can resolve mascot assets from deeper routes.
- Replaced mascot card-art use on the Branding page where a reusable ForgeBot character asset should be used.
- Replaced the home mascot sheet with the reusable ForgeBot character asset.
- Added `data-mascot` associations to Tools page tiles.
- Normalized Tools page visible role labels to the mascot set:
  - ForgeBot
  - Foundry Bot
  - Pixel Smith
  - Spark
- Preserved Tools page alphabetical order.
- Preserved Games submenu structure, including Arcade as a submenu item.

## Validation

Completed before shell blocker:

- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content GameFoundryStudio/assets/js/tool-display-mode.js`
- `Get-Content GameFoundryStudio/assets/css/gamefoundrystudio.css`
- `rg -n "forgebot|mascot|card|assets/images/(characters|icons|tools|games)|\.png|\.jpg|\.webp|\.svg" GameFoundryStudio -g "*.html" -g "*.js" -g "*.css"`
- `rg -n "<h2>Toolbox|<h2>Workspace|<h2>Inspector|data-tool-display-mode|tool-column-header" GameFoundryStudio/tools -g "*.html"`

Results from completed checks:

- Every listed tool page uses `Toolbox`, `Workspace`, and `Inspector`.
- Every listed direct tool page and tool group page contains `data-tool-display-mode`.
- Tools page tiles remained alphabetized by visible title.
- Games submenu structure from the previous PR was preserved in the shared nav.

Blocked:

- Follow-up syntax, inline-handler, image-resolution, navigation-resolution, Playwright/static validation, `git diff`, and delta ZIP commands were initially blocked by `windows sandbox: spawn setup refresh`.

## Asset Standardization Status

- ForgeBot is standardized on `assets/images/forge-bot.png`.
- Tool Display Mode uses the same existing ForgeBot file for collapsed and expanded states.
- No replacement artwork was created.

## Playwright Impact

Playwright impacted: Yes. This PR changes shared Tool Display Mode UI behavior and image rendering.

Expected validation when shell execution is available:

- Tool Display Mode collapsed state shows only `assets/images/forge-bot.png`.
- Tool Display Mode expanded state shows the ForgeBot summary image and expanded ForgeBot mascot image from `assets/images/forge-bot.png`.
- Fullscreen enter/exit behavior still toggles `tool-focus-mode` and browser fullscreen where available.
- Horizontal side-column accordions still collapse/expand.
- Tool pages and navigation routes load without broken image references.

Full samples smoke test was not run per instruction.
