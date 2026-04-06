Toolbox Aid
David Quesenberry
04/05/2026
asteroids_showcase_debug_tour.md

# Asteroids Debug Tour

## Enable Debug
Launch Asteroids with:
- `?debug=1`
- optional mode override: `&debugMode=qa`

Example:
- `games/Asteroids/index.html?debug=1&debugMode=qa`

## Keyboard Toggles
- `Shift + \``: toggle console
- `Ctrl + Shift + \``: toggle overlay
- `Ctrl + Shift + R`: issue reload command
- `Ctrl + Shift + ]`: next panel
- `Ctrl + Shift + [`: previous panel

## Recommended First Run
1. Open console with `Shift + \``.
2. Run `asteroidsshowcase.preset.default`.
3. Start a game with `1`.
4. Fire, thrust, and rotate.
5. Run `asteroidsshowcase.events` to inspect event flow.

## Event Visibility Highlights
The showcase emits game-loop events such as:
- `SHIP_SPAWN`
- `SHIP_THRUST`
- `SHIP_ROTATE`
- `BULLET_FIRED`
- `ASTEROID_SPLIT`
- `COLLISION_DETECTED`
- `SCORE_CHANGED`
- `LIFE_LOST`
- `WAVE_STARTED`
- `GAME_OVER`
