# PR_26170_001 Toolbox Game Journey Navigation

## Branch Validation

- PASS: Current branch verified as `main`.

## Requirement Checklist

| Requirement | Status | Notes |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | PASS | Read before implementation. |
| Create `PR_26170_001-toolbox-game-journey-navigation`. | PASS | Build doc added under `docs_build/pr/`. |
| Update `/toolbox/index.html` under the Toolbox section. | PASS | Added a non-inline marker to the existing Toolbox group list container. |
| Replace displayed Toolbox groups with Game Journey order. | PASS | `toolbox/tools-page-accordions.js` now renders Idea, Design, Graphics, Audio, Objects, Worlds, Interface, Controls, Rules, Progression, Play Test, Publish, Share. |
| Assign every displayed group a unique rainbow color with no duplicates. | PASS | Added Theme V2 swatch/tool-group classes and validated thirteen unique computed colors. |
| Preserve tool cards, routes, statuses, and links. | PASS | Display grouping changed only; registered routes/statuses remain sourced from the registry. |
| Do not change database behavior, metadata contracts, Workspace, runtime behavior, status values, or routes. | PASS | Registry/admin/build-path metadata remains unchanged; Build Path still exposes registry metadata groups. |
| Do not add inline CSS/JS, `<style>`, `<script>`, or inline event handlers. | PASS | HTML source and rendered DOM checks passed. |

## Implementation Notes

- Added a Toolbox page presentation mapping from active tool IDs to the requested Game Journey groups.
- Kept Build Path and admin metadata on the existing registry/toolbox metadata grouping path.
- Added reusable Theme V2 colors/classes in CSS rather than inline styles.
- Updated directly affected Playwright expectations for the new displayed grouping and the preserved registry metadata split.

## Validation Lane Report

| Lane | Command | Result |
| --- | --- | --- |
| Branch | `git status --short --branch` | PASS, branch `main`. |
| JS syntax | `node --check toolbox/tools-page-accordions.js; node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs; node --check tests/playwright/tools/GameJourneyTool.spec.mjs; node --check tests/playwright/tools/RootToolsFutureState.spec.mjs; node --check tests/playwright/tools/ToolNavigationPrevNext.spec.mjs; node --check tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs` | PASS |
| Diff whitespace | `git diff --check` | PASS |
| Inline HTML guard | Node scan of `toolbox/index.html` for inline script/style/handlers | PASS |
| Targeted Toolbox Playwright | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --grep "toolbox grouped view renders Game Journey order" --workers=1 --reporter=line` | PASS, 1 passed |
| Adjacent Game Journey route check | `npx playwright test tests/playwright/tools/GameJourneyTool.spec.mjs --grep "Toolbox registration exposes Game Journey navigation" --workers=1 --reporter=line` | PASS, 1 passed |
| Extra adjacent navigation check | `npx playwright test tests/playwright/tools/ToolNavigationPrevNext.spec.mjs --grep "multi-path next control routes" --workers=1 --reporter=line` | FAIL: existing `/api/toolbox/game-configuration/.../makeValidGameDesign` returned 500; group URL assertion was not the failing condition. |
| Extra adjacent display-mode check | `npx playwright test tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs --grep "multi-path fallback opens Toolbox Group view" --workers=1 --reporter=line` | FAIL: same `game-configuration` API 500. |

## Playwright Result

- Required targeted Toolbox page validation passed.
- Playwright coverage reports were refreshed by the targeted runs.
- Two extra non-required adjacent navigation checks were attempted and failed on an out-of-scope `game-configuration` API 500.

## Manual Validation Notes

- Confirmed all thirteen Game Journey groups render in order when Planned and Deprecated are enabled.
- Confirmed each rendered group label has a unique computed background color.
- Confirmed displayed Toolbox links still match their registered routes.
- Confirmed Build Path keeps registry metadata groups such as `Build/Create` for Game Workspace and `Design` for Colors.
- Confirmed `toolbox/index.html` has no inline style/script/event-handler additions.
