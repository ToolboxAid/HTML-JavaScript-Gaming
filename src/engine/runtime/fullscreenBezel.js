import { resolveGameImageConventionPaths } from "./gameImageConvention.js";

function safeDisplay(value) {
  return value === "block" ? "block" : "none";
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
    const canvasParent = this.canvas?.parentElement || null;
    if (canvasParent) {
      return canvasParent;
    }
    return this.documentRef?.body || null;
  }

  attach() {
    if (!this.documentRef || !this.path || this.element) {
      return;
    }

    const host = this.resolveHost();
    if (!host) {
      return;
    }

    if (host.style && (!host.style.position || host.style.position === "static")) {
      host.style.position = "relative";
    }

    const element = this.documentRef.createElement?.("img");
    if (!element) {
      return;
    }
    element.setAttribute("data-runtime-overlay", "fullscreenBezel");
    element.style.position = "absolute";
    element.style.inset = "0";
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.objectFit = "cover";
    element.style.pointerEvents = "none";
    element.style.zIndex = "9999";
    element.style.display = "none";
    element.onload = () => {
      this.ready = true;
      this.missing = false;
    };
    element.onerror = () => {
      this.ready = false;
      this.missing = true;
      element.style.display = "none";
    };
    element.src = this.path;

    host.appendChild?.(element);
    this.host = host;
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

    const shouldShow = options.fullscreenActive === true && this.ready && !this.missing;
    this.element.style.display = safeDisplay(shouldShow ? "block" : "none");
    return {
      visible: shouldShow,
      reason: shouldShow ? "visible" : (options.fullscreenActive === true ? "asset-unavailable" : "fullscreen-inactive"),
      path: this.path
    };
  }
}
