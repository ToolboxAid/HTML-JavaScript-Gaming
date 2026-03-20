export default class StorageService {
  static setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static getJSON(key, fallbackValue = null) {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallbackValue;
    }

    return JSON.parse(raw);
  }
}
