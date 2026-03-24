/*
Toolbox Aid
David Quesenberry
03/24/2026
ThrusterInputController.js
*/
import { GamepadInputAdapter } from '../../../engine/input/index.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default class ThrusterInputController {
  constructor(input) {
    this.input = input;
    this.gamepads = new GamepadInputAdapter({ input });
  }

  getFrameState() {
    this.gamepads.setInput(this.input);
    const padIndex = this.gamepads.listConnectedIndices()[0] ?? 0;
    const pad = this.gamepads.getPad(padIndex);

    const keyboardTurn =
      (this.isDown('ArrowRight') || this.isDown('KeyD') ? 1 : 0) -
      (this.isDown('ArrowLeft') || this.isDown('KeyA') ? 1 : 0);

    return {
      turn: clamp(keyboardTurn !== 0 ? keyboardTurn : pad.horizontal, -1, 1),
      thrustDown:
        this.isDown('ArrowUp') ||
        this.isDown('KeyW') ||
        pad.confirmDown,
      startPressed:
        this.wasPressed('Space') ||
        this.wasPressed('Enter') ||
        pad.confirmPressed,
      pausePressed:
        this.wasPressed('KeyP') ||
        pad.startPressed,
      resetPressed:
        this.wasPressed('KeyR') ||
        pad.cancelPressed,
    };
  }

  isDown(code) {
    return Boolean(this.input?.isDown?.(code));
  }

  wasPressed(code) {
    return Boolean(this.input?.isPressed?.(code));
  }
}
