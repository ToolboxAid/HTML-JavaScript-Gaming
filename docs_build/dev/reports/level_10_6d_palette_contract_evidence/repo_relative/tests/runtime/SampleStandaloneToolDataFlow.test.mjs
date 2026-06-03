import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const tmpRoot = path.join(repoRoot, "tmp");
const resultsPath = path.join(tmpRoot, "sample-standalone-tool-data-flow-results.json");
const isolatedNodeModulesRoot = path.join(tmpRoot, "node_modules");
const isolatedPackageJsonPath = path.join(tmpRoot, "package.json");
const browserProfileDir = path.join(tmpRoot, "sample-standalone-browser");

const metadataPath = path.join(repoRoot, "samples", "metadata", "samples.index.metadata.json");
const DEBUG_PORT = 9226;

let WebSocketCtor = null;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function ensureIsolatedWsDependency() {
  ensureDir(tmpRoot);

  if (!fs.existsSync(isolatedPackageJsonPath)) {
    fs.writeFileSync(isolatedPackageJsonPath, JSON.stringify({ private: true }, null, 2) + "\n");
  }

  const wsWrapperPath = path.join(isolatedNodeModulesRoot, "ws", "wrapper.mjs");
  if (!fs.existsSync(wsWrapperPath)) {
    execFileSync("npm", ["install", "--prefix", tmpRoot, "ws"], {
      cwd: repoRoot,
      stdio: "inherit",
      shell: process.platform === "win32"
    });
  }

  const wsModule = await import(pathToFileURL(wsWrapperPath).href);
  WebSocketCtor = wsModule.WebSocket;
  assert.ok(WebSocketCtor, "Failed to load WebSocket from <project>/tmp/node_modules/ws");
}

function createStaticServer(rootDir) {
  return http.createServer((request, response) => {
    try {
      const requestPath = request.url ? request.url.split("?")[0] : "/";
      const decodedPath = decodeURIComponent(requestPath || "/");
      const normalizedPath = decodedPath === "/" ? "/index.html" : decodedPath;
      const absolutePath = path.resolve(rootDir, "." + normalizedPath);

      if (!absolutePath.startsWith(rootDir)) {
        response.statusCode = 403;
        response.end("Forbidden");
        return;
      }

      let stat;
      try {
        stat = fs.statSync(absolutePath);
      } catch {
        response.statusCode = 404;
        response.end("Not Found");
        return;
      }

      let filePath = absolutePath;
      if (stat.isDirectory()) {
        filePath = path.join(absolutePath, "index.html");
      }

      if (!fs.existsSync(filePath)) {
        response.statusCode = 404;
        response.end("Not Found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = {
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".mjs": "application/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".ico": "image/x-icon",
        ".woff": "font/woff",
        ".woff2": "font/woff2"
      }[ext] || "application/octet-stream";

      response.statusCode = 200;
      response.setHeader("Content-Type", contentType);
      fs.createReadStream(filePath).pipe(response);
    } catch {
      response.statusCode = 500;
      response.end("Server Error");
    }
  });
}

function launchServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = createStaticServer(rootDir);
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to resolve local server address."));
        return;
      }
      resolve({ server, port: address.port });
    });
  });
}

function closeServer(server) {
  return new Promise((resolve) => server.close(() => resolve()));
}

