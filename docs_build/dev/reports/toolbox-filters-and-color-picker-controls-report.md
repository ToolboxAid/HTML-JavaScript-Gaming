# PR_26160_059 Toolbox Filters And Color Picker Controls Report

## Branch Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Current branch is `main` | PASS | `git branch --show-current` returned `main`. |
| Expected branch is `main` | PASS | Required by BUILD request and `PROJECT_INSTRUCTIONS.md`. |
| Local branches found | PASS | `git branch --list` returned `* main`. |

## Summary

Implemented the remaining usable-layout fix for the current Toolbox/Colors state:

- `assets/theme-v2/css/accordion.css` now supports control-heavy accordion summaries without header/body overlap.
- `toolbox/colors/index.html` marks the Picker Preview summary with the reusable control-grid summary class.

The Build Path multi-filter logic, DB/registry order display, selected view/filter styling, and Color Picker Preview Hue/Sat/Brit/Default controls are present in current `main` and were validated directly.

Repo-structured ZIP: `tmp/PR_26160_059-toolbox-filters-and-color-picker-controls_delta.zip`.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Fix Build Path Planned filter showing Planned count but 0 tiles | PASS | `toolbox/tools-page-accordions.js` uses the same enriched registry status source for counts and rows; Playwright selected Planned and found 28 planned rows. |
| Support multiple Build Path filters at the same time | PASS | `renderStatusFilters()` toggles each status in `visibleReleaseChannels`; Playwright verified Planned+Complete, Planned-only, Planned+Wireframe, and Planned+Wireframe+Beta. |
| Preserve Complete as only default active filter on first Build Path load | PASS | `buildPathDefaultReleaseChannels` remains `["complete"]`; Playwright verified only Complete active on first Build Path view. |
| Ensure tile visibility uses same DB/registry status source as filter counts | PASS | `releaseChannelCounts()` and `getBuildPathRows()` both enrich visible registry tools and use `releaseChannel`; Playwright count/row assertions matched Planned 28, Wireframe 4, Beta 5, Complete 1. |
| Make selected Order A-Z, Group, and Build Path filters visually obvious | PASS | `setActiveButton()` applies `primary` to the active mode button; Playwright verified Order, Group, and Build Path active states. |
| Fix Selected Build Path order numbers to use DB/registry order | PASS | `getBuildPathRows()` displays `tool.order`; Playwright verified Colors order `6`, AI Assistant order `1`, and Build Game order `17` inside filtered views. |
| Add/wire Color Picker Preview Hue, Sat, Brit, Default controls | PASS | `toolbox/colors/index.html` contains controls in Picker Preview header; `toolbox/colors/colors.js` wires live preview adjustments and reset behavior; Playwright verified live color changes and resets. |
| Place controls between Picker Preview and Available Picker Swatches count | PASS | Playwright inspected summary child order: `Picker Preview`, preview controls, preview status. |
| Follow slider value visibility requirement | PASS | Hue/Sat/Brit outputs remain visible and update during `input`; Playwright verified `+45`, `50%`, and `75%`. |
| Follow double-click reset-to-default requirement | PASS | Playwright double-clicked Hue and verified reset to `0`; Default reset restored Hue/Sat/Brit to `0/100/100`. |
| No inline script/style/event handlers | PASS | `rg --pcre2` found no inline `<script>`, `<style>`, or inline event handlers in `toolbox/colors/index.html`. |
| Produce repo-structured ZIP | PASS | Created `tmp/PR_26160_059-toolbox-filters-and-color-picker-controls_delta.zip` with repo-relative entries. |

## Impacted Lane

- Targeted Toolbox Build Path validation.
- Targeted Colors Picker Preview validation.
- Changed-file syntax/static validation.
- Playwright V8 coverage for impacted runtime JavaScript.

## Validation Results

| Command / Lane | Result | Notes |
| --- | --- | --- |
| `node --check toolbox/tools-page-accordions.js` | PASS | Syntax clean. |
| `node --check toolbox/colors/colors.js` | PASS | Syntax clean. |
| `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS | Syntax clean. |
| `git diff --check` | PASS | No whitespace errors. |
| `rg --pcre2 -n "<script(?![^>]+src=)|<style|\\son(?:click|change|input|submit|keydown|keyup|load)=" toolbox/colors/index.html` | PASS | No matches. |
| `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs -g "Build Path status filters\|Colors Picker Preview header controls" --reporter=line` | PASS | 2 passed. |

## Manual Test Notes

- Measured Picker Preview header/body geometry after adding the controls.
- Found the prior fixed `52px` accordion body offset caused the preview grid to cover taller summaries.
- Replaced the fixed offset behavior for accordion fill panels with an auto summary grid row and a remaining-space scroll body.
- Verified the Hue slider hit target resolves to the slider input and the preview body retains usable height.

## Skipped Lanes

| Lane | Skipped | Reason |
| --- | --- | --- |
| Full samples validation | Yes | Request explicitly says do not run full samples validation; no shared sample loader/framework changed. |
| Broad Toolbox route smoke | Yes | Targeted Build Path and Colors Playwright covered the changed behavior. |
| Full workspace samples smoke | Yes | Not impacted by this scoped Toolbox/Colors change. |
