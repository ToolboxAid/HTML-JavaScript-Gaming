# Theme V2 Company Pages Validation

Task: PR_26152_024-theme-v2-company-pages

Scope:
- GameFoundryStudio only.
- Migrated only Company pages:
  - `about.html`
  - `vision.html`
  - `mission.html`
  - `roadmap.html`
  - `release-notes.html`
- Left Admin, Account, Tools, Games, and Samples unchanged.
- No CSS files were created outside `GameFoundryStudio/assets/css/theme/v2/`.
- No page-local CSS was added.

Changed GameFoundryStudio files:
- `GameFoundryStudio/about.html`
- `GameFoundryStudio/vision.html`
- `GameFoundryStudio/mission.html`
- `GameFoundryStudio/roadmap.html`
- `GameFoundryStudio/release-notes.html`
- `GameFoundryStudio/assets/css/theme/v2/colors.css`
- `GameFoundryStudio/assets/css/theme/v2/spacing.css`
- `GameFoundryStudio/assets/css/theme/v2/typography.css`
- `GameFoundryStudio/assets/css/theme/v2/layout.css`
- `GameFoundryStudio/assets/css/theme/v2/panels.css`

Validation performed:
- Ran `git diff --check` for the changed Company HTML and Theme V2 CSS files.
  - Result: Passed.
  - Note: Git reported line-ending normalization warnings only.
- Ran targeted static migration validation.
  - Verified the five Company pages consume `assets/css/theme/v2/theme.css`.
  - Verified none of the five Company pages still link `assets/css/styles.css`.
  - Verified only Home plus the five Company pages consume Theme V2.
  - Verified no changed CSS files exist outside `GameFoundryStudio/assets/css/theme/v2/`.
  - Verified migrated Company pages contain no inline style attributes, `<style>` blocks, or inline event handlers.
- Ran targeted GameFoundryStudio browser validation for all five Company pages.
  - Verified all five pages render with Theme V2 CSS.
  - Verified header and footer partials render on all five pages.
  - Verified themed body and card/panel backgrounds apply.
  - Verified `about.html` renders the About hero with the existing ForgeBot image asset.
  - Verified `vision.html`, `mission.html`, `roadmap.html`, and `release-notes.html` render the page-title treatment.
  - Verified Company card grids render as three columns at desktop width.
  - Verified `release-notes.html` renders the platform progression and version history layouts.
  - Verified the current Release Notes stage remains visually highlighted.
  - Verified footer Company links for About, Vision, Mission, Roadmap, Release Notes, and Contact resolve successfully.
  - Verified no browser console errors or 400+ asset/page responses.

Explicitly not run:
- No repo-wide tests.
- No tests outside GameFoundryStudio.
- No full samples smoke test.
- No Admin, Account, Tools, Games, or Samples migration validation beyond confirming those page families were not migrated.

Result: Passed.
