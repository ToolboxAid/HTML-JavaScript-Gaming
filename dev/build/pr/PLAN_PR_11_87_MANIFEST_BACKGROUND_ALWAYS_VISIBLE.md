# PLAN_PR_11_87_MANIFEST_BACKGROUND_ALWAYS_VISIBLE

## Purpose
Make manifest-declared game background images visible in all game presentation states, including menu/title/attract/pause, instead of being suppressed by gameplay-only render gates or hidden by clear/fill overlays.

## Problem
Asteroids can declare a valid background image in `game.manifest.json`, but it is not visible because background rendering is gated to gameplay states and attract/menu rendering can paint near-opaque full-screen fills over it.

Known evidence from user validation:
- `backgroundImage.js` only draws in gameplay states.
- `AsteroidsGameScene.js` handles `session.mode === 'menu'`.
- `AsteroidsAttractAdapter.js` draws a near-opaque full-screen dark rect in attract mode.
- The manifest entry and `deluxe.png` are valid; this is render-state behavior, not a missing-file issue.

## Scope
- Manifest-declared `image.*.background` is the source of truth for background loading.
- If a background exists and loads, draw it for all states before scene-specific foreground overlays.
- Do not clear/fill over a present background in a way that makes it invisible.
- Allow menu/attract/pause overlays to be transparent/translucent only if the background remains visible.

## Out of Scope
- No new default/fallback background paths.
- No hidden sample/default assets.
- No hardcoded `/assets/images/background.png` guesses.
- No manifest schema expansion beyond using existing `image.*.background` entries.
- No unrelated render refactors.

## Acceptance
- Asteroids `deluxe.png` background is visible on menu/attract/gameplay/pause when declared in manifest.
- No 404 for guessed background paths.
- No hardcoded chrome asset fallback remains.
- Background draw path is manifest-only.
- Targeted validation documented in `docs_build/dev/reports/PR_11_87_validation.md`.
