/*
Toolbox Aid
David Quesenberry
04/03/2026
projectAssetRegistry.js
*/

const KNOWN_SECTIONS = ["palettes", "sprites", "tilesets", "tilemaps", "images", "parallaxSources"];
const PATH_REQUIRED_SECTIONS = ["sprites", "tilesets", "tilemaps", "images", "parallaxSources"];

function cloneDeep(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function slugify(value, fallback = "entry") {
  const raw = sanitizeText(value).toLowerCase();
  const next = raw
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return next || fallback;
}

export function createAssetId(prefix, label, fallback = "entry") {
  const safePrefix = slugify(prefix || "asset", "asset");
  const safeLabel = slugify(label || fallback, fallback);
  return `${safePrefix}.${safeLabel}`;
}

export function normalizeProjectRelativePath(pathValue) {
  if (typeof pathValue !== "string") {
    return "";
  }

  const trimmed = pathValue.trim().replace(/\\/g, "/");
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("data:")) {
    return "";
  }

  if (/^[a-z]+:\/\//i.test(trimmed)) {
    return "";
  }

  if (/^[a-zA-Z]:\//.test(trimmed)) {
    return "";
  }

  let normalized = trimmed;
  if (normalized.startsWith("./")) {
    normalized = normalized.slice(2);
  }
  while (normalized.startsWith("/")) {
    normalized = normalized.slice(1);
  }

  normalized = normalized.replace(/\/+/g, "/");

  if (!normalized || normalized.includes("..")) {
    return "";
  }

  return normalized;
}

function sanitizeId(value, fallbackPrefix, fallbackLabel) {
  const text = sanitizeText(value);
  if (!text) {
    return createAssetId(fallbackPrefix, fallbackLabel, "entry");
  }
  return text;
}

function dedupeColors(colors) {
  const seen = new Set();
  const output = [];
  (Array.isArray(colors) ? colors : []).forEach((color) => {
    const safe = sanitizeText(color);
    if (!safe || seen.has(safe)) {
      return;
    }
    seen.add(safe);
    output.push(safe);
  });
  return output;
}

function sanitizeEntry(section, rawEntry, index = 0) {
  const source = rawEntry && typeof rawEntry === "object" ? rawEntry : {};
  const fallbackLabel = source.name || source.path || `${section}-${index + 1}`;
  const id = sanitizeId(source.id, section, fallbackLabel);

  if (section === "palettes") {
    return {
      ...source,
      id,
      name: sanitizeText(source.name) || fallbackLabel,
      enginePaletteId: sanitizeText(source.enginePaletteId),
      colors: dedupeColors(source.colors),
      sourceTool: sanitizeText(source.sourceTool)
    };
  }

  if (section === "sprites") {
    return {
      ...source,
      id,
      name: sanitizeText(source.name) || fallbackLabel,
      path: normalizeProjectRelativePath(source.path),
      paletteId: sanitizeText(source.paletteId),
      sourceTool: sanitizeText(source.sourceTool)
    };
  }

  if (section === "tilesets") {
    return {
      ...source,
      id,
      name: sanitizeText(source.name) || fallbackLabel,
      path: normalizeProjectRelativePath(source.path),
      paletteId: sanitizeText(source.paletteId),
      tileWidth: Number.isFinite(source.tileWidth) ? source.tileWidth : undefined,
      tileHeight: Number.isFinite(source.tileHeight) ? source.tileHeight : undefined,
      sourceTool: sanitizeText(source.sourceTool)
    };
  }

  if (section === "tilemaps") {
    return {
      ...source,
      id,
      name: sanitizeText(source.name) || fallbackLabel,
      path: normalizeProjectRelativePath(source.path),
      tilesetId: sanitizeText(source.tilesetId),
      sourceTool: sanitizeText(source.sourceTool)
    };
  }

  if (section === "images") {
    return {
      ...source,
      id,
      name: sanitizeText(source.name) || fallbackLabel,
      path: normalizeProjectRelativePath(source.path),
      sourceTool: sanitizeText(source.sourceTool)
    };
  }

  return {
    ...source,
    id,
    name: sanitizeText(source.name) || fallbackLabel,
    path: normalizeProjectRelativePath(source.path),
    imageId: sanitizeText(source.imageId),
    sourceTool: sanitizeText(source.sourceTool)
  };
}

