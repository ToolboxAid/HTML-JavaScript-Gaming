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

export class SessionInspectorStorageService {
  constructor({
    localStorageRef = window.localStorage,
    sessionStorageRef = window.sessionStorage
  } = {}) {
    this.localStorage = localStorageRef;
    this.sessionStorage = sessionStorageRef;
  }

  readEntries({ scope = "sessionStorage", filterText = "" } = {}) {
    const normalizedScope = String(scope || "sessionStorage");
    const storages = [
      { storageType: "sessionStorage", storage: this.sessionStorage },
      { storageType: "localStorage", storage: this.localStorage }
    ].filter((entry) => normalizedScope === "all" || entry.storageType === normalizedScope);
    const filter = String(filterText || "").trim().toLowerCase();
    const entries = storages.flatMap(({ storage, storageType }) => this.readStorageEntries(storage, storageType));
    const filteredEntries = filter
      ? entries.filter((entry) => `${entry.storageType}\n${entry.key}\n${entry.rawValue}`.toLowerCase().includes(filter))
      : entries;
    return filteredEntries.sort((left, right) => (
      left.storageType.localeCompare(right.storageType)
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
}
