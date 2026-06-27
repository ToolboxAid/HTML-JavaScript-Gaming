import {
  resolveManifestChromeAssetPaths,
  resolveRuntimeAssetUrl
} from "/src/engine/runtime/gameImageConvention.js";
import { normalizePathSeparators, normalizeText } from "../../src/shared/string/strings.js";
import { asArray } from "../../src/shared/array/arrays.js";

function hasProtocol(value) {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function documentRefOrNull(documentRef) {
  return documentRef || globalThis.document || null;
}

async function waitForDocumentReady(documentRef) {
  if (!documentRef || documentRef.readyState !== "loading") {
    return;
  }
  await new Promise((resolve) => {
    documentRef.addEventListener("DOMContentLoaded", resolve, { once: true });
  });
}

export function manifestPathFromGameHref(href) {
  const normalized = normalizePathSeparators(href);
  if (!normalized || hasProtocol(normalized) || normalized.includes("..")) {
    return "";
  }
  const match = normalized.match(/^\/?games\/([^/]+)\//i);
  return match ? `/old_old_games/${match[1]}/game.manifest.json` : "";
}

export function manifestPathForGame(game) {
  const explicitPath = normalizePathSeparators(game?.manifestPath || game?.gameManifestPath);
  if (explicitPath && !hasProtocol(explicitPath) && !explicitPath.startsWith("//") && !explicitPath.includes("..")) {
    return explicitPath.startsWith("/") ? explicitPath : `/${explicitPath}`;
  }
  return manifestPathFromGameHref(game?.href);
}

export async function resolveGameManifestPreview(options = {}) {
  const documentRef = documentRefOrNull(options.documentRef);
  const manifestPath = normalizePathSeparators(options.manifestPath);
  if (!manifestPath) {
    return {
      manifestPath: "",
      previewPath: "",
      previewUrl: ""
    };
  }
  const resolved = await resolveManifestChromeAssetPaths({
    gameId: options.gameId,
    manifestPath,
    manifestPayload: options.manifestPayload,
    documentRef
  });
  const previewPath = normalizePathSeparators(resolved.previewPath);
  return {
    manifestPath: resolved.manifestPath || manifestPath,
    previewPath,
    previewUrl: previewPath ? resolveRuntimeAssetUrl(previewPath, documentRef) : ""
  };
}

export async function resolveGamePreviewMap(games, options = {}) {
  const entries = await Promise.all(asArray(games).map(async (game) => {
    const gameId = normalizeText(game?.id);
    const manifestPath = manifestPathForGame(game);
    if (!gameId || !manifestPath) {
      return null;
    }
    const resolved = await resolveGameManifestPreview({
      gameId,
      manifestPath,
      documentRef: options.documentRef
    });
    return resolved.previewUrl ? [gameId, resolved.previewUrl] : null;
  }));
  return new Map(entries.filter(Boolean));
}

export async function hydrateGameManifestPreviewImage(options = {}) {
  const documentRef = documentRefOrNull(options.documentRef);
  if (!documentRef) {
    return null;
  }
  await waitForDocumentReady(documentRef);
  const image = typeof options.imageSelector === "string"
    ? documentRef.querySelector(options.imageSelector)
    : options.image;
  const imageCtor = documentRef.defaultView?.HTMLImageElement || globalThis.HTMLImageElement;
  const isImage = imageCtor
    ? image instanceof imageCtor
    : image?.tagName === "IMG";
  if (!isImage) {
    return null;
  }
  const placeholder = typeof options.placeholderSelector === "string"
    ? documentRef.querySelector(options.placeholderSelector)
    : options.placeholder;
  const gameId = normalizeText(options.gameId);
  const resolved = await resolveGameManifestPreview({
    gameId,
    manifestPath: normalizePathSeparators(options.manifestPath) || (gameId ? `/old_old_games/${gameId}/game.manifest.json` : ""),
    documentRef
  });
  if (resolved.previewUrl) {
    image.src = resolved.previewUrl;
    image.hidden = false;
    image.dataset.gamePreviewStatus = "ready";
    placeholder?.setAttribute("hidden", "");
  } else {
    image.removeAttribute("src");
    image.hidden = true;
    image.dataset.gamePreviewStatus = "missing";
    placeholder?.removeAttribute("hidden");
  }
  return resolved;
}
