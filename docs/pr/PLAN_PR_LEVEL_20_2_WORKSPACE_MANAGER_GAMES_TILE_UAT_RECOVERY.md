# PLAN_PR_LEVEL_20_2_WORKSPACE_MANAGER_GAMES_TILE_UAT_RECOVERY

## Purpose

Recover the repo workflow and stabilize the current UAT path: opening Workspace Manager from a `games/index.html` game tile.

## Scope

- Use `PROJECT_INSTRUCTIONS.md` as the operating contract.
- Add a strict Codex anti-pattern rule set for this BUILD.
- Direct Codex to inspect and minimally fix only the Workspace Manager launch path from `games/index.html`.
- Preserve current preview/game launch behavior unless it is directly blocking the Workspace Manager tile handoff.
- Keep roadmap handling status-only.

## Non-Scope

- No broad repo cleanup.
- No standalone showcase work.
- No template restructure.
- No `start_of_day` edits.
- No unrelated tool registry cleanup.
- No implementation code in this bundle.

## Candidate Files For Codex To Inspect

Codex may inspect only these files unless an import directly proves another file is required:

- `games/index.html`
- `games/index.render.js`
- `games/index.css`
- `games/metadata/games.index.metadata.json`
- `tools/toolRegistry.js`
- `tools/Workspace Manager/index.html`
- `tools/Workspace Manager/main.js`
- `tools/Workspace Manager/toolHost.css`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`

## Acceptance

- Local server opens `/games/index.html` successfully.
- Clicking a game tile/title path opens Workspace Manager.
- Workspace Manager receives the selected game id through the URL query string.
- Existing preview/game page link behavior remains available.
- No new console errors are introduced by this launch path.
- Codex reports UAT results in `docs/dev/reports/BUILD_PR_LEVEL_20_2_WORKSPACE_MANAGER_GAMES_TILE_UAT_RECOVERY_uat_report.md`.
- Anti-pattern guard passes: no alias variables, pass-through variables, redundant assignments, or unnecessary remapping chains.
