/*
Toolbox Aid
David Quesenberry
03/22/2026
CookieStorageService.js
*/
function safeDecodeCookiePart(value) {
  try {
    return decodeURIComponent(String(value || ''));
  } catch {
    return String(value || '');
  }
}

function parseCookieString(cookieText) {
  const text = String(cookieText || '').trim();
  if (!text) {
    return [];
  }
  return text.split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
    const separatorIndex = part.indexOf('=');
    const rawName = separatorIndex >= 0 ? part.slice(0, separatorIndex) : part;
    const rawValue = separatorIndex >= 0 ? part.slice(separatorIndex + 1) : '';
    return {
      key: safeDecodeCookiePart(rawName),
      rawValue: safeDecodeCookiePart(rawValue)
    };
  }).filter((entry) => entry.key);
}

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

  readCookieString() {
    try {
      return String(this.documentRef?.cookie || '');
    } catch {
      return '';
    }
  }

  entries() {
    return parseCookieString(this.readCookieString());
  }

  removeEverywhere(name) {
    if (!this.documentRef || !name) {
      return { ok: false, message: 'cookie entry does not include a supported document and key' };
    }

    try {
      const encodedKey = encodeURIComponent(name);
      const expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
      const maxAge = 'Max-Age=0';
      this.documentRef.cookie = `${encodedKey}=; ${maxAge}; ${expires}; path=/`;
      const pathname = String(this.documentRef.location?.pathname || '/');
      const pathSegments = pathname.split('/').filter(Boolean);
      let currentPath = '';
      pathSegments.forEach((segment) => {
        currentPath += `/${segment}`;
        this.documentRef.cookie = `${encodedKey}=; ${maxAge}; ${expires}; path=${currentPath}`;
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
}
