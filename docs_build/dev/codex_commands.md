# Codex Commands

## PR_26154_048-050

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Replaced `toolbox/toolRegistry.js` with active toolbox entries only.
- Deleted unused `toolbox/renderToolsIndex.js`.
- Deleted deprecated `tests/tools/ToolHostDispatchContract.test.mjs` and removed it from `tests/run-tests.mjs`.
- Deleted obsolete registry-era validators:
  - `scripts/validate-project-system.mjs`
  - `scripts/validate-starter-project-template.mjs`
- Moved `archive/v1-v2/docs_build/archive/tools/SpriteEditor_old_keep/` to `archive/v1-v2/tools/SpriteEditor_old_keep/`.
- Moved `docs_build/tools/tools-index-registry/` to `archive/v1-v2/docs_build/tools/tools-index-registry/`.
- Updated active runtime/shared path references from `old_games` and `old_samples` to `archive/v1-v2/games` and `archive/v1-v2/samples`.
- Updated active tests and fixtures to assert archive paths.
- Updated active guard scripts to use current `toolbox` ownership.

Validation:
- `node scripts/validate-tool-registry.mjs`
- `npm run test:workspace-v2`
- `git diff --check`
- `node --check` for changed active JS/MJS files.
- JSON parse for changed active JSON files.
- Targeted reference checks for `toolbox/toolRegistry.js`, `toolbox/renderToolsIndex.js`, `toolbox/code`, `SpriteEditor_old_keep`, `old_games`, `old_samples`, `old-tools`, `tools/`, `samples/`, `assets/theme/v2`, and `archive/v1-v2`.

Required reports:
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/toolbox_registry_final_cleanup_report.md`
- `docs_build/dev/reports/archive_policy_final_alignment_report.md`
- `docs_build/dev/reports/legacy_alias_removal_closeout_report.md`
- `docs_build/dev/reports/migration_done_status_report.md`

## PR_26154_051

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Ran final active-path checks for `tools/`, `samples/`, `old-tools`, `old_games`, `old_samples`, `assets/theme/v2`, `src/engine/theme`, `favicon.ico`, and `styles.css`.
- Ignored `archive/v1-v2/`, `tmp/`, and generated review artifacts for active stale-path classification.
- Fixed the remaining active README reference from `old_samples/index.html` to `archive/v1-v2/samples/index.html`.
- Generated local review artifacts when possible and documented their handling.
- Created the repo-structured delta ZIP at `tmp/PR_26154_051-final-done-check-no-review-artifact-blocker_delta.zip`.

Validation:
- Targeted active-path reference checks.
- `git diff --check`
- `node --check playwright.config.cjs`
- UTF-8/read validation for changed Markdown, text, and JS/CJS files.
- `npm run test:workspace-v2` skipped because active toolbox launch/navigation/runtime behavior did not change.
- Full samples smoke test skipped per request.
- Tests against `archive/v1-v2/` skipped per request.

Required reports:
- `docs_build/dev/reports/final_done_check_report.md`
- `docs_build/dev/reports/review_artifact_handling_report.md`

## PR_26154_052

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Confirmed active Theme V2 CSS links use `assets/theme-v2/css/theme.css`.
- Confirmed `assets/theme-v2/css/styles.css` had no active runtime/page/template/tool references.
- Deleted inactive `assets/theme-v2/css/styles.css` from active Theme V2 ownership.
- Re-ran active-path checks for `tools/`, `samples/`, `old-tools`, `old_games`, `old_samples`, `assets/theme/v2`, `src/engine/theme`, `favicon.ico`, and `styles.css`.
- Documented archive-only `styles.css` references without changing archive behavior.
- Generated local review artifacts; artifact files remain ignored by `.gitignore`.
- Created the repo-structured delta ZIP at `tmp/PR_26154_052-theme-css-entrypoint-closeout_delta.zip`.

Validation:
- Targeted Theme V2 CSS entrypoint reference validation.
- Targeted final active-path reference validation.
- `git diff --check`
- Static UTF-8/read validation for changed Markdown/text files and deleted CSS status.
- `npm run test:workspace-v2` skipped because active toolbox launch/navigation/runtime behavior did not change and no active references changed.
- Full samples smoke test skipped per request.
- Tests against `archive/v1-v2/` skipped per request.

Required reports:
- `docs_build/dev/reports/theme_css_entrypoint_closeout_report.md`
- `docs_build/dev/reports/migration_final_status_report.md`

## PR_26155_096-099

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Added registry route/navigation helpers in `toolbox/toolRegistry.js`.
- Made Admin Tools Progress tool names link through shared registry route data.
- Added disabled planned rendering for route-less tools.
- Added Previous Tool and Next Tool controls to shared Tool Display Mode.
- Added registry-driven multi-path fallback from Game Configuration to Toolbox Group view.
- Added Toolbox URL state support for `view=group&group=<slug>`.
- Added the targeted `tool-navigation` Playwright lane.

Validation:
- `node --check toolbox/toolRegistry.js`
- `node --check admin/tools-progress.js`
- `node --check assets/theme-v2/js/tool-display-mode.js`
- `node --check toolbox/tools-page-accordions.js`
- `node --check tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`
- `npm run test:lane:tools-progress`
- `npm run test:lane:tool-navigation`
- `npm run test:workspace-v2`
- `git diff --check`

Required reports:
- `docs_build/dev/reports/tools-progress-tool-links.md`
- `docs_build/dev/reports/tool-display-mode-prev-next.md`
- `docs_build/dev/reports/tool-display-mode-multi-path-fallback.md`
- `docs_build/dev/reports/tool-navigation-targeted-msj-tests.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## PR_26155_100-102

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Updated shared Tool Display Mode body layout to identity row plus navigation row.
- Kept character image and tool name on the first row.
- Kept Previous/Next navigation on the second row.
- Changed missing previous/next targets from disabled buttons to disabled text.
- Kept enabled Previous/Next controls as registry-driven links.
- Added the targeted `tool-display-mode` Playwright lane.

