Toolbox Aid
David Quesenberry
04/05/2026
debug-surfaces-external-integration.md

# Debug Surfaces External Integration

## Audience
Engine consumers, sample/game maintainers, and tool integrators that need to adopt the debug platform safely without coupling to internals.

## Public Integration Path
Use sample/game composition-level wiring only:
1. Resolve debug flags/mode at entry (`dev|qa|prod`).
2. Initialize debug integration only when debug is enabled.
3. Pass integration into the scene layer as an optional dependency.
4. Invoke update/render hooks only when integration exists.
5. Dispose integration on scene exit/teardown.

Reference implementation:
- `samples/Phase 12 - Demo Games/Demo 1205 - Multi-System Demo/main.js`
- `samples/Phase 12 - Demo Games/Demo 1205 - Multi-System Demo/MultiSystemDemoScene.js`

## Production-Safe Contract
- Debug is opt-in.
- `prod` defaults to disabled.
- Runtime query override is explicit (`?debug=1`).
- No debug integration object means no console/overlay update or render overhead.

## Build/Config Flags
Entry-level build/config flags:
- `BUILD_DEBUG_MODE`
- `BUILD_DEBUG_ENABLED`

Runtime overrides:
- `debug` query param (`0|1|true|false|on|off|yes|no`)
- `debugMode` query param (`dev|qa|prod`)

## Performance-Safe Overlay Rules
- Overlay and console are not initialized when debug is disabled.
- Scene update/render checks remain guarded by optional integration presence.
- Debug surfaces render last only when enabled.

## Boundaries
- No engine-core mutation required for adoption.
- No direct access to private runtime state from integration consumers.
- Track G (network) and Track H (3D) extensions are intentionally outside this contract.
