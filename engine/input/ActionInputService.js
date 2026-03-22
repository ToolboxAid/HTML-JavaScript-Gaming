/*
Toolbox Aid
David Quesenberry
03/21/2026
ActionInputService.js
*/
import ActionInputMap from './ActionInputMap.js';

export default class ActionInputService {
  constructor({ actionMap = new ActionInputMap(), actionBufferDurations = {} } = {}) {
    this.actionMap = actionMap;
    this.down = new Set();
    this.pressedCodes = new Set();
    this.framePressedCodes = new Set();
    this.pressedActions = new Set();
    this.actionBuffers = new Map();
    this.actionBufferDurations = new Map(Object.entries(actionBufferDurations));
    this._onKeyDown = (event) => {
      if (!this.down.has(event.code)) {
        this.pressedCodes.add(event.code);
      }

      this.down.add(event.code);
    };
    this._onKeyUp = (event) => this.down.delete(event.code);
  }

  attach() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  detach() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.down.clear();
    this.pressedCodes.clear();
    this.framePressedCodes.clear();
    this.pressedActions.clear();
    this.actionBuffers.clear();
  }

  update(dtSeconds = 0) {
    this.framePressedCodes = new Set(this.pressedCodes);
    this.pressedActions.clear();

    if (dtSeconds > 0) {
      for (const [action, remaining] of this.actionBuffers.entries()) {
        const next = remaining - dtSeconds;
        if (next > 0) {
          this.actionBuffers.set(action, next);
        } else {
          this.actionBuffers.delete(action);
        }
      }
    }

    for (const action of this.actionMap.getActions()) {
      const keys = this.actionMap.getKeys(action);
      const wasPressed = keys.some((code) => this.framePressedCodes.has(code));

      if (!wasPressed) {
        continue;
      }

      this.pressedActions.add(action);

      const bufferDuration = this.getActionBufferDuration(action);
      if (bufferDuration > 0) {
        this.actionBuffers.set(action, bufferDuration);
      }
    }

    this.pressedCodes.clear();
  }

  isDown(code) {
    return this.down.has(code);
  }

  isPressed(code) {
    return this.framePressedCodes.has(code);
  }

  isActionDown(action) {
    return this.actionMap.getKeys(action).some((code) => this.down.has(code));
  }

  isActionPressed(action) {
    return this.pressedActions.has(action);
  }

  isActionBuffered(action) {
    return (this.actionBuffers.get(action) ?? 0) > 0;
  }

  consumeActionBuffer(action) {
    if (!this.isActionBuffered(action)) {
      return false;
    }

    this.actionBuffers.delete(action);
    return true;
  }

  getActionBufferTime(action) {
    return Math.max(0, this.actionBuffers.get(action) ?? 0);
  }

  setActionBufferDuration(action, durationSeconds) {
    if (durationSeconds > 0) {
      this.actionBufferDurations.set(action, durationSeconds);
      return;
    }

    this.actionBufferDurations.delete(action);
  }

  getActionBufferDuration(action) {
    return Math.max(0, this.actionBufferDurations.get(action) ?? 0);
  }
}