Validation:
- `node --check assets/theme-v2/js/tool-display-mode.js`
- `node --check tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs`
- `node --check tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`
- `node --check scripts/run-targeted-test-lanes.mjs`
- `npm run test:lane:tool-display-mode`
- `npm run test:lane:tool-navigation`
- `npm run test:workspace-v2`
- `git diff --check`

Required reports:
- `docs_build/dev/reports/tool-display-mode-nav-layout.md`
- `docs_build/dev/reports/tool-display-mode-registry-links.md`
- `docs_build/dev/reports/tool-display-mode-targeted-msj-tests.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## PR_26155_103-105

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Removed `btn` and `btn-secondary` classes from Tool Display Mode Previous/Next anchors.
- Preserved the two-row Tool Display Mode body layout:
  - identity row
  - navigation row
- Added Build Game Tool Display Mode regression coverage.
- Kept Previous/Next registry-driven and anchor-based.
- Did not add CSS, page-local styles, tool-local styles, inline styles, or style blocks.

Validation:
- `node --check assets/theme-v2/js/tool-display-mode.js`
- `node --check tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs`
- `npm run test:lane:tool-display-mode`
- `git diff --check`

Required reports:
- `docs_build/dev/reports/tool-display-mode-links-not-buttons.md`
- `docs_build/dev/reports/tool-display-mode-two-row-layout.md`
- `docs_build/dev/reports/tool-display-mode-build-game-regression.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## PR_26154_053

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Added a targeted Toolbox rebuild rule to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Corrected `toolbox/index.html` so Order, Group, Progress, and Build Path are view controls for the same Toolbox surface.
- Removed the extra Progress Wireframe and Build Path Wireframe accordion/card content.
- Preserved existing active tool tile data and `tools-page-accordions.js` page wiring.
- Added Progress view rendering with static `locked`, `ready`, `in-progress`, and `complete` readiness labels on existing tool tiles.
- Added Build Path view rendering as visual path groups using existing tool tiles.
- Kept Arcade out of Toolbox content.
- Kept forbidden legacy naming out of Toolbox dynamic tool labels except product ID usage.
- Updated active validation scripts and Project Workspace Playwright assertions for the corrected view-mode contract.
- Added validation and manual test notes.
- Generated local review artifacts.
- Created the repo-structured delta ZIP at `tmp/PR_26154_053-toolbox-wireframe-rebuild-rule_view-mode-correction_delta.zip`.

Validation:
- `node scripts/validate-active-tools-surface.mjs`
- `node scripts/validate-tool-registry.mjs`
- Toolbox source checks for view controls, Progress readiness labels, Build Path path groups, absence of extra Progress/Build Path wireframe sections, Arcade absence, forbidden legacy label absence, and no inline CSS/JS/event handlers.
- `npm run test:workspace-v2`
- `git diff --check`
- `node --check` for changed JS/MJS files.
- No new CSS added.

Required reports:
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/toolbox_wireframe_rebuild_rule_report.md`

## PR_26155_001

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Added targeted independent validation guidance to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Added tools database planning governance requiring tool metadata, category, route, status, readiness, requirements, progress checklist, and deferred flags to come from a declared registry/data source before runtime DB behavior.
- Added game debug configuration governance for visible creator testing settings and public/playable release rejection or disablement.
- Added Project Workspace naming guidance; `npm run test:workspace-v2` is treated as legacy test-command naming only.
- Reviewed `toolbox/index.html` and confirmed Order, Group, Progress, and Build Path remain page modes for the same Toolbox surface.
- Confirmed Progress and Build Path are not represented as standalone tool tiles or extra accordions.
- Kept Arcade out of Toolbox content.
- Kept forbidden legacy naming out of Toolbox dynamic tool labels except product ID usage.
- Added targeted validation notes, skipped broad-lane rationale, Project Workspace naming note, and manual test notes.
- Generated local review artifacts.
- Created the repo-structured delta ZIP at `tmp/PR_26155_001-project-workspace-governance-toolbox-modes_delta.zip`.

Validation:
- `node scripts/validate-active-tools-surface.mjs`
- `node scripts/validate-tool-registry.mjs`
- Toolbox source checks for view controls, Progress readiness labels, Build Path path groups, absence of extra Progress/Build Path wireframe sections, Arcade absence, forbidden legacy label absence, and no inline CSS/JS/event handlers.
- `npm run test:workspace-v2` (legacy command name for the Project Workspace test lane)
- `git diff --check`
- `node --check` for changed JS/MJS files.
- No new CSS added.
- Full samples smoke test skipped because samples are not in scope and no shared sample runtime behavior changed.

Required reports:
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/project_workspace_governance_toolbox_modes_report.md`

