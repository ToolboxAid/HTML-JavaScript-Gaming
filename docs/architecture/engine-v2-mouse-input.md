# Engine V2 Mouse Input Boundary

Engine V2 mouse handling is owned by the input layer.

## Responsibilities

- `MouseState` owns mouse position, delta, and button snapshot state.
- `InputService` owns DOM event wiring and updates the per-frame mouse snapshot.
- scenes read mouse state through the input service.

## Allowed flow

```text
DOM mouse events -> InputService -> MouseState -> Scene
```

## Rules

- scenes must not register DOM mouse listeners
- scenes read pointer state through `engine.input`
- document-level pointer wiring remains outside scene code