function resolveBrowserExecutable() {
  const candidates = [
    process.env.CHROMIUM_PATH || "",
    process.env.CHROME_PATH || "",
    process.env.EDGE_PATH || "",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Timeout fetching ${url}`));
    });
  });
}

class CdpConnection {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.ws = null;
  }

  async connect() {
    this.ws = new WebSocketCtor(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.once("open", resolve);
      this.ws.once("error", reject);
    });

    this.ws.on("message", (data) => {
      const message = JSON.parse(String(data));
      if (!message.id) {
        return;
      }
      const pending = this.pending.get(message.id);
      if (!pending) {
        return;
      }
      this.pending.delete(message.id);
      if (message.error) {
        pending.reject(new Error(message.error.message || "CDP command failed"));
      } else {
        pending.resolve(message.result || {});
      }
    });
  }

  async send(method, params = {}, sessionId = undefined) {
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    this.ws.send(JSON.stringify(payload));
    return await new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  async close() {
    try {
      this.ws?.close();
    } catch {
      // no-op
    }
  }
}

async function startBrowser(executable) {
  try {
    fs.rmSync(browserProfileDir, { recursive: true, force: true });
  } catch {
    // no-op
  }
  ensureDir(browserProfileDir);

  const args = [
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${browserProfileDir}`,
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-sync",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1600,900",
    "about:blank"
  ];

  const child = spawn(executable, args, { stdio: ["ignore", "pipe", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += String(chunk);
  });

  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const version = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`, 1000);
      return { child, version };
    } catch {
      await wait(100);
    }
  }

  try {
    child.kill("SIGKILL");
  } catch {
    // no-op
  }
  throw new Error(`Failed to start debug browser. ${stderr.trim()}`);
}

async function stopBrowser(browser) {
  try {
    browser.child.kill("SIGKILL");
  } catch {
    // no-op
  }
}

async function createPageController(browserWsUrl) {
  const cdp = new CdpConnection(browserWsUrl);
  await cdp.connect();

  const created = await cdp.send("Target.createTarget", { url: "about:blank" });
  const targetId = created.targetId;

  const attached = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const sessionId = attached.sessionId;

  async function send(method, params = {}) {
    return await cdp.send(method, params, sessionId);
  }

  async function initialize() {
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");
  }

  async function navigate(url) {
    await send("Page.navigate", { url });
  }

  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (result.exceptionDetails) {
      const details = result.exceptionDetails;
      throw new Error(details.text || details.exception?.description || "Runtime.evaluate failed");
    }
    return result.result?.value;
  }

  async function close() {
    try {
      await cdp.send("Target.closeTarget", { targetId });
    } catch {
      // no-op
    }
    await cdp.close();
  }

  return {
    initialize,
    navigate,
    evaluate,
    close
  };
}

function toPosixPath(filePath) {
  return filePath.replaceAll("\\", "/");
}

function walkJsonFiles(rootDir) {
  const files = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function resolveSchemaPath(filePath, schemaRef) {
  if (typeof schemaRef !== "string" || !schemaRef.trim()) {
    return "";
  }
  const normalized = schemaRef.trim().replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }
  if (normalized.startsWith("/")) {
    return path.join(repoRoot, normalized.slice(1));
  }
  return path.resolve(path.dirname(filePath), normalized);
}

function extractToolIdFromSampleFileName(filePath) {
  const fileName = path.basename(filePath);
  const dotted = fileName.match(/^sample\.(\d{4})\.([a-z0-9-]+)\.json$/i);
  if (dotted) {
    return { sampleId: dotted[1], toolId: dotted[2] };
  }
  const dashed = fileName.match(/^sample-(\d{4})-([a-z0-9-]+)\.json$/i);
  if (dashed) {
    return { sampleId: dashed[1], toolId: dashed[2] };
  }
  return null;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function buildSchemaAudit(roundtripRows) {
  const sampleRoot = path.join(repoRoot, "samples");
  const jsonFiles = walkJsonFiles(sampleRoot);
  const toolPayloadFiles = [...new Set(
    (Array.isArray(roundtripRows) ? roundtripRows : [])
      .map((row) => path.join(repoRoot, String(row.presetPath || "").replace(/^\//, "")))
      .filter((filePath) => filePath.toLowerCase().endsWith(".json"))
      .filter((filePath) => fs.existsSync(filePath))
  )];
  const paletteFiles = jsonFiles.filter((filePath) => /^sample\.\d{4}\.palette\.json$/i.test(path.basename(filePath)));

  const schemaFailures = [];
  const contractFailures = [];

  for (const filePath of toolPayloadFiles) {
    const parsed = readJson(filePath);
    const rel = toPosixPath(path.relative(repoRoot, filePath));
    const schemaRef = parsed.$schema;
    const schemaPath = resolveSchemaPath(filePath, schemaRef);
    if (!schemaRef || typeof schemaRef !== "string") {
      schemaFailures.push(`${rel}: missing $schema.`);
    } else if (!/^https?:\/\//i.test(schemaPath) && !fs.existsSync(schemaPath)) {
      schemaFailures.push(`${rel}: unresolved $schema -> ${schemaRef}.`);
    }

    const fileInfo = extractToolIdFromSampleFileName(filePath);
    if (!fileInfo) {
      contractFailures.push(`${rel}: filename does not match sample payload pattern.`);
      continue;
    }

    if (parsed.tool !== fileInfo.toolId) {
      contractFailures.push(`${rel}: tool field must match filename tool id (${fileInfo.toolId}).`);
    }
    if (typeof parsed.version !== "string" || !parsed.version.trim()) {
      contractFailures.push(`${rel}: version must be a non-empty string.`);
    }
    const hasConfigObject = parsed.config && typeof parsed.config === "object" && !Array.isArray(parsed.config);
    const hasPayloadObject = parsed.payload && typeof parsed.payload === "object" && !Array.isArray(parsed.payload);
    const hasToolStateObject = parsed.toolState && typeof parsed.toolState === "object" && !Array.isArray(parsed.toolState);
    if (!hasConfigObject && !hasPayloadObject && !hasToolStateObject) {
      contractFailures.push(`${rel}: payload container must exist (config, payload, or toolState).`);
    }

    const wrapperFields = ["documentKind", "id", "type"].filter((key) => Object.prototype.hasOwnProperty.call(parsed, key));
    if (wrapperFields.length > 0) {
      contractFailures.push(`${rel}: wrapper fields not allowed (${wrapperFields.join(", ")}).`);
    }
  }

  for (const filePath of paletteFiles) {
    const parsed = readJson(filePath);
    const rel = toPosixPath(path.relative(repoRoot, filePath));
    const schemaRef = parsed.$schema;
    const schemaPath = resolveSchemaPath(filePath, schemaRef);
    if (!schemaRef || typeof schemaRef !== "string") {
      schemaFailures.push(`${rel}: missing $schema.`);
    } else if (!/^https?:\/\//i.test(schemaPath) && !fs.existsSync(schemaPath)) {
      schemaFailures.push(`${rel}: unresolved $schema -> ${schemaRef}.`);
    }

    if (parsed.schema !== "html-js-gaming.palette") {
      contractFailures.push(`${rel}: schema must equal html-js-gaming.palette.`);
    }
    if (!Number.isInteger(parsed.version) || parsed.version < 1) {
      contractFailures.push(`${rel}: version must be an integer >= 1.`);
    }
    if (typeof parsed.name !== "string" || !parsed.name.trim()) {
      contractFailures.push(`${rel}: name must be a non-empty string.`);
    }
    if (!Array.isArray(parsed.swatches) || parsed.swatches.length === 0) {
      contractFailures.push(`${rel}: swatches must contain at least one entry.`);
      continue;
    }
    parsed.swatches.forEach((swatch, index) => {
      const symbol = typeof swatch?.symbol === "string" ? swatch.symbol : "";
      const hex = typeof swatch?.hex === "string" ? swatch.hex : "";
      const name = typeof swatch?.name === "string" ? swatch.name : "";
      if (symbol.length !== 1) {
        contractFailures.push(`${rel}: swatches[${index}].symbol must be a single character.`);
      }
      if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hex)) {
        contractFailures.push(`${rel}: swatches[${index}].hex must be #RRGGBB or #RRGGBBAA.`);
      }
      if (!name.trim()) {
        contractFailures.push(`${rel}: swatches[${index}].name must be non-empty.`);
      }
    });
  }

  return {
    toolPayloadFiles,
    paletteFiles,
    schemaFailures,
    contractFailures
  };
}

