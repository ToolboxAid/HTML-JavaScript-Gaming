# Visual Regression Smoke Checklist

Use this checklist when changing canvas layout/theme/stage rendering.

## Goal
Catch accidental visual drift in starter template screens.

## Capture Flow
1. Open `samples/engine/Game Engine/index.html`.
2. Capture screenshots for `attract`, `playerSelect`, `playGame`, `pauseGame`, and `gameOver`.

## Suggested Naming
- `visual-baseline-attract.png`
- `visual-baseline-player-select.png`
- `visual-baseline-play.png`
- `visual-baseline-pause.png`
- `visual-baseline-game-over.png`

## Validation
- Text appears centered in each state panel.
- Controller-capable prompts match the current starter flow copy.
- Panel borders/headers are visible and consistent.
- Performance overlay does not overlap key gameplay text.
- Optional layout guides (`?layout`) stay inside expected safe area.
