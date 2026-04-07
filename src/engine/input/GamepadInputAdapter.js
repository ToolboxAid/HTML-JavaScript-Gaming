/*
Toolbox Aid
David Quesenberry
03/24/2026
GamepadInputAdapter.js
*/
export default class GamepadInputAdapter {
  constructor({ input = null, deadzone = 0.2 } = {}) {
    this.input = input;
    this.deadzone = Math.max(0, Number(deadzone) || 0.2);
  }

  setInput(input) {
    this.input = input;
    return this;
  }

  getPad(index = 0) {
    if (!this.input || typeof this.input.getGamepad !== 'function') {
      return this.createEmptyPad(index);
    }

    const pad = this.input.getGamepad(index);
    if (!pad) {
      return this.createEmptyPad(index);
    }

    const leftX = this.readAxis(pad.axes?.[0] ?? 0);
    const leftY = this.readAxis(pad.axes?.[1] ?? 0);
    const rightX = this.readAxis(pad.axes?.[2] ?? 0);
    const rightY = this.readAxis(pad.axes?.[3] ?? 0);

    const dpadUp = this.isDown(pad, 12);
    const dpadDown = this.isDown(pad, 13);
    const dpadLeft = this.isDown(pad, 14);
    const dpadRight = this.isDown(pad, 15);

    const vertical = this.combineDigitalAxis(leftY, dpadUp, dpadDown);
    const horizontal = this.combineDigitalAxis(leftX, dpadLeft, dpadRight);

    return {
      index,
      connected: Boolean(pad.connected),
      id: pad.id ?? '',
      mapping: pad.mapping ?? '',
      axes: [...(pad.axes ?? [])],
      buttonsDown: [...(pad.buttonsDown ?? [])],
      buttonsPressed: [...(pad.buttonsPressed ?? [])],
      leftStick: { x: leftX, y: leftY },
      rightStick: { x: rightX, y: rightY },
      dpad: {
        up: dpadUp,
        down: dpadDown,
        left: dpadLeft,
        right: dpadRight,
      },
      horizontal,
      vertical,
      confirmDown: this.isDown(pad, 0),
      confirmPressed: this.isPressed(pad, 0),
      cancelPressed: this.isPressed(pad, 1),
      startPressed: this.isPressed(pad, 9),
      leftShoulderDown: this.isDown(pad, 4),
      rightShoulderDown: this.isDown(pad, 5),
      leftShoulderPressed: this.isPressed(pad, 4),
      rightShoulderPressed: this.isPressed(pad, 5),
      isDown: (buttonIndex) => this.isDown(pad, buttonIndex),
      isPressed: (buttonIndex) => this.isPressed(pad, buttonIndex),
    };
  }

  listConnectedIndices() {
    if (!this.input) {
      return [];
    }

    if (typeof this.input.getGamepads === 'function') {
      return this.input
        .getGamepads()
        .filter((pad) => Boolean(pad && pad.connected !== false))
        .map((pad) => Number(pad.index))
        .filter((index) => Number.isInteger(index) && index >= 0)
        .sort((a, b) => a - b);
    }

    if (typeof this.input.getGamepad !== 'function') {
      return [];
    }

    const connected = [];
    for (let index = 0; index < 4; index += 1) {
      const pad = this.input.getGamepad(index);
      if (pad && pad.connected !== false) {
        connected.push(index);
      }
    }

    return connected;
  }

  createEmptyPad(index = 0) {
    return {
      index,
      connected: false,
      id: '',
      mapping: '',
      axes: [],
      buttonsDown: [],
      buttonsPressed: [],
      leftStick: { x: 0, y: 0 },
      rightStick: { x: 0, y: 0 },
      dpad: { up: false, down: false, left: false, right: false },
      horizontal: 0,
      vertical: 0,
      confirmDown: false,
      confirmPressed: false,
      cancelPressed: false,
      startPressed: false,
      leftShoulderDown: false,
      rightShoulderDown: false,
      leftShoulderPressed: false,
      rightShoulderPressed: false,
      isDown: () => false,
      isPressed: () => false,
    };
  }

  readAxis(value) {
    const axis = Number(value) || 0;
    const magnitude = Math.abs(axis);
    if (magnitude <= this.deadzone) {
      return 0;
    }

    const remaining = Math.max(0.000001, 1 - this.deadzone);
    const normalized = (magnitude - this.deadzone) / remaining;
    return Math.sign(axis) * Math.max(0, Math.min(1, normalized));
  }

  combineDigitalAxis(analogValue, negativePressed, positivePressed) {
    if (negativePressed && !positivePressed) {
      return -1;
    }

    if (positivePressed && !negativePressed) {
      return 1;
    }

    return analogValue;
  }

  isDown(pad, buttonIndex) {
    return Boolean(pad?.isDown?.(buttonIndex));
  }

  isPressed(pad, buttonIndex) {
    return Boolean(pad?.isPressed?.(buttonIndex));
  }
}