function findMergeIndex(entries, incoming) {
  if (!Array.isArray(entries)) {
    return -1;
  }

  const byId = entries.findIndex((entry) => sanitizeText(entry?.id) && entry.id === incoming.id);
  if (byId >= 0) {
    return byId;
  }

  const incomingPath = normalizeProjectRelativePath(incoming.path);
  if (incomingPath) {
    return entries.findIndex((entry) => normalizeProjectRelativePath(entry?.path) === incomingPath);
  }

  return -1;
}

export function createAssetRegistry(options = {}) {
  return {
    version: 1,
    projectId: sanitizeText(options.projectId) || "project",
    basePath: ".",
    palettes: [],
    sprites: [],
    tilesets: [],
    tilemaps: [],
    images: [],
    parallaxSources: [],
    references: {}
  };
}

export function sanitizeAssetRegistry(rawRegistry) {
  const source = rawRegistry && typeof rawRegistry === "object" ? rawRegistry : {};
  const fallback = createAssetRegistry({ projectId: source.projectId });
  const output = {
    ...cloneDeep(source),
    version: Number.isFinite(source.version) ? source.version : fallback.version,
    projectId: sanitizeText(source.projectId) || fallback.projectId,
    basePath: ".",
    references: source.references && typeof source.references === "object"
      ? cloneDeep(source.references)
      : {}
  };

  KNOWN_SECTIONS.forEach((section) => {
    const rawSection = Array.isArray(source[section]) ? source[section] : [];
    output[section] = [];
    rawSection.forEach((entry, index) => {
      const sanitized = sanitizeEntry(section, entry, index);
      if (!sanitizeText(sanitized.id)) {
        return;
      }
      if (sanitizeText(sanitized.path) === "" && PATH_REQUIRED_SECTIONS.includes(section)) {
        return;
      }
      const existingIndex = findMergeIndex(output[section], sanitized);
      if (existingIndex >= 0) {
        output[section][existingIndex] = { ...output[section][existingIndex], ...sanitized };
      } else {
        output[section].push(sanitized);
      }
    });
  });

  return output;
}

export function mergeAssetRegistries(baseRegistry, incomingRegistry) {
  const base = sanitizeAssetRegistry(baseRegistry);
  const incoming = sanitizeAssetRegistry(incomingRegistry);
  const output = sanitizeAssetRegistry(base);

  Object.keys(incoming).forEach((key) => {
    if (key in output) {
      return;
    }
    output[key] = cloneDeep(incoming[key]);
  });

  KNOWN_SECTIONS.forEach((section) => {
    incoming[section].forEach((entry) => {
      upsertRegistryEntry(output, section, entry);
    });
  });

  output.references = {
    ...(base.references || {}),
    ...(incoming.references || {})
  };

  if (!sanitizeText(output.projectId)) {
    output.projectId = sanitizeText(incoming.projectId) || sanitizeText(base.projectId) || "project";
  }

  return output;
}

export function upsertRegistryEntry(registry, section, rawEntry) {
  const safeRegistry = sanitizeAssetRegistry(registry);
  if (!KNOWN_SECTIONS.includes(section)) {
    return safeRegistry;
  }

  const sanitized = sanitizeEntry(section, rawEntry, safeRegistry[section].length);
  if (!sanitizeText(sanitized.id)) {
    return safeRegistry;
  }

  if (PATH_REQUIRED_SECTIONS.includes(section) && !sanitizeText(sanitized.path)) {
    return safeRegistry;
  }

  const mergeIndex = findMergeIndex(safeRegistry[section], sanitized);
  if (mergeIndex >= 0) {
    safeRegistry[section][mergeIndex] = {
      ...safeRegistry[section][mergeIndex],
      ...sanitized
    };
  } else {
    safeRegistry[section].push(sanitized);
  }

  return safeRegistry;
}

export function findRegistryEntryById(registry, section, id) {
  if (!registry || typeof registry !== "object") {
    return null;
  }
  if (!KNOWN_SECTIONS.includes(section)) {
    return null;
  }
  const safeId = sanitizeText(id);
  if (!safeId) {
    return null;
  }
  const sectionEntries = Array.isArray(registry[section]) ? registry[section] : [];
  return sectionEntries.find((entry) => sanitizeText(entry?.id) === safeId) || null;
}

export function createRegistryDownloadPayload(registry) {
  const sanitized = sanitizeAssetRegistry(registry);
  return `${JSON.stringify(sanitized, null, 2)}\n`;
}
