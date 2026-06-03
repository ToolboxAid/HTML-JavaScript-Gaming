# PR_26152_059 Admin Menu Configuration Link Validation

## Scope

- Changed root shared navigation only:
  - `GameFoundryStudio/assets/partials/header-nav.html`
  - `GameFoundryStudio/assets/js/gamefoundry-partials.js`
- Added Admin submenu item `Settings and Admin`.
- Routed `configuration-admin` to `/toolbox/groups/configuration-admin.html` through the shared partial loader.
- No CSS, Theme V2 CSS, page content, tool runtime behavior, or page migrations were changed.

## Validation

Playwright impacted: Yes. This PR changes rendered root navigation behavior, so a targeted Playwright browser validation was run against `/toolbox/index.html`.

Lanes executed:
- root navigation/static - because the shared header partial and route map changed.
- root navigation/browser - because the partial loader rewrites menu hrefs at runtime.

Lanes skipped:
- runtime, integration, engine, samples, and recovery/UAT - no tool runtime behavior, engine behavior, sample data, or broader recovery behavior changed.

Samples decision: SKIP because this PR only changes root navigation/menu routing.

Commands:
- `node --check GameFoundryStudio/assets/js/gamefoundry-partials.js`
- `git diff --check -- GameFoundryStudio/assets/partials/header-nav.html GameFoundryStudio/assets/js/gamefoundry-partials.js`
- Inline Node static nav validation for Admin submenu order, expected links, target existence, and no inline script/style/event handlers.
- Inline Playwright browser validation using a local static server for `/toolbox/index.html` and Admin submenu link targets.
- `git diff --name-only -- "*.css"` and `git status --short -- "*.css"`

Results:
- PASS: `Settings and Admin` appears in the Admin submenu.
- PASS: Source href is `/toolbox/groups/configuration-admin.html`.
- PASS: Runtime rendered href resolves to `/toolbox/groups/configuration-admin.html` from `/toolbox/index.html`.
- PASS: Admin submenu order is alphabetized:
  `Analytics | Branding | Controls | Design System | Grouping Colors | Moderation | Ratings | Roles | Settings and Admin | Site Settings | Themes | Users`
- PASS: Existing Admin submenu destinations were preserved.
- PASS: Existing Admin submenu targets returned HTTP 200:
  `Analytics=200, Branding=200, Controls=200, Design System=200, Grouping Colors=200, Moderation=200, Ratings=200, Roles=200, Settings and Admin=200, Site Settings=200, Themes=200, Users=200`
- PASS: `toolbox/groups/configuration-admin.html` exists and is reachable from the rendered menu.
- PASS: No CSS files changed.
- PASS: No unrelated page families changed.
- PASS: No repo-wide tests were run.

Expected PASS behavior:
- The root shared Admin menu renders the new `Settings and Admin` link.
- The link reaches `/toolbox/groups/configuration-admin.html`.
- Existing Admin menu links still resolve successfully.

Expected WARN behavior:
- None for the targeted root navigation lane.
