/*
Toolbox Aid
David Quesenberry
03/24/2026
GamepadInputAdapter.js
*/
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default class GamepadInputAdapter {
  constructor({
    gamepadIndex = 0,
    deadzone = 0.18,
    axes = {},
    buttons = {},
  } = {}) {
    this.gamepadIndex = gamepadIndex;
    this.deadzone = deadzone;
    this.axes = { ...axes };
    this.buttons = { ...buttons };
  }

  read(inputService = null) {
    const gamepad = inputService?.getGamepad?.(this.gamepadIndex) ?? null;
    const axisSnapshot = {};
    const buttonSnapshot = {};
    const pressedSnapshot = {};

    Object.entries(this.axes).forEach(([name, axisIndex]) => {
      axisSnapshot[name] = this.getAxisValue(gamepad, axisIndex);
    });

    Object.entries(this.buttons).forEach(([name, buttonIndex]) => {
      buttonSnapshot[name] = Boolean(gamepad?.isDown?.(buttonIndex));
      pressedSnapshot[name] = Boolean(gamepad?.isPressed?.(buttonIndex));
    });

    return {
      connected: Boolean(gamepad?.connected),
      id: gamepad?.id ?? '',
      index: gamepad?.index ?? this.gamepadIndex,
      axes: axisSnapshot,
      buttons: buttonSnapshot,
      pressed: pressedSnapshot,
      getAxis(name) {
        return axisSnapshot[name] ?? 0;
      },
      isDown(name) {
        return Boolean(buttonSnapshot[name]);
      },
      isPressed(name) {
        return Boolean(pressedSnapshot[name]);
      },
    };
  }

  getAxisValue(gamepad, axisIndex) {
    if (!gamepad || typeof axisIndex !== 'number') {
      return 0;
    }

    const rawValue = Number(gamepad.axes?.[axisIndex] ?? 0);
    const magnitude = Math.abs(rawValue);
    if (magnitude <= this.deadzone) {
      return 0;
    }

    const normalizedMagnitude = (magnitude - this.deadzone) / (1 - this.deadzone);
    return clamp(Math.sign(rawValue) * normalizedMagnitude, -1, 1);
  }
}
