function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizePath(value) {
  return safeText(value, "").replace(/\\/g, "/");
}

function hasUrlProtocol(value) {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function discoverGameIdFromDocument(documentRef) {
  const pathname = normalizePath(documentRef?.location?.pathname || "");
  if (!pathname) {
    return "";
  }
  const match = pathname.match(/\/games\/([^/]+)\//i);
  return match ? safeText(match[1], "") : "";
}

function toImagePath(gameId, fileName) {
  const id = safeText(gameId, "");
  if (!id) {
    return "";
  }
  return `games/${id}/assets/images/${fileName}`;
}

export function resolveRuntimeAssetUrl(pathValue, documentRef = null) {
  const normalized = normalizePath(pathValue);
  if (!normalized) {
    return "";
  }

  if (hasUrlProtocol(normalized) || normalized.startsWith("//")) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  if (normalized.startsWith("./") || normalized.startsWith("../")) {
    try {
      const baseHref = safeText(documentRef?.location?.href, "http://localhost/");
      return new URL(normalized, baseHref).pathname;
    } catch {
      return `/${normalized.replace(/^\/+/, "")}`;
    }
  }

  return `/${normalized.replace(/^\/+/, "")}`;
}

export function resolveGameImageConventionPaths(options = {}) {
  const gameId = safeText(options.gameId, "") || discoverGameIdFromDocument(options.documentRef || null);
  return {
    gameId,
    backgroundPath: toImagePath(gameId, "background.png"),
    bezelPath: toImagePath(gameId, "bezel.png")
  };
}
