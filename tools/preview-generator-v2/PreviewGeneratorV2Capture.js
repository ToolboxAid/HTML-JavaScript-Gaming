class PreviewGeneratorV2Capture {
  static CAPTURE_TIMEOUT_MARKER = "Capture timeout";

  static UNSUPPORTED_COLOR_FUNCTION_PROPERTIES = Object.freeze([
    "background",
    "background-color",
    "border-block-color",
    "border-block-end-color",
    "border-block-start-color",
    "border-bottom-color",
    "border-color",
    "border-inline-color",
    "border-inline-end-color",
    "border-inline-start-color",
    "border-left-color",
    "border-right-color",
    "border-top-color",
    "box-shadow",
    "caret-color",
    "color",
    "column-rule-color",
    "fill",
    "outline-color",
    "scrollbar-color",
    "stop-color",
    "stroke",
    "text-decoration-color",
    "text-emphasis-color",
    "text-shadow"
  ]);

  constructor({ ui, frame, documentRef = document, windowRef = window } = {}) {
    this.ui = ui;
    this.frame = frame;
    this.document = documentRef;
    this.window = windowRef;
  }

  static getAvailableFullScreenCaptureSize(doc = document, win = window, fallbackWidth = 1, fallbackHeight = 1) {
    const root = doc?.documentElement;
    const body = doc?.body;
    const width = Math.max(1, Math.ceil(
      win?.innerWidth
        || root?.clientWidth
        || body?.clientWidth
        || root?.scrollWidth
        || body?.scrollWidth
        || fallbackWidth
        || 1
    ));
    const height = Math.max(1, Math.ceil(
      win?.innerHeight
        || root?.clientHeight
        || body?.clientHeight
        || root?.scrollHeight
        || body?.scrollHeight
        || fallbackHeight
        || 1
    ));
    return { width, height };
  }

  initializeRuntimeCaptureMode(runtimeParams) {
    const samplePath = String(runtimeParams.get("sample") || "").trim();
    const width = Math.max(1, Number(runtimeParams.get("w") || 640));
    const height = Math.max(1, Number(runtimeParams.get("h") || 360));
    const settleMs = Math.max(0, Number(runtimeParams.get("settle") || 3000));
    const timeoutMs = Math.max(1000, Number(runtimeParams.get("timeout") || 12000));
    const captureModeParam = String(runtimeParams.get("capture") || "canvasOnly").trim();
    const runtimeCaptureMode = /^fullscreen/i.test(captureModeParam) ? "fullscreen" : "canvasOnly";

    const setStatus = (status) => {
      this.document.body.setAttribute("data-capture-status", status);
      this.document.title = "capture:" + status;
    };

    const bodyChildren = Array.from(this.document.body.children);
    for (const node of bodyChildren) {
      node.style.display = "none";
    }
    this.document.body.style.margin = "0";
    this.document.body.style.background = "#000";
    this.document.body.style.overflow = "hidden";

    this.frame.style.display = "block";
    this.frame.style.position = "fixed";
    this.frame.style.width = "1px";
    this.frame.style.height = "1px";
    this.frame.style.left = "-10000px";
    this.frame.style.top = "-10000px";
    this.frame.style.border = "0";
    this.frame.style.visibility = "hidden";
    this.frame.setAttribute("sandbox", "allow-scripts allow-same-origin");

    const outputCanvas = this.document.createElement("canvas");
    outputCanvas.id = "runtimeCaptureSurface";
    outputCanvas.width = width;
    outputCanvas.height = height;
    outputCanvas.style.display = "block";
    outputCanvas.style.width = "100vw";
    outputCanvas.style.height = "100vh";
    outputCanvas.style.background = "#000";
    this.document.body.appendChild(outputCanvas);

    const ctx = outputCanvas.getContext("2d");
    if (!ctx) {
      setStatus("error");
      return;
    }

    const writeLabel = (text, color) => {
      ctx.fillStyle = "#0b1020";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "#334e7a";
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, width - 20, height - 20);
      ctx.fillStyle = color;
      ctx.font = "600 18px monospace";
      ctx.fillText(text, 20, 40);
    };

    const drawSourceCanvas = (sourceCanvas) => {
      const sw = sourceCanvas.width || sourceCanvas.clientWidth || width;
      const sh = sourceCanvas.height || sourceCanvas.clientHeight || height;
      if (!sw || !sh) {
        throw new Error("Canvas has invalid size.");
      }

      const scale = Math.max(width / sw, height / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      const dx = (width - dw) * 0.5;
      const dy = (height - dh) * 0.5;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(sourceCanvas, dx, dy, dw, dh);
    };

    const fail = (message) => {
      writeLabel(message, "#ff9ca8");
      setStatus("error");
    };

    if (!samplePath) {
      fail("Missing sample parameter");
      return;
    }

    writeLabel("Loading sample...", "#a5c0e6");
    setStatus("loading");

    const startTime = Date.now();
    let settled = false;

    const captureFullScreenCanvas = async (frameDoc) => {
      const html2canvasFn = this.window.html2canvas;
      if (typeof html2canvasFn !== "function") {
        throw new Error("Full Screen capture failed: html2canvas is unavailable. Use Canvas Only or ensure html2canvas loads before using Full Screen.");
      }

      const frameBody = frameDoc.body;
      if (!frameBody) {
        throw new Error("Full Screen capture failed because the target document has no body.");
      }

      try {
        const captureSize = PreviewGeneratorV2Capture.getAvailableFullScreenCaptureSize(this.document, this.window, width, height);
        return await html2canvasFn(frameBody, {
          backgroundColor: "#000000",
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: captureSize.width,
          height: captureSize.height,
          windowWidth: captureSize.width,
          windowHeight: captureSize.height,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            this.sanitizeClonedToolDocument(clonedDoc);
          }
        });
      } catch (error) {
        throw new Error(`Full Screen capture failed: ${error.message}`);
      }
    };

    const attemptCapture = async () => {
      try {
        const frameDoc = this.frame.contentDocument;
        if (!frameDoc) {
          throw new Error("Frame document unavailable.");
        }

        let sourceCanvas;
        if (runtimeCaptureMode === "fullscreen") {
          sourceCanvas = await captureFullScreenCanvas(frameDoc);
        } else {
          sourceCanvas = frameDoc.querySelector("canvas");
        }

        if (!sourceCanvas) {
          if (Date.now() - startTime > timeoutMs) {
            fail("Canvas not found");
            return;
          }
          requestAnimationFrame(() => {
            attemptCapture();
          });
          return;
        }

        if (!settled) {
          settled = true;
          setTimeout(() => {
            attemptCapture();
          }, settleMs);
          return;
        }

        drawSourceCanvas(sourceCanvas);
        setStatus("ready");
      } catch (error) {
        if (runtimeCaptureMode === "fullscreen") {
          fail(error.message);
          return;
        }

        if (Date.now() - startTime > timeoutMs) {
          fail("Capture timeout");
          return;
        }
        requestAnimationFrame(() => {
          attemptCapture();
        });
      }
    };

    this.frame.addEventListener("load", () => {
      requestAnimationFrame(() => {
        attemptCapture();
      });
    }, { once: true });

    this.frame.src = samplePath;

    setTimeout(() => {
      if (this.document.body.getAttribute("data-capture-status") !== "ready") {
        fail("Capture timeout");
      }
    }, timeoutMs + settleMs + 800);
  }

  escapeXml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  buildFallbackSvg(message) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="80">
  <text x="10" y="24">${this.escapeXml(message)}</text>
