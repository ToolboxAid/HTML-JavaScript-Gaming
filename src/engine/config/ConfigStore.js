/*
Toolbox Aid
David Quesenberry
03/22/2026
ConfigStore.js
*/
export default class ConfigStore {
  constructor(initial = {}) {
    this.values = {};
    this.loadObject(initial);
  }

  loadObject(data = {}) {
    this.values = JSON.parse(JSON.stringify(data));
    return this.values;
  }

  loadJson(jsonText, { requiredKeys = [] } = {}) {
    const parsed = JSON.parse(jsonText);
    this.validateShape(parsed, requiredKeys);
    return this.loadObject(parsed);
  }

  validateShape(data, requiredKeys = []) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Config root must be an object.');
    }

    requiredKeys.forEach((key) => {
      if (!(key in data)) {
        throw new Error(`Config is missing required key "${key}".`);
      }
    });
  }

  get(path, fallback = undefined) {
    if (!path) {
      return this.values;
    }

    const parts = Array.isArray(path) ? path : String(path).split('.');
    let current = this.values;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return fallback;
      }
    }

    return current;
  }
}
