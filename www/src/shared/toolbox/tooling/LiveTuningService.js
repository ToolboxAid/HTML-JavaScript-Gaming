/*
Toolbox Aid
David Quesenberry
03/22/2026
LiveTuningService.js
*/
export default class LiveTuningService {
  constructor(initialValues = {}) {
    this.values = { ...initialValues };
    this.listeners = new Map();
  }

  set(key, value) {
    this.values[key] = value;
    const listeners = this.listeners.get(key) || [];
    listeners.forEach((listener) => listener(value));
  }

  get(key, fallback = undefined) {
    return key in this.values ? this.values[key] : fallback;
  }

  onChange(key, listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(listener);
  }
}
