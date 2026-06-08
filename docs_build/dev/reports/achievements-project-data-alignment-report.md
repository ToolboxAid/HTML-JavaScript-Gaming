# PR_26159_030 Achievements Project Data Alignment Report

## Executive Summary

Status: PASS
Playwright impacted: Yes
Full samples validation: Skipped, not impacted.

Account Achievements Build now renders project rows from the Project Workspace server repository source instead of a separate hardcoded achievement/demo game list. Colors Picker Preview no longer has a global enable/disable checkbox; it now uses a narrower checkbox that only includes already selected swatches.

## Why Achievements And Project Workspace Differed

The Account Achievements Build tab previously owned its own hardcoded table in `account/achievements.html`. Those rows used unrelated demo game names and achievement-specific status/stat/rating values:

- Sky Forge Sprint
- Crystal Circuit
- Moonlit Maze

Project Workspace uses the `project-workspace` server repository source, seeded with:

- Demo Project
- Gravity Demo
- Collision Demo
- Camera Follow Demo

Because the Account page did not read from the Project Workspace repository/API boundary, the two surfaces drifted. This PR moves the Build rows into `assets/theme-v2/js/account-achievements.js` and reads them through `createServerRepositoryClient("project-workspace")`.

## Colors Disabled / Grayed Swatch Explanation

The meaningful disabled subset is picker swatches that are already pinned into Project Swatches. Those swatches are not invalid colors; they are already selected. They are dimmed/disabled by default in Picker Preview so clicking the picker grid adds new swatches instead of toggling already selected ones.

The checkbox is now labeled `Include already selected swatches`, which describes exactly what it controls:

- Off: already selected picker swatches are dimmed/disabled in the picker.
- On: only that already-selected subset is included/enabled so the user can toggle pinned picker swatches from the picker.
- It does not globally enable or disable every picker swatch.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `PROJECT_INSTRUCTIONS.md` first | PASS | Read before implementation. |
| Use PR_26159_029 as base context | PASS | Preserved PR_029 Symbol cleanup and Colors context. |
| Achievements Build no longer uses separate hardcoded achievement/demo game data | PASS | Build table rows are rendered by `assets/theme-v2/js/account-achievements.js` from the Project Workspace server repository. |
| Achievements Build rows align with Project Workspace source | PASS | Playwright validates rows: Demo Project, Gravity Demo, Collision Demo, Camera Follow Demo. |
| Build rows show same statuses as Project Workspace | PASS | Playwright validates Under Construction and Wireframe statuses. |
| Preserve achievement columns only with derived or placeholder values | PASS | Project/status derive from project rows; stats and rating show `Not tracked yet`. |
| Do not show Sky Forge Sprint, Crystal Circuit, or Moonlit Maze in Build | PASS | Active Achievements source no longer contains those names; Playwright asserts they are absent from Build/body. |
| Missing stats/ratings show honest placeholders | PASS | Playwright validates `Not tracked yet` for stats and rating. |
| Project Workspace still renders cards/list | PASS | Scoped Project Workspace render test passed. |
| Explain why Achievements and Project Workspace differed | PASS | Report section above. |
| Revert global Picker Preview checkbox behavior | PASS | Removed `data-palette-enable-picker-swatches` and global enable/disable state. |
| Investigate prior disabled/grayed subset | PASS | Identified already selected/pinned picker swatches as the valid dimmed subset. |
| Rename checkbox to meaningful label | PASS | Label is `Include already selected swatches`. |
| Checkbox does not blindly enable/disable every swatch | PASS | Palette Playwright validates only the pinned subset is disabled/enabled. |
| Preserve Symbol cleanup and Add/Update without Symbol validation | PASS | Active Symbol scan clean; Palette Playwright Add/Update passes. |
| Validate no console errors | PASS | Achievements and Palette Playwright collect console errors and passed. |
| Playwright impacted | PASS | Account Achievements, Project Workspace render, and Palette lanes run. |
| Do not run full samples validation | PASS | Full samples skipped with reason. |
| Produce repo-structured ZIP | PASS | Created under `tmp/PR_26159_030-achievements-project-data-alignment_delta.zip`. |

## Validation Evidence

Commands run:

- `node --check assets/theme-v2/js/account-achievements.js`
- `node --check toolbox/colors/colors.js`
- `node --check tests/playwright/account/AchievementsPage.spec.mjs`
- `node --check tests/playwright/tools/PaletteToolMockRepository.spec.mjs`
- `npx playwright test tests/playwright/account/AchievementsPage.spec.mjs` - PASS, 2 passed
- `npx playwright test tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs -g "Project Workspace creates, opens, and deletes mock projects"` - PASS, 1 passed
- `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs` - PASS, 6 passed
- `npx playwright test tests/playwright/account/AchievementsPage.spec.mjs tests/playwright/tools/PaletteToolMockRepository.spec.mjs --workers=1` - PASS, 8 passed and final V8 coverage
- `git diff --check` - PASS
- Active scans for old Achievements mock names, Colors Symbol validation, and old global picker checkbox naming - PASS

## Skipped Lanes

- Full samples validation: skipped because no sample JSON contract or shared sample loader/framework changed.
- Full Playwright suite: skipped because targeted impacted lanes covered account achievements, Project Workspace render, Colors picker behavior, and runtime console checks.

## Known Adjacent Warning

Running the full `ProjectWorkspaceMockRepository.spec.mjs` file produced one unrelated warning/failure in `Toolbox member-role filters focus tools without exposing admin-only controls`: the test expects `Tool Count: 5/38`, while the current toolbox shows `Tool Count: 6/38`. This appears to be existing Toolbox visibility drift from the current stacked base, not caused by the Achievements Build alignment. The directly requested Project Workspace render/cards/list test passed.
