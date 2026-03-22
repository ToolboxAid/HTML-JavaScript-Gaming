# Engine Input Boundary

This slice adds keyboard input as an isolated service boundary.

## Ownership

- `KeyboardState` owns key snapshots and key queries.
- `InputService` owns DOM event wiring and frame updates.
- `Engine` owns calling the input lifecycle.
- `Scene` reads input through `engine.input` and never touches the DOM.

## Flow

`DOM events -> InputService -> KeyboardState -> Scene`

## Rules

- no `document.addEventListener(...)` inside scenes
- no key interpretation inside `Engine`
- no DOM knowledge inside `KeyboardState`
- scenes consume semantic queries like `isDown(...)` and `isPressed(...)`

## Current API

```js
engine.input.isDown('ArrowLeft');
engine.input.isPressed('Space');
engine.input.getSnapshot();
```

## Sample

`samples/sample02-keyboard-move/` proves the boundary with keyboard movement and no direct DOM event handling inside the scene.
