Repo: `C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming`

**Purpose**
- stable Codex guidance for future chats
- captures preferred architecture direction, naming, boundaries, and workflow
- separate from `SESSION-HANDOFF.md`, which should stay focused on current work in progress

**Primary Goal**
- keep game and shared sample code focused on game behavior, not raw canvas or browser internals
- move rendering behavior into engine core and renderer layers
- make engine boundaries clearer over time instead of adding convenience wrappers everywhere
- high priority: make data ownership and visibility clear

**Preferred End State**
- game developers should not need to know about `ctx`
- games and shared samples should call engine helpers and renderers directly
- if a new render behavior is needed, it should usually be added to engine/core/renderers instead of solved locally in a game file
- renderer-layer code is allowed to know about `CanvasUtils.ctx`

**Boundary Rules**
- `engine/core/` and `engine/renderers/` own rendering behavior
- `games/` and shared `samples/` should not read or pass `CanvasUtils.ctx`
- renderer files may use `CanvasUtils.ctx` directly because that is part of their job
- local/offscreen/test-only canvas handling should stay narrow and intentional
- prefer designs where the owning class/module of data or behavior is obvious
- prefer intentional visibility; do not expose internals unless there is a clear architectural or testing need
- avoid solving architecture with getters alone when the real issue is ownership
- avoid trying to wrap `CanvasUtils.ctx` in non-renderer classes; either use it directly in renderer-layer code or trust renderers

**Canvas Ownership**
- `CanvasUtils` owns canvas lifecycle, shared canvas state, and clearing
- `CanvasText` owns text rendering and text metrics
- `CanvasSprite` owns sprite and frame blits
- `PrimitiveRenderer` owns primitive shapes, overlays, panels, bounds, and guides
- `Fullscreen` should expose a game-facing API without requiring games to pass context
- `GamePlayerSelectUi` should expose a game-facing API without requiring games to pass context

**API Style Preferences**
- avoid overload-heavy APIs and argument-shape detection when clearer signatures are possible
- prefer explicit public methods
- avoid local wrapper helpers in games/samples when they only rename or forward to core behavior
- prefer one shared internal implementation over duplicate bodies
- if an implementation is truly internal, prefer `#privateMethod(...)`
- if something needs to stay callable by tests or internal support code, `_method(...)` is acceptable

**Privacy Conventions**
- `method(...)`
  - public API
- `_method(...)`
  - internal/test-support by convention
- `#method(...)`
  - true private implementation
- preferred pattern:
  - public method delegates to `#privateImplementation(...)`
  - `_method(...)` exists only when tests or narrow internal support need access

**Testing Preferences**
- keep targeted harnesses for renderer/core cleanup work
- when public context injection is removed from an API, stop preserving it in tests
- tests may still use underscored internal/test-support helpers where appropriate
- prefer updating tests to match intended boundaries instead of keeping old flexibility alive accidentally

**Refactor Preferences**
- prefer removing fake abstraction over renaming it
- if a renderer legitimately depends on shared canvas state, let it do so plainly
- avoid global-state mutation tricks just to reuse code
- reduce public surface area when live code no longer depends on it
- keep file intent obvious from reading the file
- prefer refactors that improve ownership clarity and make visibility boundaries easier to understand

**Things To Avoid**
- games/samples creating mini rendering frameworks
- hidden argument-shape APIs
- public APIs that still quietly preserve old escape hatches no one should use
- mutating `CanvasUtils.ctx` inside helper methods just to route through another public method
- unnecessary wrapper churn

**Working Style Preferences**
- keep a living `SESSION-HANDOFF.md` with current direction, recent changes, and next targets
- keep this `CODEX-PREFERENCES.md` stable and update it only when long-term preferences change
- always provide a commit comment after code updates
- always show what to test after code updates
- when continuing in a new chat, use both docs:
  - `CODEX-PREFERENCES.md` for stable preferences
  - `SESSION-HANDOFF.md` for current work state

**Model Choices**
- when building a plan, include the model to be used (GPT, GPT-mini, or GPT-nano)