# Engine Render Adapter

## Purpose

The render adapter separates scene behavior from the concrete `CanvasRenderingContext2D` API.
Scenes now render through a small renderer interface instead of making direct canvas calls.

## Boundary

```text
Scene -> Renderer -> CanvasRenderer -> CanvasRenderingContext2D
```

## Core files

- `engine/render/Renderer.js`
- `engine/render/CanvasRenderer.js`
- `engine/core/Engine.js`

## Responsibilities

### Renderer
- defines drawing operations the scene is allowed to use
- acts as the scene-facing contract
- contains no canvas implementation details

### CanvasRenderer
- owns all direct calls into the canvas context
- translates simple renderer methods into `ctx` operations
- can be replaced later without changing scene behavior

### Engine
- creates the renderer once from the canvas context
- passes the renderer to the active scene during render
- does not own draw logic beyond that handoff

## Initial supported operations

- `clear(color)`
- `drawRect(x, y, width, height, color)`
- `strokeRect(x, y, width, height, color, lineWidth)`
- `drawCircle(x, y, radius, color)`
- `drawText(text, x, y, options)`
- `getCanvasSize()`

## Non-goals

- WebGL support
- batching
- sprite atlases
- cameras
- UI widgets
- a generalized retained-mode scene graph

## Sample

`sample008-render-adapter` proves that scene behavior can remain unchanged while drawing flows through a renderer instead of directly using `ctx`.
