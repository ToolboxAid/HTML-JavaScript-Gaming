Toolbox Aid
David Quesenberry
04/05/2026
asteroids_showcase_overview.md

# Asteroids Debug Showcase Overview

## Canonical Showcase
`games/Asteroids/` is the canonical productization showcase for the debug platform.

It demonstrates:
- classic Asteroids gameplay expectations
- production-safe debug gating
- sample-level debug integration without engine-core pollution
- concrete debug visibility for ship, bullets, asteroids, score, lives, and waves

## Entry Point
- Game launch: `games/Asteroids/index.html`
- Runtime boot: `games/Asteroids/main.js`
- Showcase scene: `games/Asteroids/game/AsteroidsGameScene.js`

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
