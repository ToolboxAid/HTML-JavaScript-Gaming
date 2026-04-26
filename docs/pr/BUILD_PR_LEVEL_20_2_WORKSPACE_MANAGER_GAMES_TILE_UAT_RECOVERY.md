# BUILD_PR_LEVEL_20_2_WORKSPACE_MANAGER_GAMES_TILE_UAT_RECOVERY

## Purpose

Perform the smallest executable recovery change needed to make Workspace Manager open from a `games/index.html` game tile during UAT.

## Required Inputs

- Read `PROJECT_INSTRUCTIONS.md` first.
- Read `docs/dev/codex_rules.md` second.
- Follow the anti-pattern guard exactly.

## Codex Task

1. Inspect the current games index tile rendering path.
2. Verify how each card builds the Workspace Manager URL.
3. Make the smallest code change required so UAT can open Workspace Manager from the game tile/title or explicit Workspace Manager link.
4. Preserve existing preview/game launch behavior.
5. Ensure the selected game id is passed to Workspace Manager through the query string as `game=<gameId>`.
6. Add only minimal Workspace Manager query handling if the page currently drops or ignores the selected game id in a way that blocks UAT.
7. Do not create alias variables, remapping chains, or pass-through variables.
8. Update the roadmap status only if there is an existing directly relevant line for this lane. If no directly relevant line exists, leave roadmap content untouched and explain that in the report.
9. Write the validation report to `docs/dev/reports/BUILD_PR_LEVEL_20_2_WORKSPACE_MANAGER_GAMES_TILE_UAT_RECOVERY_uat_report.md`.

## Hard File Boundaries

Allowed files:

- `games/index.html`
- `games/index.render.js`
- `games/index.css`
- `games/metadata/games.index.metadata.json`
- `tools/toolRegistry.js`
- `tools/Workspace Manager/index.html`
- `tools/Workspace Manager/main.js`
- `tools/Workspace Manager/toolHost.css`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`
- `docs/dev/reports/BUILD_PR_LEVEL_20_2_WORKSPACE_MANAGER_GAMES_TILE_UAT_RECOVERY_uat_report.md`

Do not edit any other file unless a direct import/runtime error proves it is required. If that happens, document the reason in the report.

## Required UAT Script

Run through a local web server:

1. Open `/games/index.html`.
2. Find a playable or in-progress game tile with a valid game href.
3. Click the tile title or Workspace Manager link.
4. Confirm the browser opens `/tools/Workspace%20Manager/index.html?game=<gameId>` or equivalent encoded URL.
5. Confirm Workspace Manager loads without new console errors.
6. Confirm preview image/game launch behavior still opens the game page where applicable.
7. Confirm no anti-patterns were introduced in changed code.

## Anti-Pattern Rejection Rules

Reject and fix any diff containing:

- `name1` -> `nameA` style remapping.
- One variable copied into another without transformation.
- Temporary variables used only once where direct usage is clearer.
- Helper functions added without reuse or clear simplification.
- Broad refactor unrelated to this UAT path.

## Completion Output Required From Codex

- Repo changes only.
- Validation report at `docs/dev/reports/BUILD_PR_LEVEL_20_2_WORKSPACE_MANAGER_GAMES_TILE_UAT_RECOVERY_uat_report.md`.
- ZIP artifact at `tmp/BUILD_PR_LEVEL_20_2_WORKSPACE_MANAGER_GAMES_TILE_UAT_RECOVERY.zip` containing the changed repo-relative files.
