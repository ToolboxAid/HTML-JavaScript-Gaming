# PR_26160_061 Toolbox Voting And Color SSoT

## Branch Validation

| Check | Expected | Actual | Status | Evidence |
| --- | --- | --- | --- | --- |
| Current git branch | main | main | PASS | `git branch --show-current` |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| In Admin > Tools Voting, make the Tool Name column a link to each tool page. | PASS | `admin/tool-votes.js` renders the first cell with an anchor using the server-backed row path; Playwright verifies Build Game links to `toolbox/build-game/index.html`. |
| In Colors > Picker Preview header, replace Hue/Sat/Brit/Default sliders with sort buttons. | PASS | `toolbox/colors/index.html` removes the preview sliders/reset button; `toolbox/colors/colors.js` renders `Hue`, `Sat`, `Brit`, `Default` sort buttons. |
| Place those sort buttons between Picker Preview and Available Picker Swatches count. | PASS | The `data-palette-preview-controls` action group remains between the `Picker Preview` title and `data-palette-generator-preview-status`; Playwright validates the summary child order. |
| Audit `colors.css` and `site-colors.css`. | PASS | Audit found `theme.css` imports `colors.css`; active repo search found no active import of `site-colors.css` outside historical docs. |
| Consolidate duplicated color variables to one SSoT, preferring `colors.css`. | PASS | `assets/theme-v2/css/colors.css` remains the active Theme V2 token owner; `assets/theme-v2/css/site-colors.css` now imports `colors.css` and no longer redefines the duplicated core token block. |
| Remove or stop importing duplicate `site-colors.css` only if safe/scoped. | PASS | `site-colors.css` was not active-imported, so it was preserved as a compatibility layer instead of deleted; duplicate token definitions were removed. |
| Change `--red` to `#ff2d2d`. | PASS | `assets/theme-v2/css/colors.css` now defines `--red: #ff2d2d;`. |
| Include related color duplication findings in report. | PASS | See Color SSoT Findings below. |
| Do not use inline script/style/event handlers. | PASS | `rg --pcre2` found no inline script/style/handler matches in changed Admin/Colors HTML. |

## Color SSoT Findings

- `assets/theme-v2/css/theme.css` imports `assets/theme-v2/css/colors.css`.
- Active repo search found `site-colors.css` only in historical docs and in the compatibility file itself, not as an active runtime import.
- Before this PR, `site-colors.css` duplicated the same core `:root` Theme V2 variables already defined in `colors.css`, including `--red`.
- `colors.css` is the Theme V2 color SSoT, and `--red` was updated there to `#ff2d2d`.
- `site-colors.css` now imports `colors.css` and retains only legacy helper aliases/classes that point to SSoT variables.
- A Node audit confirmed `site-colors.css` no longer defines duplicated core color tokens such as `--red`, `--bg`, `--panel`, `--text`, `--line`, `--molten-orange`, and related Theme V2 tokens.

## Validation

| Lane | Command | Status |
| --- | --- | --- |
| Branch guard | `git branch --show-current` | PASS |
| Changed-file syntax | `node --check admin/tool-votes.js`; `node --check toolbox/colors/colors.js`; `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS |
| Admin Tools Voting and Colors Playwright | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs -g "toolbox status kickers\|Colors Picker Preview"` | PASS |
| Theme V2 CSS active import audit | `Select-String` for `colors.css` / `site-colors.css`; `rg --fixed-strings "site-colors.css"` | PASS |
| Theme V2 red token audit | `Select-String -Pattern '--red:' assets/theme-v2/css/colors.css,assets/theme-v2/css/site-colors.css` | PASS |
| Theme V2 duplicate token audit | Node duplicate-token check against `site-colors.css` | PASS |
| Inline handler/style/script audit | `rg --pcre2 "onclick=|onchange=|oninput=|style=|<script(?![^>]+src=)|<style[\s>]" admin/tool-votes.html toolbox/colors/index.html` | PASS |
| Static diff check | `git diff --check` | PASS with CRLF normalization warnings only |

## Impacted Lane

Targeted Admin Tools Voting, Colors Picker Preview, and Theme V2 CSS validation were impacted and run.

## Skipped Lanes

Full samples validation was skipped because this PR changes Admin Toolbox voting display, Colors picker header controls, and Theme V2 CSS token ownership only. No shared sample loader/framework code changed.

## Manual Test Notes

- Admin Tools Voting shows the Tool Name as a link to the tool route.
- Picker Preview header shows sort buttons only: Hue, Sat, Brit, Default.
- Brit sort reorders the Picker Preview grid; Default restores the generated grid order.
- Theme V2 `--red` now resolves from `colors.css` as `#ff2d2d`.

## Artifact

- Repo-structured delta ZIP: `tmp/PR_26160_061-toolbox-voting-and-color-ssot_delta.zip`
