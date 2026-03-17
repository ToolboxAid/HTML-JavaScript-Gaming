Repo: `C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming`

**Current Direction**
- tighten the engine boundary so game/sample developers do not need to know about raw canvas internals when possible
- keep rendering behavior in core/renderers
- let engine internals use explicit context methods when they truly need a specific canvas

**Architecture Decisions**
- `CanvasUtils` owns canvas lifecycle/config and shared main-canvas state
- `CanvasText` owns text rendering and text metrics
- `CanvasSprite` owns sprite/frame blits
- `PrimitiveRenderer` owns primitive shapes/panels/overlays/etc.
- `GamePlayerSelectUi` now has a game-facing no-`ctx` API
- `Fullscreen` now has a game-facing no-`ctx` API plus an explicit-context internal path
- do not add local wrapper helpers in games/samples that only forward to core
- do not use overload-heavy APIs or argument-shape detection when explicit methods are clearer

**Canvas Context Policy**
- games and shared-canvas samples should not need to know about `CanvasUtils.ctx`
- engine internals may use explicit context methods where appropriate
- true local-canvas samples may use explicit `*ToContext(...)` / `drawToContext(...)` methods
- do not make `CanvasUtils.ctx` private yet
- do not solve the boundary with a getter alone

**Current CanvasText Shape**
- game-facing methods:
  - `renderText(text, x, y, options)`
  - `renderMultilineText(lines, x, startY, options)`
  - `renderCenteredText(text, y, options)`
  - `renderCenteredMultilineText(lines, startY, options)`
  - `calculateTextMetrics(text, fontSize, fontFamily)`
- explicit-context methods:
  - `renderTextToContext(ctx, text, x, y, options)`
  - `renderMultilineTextToContext(ctx, lines, x, startY, options)`
  - `renderCenteredTextToContext(ctx, text, y, options)`
  - `renderCenteredMultilineTextToContext(ctx, lines, startY, options)`
  - `calculateTextMetricsToContext(ctx, text, fontSize, fontFamily)`
- `parseFont(font, fallbackSize, fallbackFamily)` remains shared
- `renderText(...)` supports optional raw `font` override for CSS font strings like `bold 18px Segoe UI`

**Current Other API Splits**
- `GamePlayerSelectUi.drawPlayerSelection(config, gameControllers)`
- `GamePlayerSelectUi.drawPlayerSelectionToContext(ctx, config, gameControllers)`
- `Fullscreen.draw()`
- `Fullscreen.drawToContext(ctx)`

**Recent Cleanup Completed**
- games/samples no longer pass `CanvasUtils.ctx` into `CanvasText`
- shared-canvas games/samples no longer read `CanvasUtils.ctx` directly
- `GamePlayerSelectUi` callers were moved off `CanvasUtils.ctx`
- `PerformanceMonitor` text drawing now uses `CanvasText.renderTextToContext(...)`
- `PerformanceMonitor` layout measurement no longer depends on `CanvasUtils`
- `RendererGuards` no longer depends on `CanvasUtils.ctx`
- `PngRenderer` preview/debug helpers now normalize around a local `ctx` variable
- stale Pong winner-message `CanvasText` call was updated to the current no-`ctx` API

**What Is Intentionally Still Explicit-Context**
- `samples/input/GameControllers/game.js`
- core/internal code that truly renders to a specific context:
  - `engine/core/fullscreen.js`
  - `engine/game/gamePlayerSelectUi.js`
  - `engine/core/performanceMonitor.js`
  - `engine/renderers/pngRenderer.js`

**Test Status**
- focused `CanvasText` harness passes with `canvasText ok`
- `tests/engine/core/canvasTextTest.js` covers:
  - `parseFont(...)`
  - `renderText(...)`
  - raw `font` override
  - `renderMultilineText(...)`
  - `renderCenteredText(...)`
  - `renderCenteredMultilineText(...)`
  - explicit-context helpers
- fullscreen API split was updated, but `tests/engine/core/fullscreenTest.js` expects browser globals and was not runnable in plain Node here

**Likely Next Step**
- review whether `CanvasSprite` should get the same public/internal split language as `CanvasText` and `Fullscreen`
- or pause here and treat the canvas-boundary work as complete enough to stabilize

**Good Candidate Files To Review Next**
- `engine/core/canvasSprite.js`
- `engine/renderers/pngRenderer.js`
- `engine/core/fullscreen.js`
- `engine/game/gamePlayerSelectUi.js`
- `samples/input/GameControllers/game.js`

**Principle To Preserve**
- core owns rendering behavior
- game/sample files should call core helpers directly
- avoid wrapper/helper churn in game files
- explicit internal methods are fine when there is a real specific-context need
