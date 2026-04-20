# BUILD_PR — Asteroids Link Target Correction

## Purpose
Correct the Asteroids launch/debug links so they target the existing working game path and do not reference nonexistent alternate folders or assets.

## Scope
- Asteroids link target correction only
- No global link-system changes
- No metadata reshaping
- No UI/layout changes
- No asset moves or renames

## Problem
UAT showed the restored link path is incorrect and results in 404s for nonexistent targets such as:
- `/games/asteroids_new/assets/fire.wav`
- `/games/asteroids_new/assets/bangLarge.wav`
- `/games/asteroids_new/assets/bangMedium.wav`
- `/games/asteroids_new/assets/bangSmall.wav`
- `/games/asteroids_new/assets/beat1.wav`
- `/games/asteroids_new/assets/beat2.wav`

The playable game path in use is under:
- `/games/Asteroids/...`

## Required Fix
Restore/correct Asteroids sample links so both launch targets point only to the existing Asteroids game location.

### Expected Targets
- Play: `/games/Asteroids/index.html`
- Debug Mode: `/games/Asteroids/index.html?debug=1`

## Rules
- Modify only the Asteroids sample entry/render output needed for these two targets
- Do not introduce `asteroids_new`
- Do not add or change any other sample links
- Do not touch unrelated game asset paths
- Preserve current card layout and wording unless strictly required for the link fix

## Validation
- Asteroids Play link opens `/games/Asteroids/index.html`
- Asteroids Debug Mode link opens `/games/Asteroids/index.html?debug=1`
- No sample link references `asteroids_new`
- No duplicate Asteroids links
- No impact to other cards

## UAT Notes
One console message appears unrelated to this PR scope:
- `A listener indicated an asynchronous response...`
This is likely extension/runtime noise unless reproduced by repo code alone.
