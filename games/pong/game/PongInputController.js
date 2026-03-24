/*
Toolbox Aid
David Quesenberry
03/24/2026
PongInputController.js
*/
import { GamepadInputAdapter } from '../../../engine/input/index.js';

export default class PongInputController {
  constructor(input) {
    this.input = input;
    this.gamepads = new GamepadInputAdapter({ input });
  }

  getFrameState({ soloMode = false } = {}) {
    this.gamepads.setInput(this.input);
    const pad0 = this.gamepads.getPad(0);
    const pad1 = this.gamepads.getPad(1);

    const leftHorizontalKeyboard = this.readDigitalAxis('KeyA', 'KeyD');
    const leftKeyboard = this.readDigitalAxis('KeyW', 'KeyS');
    const rightKeyboard = this.readDigitalAxis('ArrowUp', 'ArrowDown');
    const leftHorizontal = this.pickAxis(leftHorizontalKeyboard, pad0.horizontal);
    const leftAxis = this.pickAxis(leftKeyboard, pad0.vertical, soloMode ? pad1.vertical : 0);
    const rightAxis = soloMode ? 0 : this.pickAxis(rightKeyboard, pad1.vertical, 0);

    return {
      leftHorizontal,
      leftAxis,
      rightAxis,
      exitPressed:
        this.wasPressed('KeyX') ||
        pad0.cancelPressed ||
        pad1.cancelPressed,
      servePressed:
        this.wasPressed('Space') ||
        this.wasPressed('Enter') ||
        pad0.confirmPressed ||
        pad1.confirmPressed,
      pausePressed:
        this.wasPressed('KeyP') ||
        pad0.startPressed ||
        pad1.startPressed,
      nextModePressed:
        this.wasPressed('KeyM') ||
        this.wasPressed('Tab') ||
        pad0.rightShoulderDown ||
        pad1.rightShoulderDown,
      previousModePressed:
        this.wasPressed('KeyN') ||
        pad0.leftShoulderDown ||
        pad1.leftShoulderDown,
      connectedGamepads: [pad0, pad1].filter((pad) => pad.connected).length,
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

  readDigitalAxis(upCode, downCode) {
    const up = this.isDown(upCode) ? -1 : 0;
    const down = this.isDown(downCode) ? 1 : 0;
    const axis = up + down;
    return Math.max(-1, Math.min(1, axis));
  }

  isDown(code) {
    return Boolean(this.input?.isDown?.(code));
  }

  wasPressed(code) {
    return Boolean(this.input?.isPressed?.(code));
  }
}
