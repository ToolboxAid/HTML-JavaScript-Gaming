# Visual Regression Smoke Checklist

Use this checklist when changing canvas layout/theme/stage rendering.

## Goal
Catch accidental visual drift in starter template screens.

## Capture Flow
1. Open `samples/engine/Game Engine/index.html`.
2. Capture screenshot at `attract` state.
3. Capture screenshot at `playerSelect` state.
4. Capture screenshot at `playGame` state.
5. Capture screenshot at `pauseGame` state.
6. Capture screenshot at `gameOver` state.

## Suggested Naming
- `visual-baseline-attract.png`
- `visual-baseline-player-select.png`
- `visual-baseline-play.png`
- `visual-baseline-pause.png`
- `visual-baseline-game-over.png`

## Validation
- Text appears centered in each state panel.
- Panel borders/headers are visible and consistent.
- Performance overlay does not overlap key gameplay text.
- Optional layout guides (`?layout`) stay inside expected safe area.
