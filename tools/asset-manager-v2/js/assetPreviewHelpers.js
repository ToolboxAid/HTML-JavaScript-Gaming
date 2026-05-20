import { resolveRuntimeAssetUrl } from "../../../src/engine/runtime/gameImageConvention.js";
import { escapeHtml, sanitizeText } from "../../../src/shared/strings.js";

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

function workspaceAssetsPath(options = {}) {
  const explicitAssetsPath = sanitizeText(options.workspaceAssetsPath || options.assetsPath).replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return /^games\/[^/]+\/assets$/i.test(explicitAssetsPath) ? explicitAssetsPath : "";
}

function workspaceGameAssetPath(path, options = {}) {
  const normalizedPath = sanitizeText(path).replace(/\\/g, "/").replace(/^\/+/, "");
  if (!options.workspaceMode || hasUrlProtocol(normalizedPath) || /^games\//i.test(normalizedPath) || !/^assets\//i.test(normalizedPath)) {
    return { path, error: "" };
  }
  const assetsPath = workspaceAssetsPath(options);
  if (assetsPath) {
    return { path: `${assetsPath}/${normalizedPath.replace(/^assets\//i, "")}`, error: "" };
  }
  const gameRoot = workspaceGameRoot(options);
  if (!gameRoot) {
    return {
      path: "",
      error: `Preview path ${normalizedPath} cannot be resolved because Workspace Manager V2 game context is missing.`
    };
  }
  return { path: `${gameRoot}${normalizedPath}`, error: "" };
}

function previewTitle(type, kind) {
  const normalizedType = normalizeText(type) || "asset";
  const normalizedKind = normalizeText(kind);
  return normalizedKind ? `${normalizedType} / ${normalizedKind}` : normalizedType;
}

function previewFontFamily(assetId) {
  const normalizedId = normalizeText(assetId).replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");
  return `asset-preview-${normalizedId || "asset"}`;
}

function fontLoadErrorMessage(model, error) {
  const detail = sanitizeText(error?.message || String(error || "Unknown font load error."));
  return `Font preview failed for ${model.assetId}: ${detail}`;
}

async function applyScopedFontPreview(target, model, options = {}) {
  if (!target || model.type !== "font" || !model.url) {
    return;
  }
  const documentRef = options.documentRef || target.ownerDocument || globalThis.document || null;
  const FontFaceCtor = options.FontFace || documentRef?.defaultView?.FontFace || globalThis.FontFace;
  const fontSet = documentRef?.fonts;
  const family = previewFontFamily(model.assetId);
  const previewText = target.querySelector(".asset-manager-v2__preview-font");
  if (previewText) {
    previewText.style.fontFamily = `"${family}", sans-serif`;
  }
  if (typeof FontFaceCtor !== "function" || !fontSet || typeof fontSet.add !== "function") {
    return;
  }

  try {
    const fontFace = new FontFaceCtor(family, `url("${cssString(model.url)}")`);
    const loadedFontFace = typeof fontFace.load === "function" ? await fontFace.load() : fontFace;
    if (target.dataset.previewAssetId !== model.assetId) {
      return;
    }
    fontSet.add(loadedFontFace);
    previewText?.setAttribute("data-preview-font-loaded", "true");
  } catch (error) {
    if (target.dataset.previewAssetId !== model.assetId) {
      return;
    }
    options.onPreviewStatus?.("fail", fontLoadErrorMessage(model, error));
  }
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
    const family = previewFontFamily(preview.assetId);
    body = `<style data-preview-font-style="${escapedId}">@font-face{font-family:"${cssString(family)}";src:url("${cssString(preview.url)}");font-display:swap;}</style><div class="asset-manager-v2__preview-font" data-preview-font-family="${escapeHtml(family)}" style="font-family:&quot;${escapeHtml(family)}&quot;, sans-serif;">Aa Bb Cc 0123</div>`;
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
      delete target.dataset.previewAssetId;
      target.hidden = true;
      target.textContent = "";
    }
    return null;
  }
  const model = createAssetPreviewModel(assetId, entry, options);
  target.dataset.previewAssetId = model.assetId;
  target.innerHTML = renderAssetPreviewHtml(model);
  target.hidden = false;
  void applyScopedFontPreview(target, model, options);
  return model;
}
