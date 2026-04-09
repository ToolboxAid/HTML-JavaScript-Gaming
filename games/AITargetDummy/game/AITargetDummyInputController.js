/*
Toolbox Aid
David Quesenberry
03/25/2026
AITargetDummyInputController.js
*/
import { GamepadInputAdapter } from '/src/engine/input/index.js';
import { clamp } from '/src/engine/utils/math.js';

export default class AITargetDummyInputController {
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

  getFrameState() {
    this.gamepads.setInput(this.input);
    const padIndex = this.gamepads.listConnectedIndices()[0] ?? 0;
    const pad = this.gamepads.getPad(padIndex);
    const moveX = clamp(
      (this.isDown('ArrowRight') || this.isDown('KeyD') ? 1 : 0)
      + (this.isDown('ArrowLeft') || this.isDown('KeyA') ? -1 : 0)
      + (pad.horizontal || 0),
      -1,
      1,
    );
    const moveY = clamp(
      (this.isDown('ArrowDown') || this.isDown('KeyS') ? 1 : 0)
      + (this.isDown('ArrowUp') || this.isDown('KeyW') ? -1 : 0)
      + (pad.vertical || 0),
      -1,
      1,
    );

    return {
      moveX,
      moveY,
      startPressed: this.wasPressed('Enter') || this.wasPressed('Space') || pad.confirmPressed || pad.startPressed,
      resetPressed: this.wasPressed('KeyR') || pad.cancelPressed,
      pausePressed: this.wasPressed('KeyP'),
    };
  }
}
