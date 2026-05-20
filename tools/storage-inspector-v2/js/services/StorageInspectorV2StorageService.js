import {
  CookieStorageService,
  LocalStorageService,
  SessionStorageService,
} from "/src/engine/persistence/index.js";

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
    localStorageRef = undefined,
    sessionStorageRef = undefined
  } = {}) {
    this.cookieStorage = new CookieStorageService({ documentRef });
    this.localStorage = new LocalStorageService(localStorageRef);
    this.sessionStorage = new SessionStorageService(sessionStorageRef);
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
    return storage.entries().map(({ key, rawValue }) => {
      const parsed = parseValue(rawValue);
      return {
        id: `${storageType}:${key}`,
        key,
        parseOk: parsed.parseOk,
        parsedValue: parsed.parsedValue,
        preview: previewText(rawValue),
        rawValue: rawValue || "",
        sizeBytes: sizeBytes(rawValue),
        storageType,
        valueType: parsed.valueType
      };
    });
  }

  readCookieEntries() {
    return this.cookieStorage.entries().map((entry) => {
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
      return this.cookieStorage.removeEverywhere(entry.key);
    }
    const storage = this.storageForType(entry?.storageType);
    if (!storage || !entry?.key) {
      return { ok: false, message: "storage entry does not include a supported storageType and key" };
    }
    return storage.removeItem(entry.key);
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
