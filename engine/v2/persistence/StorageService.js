export default class StorageService {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
  }

  saveJSON(key, value) {
    this.storage.setItem(key, JSON.stringify(value));
  }

  loadJSON(key, fallback = null) {
    const raw = this.storage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);
  }
}