function readMetadataRoundtripRows() {
  const metadata = readJson(metadataPath);
  const samples = Array.isArray(metadata?.samples) ? metadata.samples : [];
  const rows = [];
  for (const sample of samples) {
    const sampleId = typeof sample?.id === "string" ? sample.id.trim() : "";
    const sampleTitle = typeof sample?.title === "string" ? sample.title : "";
    if (!sampleId) {
      continue;
    }
    const presets = Array.isArray(sample?.roundtripToolPresets) ? sample.roundtripToolPresets : [];
    for (const preset of presets) {
      const toolId = typeof preset?.toolId === "string" ? preset.toolId.trim() : "";
      const presetPath = typeof preset?.presetPath === "string" ? preset.presetPath.trim() : "";
      if (!toolId || !presetPath) {
        continue;
      }
      rows.push({ sampleId, sampleTitle, toolId, presetPath });
    }
  }
  return rows;
}

async function loadToolRegistryMap() {
  const modulePath = pathToFileURL(path.join(repoRoot, "tools", "toolRegistry.js")).href;
  const registryModule = await import(modulePath);
  const registry = Array.isArray(registryModule?.TOOL_REGISTRY) ? registryModule.TOOL_REGISTRY : [];
  return new Map(registry.map((tool) => [tool.id, tool]));
}

function buildStandaloneToolUrl(baseUrl, toolEntryPoint, sampleRow) {
  const hrefPath = `/tools/${encodeURI(toolEntryPoint)}`;
  const url = new URL(hrefPath, `${baseUrl}/`);
  url.searchParams.set("sampleId", sampleRow.sampleId);
  url.searchParams.set("sampleTitle", sampleRow.sampleTitle || `Sample ${sampleRow.sampleId}`);
  url.searchParams.set("samplePresetPath", sampleRow.presetPath);
  return url.toString();
}

async function waitForPresetSignal(page, timeoutMs = 8000) {
  const started = Date.now();
  while ((Date.now() - started) < timeoutMs) {
    const snapshot = await page.evaluate(`(() => {
      const text = String(document.body?.innerText || "");
      return {
        loaded: /Loaded preset/i.test(text),
        failed: /Preset load failed/i.test(text),
        missingSamplePresetPath: /samplePresetPath is missing/i.test(text),
        text
      };
    })()`);
    if (snapshot.loaded || snapshot.failed || snapshot.missingSamplePresetPath) {
      return snapshot;
    }
    await wait(150);
  }
  return await page.evaluate(`(() => ({
    loaded: false,
    failed: false,
    missingSamplePresetPath: false,
    text: String(document.body?.innerText || "")
  }))()`);
}

async function verifyGenericStandaloneRoundtrip(page, url) {
  await page.navigate(url);
  await wait(300);
  const signal = await waitForPresetSignal(page, 9000);
  return {
    hasLoadSignal: signal.loaded,
    hasFailureSignal: signal.failed || signal.missingSamplePresetPath,
    text: signal.text
  };
}

function findSampleRow(rows, sampleId, toolId) {
  return rows.find((row) => row.sampleId === sampleId && row.toolId === toolId) || null;
}

function findPresetFilePathForSample(sampleId, toolId) {
  const phase = sampleId.slice(0, 2);
  const folder = path.join(repoRoot, "samples", `phase-${phase}`, sampleId);
  const dotted = path.join(folder, `sample.${sampleId}.${toolId}.json`);
  if (fs.existsSync(dotted)) {
    return dotted;
  }
  const dashed = path.join(folder, `sample-${sampleId}-${toolId}.json`);
  if (fs.existsSync(dashed)) {
    return dashed;
  }
  return "";
}

async function runTargetedAssetBrowserAssertion(page, url, expectedImportName) {
  await page.navigate(url);
  let status = null;
  const started = Date.now();
  while ((Date.now() - started) < 9000) {
    status = await page.evaluate(`(() => {
      const statusText = String(document.getElementById("importStatusText")?.textContent || "").trim();
      const importName = String(document.getElementById("importNameInput")?.value || "").trim();
      const selectedCategory = String(document.getElementById("importCategorySelect")?.value || "").trim();
      const selectedDestination = String(document.getElementById("importDestinationSelect")?.value || "").trim();
      return { statusText, importName, selectedCategory, selectedDestination };
    })()`);
    if (/Loaded preset/i.test(status.statusText) || /Preset load failed/i.test(status.statusText)) {
      break;
    }
    await wait(150);
  }

  assert.match(status.statusText, /Loaded preset/i, "Asset Browser did not report preset load.");
  assert.doesNotMatch(status.statusText, /Preset load failed/i, "Asset Browser reported preset load failure.");
  assert.equal(status.importName, expectedImportName, "Asset Browser importName did not bind from preset payload.");
  assert.ok(status.selectedCategory, "Asset Browser selected category is empty.");
  assert.ok(status.selectedDestination, "Asset Browser selected destination is empty.");
  return status;
}

