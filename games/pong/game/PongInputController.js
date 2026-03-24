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
    const connectedIndices = this.gamepads.listConnectedIndices();
    const playerPadIndex = connectedIndices[0] ?? 0;
    const opponentPadIndex = soloMode ? null : (connectedIndices.find((index) => index !== playerPadIndex) ?? 1);
    const playerPad = this.gamepads.getPad(playerPadIndex);
    const opponentPad = opponentPadIndex == null
      ? this.gamepads.createEmptyPad(1)
      : this.gamepads.getPad(opponentPadIndex);

    const playerHorizontalKeyboard = this.readDigitalAxis('KeyA', 'KeyD');
    const playerVerticalKeyboard = this.readDigitalAxis('KeyW', 'KeyS');
    const opponentVerticalKeyboard = this.readDigitalAxis('ArrowUp', 'ArrowDown');
    const playerMoveX = this.pickAxis(playerHorizontalKeyboard, playerPad.horizontal);
    const playerMoveY = this.pickAxis(playerVerticalKeyboard, playerPad.vertical, soloMode ? opponentPad.vertical : 0);
    const opponentMoveY = soloMode ? 0 : this.pickAxis(opponentVerticalKeyboard, opponentPad.vertical, 0);

    return {
      playerMoveX,
      playerMoveY,
      opponentMoveY,
      exitPressed:
        this.wasPressed('KeyX') ||
        playerPad.cancelPressed ||
        opponentPad.cancelPressed,
      servePressed:
        this.wasPressed('Space') ||
        this.wasPressed('Enter') ||
        playerPad.confirmPressed ||
        opponentPad.confirmPressed,
      pausePressed:
        this.wasPressed('KeyP') ||
        playerPad.startPressed ||
        opponentPad.startPressed,
      nextModePressed:
        this.wasPressed('KeyM') ||
        this.wasPressed('Tab') ||
        playerPad.rightShoulderPressed ||
        opponentPad.rightShoulderPressed,
      previousModePressed:
        this.wasPressed('KeyN') ||
        playerPad.leftShoulderPressed ||
        opponentPad.leftShoulderPressed,
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