## PR_26155_002

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Created `account/achievements.html` as an active Theme V2 wireframe page.
- Added external JavaScript in `assets/theme-v2/js/account-achievements.js` only for Build, Play and Share tab switching.
- Added Achievements to Account navigation where account links are listed.
- Used existing Theme V2 buttons, cards, tables, panels, status, and layout classes only.
- Avoided page-local CSS, inline styles, script blocks, style blocks, and inline event handlers.
- Added Build tab content for created games, stats, ratings, and quick actions.
- Added Play tab content for played games, favorite/share actions, progress, and ratings.
- Added Share tab content for creator share analytics and games I shared.
- Added targeted Playwright coverage for the Achievements page only.

Validation:
- Targeted Playwright: `npx playwright test tests/playwright/account/AchievementsPage.spec.mjs --project=playwright --workers=1 --reporter=list`.
- Static validation for inline script/style/event handlers.
- `node --check assets/theme-v2/js/account-achievements.js`.
- `node --check tests/playwright/account/AchievementsPage.spec.mjs`.
- `git diff --check`.
- Full samples smoke test skipped because samples are not in scope.

Required reports:
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/account_achievements_wireframe_report.md`

## PR_26155_003

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Kept `account/achievements.html` defaulted to the Build view.
- Made the Build default show only Build / Created games content.
- Kept Played games and shared content hidden until their matching buttons are selected.
- Added explicit `aria-controls`, panel IDs, and `aria-hidden` state for Achievements tabs and panels.
- Updated external tab switching in `assets/theme-v2/js/account-achievements.js` to keep `hidden` and `aria-hidden` synchronized.
- Sorted the short Account sidebar alphabetically across account pages.
- Updated targeted Achievements Playwright coverage for the default visible content, selected content switching, and sidebar order.
- No CSS added or modified.

Validation:
- `node --check assets/theme-v2/js/account-achievements.js`.
- `node --check tests/playwright/account/AchievementsPage.spec.mjs`.
- Static validation for inline script/style/event handlers.
- `npx playwright test tests/playwright/account/AchievementsPage.spec.mjs --project=playwright --workers=1 --reporter=list`.
- `git diff --check`.
- Full samples smoke test skipped because samples are not in scope.

Required reports:
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/account_achievements_tab_sidebar_fix_report.md`

Follow-up:
- Sorted shared header and footer Account menus to match the Account sidebar order:
  Account Home, Achievements, Preferences, Profile, Security.
- Extended targeted Achievements Playwright coverage to verify header and footer Account menu order.

## PR_26155_004

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Audited `toolbox/index.html`.
- Audited `toolbox/tools-page-accordions.js`.
- Documented the current behavior provided by `tools-page-accordions.js`.
- Decided KEEP for `toolbox/tools-page-accordions.js`.
- Kept `toolbox/tools-page-accordions.js` unchanged because it still owns current Toolbox card rendering, view switching, Progress readiness rendering, and Build Path rendering.
- Did not remove the script reference from `toolbox/index.html`.
- Did not add replacement architecture, CSS, or tools.

Validation:
- `npm run test:workspace-v2`.
- `node --check toolbox/tools-page-accordions.js`.
- Browser validation for `toolbox/index.html`: rendered 16 Toolbox cards, no console errors, no failed requests, `Order A-Z`, `Group`, `Progress`, and `Build Path` visible, and no `Arcade` in Toolbox `main` content.
- `git diff --check`.

Required reports:
- `docs_build/dev/reports/toolbox-runtime-ownership.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## PR_26155_005

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Created `docs_build/dev/reports/toolbox-recovery-alignment.md`.
- Summarized the executed Toolbox recovery sequence:
  - `PR_26154_053` initially added the wireframe incorrectly as extra sections.
  - The follow-up view-mode correction made Progress and Build Path page mode controls.
  - `PR_26155_004` kept `toolbox/tools-page-accordions.js` because it still owns current Toolbox rendering.
- Documented that `toolbox/index.html` is transitional and still depends on `toolbox/tools-page-accordions.js`.
- Documented the next required architecture step: create a registry-driven Toolbox runtime for Order, Group, Progress, and Build Path before removing `tools-page-accordions.js`.
- Added Project Workspace naming guidance in the report.
- Added targeted validation guidance in the report.
- Did not modify runtime behavior, `toolbox/index.html`, CSS, tools, or `toolbox/tools-page-accordions.js`.

Validation:
- `git diff --check`.
- Verified the report names the current state and next architecture step clearly.
- Playwright skipped because impacted is No and this PR is docs/report alignment only.

Required reports:
- `docs_build/dev/reports/toolbox-recovery-alignment.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## PR_26155_006

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Created `docs_build/dev/reports/toolbox-registry-contract.md`.
- Defined the minimal Toolbox registry contract for Order, Group, Progress, and Build Path.
- Included required fields: `id`, `label`, `category`, `colorGroup`, `route`, `requiredForPlayable`, `requires`, `deferred`, `progressChecklist`, and `status`.
- Stated this PR is contract-only and keeps current `toolbox/tools-page-accordions.js` rendering unchanged.
- Stated the next implementation PR starts Project Workspace tooling with a registry-driven Toolbox runtime.
- Did not modify runtime behavior, CSS, tools, or database implementation.

