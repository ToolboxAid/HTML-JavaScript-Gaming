/*
Toolbox Aid
David Quesenberry
03/22/2026
CookieStorageService.js
*/
export default class CookieStorageService {
  constructor({ documentRef = globalThis.document ?? null } = {}) {
    this.documentRef = documentRef;
  }

  isSupported() {
    return !!this.documentRef;
  }

  set(name, value, { days = 30, path = '/' } = {}) {
    if (!this.documentRef) {
      return false;
    }

    const expires = new Date(Date.now() + (days * 24 * 60 * 60 * 1000)).toUTCString();
    this.documentRef.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=${path}`;
    return true;
  }

  get(name, fallback = null) {
    if (!this.documentRef) {
      return fallback;
    }

    const encodedName = `${encodeURIComponent(name)}=`;
    const parts = this.documentRef.cookie.split(';').map((part) => part.trim());
    const match = parts.find((part) => part.startsWith(encodedName));
    if (!match) {
      return fallback;
    }

    const value = decodeURIComponent(match.slice(encodedName.length));
    return value === '' ? fallback : value;
  }

  remove(name, { path = '/' } = {}) {
    if (!this.documentRef) {
      return false;
    }

    this.documentRef.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    return true;
  }
}
