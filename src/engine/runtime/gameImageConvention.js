function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizePath(value) {
  return safeText(value, "").replace(/\\/g, "/");
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

export function resolveGameImageConventionPaths(options = {}) {
  const gameId = safeText(options.gameId, "") || discoverGameIdFromDocument(options.documentRef || null);
  return {
    gameId,
    backgroundPath: toImagePath(gameId, "background.png"),
    bezelPath: toImagePath(gameId, "bezel.png")
  };
}
