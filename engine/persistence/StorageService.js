/*
Toolbox Aid
David Quesenberry
03/21/2026
StorageService.js
*/
export default class StorageService {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
  }

  saveJson(key, value) {
    this.storage.setItem(key, JSON.stringify(value));
  }

  loadJson(key, fallback = null) {
    const raw = this.storage.getItem(key);

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
