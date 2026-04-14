import { resolveGameImageConventionPaths, resolveRuntimeAssetUrl } from "./gameImageConvention.js";

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
  element.style.objectFit = "cover";
  element.style.pointerEvents = "none";
  element.style.zIndex = "2147483646";
  element.style.display = "none";
  element.style.visibility = "hidden";
  element.style.opacity = "0";
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
  }

  getState() {
    return {
      gameId: this.gameId,
      path: this.path,
      attached: !!this.element,
      visible: this.element?.style?.display === "block",
      hostTagName: this.host?.tagName || ""
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
      this.ready = true;
      this.missing = false;
    };
    element.onerror = () => {
      this.ready = false;
      this.missing = true;
      element.style.display = "none";
    };
    element.src = resolveRuntimeAssetUrl(this.path, this.documentRef);

    this.host.appendChild?.(element);
    this.element = element;
  }

  detach() {
    if (!this.element) {
      return;
    }

    this.element.style.display = "none";
    this.element.remove?.();
    this.element = null;
    this.host = null;
  }

  sync(options = {}) {
    if (!this.path) {
      return {
        visible: false,
        reason: "unavailable",
        path: this.path
      };
    }

    this.attach();
    if (!this.element) {
      return {
        visible: false,
        reason: "attach-failed",
        path: this.path
      };
    }

    const fullscreenElement = options.fullscreenElement || this.documentRef?.fullscreenElement || null;
    const activeHost = this.resolveActiveHost(fullscreenElement);
    if (!this.mountOnHost(activeHost)) {
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
    return {
      visible: shouldShow,
      reason: shouldShow ? "visible" : (options.fullscreenActive === true ? "asset-unavailable" : "fullscreen-inactive"),
      path: this.path,
      hostTagName: this.host?.tagName || ""
    };
  }
}