async function runTargetedAssetPipelineAssertion(page, url, expectedGameId) {
  await page.navigate(url);
  let status = null;
  const started = Date.now();
  while ((Date.now() - started) < 9000) {
    status = await page.evaluate(`(() => {
      const statusText = String(document.getElementById("assetPipelineStatus")?.textContent || "").trim();
      const inputText = String(document.getElementById("assetPipelineInput")?.value || "").trim();
      let parsed = null;
      try {
        parsed = inputText ? JSON.parse(inputText) : null;
      } catch {
        parsed = null;
      }
      const domainInputs = parsed && parsed.domainInputs && typeof parsed.domainInputs === "object" ? parsed.domainInputs : {};
      const domainRecordCount = Object.values(domainInputs).reduce((count, entry) => count + (Array.isArray(entry) ? entry.length : 0), 0);
      return {
        statusText,
        parsedGameId: typeof parsed?.gameId === "string" ? parsed.gameId : "",
        domainRecordCount
      };
    })()`);
    if (/Loaded preset/i.test(status.statusText) || /Preset load failed/i.test(status.statusText)) {
      break;
    }
    await wait(150);
  }

  assert.match(status.statusText, /Loaded preset/i, "Asset Pipeline Tool did not report preset load.");
  assert.doesNotMatch(status.statusText, /Preset load failed/i, "Asset Pipeline Tool reported preset load failure.");
  assert.equal(status.parsedGameId, expectedGameId, "Asset Pipeline Tool gameId did not bind from preset payload.");
  assert.ok(status.domainRecordCount > 0, "Asset Pipeline Tool pipeline input is empty after preset load.");
  return status;
}

async function runTargetedPaletteBrowserAssertion(page, url, expectedPaletteName, expectedSwatchCount) {
  await page.navigate(url);
  let status = null;
  const started = Date.now();
  while ((Date.now() - started) < 9000) {
    status = await page.evaluate(`(() => {
      const selectionText = String(document.getElementById("paletteSelectionText")?.textContent || "").trim();
      const title = String(document.getElementById("paletteTitle")?.textContent || "").trim();
      const summary = String(document.getElementById("paletteSummaryText")?.textContent || "").trim();
      const swatchCount = document.querySelectorAll("#paletteSwatches [data-swatch-index]").length;
      return { selectionText, title, summary, swatchCount };
    })()`);
    if (/Loaded preset/i.test(status.selectionText) || /Preset load failed/i.test(status.selectionText)) {
      break;
    }
    await wait(150);
  }

  assert.match(status.selectionText, /Loaded preset/i, "Palette Browser did not report preset load.");
  assert.doesNotMatch(status.selectionText, /Preset load failed/i, "Palette Browser reported preset load failure.");
  assert.equal(status.title, expectedPaletteName, "Palette Browser palette title did not bind from preset payload.");
  assert.equal(status.swatchCount, expectedSwatchCount, "Palette Browser swatch count did not match preset payload.");
  assert.doesNotMatch(status.summary, /0 swatches/i, "Palette Browser shows empty palette summary despite preset payload.");
  return status;
}

function buildTargetedCases(roundtripRows, toolMap) {
  const specs = [
    { sampleId: "0204", toolId: "asset-browser" },
    { sampleId: "1413", toolId: "asset-browser" },
    { sampleId: "1505", toolId: "asset-browser" },
    { sampleId: "0510", toolId: "asset-pipeline-tool" },
    { sampleId: "1413", toolId: "asset-pipeline-tool" },
    { sampleId: "1417", toolId: "asset-pipeline-tool" },
    { sampleId: "0213", toolId: "palette-browser" },
    { sampleId: "0308", toolId: "palette-browser" },
    { sampleId: "0313", toolId: "palette-browser" }
  ];

  return specs.map((spec) => {
    const row = findSampleRow(roundtripRows, spec.sampleId, spec.toolId);
    if (!row) {
      throw new Error(`Missing metadata roundtrip mapping for sample ${spec.sampleId} tool ${spec.toolId}.`);
    }
    const tool = toolMap.get(spec.toolId);
    if (!tool || !tool.entryPoint) {
      throw new Error(`Tool registry entry missing for tool ${spec.toolId}.`);
    }
    const presetFilePath = findPresetFilePathForSample(spec.sampleId, spec.toolId);
    if (!presetFilePath) {
      throw new Error(`Preset payload file missing for sample ${spec.sampleId} tool ${spec.toolId}.`);
    }
    const presetPayload = readJson(presetFilePath);

    return {
      ...spec,
      row,
      tool,
      presetPayload,
      presetFilePath
    };
  });
}

