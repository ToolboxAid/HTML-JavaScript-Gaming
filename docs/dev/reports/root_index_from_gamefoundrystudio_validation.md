# Root Index From GameFoundryStudio Validation

PR: `PR_26152_026-root-index-from-gamefoundrystudio`

## Scope

- Replaced root `index.html` with the GameFoundryStudio Home markup.
- Kept `GameFoundryStudio/index.html` unchanged as the authoritative staging/source version.
- Added a root-only `<base href="GameFoundryStudio/">` path adjustment so root `/index.html` resolves GameFoundryStudio assets, CSS, JavaScript, partials, images, and navigation.
- Did not migrate Admin, Account, Tools, Games, or Samples pages.
- Did not add CSS outside `GameFoundryStudio/assets/css/theme/v2`.

## Validation Commands

1. Targeted Playwright static-server validation for `/index.html` and GameFoundryStudio Company footer pages.
2. Normalized source check confirming root `index.html` matches `GameFoundryStudio/index.html` except for the root-only `<base href="GameFoundryStudio/">` element.
3. Static HTML restriction check:
   `rg -n --pcre2 "<script\\b(?![^>]*\\bsrc=)|<style\\b|\\son[a-z]+\\s*=" index.html GameFoundryStudio\\index.html GameFoundryStudio\\assets\\partials\\header-nav.html GameFoundryStudio\\assets\\partials\\footer.html`
4. Targeted whitespace check:
   `git diff --check -- index.html`

## Results

- PASS: `/index.html` renders the GameFoundryStudio Home with title `Game Foundry Studio - Build. Play. Share.` and H1 `Build. Play. Share.`
- PASS: root `index.html` matches `GameFoundryStudio/index.html` except for the root-only `<base href="GameFoundryStudio/">` element.
- PASS: legacy root Home copy `HTML JavaScript Gaming` is no longer rendered from `/index.html`.
- PASS: `/index.html` resolves `GameFoundryStudio/assets/css/theme/v2/theme.css`.
- PASS: `/index.html` resolves `GameFoundryStudio/assets/js/gamefoundry-partials.js`.
- PASS: header and footer partials load from `GameFoundryStudio/assets/partials`.
- PASS: GameFoundryStudio Home images load from `/index.html`.
- PASS: `/index.html` Company footer links resolve into and load GameFoundryStudio pages: About, Vision, Mission, Roadmap, Release Notes, Contact.
- PASS: no inline script blocks, style blocks, or inline event handlers were found in the affected root/GFS HTML and partial files.
- PASS: `git diff --check -- index.html` completed with no whitespace errors.
- WARN: Git reported the repository line-ending notice `LF will be replaced by CRLF the next time Git touches it` for `index.html`.

## Lanes

- lanes executed: runtime/static page validation for the affected root index and GameFoundryStudio-scoped company navigation.
- lanes skipped: engine, samples, tools, Admin, Account, Games, and broader integration lanes because this PR only changes root Home routing to the existing GameFoundryStudio Home.
- samples decision: SKIP because Samples are not in scope and the PR explicitly forbids full samples smoke testing.
- blocker scope: root `index.html` and GameFoundryStudio-scoped Home/company navigation only.

## Manual Validation

1. Start a local static server from the repo root.
2. Open `/index.html`.
3. Confirm the page title/content is Game Foundry Studio Home, not the legacy HTML JavaScript Gaming hub.
4. Confirm header and footer are visible.
5. Confirm Home images render.
6. In the footer Company group, open About, Vision, Mission, Roadmap, Release Notes, and Contact.
7. Expected result: each link opens a GameFoundryStudio page under `/GameFoundryStudio/`.
