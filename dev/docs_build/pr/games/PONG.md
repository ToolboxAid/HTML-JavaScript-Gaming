Toolbox Aid
David Quesenberry
03/24/2026
PONG.md

# Pong

## Summary
Pong is Game #3 and ships as a standalone game under `games/Pong`.

## Features
- Tennis, Hockey, Handball, and Jai-Alai modes
- Keyboard + gamepad support
- Paddle english from contact point and paddle motion
- Shared engine-owned layout via `/src/src/engine/ui/baseLayout.css`

## Engine touch points
- Added `src/engine/input/GamepadInputAdapter.js` for reusable normalized gamepad access.
- Kept rendering inside the renderer and scene orchestration inside `PongScene`.
- Kept Pong-specific rules local to the game layer.

## Controls
- Left paddle: `W` / `S`
- Right paddle: `ArrowUp` / `ArrowDown`
- Serve / restart: `Space` or `Enter`
- Pause: `Escape`
- Next mode: `M` or right shoulder on a gamepad
- Previous mode: `N` or left shoulder on a gamepad

## Notes
- Tennis and Hockey are competitive two-paddle modes.
- Handball and Jai-Alai are solo wall-return modes.
- Gamepad support is normalized through the new adapter instead of putting raw browser gamepad logic in the game.