function buildGenericFailureCloseoutCases(roundtripRows, toolMap) {
  const specs = [
    { sampleId: "0201", toolId: "3d-camera-path-editor" },
    { sampleId: "0202", toolId: "3d-camera-path-editor" },
    { sampleId: "0220", toolId: "3d-camera-path-editor" },
    { sampleId: "0204", toolId: "3d-asset-viewer" },
    { sampleId: "1208", toolId: "3d-asset-viewer" },
    { sampleId: "1413", toolId: "3d-asset-viewer" },
    { sampleId: "0210", toolId: "physics-sandbox" },
    { sampleId: "0303", toolId: "physics-sandbox" },
    { sampleId: "1606", toolId: "physics-sandbox" },
    { sampleId: "0221", toolId: "tile-model-converter" },
    { sampleId: "0305", toolId: "tile-model-converter" },
    { sampleId: "1209", toolId: "tile-model-converter" },
    { sampleId: "0221", toolId: "3d-json-payload-normalizer" },
    { sampleId: "0305", toolId: "3d-json-payload-normalizer" },
    { sampleId: "1208", toolId: "3d-json-payload-normalizer" },
    { sampleId: "0306", toolId: "parallax-editor" },
    { sampleId: "1204", toolId: "parallax-editor" },
    { sampleId: "1205", toolId: "parallax-editor" },
    { sampleId: "1208", toolId: "parallax-editor" },
    { sampleId: "0512", toolId: "performance-profiler" },
    { sampleId: "1319", toolId: "performance-profiler" },
    { sampleId: "1407", toolId: "performance-profiler" },
    { sampleId: "0708", toolId: "replay-visualizer" },
    { sampleId: "1315", toolId: "replay-visualizer" },
    { sampleId: "1406", toolId: "replay-visualizer" }
  ];

  return specs.map((spec) => {
    const row = findSampleRow(roundtripRows, spec.sampleId, spec.toolId);
    if (!row) {
      throw new Error(`Missing metadata roundtrip mapping for sample ${spec.sampleId} tool ${spec.toolId}.`);
    }
    const tool = toolMap.get(spec.toolId);
    if (!tool || !tool.entryPoint) {
      throw new Error(`Tool registry entry missing for tool ${spec.toolId}.`);
    }
    const presetFilePath = findPresetFilePathForSample(spec.sampleId, spec.toolId);
    if (!presetFilePath) {
      throw new Error(`Preset payload file missing for sample ${spec.sampleId} tool ${spec.toolId}.`);
    }
    const presetPayload = readJson(presetFilePath);

    return {
      ...spec,
      row,
      tool,
      presetPayload,
      presetFilePath
    };
  });
}

async function runCameraPathContractAssertion(page, url, expectedWaypointCount) {
  await page.navigate(url);
  let status = null;
  const started = Date.now();
  while ((Date.now() - started) < 9000) {
    status = await page.evaluate(`(() => {
      const statusText = String(document.getElementById("cameraPathStatus")?.textContent || "").trim();
      const inputText = String(document.getElementById("cameraPathInput")?.value || "").trim();
      let parsed = null;
      try {
        parsed = inputText ? JSON.parse(inputText) : null;
      } catch {
        parsed = null;
      }
      const waypointCount = Array.isArray(parsed?.waypoints) ? parsed.waypoints.length : 0;
      return { statusText, waypointCount };
    })()`);
    if (/Preset load failed/i.test(status.statusText) || status.waypointCount === expectedWaypointCount) {
      break;
    }
    await wait(150);
  }
  assert.doesNotMatch(status.statusText, /Preset load failed/i, "3D Camera Path Editor reported preset load failure.");
  assert.ok(status.waypointCount > 0, "3D Camera Path Editor did not load waypoint data.");
  assert.equal(status.waypointCount, expectedWaypointCount, "3D Camera Path Editor waypoint count mismatch.");
  return status;
}

async function runAssetViewerContractAssertion(page, url, expectedVertexCount) {
  await page.navigate(url);
  let status = null;
  const started = Date.now();
  while ((Date.now() - started) < 9000) {
    status = await page.evaluate(`(() => {
      const statusText = String(document.getElementById("asset3dStatus")?.textContent || "").trim();
      const inputText = String(document.getElementById("asset3dInput")?.value || "").trim();
      let parsed = null;
      try {
        parsed = inputText ? JSON.parse(inputText) : null;
      } catch {
        parsed = null;
      }
      const vertexCount = Array.isArray(parsed?.vertices) ? parsed.vertices.length : 0;
      return { statusText, vertexCount };
    })()`);
    if (/Preset load failed/i.test(status.statusText) || status.vertexCount === expectedVertexCount) {
      break;
    }
    await wait(150);
  }
  assert.doesNotMatch(status.statusText, /Preset load failed/i, "3D Asset Viewer reported preset load failure.");
  assert.ok(status.vertexCount > 0, "3D Asset Viewer did not load vertex data.");
  assert.equal(status.vertexCount, expectedVertexCount, "3D Asset Viewer vertex count mismatch.");
  return status;
}

async function runPhysicsSandboxContractAssertion(page, url, expectedBody) {
  await page.navigate(url);
  let status = null;
  const started = Date.now();
  while ((Date.now() - started) < 9000) {
    status = await page.evaluate(`(() => {
      const statusText = String(document.getElementById("physicsSandboxStatus")?.textContent || "").trim();
      const inputText = String(document.getElementById("physicsBodyInput")?.value || "").trim();
      let parsed = null;
      try {
        parsed = inputText ? JSON.parse(inputText) : null;
      } catch {
        parsed = null;
      }
      const keys = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? Object.keys(parsed) : [];
      return { statusText, parsedBody: parsed, keyCount: keys.length };
    })()`);
    if (/Preset load failed/i.test(status.statusText) || status.keyCount > 0) {
      break;
    }
    await wait(150);
  }
  assert.doesNotMatch(status.statusText, /Preset load failed/i, "Physics Sandbox reported preset load failure.");
  assert.ok(status.keyCount > 0, "Physics Sandbox did not load physics body input.");
  assert.equal(
    JSON.stringify(status.parsedBody),
    JSON.stringify(expectedBody),
    "Physics Sandbox input body does not match sample preset payload."
  );
  return status;
}

