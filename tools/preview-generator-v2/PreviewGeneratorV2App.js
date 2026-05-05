import { PreviewGeneratorV2Logger } from './PreviewGeneratorV2Logger.js';
import { PreviewGeneratorV2Ui } from './PreviewGeneratorV2Ui.js';
import { PreviewGeneratorV2RepoAccess } from './PreviewGeneratorV2RepoAccess.js';
import { PreviewGeneratorV2Capture } from './PreviewGeneratorV2Capture.js';

const OUTPUT_NAME = "preview.svg";
const CAPTURE_TIMEOUT_MARKER = "Capture timeout";

const runtimeParams = new URLSearchParams(window.location.search);
const isRuntimeMode = runtimeParams.get("mode") === "runtime";

let repoDirHandle = null;
let stopRequested = false;
let repoDisplayName = "";
let isGenerating = false;
const ui = new PreviewGeneratorV2Ui();
const logger = new PreviewGeneratorV2Logger({
  statusEl: ui.statusLog.getStatusElement(),
  logEl: ui.statusLog.getLogElement()
});
const frame = ui.previewFrame.getFrame();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function initializeRuntimeCaptureMode() {
  const samplePath = String(runtimeParams.get("sample") || "").trim();
  const width = Math.max(1, Number(runtimeParams.get("w") || 640));
  const height = Math.max(1, Number(runtimeParams.get("h") || 360));
  const settleMs = Math.max(0, Number(runtimeParams.get("settle") || 3000));
  const timeoutMs = Math.max(1000, Number(runtimeParams.get("timeout") || 12000));
  const captureModeParam = String(runtimeParams.get("capture") || "canvasOnly").trim();
  const runtimeCaptureMode = /^fullscreen/i.test(captureModeParam) ? "fullscreen" : "canvasOnly";

  function setStatus(status) {
    document.body.setAttribute("data-capture-status", status);
    document.title = "capture:" + status;
  }

  const bodyChildren = Array.from(document.body.children);
  for (const node of bodyChildren) {
    node.style.display = "none";
  }
  document.body.style.margin = "0";
  document.body.style.background = "#000";
  document.body.style.overflow = "hidden";

  frame.style.display = "block";
  frame.style.position = "fixed";
  frame.style.width = "1px";
  frame.style.height = "1px";
  frame.style.left = "-10000px";
  frame.style.top = "-10000px";
  frame.style.border = "0";
  frame.style.visibility = "hidden";
  frame.setAttribute("sandbox", "allow-scripts allow-same-origin");

  const outputCanvas = document.createElement("canvas");
  outputCanvas.id = "runtimeCaptureSurface";
  outputCanvas.width = width;
  outputCanvas.height = height;
  outputCanvas.style.display = "block";
  outputCanvas.style.width = "100vw";
  outputCanvas.style.height = "100vh";
  outputCanvas.style.background = "#000";
  document.body.appendChild(outputCanvas);

  const ctx = outputCanvas.getContext("2d");
  if (!ctx) {
    setStatus("error");
    return;
  }

  function writeLabel(text, color) {
    ctx.fillStyle = "#0b1020";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#334e7a";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.fillStyle = color;
    ctx.font = "600 18px monospace";
    ctx.fillText(text, 20, 40);
  }

  function drawSourceCanvas(sourceCanvas) {
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
  }

  function fail(message) {
    writeLabel(message, "#ff9ca8");
    setStatus("error");
  }

  if (!samplePath) {
    fail("Missing sample parameter");
    return;
  }

  writeLabel("Loading sample...", "#a5c0e6");
  setStatus("loading");

  const startTime = Date.now();
  let settled = false;

  async function captureFullScreenCanvas(frameDoc) {
    const html2canvasFn = window.html2canvas;
    if (typeof html2canvasFn !== "function") {
      throw new Error("Full Screen capture failed: html2canvas is unavailable. Use Canvas Only or ensure html2canvas loads before using Full Screen.");
    }

    const frameBody = frameDoc.body;
    if (!frameBody) {
      throw new Error("Full Screen capture failed because the target document has no body.");
    }

    try {
      const captureSize = PreviewGeneratorV2Capture.getAvailableFullScreenCaptureSize(document, window, width, height);
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
          sanitizeClonedToolDocument(clonedDoc);
        }
      });
    } catch (error) {
      throw new Error(`Full Screen capture failed: ${error.message}`);
    }
  }

  async function attemptCapture() {
    try {
      const frameDoc = frame.contentDocument;
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
  }

  frame.addEventListener("load", () => {
    requestAnimationFrame(() => {
      attemptCapture();
    });
  }, { once: true });

  frame.src = samplePath;

  setTimeout(() => {
    if (document.body.getAttribute("data-capture-status") !== "ready") {
      fail("Capture timeout");
    }
  }, timeoutMs + settleMs + 800);
}