</svg>`;
  }

  buildCanvasWrappedSvg(canvas) {
    const width = canvas.width || canvas.scrollWidth || 800;
    const height = canvas.height || canvas.scrollHeight || 600;
    const dataUrl = canvas.toDataURL("image/png");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <image href="${dataUrl}" width="100%" height="100%" />
</svg>`;
  }

  buildElementWrappedSvg(element) {
    const rect = element.getBoundingClientRect();
    const width = Math.max(1, Math.ceil(rect.width || 1280));
    const height = Math.max(1, Math.ceil(rect.height || 800));
    const serialized = new XMLSerializer().serializeToString(element);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <foreignObject width="100%" height="100%">
<div xmlns="http://www.w3.org/1999/xhtml">${serialized}</div>
  </foreignObject>
</svg>`;
  }

  async loadFrame(url, timeoutMs = 20000) {
    this.frame.src = url;
    await this.waitForFrameLoad(timeoutMs);
  }

  async waitForFrameLoad(timeoutMs = 20000) {
    return await new Promise((resolve, reject) => {
      let done = false;

      const timer = setTimeout(() => {
        if (!done) {
          done = true;
          reject(new Error(`iframe load timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      const onLoad = () => {
        if (!done) {
          done = true;
          clearTimeout(timer);
          this.frame.removeEventListener("load", onLoad);
          resolve();
        }
      };

      this.frame.addEventListener("load", onLoad, { once: true });
    });
  }

  replaceUnsupportedColorFunctions(value, fallback = "#000000") {
    const source = String(value || "");
    const lower = source.toLowerCase();
    let result = "";
    let index = 0;
    let changed = false;

    while (index < source.length) {
      const matchIndex = lower.indexOf("color(", index);
      if (matchIndex < 0) {
        result += source.slice(index);
        break;
      }

      result += source.slice(index, matchIndex);
      let cursor = matchIndex + "color(".length;
      let depth = 1;
      while (cursor < source.length && depth > 0) {
        const char = source[cursor];
        if (char === "(") depth += 1;
        if (char === ")") depth -= 1;
        cursor += 1;
      }

      if (depth === 0) {
        result += fallback;
        changed = true;
        index = cursor;
      } else {
        result += source.slice(matchIndex);
        index = source.length;
      }
    }

    return changed ? result : source;
  }

  sanitizeStyleDeclaration(style) {
    if (!style) return;

    const properties = Array.from(style);
    for (const property of properties) {
      const value = style.getPropertyValue(property);
      if (!value || !/color\(/i.test(value)) continue;
      style.setProperty(
        property,
        this.replaceUnsupportedColorFunctions(value),
        style.getPropertyPriority(property)
      );
    }

    const bg = style.backgroundImage || "";
    if (/gradient/i.test(bg)) {
      style.backgroundImage = "none";
    }
  }

  sanitizeCssRules(rules) {
    if (!rules) return;

    for (const rule of Array.from(rules)) {
      this.sanitizeStyleDeclaration(rule.style);
      this.sanitizeCssRules(rule.cssRules);
    }
  }

  sanitizeComputedColorStyles(clonedDoc) {
    const clonedWindow = clonedDoc.defaultView;
    if (!clonedWindow || typeof clonedWindow.getComputedStyle !== "function") {
      return;
    }

    const all = clonedDoc.querySelectorAll("*");
    for (const el of all) {
      const computed = clonedWindow.getComputedStyle(el);
      for (const property of PreviewGeneratorV2Capture.UNSUPPORTED_COLOR_FUNCTION_PROPERTIES) {
        const value = computed.getPropertyValue(property);
        if (!value || !/color\(/i.test(value)) continue;
        el.style.setProperty(property, this.replaceUnsupportedColorFunctions(value), "important");
      }

      const backgroundImage = computed.getPropertyValue("background-image") || "";
      if (/gradient/i.test(backgroundImage)) {
        el.style.setProperty("background-image", "none", "important");
      }
    }
  }

  sanitizeClonedToolDocument(clonedDoc) {
    for (const styleNode of clonedDoc.querySelectorAll("style")) {
      if (!/color\(/i.test(styleNode.textContent || "")) continue;
      styleNode.textContent = this.replaceUnsupportedColorFunctions(styleNode.textContent);
    }

    for (const sheet of Array.from(clonedDoc.styleSheets || [])) {
      try {
        this.sanitizeCssRules(sheet.cssRules);
      } catch {
      }
    }

    const all = clonedDoc.querySelectorAll("*");
    for (const el of all) {
      this.sanitizeStyleDeclaration(el.style);
    }

    this.sanitizeComputedColorStyles(clonedDoc);

    const canvases = clonedDoc.querySelectorAll("canvas");
    for (const canvas of canvases) {
      try {
        const img = clonedDoc.createElement("img");
        img.src = canvas.toDataURL("image/png");
        img.style.width = canvas.style.width || `${canvas.width}px`;
        img.style.height = canvas.style.height || `${canvas.height}px`;
        img.style.display = "block";
        canvas.replaceWith(img);
      } catch {
      }
    }
  }

  extractBestToolFallbackSvg(doc) {
    const preferredSelectors = [
      "main canvas",
      ".editor canvas",
      ".workspace canvas",
      "#editor canvas",
      "canvas",
      "main",
      ".editor",
      ".workspace",
      "#editor",
      "body"
    ];

    for (const selector of preferredSelectors) {
      const el = doc.querySelector(selector);
      if (!el) continue;

      if ((el.tagName || "").toLowerCase() === "canvas") {
        return this.buildCanvasWrappedSvg(el);
      }

      try {
        return this.buildElementWrappedSvg(el);
      } catch {
      }
    }

    return this.buildFallbackSvg(PreviewGeneratorV2Capture.CAPTURE_TIMEOUT_MARKER);
  }

  async extractFullPageSvg(doc) {
    const win = this.frame.contentWindow;
    if (!win) {
      throw new Error("Full Screen capture failed because the target frame window is unavailable.");
    }

    const html2canvasFn = this.window.html2canvas || win.html2canvas;
    if (typeof html2canvasFn !== "function") {
      throw new Error("Full Screen capture failed: html2canvas is unavailable. Use Canvas Only or ensure html2canvas loads before using Full Screen.");
    }

    const body = doc.body;
    if (!body) {
      throw new Error("Full Screen capture failed because the target document has no body.");
    }
    const captureSize = PreviewGeneratorV2Capture.getAvailableFullScreenCaptureSize(this.document, this.window, body.scrollWidth, body.scrollHeight);

    try {
      const canvas = await html2canvasFn(body, {
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: captureSize.width,
        height: captureSize.height,
        windowWidth: captureSize.width,
        windowHeight: captureSize.height,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          this.sanitizeClonedToolDocument(clonedDoc);
        }
      });

      return this.buildCanvasWrappedSvg(canvas);
    } catch (error) {
      throw new Error(`Full Screen capture failed: ${error.message}`);
    }
  }

  extractCanvasOnlySvg(doc) {
    const canvas = doc.querySelector("canvas");
    if (canvas) {
      return this.buildCanvasWrappedSvg(canvas);
    }
    return this.buildFallbackSvg("Canvas not found");
  }

  async extractSvgFromFrame() {
    const doc = this.frame.contentDocument;
    if (!doc) {
      if (this.ui.getSelectedCaptureMode() === "fullscreen") {
        throw new Error("Full Screen capture failed because the target frame document is unavailable.");
      }
      return this.buildFallbackSvg(PreviewGeneratorV2Capture.CAPTURE_TIMEOUT_MARKER);
    }

    if (this.ui.getSelectedCaptureMode() === "canvasOnly") {
      return this.extractCanvasOnlySvg(doc);
    }

    return await this.extractFullPageSvg(doc);
  }

  async triggerGameStart() {
    try {
      const win = this.frame.contentWindow;
      if (!win) return;

      const evtDown = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true });
      const evtUp = new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true });

      win.document.dispatchEvent(evtDown);
      win.document.dispatchEvent(evtUp);
    } catch {}
  }
}

export { PreviewGeneratorV2Capture };