async function runTileModelConverterContractAssertion(page, url, expectedCandidate, expectedConversion) {
  await page.navigate(url);
  let status = null;
  const started = Date.now();
  while ((Date.now() - started) < 9000) {
    status = await page.evaluate(`(() => {
      const statusText = String(document.getElementById("converterStatus")?.textContent || "").trim();
      const inputText = String(document.getElementById("converterInput")?.value || "").trim();
      let parsed = null;
      try {
        parsed = inputText ? JSON.parse(inputText) : null;
      } catch {
        parsed = null;
      }
      const candidateKeys = parsed?.candidate && typeof parsed.candidate === "object" ? Object.keys(parsed.candidate) : [];
      const conversionKeys = parsed?.conversion && typeof parsed.conversion === "object" ? Object.keys(parsed.conversion) : [];
      return {
        statusText,
        parsedCandidate: parsed?.candidate || null,
        parsedConversion: parsed?.conversion || null,
        candidateCount: candidateKeys.length,
        conversionCount: conversionKeys.length
      };
    })()`);
    if (
      /Preset load failed/i.test(status.statusText)
      || (status.candidateCount > 0 && status.conversionCount > 0)
    ) {
      break;
    }
    await wait(150);
  }
  assert.doesNotMatch(status.statusText, /Preset load failed/i, "Tile Model Converter reported preset load failure.");
  assert.ok(status.candidateCount > 0, "Tile Model Converter candidate payload is empty.");
  assert.ok(status.conversionCount > 0, "Tile Model Converter conversion payload is empty.");
  assert.equal(
    JSON.stringify(status.parsedCandidate),
    JSON.stringify(expectedCandidate),
    "Tile Model Converter candidate payload mismatch."
  );
  assert.equal(
    JSON.stringify(status.parsedConversion),
    JSON.stringify(expectedConversion),
    "Tile Model Converter conversion payload mismatch."
  );
  return status;
}

async function runJsonNormalizerContractAssertion(page, url, expectedPointCount, expectedSegmentCount) {
  await page.navigate(url);
  let status = null;
  const started = Date.now();
  while ((Date.now() - started) < 9000) {
    status = await page.evaluate(`(() => {
      const statusText = String(document.getElementById("map3dStatus")?.textContent || "").trim();
      const inputText = String(document.getElementById("map3dInput")?.value || "").trim();
      let parsed = null;
      try {
        parsed = inputText ? JSON.parse(inputText) : null;
      } catch {
        parsed = null;
      }
      const pointCount = Array.isArray(parsed?.points) ? parsed.points.length : 0;
      const segmentCount = Array.isArray(parsed?.segments) ? parsed.segments.length : 0;
      return { statusText, pointCount, segmentCount };
    })()`);
    if (
      /Preset load failed/i.test(status.statusText)
      || (status.pointCount === expectedPointCount && status.segmentCount === expectedSegmentCount)
    ) {
      break;
    }
    await wait(150);
  }
  assert.doesNotMatch(status.statusText, /Preset load failed/i, "3D JSON Payload Normalizer reported preset load failure.");
  assert.ok(status.pointCount > 0, "3D JSON Payload Normalizer did not load point data.");
  assert.equal(status.pointCount, expectedPointCount, "3D JSON Payload Normalizer point count mismatch.");
  assert.equal(status.segmentCount, expectedSegmentCount, "3D JSON Payload Normalizer segment count mismatch.");
  return status;
}

async function runParallaxEditorContractAssertion(page, url, expectedLayerCount) {
  await page.navigate(url);
  let status = null;
  const started = Date.now();
  while ((Date.now() - started) < 11000) {
    status = await page.evaluate(`(() => {
      const statusText = String(document.getElementById("statusText")?.textContent || "").trim();
      const layerCount = document.querySelectorAll("#layerList li").length;
      return { statusText, layerCount };
    })()`);
    if (/Preset load failed/i.test(status.statusText) || status.layerCount === expectedLayerCount) {
      break;
    }
    await wait(150);
  }
  assert.doesNotMatch(status.statusText, /Preset load failed/i, "Parallax Scene Studio reported preset load failure.");
  assert.ok(status.layerCount > 0, "Parallax Scene Studio did not load parallax layers.");
  assert.equal(status.layerCount, expectedLayerCount, "Parallax Scene Studio layer count mismatch.");
  return status;
}

async function runPerformanceProfilerContractAssertion(page, url, expectedSettings) {
  await page.navigate(url);
  let status = null;
  const started = Date.now();
  while ((Date.now() - started) < 9000) {
    status = await page.evaluate(`(() => {
      const statusText = String(document.getElementById("profilerStatusText")?.textContent || "").trim();
      const workloadIterations = Number(document.getElementById("workloadIterationsInput")?.value || 0);
      const workSize = Number(document.getElementById("workSizeInput")?.value || 0);
      const frameSamples = Number(document.getElementById("frameSamplesInput")?.value || 0);
      return { statusText, workloadIterations, workSize, frameSamples };
    })()`);
    if (
      /Preset load failed/i.test(status.statusText)
      || (status.workloadIterations === expectedSettings.workloadIterations
        && status.workSize === expectedSettings.workSize
        && status.frameSamples === expectedSettings.frameSamples)
    ) {
      break;
    }
    await wait(150);
  }
  assert.doesNotMatch(status.statusText, /Preset load failed/i, "Performance Profiler reported preset load failure.");
  assert.equal(status.workloadIterations, expectedSettings.workloadIterations, "Performance Profiler workloadIterations mismatch.");
  assert.equal(status.workSize, expectedSettings.workSize, "Performance Profiler workSize mismatch.");
  assert.equal(status.frameSamples, expectedSettings.frameSamples, "Performance Profiler frameSamples mismatch.");
  return status;
}

