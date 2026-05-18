export const ASSET_TYPE_CONFIG = Object.freeze({
  audio: {
    label: "Audio",
    folder: "assets/audio",
    accept: ".mp3,.wav,.ogg,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/mp4",
    roles: ["sound", "music"]
  },
  color: {
    label: "Color",
    folder: "palette",
    accept: "",
    roles: ["hud", "text", "background", "border", "accent", "warning", "success", "danger", "shadow", "highlight"]
  },
  data: {
    label: "Data",
    folder: "assets/data",
    accept: ".json,.csv,.txt,application/json,text/csv,text/plain",
    roles: ["config", "table"]
  },
  font: {
    label: "Font",
    folder: "assets/fonts",
    accept: ".woff,.woff2,.ttf,.otf,font/woff,font/woff2,font/ttf,font/otf",
    roles: ["ui", "display"]
  },
  image: {
    label: "Image",
    folder: "assets/images",
    accept: ".png,.jpg,.jpeg,.webp,.gif,.svg,image/png,image/jpeg,image/webp,image/gif,image/svg+xml",
    roles: ["sprite", "background", "bezel", "preview", "ui"]
  },
  localization: {
    label: "Localization",
    folder: "assets/localization",
    accept: ".json,.po,.pot,.xliff,.xlf,application/json,text/plain,application/x-xliff+xml",
    roles: ["strings", "dialogue"]
  },
  shader: {
    label: "Shader",
    folder: "assets/shaders",
    accept: ".glsl,.vert,.frag,.wgsl,text/plain",
    roles: ["fragment", "vertex", "compute"]
  },
  video: {
    label: "Video",
    folder: "assets/video",
    accept: ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime",
    roles: ["cutscene", "loop"]
  }
});

const TYPE_BY_EXTENSION = Object.freeze({
  ".png": "image",
  ".jpg": "image",
  ".jpeg": "image",
  ".webp": "image",
  ".gif": "image",
  ".svg": "image",
  ".mp3": "audio",
  ".wav": "audio",
  ".ogg": "audio",
  ".m4a": "audio",
  ".woff": "font",
  ".woff2": "font",
  ".ttf": "font",
  ".otf": "font",
  ".mp4": "video",
  ".webm": "video",
  ".mov": "video",
  ".glsl": "shader",
  ".vert": "shader",
  ".frag": "shader",
  ".wgsl": "shader",
  ".json": "data",
  ".csv": "data",
  ".txt": "data",
  ".po": "localization",
  ".pot": "localization",
  ".xliff": "localization",
  ".xlf": "localization"
});

const KIND_BY_EXTENSION = Object.freeze(Object.fromEntries(Object.keys(TYPE_BY_EXTENSION).map((extension) => [
  extension,
  extension.slice(1)
])));

const TYPE_BY_MIME_TYPE = Object.freeze({
  "image/png": "image",
  "image/jpeg": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/svg+xml": "image",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
  "audio/ogg": "audio",
  "audio/mp4": "audio",
  "font/woff": "font",
  "font/woff2": "font",
  "font/ttf": "font",
  "font/otf": "font",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
  "application/json": "data",
  "text/csv": "data",
  "application/x-xliff+xml": "localization"
});

const KIND_BY_MIME_TYPE = Object.freeze({
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "font/woff": "woff",
  "font/woff2": "woff2",
  "font/ttf": "ttf",
  "font/otf": "otf",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "application/json": "json",
  "text/csv": "csv",
  "text/plain": "txt",
  "application/x-xliff+xml": "xliff"
});

export function assetTypeEntries() {
  return Object.entries(ASSET_TYPE_CONFIG);
}

export function assetKindEntries() {
  return assetTypeEntries();
}

export function roleOptionsForType(type) {
  return ASSET_TYPE_CONFIG[type]?.roles || [];
}

export function roleOptionsForKind(kind) {
  return roleOptionsForType(kind);
}

export function acceptForType(type) {
  return ASSET_TYPE_CONFIG[type]?.accept || "";
}

export function acceptForKind(kind) {
  return acceptForType(kind);
}

export function pickerTypesForType(type) {
  const config = ASSET_TYPE_CONFIG[type];
  if (!config) {
    return [];
  }
  const acceptParts = config.accept.split(",").map((part) => part.trim()).filter(Boolean);
  const extensions = acceptParts.filter((part) => part.startsWith("."));
  const mimeTypes = acceptParts.filter((part) => !part.startsWith("."));
  const accept = Object.fromEntries(mimeTypes.map((mimeType) => [mimeType, extensions]));
  if (!Object.keys(accept).length && extensions.length) {
    accept["application/octet-stream"] = extensions;
  }
  return [{
    description: `${config.label} assets`,
    accept
  }];
}

export function pickerTypesForKind(kind) {
  return pickerTypesForType(kind);
}

export function folderForType(type) {
  return ASSET_TYPE_CONFIG[type]?.folder || "assets";
}

export function folderForKind(kind) {
  return folderForType(kind);
}

export function labelForType(type) {
  return ASSET_TYPE_CONFIG[type]?.label || type;
}

export function labelForKind(kind) {
  return labelForType(kind);
}

export function slugifyAssetSegment(value) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "asset";
}

