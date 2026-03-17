Repo: `C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming`

**Current Direction**
- tighten the engine boundary so game/sample developers do not need to know about raw canvas internals when possible
- core/renderers should own rendering behavior
- avoid local wrapper helpers in games/samples like `renderText(...)` or `renderCenteredText(...)` when they only forward to core

**Architecture Decisions**
- `CanvasUtils` should stay focused on canvas ownership/lifecycle/config
- `CanvasText` owns text rendering and text metrics
- `CanvasSprite` owns sprite/frame blits
- `PrimitiveRenderer` owns primitive shapes/panels/overlays/etc.
- do not bloat games/samples with mini text wrappers
- do not use overload-heavy APIs in `CanvasText`
- explicit signatures like `CanvasText.renderText(ctx, ...)` are preferred over argument-shape detection
- long-term goal: game developers should not need to know about `ctx`, and if they need a new draw behavior they should extend engine renderers/helpers

**Canvas Context Decision**
- do not make `CanvasUtils.ctx` private yet
- do not add a getter as the main solution right now
- the real goal is stronger renderer ownership, not just a different access pattern
- current practical state: many game/sample files still pass `CanvasUtils.ctx` directly into `CanvasText`, which is acceptable for now

**Current CanvasText Shape**
- `renderText(ctx, text, x, y, options)`
- `renderMultilineText(ctx, lines, x, startY, options)`
- `renderCenteredText(ctx, text, y, options)`
- `renderCenteredMultilineText(ctx, lines, startY, options)`
- `calculateTextMetrics(ctx, text, fontSize, fontFamily)`
- `parseFont(font, fallbackSize, fallbackFamily)`
- `renderText(...)` supports optional raw `font` override for CSS font strings like `bold 18px Segoe UI`

**Recent Cleanup Completed**
- removed local text wrapper helpers from:
  - `samples/engine/Game Engine/gameStateUi.js`
  - `samples/visual/Fullscreen Gaming/game.js`
  - `samples/visual/Draw Shapes/game.js`
  - `samples/visual/Move Objects/game.js`
  - `samples/input/GameControllers/game.js`
- those files now call `CanvasText` directly
- `samples/input/GameControllers/game.js` now uses `CanvasText.renderText(ctx, ...)` instead of local `ctx.fillText(...)`
- `engine/renderers/pngRenderer.js` uses `CanvasText.renderText(CanvasUtils.ctx, ...)` for preview labels
- `engine/core/tileMap.js` debug text uses `CanvasText.renderMultilineText(CanvasUtils.ctx, ...)`
- `engine/core/performanceMonitor.js` layout measurement uses `CanvasText.calculateTextMetrics(CanvasUtils.ctx, ...)`

**Test Status**
- focused `CanvasText` harness passes with `canvasText ok`
- `tests/engine/core/canvasTextTest.js` covers:
  - `parseFont(...)`
  - `renderText(...)`
  - raw `font` override
  - `renderMultilineText(...)`
  - `renderCenteredText(...)`
  - `renderCenteredMultilineText(...)`
  - shared context usage via `CanvasUtils.ctx`

**Likely Next Step**
- continue removing raw canvas text usage where it is straightforward and route it directly through `CanvasText`
- do not add local wrapper functions in samples/games
- keep an eye on remaining files that still mix raw canvas text or repeated `CanvasText` boilerplate

**Good Candidate Files To Review Next**
- `games/Box Drop/game.js`
- `games/Frogger/game.js`
- `games/Frogger/gameUI.js`
- `games/Tic-Tac-Toe/game.js`
- `games/Snake/game.js`
- `games/Snake/attract.js`
- `games/Asteroids/ui/screens.js`
- `games/Asteroids/ui/hud.js`
- `games/Asteroids/ui/attractScene.js`

**Principle To Preserve**
- core owns rendering behavior
- game/sample files should call core helpers directly
- avoid wrapper/helper churn in game files
- avoid overload-style APIs that make core harder to read
