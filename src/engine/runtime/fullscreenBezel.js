import { resolveGameImageConventionPaths, resolveRuntimeAssetUrl } from "./gameImageConvention.js";

const TRANSPARENT_ALPHA_THRESHOLD = 8;
const DEFAULT_BEZEL_STRETCH_OVERRIDE_FILENAME = "bezel.stretch.override.json";
const DEFAULT_BEZEL_STRETCH_CONFIG = Object.freeze({
  uniformEdgeStretchPx: 0
});

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

function normalizePath(value) {
  return typeof value === "string" ? value.replace(/\\/g, "/") : "";
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function sanitizeUniformEdgeStretchPx(value) {
  return Math.max(0, safeNumber(value, 0));
}

export function resolveBezelStretchConfigPath(bezelPath, fileName = DEFAULT_BEZEL_STRETCH_OVERRIDE_FILENAME) {
  const normalized = normalizePath(bezelPath).trim();
  if (!normalized) {
    return "";
  }
  const slashIndex = normalized.lastIndexOf("/");
  if (slashIndex < 0) {
    return fileName;
  }
  return `${normalized.slice(0, slashIndex + 1)}${fileName}`;
}

function parseStretchConfigObject(candidate) {
  const source = candidate && typeof candidate === "object" ? candidate : {};
  return {
    uniformEdgeStretchPx: sanitizeUniformEdgeStretchPx(source.uniformEdgeStretchPx)
  };
}

function isNodeRuntime() {
  return typeof process !== "undefined"
    && !!process?.versions?.node;
}

export async function ensureBezelStretchConfigFile(configPath, options = {}) {
  const normalizedPath = normalizePath(configPath).trim();
  if (!normalizedPath || !isNodeRuntime()) {
    return { ...DEFAULT_BEZEL_STRETCH_CONFIG };
  }

  const cwd = typeof options.cwd === "string" && options.cwd.trim()
    ? options.cwd
    : process.cwd();
  const fsModule = options.fsModule || await import("node:fs/promises");
  const pathModule = options.pathModule || await import("node:path");
  const absolutePath = pathModule.resolve(cwd, normalizedPath);
  const directoryPath = pathModule.dirname(absolutePath);
  const defaultContent = `${JSON.stringify(DEFAULT_BEZEL_STRETCH_CONFIG, null, 2)}\n`;

  try {
    await fsModule.access(absolutePath);
  } catch {
    await fsModule.mkdir(directoryPath, { recursive: true });
    await fsModule.writeFile(absolutePath, defaultContent, "utf8");
    return { ...DEFAULT_BEZEL_STRETCH_CONFIG };
  }

  try {
    const content = await fsModule.readFile(absolutePath, "utf8");
    const parsed = JSON.parse(content);
    return parseStretchConfigObject(parsed);
  } catch {
    return { ...DEFAULT_BEZEL_STRETCH_CONFIG };
  }
}

export async function loadBezelStretchConfig(configPath, options = {}) {
  const normalizedPath = normalizePath(configPath).trim();
  if (!normalizedPath) {
    return { ...DEFAULT_BEZEL_STRETCH_CONFIG };
  }

  if (isNodeRuntime()) {
    return ensureBezelStretchConfigFile(normalizedPath, options);
  }

  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    return { ...DEFAULT_BEZEL_STRETCH_CONFIG };
  }

  try {
    const requestPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
    const response = await fetchImpl(requestPath, { cache: "no-store" });
    if (!response || response.ok !== true) {
      return { ...DEFAULT_BEZEL_STRETCH_CONFIG };
    }
    const parsed = await response.json();
    return parseStretchConfigObject(parsed);
  } catch {
    return { ...DEFAULT_BEZEL_STRETCH_CONFIG };
  }
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

function expandRectWithinBounds(rect, expandPx, bounds) {
  const source = sanitizeRect(rect);
  if (!source || !bounds || typeof bounds !== "object") {
    return source;
  }

  const stretch = sanitizeUniformEdgeStretchPx(expandPx);
  if (stretch <= 0) {
    return source;
  }

  const boundX = safeNumber(bounds.x, 0);
  const boundY = safeNumber(bounds.y, 0);
  const boundWidth = toPositiveNumber(bounds.width);
  const boundHeight = toPositiveNumber(bounds.height);
  if (boundWidth <= 0 || boundHeight <= 0) {
    return source;
  }

  const boundRight = boundX + boundWidth;
  const boundBottom = boundY + boundHeight;
  const expandedLeft = Math.max(boundX, source.x - stretch);
  const expandedTop = Math.max(boundY, source.y - stretch);
  const expandedRight = Math.min(boundRight, source.x + source.width + stretch);
  const expandedBottom = Math.min(boundBottom, source.y + source.height + stretch);
  const expandedWidth = Math.max(0, expandedRight - expandedLeft);
  const expandedHeight = Math.max(0, expandedBottom - expandedTop);
  if (expandedWidth <= 0 || expandedHeight <= 0) {
    return source;
  }

  return {
    x: expandedLeft,
    y: expandedTop,
    width: expandedWidth,
    height: expandedHeight
  };
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
    this.stretchConfigPath = resolveBezelStretchConfigPath(this.path);
    this.host = null;
    this.element = null;
    this.ready = false;
    this.missing = !this.path;
    this.alphaInspector = typeof options.alphaInspector === "function" ? options.alphaInspector : null;
    this.stretchConfigProvider = typeof options.stretchConfigProvider === "function"
      ? options.stretchConfigProvider
      : loadBezelStretchConfig;
    this.stretchConfigPromise = null;
    this.stretchConfigInitialized = false;
    this.uniformEdgeStretchPx = 0;
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
      transparentWindowRect: this.transparentWindowRect,
      stretchConfigPath: this.stretchConfigPath,
      stretchConfigInitialized: this.stretchConfigInitialized,
      uniformEdgeStretchPx: this.uniformEdgeStretchPx
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

  applyStretchConfig(config) {
    const parsed = parseStretchConfigObject(config);
    this.uniformEdgeStretchPx = parsed.uniformEdgeStretchPx;
    return parsed;
  }

  refreshStretchConfig() {
    if (this.stretchConfigInitialized) {
      return this.stretchConfigPromise;
    }
    this.stretchConfigInitialized = true;

    if (!this.stretchConfigPath || typeof this.stretchConfigProvider !== "function") {
      this.applyStretchConfig(DEFAULT_BEZEL_STRETCH_CONFIG);
      return null;
    }

    try {
      const result = this.stretchConfigProvider(this.stretchConfigPath, {
        bezelPath: this.path,
        gameId: this.gameId,
        defaultConfig: { ...DEFAULT_BEZEL_STRETCH_CONFIG }
      });
      if (result && typeof result.then === "function") {
        const pending = Promise.resolve(result)
          .then((config) => {
            const parsed = this.applyStretchConfig(config);
            if (this.element?.style?.display === "block") {
              const fitted = this.applyCanvasWindowFitLayout();
              if (!fitted) {
                this.applyCanvasFallbackLayout();
              }
            }
            return parsed;
          })
          .catch(() => this.applyStretchConfig(DEFAULT_BEZEL_STRETCH_CONFIG));
        this.stretchConfigPromise = pending;
        return pending;
      }

      this.applyStretchConfig(result);
      this.stretchConfigPromise = Promise.resolve({ uniformEdgeStretchPx: this.uniformEdgeStretchPx });
      return this.stretchConfigPromise;
    } catch {
      this.applyStretchConfig(DEFAULT_BEZEL_STRETCH_CONFIG);
      this.stretchConfigPromise = Promise.resolve({ uniformEdgeStretchPx: this.uniformEdgeStretchPx });
      return this.stretchConfigPromise;
    }
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
      this.refreshStretchConfig();
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

    const mappedWindow = {
      x: containPlacement.x + (this.transparentWindowRect.x * containPlacement.scale),
      y: containPlacement.y + (this.transparentWindowRect.y * containPlacement.scale),
      width: this.transparentWindowRect.width * containPlacement.scale,
      height: this.transparentWindowRect.height * containPlacement.scale
    };
    const stretchedWindow = expandRectWithinBounds(mappedWindow, this.uniformEdgeStretchPx, {
      x: containPlacement.x,
      y: containPlacement.y,
      width: containPlacement.width,
      height: containPlacement.height
    });
    const fittedCanvas = chooseBestOpeningFit(
      sourceWidth,
      sourceHeight,
      stretchedWindow?.width || 0,
      stretchedWindow?.height || 0
    );
    if (!fittedCanvas) {
      return false;
    }

    const windowX = stretchedWindow?.x || 0;
    const windowY = stretchedWindow?.y || 0;
    const windowWidth = stretchedWindow?.width || 0;
    const windowHeight = stretchedWindow?.height || 0;
    const left = windowX + ((windowWidth - fittedCanvas.width) * 0.5);
    const top = windowY + ((windowHeight - fittedCanvas.height) * 0.5);

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
