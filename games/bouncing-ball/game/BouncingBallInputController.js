/*
Toolbox Aid
David Quesenberry
03/24/2026
BouncingBallInputController.js
*/
import { GamepadInputAdapter } from '../../../src/engine/input/index.js';

export default class BouncingBallInputController {
  constructor(input) {
    this.input = input;
    this.gamepads = new GamepadInputAdapter({ input });
  }

  getFrameState() {
    this.gamepads.setInput(this.input);
    const padIndex = this.gamepads.listConnectedIndices()[0] ?? 0;
    const pad = this.gamepads.getPad(padIndex);

    return {
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

  wasPressed(code) {
    return Boolean(this.input?.isPressed?.(code));
  }
}
