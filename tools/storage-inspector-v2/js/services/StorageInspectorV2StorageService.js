function storageLength(storage) {
  try {
    return Number(storage?.length || 0);
  } catch {
    return 0;
  }
}

function safeStorageKey(storage, index) {
  try {
    return storage.key(index);
  } catch {
    return null;
  }
}

function safeStorageValue(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeRemoveStorageValue(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

function safeDecodeCookiePart(value) {
  try {
    return decodeURIComponent(String(value || ""));
  } catch {
    return String(value || "");
  }
}

function parseCookieString(cookieText) {
  const text = String(cookieText || "").trim();
  if (!text) {
    return [];
  }
  return text.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const separatorIndex = part.indexOf("=");
    const rawName = separatorIndex >= 0 ? part.slice(0, separatorIndex) : part;
    const rawValue = separatorIndex >= 0 ? part.slice(separatorIndex + 1) : "";
    return {
      key: safeDecodeCookiePart(rawName),
      rawValue: safeDecodeCookiePart(rawValue)
    };
  }).filter((entry) => entry.key);
}

function safeCookieString(documentRef) {
  try {
    return String(documentRef?.cookie || "");
  } catch {
    return "";
  }
}

function safeRemoveCookie(documentRef, key) {
  if (!documentRef || !key) {
    return { ok: false, message: "cookie entry does not include a supported document and key" };
  }
  try {
    const encodedKey = encodeURIComponent(key);
    const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const maxAge = "Max-Age=0";
    documentRef.cookie = `${encodedKey}=; ${maxAge}; ${expires}; path=/`;
    const pathname = String(documentRef.location?.pathname || "/");
    const pathSegments = pathname.split("/").filter(Boolean);
    let currentPath = "";
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      documentRef.cookie = `${encodedKey}=; ${maxAge}; ${expires}; path=${currentPath}`;
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

function parseValue(rawValue) {
  if (rawValue == null || rawValue === "") {
    return {
      parseOk: false,
      parsedValue: null,
      valueType: "string"
    };
  }
  try {
    const parsedValue = JSON.parse(rawValue);
    return {
      parseOk: true,
      parsedValue,
      valueType: Array.isArray(parsedValue) ? "array" : typeof parsedValue
    };
  } catch {
    return {
      parseOk: false,
      parsedValue: null,
      valueType: "string"
    };
  }
}

function sizeBytes(value) {
  return typeof TextEncoder === "function"
    ? new TextEncoder().encode(String(value || "")).length
    : String(value || "").length;
}

function previewText(rawValue) {
  const normalized = String(rawValue || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "(empty)";
  }
  return normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized;
}

function escapeRegExp(value) {
  return String(value).replace(/[\\^$+?.()|[\]{}]/g, "\\$&");
}

function wildcardPatternForFilter(filter) {
  return [...String(filter || "")].map((character) => {
    if (character === "*") {
      return ".*";
    }
    if (character === "?") {
      return ".";
    }
    return escapeRegExp(character);
  }).join("");
}

function filterMatchesEntry(entry, filter) {
  const normalizedFilter = String(filter || "").trim().toLowerCase();
  if (!normalizedFilter) {
    return true;
  }
  const haystack = `${entry.storageType}\n${entry.key}\n${entry.rawValue}`.toLowerCase();
  if (!/[*?]/.test(normalizedFilter)) {
    return haystack.includes(normalizedFilter);
  }
  return new RegExp(wildcardPatternForFilter(normalizedFilter)).test(haystack);
}

export class StorageInspectorV2StorageService {
  constructor({
    documentRef = window.document,
    localStorageRef = window.localStorage,
    sessionStorageRef = window.sessionStorage
  } = {}) {
    this.document = documentRef;
    this.localStorage = localStorageRef;
    this.sessionStorage = sessionStorageRef;
  }

  readEntries({ scope = "all", filterText = "" } = {}) {
    const normalizedScope = String(scope || "all");
    const storages = [
      { storageType: "sessionStorage", storage: this.sessionStorage },
      { storageType: "localStorage", storage: this.localStorage }
    ].filter((entry) => normalizedScope === "all" || entry.storageType === normalizedScope);
    const filter = String(filterText || "").trim();
    const entries = [
      ...storages.flatMap(({ storage, storageType }) => this.readStorageEntries(storage, storageType)),
      ...(normalizedScope === "all" || normalizedScope === "cookies" ? this.readCookieEntries() : [])
    ];
    const filteredEntries = filter
      ? entries.filter((entry) => filterMatchesEntry(entry, filter))
      : entries;
    const storageOrder = { sessionStorage: 0, localStorage: 1, cookies: 2 };
    return filteredEntries.sort((left, right) => (
      (storageOrder[left.storageType] ?? 99) - (storageOrder[right.storageType] ?? 99)
      || left.key.localeCompare(right.key)
    ));
  }

  readStorageEntries(storage, storageType) {
    const entries = [];
    const length = storageLength(storage);
    for (let index = 0; index < length; index += 1) {
      const key = safeStorageKey(storage, index);
      if (!key) {
        continue;
      }
      const rawValue = safeStorageValue(storage, key);
      const parsed = parseValue(rawValue);
      entries.push({
        id: `${storageType}:${key}`,
        key,
        parseOk: parsed.parseOk,
        parsedValue: parsed.parsedValue,
        preview: previewText(rawValue),
        rawValue: rawValue || "",
        sizeBytes: sizeBytes(rawValue),
        storageType,
        valueType: parsed.valueType
      });
    }
    return entries;
  }

  readCookieEntries() {
    return parseCookieString(safeCookieString(this.document)).map((entry) => {
      const parsed = parseValue(entry.rawValue);
      return {
        id: `cookies:${entry.key}`,
        key: entry.key,
        parseOk: parsed.parseOk,
        parsedValue: parsed.parsedValue,
        preview: previewText(entry.rawValue),
        rawValue: entry.rawValue || "",
        sizeBytes: sizeBytes(entry.rawValue),
        storageType: "cookies",
        valueType: parsed.valueType
      };
    });
  }

  storageForType(storageType) {
    if (storageType === "sessionStorage") {
      return this.sessionStorage;
    }
    if (storageType === "localStorage") {
      return this.localStorage;
    }
    return null;
  }

  deleteEntry(entry) {
    if (entry?.storageType === "cookies") {
      return safeRemoveCookie(this.document, entry.key);
    }
    const storage = this.storageForType(entry?.storageType);
    if (!storage || !entry?.key) {
      return { ok: false, message: "storage entry does not include a supported storageType and key" };
    }
    return safeRemoveStorageValue(storage, entry.key);
  }

  deleteEntries(entries) {
    const deleted = [];
    const failed = [];
    entries.forEach((entry) => {
      const result = this.deleteEntry(entry);
      if (result.ok) {
        deleted.push({ ...entry });
      } else {
        failed.push({ entry: { ...entry }, message: result.message });
      }
    });
    return { deleted, failed };
  }

  clearStorageType(storageType) {
    return this.deleteEntries(this.readEntries({ scope: storageType }));
  }

  clearSessionStorage() {
    return this.clearStorageType("sessionStorage");
  }

  clearLocalStorage() {
    return this.clearStorageType("localStorage");
  }

  clearToolState() {
    return this.deleteEntries(this.readEntries({ scope: "all" })
      .filter((entry) => (entry.storageType === "sessionStorage" || entry.storageType === "localStorage")
        && entry.key.startsWith("workspace.tools.")));
  }

  clearAllStorage() {
    return this.deleteEntries(this.readEntries({ scope: "all" }));
  }
}
