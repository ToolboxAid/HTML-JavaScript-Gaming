/*
Toolbox Aid
David Quesenberry
03/21/2026
ActionInputService.js
*/
import ActionInputMap from './ActionInputMap.js';

export default class ActionInputService {
  constructor({ actionMap = new ActionInputMap() } = {}) {
    this.actionMap = actionMap;
    this.down = new Set();
    this._onKeyDown = (event) => this.down.add(event.code);
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
  }

  update() {}

  isDown(code) {
    return this.down.has(code);
  }

  isActionDown(action) {
    return this.actionMap.getKeys(action).some((code) => this.down.has(code));
  }
}
