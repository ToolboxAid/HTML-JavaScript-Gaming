Toolbox Aid
David Quesenberry
04/05/2026
asteroids_showcase_controls_and_flags.md

# Asteroids Showcase Controls And Flags

## Gameplay Controls
- `1` or `2`: start one-player or two-player game
- `Left` / `Right`: rotate ship
- `Up`: thrust
- `Space`: fire
- `P`: pause
- `Enter`: continue from game-over prompt

## Debug Flags
Build/config defaults in `games/Asteroids/main.js`:
- `BUILD_DEBUG_MODE`
- `BUILD_DEBUG_ENABLED`

Runtime query flags:
- `debug=1|0|true|false|on|off|yes|no`
- `debugMode=dev|qa|prod`

## Debug Mode Rules
- `prod`: debug disabled by default
- `qa`: debug can be enabled explicitly
- `dev`: debug can be enabled for local iteration

## Preset And Event Commands
- `asteroidsshowcase.preset.default`
- `asteroidsshowcase.preset.events`
- `asteroidsshowcase.events`
- `overlay.list`
- `overlay.order`
