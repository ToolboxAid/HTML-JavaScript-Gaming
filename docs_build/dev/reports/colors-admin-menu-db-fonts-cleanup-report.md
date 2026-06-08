# PR_26159_029 Colors Admin Menu DB Fonts Cleanup Report

## Executive Summary

Status: PASS
Playwright impacted: Yes
Full samples validation: Skipped, not impacted.

This PR completes the PR_028 Symbol cleanup gap, restores selectable Colors picker behavior with an explicit picker enable control, moves Admin menu rendering behind role-aware runtime creation, moves reseed controls to the login side menu, updates the admin display name to DavidQ, moves font folders to Theme V2, and scopes Color Harmony matching to the current generated picker context.

## Root Cause: Symbol Miss From PR_26159_028

PR_26159_028 removed Symbol from the active Colors form/runtime path, but the validation scan did not include all active shared schema files. The remaining Symbol-shaped validation lived in:

- `src/shared/schemas/tools/palette-manager-v2.schema.json`
- `src/shared/schemas/tools/asset-manager-v2.schema.json`

Those schemas still allowed or required Symbol-style palette fields, so a downstream validation path could still report Symbol requirements even though the visible Colors UI no longer had a Symbol field. This PR removes those active schema references by using `key` instead.

Legacy non-Colors symbol-coded palettes remain in `src/engine/paletteList.js` and older Palette Manager V2 baseline tests/fixtures. They were not modified because this PR scopes active Colors Add/Update validation, not the historical engine palette-symbol contract.

## Disabled / Grayed Swatch Explanation

Some picker swatches appeared grayed because each preview swatch contains a disabled `input[type=color]` used only as a color chip display. The selectable control is the outer swatch button. The inner color input stays disabled intentionally so clicking a swatch selects/adds it instead of opening the browser-native color picker.

Implemented user-facing clarification and control:

- Added `Enable visible picker swatches` checkbox in Picker Preview.
- Default is checked, so all visible picker swatch buttons are selectable.
- When unchecked, picker swatch buttons are disabled and status text explains how to re-enable them.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `PROJECT_INSTRUCTIONS.md` first | PASS | Read before edits. |
| Use PR_26159_028 as context | PASS | Re-read PR_028 Symbol failure context and scanned active Colors/schema paths. |
| Re-read PR_028 and explain Symbol miss | PASS | Root cause section above. |
| Fix Colors Add/Update so Symbol is not required anywhere active | PASS | Removed active schema Symbol refs; `PaletteToolMockRepository.spec.mjs` Add/Update passes without Symbol. |
| No active Colors code references Symbol validation | PASS | Active scan over `toolbox/colors`, `src/shared/schemas`, palette repository, and Palette Playwright spec returned no Symbol validation hits. |
| Explain grayed/disabled swatches | PASS | Report section above and UI status at `toolbox/colors/index.html`. |
| Add checkbox if disabled swatches are intentional | PASS | `data-palette-enable-picker-swatches` added and validated. |
| Make visible picker swatches selectable | PASS | Palette lane validates picker swatch buttons enabled/selectable by default. |
| Change admin user display name to DavidQ | PASS | `src/dev-runtime/persistence/mock-db-store.js`, `src/dev-runtime/guest-seeds/tool-state-samples.js`; Login/Admin DB/Project Journey tests pass. |
| Admin menu absent from DOM for non-admin users | PASS | Static Admin markup removed from header partials; Login Playwright asserts non-admin Admin menu count is 0. |
| Add Admin menu dynamically for admin role | PASS | `assets/theme-v2/js/gamefoundry-partials.js`; Login Playwright validates DavidQ/admin sees Admin/My Stuff. |
| Move login DB reseed block to side-menu bottom with HR above | PASS | `login.html`; Login Playwright asserts placement. |
| Delete HR immediately after `<div class="card">` | PASS | Login structure changed to side-menu HR only; `main hr` count remains 1. |
| Diagnostics Local Development Status spans 100% under side-menu and Mode card | PASS | `login.html`; Login Playwright checks status card below panel and >=95% container width. |
| Move `src/assets/fonts/0xProtoNerdFont/` to `assets/theme-v2/fonts/` | PASS | Font folder moved; `Test-Path assets/theme-v2/fonts/0xProtoNerdFont/0xProtoNerdFont-Regular.ttf` true. |
| Move `src/assets/fonts/vector_battle/` to `assets/theme-v2/fonts/` | PASS | Font folder moved; `Test-Path assets/theme-v2/fonts/vector_battle/vector_battle.ttf` true. |
| Delete `src/assets/` if empty | PASS | `Test-Path src/assets` false. |
| Update active font references | PASS | Active scan over `toolbox`, `src`, `assets`, `tests`, and current admin notes found no old `src/assets/fonts` references. Historical reports still contain old paths. |
| Color Harmony Schemes Match uses current Theme Collection, Palette Type, Variant, and swatch metadata | PASS | `toolbox/colors/colors.js` passes generated picker swatches/metadata; repository closest matching uses provided current-context swatches. Palette Playwright validates harmony title includes current generated context. |
| Playwright impacted | PASS | Palette, LoginSessionMode, AdminDbViewer, and ProjectJourney Playwright lanes passed. |
| Do not run full samples validation | PASS | Full samples skipped; no shared sample loader/framework changed. |
| Produce repo-structured ZIP | PASS | Created under `tmp/PR_26159_029-colors-admin-menu-db-fonts-cleanup_delta.zip`. |

## Validation Evidence

Commands run:

- `node --check assets/theme-v2/js/gamefoundry-partials.js`
- `node --check toolbox/colors/colors.js`
- `node --check src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js`
- `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- `node --check tests/playwright/tools/PaletteToolMockRepository.spec.mjs`
- `node --check tests/playwright/tools/AdminDbViewer.spec.mjs`
- `node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs`
- JSON parse validation for changed schemas
- `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs` - PASS, 6 passed
- `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` - PASS, 7 passed
- `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs` - PASS, 7 passed
- `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs` - PASS, 13 passed
- `git diff --check` - PASS
- Active `rg` scans for Symbol validation, old font paths, and static Admin menu markup - PASS

## Skipped Lanes

- Full samples validation: skipped because this PR does not change sample JSON contracts or the shared sample loader/framework.
- Full Playwright suite: skipped because targeted impacted lanes covered Colors, login/header/admin menu, DB viewer, and adjacent Project Journey behavior.

## Remaining Notes

- Historical docs and older Palette Manager V2 fixtures still mention symbol-coded palettes. They are not active Colors Add/Update validation and were intentionally left untouched to avoid expanding this PR into legacy palette contract migration.
- Historical reports still mention `src/assets/fonts`; active code/tests/current admin notes no longer do.
