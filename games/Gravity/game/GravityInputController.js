/*
Toolbox Aid
David Quesenberry
03/24/2026
GravityInputController.js
*/
import { GamepadInputAdapter } from '../../../src/engine/input/index.js';
import { clamp } from '../../../src/engine/utils/math.js';

export default class GravityInputController {
  constructor(input) {
    this.input = input;
    this.gamepads = new GamepadInputAdapter({ input });
  }

  getFrameState() {
    this.gamepads.setInput(this.input);
    const padIndex = this.gamepads.listConnectedIndices()[0] ?? 0;
    const pad = this.gamepads.getPad(padIndex);

    const keyboardHorizontal =
      (this.isDown('ArrowRight') || this.isDown('KeyD') ? 1 : 0) -
      (this.isDown('ArrowLeft') || this.isDown('KeyA') ? 1 : 0);

    return {
      horizontal: clamp(keyboardHorizontal !== 0 ? keyboardHorizontal : pad.horizontal, -1, 1),
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
