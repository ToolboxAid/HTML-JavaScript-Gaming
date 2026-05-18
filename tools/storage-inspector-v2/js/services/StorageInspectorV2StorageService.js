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
    localStorageRef = window.localStorage,
    sessionStorageRef = window.sessionStorage
  } = {}) {
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
    const entries = storages.flatMap(({ storage, storageType }) => this.readStorageEntries(storage, storageType));
    const filteredEntries = filter
      ? entries.filter((entry) => filterMatchesEntry(entry, filter))
      : entries;
    const storageOrder = { sessionStorage: 0, localStorage: 1 };
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
      .filter((entry) => entry.key.startsWith("workspace.tools.")));
  }

  clearAllStorage() {
    return this.deleteEntries(this.readEntries({ scope: "all" }));
  }
}