Validation:
- `git diff --check`.
- Playwright skipped because impacted is No and this PR is docs/contract only.

Required reports:
- `docs_build/dev/reports/toolbox-registry-contract.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## PR_26155_007-012

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Created stacked Toolbox wireframe bundle:
  - `PR_26155_007-project-workspace-wireframe`
  - `PR_26155_008-game-design-wireframe`
  - `PR_26155_009-game-configuration-wireframe`
  - `PR_26155_010-toolbox-build-path-view`
  - `PR_26155_011-toolbox-progress-view`
  - `PR_26155_012-tool-requirement-overlay-wireframe`
- Created `toolbox/project-workspace/index.html` from the active tool template structure and adapted wireframe content.
- Updated `toolbox/game-design/index.html` wireframe content while preserving the tool template shell.
- Created `toolbox/game-configuration/index.html` from the active tool template structure and adapted wireframe content.
- Added static missing-requirements cards using existing Theme V2 classes only.
- Updated active Toolbox wiring in:
  - `assets/theme-v2/partials/header-nav.html`
  - `assets/theme-v2/js/gamefoundry-partials.js`
  - `toolbox/toolRegistry.js`
  - `toolbox/tools-page-accordions.js`
- Kept `toolbox/tools-page-accordions.js` because it still owns current Toolbox rendering.
- Did not add CSS, tools beyond the requested wireframe surfaces, database behavior, persistence, or real runtime save/load.

Validation:
- `node --check toolbox/tools-page-accordions.js`.
- `node --check toolbox/toolRegistry.js`.
- `node --check assets/theme-v2/js/gamefoundry-partials.js`.
- `node scripts/validate-active-tools-surface.mjs`.
- `node scripts/validate-tool-registry.mjs`.
- No inline style/script/event-handler matches in the three tool wireframes.
- `npm run test:workspace-v2` (legacy command name for the Project Workspace test lane).
- Targeted Playwright page checks for `toolbox/index.html`, `toolbox/project-workspace/index.html`, `toolbox/game-design/index.html`, and `toolbox/game-configuration/index.html`.
- `git diff --check`.
- No CSS added or modified.

Required reports:
- `docs_build/dev/reports/stack-toolbox-wireframes.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## PR_26155_013-015

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Created stacked Toolbox cleanup/model bundle:
  - `PR_26155_013-studio-vocabulary-cleanup`
  - `PR_26155_014-project-progress-model`
  - `PR_26155_015-toolbox-build-path-model`
- Normalized active Toolbox tool ids, route keys, tool display slugs, labels, and active Playwright assertions away from old tool identity wording while keeping the product ID.
- Updated the active Toolbox registry and shared header route map.
- Added static Project Progress model support to the existing transitional Toolbox renderer.
- Added static Build Path model support to the existing transitional Toolbox renderer.
- Kept `toolbox/tools-page-accordions.js` as the active renderer.
- Did not add CSS, database behavior, persistence, save/load behavior, or Arcade.

Validation:
- `node --check toolbox/tools-page-accordions.js`.
- `node --check toolbox/toolRegistry.js`.
- `node --check assets/theme-v2/js/gamefoundry-partials.js`.
- `node --check assets/theme-v2/js/tool-display-mode.js`.
- `node scripts/validate-active-tools-surface.mjs`.
- `node scripts/validate-tool-registry.mjs`.
- Focused active Toolbox vocabulary scan allowing only the product ID.
- Confirmed no CSS files in the diff.
- Targeted affected-page browser check for `toolbox/index.html`, `toolbox/project-workspace/index.html`, `toolbox/game-design/index.html`, and `toolbox/game-configuration/index.html`.
- `npm run test:workspace-v2` (legacy command name for the Project Workspace test lane).
- `git diff --check`.

Required reports:
- `docs_build/dev/reports/studio-vocabulary-cleanup.md`
- `docs_build/dev/reports/project-progress-model.md`
- `docs_build/dev/reports/toolbox-build-path-model.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## PR_26155_016-018

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Created stacked Toolbox closeout bundle:
  - `PR_26155_016-toolbox-final-name-cleanup`
  - `PR_26155_017-planned-tool-shells`
  - `PR_26155_018-ready-for-first-tool-rebuild`
- Applied the prior interim active Toolbox labels that were superseded by the current concise-name cleanup.
- Updated safe interim active ids/routes that were superseded by the current concise-name cleanup.
- Added planned Toolbox shell folders and `index.html` pages from `toolbox/_tool_template-v2`.
- Added planned Media & Audio shells and planned Support shells to the active registry, header navigation, route map, and Toolbox index renderer.
- Kept `toolbox/tools-page-accordions.js` as the current transitional renderer.
- Did not add CSS, database behavior, persistence, save/load behavior, real tool behavior, or Arcade.

Validation:
- `node --check assets/theme-v2/js/gamefoundry-partials.js`.
- `node --check toolbox/tools-page-accordions.js`.
- `node --check toolbox/toolRegistry.js`.
- `node --check scripts/validate-active-tools-surface.mjs`.
- `node scripts/validate-active-tools-surface.mjs`.
- `node scripts/validate-tool-registry.mjs`.
- Targeted browser page sweep for `toolbox/index.html` plus each new and renamed tool shell.
- `npm run test:workspace-v2` (legacy command name for the Project Workspace test lane).
- `git diff --check`.

Required reports:
- `docs_build/dev/reports/toolbox-final-name-cleanup.md`
- `docs_build/dev/reports/planned-tool-shells.md`
- `docs_build/dev/reports/ready-for-first-tool-rebuild.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## PR_26155_019-021

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Created stacked Toolbox role/name cleanup bundle:
  - `PR_26155_019-admin-creator-view-banner`
  - `PR_26155_020-deep-tool-name-cleanup`
  - `PR_26155_021-toolbox-role-filter-wireframe`
