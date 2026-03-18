# Architecture Review v1

## engine/input findings

### Findings
1. `engine/input` has a stronger subsystem boundary than most of the repo. It is organized around:
   - keyboard input
   - mouse input
   - controller/gamepad input
   - shared input primitives (`InputFrameState`, `InputLifecycle`)

   That is a good top-level shape.

2. `InputFrameState` is a strong reusable primitive. It cleanly models frame-based input transitions:
   - pressed
   - down
   - released
   - pendingDown
   - pendingUp

   This is one of the clearest engine abstractions reviewed so far.

3. `InputLifecycle` is also a good primitive. It standardizes start/stop/destroy listener lifecycles and is already reused by:
   - `KeyboardInput`
   - `MouseInput`
   - `GameControllers`

   That is good subsystem consistency.

4. The main architecture weakness is that input ownership is split across two styles:
   - keyboard/mouse use the shared frame-state primitive directly
   - controllers use a custom stack: `GameControllers` + `GamepadManager` + `GamepadState` + `GamepadMapper`

   The controller stack is understandable, but it is not aligned with the simpler keyboard/mouse model.

5. `KeyboardInput` and `MouseInput` are clean public-facing adapters, but both auto-start in their constructors. This matches the earlier `GameBase` pattern and keeps lifecycle implicit rather than staged.

6. `MouseInput` mixes:
   - button-state input handling
   - pointer position tracking
   - wheel tracking
   - canvas scaling normalization

   This is still acceptable, but it means `MouseInput` is both an input adapter and a canvas-coordinate translator.

7. The controller subsystem is the most architecturally complex part of input:
   - `GamepadManager` owns browser polling and connection events
   - `GameControllers` owns semantic API and mapping/state coordination
   - `GamepadMapper` translates raw layout into semantic names
   - `GamepadState` tracks per-frame buttons/axes

   This layering is mostly sound, but boundaries are not fully sealed.

8. `GameControllers` acts as a façade, but it publicly exposes internal structures such as:
   - `gamepadManager`
   - `gamepadStates`
   - `gamepadMappers`

   This repeats the same façade-bypass issue found in `engine/game`.

9. The controller subsystem depends on a global/shared messaging layer:
   - `EventBus.getInstance()`
   - browser-global `window` gamepad events
   - interval polling

   That is reasonable for a browser engine, but it means controller input is not as self-contained as keyboard/mouse.

10. `gamepadDebugger.js` looks like tooling/debug support, not core input infrastructure. It may belong in a debug/tooling layer rather than inside the primary controller runtime tree.

11. Public/internal/private boundaries are still implicit.

   Best current classification:
   - public:
     - `KeyboardInput`
     - `MouseInput`
     - `GameControllers`
   - internal:
     - `InputFrameState`
     - `InputLifecycle`
     - `GamepadManager`
     - `GamepadMapper`
     - `GamepadState`
     - `GameControllerMap`
     - `gamepadEnums.js`
   - misplaced / should move:
     - `gamepadDebugger.js`

### Risks
#### High
1. **Façade bypass in controller input**
   `GameControllers` exposes internal manager/state/mapper structures directly, so games can couple to implementation details.

2. **Lifecycle auto-start in constructors**
   Keyboard, mouse, and controller adapters become live immediately on construction, which makes setup/testing/composition harder.

3. **Input model inconsistency**
   Keyboard/mouse use a small shared primitive model, while controllers use a more bespoke architecture. The subsystem feels unified at the folder level, but not yet at the API shape level.

#### Medium
4. **Canvas-specific pointer normalization inside `MouseInput`**
   Mouse input is tied directly to canvas coordinate scaling, which makes it less reusable as a generic pointer adapter.

5. **Controller runtime depends on global event bus + polling**
   The controller stack depends on shared messaging and global browser facilities, increasing hidden coupling.

6. **Debug/runtime boundary blur**
   `gamepadDebugger.js` lives inside the runtime controller folder rather than a debug or tooling area.

#### Lower
7. **Public API ambiguity**
   Consumers can likely import internal controller modules directly because the intended public API is not documented.

### PR Candidates
#### PR-020 — Make input adapters explicitly startable
- Type: architecture/refactor
- Risk: medium
- Goal: stop auto-starting keyboard, mouse, and controller listeners in constructors
- Add explicit `start()` ownership at runtime/bootstrap level

#### PR-021 — Make `GameControllers` a true façade
- Type: architecture/refactor
- Risk: medium
- Goal: hide:
  - `gamepadManager`
  - `gamepadStates`
  - `gamepadMappers`
- Keep games on semantic methods only

#### PR-022 — Define unified input API boundaries
- Type: architecture/docs
- Risk: low
- Goal: formalize:
  - public adapters (`KeyboardInput`, `MouseInput`, `GameControllers`)
  - internal primitives/helpers
  - controller support internals

#### PR-023 — Split `gamepadDebugger` into debug/tooling layer
- Type: architecture/cleanup
- Risk: low
- Goal: move gamepad-specific debugging support out of the runtime input tree

#### PR-024 — Separate pointer normalization from `MouseInput`
- Type: architecture/refactor
- Risk: medium
- Goal: split generic mouse/button tracking from canvas-coordinate translation
- Possible targets:
  - `PointerInput`
  - `CanvasPointerAdapter`

## PR Roadmap Additions

### PR-020
Title: Make input adapters explicitly startable
Scope: engine/input, engine/core
Risk: Medium
Status: pending

### PR-021
Title: Make GameControllers a true façade
Scope: engine/input/controller
Risk: Medium
Status: pending

### PR-022
Title: Define public and internal input API boundaries
Scope: engine/input, docs
Risk: Low
Status: pending

### PR-023
Title: Move gamepadDebugger into debug/tooling layer
Scope: engine/input/controller
Risk: Low
Status: pending

### PR-024
Title: Separate canvas pointer normalization from MouseInput
Scope: engine/input
Risk: Medium
Status: pending