function normalizeSlashes(value) {
  return String(value || "")
    .replaceAll("/", "\\")
    .replace(/\\{2,}/g, "\\");
}

function escapeXml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getAssetFolderRelativePath() {
  const raw = ui.assetFolder.getRawValue();
  if (!raw) return "assets";

  return raw
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map(x => x.trim())
    .filter(Boolean)
    .join("/");
}

function getAssetFolderDisplayPath() {
  return getAssetFolderRelativePath().replaceAll("/", "\\");
}

function getWriteFolderRelativePath(entry) {
  if (entry.targetType === "samples") {
    return `samples/phase-${entry.phase}/${entry.id}/${getAssetFolderRelativePath()}`;
  }
  if (entry.targetType === "games") {
    return `games/${entry.name}/${getAssetFolderRelativePath()}`;
  }
  if (entry.targetType === "tools") {
    return `tools/${entry.name}/${getAssetFolderRelativePath()}`;
  }
  throw new Error(`Unsupported target type: ${entry.targetType}`);
}

function getWriteFolderDisplayPath(entry) {
  return normalizeSlashes(getWriteFolderRelativePath(entry));
}

function getFullOutputPath(entry) {
  return `${getWriteFolderDisplayPath(entry)}\\${OUTPUT_NAME}`;
}

function updateWriteFolderSampleLabel() {
  const assetFolder = getAssetFolderDisplayPath() || "assets/images";
  const targetType = ui.getSelectedTargetType();

  if (targetType === "samples") {
    ui.outputSummary.setWriteFolderSample(`samples\\phaseXX\\XXXX\\${assetFolder}`);
    return;
  }
  if (targetType === "games") {
    ui.outputSummary.setWriteFolderSample(`games\\<gamename>\\${assetFolder}`);
    return;
  }
  if (targetType === "tools") {
    ui.outputSummary.setWriteFolderSample(`tools\\<toolname>\\${assetFolder}`);
  }
}

async function updateWriteFolderActualLabelFromInput() {
  const lines = parseInputList(ui.pathsOrIds.getValue());
  if (!lines.length) {
    ui.outputSummary.setWriteFolderActual("not available yet");
    return;
  }

  try {
    const entries = await resolveEntries(lines[0]);
    if (entries.length > 1 && entries[0].targetType === "samples") {
      ui.outputSummary.setWriteFolderActual(normalizeSlashes(`samples/phase-${entries[0].phase}/*/${getAssetFolderRelativePath()}`));
      return;
    }

    ui.outputSummary.setWriteFolderActual(entries.length ? getWriteFolderDisplayPath(entries[0]) : "not available yet");
  } catch {
    ui.outputSummary.setWriteFolderActual("not available yet");
  }
}

async function updatePathPreviewLabels() {
  updateWriteFolderSampleLabel();
  await updateWriteFolderActualLabelFromInput();
}