async function runReplayVisualizerContractAssertion(page, url, expectedEventCount) {
  await page.navigate(url);
  let status = null;
  const started = Date.now();
  while ((Date.now() - started) < 9000) {
    status = await page.evaluate(`(() => {
      const statusText = String(document.getElementById("replayStatusText")?.textContent || "").trim();
      const eventCount = document.querySelectorAll("#replayEventList [data-replay-index]").length;
      return { statusText, eventCount };
    })()`);
    if (/Preset load failed/i.test(status.statusText) || status.eventCount === expectedEventCount) {
      break;
    }
    await wait(150);
  }
  assert.doesNotMatch(status.statusText, /Preset load failed/i, "Replay Visualizer reported preset load failure.");
  assert.ok(status.eventCount > 0, "Replay Visualizer did not load replay events.");
  assert.equal(status.eventCount, expectedEventCount, "Replay Visualizer event count mismatch.");
  return status;
}

export async function run() {
  ensureDir(tmpRoot);
  await ensureIsolatedWsDependency();

  const executable = resolveBrowserExecutable();
  assert.ok(executable, "No supported Chromium/Chrome/Edge executable found.");

  const roundtripRows = readMetadataRoundtripRows();
  assert.ok(roundtripRows.length > 0, "No sample roundtrip tool preset rows found in metadata.");

  const schemaAudit = buildSchemaAudit(roundtripRows);
  assert.equal(schemaAudit.schemaFailures.length, 0, `Schema reference failures: ${schemaAudit.schemaFailures.join(" | ")}`);
  assert.equal(schemaAudit.contractFailures.length, 0, `Sample payload contract failures: ${schemaAudit.contractFailures.join(" | ")}`);

  const roundtripPathFailures = [];
  roundtripRows.forEach((row) => {
    const safePath = String(row.presetPath || "");
    const absolute = path.join(repoRoot, safePath.replace(/^\//, ""));
    if (!safePath.startsWith("/samples/") || !fs.existsSync(absolute)) {
      roundtripPathFailures.push(`${row.sampleId}:${row.toolId}:${row.presetPath}`);
    }
  });
  assert.equal(roundtripPathFailures.length, 0, `Roundtrip preset path failures: ${roundtripPathFailures.join(" | ")}`);

  const toolMap = await loadToolRegistryMap();

  const { server, port } = await launchServer(repoRoot);
  const baseUrl = `http://127.0.0.1:${port}`;

  let browser = null;
  let page = null;

  try {
    browser = await startBrowser(executable);
    page = await createPageController(browser.version.webSocketDebuggerUrl);
    await page.initialize();

    const genericFailures = [];
    const genericChecks = [];

    for (const row of roundtripRows) {
      const tool = toolMap.get(row.toolId);
      if (!tool || !tool.entryPoint) {
        genericFailures.push(`${row.sampleId}:${row.toolId}:tool not in registry`);
        continue;
      }
      const url = buildStandaloneToolUrl(baseUrl, tool.entryPoint, row);
      const result = await verifyGenericStandaloneRoundtrip(page, url);
      genericChecks.push({
        sampleId: row.sampleId,
        toolId: row.toolId,
        hasLoadSignal: result.hasLoadSignal,
        hasFailureSignal: result.hasFailureSignal
      });
      if (result.hasFailureSignal) {
        genericFailures.push(`${row.sampleId}:${row.toolId}:preset load failure signal`);
      }
    }

    assert.equal(genericFailures.length, 0, `Standalone generic failure signals detected: ${genericFailures.join(" | ")}`);

    const genericContractCases = buildGenericFailureCloseoutCases(roundtripRows, toolMap);
    const genericContractResults = [];

    for (const testCase of genericContractCases) {
      const url = buildStandaloneToolUrl(baseUrl, testCase.tool.entryPoint, testCase.row);
      if (testCase.toolId === "3d-camera-path-editor") {
        const expectedWaypointCount = Array.isArray(testCase.presetPayload?.config?.cameraPath?.waypoints)
          ? testCase.presetPayload.config.cameraPath.waypoints.length
          : 0;
        assert.ok(expectedWaypointCount > 0, `Missing expected camera waypoints in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        const result = await runCameraPathContractAssertion(page, url, expectedWaypointCount);
        genericContractResults.push({ sampleId: testCase.sampleId, toolId: testCase.toolId, ...result });
        continue;
      }
      if (testCase.toolId === "3d-asset-viewer") {
        const expectedVertexCount = Array.isArray(testCase.presetPayload?.config?.asset3d?.vertices)
          ? testCase.presetPayload.config.asset3d.vertices.length
          : 0;
        assert.ok(expectedVertexCount > 0, `Missing expected asset vertices in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        const result = await runAssetViewerContractAssertion(page, url, expectedVertexCount);
        genericContractResults.push({ sampleId: testCase.sampleId, toolId: testCase.toolId, ...result });
        continue;
      }
      if (testCase.toolId === "physics-sandbox") {
        const expectedBody = testCase.presetPayload?.config?.physicsBody;
        assert.ok(expectedBody && typeof expectedBody === "object" && !Array.isArray(expectedBody), `Missing expected physicsBody in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        const result = await runPhysicsSandboxContractAssertion(page, url, expectedBody);
        genericContractResults.push({ sampleId: testCase.sampleId, toolId: testCase.toolId, ...result });
        continue;
      }
      if (testCase.toolId === "tile-model-converter") {
        const expectedCandidate = testCase.presetPayload?.config?.candidate;
        const expectedConversion = testCase.presetPayload?.config?.conversion;
        assert.ok(expectedCandidate && typeof expectedCandidate === "object", `Missing expected converter candidate in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        assert.ok(expectedConversion && typeof expectedConversion === "object", `Missing expected converter conversion in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        const result = await runTileModelConverterContractAssertion(page, url, expectedCandidate, expectedConversion);
        genericContractResults.push({ sampleId: testCase.sampleId, toolId: testCase.toolId, ...result });
        continue;
      }
      if (testCase.toolId === "3d-json-payload-normalizer") {
        const expectedPointCount = Array.isArray(testCase.presetPayload?.config?.mapPayload?.points)
          ? testCase.presetPayload.config.mapPayload.points.length
          : 0;
        const expectedSegmentCount = Array.isArray(testCase.presetPayload?.config?.mapPayload?.segments)
          ? testCase.presetPayload.config.mapPayload.segments.length
          : 0;
        assert.ok(expectedPointCount > 0, `Missing expected map points in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        const result = await runJsonNormalizerContractAssertion(page, url, expectedPointCount, expectedSegmentCount);
        genericContractResults.push({ sampleId: testCase.sampleId, toolId: testCase.toolId, ...result });
        continue;
      }
      if (testCase.toolId === "parallax-editor") {
        const expectedLayerCount = Array.isArray(testCase.presetPayload?.config?.parallaxDocument?.layers)
          ? testCase.presetPayload.config.parallaxDocument.layers.length
          : 0;
        assert.ok(expectedLayerCount > 0, `Missing expected parallax layers in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        const result = await runParallaxEditorContractAssertion(page, url, expectedLayerCount);
        genericContractResults.push({ sampleId: testCase.sampleId, toolId: testCase.toolId, ...result });
        continue;
      }
      if (testCase.toolId === "performance-profiler") {
        const settings = testCase.presetPayload?.config?.profileSettings;
        assert.ok(settings && typeof settings === "object", `Missing expected profileSettings in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        const expectedSettings = {
          workloadIterations: Number(settings.workloadIterations),
          workSize: Number(settings.workSize),
          frameSamples: Number(settings.frameSamples)
        };
        const result = await runPerformanceProfilerContractAssertion(page, url, expectedSettings);
        genericContractResults.push({ sampleId: testCase.sampleId, toolId: testCase.toolId, ...result });
        continue;
      }
      if (testCase.toolId === "replay-visualizer") {
        const expectedEventCount = Array.isArray(testCase.presetPayload?.config?.events)
          ? testCase.presetPayload.config.events.length
          : 0;
        assert.ok(expectedEventCount > 0, `Missing expected replay events in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        const result = await runReplayVisualizerContractAssertion(page, url, expectedEventCount);
        genericContractResults.push({ sampleId: testCase.sampleId, toolId: testCase.toolId, ...result });
      }
    }

    const targetedCases = buildTargetedCases(roundtripRows, toolMap);
    const targetedResults = [];

    for (const testCase of targetedCases) {
      const url = buildStandaloneToolUrl(baseUrl, testCase.tool.entryPoint, testCase.row);
      if (testCase.toolId === "asset-browser") {
        const expectedImportName = String(testCase.presetPayload?.config?.assetBrowserPreset?.importName || "").trim();
        assert.ok(expectedImportName, `Missing expected importName in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        const result = await runTargetedAssetBrowserAssertion(page, url, expectedImportName);
        targetedResults.push({ sampleId: testCase.sampleId, toolId: testCase.toolId, ...result });
        continue;
      }
      if (testCase.toolId === "asset-pipeline-tool") {
        const expectedGameId = String(testCase.presetPayload?.config?.pipelinePayload?.gameId || "").trim();
        assert.ok(expectedGameId, `Missing expected pipeline gameId in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        const result = await runTargetedAssetPipelineAssertion(page, url, expectedGameId);
        targetedResults.push({ sampleId: testCase.sampleId, toolId: testCase.toolId, ...result });
        continue;
      }
      if (testCase.toolId === "palette-browser") {
        const palette = testCase.presetPayload?.config?.palette;
        const expectedPaletteName = String(palette?.name || "").trim();
        const expectedSwatchCount = Array.isArray(palette?.swatches) ? palette.swatches.length : 0;
        assert.ok(expectedPaletteName, `Missing expected palette name in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        assert.ok(expectedSwatchCount > 0, `Missing expected palette entries in ${toPosixPath(path.relative(repoRoot, testCase.presetFilePath))}.`);
        const result = await runTargetedPaletteBrowserAssertion(page, url, expectedPaletteName, expectedSwatchCount);
        targetedResults.push({ sampleId: testCase.sampleId, toolId: testCase.toolId, ...result });
      }
    }

    const summary = {
      generatedAt: new Date().toISOString(),
      totalSampleToolPayloadFiles: schemaAudit.toolPayloadFiles.length,
      totalSamplePaletteFiles: schemaAudit.paletteFiles.length,
      totalRoundtripRows: roundtripRows.length,
      schemaFailures: schemaAudit.schemaFailures,
      contractFailures: schemaAudit.contractFailures,
      roundtripPathFailures,
      genericFailures,
      genericChecks,
      genericContractResults,
      targetedResults
    };

    fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2) + "\n", "utf8");
    return summary;
  } finally {
    if (page) {
      await page.close();
    }
    if (browser) {
      await stopBrowser(browser);
    }
    await closeServer(server);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run()
    .then((summary) => {
      console.log(JSON.stringify(summary, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
