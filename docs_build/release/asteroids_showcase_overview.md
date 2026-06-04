Toolbox Aid
David Quesenberry
04/05/2026
asteroids_showcase_overview.md

# Asteroids Debug Showcase Overview

## Canonical Showcase
`archive/v1-v2/games/Asteroids/` is the canonical productization showcase for the debug platform.

It demonstrates:
- classic Asteroids gameplay expectations
- production-safe debug gating
- sample-level debug integration without engine-core pollution
- concrete debug visibility for ship, bullets, asteroids, score, lives, and waves

## Entry Point
- Game launch: `archive/v1-v2/games/Asteroids/index.html`
- Runtime boot: `archive/v1-v2/games/Asteroids/main.js`
- Showcase scene: `archive/v1-v2/games/Asteroids/game/AsteroidsGameScene.js`

## Debug Surface Coverage
- Session panel: mode, wave, active player, score, lives, high score, pause state
- Entity panel: ship state, bullet counts, asteroid counts, UFO state
- Event panel: recent gameplay event stream for gameplay transitions and collisions

## Preset Commands
- `asteroidsshowcase.preset.default`
- `asteroidsshowcase.preset.events`
- `asteroidsshowcase.events`
- `asteroidsshowcase.help`

## Production Safety
- Build defaults are production-safe (`debug` off by default in `prod` mode).
- Debug surfaces are initialized only when explicitly enabled.
- When debug is disabled, update/render debug overhead is skipped.
