/*
Toolbox Aid
David Quesenberry
03/22/2026
SettingsSystem.js
*/
import { ConfigStore } from '../config/index.js';
import { StorageService } from '../persistence/index.js';

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeSettings(base, incoming) {
  const output = Array.isArray(base) ? [...base] : { ...base };

  Object.entries(incoming || {}).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value) && output[key] && typeof output[key] === 'object' && !Array.isArray(output[key])) {
      output[key] = mergeSettings(output[key], value);
      return;
    }

    output[key] = value;
  });

  return output;
}

export default class SettingsSystem {
  constructor({
    namespace = 'toolboxaid:settings',
    defaults = {},
    storage = null,
    onApply = null,
  } = {}) {
    this.namespace = namespace;
    this.storage = storage || new StorageService();
    this.defaults = deepClone(defaults);
    this.config = new ConfigStore(this.defaults);
    this.onApply = typeof onApply === 'function' ? onApply : null;
    this.lastApplied = null;
  }

  reset() {
    this.config.loadObject(this.defaults);
    return this.apply();
  }

  load() {
    const saved = this.storage.loadJson(this.namespace, null);
    if (!saved) {
      return this.apply();
    }

    this.config.loadObject(mergeSettings(this.defaults, saved));
    return this.apply();
  }

  save() {
    this.storage.saveJson(this.namespace, this.config.get());
    return this.getSnapshot();
  }

  apply() {
    const snapshot = this.getSnapshot();
    this.lastApplied = snapshot;
    if (this.onApply) {
      this.onApply(snapshot);
    }
    return snapshot;
  }

  set(path, value, { autosave = false, autoApply = true } = {}) {
    const current = mergeSettings({}, this.config.get());
    const parts = Array.isArray(path) ? path : String(path).split('.');
    let target = current;

    for (let index = 0; index < parts.length - 1; index += 1) {
      const part = parts[index];
      if (!target[part] || typeof target[part] !== 'object') {
        target[part] = {};
      }
      target = target[part];
    }

    target[parts[parts.length - 1]] = value;
    this.config.loadObject(current);

    const snapshot = autoApply ? this.apply() : this.getSnapshot();
    if (autosave) {
      this.save();
    }

    return snapshot;
  }

  patch(values, { autosave = false, autoApply = true } = {}) {
    this.config.loadObject(mergeSettings(this.config.get(), values));
    const snapshot = autoApply ? this.apply() : this.getSnapshot();
    if (autosave) {
      this.save();
    }
    return snapshot;
  }

  get(path, fallback = undefined) {
    return this.config.get(path, fallback);
  }

  getSnapshot() {
    return deepClone(this.config.get());
  }
}
