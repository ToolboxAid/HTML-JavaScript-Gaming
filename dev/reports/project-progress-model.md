# PR_26155_014 Project Progress Model

## Scope

- Added static Project Progress wireframe support to the current Toolbox renderer.
- Added Project Workspace page copy for the same progress model terms.
- Kept the model static: no database behavior, persistence, save/load, or runtime state.
- Used existing Theme V2 buttons, cards, accordions, pills, callouts, and layout classes only.

## Model Fields

- `Project Progress`: summarizes the overall core path state.
- `Publishing Progress`: summarizes release readiness and publish blockers.
- `Current Focus`: identifies the next active work area.
- `Recommended Next Tool`: points to the next tool to review.
- `requiredForTestable`: static yes/no field on rendered tool cards.
- `requiredForPublish`: static yes/no field on rendered tool cards.
- `status`: one of `locked`, `ready`, `in-progress`, or `complete`.
- `progressChecklist`: static checklist text per tool.

## Rendering

- `toolbox/tools-page-accordions.js` owns the current transitional rendering.
- The Progress view is still a page mode on the Toolbox surface, not a tool tile or separate accordion/card section.
- Progress mode renders the same tool tiles with static readiness labels and checklist text.

## Validation Notes

- PASS: targeted affected-page browser check for `toolbox/index.html`, `toolbox/project-workspace/index.html`, `toolbox/game-design/index.html`, and `toolbox/game-configuration/index.html`.
- PASS: `npm run test:workspace-v2` using the legacy command name for the Project Workspace test lane.
- PASS: no console errors or failed requests in targeted affected-page checks.
- PASS: `git diff --check`.

## Manual Notes

- Clicked Progress mode in the affected-page browser check.
- Confirmed Project Progress, Publishing Progress, Current Focus, Recommended Next Tool, `requiredForTestable`, `requiredForPublish`, `status`, and `progressChecklist` appear as static wireframe text.
- Confirmed Progress is not represented as a tool card.
