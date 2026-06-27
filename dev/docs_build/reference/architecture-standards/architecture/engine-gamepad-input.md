# Engine Gamepad Input Boundary

This slice adds gamepad support to the input boundary without leaking navigator polling into scenes.

## Responsibilities

- `GamepadState` owns normalized gamepad snapshots for one or more connected controllers.
- `InputService` polls `navigator.getGamepads()` during `update()` and forwards normalized data into `GamepadState`.
- scenes read gamepad state through `engine.input`, such as `getGamepad(0)` or `getGamepads()`.

## Supported Behavior

- multiple concurrent gamepads
- left stick axes via `axes[0]` and `axes[1]`
- button down / button pressed detection
- scene-safe access with no direct navigator usage

## Current API

```js
const gp0 = input.getGamepad(0);
const allPads = input.getGamepads();

gp0?.axes[0];
gp0?.axes[1];
gp0?.isDown(0);
gp0?.isPressed(0);
```

## Boundary Rule

Scenes must not call `navigator.getGamepads()` directly. Polling belongs to `InputService`.