- Added temporary `?role=admin` and `?role=user` role simulation to `toolbox/index.html`.
- Added the clickable role banner using existing Theme V2 classes only.
- Renamed active Toolbox folders and routes to concise labels such as Colors, Controls, Saved Data, Objects, Worlds, Animations, Music, Voices, and Languages.
- Added missing planned/admin shell pages from `toolbox/_tool_template-v2`.
- Updated the active Toolbox registry, shared header navigation, shared route map, transitional Toolbox renderer, and active Playwright checks.
- Kept `toolbox/tools-page-accordions.js` as the current transitional renderer.
- Did not add CSS, auth, database behavior, persistence, save/load behavior, real tool behavior, or Arcade.

Validation:
- `node --check assets/theme-v2/js/gamefoundry-partials.js`.
- `node --check toolbox/tools-page-accordions.js`.
- `node --check toolbox/toolRegistry.js`.
- `node --check scripts/validate-active-tools-surface.mjs`.
- `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`.
- `node scripts/validate-active-tools-surface.mjs`.
- `node scripts/validate-tool-registry.mjs`.
- Focused active Toolbox vocabulary scan allowing only the product ID.
- `git diff --name-only -- '*.css'` confirmed no CSS files changed.
- `npm run test:workspace-v2` (legacy command name for the Project Workspace test lane).
- Targeted browser sweep for Toolbox default/admin/user views and every new/renamed shell route.

Required reports:
- `docs_build/dev/reports/admin-creator-view-banner.md`
- `docs_build/dev/reports/deep-tool-name-cleanup.md`
- `docs_build/dev/reports/toolbox-role-filter-wireframe.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## PR_26155_092-095

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Hydrated `admin/tools-progress.html` from the active Toolbox registry using `admin/tools-progress.js`.
- Restored the Toolbox group/color model:
  - Purple = AI
  - Orange = Audio
  - Red = Build/Create
  - Pink = Design
  - Gold = Marketplace
  - Blue = Platform
  - Green = Play
- Updated `toolbox/toolRegistry.js` category/color metadata for every active/planned tool.
- Updated `toolbox/tools-page-accordions.js` so Toolbox Group view browses restored semantic color groups while Build Path remains workflow-order and project-specific.
- Updated shared Theme V2 group classes in `assets/theme-v2/css/colors.css`.
- Updated Admin group color references in `admin/grouping-colors.html`, `admin/controls.html`, and `admin/design-system.html`.
- Added targeted Tools Progress Playwright/MSJ coverage.
- Registered `npm run test:lane:tools-progress`.

Validation:
- `npm run test:lane:tools-progress`
- `npm run test:lane:build-path`
- `npm run test:workspace-v2`
- `node --check admin/tools-progress.js`
- `node --check toolbox/tools-page-accordions.js`
- `node --check scripts/run-targeted-test-lanes.mjs`
- `node --check tests/playwright/tools/ToolsProgressHydration.spec.mjs`
- `node --check tests/playwright/tools/BuildPathProgressSimplification.spec.mjs`
- Targeted fixed-string reference checks for removed Project Progress route/nav references.
- Targeted touched-surface scan for forbidden `Studio` wording except `GameFoundryStudio`.
- Targeted touched-surface scan confirming Arcade is absent from Toolbox.
- `git diff --check`

Required reports:
- `docs_build/dev/reports/admin-tools-progress-hydration.md`
- `docs_build/dev/reports/toolbox-group-color-model-restore.md`
- `docs_build/dev/reports/group-color-propagation.md`
- `docs_build/dev/reports/tools-progress-targeted-msj-tests.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_110-113

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Closed the missing tool image coverage gaps from PR_26155_106-109.
- Added approved no-size-suffix badge/tool assets under `assets/theme-v2/images/badges/` and `assets/theme-v2/images/tools/`.
- Refreshed the Toolbox registry available-image surface so all active/planned tools resolve without fallback.
- Updated the targeted Tool Image Playwright/MSJ test to require complete coverage.

Validation:
- `node --check toolbox/toolRegistry.js`
- `node --check tests/playwright/tools/ToolImageRegistry.spec.mjs`
- Registry assertion: no `-1024` registry paths and no missing/fallback image coverage rows.
- `npm run test:lane:tool-images`
- `git diff --check`
- Full samples smoke: skipped; image asset closeout does not modify samples.

