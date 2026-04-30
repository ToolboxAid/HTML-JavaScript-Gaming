# PR 11.84 Asteroids Manifest Chrome Assets Validation

## Scope executed
- Updated only `games/Asteroids/game.manifest.json`.
- No loader/shared behavior changes.

## Manifest changes
- `tools.asset-browser.assets.media.image.asteroids.bezel.path`
  - from: `/games/Asteroids/assets/images/bezel.png`
  - to: `/games/Asteroids/assets/images/bezel1.png`
- Added/kept explicit background chrome asset entry:
  - `tools.asset-browser.assets.media.image.asteroids.background.path`
  - value: `/games/Asteroids/assets/images/deluxe.png`

## Required targeted validation commands
1. `Test-Path .\games\Asteroids\assets\images\bezel1.png`
- Result: `False`

2. `Test-Path .\games\Asteroids\assets\images\deluxe.png`
- Result: `True`

3. `Select-String -Path .\games\Asteroids\game.manifest.json -Pattern "bezel1.png|deluxe.png"`
- Result:
  - `games\Asteroids\game.manifest.json:190: "path": "/games/Asteroids/assets/images/bezel1.png",`
  - `games\Asteroids\game.manifest.json:195: "path": "/games/Asteroids/assets/images/deluxe.png",`

## Additional verification
- `Select-String -Path .\games\Asteroids\game.manifest.json -Pattern "assets/images/bezel.png","assets/images/background.png" -SimpleMatch`
- Result: no matches

- Targeted launch smoke (games):
  - `node tests/runtime/LaunchSmokeAllEntries.test.mjs --games`
  - Result: PASS (`12/12`), including Asteroids launch pass.

## Notes
- The PR requirement to point bezel at `bezel1.png` is satisfied in manifest.
- `bezel1.png` file presence check currently returns `False`; this PR does not create placeholder image files by design.
