/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAIInputController.js
*/
import { GamepadInputAdapter } from '../../../engine/input/index.js';

export default class PacmanFullAIInputController {
  constructor(input) {
    this.input = input;
    this.gamepads = new GamepadInputAdapter({ input });
  }

  isDown(code) {
    return Boolean(this.input?.isDown?.(code));
  }

  isPressed(code) {
    return Boolean(this.input?.isPressed?.(code));
  }

  getFrameState() {
    this.gamepads.setInput(this.input);
    const pad = this.gamepads.getPad(this.gamepads.listConnectedIndices()[0] ?? 0);
    let queuedDirection = null;
    if (this.isDown('ArrowLeft') || this.isDown('KeyA') || pad.leftDown) queuedDirection = 'left';
    if (this.isDown('ArrowRight') || this.isDown('KeyD') || pad.rightDown) queuedDirection = 'right';
    if (this.isDown('ArrowUp') || this.isDown('KeyW') || pad.upDown) queuedDirection = 'up';
    if (this.isDown('ArrowDown') || this.isDown('KeyS') || pad.downDown) queuedDirection = 'down';

    return {
      queuedDirection,
      startPressed: this.isPressed('Enter') || this.isPressed('Space') || pad.confirmPressed || pad.startPressed,
      resetPressed: this.isPressed('KeyR') || pad.cancelPressed,
      pausePressed: this.isPressed('KeyP'),
    };
  }
}
