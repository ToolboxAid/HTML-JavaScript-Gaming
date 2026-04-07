/*
Toolbox Aid
David Quesenberry
03/24/2026
BreakoutInputController.js
*/
import { GamepadInputAdapter } from '../../../src/engine/input/index.js';

export default class BreakoutInputController {
  constructor(input) {
    this.input = input;
    this.gamepads = new GamepadInputAdapter({ input });
  }

  getFrameState() {
    this.gamepads.setInput(this.input);
    const padIndex = this.gamepads.listConnectedIndices()[0] ?? 0;
    const pad = this.gamepads.getPad(padIndex);
    const keyboardAxis = this.readDigitalAxis('ArrowLeft', 'ArrowRight') || this.readDigitalAxis('KeyA', 'KeyD');

    return {
      moveAxis: this.pickAxis(keyboardAxis, pad.horizontal),
      servePressed:
        this.wasPressed('Space') ||
        this.wasPressed('Enter') ||
        pad.confirmPressed ||
        pad.startPressed,
      pausePressed:
        this.wasPressed('KeyP') ||
        pad.startPressed,
      exitPressed:
        this.wasPressed('KeyX') ||
        pad.cancelPressed,
    };
  }

  pickAxis(...values) {
    for (const value of values) {
      const numeric = Number(value) || 0;
      if (Math.abs(numeric) > 0.001) {
        return Math.max(-1, Math.min(1, numeric));
      }
    }
    return 0;
  }

  readDigitalAxis(negativeCode, positiveCode) {
    const negative = this.isDown(negativeCode) ? -1 : 0;
    const positive = this.isDown(positiveCode) ? 1 : 0;
    return Math.max(-1, Math.min(1, negative + positive));
  }

  isDown(code) {
    return Boolean(this.input?.isDown?.(code));
  }

  wasPressed(code) {
    return Boolean(this.input?.isPressed?.(code));
  }
}
