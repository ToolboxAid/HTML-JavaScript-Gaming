Repo: `C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming`

**Note**
- this is the living handoff doc for current work state
- stable long-term preferences live in `CODEX-PREFERENCES.md`

**Current Direction**
- keep game and shared-canvas sample code unaware of raw canvas context details
- keep rendering behavior in engine/core/renderers
- allow explicit-context helpers mainly for tests and narrow internal support cases

**Architecture Decisions**
- `CanvasUtils` owns canvas lifecycle/config/shared main-canvas state
- `CanvasText` owns text rendering and text metrics
- `CanvasSprite` owns sprite/frame blits
- `PrimitiveRenderer` owns primitive shapes/panels/overlays/etc.
- `GamePlayerSelectUi` has a game-facing no-`ctx` API
- `Fullscreen` has a game-facing no-`ctx` API
- avoid local wrapper helpers in games/samples
- avoid overload-heavy APIs and argument-shape detection

**Canvas Context Policy**
- games and shared-canvas samples should not read or pass `CanvasUtils.ctx`
- engine internals may still manage shared context when that is their job
- local/offscreen/test-specific context handling should stay narrow
- do not make `CanvasUtils.ctx` private yet
- do not try to solve the boundary with a getter alone

**Current CanvasText Shape**
- game-facing methods:
  - `renderText(text, x, y, options)`
  - `renderMultilineText(lines, x, startY, options)`
  - `renderCenteredText(text, y, options)`
  - `renderCenteredMultilineText(lines, startY, options)`
  - `calculateTextMetrics(text, fontSize, fontFamily)`
- internal/test-support helpers still exist:
  - `_renderTextToContext(...)`
  - `_renderMultilineTextToContext(...)`
  - `_renderCenteredTextToContext(...)`
  - `_renderCenteredMultilineTextToContext(...)`
  - `_calculateTextMetricsToContext(...)`
- `parseFont(font, fallbackSize, fallbackFamily)` remains shared
- `renderText(...)` supports optional raw `font` override

**Current CanvasSprite Shape**
- game-facing methods:
  - `drawSprite(...)`
  - `drawSpriteRGB(...)`
  - `drawImageFrame(...)`
- internal/test-support helpers:
  - `_drawSpriteToContext(...)`
  - `_drawSpriteRGBToContext(...)`
  - `_drawImageFrameToContext(...)`

**Recent Cleanup Completed**
- games/samples no longer pass `CanvasUtils.ctx` into `CanvasText`
- shared-canvas games/samples no longer read `CanvasUtils.ctx` directly
- `CanvasText` explicit-context helpers were renamed to underscored internal/test-support methods
- `CanvasSprite` now follows the same public/internal split
- `GamePlayerSelectUi` callers were moved off `CanvasUtils.ctx`
- `PerformanceMonitor` no longer depends on `CanvasUtils` for layout measurement
- `RendererGuards` no longer depends on `CanvasUtils.ctx`
- `PngRenderer` preview/debug helpers now normalize around local `ctx` variables
- `ParticleExplosion` no longer depends on `CanvasUtils.ctx`
- `GameControllers` sample now initializes through `CanvasUtils.init(...)`
- `GameControllers` sample no longer uses local `ctx` for rendering
- stale Pong winner-message `CanvasText` call was updated to current no-`ctx` API

**Current Exceptions / Internal Support Paths**
- `engine/core/fullscreen.js` still keeps `_drawToContext(...)` for test/internal support
- `tests/engine/core/canvasTextTest.js` uses `CanvasText._*ToContext(...)`
- `tests/engine/core/canvasSpriteTest.js` uses `CanvasSprite._*ToContext(...)`
- `tests/engine/core/fullscreenTest.js` uses `Fullscreen._drawToContext(...)`
- image preprocessing helpers like `engine/utils/imageAssetCache.js` use local/offscreen contexts by design

**Test Status**
- focused `CanvasText` harness passes with `canvasText ok`
- focused `CanvasSprite` harness is present in `tests/engine/core/canvasSpriteTest.js`
- `tests/engine/core/canvasTextTest.js` covers:
  - `parseFont(...)`
  - `renderText(...)`
  - raw `font` override
  - `renderMultilineText(...)`
  - `renderCenteredText(...)`
  - `renderCenteredMultilineText(...)`
  - internal/test-support helpers
- `tests/engine/core/fullscreenTest.js` exists, but it expects browser globals and was not runnable in plain Node here

**Likely Next Step**
- review the remaining intentional local/offscreen context cases and leave only the ones that are truly justified
- likely next targets:
  - `engine/utils/imageAssetCache.js`
  - `engine/renderers/pngRenderer.js`

**Good Candidate Files To Review Next**
- `engine/utils/imageAssetCache.js`
- `engine/renderers/pngRenderer.js`
- `engine/core/fullscreen.js`

**Principle To Preserve**
- core owns rendering behavior
- game/sample files should call core helpers directly
- avoid wrapper/helper churn in game files
- keep explicit-context support narrow and intentional
