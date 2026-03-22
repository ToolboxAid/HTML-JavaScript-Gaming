# Engine Input Mapping

This slice adds an action-based input layer on top of the existing raw keyboard boundary.

## Ownership

- `InputMap` owns action-to-physical-input bindings.
- `InputService` owns raw input collection and action queries.
- `Scene` reads actions through `engine.input` and no longer needs to know specific key codes.

## Flow

`physical key -> KeyboardState -> InputMap -> Scene`

## Rules

- raw input APIs stay available
- action queries do not replace the existing keyboard, mouse, or gamepad boundaries
- scenes can prefer intent-based actions when that improves readability
- `InputMap` has no DOM access and no engine knowledge

## Current API

```js
engine.input.isActionDown('moveLeft');
engine.input.isActionPressed('jump');
engine.input.getActionSnapshot();
```

## Sample

`samples/sample06-input-mapping/` proves the boundary by mapping Arrow keys and WASD to the same movement actions.
