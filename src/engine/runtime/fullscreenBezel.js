import { resolveGameImageConventionPaths, resolveRuntimeAssetUrl } from "./gameImageConvention.js";

const TRANSPARENT_ALPHA_THRESHOLD = 8;

function toDisplayValue(visible) {
  return visible ? "block" : "none";
}

function toVisibilityValue(visible) {
  return visible ? "visible" : "hidden";
}

function toOpacityValue(visible) {
  return visible ? "1" : "0";
}

function isAppendable(node) {
  return !!node && typeof node.appendChild === "function";
}

function nodeContains(parent, child) {
  if (!parent || !child) {
    return false;
  }
  if (parent === child) {
    return true;
  }
  if (typeof parent.contains === "function") {
    return parent.contains(child);
  }

  let current = child.parentElement || null;
  while (current) {
    if (current === parent) {
      return true;
    }
    current = current.parentElement || null;
  }
  return false;
}

function ensureHostStyles(host) {
  if (!host || !host.style) {
    return;
  }
  if (!host.style.position || host.style.position === "static") {
    host.style.position = "relative";
  }
  if (!host.style.overflow) {
    host.style.overflow = "hidden";
  }
  if (!host.style.isolation) {
    host.style.isolation = "isolate";
  }
}

function ensureCanvasStyles(canvas) {
  if (!canvas || !canvas.style) {
    return;
  }
  if (!canvas.style.position || canvas.style.position === "static") {
    canvas.style.position = "relative";
  }
  if (!canvas.style.display) {
    canvas.style.display = "block";
  }
  if (!canvas.style.zIndex) {
    canvas.style.zIndex = "1";
  }
}

function applyBezelStyles(element) {
  element.style.position = "absolute";
  element.style.inset = "0";
  element.style.width = "100%";
  element.style.height = "100%";
  element.style.objectFit = "contain";
  element.style.pointerEvents = "none";
  element.style.zIndex = "2147483646";
  element.style.display = "none";
  element.style.visibility = "hidden";
  element.style.opacity = "0";
}

function toPositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function toPixel(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "0px";
  }
  const rounded = Math.round(parsed * 100) / 100;
  return `${rounded}px`;
}

function sanitizeRect(candidate) {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const x = Math.max(0, Number(candidate.x) || 0);
  const y = Math.max(0, Number(candidate.y) || 0);
  const width = toPositiveNumber(candidate.width);
  const height = toPositiveNumber(candidate.height);
  if (width <= 0 || height <= 0) {
    return null;
  }

  return { x, y, width, height };
}

function getHostBounds(host) {
  if (!host) {
    return null;
  }

  if (typeof host.getBoundingClientRect === "function") {
    const rect = host.getBoundingClientRect();
    const width = toPositiveNumber(rect?.width);
    const height = toPositiveNumber(rect?.height);
    if (width > 0 && height > 0) {
      return { width, height };
    }
  }

  const width = toPositiveNumber(host.clientWidth || host.offsetWidth || 0);
  const height = toPositiveNumber(host.clientHeight || host.offsetHeight || 0);
  return width > 0 && height > 0 ? { width, height } : null;
}

function getImageSize(image) {
  const width = toPositiveNumber(image?.naturalWidth || image?.width || 0);
  const height = toPositiveNumber(image?.naturalHeight || image?.height || 0);
  if (width <= 0 || height <= 0) {
    return null;
  }
  return { width, height };
}

export function computeContainPlacement(containerWidth, containerHeight, contentWidth, contentHeight) {
  const cWidth = toPositiveNumber(containerWidth);
  const cHeight = toPositiveNumber(containerHeight);
  const iWidth = toPositiveNumber(contentWidth);
  const iHeight = toPositiveNumber(contentHeight);
  if (cWidth <= 0 || cHeight <= 0 || iWidth <= 0 || iHeight <= 0) {
    return null;
  }

  const scale = Math.min(cWidth / iWidth, cHeight / iHeight);
  const width = iWidth * scale;
  const height = iHeight * scale;
  return {
    x: (cWidth - width) * 0.5,
    y: (cHeight - height) * 0.5,
    width,
    height,
    scale
  };
}

export function fitAspectRatio(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const sWidth = toPositiveNumber(sourceWidth);
  const sHeight = toPositiveNumber(sourceHeight);
  const tWidth = toPositiveNumber(targetWidth);
  const tHeight = toPositiveNumber(targetHeight);
  if (sWidth <= 0 || sHeight <= 0 || tWidth <= 0 || tHeight <= 0) {
    return null;
  }

  const scale = Math.min(tWidth / sWidth, tHeight / sHeight);
  return {
    width: sWidth * scale,
    height: sHeight * scale,
    scale
  };
}