function dotPathIdSegment(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function filenamePartForAssetId(fileName) {
  return dotPathIdSegment(fileName) || "asset";
}

export function sanitizeFileName(fileName) {
  const rawName = String(fileName || "asset");
  const extensionMatch = rawName.match(/(\.[a-z0-9]+)$/i);
  const extension = extensionMatch ? extensionMatch[1] : "";
  const basename = extension ? rawName.slice(0, -extension.length) : rawName;
  const safeBasename = basename.replace(/[\\/]+/g, "").trim() || "asset";
  return `${safeBasename}${extension}`;
}

export function colorAssetPath(swatchName) {
  return `palette://workspace/${filenamePartForAssetId(swatchName)}`;
}

export function assetIdForFile(type, fileName, role) {
  const normalizedType = dotPathIdSegment(type);
  const normalizedRole = dotPathIdSegment(role);
  if (!normalizedType || !normalizedRole) {
    return "";
  }
  return `assets.${normalizedType}.${normalizedRole}.${filenamePartForAssetId(fileName)}`;
}

export function assetIdForColor(type, role, usage, colorName) {
  const normalizedType = dotPathIdSegment(type);
  const normalizedRole = dotPathIdSegment(role);
  const normalizedUsage = dotPathIdSegment(usage);
  const normalizedColorName = dotPathIdSegment(colorName);
  if (!normalizedType || !normalizedRole || !normalizedUsage) {
    return "";
  }
  if (normalizedType === "color" && normalizedRole === "background" && normalizedUsage === "game") {
    return "assets.color.background.game";
  }
  if (!normalizedColorName) {
    return "";
  }
  return `assets.${normalizedType}.${normalizedRole}.${normalizedUsage}.${normalizedColorName}`;
}

export function suggestedRoleForFile(type, fileName) {
  if (type !== "image") {
    return "";
  }
  const slug = slugifyAssetSegment(fileName);
  if (slug.includes("bezel")) {
    return "bezel";
  }
  if (slug.includes("preview")) {
    return "preview";
  }
  if (slug.includes("background")) {
    return "background";
  }
  return "";
}

export function pathForFile(type, fileName, sourcePath = "") {
  return projectRelativeAssetPath(sourcePath, type, fileName);
}

export function typeForFile(fileInfo) {
  if (!fileInfo?.name) {
    return "";
  }
  const fileName = String(fileInfo.name).toLowerCase();
  const extensionMatch = fileName.match(/(\.[a-z0-9]+)$/i);
  const extensionType = extensionMatch ? TYPE_BY_EXTENSION[extensionMatch[1]] : "";
  if (extensionType) {
    return extensionType;
  }
  const mimeType = String(fileInfo.type || "").toLowerCase();
  const mimeTypeCategory = TYPE_BY_MIME_TYPE[mimeType];
  if (mimeTypeCategory) {
    return mimeTypeCategory;
  }
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  if (mimeType.startsWith("audio/")) {
    return "audio";
  }
  if (mimeType.startsWith("font/")) {
    return "font";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  return "";
}

export function kindForFile(fileInfo) {
  if (!fileInfo?.name) {
    return "";
  }
  const fileName = String(fileInfo.name).toLowerCase();
  const extensionMatch = fileName.match(/(\.[a-z0-9]+)$/i);
  const extensionKind = extensionMatch ? KIND_BY_EXTENSION[extensionMatch[1]] : "";
  if (extensionKind) {
    return extensionKind;
  }
  const mimeType = String(fileInfo.type || "").toLowerCase();
  return KIND_BY_MIME_TYPE[mimeType] || "";
}

export function projectRelativeAssetPath(sourcePath, type, fileName) {
  const fallback = `${folderForType(type)}/${sanitizeFileName(fileName)}`;
  let normalized = String(sourcePath || "").trim();
  if (!normalized) {
    return fallback;
  }

  normalized = normalized
    .replace(/^file:\/\/\/?/i, "")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/");

  const repoRootMarker = "/HTML-JavaScript-Gaming/";
  const lowerNormalized = normalized.toLowerCase();
  const rootIndex = lowerNormalized.lastIndexOf(repoRootMarker.toLowerCase());
  if (rootIndex >= 0) {
    normalized = normalized.slice(rootIndex + repoRootMarker.length);
  } else if (lowerNormalized.startsWith("html-javascript-gaming/")) {
    normalized = normalized.slice("HTML-JavaScript-Gaming/".length);
  } else if (/^[a-z]:\//i.test(normalized) || normalized.startsWith("/")) {
    return fallback;
  }

  normalized = normalized.replace(/^\.\//, "").replace(/^\/+/, "");
  if (!normalized || normalized === fileName || !normalized.includes("/")) {
    return fallback;
  }
  return normalized.split("/").filter(Boolean).join("/");
}

export function fileMatchesAccept(type, fileInfo) {
  const config = ASSET_TYPE_CONFIG[type];
  if (!config || !fileInfo?.name) {
    return false;
  }
  const fileName = String(fileInfo.name).toLowerCase();
  const mimeType = String(fileInfo.type || "").toLowerCase();
  return config.accept.split(",").map((part) => part.trim().toLowerCase()).some((part) => {
    if (!part) {
      return false;
    }
    if (part.endsWith("/*")) {
      return mimeType.startsWith(part.slice(0, -1));
    }
    if (part.startsWith(".")) {
      return fileName.endsWith(part);
    }
    return mimeType === part;
  });
}