Required reports:
- `docs_build/dev/reports/tool-image-coverage-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_114-117

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Fixed Toolbox card image UI behavior after the asset coverage closeout.
- Kept Toolbox card preview images registry-backed through approved `/assets/theme-v2/images/tools/` paths.
- Converted Toolbox card badges from `<object>` to registry-backed `<img>` elements through approved `/assets/theme-v2/images/badges/` paths.
- Added registry diagnostics for missing/invalid badge and tool image mappings.
- Added visible Toolbox card diagnostics when a preview or badge image falls back to `/assets/theme-v2/images/image-missing.svg`.
- Added targeted Playwright/MSJ coverage for registry diagnostics and visible card-level missing-image diagnostics.
- Did not add or modify CSS.
- Did not modify `start_of_day`.

Validation:
- `node --check toolbox/toolRegistry.js`
- `node --check toolbox/tools-page-accordions.js`
- `node --check tests/playwright/tools/ToolImageRegistry.spec.mjs`
- `npm run test:lane:tool-images`
- Scoped `git diff --check` for changed implementation/test/report files.
- Targeted changed-file scan confirmed no local CSS, inline styles, script blocks, page-local image logic, `<object>` badge usage, `start_of_day` references, or size-suffix image registry paths were introduced.
- Full samples smoke: skipped by request.

Required reports:
- `docs_build/dev/reports/tool-image-ui-closeout-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_118

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Updated Toolbox card rendering so tool names render as `h3 > a` links.
- Sourced name-link targets from the registered Toolbox route via `getToolRoute()`.
- Preserved existing preview-image links, Open Tool launch actions, card layout, status badges, and image diagnostics.
- Added targeted Toolbox navigation/runtime Playwright/MSJ coverage for name-link route resolution.
- Did not modify Toolbox registry metadata.
- Did not add or modify CSS.
- Did not modify `start_of_day`.

Validation:
- `node --check toolbox/tools-page-accordions.js`
- `node --check tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`
- `npm run test:lane:tool-navigation`
- Scoped `git diff --check` for changed implementation/test files.
- Targeted changed-file scan confirmed no local CSS, inline styles, script blocks, or `start_of_day` references were introduced.
- Full samples smoke: skipped by request.

Required reports:
- `docs_build/dev/reports/toolbox-name-link-navigation-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_119

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Updated Build Path rows on `toolbox/index.html` so the Tool cell renders a registry-backed badge image and linked tool name.
- Sourced Build Path tool-name links from `getToolRoute()`.
- Sourced Build Path badge images through the approved Toolbox registry image path.
- Reused the existing visible image diagnostic behavior for missing badge fallback.
- Preserved Build Path workflow order, status labels, completion values, and progress guidance.
- Added targeted Build Path Playwright/MSJ coverage for links, badges, and visible missing-badge diagnostics.
- Did not add inline styles, style blocks, script blocks, inline event handlers, or CSS.
- Did not modify `start_of_day`.

Validation:
- `node --check toolbox/tools-page-accordions.js`
- `node --check tests/playwright/tools/BuildPathProgressSimplification.spec.mjs`
- `npm run test:lane:build-path`
- Scoped `git diff --check` for changed implementation/test files.
- Targeted changed-file scan confirmed no inline styles, style blocks, script blocks, inline event handlers, or `start_of_day` references were introduced.
- Full samples smoke: skipped by request.

Required reports:
- `docs_build/dev/reports/build-path-tool-links-badges-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_120

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Updated `toolbox/game-design/index.html` so Design Fields > Project Design uses a two-column Theme V2 table.
- Kept labels in the left column and controls in the right column with existing IDs, values, data hooks, and form behavior preserved.
- Added targeted Game Design Playwright/MSJ coverage for the table structure and label/control pair preservation.
- Documented Theme V2 gaps for reusable right-aligned table labels and table-cell control fill behavior.
- Did not add CSS, inline styles, style blocks, script blocks, inline event handlers, or tool-local/page-local assets.
- Did not modify unrelated Game Design sections.
- Did not modify `start_of_day`.

Validation:
- `node --check tests/playwright/tools/GameDesignMockRepository.spec.mjs`
- `npm run test:lane:game-design`
- Scoped `git diff --check` for changed implementation/test/report files.
- Targeted changed-file scan confirmed no inline styles, style blocks, inline scripts, inline event handlers, or `start_of_day` references were introduced.
- Full samples smoke: skipped by request.

Required reports:
- `docs_build/dev/reports/game-design-project-design-table-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_121

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Added reusable `.tool-form-table` Theme V2 CSS in `assets/theme-v2/css/tables.css`.
- Updated `toolbox/game-design/index.html` Project Design table to opt into `data-table tool-form-table`.
- Kept Project Design labels compact and right-aligned through the reusable Theme V2 table pattern.
- Kept Project Design input controls stretching across the available input column through the reusable Theme V2 table pattern.
- Set both Project Design textarea controls to `rows="4"`.
- Added targeted Game Design Playwright/MSJ coverage for layout width, compact/right-aligned labels, input-column fill, and textarea rows.
- Did not add inline styles, style blocks, script blocks, inline event handlers, page-local CSS, or tool-local CSS.
- Did not modify unrelated Game Design sections.
- Did not modify `start_of_day`.

Validation:
- `node --check tests/playwright/tools/GameDesignMockRepository.spec.mjs`
- `npm run test:lane:game-design`
- Scoped `git diff --check` for changed implementation/test/report files.
- Targeted changed-file scan confirmed no inline styles, style blocks, inline scripts, inline event handlers, or `start_of_day` file changes were introduced.
- Full samples smoke: skipped by request.

Required reports:
- `docs_build/dev/reports/tool-form-table-layout-standard-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_122

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Updated shared Tool Display Mode Theme V2 styling in `assets/theme-v2/css/panels.css`.
- Set `.tool-display-mode__badge` to `64px` by `64px`.
- Set `.tool-display-mode__character` to `225px` by `127px`.
- Moved Tool Display Mode body layout to a two-column grid so description sits to the right of the character and navigation sits below the description area.
- Preserved existing Tool Display Mode JavaScript, generated markup, and registry previous/next link behavior.
- Added targeted Tool Display Mode Playwright/MSJ coverage for badge size, character size, description placement, and navigation placement.
- Did not add inline styles, style blocks, script blocks, inline event handlers, page-local CSS, or tool-local CSS.
- Did not modify unrelated tool content.
- Did not modify `start_of_day`.

