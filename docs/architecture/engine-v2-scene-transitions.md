# Engine V2 Scene Transitions

This PR adds a small scene transition layer for V2 without changing the engine loop or the input boundary.

## Purpose

The transition layer exists to own scene handoff effects so that individual scenes do not need to embed fade timing, alpha interpolation, or active-scene bridge logic.

## Added files

- `engine/scenes/SceneTransition.js`
- `engine/scenes/TransitionScene.js`
- `engine/scenes/index.js`

## Responsibilities

### SceneTransition
- owns transition timing only
- tracks elapsed seconds
- computes normalized progress
- knows when the transition is complete

### TransitionScene
- is a temporary scene wrapper
- holds `fromScene` and `toScene`
- crossfades from the current scene to the next scene
- completes by setting the real destination scene on the engine

## Flow

```text
Current Scene -> TransitionScene -> Next Scene
```

1. A scene requests a transition.
2. The engine activates `TransitionScene`.
3. `TransitionScene` renders both scenes using alpha interpolation.
4. When the transition is complete, `TransitionScene` activates the real destination scene.

## Boundary rules

- scenes still own their own update and render behavior
- `SceneManager` still owns the active scene
- transition timing does not live in `Engine`
- input handling does not move into the transition layer

## Sample05 usage

`sample05-scene-switch` now uses fade transitions for:

- `Enter`: IntroScene -> PlayScene
- `Escape`: PlayScene -> IntroScene

The sample continues to prove scene lifecycle and scene ownership, but now also shows that the scene handoff effect can live in a separate transition layer.
