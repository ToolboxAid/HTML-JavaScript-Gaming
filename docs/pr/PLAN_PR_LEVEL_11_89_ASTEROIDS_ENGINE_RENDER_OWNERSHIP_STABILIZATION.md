# PLAN_PR_LEVEL_11_89_ASTEROIDS_ENGINE_RENDER_OWNERSHIP_STABILIZATION

## Purpose
Finish the Asteroids engine-alignment work correctly, not quickly.

Asteroids must use the engine for engine-owned responsibilities and must not override or obscure engine chrome/layering behavior.

## Scope
This PR audits and fixes Asteroids render ownership only.

Engine-owned:
- frame clear behavior
- manifest-only background loading
- manifest-only bezel loading
- background draw order
- bezel draw order
- chrome layering
- optional empty-state behavior when manifest chrome is absent

Asteroids-owned:
- gameplay entities
- score/lives/game-specific HUD
- game-specific vector drawing
- gameplay state transitions

## Required audit targets
Codex must inspect at minimum:
- games/Asteroids/index.js
- games/Asteroids/game.manifest.json
- games/Asteroids/src/AsteroidsGameScene.js
- games/Asteroids/src/AsteroidsAttractAdapter.js
- any Asteroids file matching background, bezel, chrome, clear, fillRect, drawRect, overlay
- engine background/chrome modules touched by PR 11.83 through PR 11.88
- any manifest/chrome asset loader used by Asteroids

## Required fixes
1. Asteroids must not hardcode or guess bezel/background asset paths.
2. Asteroids must not load `/games/Asteroids/assets/images/bezel.png`.
3. Asteroids must not load `/games/Asteroids/assets/images/background.png`.
4. Asteroids must not load `/games/SolarSystem/assets/images/bezel.png` or `/background.png`.
5. Background and bezel must come only from `game.manifest.json`.
6. Asteroids must not gate engine background visibility by mode.
7. Background must be visible in menu, attract, pause, and gameplay when declared in manifest.
8. Asteroids must not clear the full canvas after the engine background is drawn.
9. Asteroids must not draw a full-screen opaque fill that hides a manifest background.
10. Any menu/attract/pause dimming must be transparent and must preserve visible background.
11. Bezel stretch override must live only on `image.*.bezel` manifest entries, not under asset-browser duplicate config.
12. Asteroids manifest must declare:
    - `image.asteroids.bezel.path` = `/games/Asteroids/assets/images/bezel1.png`
    - `image.asteroids.background.path` = `/games/Asteroids/assets/images/deluxe.png`
    - `image.asteroids.bezel.stretchOverride.uniformEdgeStretchPx` = `10`

## Explicit non-goals
- Do not refactor gameplay logic.
- Do not convert Asteroids audio unless directly required for render correctness.
- Do not touch unrelated games except shared engine code required to enforce manifest-only chrome loading.
- Do not add fallback/default chrome assets.
- Do not create aliases or shims.
- Do not use hardcoded asset paths outside manifests.

## Acceptance
- No browser 404s for guessed bezel/background paths.
- Asteroids background is visible in menu, attract, pause, and gameplay.
- Asteroids bezel is visible and uses manifest stretch override.
- No full-screen opaque fills hide the background.
- No game-level background ownership remains.
- Manifest is the single source of truth for Asteroids chrome assets.
- Targeted validation report documents exact files inspected and exact checks performed.
