# PR 11.93 Validation

## Scope
Aligned `games/Asteroids/game.manifest.json` asset-browser shape from wrapped `assets.media` to flat `assets` keyed directly by asset id.

## Changes Made
- Moved all entries from `tools.asset-browser.assets.media` to `tools.asset-browser.assets`.
- Removed the `media` wrapper object.
- Preserved all audio entries.
- Preserved/verified:
  - `image.asteroids.bezel.path = /games/Asteroids/assets/images/bezel.png`
  - `image.asteroids.bezel.stretchOverride.uniformEdgeStretchPx = 10`
  - `image.asteroids.background.path = /games/Asteroids/assets/images/deluxe.png`
  - `font.asteroids.vector-battle.path = /src/assets/fonts/vector_battle/vector_battle.ttf`

## Targeted Manifest Validation

1. JSON parse check:
- `node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('games/Asteroids/game.manifest.json','utf8')); console.log('manifest json parse: PASS');"`
- Result: PASS

2. Wrapper removed check:
- `Select-String -Path .\games\Asteroids\game.manifest.json -Pattern '"media"\s*:\s*\{'`
- Result: no matches

3. Forbidden duplicate contract check:
- `Select-String -Path .\games\Asteroids\game.manifest.json -Pattern 'asset-browser\.assets\.bezel'`
- Result: no matches

4. Forbidden bezel1 reference check:
- `Select-String -Path .\games\Asteroids\game.manifest.json -Pattern 'bezel1\.png'`
- Result: no matches

5. Required entries check:
- `Select-String -Path .\games\Asteroids\game.manifest.json -Pattern 'image\.asteroids\.bezel|image\.asteroids\.background|font\.asteroids\.vector-battle|uniformEdgeStretchPx'`
- Result: all expected entries present

6. Broader bezel1 reference check (source scope):
- `rg -n "bezel1\.png" games/Asteroids src games tools -g "*.json" -g "*.js" -g "*.mjs" -g "*.html"`
- Result: no matches

## Files Changed
- `games/Asteroids/game.manifest.json`
- `docs_build/dev/reports/PR_11_93_validation.md`
