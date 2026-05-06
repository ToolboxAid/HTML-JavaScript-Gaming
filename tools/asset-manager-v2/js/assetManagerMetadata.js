export const ASSET_KIND_CONFIG = Object.freeze({
  image: {
    label: "Image",
    folder: "assets/images",
    accept: ".png,.jpg,.jpeg,.webp,.gif,.svg,image/png,image/jpeg,image/webp,image/gif,image/svg+xml",
    roles: ["sprite", "background", "bezel", "ui"]
  },
  audio: {
    label: "Audio",
    folder: "assets/audio",
    accept: ".mp3,.wav,.ogg,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/mp4",
    roles: ["sound", "music"]
  },
  font: {
    label: "Font",
    folder: "assets/fonts",
    accept: ".woff,.woff2,.ttf,.otf,font/woff,font/woff2,font/ttf,font/otf",
    roles: ["ui", "display"]
  },
  video: {
    label: "Video",
    folder: "assets/video",
    accept: ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime",
    roles: ["cutscene", "loop"]
  },
  shader: {
    label: "Shader",
    folder: "assets/shaders",
    accept: ".glsl,.vert,.frag,.wgsl,text/plain",
    roles: ["fragment", "vertex", "compute"]
  },
  data: {
    label: "Data",
    folder: "assets/data",
    accept: ".json,.csv,.txt,application/json,text/csv,text/plain",
    roles: ["config", "table"]
  },
  localization: {
    label: "Localization",
    folder: "assets/localization",
    accept: ".json,.po,.pot,.xliff,.xlf,application/json,text/plain,application/x-xliff+xml",
    roles: ["strings", "dialogue"]
  }
});

export function assetKindEntries() {
  return Object.entries(ASSET_KIND_CONFIG);
}

export function roleOptionsForKind(kind) {
  return ASSET_KIND_CONFIG[kind]?.roles || [];
}

export function acceptForKind(kind) {
  return ASSET_KIND_CONFIG[kind]?.accept || "";
}

export function folderForKind(kind) {
  return ASSET_KIND_CONFIG[kind]?.folder || "assets";
}

export function labelForKind(kind) {
  return ASSET_KIND_CONFIG[kind]?.label || kind;
}

export function slugifyAssetSegment(value) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "asset";
}

export function sanitizeFileName(fileName) {
  const rawName = String(fileName || "asset");
  const extensionMatch = rawName.match(/(\.[a-z0-9]+)$/i);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "";
  return `${slugifyAssetSegment(rawName)}${extension}`;
}

export function assetIdForFile(kind, fileName, role) {
  const slug = slugifyAssetSegment(fileName);
  if (kind === "image" && role === "bezel") {
    return `image.assets.${slug}.bezel`;
  }
  if (kind === "image" && role === "background") {
    return `image.assets.${slug}.background`;
  }
  return `${kind}.assets.${slug}`;
}

export function pathForFile(kind, fileName) {
  return `${folderForKind(kind)}/${sanitizeFileName(fileName)}`;
}

export function fileMatchesAccept(kind, fileInfo) {
  const config = ASSET_KIND_CONFIG[kind];
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
