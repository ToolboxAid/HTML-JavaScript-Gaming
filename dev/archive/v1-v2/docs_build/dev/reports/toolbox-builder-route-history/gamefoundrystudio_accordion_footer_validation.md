# PR_26152_012-accordion-footer-legal-top Validation

Playwright impacted: Yes, scoped to GameFoundryStudio UI behavior only.

## Scope

- Implementation changes were limited to `GameFoundryStudio`.
- Required workflow artifacts were written under `docs_build/dev` and `tmp`.
- Consolidated vertical accordion carets, horizontal accordion buttons, and return-to-top button base styling through one shared CSS button SSoT.
- Preserved existing vertical caret background images and horizontal left/right arrow rotation rules.
- Added shared footer Legal nav links and root legal pages for Privacy Policy, Terms & Legal, Cookie Policy, and Disclaimer.
- Added return-to-top behavior through external shared JavaScript in `gamefoundry-partials.js`.

## Validation Run

- PASS: `node --check GameFoundryStudio/assets/js/gamefoundry-partials.js`
- PASS: GameFoundryStudio-only static validation for changed HTML/CSS/JS.
  - Confirmed changed HTML has no inline `<style>`, inline `<script>`, inline `style` attributes, or inline event handlers.
  - Confirmed footer Legal nav renders four legal links and the return-to-top control.
  - Confirmed route map entries for `privacy-policy`, `terms-legal`, `cookie-policy`, and `disclaimer`.
  - Confirmed legal pages use shared header/footer partials, shared stylesheet, and external partial JS.
  - Confirmed CSS braces are balanced.
  - Confirmed shared accordion button SSoT selector exists for vertical summary carets, horizontal accordion toggles, and return-to-top.
  - Confirmed tool-group accordion color overrides use shared CSS variables.
  - Confirmed return-to-top uses active theme color variables and visible state.
- PASS: GameFoundryStudio-only targeted UI validation with Playwright.
  - Confirmed shared footer Legal heading and four legal links render on the root site.
  - Confirmed footer legal links resolve inside `GameFoundryStudio`.
  - Confirmed legal pages render expected page titles, active side-menu links, footer legal links, and return-to-top control.
  - Confirmed nested tool footer links rewrite back to root legal pages.
  - Confirmed return-to-top starts hidden, becomes visible after scroll, and scrolls back to top on click.
  - Confirmed return-to-top color matches the active molten-orange tool theme.
  - Confirmed first vertical accordion opens/closes/reopens with the existing native details behavior.
  - Confirmed vertical caret image remains present.
  - Confirmed horizontal left accordion toggle collapses and expands the tool column while preserving `aria-expanded` state.
- PASS: `git diff --check -- GameFoundryStudio`
  - Output included only CRLF conversion warnings for existing GameFoundryStudio files.
- PASS: GameFoundryStudio HTML inline-style/script/event-handler guard.

## Playwright V8 Coverage

(100%) GameFoundryStudio/assets/js/gamefoundry-partials.js - 6268 of 6268 bytes executed in GameFoundryStudio footer/accordion/top validation.

## Skipped

- Repo-wide tests: SKIP by BUILD instruction.
- Tests outside GameFoundryStudio: SKIP by BUILD instruction.
- Full samples smoke: SKIP by BUILD instruction and because sample JSON/shared sample loading were not touched.

## Manual Validation Steps

1. Open `GameFoundryStudio/index.html` through a local HTTP server.
2. Confirm the footer has a `Legal` heading with Privacy Policy, Terms & Legal, Cookie Policy, and Disclaimer links.
3. Open each legal footer link and confirm the page renders with the shared header, legal side menu, card body, and shared footer.
4. Scroll down and confirm the return-to-top button appears.
5. Click return-to-top and confirm the page scrolls back to the top.
6. Open `GameFoundryStudio/tools/game-builder.html`.
7. Confirm left/right horizontal accordion buttons still collapse and expand the side columns.
8. Confirm vertical accordions still open and close with their existing carets.

## Expected PASS Behavior

- Footer legal links work from root and nested GameFoundryStudio pages.
- Return-to-top is hidden at the top, visible after scroll, and uses the active page theme color.
- Accordion functionality is unchanged.
- Existing vertical and horizontal arrows/carets remain visible and operational.
