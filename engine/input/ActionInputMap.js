/*
Toolbox Aid
David Quesenberry
03/21/2026
ActionInputMap.js
*/
export default class ActionInputMap {
  constructor(bindings = {}) {
    this.bindings = bindings;
  }

  getKeys(action) {
    return this.bindings[action] || [];
  }

  getActions() {
    return Object.keys(this.bindings);
  }
}
