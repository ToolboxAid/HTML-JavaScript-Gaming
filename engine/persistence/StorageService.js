/*
Toolbox Aid
David Quesenberry
03/21/2026
StorageService.js
*/
export default class StorageService {
  constructor(storage = undefined) {
    this.storage = storage === undefined ? StorageService.resolveDefaultStorage() : storage;
  }

  static resolveDefaultStorage() {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  }

  saveJson(key, value) {
    if (!this.storage || typeof this.storage.setItem !== 'function') {
      return false;
    }

    const serialized = JSON.stringify(value);

    try {
      this.storage.setItem(key, serialized);
      return true;
    } catch {
      return false;
    }
  }

  loadJson(key, fallback = null) {
    if (!this.storage || typeof this.storage.getItem !== 'function') {
      return fallback;
    }

    let raw;

    try {
      raw = this.storage.getItem(key);
    } catch {
      return fallback;
    }

    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
}
