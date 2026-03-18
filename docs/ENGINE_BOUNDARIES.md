# Engine Boundaries

## engine/core
Runtime layer.

### Public
- `gameBase.js`

### Internal
- `runtimeContext.js`
- `fullscreen.js`
- `performanceMonitor.js`

### Transitional
- `canvasUtils.js`
- `canvasText.js`
- `canvasSprite.js`
- `sprite.js`
- `tileMap.js`
- `spriteFrameUtils.js`

### Guidance
Use `GameBase` as the runtime entry point.
Avoid direct imports from runtime internals.
Treat transitional modules as unstable placement candidates.
