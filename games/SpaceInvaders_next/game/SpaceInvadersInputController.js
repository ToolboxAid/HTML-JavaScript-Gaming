/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersInputController.js
*/
import { GamepadInputAdapter } from '/src/engine/input/index.js';
import { clamp } from '/src/engine/utils/math.js';

export default class SpaceInvadersInputController {
  constructor(input) {
    this.input = input;
    this.gamepads = new GamepadInputAdapter({ input });
  }

  isDown(code) {
    return Boolean(this.input?.isDown?.(code));
  }

  wasPressed(code) {
    return Boolean(this.input?.isPressed?.(code));
  }

  readDigitalAxis(negativeCode, positiveCode) {
    const negative = this.isDown(negativeCode) ? -1 : 0;
    const positive = this.isDown(positiveCode) ? 1 : 0;
    return clamp(negative + positive, -1, 1);
  }

  pickAxis(...values) {
    for (const value of values) {
      const numeric = Number(value) || 0;
      if (Math.abs(numeric) > 0.001) {
        return clamp(numeric, -1, 1);
      }
    }
    return 0;
  }

  getFrameState() {
    this.gamepads.setInput(this.input);
    const padIndex = this.gamepads.listConnectedIndices()[0] ?? 0;
    const pad = this.gamepads.getPad(padIndex);
    const keyboardAxis = this.readDigitalAxis('ArrowLeft', 'ArrowRight') || this.readDigitalAxis('KeyA', 'KeyD');

    return {
      moveAxis: this.pickAxis(keyboardAxis, pad.horizontal),
      firePressed: this.wasPressed('Space') || pad.confirmPressed,
      fireHeld: this.isDown('Space') || pad.confirmDown,
      startPressed: this.wasPressed('Enter') || this.wasPressed('Space') || pad.startPressed,
      pausePressed: this.wasPressed('KeyP'),
      menuPressed: this.wasPressed('KeyX') || pad.cancelPressed,
      debugPressed: this.wasPressed('KeyB'),
      select1Pressed: this.wasPressed('Digit1') || this.wasPressed('Numpad1'),
      select2Pressed: this.wasPressed('Digit2') || this.wasPressed('Numpad2'),
    };
  }
}