function getSamplePhaseFolderMatch(inputLine) {
  return String(inputLine || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .match(/^samples\/phase-?(\d{2})$/i);
}

async function resolveSamplePhase(phase) {
  if (!repoDirHandle) {
    throw new Error("Pick the repo folder before using a phase folder input.");
  }

  const samplesDir = await PreviewGeneratorV2RepoAccess.getDirectoryHandle(repoDirHandle, "samples");
  const phaseDir = await PreviewGeneratorV2RepoAccess.getDirectoryHandle(samplesDir, `phase-${phase}`);
  if (typeof phaseDir.entries !== "function") {
    throw new Error(`Cannot list samples/phase-${phase}.`);
  }

  const sampleEntries = [];
  for await (const [name, handle] of phaseDir.entries()) {
    if (!handle || handle.kind !== "directory" || !/^\d{4}$/.test(name)) continue;
    if (!(await PreviewGeneratorV2RepoAccess.hasIndexHtml(handle))) continue;
    sampleEntries.push({
      targetType: "samples",
      id: name,
      phase,
      samplePath: `samples/phase-${phase}/${name}/index.html`
    });
  }

  sampleEntries.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  if (!sampleEntries.length) {
    throw new Error(`No sample index.html entries found in samples/phase-${phase}.`);
  }

  return sampleEntries;
}

async function resolveSample(inputLine) {
  const raw = inputLine.trim();
  if (!raw) return null;
  const normalized = raw.replaceAll("\\", "/");

  const idOnlyMatch = normalized.match(/^(\d{4})$/);
  if (idOnlyMatch) {
    const id = idOnlyMatch[1];
    const phase = id.substring(0, 2);
    return {
      targetType: "samples",
      id,
      phase,
      samplePath: `samples/phase-${phase}/${id}/index.html`
    };
  }

  const pathMatch = normalized.match(/samples\/phase-?(\d{2})\/(\d{4})\/index\.html$/i);
  if (pathMatch) {
    return {
      targetType: "samples",
      id: pathMatch[2],
      phase: pathMatch[1],
      samplePath: `samples/phase-${pathMatch[1]}/${pathMatch[2]}/index.html`
    };
  }

  throw new Error(`Unrecognized sample input: ${raw}`);
}

async function resolveGame(inputLine) {
  const raw = inputLine.trim();
  if (!raw) return null;
  const normalized = raw.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");

  const pathMatch = normalized.match(/^games\/(.+)\/index\.html$/i);
  if (pathMatch) {
    return {
      targetType: "games",
      name: pathMatch[1],
      samplePath: `games/${pathMatch[1]}/index.html`
    };
  }

  return {
    targetType: "games",
    name: normalized,
    samplePath: `games/${normalized}/index.html`
  };
}

async function resolveTool(inputLine) {
  const raw = inputLine.trim();
  if (!raw) return null;
  const normalized = raw.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");

  const pathMatch = normalized.match(/^tools\/(.+)\/index\.html$/i);
  if (pathMatch) {
    return {
      targetType: "tools",
      name: pathMatch[1],
      samplePath: `tools/${pathMatch[1]}/index.html`
    };
  }

  return {
    targetType: "tools",
    name: normalized,
    samplePath: `tools/${normalized}/index.html`
  };
}

async function resolveEntry(inputLine) {
  const raw = String(inputLine || "").trim();
  if (!raw) return null;

  const normalized = raw.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");

  if (/^samples\//i.test(normalized)) {
    return await resolveSample(normalized);
  }
  if (/^games\//i.test(normalized)) {
    return await resolveGame(normalized);
  }
  if (/^tools\//i.test(normalized)) {
    return await resolveTool(normalized);
  }

  const targetType = ui.getSelectedTargetType();
  if (targetType === "samples") return await resolveSample(raw);
  if (targetType === "games") return await resolveGame(raw);
  if (targetType === "tools") return await resolveTool(raw);

  throw new Error(`Unsupported target type: ${targetType}`);
}

async function resolveEntries(inputLine) {
  const phaseMatch = getSamplePhaseFolderMatch(inputLine);
  if (phaseMatch) {
    return await resolveSamplePhase(phaseMatch[1]);
  }

  const entry = await resolveEntry(inputLine);
  return entry ? [entry] : [];
}

async function getTargetDirHandle(repoHandle, entry) {
  if (entry.targetType === "samples") {
    const samplesDir = await PreviewGeneratorV2RepoAccess.getDirectoryHandle(repoHandle, "samples");
    const phaseDir = await PreviewGeneratorV2RepoAccess.getDirectoryHandle(samplesDir, `phase-${entry.phase}`);
    return await PreviewGeneratorV2RepoAccess.getDirectoryHandle(phaseDir, entry.id);
  }

  if (entry.targetType === "games") {
    const gamesDir = await PreviewGeneratorV2RepoAccess.getDirectoryHandle(repoHandle, "games");
    return await getExistingDirectoryPath(gamesDir, entry.name);
  }

  if (entry.targetType === "tools") {
    const toolsDir = await PreviewGeneratorV2RepoAccess.getDirectoryHandle(repoHandle, "tools");
    return await getExistingDirectoryPath(toolsDir, entry.name);
  }

  throw new Error(`Unsupported target type: ${entry.targetType}`);
}

async function ensureDirectoryPath(parentHandle, relativePath) {
  const parts = String(relativePath || "")
    .replaceAll("\\", "/")
    .split("/")
    .map(x => x.trim())
    .filter(Boolean);

  let current = parentHandle;
  for (const part of parts) {
    current = await current.getDirectoryHandle(part, { create: true });
  }
  return current;
}

async function getExistingDirectoryPath(parentHandle, relativePath) {
  const parts = String(relativePath || "")
    .replaceAll("\\", "/")
    .split("/")
    .map(x => x.trim())
    .filter(Boolean);

  let current = parentHandle;
  for (const part of parts) {
    current = await current.getDirectoryHandle(part);
  }
  return current;
}

async function readExistingPreview(targetDirHandle) {
  const relativeOutputFolder = getAssetFolderRelativePath();
  try {
    const targetDir = relativeOutputFolder
      ? await getExistingDirectoryPath(targetDirHandle, relativeOutputFolder)
      : targetDirHandle;

    const fileHandle = await PreviewGeneratorV2RepoAccess.getFileHandle(targetDir, OUTPUT_NAME, false);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

async function shouldRewrite(targetDirHandle) {
  if (ui.renderControls.isForceRewrite()) {
    return { rewrite: true, reason: "force-rewrite" };
  }

  const existing = await readExistingPreview(targetDirHandle);
  if (existing == null) {
    return { rewrite: true, reason: "missing-preview" };
  }

  if (existing.includes(CAPTURE_TIMEOUT_MARKER)) {
    return { rewrite: true, reason: "literal-capture-timeout-found" };
  }

  return { rewrite: false, reason: "existing-preview-without-capture-timeout" };
}

async function writePreview(targetDirHandle, svgContent) {
  const relativeOutputFolder = getAssetFolderRelativePath();

  const targetDir = relativeOutputFolder
    ? await ensureDirectoryPath(targetDirHandle, relativeOutputFolder)
    : targetDirHandle;

  const fileHandle = await PreviewGeneratorV2RepoAccess.getFileHandle(targetDir, OUTPUT_NAME, true);
  const writable = await fileHandle.createWritable();
  await writable.write(svgContent);
  await writable.close();
}

function buildFallbackSvg(message) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="80">
  <text x="10" y="24">${escapeXml(message)}</text>
</svg>`;
}

function buildCanvasWrappedSvg(canvas) {
  const width = canvas.width || canvas.scrollWidth || 800;
  const height = canvas.height || canvas.scrollHeight || 600;
  const dataUrl = canvas.toDataURL("image/png");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <image href="${dataUrl}" width="100%" height="100%" />
</svg>`;
}

function buildElementWrappedSvg(element) {
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

async function waitForFrameLoad(iframe, timeoutMs = 20000) {
  return await new Promise((resolve, reject) => {
    let done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        reject(new Error(`iframe load timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    function onLoad() {
      if (!done) {
        done = true;
        clearTimeout(timer);
        iframe.removeEventListener("load", onLoad);
        resolve();
      }
    }

    iframe.addEventListener("load", onLoad, { once: true });
  });
}

const UNSUPPORTED_COLOR_FUNCTION_PROPERTIES = [
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
];

function replaceUnsupportedColorFunctions(value, fallback = "#000000") {
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

function sanitizeStyleDeclaration(style) {
  if (!style) return;

  const properties = Array.from(style);
  for (const property of properties) {
    const value = style.getPropertyValue(property);
    if (!value || !/color\(/i.test(value)) continue;
    style.setProperty(
      property,
      replaceUnsupportedColorFunctions(value),
      style.getPropertyPriority(property)
    );
  }

  const bg = style.backgroundImage || "";
  if (/gradient/i.test(bg)) {
    style.backgroundImage = "none";
  }
}

function sanitizeCssRules(rules) {
  if (!rules) return;

  for (const rule of Array.from(rules)) {
    sanitizeStyleDeclaration(rule.style);
    sanitizeCssRules(rule.cssRules);
  }
}

function sanitizeComputedColorStyles(clonedDoc) {
  const clonedWindow = clonedDoc.defaultView;
  if (!clonedWindow || typeof clonedWindow.getComputedStyle !== "function") {
    return;
  }

  const all = clonedDoc.querySelectorAll("*");
  for (const el of all) {
    const computed = clonedWindow.getComputedStyle(el);
    for (const property of UNSUPPORTED_COLOR_FUNCTION_PROPERTIES) {
      const value = computed.getPropertyValue(property);
      if (!value || !/color\(/i.test(value)) continue;
      el.style.setProperty(property, replaceUnsupportedColorFunctions(value), "important");
    }

    const backgroundImage = computed.getPropertyValue("background-image") || "";
    if (/gradient/i.test(backgroundImage)) {
      el.style.setProperty("background-image", "none", "important");
    }
  }
}

function sanitizeClonedToolDocument(clonedDoc) {
  for (const styleNode of clonedDoc.querySelectorAll("style")) {
    if (!/color\(/i.test(styleNode.textContent || "")) continue;
    styleNode.textContent = replaceUnsupportedColorFunctions(styleNode.textContent);
  }

  for (const sheet of Array.from(clonedDoc.styleSheets || [])) {
    try {
      sanitizeCssRules(sheet.cssRules);
    } catch {
    }
  }

  const all = clonedDoc.querySelectorAll("*");
  for (const el of all) {
    sanitizeStyleDeclaration(el.style);
  }

  sanitizeComputedColorStyles(clonedDoc);

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

function extractBestToolFallbackSvg(doc) {
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
      return buildCanvasWrappedSvg(el);
    }

    try {
      return buildElementWrappedSvg(el);
    } catch {
    }
  }

  return buildFallbackSvg(CAPTURE_TIMEOUT_MARKER);
}

async function extractFullPageSvg(doc) {
  const win = frame.contentWindow;
  if (!win) {
    throw new Error("Full Screen capture failed because the target frame window is unavailable.");
  }

  const html2canvasFn = window.html2canvas || win.html2canvas;
  if (typeof html2canvasFn !== "function") {
    throw new Error("Full Screen capture failed: html2canvas is unavailable. Use Canvas Only or ensure html2canvas loads before using Full Screen.");
  }

  const body = doc.body;
  if (!body) {
    throw new Error("Full Screen capture failed because the target document has no body.");
  }
  const captureSize = PreviewGeneratorV2Capture.getAvailableFullScreenCaptureSize(document, window, body.scrollWidth, body.scrollHeight);

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
        sanitizeClonedToolDocument(clonedDoc);
      }
    });

    return buildCanvasWrappedSvg(canvas);
  } catch (error) {
    throw new Error(`Full Screen capture failed: ${error.message}`);
  }
}

function extractCanvasOnlySvg(doc) {
  const canvas = doc.querySelector("canvas");
  if (canvas) {
    return buildCanvasWrappedSvg(canvas);
  }
  return buildFallbackSvg("Canvas not found");
}

async function extractSvgFromFrame(entry) {
  const doc = frame.contentDocument;
  if (!doc) {
    if (ui.getSelectedCaptureMode() === "fullscreen") {
      throw new Error("Full Screen capture failed because the target frame document is unavailable.");
    }
    return buildFallbackSvg(CAPTURE_TIMEOUT_MARKER);
  }

  if (ui.getSelectedCaptureMode() === "canvasOnly") {
    return extractCanvasOnlySvg(doc);
  }

  return await extractFullPageSvg(doc);
}

async function triggerGameStart() {
  try {
    const win = frame.contentWindow;
    if (!win) return;

    const evtDown = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true });
    const evtUp = new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true });

    win.document.dispatchEvent(evtDown);
    win.document.dispatchEvent(evtUp);
  } catch {}
}

async function processOne(entry, baseUrl, waitMs) {
  const targetDirHandle = await getTargetDirHandle(repoDirHandle, entry);
  const decision = await shouldRewrite(targetDirHandle);

  ui.outputSummary.setWriteFolderActual(getWriteFolderDisplayPath(entry));
  const label = entry.targetType === "samples" ? entry.id : entry.name;

  if (!decision.rewrite) {
    logger.log(`SKIP ${label}  (${decision.reason})`);
    if (decision.reason === "existing-preview-without-capture-timeout") {
      logger.log(`Existing ${OUTPUT_NAME} does not contain ${CAPTURE_TIMEOUT_MARKER}; skipping rewrite.`);
    }
    logger.log(`CHK  ${getFullOutputPath(entry)}`);
    return { id: label, status: "skipped", reason: decision.reason };
  }
  if (decision.reason === "literal-capture-timeout-found") {
    logger.log(`Existing ${OUTPUT_NAME} contains ${CAPTURE_TIMEOUT_MARKER}; rewriting.`);
  }

  const url = `${baseUrl}/${entry.samplePath}`;
  logger.log(`RUN  ${label}`);
  logger.log(`OUT  ${getFullOutputPath(entry)}`);
  logger.log(`URL  ${url}`);

  try {
    frame.src = url;
    await waitForFrameLoad(frame, 20000);
    if (entry.targetType === "games") {
      await triggerGameStart();
      await sleep(3000);
    } else {
      await sleep(waitMs);
    }

    const svgContent = await extractSvgFromFrame(entry);
    await writePreview(targetDirHandle, svgContent);
    ui.setLastGeneratedImage(svgContent, label);

    const stillHasTimeout = svgContent.includes(CAPTURE_TIMEOUT_MARKER);
    if (stillHasTimeout) {
      logger.log(`WARN ${label}  (saved but still contains Capture timeout)`);
      logger.log("");
      return { id: label, status: "warning", reason: "still-has-capture-timeout" };
    }

    logger.log(`OK   ${label}`);
    logger.log("");
    return { id: label, status: "written", reason: decision.reason };
  } catch (error) {
    const fallback = buildFallbackSvg(`${CAPTURE_TIMEOUT_MARKER}: ${error.message}`);
    await writePreview(targetDirHandle, fallback);
    ui.setLastGeneratedImage(fallback, label);
    logger.log(`FAIL ${label}  (${error.message})`);
    logger.log("");
    return { id: label, status: "failed", reason: error.message };
  }
}

function parseInputList(text) {
  const lines = text
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(Boolean);

  const unique = [];
  const seen = new Set();

  for (const line of lines) {
    const key = line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(line);
    }
  }

  return unique;
}

function printSummary(results) {
  const skipped = results.filter(x => x.status === "skipped");
  const written = results.filter(x => x.status === "written");
  const warnings = results.filter(x => x.status === "warning");
  const failed = results.filter(x => x.status === "failed");

  logger.log("===== SUMMARY =====");
  logger.log(`Written: ${written.length}`);
  if (written.length) {
    logger.log(written.map(x => x.id).join(","));
  }

  logger.log(`Warnings: ${warnings.length}`);
  if (warnings.length) {
    logger.log(warnings.map(x => `${x.id}(${x.reason})`).join(","));
  }

  logger.log(`Failed: ${failed.length}`);
  if (failed.length) {
    logger.log(failed.map(x => `${x.id}(${x.reason})`).join(","));
  }

  const groupedSkips = {};
  for (const item of skipped) {
    groupedSkips[item.reason] = groupedSkips[item.reason] || [];
    groupedSkips[item.reason].push(item.id);
  }

  const reasons = Object.keys(groupedSkips);
  logger.log(`Skipped: ${skipped.length}`);
  for (const reason of reasons) {
    logger.log(`Skipped (${reason}):`);
    logger.log(groupedSkips[reason].join(","));
  }

  logger.log("===================");
}

class PreviewGeneratorV2App {
  hasRequiredGenerateFields() {
    return Boolean(repoDirHandle)
      && parseInputList(ui.pathsOrIds.getValue()).length > 0
      && ui.targetSource.hasBaseUrl()
      && ui.assetFolder.hasValue()
      && ui.targetSource.hasSelection()
      && ui.captureMode.hasSelection();
  }

  syncGeneratePreviewButton() {
    ui.syncGeneratePreviewButton(isGenerating, this.hasRequiredGenerateFields());
  }

  async handlePickRepo() {
    try {
      repoDirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
      repoDisplayName = PreviewGeneratorV2RepoAccess.getRepoDestinationDisplayName(repoDirHandle);

      ui.setRepoDestinationDisplayName(repoDisplayName);
      logger.clearStatus();

      await updatePathPreviewLabels();
      this.syncGeneratePreviewButton();
      logger.log(`Repo selected: ${repoDisplayName}`);
    } catch (error) {
      this.syncGeneratePreviewButton();
      logger.log(`Repo folder selection canceled or failed: ${error.message}`);
    }
  }

  async handleExecute() {
    if (!this.hasRequiredGenerateFields()) {
      this.syncGeneratePreviewButton();
      logger.log("Provide repo destination, base URL, asset folder, and at least one path or ID before generating.");
      return;
    }

    if (!repoDirHandle) {
      logger.log("Pick the repo folder first.");
      return;
    }

    const lines = parseInputList(ui.pathsOrIds.getValue());
    if (!lines.length) {
      logger.log("Paste at least one path or ID.");
      return;
    }

    const baseUrl = ui.targetSource.getBaseUrl();
    const waitMs = ui.renderControls.getWaitMs();
    const targetType = ui.getSelectedTargetType();

    stopRequested = false;
    isGenerating = true;
    this.syncGeneratePreviewButton();
    ui.setStopDisabled(false);
    logger.log("");
    logger.log("Starting execution...");
    logger.log(`Target type: ${targetType}`);
    logger.log(`Base URL: ${baseUrl}`);
    logger.log(`Wait: ${waitMs}ms`);
    logger.log(`Repo selected: ${repoDisplayName || "not selected"}`);
    logger.log(`Asset folder: ${getAssetFolderDisplayPath()}`);
    logger.log(`Capture mode: ${ui.getCaptureModeLabel()}`);
    logger.log(`Force rewrite: ${ui.renderControls.isForceRewrite()}`);
    logger.log("");

    const results = [];

    try {
      for (const line of lines) {
        if (stopRequested) {
          logger.log("Stop requested. Ending run.");
          break;
        }

        try {
          const entries = await resolveEntries(line);
          if (entries.length > 1) {
            logger.log(`Resolved ${entries.length} samples from ${line}.`);
          }

          for (const entry of entries) {
            if (stopRequested) {
              logger.log("Stop requested. Ending run.");
              break;
            }

            const result = await processOne(entry, baseUrl, waitMs);
            results.push(result);
          }
        } catch (error) {
          logger.log(`FAIL INPUT  ${line}  (${error.message})`);
          logger.log("");
          results.push({ id: line, status: "failed", reason: error.message });
        }
      }

      printSummary(results);
    } catch (error) {
      logger.log(`Unexpected error: ${error.message}`);
    } finally {
      isGenerating = false;
      this.syncGeneratePreviewButton();
      ui.setStopDisabled(true);
      logger.log("Done.");
    }
  }

  handleClearLog() {
    logger.clear();
  }

  handleStop() {
    stopRequested = true;
    logger.log("Stop requested. Will stop after current item.");
  }

  bindEvents() {
    ui.repoDestination.onPickRepo(() => {
      void this.handlePickRepo();
    });

    ui.generatePreview.onGeneratePreview(() => {
      void this.handleExecute();
    });

    ui.statusLog.onClear(() => {
      this.handleClearLog();
    });

    ui.generatePreview.onStop(() => {
      this.handleStop();
    });

    ui.captureMode.onChange(() => {
      logger.log(`Capture mode: ${ui.getCaptureModeLabel()}`);
      this.syncGeneratePreviewButton();
    });

    ui.targetSource.onBaseUrlInput(() => {
      this.syncGeneratePreviewButton();
    });

    ui.renderControls.onWaitInput(() => {
      this.syncGeneratePreviewButton();
    });

    ui.assetFolder.onInput(() => {
      updatePathPreviewLabels();
      this.syncGeneratePreviewButton();
    });

    ui.pathsOrIds.onInput(() => {
      updatePathPreviewLabels();
      this.syncGeneratePreviewButton();
    });

    ui.targetSource.onTargetChange(() => {
      updatePathPreviewLabels();
      this.syncGeneratePreviewButton();
    });
  }

  init() {
    if (isRuntimeMode) {
      initializeRuntimeCaptureMode();
      return;
    }

    this.bindEvents();
    updatePathPreviewLabels();
    this.syncGeneratePreviewButton();
  }
}

export { PreviewGeneratorV2App };