Validation:
- `node --check tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs`
- `npm run test:lane:tool-display-mode`
- Scoped `git diff --check` for changed implementation/test/report files.
- Targeted changed-file scan confirmed no inline styles, style blocks, inline scripts, inline event handlers, or `start_of_day` file changes were introduced.
- Full samples smoke: skipped by request.

Required reports:
- `docs_build/dev/reports/tool-display-mode-layout-fix-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_123

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Removed placeholder `image-missing.svg` center-panel preview images from active registry-owned tool pages.
- Preserved center-panel headings and workspace content.
- Updated shared Tool Display Mode badge styling in `assets/theme-v2/css/panels.css`.
- Kept normal Tool Display Mode badge display at `64px` by `64px`.
- Added fullscreen Tool Display Mode badge display at `32px` by `32px`.
- Removed badge border, circular radius, panel background, and crop treatment so the square badge artwork displays fully.
- Added active tool page UI coverage to confirm active tool center panels no longer render placeholder center images.
- Added Tool Display Mode coverage for normal/fullscreen badge sizing and square/no-ring rendering.
- Did not add inline styles, style blocks, script blocks, inline event handlers, page-local CSS, or tool-local CSS.
- Did not modify archived V1/V2 pages.
- Did not modify `start_of_day`.

Validation:
- `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `node --check tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs`
- `node ./scripts/run-targeted-test-lanes.mjs --lane tool-runtime --lane tool-display-mode`
- Registry-driven static check confirmed no active tool-center-panel placeholder images remain.
- Scoped `git diff --check` for changed implementation/test/report files.
- Targeted changed-file scan confirmed no inline styles, style blocks, inline scripts, inline event handlers, archived V1/V2 paths, or `start_of_day` file changes were introduced.
- Full samples smoke: skipped by request.

Required reports:
- `docs_build/dev/reports/tool-center-image-and-badge-cleanup-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_124

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Validated every active registry-owned tool page against the Toolbox registry group color class used by `toolbox/index.html` Group view.
- Updated active tool page left and right `aside.tool-column` classes so each side column uses the page tool's registry `colorGroup`.
- Preserved tool page layout, content, Theme V2 CSS wiring, and Toolbox Group view rendering.
- Added targeted active tool page Playwright coverage for registry-aligned side column group classes and Toolbox Group view card classes.
- Did not modify `toolbox/index.html`.
- Did not add CSS, page-local CSS, tool-local CSS, inline styles, style blocks, script blocks, or inline event handlers.
- Did not modify archived V1/V2 pages.
- Did not modify `start_of_day`.

Validation:
- `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- Targeted registry static check for active tool side column group classes.
- `npm run test:lane:tool-runtime`
- `git diff --check`
- Changed-file static validation for forbidden archive/start_of_day paths and inline style/script/event-handler additions.
- Confirmed `toolbox/index.html` has no diff.
- Full samples smoke: skipped by request.

Required reports:
- `docs_build/dev/reports/tool-page-group-color-alignment-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_125

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Treated PR_26156_124 as incomplete because active tool page side-panel headers still used fixed color classes and the full side-panel visual treatment did not use the Toolbox group token.
- Used `toolbox/index.html` Group tab mapping from `toolbox/tools-page-accordions.js` as the visual/source-of-truth mapping.
- Updated shared Theme V2 panel styling in `assets/theme-v2/css/panels.css` so `tool-column` group classes drive panel borders, header background/border, accordion borders, and summary color through `--tool-group-color` and `--tool-group-accent`.
- Removed fixed legacy color classes from active tool page `tool-column-header` elements.
- Kept active tool page side columns aligned to the correct Toolbox group class.
- Added targeted Playwright coverage comparing rendered Toolbox Group tab card color/classes to active tool page left/right side panels.
- Did not modify `toolbox/index.html`.
- Did not add raw color values in tool pages.
- Did not add page-local CSS, tool-local CSS, inline styles, style blocks, script blocks, or inline event handlers.
- Did not modify archived V1/V2 pages.
- Did not modify `start_of_day`.

Validation:
- `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- Before/after active tool page audit against Toolbox Group tab mapping.
- `npm run test:lane:tool-runtime`
- `git diff --check`
- Changed-file static validation for forbidden archive/start_of_day paths and inline style/script/event-handler additions.
- Confirmed no active tool `tool-column-header` retains fixed legacy color classes.
- Confirmed `toolbox/index.html` has no diff.
- Full samples smoke: skipped by request.

