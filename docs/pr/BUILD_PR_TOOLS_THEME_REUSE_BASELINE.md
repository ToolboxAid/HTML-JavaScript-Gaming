# BUILD_PR_TOOLS_THEME_REUSE_BASELINE

## PR Purpose
Apply a minimal tools theme reuse baseline as a docs-to-code follow-up to `PLAN_PR_TOOLS_SHARED_NORMALIZATION`, limited to shell/theme/layout normalization and stylesheet token alignment for active tools.

## Scope Guardrails
- Prioritize reuse of existing engine UI/theme assets (`src/engine/ui/hubCommon.css`, `tools/shared/platformShell.css`) before any expansion of tool-local CSS.
- Touch active tools only:
  - `tools/Asset Browser/`
  - `tools/Palette Browser/`
  - `tools/Parallax Scene Studio/`
  - `tools/Sprite Editor/`
  - `tools/Tilemap Studio/`
  - `tools/Vector Asset Studio/`
  - `tools/Vector Map Editor/`
- Keep `tools/SpriteEditor_old_keep/` unchanged.
- Do not refactor tool-specific behavior.
- Do not rewrite roadmap wording.
- Do not touch `docs/dev/start_of_day/*`.

## Exact Target Files
- `tools/Asset Browser/assetBrowser.css`
- `tools/Palette Browser/paletteBrowser.css`
- `tools/Parallax Scene Studio/parallaxEditor.css`
- `tools/Sprite Editor/spriteEditor.css`
- `tools/Tilemap Studio/tileMapEditor.css`
- `tools/Vector Asset Studio/svgBackgroundEditor.css`
- `tools/Vector Map Editor/vectorMapEditor.css`

## Execution Rules
- Normalize shared shell/theme selectors to use existing shared tokens:
  - `--panel`, `--panel2`, `--line`, `--text`, `--muted`, `--accent`, `--surface-inline`, `--surface-code`
- Keep layout structure intact (grid/flex sizing, section ordering, tool-specific panel structure).
- No JavaScript behavior edits.

## Validation
1. Contract check (static):
   - each touched tool `index.html` includes:
     - `../../src/engine/ui/hubCommon.css`
     - `../shared/platformShell.css`
     - `../shared/platformShell.js`
2. Style check (static):
   - touched CSS files no longer introduce new root-level palette systems that duplicate shell tokens
   - touched CSS files keep layout selectors for workspace/shell intact
3. Runtime smoke requirement:
   - each touched tool loads in browser with no console errors
   - no shell/theme visual collapse

## Failure Conditions
Stop and report if:
- scope expands beyond the exact files listed above
- `tools/SpriteEditor_old_keep/` requires edits
- start_of_day directories require edits
- a touched tool cannot load after theme normalization

## Required Output
- Validation report files under `docs/dev/reports/`
- Repo-structured delta ZIP at exact path:
  - `tmp/BUILD_PR_TOOLS_THEME_REUSE_BASELINE_delta.zip`
