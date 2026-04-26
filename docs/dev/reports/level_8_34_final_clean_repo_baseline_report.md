# Level 8.34 Final Clean Repo Baseline Report

## Scope
- Final validation pass for:
  - direct game launch health
  - manifest completeness/parity
  - broken reference audit
  - last safe unused JSON removal gate
- Constraints held:
  - no runtime rewrites
  - no `start_of_day` changes

## Validation Executed
1. Game launch smoke (games only)
   - Command:
     - `node tests/runtime/LaunchSmokeAllEntries.test.mjs --games`
   - Result:
     - `PASS` (`EXIT:0`)
   - Log:
     - `tmp/level_8_34_launch_smoke_games.log`

2. Asset ownership strategy audit
   - Command:
     - `node scripts/validate-asset-ownership-strategy.mjs`
   - Result:
     - `PASS` (`EXIT:0`)
   - Log:
     - `tmp/level_8_34_asset_ownership_validation.log`

3. `npm test` full suite attempt
   - Command:
     - `npm test`
   - Result:
     - `FAIL` (`EXIT:1`) due existing pretest guard baseline drift in `tools/dev/checkSharedExtractionGuard.mjs`
   - Notes:
     - Failure is not introduced by this PR scope.
     - Reported guard summary from run:
       - `baseline_expected=614`
       - `baseline_unexpected=66`
       - `baseline_resolved=4`
   - Log:
     - `tmp/level_8_34_npm_test.log`

## Manifest Completeness and Parity
- Game manifests present for all game folders with `index.html`: `12/12`.
- Core manifest fields (`game.id`, `launch.directPath`) validated: `12/12 pass`.
- Legacy catalog parity against `game.manifest.json`:
  - `workspace.asset-catalog.json`: pass in all games where present.
  - `tools.manifest.json`: pass for Asteroids (`9/9`), template manifest domains empty (`0/0`).
- Parity counts:
  - `AITargetDummy`: workspace `1/1`
  - `Asteroids`: workspace `12/12`, tools `9/9`
  - `Bouncing-ball`: workspace `2/2`
  - `Breakout`: workspace `2/2`
  - `GravityWell`: workspace `1/1`
  - `Pacman`: workspace `2/2`
  - `Pong`: workspace `2/2`
  - `SolarSystem`: workspace `2/2`
  - `SpaceDuel`: workspace `9/9`
  - `SpaceInvaders`: workspace `10/10`
  - `vector-arcade-sample`: workspace `11/11`
  - `_template`: tools `0/0`

## Broken Reference Audit
- Checked manifest path-bearing fields (`path`, `runtimePath`, `toolDataPath`, `sourcePath`, `directPath`, `workspaceManagerPath`, `workspaceAssetCatalogPath`, `toolsManifestPath`, `palettePath`, `legacyPath`, `metadataPath`) with URL-decoding and query/hash stripping.
- Result:
  - `checked=12`
  - `missing=0`
- Outcome:
  - No broken manifest references detected in game launch/manifests.

## Unused JSON Safe-Removal Gate
- Conservative unused JSON scan in `games/**`:
  - excludes canonical manifest/legacy catalog files from deletion candidate list
  - marks candidate only when:
    - not wired in owning `game.manifest.json`
    - zero exact path references across `games tools scripts tests docs`
- Result:
  - `SAFE_UNUSED_JSON_CANDIDATES=0`
- Legacy catalog files (`workspace.asset-catalog.json`, `tools.manifest.json`) remain non-removable due active references in runtime/tooling/scripts/tests.

## Deletions
- No JSON files were removed in this pass.
- Reason: no files met safe-removal proof criteria.

## Changed Files
- `docs/dev/reports/level_8_34_final_clean_repo_baseline_report.md`

## Constraint Check
- `runtime_changes=0`
- `start_of_day_changes=0`