Required reports:
- `docs_build/dev/reports/tool-group-color-correction-pass-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_126

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Used Toolbox Group definitions as the only authoritative group color source.
- Removed legacy/alias group color classes from active Toolbox/Theme V2 usage.
- Replaced active tool page and registry references with canonical SSoT classes:
  - `tool-group-ai`
  - `tool-group-audio`
  - `tool-group-build`
  - `tool-group-design`
  - `tool-group-marketplace`
  - `tool-group-platform`
  - `tool-group-play`
- Updated `toolbox/tools-page-accordions.js` group mapping to emit only canonical classes.
- Updated active tool page side columns and template color classes where aliases remained.
- Removed duplicate/dead grouping CSS files under `assets/theme-v2/css/tools/grouping/`.
- Added targeted test coverage to deny active alias classes and verify Toolbox Group view/page panel SSoT alignment.
- Did not hardcode colors.
- Did not modify archived V1/V2 pages.
- Did not modify `start_of_day`.

Validation:
- `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `node --check tests/playwright/tools/ToolsProgressHydration.spec.mjs`
- `npm run test:lane:tool-runtime`
- Targeted active alias reference scan for Toolbox and Theme V2 files.
- Custom SSoT audit for all active registry tool pages, Toolbox Group mapping, and Theme V2 color selectors.
- `git diff --check`
- Full samples smoke: skipped by request.

Required reports:
- `docs_build/dev/reports/tool-group-color-ssot-consolidation-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_127

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Updated `toolbox/game-configuration/index.html` Playable Setup fields to use the reusable Theme V2 `table-wrapper`, `data-table`, and `tool-form-table` form table pattern.
- Preserved Game Configuration field IDs, data hooks, form behavior, and submit behavior.
- Set Game Configuration Playable Setup textareas to 4 rows.
- Updated Toolbox card rendering in `toolbox/tools-page-accordions.js`.
- Removed duplicate local Toolbox status ownership and enriched Toolbox cards from the active registry data used by Admin Tools Progress.
- Updated normal role visibility so only Ready tools are visible outside Admin role.
- Kept non-Ready tools visible in Admin role for planning/status review.
- Converted Toolbox card bullet/list content to comma-separated bottom values.
- Updated Toolbox tile action rows to one line with badge, Open Tool/Open Page link, brand color swatch, and status tag.
- Updated targeted Playwright expectations for the changed Toolbox status/card rendering and Game Configuration table layout.
- Did not add CSS.
- Did not modify archived V1/V2 pages.
- Did not modify `start_of_day`.

Validation:
- `node --check toolbox/tools-page-accordions.js`
- `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `node --check tests/playwright/tools/ToolsProgressHydration.spec.mjs`
- `node --check tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`
- `node --check tests/playwright/tools/GameConfigurationMockRepository.spec.mjs`
- `node --check tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`
- `node ./scripts/run-targeted-test-lanes.mjs --lane tool-runtime --lane tools-progress --lane game-configuration --lane tool-navigation`
- `git diff --check`
- Changed-file static validation for forbidden archive/start_of_day paths and inline style/script/event-handler additions.
- Full samples smoke: skipped by request.

Required reports:
- `docs_build/dev/reports/toolbox-card-and-status-cleanup-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`


## PR_26156_128

Changes:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Added `admin/tools-progress-source.js` as the Admin Tools Progress status metadata source consumed by both Admin Tools Progress and Toolbox rendering.
- Removed duplicated Toolbox-local status/readiness/visibility/requiredness ownership from `toolbox/toolRegistry.js`.
- Updated `admin/tools-progress.js` to hydrate rows from the Admin status source.
- Updated `toolbox/tools-page-accordions.js` to hydrate card visibility/status from the Admin status source.
- Added visible missing-metadata diagnostics for Admin Tools Progress rows and Toolbox cards.
- Removed obsolete/dead Toolbox status constants and local progress mappings.
- Updated targeted Tools Progress tests to verify Admin source reflection, user/Admin visibility, and missing-metadata diagnostics.
- Updated the tool registry validator so base registry entries no longer need duplicate status visibility fields.
- Did not modify archived V1/V2 pages.
- Did not modify `start_of_day`.

Validation:
- `node --check admin/tools-progress-source.js`
- `node --check admin/tools-progress.js`
- `node --check toolbox/toolRegistry.js`
- `node --check toolbox/tools-page-accordions.js`
- `node --check tests/playwright/tools/ToolsProgressHydration.spec.mjs`
- `node --check scripts/validate-tool-registry.mjs`
- `node --check scripts/validate-active-tools-surface.mjs`
- `node scripts/validate-tool-registry.mjs`
- `node ./scripts/run-targeted-test-lanes.mjs --lane tools-progress --lane tool-runtime`
- `git diff --check`
- Supplemental `node scripts/validate-active-tools-surface.mjs` was not used as this PR's validation gate because it still reports existing non-status Toolbox wireframe expectations outside PR_26156_128 scope.
- Full samples smoke: skipped by request.

Required reports:
- `docs_build/dev/reports/tool-status-registry-enforcement-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
