/*
Toolbox Aid
David Quesenberry
05/20/2026
BrowserStorageService.js
*/
export default class BrowserStorageService {
  constructor(storage = null) {
    this.storage = storage;
  }

  static resolveGlobalStorage(storageName) {
    try {
      return globalThis?.[storageName] ?? null;
    } catch {
      return null;
    }
  }

  isSupported() {
    return !!this.storage;
  }

  length() {
    try {
      return Number(this.storage?.length || 0);
    } catch {
      return 0;
    }
  }

  key(index) {
    try {
      return this.storage?.key(index) ?? null;
    } catch {
      return null;
    }
  }

  getItem(key, defaultValue = null) {
    if (!this.storage || typeof this.storage.getItem !== 'function') {
      return defaultValue;
    }

    try {
      const value = this.storage.getItem(key);
      return value == null ? defaultValue : value;
    } catch {
      return defaultValue;
    }
  }

  setItem(key, value) {
    if (!this.storage || typeof this.storage.setItem !== 'function') {
      return false;
    }

    try {
      this.storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  removeItem(key) {
    if (!this.storage || typeof this.storage.removeItem !== 'function' || !key) {
      return { ok: false, message: 'storage entry does not include a supported storage and key' };
    }

    try {
      this.storage.removeItem(key);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  entries() {
    const entries = [];
    const length = this.length();
    for (let index = 0; index < length; index += 1) {
      const key = this.key(index);
      if (!key) {
        continue;
      }
      entries.push({
        key,
        rawValue: this.getItem(key, null)
      });
    }
    return entries;
  }

  saveJson(key, value) {
    const serialized = JSON.stringify(value);
    return this.setItem(key, serialized);
  }

  loadJson(key, defaultValue = null) {
    const raw = this.getItem(key, null);
    if (!raw) {
      return defaultValue;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }
}