function isFitWithinBounds(candidate, maxWidth, maxHeight, epsilon = 0.001) {
  if (!candidate) {
    return false;
  }
  const width = toPositiveNumber(candidate.width);
  const height = toPositiveNumber(candidate.height);
  const boundWidth = toPositiveNumber(maxWidth);
  const boundHeight = toPositiveNumber(maxHeight);
  return width > 0
    && height > 0
    && width <= boundWidth + epsilon
    && height <= boundHeight + epsilon;
}

function areaOfFit(candidate) {
  if (!candidate) {
    return 0;
  }
  return toPositiveNumber(candidate.width) * toPositiveNumber(candidate.height);
}

export function chooseBestOpeningFit(sourceWidth, sourceHeight, openingWidth, openingHeight) {
  const sWidth = toPositiveNumber(sourceWidth);
  const sHeight = toPositiveNumber(sourceHeight);
  const oWidth = toPositiveNumber(openingWidth);
  const oHeight = toPositiveNumber(openingHeight);
  if (sWidth <= 0 || sHeight <= 0 || oWidth <= 0 || oHeight <= 0) {
    return null;
  }

  const sourceAspect = sWidth / sHeight;
  const widthConstrained = {
    width: oWidth,
    height: oWidth / sourceAspect
  };
  const heightConstrained = {
    width: oHeight * sourceAspect,
    height: oHeight
  };

  const candidates = [widthConstrained, heightConstrained]
    .filter((candidate) => isFitWithinBounds(candidate, oWidth, oHeight))
    .map((candidate) => ({
      ...candidate,
      coverageArea: areaOfFit(candidate)
    }));

  if (!candidates.length) {
    return fitAspectRatio(sWidth, sHeight, oWidth, oHeight);
  }

  candidates.sort((left, right) => right.coverageArea - left.coverageArea);
  const best = candidates[0];
  return {
    width: best.width,
    height: best.height,
    scale: best.width / sWidth,
    coverageArea: best.coverageArea
  };
}

