import { resolveRuntimeAssetUrl } from "../../../src/engine/runtime/gameImageConvention.js";
import { escapeHtml, sanitizeText } from "../../../src/shared/string/stringHelpers.js";

function cssString(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

function normalizeText(value) {
  return sanitizeText(value).toLowerCase();
}

function hasUrlProtocol(value) {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function workspaceGameRoot(options = {}) {
  const explicitRoot = sanitizeText(options.workspaceGameRoot || options.gameRoot).replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (/^games\/[^/]+$/i.test(explicitRoot)) {
    return `${explicitRoot}/`;
  }
  const gameId = sanitizeText(options.workspaceGameId || options.gameId).replace(/[\\/]+/g, "-");
  return gameId ? `games/${gameId}/` : "";
}

function workspaceGameAssetPath(path, options = {}) {
  const normalizedPath = sanitizeText(path).replace(/\\/g, "/").replace(/^\/+/, "");
  if (!options.workspaceMode || hasUrlProtocol(normalizedPath) || /^games\//i.test(normalizedPath) || !/^assets\//i.test(normalizedPath)) {
    return { path, error: "" };
  }
  const gameRoot = workspaceGameRoot(options);
  if (!gameRoot) {
    return {
      path: "",
      error: `Preview path ${normalizedPath} cannot be resolved because Workspace V2 game context is missing.`
    };
  }
  return { path: `${gameRoot}${normalizedPath}`, error: "" };
}

function previewTitle(type, kind) {
  const normalizedType = normalizeText(type) || "asset";
  const normalizedKind = normalizeText(kind);
  return normalizedKind ? `${normalizedType} / ${normalizedKind}` : normalizedType;
}

export function createAssetPreviewModel(assetId, entry = {}, options = {}) {
  const type = normalizeText(entry.type);
  const kind = normalizeText(entry.kind);
  const role = normalizeText(entry.role);
  const path = sanitizeText(entry.path);
  const color = entry.color && typeof entry.color === "object" ? entry.color : null;
  const previewResolution = workspaceGameAssetPath(path, options);
  const previewPath = previewResolution.path;
  const url = resolveRuntimeAssetUrl(previewPath, options.documentRef || globalThis.document || null);
  return {
    assetId: sanitizeText(assetId),
    color,
    type,
    kind,
    role,
    path,
    previewError: previewResolution.error,
    previewPath,
    url,
    title: previewTitle(type, kind)
  };
}

export function renderAssetPreviewHtml(model) {
  const preview = model || {};
  const escapedId = escapeHtml(preview.assetId);
  const escapedType = escapeHtml(preview.type);
  const escapedKind = escapeHtml(preview.kind);
  const escapedPath = escapeHtml(preview.path);
  const escapedUrl = escapeHtml(preview.url);
  const escapedTitle = escapeHtml(preview.title);
  const escapedColorHex = escapeHtml(preview.color?.hex || "");
  const escapedColorName = escapeHtml(preview.color?.name || "");
  let body = `<p class="asset-manager-v2__preview-note">Select an asset with a valid path to inspect it.</p>`;
  if (preview.url && preview.type === "image") {
    body = `<img class="asset-manager-v2__preview-media" src="${escapedUrl}" alt="${escapedId}" loading="lazy" decoding="async">`;
  } else if (preview.url && preview.type === "audio") {
    body = `<audio class="asset-manager-v2__preview-media" controls preload="metadata" src="${escapedUrl}"></audio>`;
  } else if (preview.url && preview.type === "video") {
    body = `<video class="asset-manager-v2__preview-media" controls preload="metadata" src="${escapedUrl}"></video>`;
  } else if (preview.url && preview.type === "font") {
    const family = `asset-preview-${cssString(preview.assetId).replace(/[^a-z0-9_-]+/gi, "-")}`;
    body = `<style>@font-face{font-family:"${family}";src:url("${cssString(preview.url)}");font-display:swap;}</style><div class="asset-manager-v2__preview-font" style="font-family:&quot;${escapeHtml(family)}&quot;, sans-serif;">Aa Bb Cc 0123</div>`;
  } else if (preview.type === "shader") {
    body = `<pre class="asset-manager-v2__preview-code">Shader inspection\nkind: ${escapedKind}\npath: ${escapedPath}</pre>`;
  } else if (preview.type === "data" || preview.type === "localization") {
    body = `<pre class="asset-manager-v2__preview-code">${escapedTitle} inspection\npath: ${escapedPath}</pre>`;
  } else if (preview.type === "color" && preview.color?.hex) {
    body = `<div class="asset-manager-v2__preview-color"><span style="background:${escapedColorHex}"></span><strong>${escapedColorName}</strong><code>${escapedColorHex}</code></div>`;
  }

  return `
    <article class="asset-manager-v2__preview-card" data-preview-type="${escapedType}" data-preview-kind="${escapedKind}">
      <h2>${escapedTitle}</h2>
      <div class="asset-manager-v2__preview-stage">${body}</div>
    </article>
  `;
}

export function renderAssetPreview(target, assetId, entry, options = {}) {
  if (!target || !assetId || !entry) {
    if (target) {
      target.hidden = true;
      target.textContent = "";
    }
    return null;
  }
  const model = createAssetPreviewModel(assetId, entry, options);
  target.innerHTML = renderAssetPreviewHtml(model);
  target.hidden = false;
  return model;
}
