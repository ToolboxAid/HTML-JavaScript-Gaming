# BUILD_PR_LEVEL_11_89_ASTEROIDS_ENGINE_RENDER_OWNERSHIP_STABILIZATION

## Codex Task
Implement PLAN_PR_LEVEL_11_89_ASTEROIDS_ENGINE_RENDER_OWNERSHIP_STABILIZATION.

## Execution mode
Correctness-first stabilization. Do not rush. Inspect before editing.

## Required steps

### 1. Baseline search
Run searches and save findings to:
`docs/dev/reports/pr_11_89_asteroids_engine_render_ownership_report.md`

Required searches:
```powershell
Select-String -Path .\games\Asteroids\**\*.js -Pattern "clearRect|fillRect|drawRect|background|bezel|chrome|overlay|rgba|globalAlpha" -CaseSensitive:$false
Select-String -Path .\games\Asteroids\**\*.* -Pattern "bezel.png|background.png|bezel1.png|deluxe.png|image.asteroids.bezel|image.asteroids.background" -CaseSensitive:$false
Select-String -Path .\src\**\*.js,.\games\**\*.js -Pattern "/games/.*/assets/images/bezel.png|/games/.*/assets/images/background.png" -CaseSensitive:$false
Select-String -Path .\games\Asteroids\game.manifest.json -Pattern "asset-browser|stretchOverride|image.asteroids.bezel|image.asteroids.background|bezel1.png|deluxe.png" -CaseSensitive:$false
```

### 2. Manifest correction
Update `games/Asteroids/game.manifest.json` so:
- `image.asteroids.bezel` path is `/games/Asteroids/assets/images/bezel1.png`
- `image.asteroids.background` path is `/games/Asteroids/assets/images/deluxe.png`
- `image.asteroids.bezel` includes:
```json
"stretchOverride": {
  "uniformEdgeStretchPx": 10
}
```
- no duplicate bezel stretch config exists under `asset-browser.assets.bezel`

### 3. Engine-owned background
Ensure the engine draws declared background in all states:
- menu
- attract
- pause
- gameplay

Remove or correct any Asteroids mode gate that prevents declared background rendering.

### 4. No opaque game suppression
Find any Asteroids full-canvas clear/fill/overlay after background rendering.
- Remove clear/fill if it duplicates engine clear.
- Convert required dim overlays to transparent overlays that keep background visible.
- Do not allow full opacity over the entire canvas unless it is an explicit gameplay flash/effect and not persistent.

### 5. Manifest-only chrome source
Remove all guessed/fallback loading of chrome paths:
- `bezel.png`
- `background.png`
- any derived `/games/<Game>/assets/images/bezel.png`
- any derived `/games/<Game>/assets/images/background.png`

Chrome assets must be loaded only if declared in manifest. Missing optional chrome renders safe empty state with no network request.

### 6. Import/path verification
Do not leave broken imports or stale references introduced by previous PRs.
Run:
```powershell
Select-String -Path .\src\**\*.js,.\games\**\*.js -Pattern "src/engine/utils/|/src/engine/utils/" -CaseSensitive:$false
```
Expected: zero results, unless the occurrence is inside a report/documentation file. Do not alter unrelated docs.

### 7. Targeted validation
Run only targeted validation; do not run full samples suite.

Required:
```powershell
npm test -- --runInBand
```
If the repo does not support this exact command, document the supported targeted command used instead.

Manual/browser validation checklist to document:
- Open Workspace Manager.
- Launch Asteroids.
- Confirm no 404s for bezel/background.
- Confirm background visible in menu.
- Confirm background visible in attract.
- Confirm background visible in pause.
- Confirm background visible in gameplay.
- Confirm bezel visible.
- Confirm bezel stretch uses manifest override.

### 8. Report
Create:
`docs/dev/reports/pr_11_89_asteroids_engine_render_ownership_report.md`

Include:
- files inspected
- changes made
- remaining full-screen fills, if any, and why they are safe
- before/after guessed-path search result
- before/after `src/engine/utils/` search result
- validation commands run
- whether full samples test was skipped and why

## Roadmap
If touching roadmap, status-only updates only. Do not rewrite roadmap text.