function getImageDataForTransparencyInspection(image, documentRef, size) {
  const width = toPositiveNumber(size?.width);
  const height = toPositiveNumber(size?.height);
  if (width <= 0 || height <= 0) {
    return null;
  }

  let analysisCanvas = null;
  if (documentRef?.createElement) {
    analysisCanvas = documentRef.createElement("canvas");
  } else if (typeof OffscreenCanvas === "function") {
    analysisCanvas = new OffscreenCanvas(width, height);
  }

  if (!analysisCanvas) {
    return null;
  }

  try {
    analysisCanvas.width = width;
    analysisCanvas.height = height;
  } catch {
    return null;
  }

  const context = analysisCanvas.getContext?.("2d", { willReadFrequently: true }) || null;
  if (!context || typeof context.drawImage !== "function" || typeof context.getImageData !== "function") {
    return null;
  }

  try {
    context.clearRect?.(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return context.getImageData(0, 0, width, height);
  } catch {
    return null;
  }
}

function hasTransparentInColumn(data, width, height, columnIndex, threshold) {
  for (let y = 0; y < height; y += 1) {
    const alpha = data[(y * width + columnIndex) * 4 + 3];
    if (alpha <= threshold) {
      return true;
    }
  }
  return false;
}

function hasTransparentInRow(data, width, rowIndex, threshold) {
  const rowOffset = rowIndex * width * 4;
  for (let x = 0; x < width; x += 1) {
    const alpha = data[rowOffset + (x * 4) + 3];
    if (alpha <= threshold) {
      return true;
    }
  }
  return false;
}

export function findTransparencyWindowFromEdges(imageData, width, height, alphaThreshold = TRANSPARENT_ALPHA_THRESHOLD) {
  const safeWidth = Math.floor(toPositiveNumber(width));
  const safeHeight = Math.floor(toPositiveNumber(height));
  const data = imageData?.data;
  if (!data || safeWidth <= 0 || safeHeight <= 0 || data.length < safeWidth * safeHeight * 4) {
    return null;
  }

  const threshold = Math.max(0, Math.min(255, Number(alphaThreshold) || 0));
  let left = -1;
  let right = -1;
  let top = -1;
  let bottom = -1;

  for (let x = 0; x < safeWidth; x += 1) {
    if (hasTransparentInColumn(data, safeWidth, safeHeight, x, threshold)) {
      left = x;
      break;
    }
  }

  for (let x = safeWidth - 1; x >= 0; x -= 1) {
    if (hasTransparentInColumn(data, safeWidth, safeHeight, x, threshold)) {
      right = x;
      break;
    }
  }

  for (let y = 0; y < safeHeight; y += 1) {
    if (hasTransparentInRow(data, safeWidth, y, threshold)) {
      top = y;
      break;
    }
  }

  for (let y = safeHeight - 1; y >= 0; y -= 1) {
    if (hasTransparentInRow(data, safeWidth, y, threshold)) {
      bottom = y;
      break;
    }
  }

  if (left < 0 || right < 0 || top < 0 || bottom < 0 || right < left || bottom < top) {
    return null;
  }

  return {
    x: left,
    y: top,
    width: (right - left) + 1,
    height: (bottom - top) + 1
  };
}

function inspectTransparentWindowRect(image, documentRef, alphaInspector, imageSize) {
  const customResult = typeof alphaInspector === "function"
    ? sanitizeRect(alphaInspector(image, documentRef, imageSize))
    : null;
  if (customResult) {
    return customResult;
  }

  const imageData = getImageDataForTransparencyInspection(image, documentRef, imageSize);
  if (!imageData) {
    return null;
  }

  return findTransparencyWindowFromEdges(imageData, imageSize.width, imageSize.height, TRANSPARENT_ALPHA_THRESHOLD);
}

export function resolvePreferredFullscreenTarget(options = {}) {
  const canvas = options.canvas || null;
  if (!canvas) {
    return null;
  }
  const parent = canvas.parentElement || null;
  if (parent && typeof parent.requestFullscreen === "function") {
    return parent;
  }

  const body = options.documentRef?.body || null;
  if (body && typeof body.requestFullscreen === "function" && nodeContains(body, canvas)) {
    return body;
  }

  return canvas;
}

export default class fullscreenBezel {
  constructor(options = {}) {
    const documentRef = options.documentRef || globalThis.document || null;
    const resolved = resolveGameImageConventionPaths({
      gameId: options.gameId,
      documentRef
    });
    this.documentRef = documentRef;
    this.canvas = options.canvas || null;
    this.defaultHost = options.host || null;
    this.gameId = resolved.gameId;
    this.path = resolved.bezelPath;
    this.host = null;
    this.element = null;
    this.ready = false;
    this.missing = !this.path;
    this.alphaInspector = typeof options.alphaInspector === "function" ? options.alphaInspector : null;
    this.transparentWindowRect = null;
    this.imageSize = null;
    this.canvasLayoutMode = "fallback";
  }

  getState() {
    return {
      gameId: this.gameId,
      path: this.path,
      attached: !!this.element,
      visible: this.element?.style?.display === "block",
      hostTagName: this.host?.tagName || "",
      canvasLayoutMode: this.canvasLayoutMode,
      transparentWindowRect: this.transparentWindowRect
    };
  }

  resolveHost() {
    if (this.defaultHost && isAppendable(this.defaultHost)) {
      return this.defaultHost;
    }
    const canvasParent = this.canvas?.parentElement || null;
    if (isAppendable(canvasParent)) {
      return canvasParent;
    }
    const body = this.documentRef?.body || null;
    return isAppendable(body) ? body : null;
  }

  resolveActiveHost(fullscreenElement) {
    if (isAppendable(fullscreenElement) && nodeContains(fullscreenElement, this.canvas)) {
      return fullscreenElement;
    }
    return this.resolveHost();
  }

  mountOnHost(nextHost) {
    if (!isAppendable(nextHost)) {
      return false;
    }

    ensureHostStyles(nextHost);
    ensureCanvasStyles(this.canvas);
    if (this.element && this.host !== nextHost) {
      nextHost.appendChild(this.element);
    }
    this.host = nextHost;
    return true;
  }

  attach() {
    if (!this.documentRef || !this.path || this.element) {
      return;
    }

    const host = this.resolveHost();
    if (!this.mountOnHost(host)) {
      return;
    }

    const element = this.documentRef.createElement?.("img");
    if (!element) {
      return;
    }
    element.setAttribute("data-runtime-overlay", "fullscreenBezel");
    applyBezelStyles(element);
    element.onload = () => {
      this.imageSize = getImageSize(element);
      this.transparentWindowRect = this.imageSize
        ? inspectTransparentWindowRect(element, this.documentRef, this.alphaInspector, this.imageSize)
        : null;
      this.ready = true;
      this.missing = false;
    };
    element.onerror = () => {
      this.ready = false;
      this.missing = true;
      element.style.display = "none";
      this.transparentWindowRect = null;
      this.imageSize = null;
      this.applyCanvasFallbackLayout();
    };
    element.src = resolveRuntimeAssetUrl(this.path, this.documentRef);

    this.host.appendChild?.(element);
    this.element = element;
  }

  detach() {
    if (!this.element) {
      this.applyCanvasFallbackLayout();
      return;
    }

    this.element.style.display = "none";
    this.element.remove?.();
    this.element = null;
    this.host = null;
    this.applyCanvasFallbackLayout();
  }

  applyCanvasFallbackLayout() {
    if (!this.canvas?.style) {
      return false;
    }

    const internalWidth = toPositiveNumber(this.canvas.width);
    const internalHeight = toPositiveNumber(this.canvas.height);
    this.canvas.style.position = "relative";
    this.canvas.style.left = "";
    this.canvas.style.top = "";
    this.canvas.style.transform = "";
    this.canvas.style.margin = "0 auto";
    this.canvas.style.display = "block";
    this.canvas.style.maxWidth = "none";
    this.canvas.style.maxHeight = "none";
    this.canvas.style.zIndex = "1";
    this.canvas.style.width = internalWidth > 0 ? toPixel(internalWidth) : "";
    this.canvas.style.height = internalHeight > 0 ? toPixel(internalHeight) : "";
    this.canvasLayoutMode = "fallback";
    return true;
  }

  applyCanvasWindowFitLayout() {
    if (!this.canvas?.style || !this.transparentWindowRect || !this.imageSize || !this.host) {
      return false;
    }

    const hostBounds = getHostBounds(this.host);
    if (!hostBounds) {
      return false;
    }

    const containPlacement = computeContainPlacement(
      hostBounds.width,
      hostBounds.height,
      this.imageSize.width,
      this.imageSize.height
    );
    if (!containPlacement) {
      return false;
    }

    const sourceWidth = toPositiveNumber(this.canvas.width);
    const sourceHeight = toPositiveNumber(this.canvas.height);
    if (sourceWidth <= 0 || sourceHeight <= 0) {
      return false;
    }

    const mappedWindowWidth = this.transparentWindowRect.width * containPlacement.scale;
    const mappedWindowHeight = this.transparentWindowRect.height * containPlacement.scale;
    const fittedCanvas = chooseBestOpeningFit(sourceWidth, sourceHeight, mappedWindowWidth, mappedWindowHeight);
    if (!fittedCanvas) {
      return false;
    }

    const mappedWindowX = containPlacement.x + (this.transparentWindowRect.x * containPlacement.scale);
    const mappedWindowY = containPlacement.y + (this.transparentWindowRect.y * containPlacement.scale);
    const left = mappedWindowX + ((mappedWindowWidth - fittedCanvas.width) * 0.5);
    const top = mappedWindowY + ((mappedWindowHeight - fittedCanvas.height) * 0.5);

    this.canvas.style.position = "absolute";
    this.canvas.style.left = toPixel(left);
    this.canvas.style.top = toPixel(top);
    this.canvas.style.transform = "none";
    this.canvas.style.margin = "0";
    this.canvas.style.width = toPixel(fittedCanvas.width);
    this.canvas.style.height = toPixel(fittedCanvas.height);
    this.canvas.style.maxWidth = "none";
    this.canvas.style.maxHeight = "none";
    this.canvas.style.display = "block";
    this.canvas.style.zIndex = "1";
    this.canvasLayoutMode = "transparent-window-fit";
    return true;
  }

  sync(options = {}) {
    if (!this.path) {
      this.applyCanvasFallbackLayout();
      return {
        visible: false,
        reason: "unavailable",
        path: this.path
      };
    }

    this.attach();
    if (!this.element) {
      this.applyCanvasFallbackLayout();
      return {
        visible: false,
        reason: "attach-failed",
        path: this.path
      };
    }

    const fullscreenElement = options.fullscreenElement || this.documentRef?.fullscreenElement || null;
    const activeHost = this.resolveActiveHost(fullscreenElement);
    if (!this.mountOnHost(activeHost)) {
      this.applyCanvasFallbackLayout();
      return {
        visible: false,
        reason: "host-unavailable",
        path: this.path
      };
    }

    const shouldShow = options.fullscreenActive === true && this.ready && !this.missing;
    this.element.style.display = toDisplayValue(shouldShow);
    this.element.style.visibility = toVisibilityValue(shouldShow);
    this.element.style.opacity = toOpacityValue(shouldShow);
    if (shouldShow) {
      const fitted = this.applyCanvasWindowFitLayout();
      if (!fitted) {
        this.applyCanvasFallbackLayout();
      }
    } else {
      this.applyCanvasFallbackLayout();
    }
    return {
      visible: shouldShow,
      reason: shouldShow ? "visible" : (options.fullscreenActive === true ? "asset-unavailable" : "fullscreen-inactive"),
      path: this.path,
      hostTagName: this.host?.tagName || "",
      canvasLayoutMode: this.canvasLayoutMode
    };
  }
}
