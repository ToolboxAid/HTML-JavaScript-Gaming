# Build Path Progress Simplification

PR: PR_26155_088-build-path-progress-simplification

## Summary
- Removed the separate Toolbox `Progress` view control from `toolbox/index.html`.
- Removed the Progress render path from `toolbox/tools-page-accordions.js`.
- Preserved progress data/model fields that Build Path still consumes.
- Build Path now carries the project workflow guidance and project completion summary.

## Current Behavior
- Project workflow guidance lives under Toolbox `Build Path`.
- Build Path answers: `What should I do next?`
- Build Path shows active project, project completion, publishing progress, current focus, and top-to-bottom workflow guidance.
- No `Project -> Progress` navigation remains in the affected active Toolbox surface.

## Validation Notes
- Impacted lane: `build-path`.
- Additional affected lanes run: `workspace-contract` through legacy command `npm run test:workspace-v2`, `project-workspace`, `game-configuration`, and `game-design`.
- `npm run test:workspace-v2` was run because shared header/navigation wiring changed. The command name is legacy; user-facing naming remains Project Workspace.
- Skipped lanes: engine, games, samples, integration, old archive material.
- Skipped-lane rationale: no engine, game runtime, sample JSON, or archive behavior changed.
- Manual test notes: open `toolbox/index.html?role=user`, confirm `Progress` is absent, click `Build Path`, and confirm the guidance summary and workflow table render without console errors.
- Theme V2 gap findings: none.
