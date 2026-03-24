/*
Toolbox Aid
David Quesenberry
03/24/2026
PongControls.js
*/
import { GamepadInputAdapter } from '../../../engine/input/index.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function axisFromKeys(input, negativeKeys = [], positiveKeys = []) {
  const negative = negativeKeys.some((code) => Boolean(input?.isDown?.(code))) ? -1 : 0;
  const positive = positiveKeys.some((code) => Boolean(input?.isDown?.(code))) ? 1 : 0;
  return negative + positive;
}

function isPressed(input, codes = []) {
  return codes.some((code) => Boolean(input?.isPressed?.(code)));
}

export default class PongControls {
  constructor({
    gamepad = new GamepadInputAdapter({
      axes: {
        moveX: 0,
        moveY: 1,
      },
      buttons: {
        confirm: 0,
        cancel: 1,
        menu: 9,
        dpadUp: 12,
        dpadDown: 13,
        dpadLeft: 14,
        dpadRight: 15,
      },
    }),
  } = {}) {
    this.gamepad = gamepad;
  }

  readMenu(input) {
    const pad = this.gamepad.read(input);
    const keyboardY = axisFromKeys(input, ['ArrowUp', 'KeyW'], ['ArrowDown', 'KeyS']);
    const dpadY = (pad.isDown('dpadDown') ? 1 : 0) - (pad.isDown('dpadUp') ? 1 : 0);

    return {
      moveY: clamp(keyboardY + dpadY + pad.getAxis('moveY'), -1, 1),
      confirmPressed: isPressed(input, ['Enter', 'Space']) || pad.isPressed('confirm') || pad.isPressed('menu'),
      backPressed: isPressed(input, ['Escape']) || pad.isPressed('cancel'),
      gamepadConnected: pad.connected,
    };
  }

  readGameplay(input, { allowHorizontal = false } = {}) {
    const pad = this.gamepad.read(input);
    const keyboardX = axisFromKeys(input, ['KeyA', 'ArrowLeft'], ['KeyD', 'ArrowRight']);
    const keyboardY = axisFromKeys(input, ['KeyW', 'ArrowUp'], ['KeyS', 'ArrowDown']);
    const dpadX = (pad.isDown('dpadRight') ? 1 : 0) - (pad.isDown('dpadLeft') ? 1 : 0);
    const dpadY = (pad.isDown('dpadDown') ? 1 : 0) - (pad.isDown('dpadUp') ? 1 : 0);

    return {
      moveX: allowHorizontal ? clamp(keyboardX + dpadX + pad.getAxis('moveX'), -1, 1) : 0,
      moveY: clamp(keyboardY + dpadY + pad.getAxis('moveY'), -1, 1),
      servePressed: isPressed(input, ['Enter', 'Space']) || pad.isPressed('confirm') || pad.isPressed('menu'),
      confirmPressed: isPressed(input, ['Enter', 'Space']) || pad.isPressed('confirm'),
      backPressed: isPressed(input, ['Escape']) || pad.isPressed('cancel'),
      gamepadConnected: pad.connected,
    };
  }
}
