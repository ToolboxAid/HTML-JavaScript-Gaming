# PR_26159_036 Colors Picker Preview Layout Report

## Summary

Playwright impacted: Yes.

This PR fixes the Colors Picker Preview header/status layout, makes Project Swatches and Picker Preview share the center column fill space, keeps selected Project Swatch outlines inside the tile, anchors Project Swatch size/restore controls to the right, makes addable picker pins green, and corrects duplicate picker Hex handling so only the top-most duplicate in a column remains addable.

Reusable Theme V2 CSS was required because the existing accordion fill behavior only applied under `body.tool-focus-mode`; normal local tool mode had no reusable fill rule for center-panel accordion stacks. The new CSS is in Theme V2 only and does not add page-local or tool-local CSS.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `PROJECT_INSTRUCTIONS.md` first | PASS | Read before editing; relevant PR completion, CSS, Playwright, and ZIP sections reviewed. |
| Use PR_26159_035 as base context | PASS | Created `PR_26159_036-colors-picker-preview-layout` from `PR_26159_035-colors-picker-layout-tags`. |
| Move `Available Picker Swatches (xx)` to the right of `Picker Preview` in the accordion/header area | PASS | Header markup at `toolbox/colors/index.html`; Playwright header assertion in `tests/playwright/tools/PaletteToolMockRepository.spec.mjs`. |
| Keep current font/style for the count | PASS | Count keeps existing `status` class and `role=status` in the summary. |
| Picker Preview grid uses 100% available horizontal and vertical space inside the open accordion | PASS | Reusable fill CSS in `assets/theme-v2/css/accordion.css`; Playwright validates grid/body width and height fill ratios. |
| Do not force a fixed accordion height | PASS | No fixed accordion height added; the center panel supplies available viewport space and open accordions flex/share it. |
| Project Swatches and Picker Preview share available vertical space | PASS | Both accordions use `accordion-fill-panel`; Playwright validates both-open heights. |
| Closing Project Swatches lets Picker Preview use available vertical space | PASS | Playwright closes Project Swatches and verifies Picker Preview grid height increases. |
| Closing Picker Preview lets Project Swatches use available vertical space | PASS | Playwright closes Picker Preview and verifies Project Swatches scroll region height increases. |
| Selected Project Swatch outline remains inside the tile and visible | PASS | Theme V2 outline offset moved inside in `assets/theme-v2/css/forms.css`; Playwright verifies selected outline offset is <= 0 and transform is removed. |
| Small/Medium/Large/Restore Picker Settings anchored right | PASS | Controls use existing `grid cols-2` + `action-group--end` pattern; Playwright verifies right-side positioning. |
| Addable Picker Preview swatches show a green pin marker | PASS | Theme V2 rule in `assets/theme-v2/css/forms.css`; Playwright compares pin background to `--green`. |
| Duplicate/unaddable picker swatches have the pin removed | PASS | Runtime only renders pin when `available !== false`; Playwright verifies duplicate lower swatches have no pin. |
| Duplicate detection compares Hex within the same column only | PASS | `duplicatePickerHexReasons` keys by `column:hex` in `toolbox/colors/colors.js`. |
| Top-most duplicate keeps pin/add marker | PASS | `duplicatePickerHexReasons` uses the minimum row as the keeper; Playwright validates top duplicate is addable. |
| Duplicates below top remain true color but cannot add | PASS | Playwright validates lower duplicate opacity/color/cursor and blocked click behavior. |
| Unique Hex values keep pin/add marker | PASS | Existing generated swatch tests verify available unique swatches add to Project Swatches. |
| Do not gray out duplicates | PASS | Playwright validates lower duplicate opacity remains `1`. |
| Do not show red not-allowed marker/cursor | PASS | Playwright validates duplicate and already-in-project swatch cursor is not `not-allowed`; addable pin is green. |
| Preserve Project Swatches accordion | PASS | Center Project Swatches accordion remains in `toolbox/colors/index.html` and is covered by Playwright. |
| Preserve Picker Swatches left-column accordion | PASS | Left Picker Swatches accordion remains in `toolbox/colors/index.html` and is covered by Playwright. |
| Preserve Picker Preview accordion | PASS | Picker Preview remains a center accordion and is covered by Playwright. |
| Preserve ROYGBIV selector | PASS | Existing ROYGBIV assertions remain in Palette Tool Playwright coverage. |
| Preserve Theme Collection / Palette Type / Variant options | PASS | Existing option assertions remain in Palette Tool Playwright coverage. |
| Preserve Add/Update/Clear without Symbol validation | PASS | Existing Add/Update/Clear and Symbol-free validation assertions remain passing. |
| No console errors | PASS | `expectNoPageFailures` passed in all targeted Palette Tool Playwright tests. |
| Do not run full samples validation | PASS | Full samples smoke was not run. |

## Validation

| Lane | Status | Command | Evidence |
| --- | --- | --- | --- |
| Changed JS syntax | PASS | `node --check toolbox/colors/colors.js` | Colors runtime parses. |
| Changed Playwright syntax | PASS | `node --check tests/playwright/tools/PaletteToolMockRepository.spec.mjs` | Updated Palette tests parse. |
| Static whitespace validation | PASS | `git diff --check` | No whitespace errors; line-ending warnings only. |
| Inline HTML restriction audit | PASS | `rg --pcre2 -n "<style|style=|<script(?![^>]*\\bsrc=)|on(click|change|input|submit)=" toolbox/colors/index.html` | No matches. |
| Targeted Palette Tool Playwright | PASS | `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs` | 8/8 passed; validates requested UI/runtime behavior and no console/page failures. |
| Playwright V8 coverage | PASS | Palette Tool Playwright afterAll coverage reporter | `docs_build/dev/reports/playwright_v8_coverage_report.txt` and `coverage_changed_js_guardrail.txt` updated for changed runtime JS. |
| Workspace contract default lane | FAIL (unrelated existing lane blocker) | `npm run test:workspace-v2` | Failed on `RootToolsFutureState.spec.mjs` expecting Admin nav markup for unauthenticated pages. This failure is outside the Colors picker scope and was not introduced by this PR. |

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | Skipped by request. This PR changes Colors UI/runtime, Theme V2 accordion/swatch styling, and targeted Palette Playwright coverage only; no sample loader/framework was changed. |

## Notes

- Existing SQLite experimental warnings and seed-only audit fallback diagnostics appeared during Playwright runs; they did not fail the targeted Palette lane.
- The default workspace-contract lane was attempted because project instructions mention it for Playwright-impacted work, but it currently fails on header/admin navigation expectations unrelated to this PR. The requested Colors validation items all passed.
