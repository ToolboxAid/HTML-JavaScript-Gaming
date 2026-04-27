import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const tmpRoot = path.join(repoRoot, "tmp");
const resultsPath = path.join(tmpRoot, "workspace-manager-open-test-results.json");
const isolatedNodeModulesRoot = path.join(tmpRoot, "node_modules");
const isolatedPackageJsonPath = path.join(tmpRoot, "package.json");
const browserProfileDir = path.join(tmpRoot, "workspace-manager-open-browser");

const DEBUG_PORT = 9224;
const DIAGNOSTIC_TEXT = "Workspace Manager game launch requires a valid gameId";
const DEFAULT_GAME_ASSET_CATALOG_FILENAME = "workspace.asset-catalog.json";
const MISSING_SHARED_PALETTE_TEXT = "Shared Palette: No shared palette selected";
const MISSING_SHARED_ASSET_TEXT = "Shared Assets: No shared asset selected";
const BOUNCING_BALL_EXPECTED_SKIN_TEXT = "Bouncing Ball Classic Skin";

let WebSocketCtor = null;

function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[workspace-manager-open ${timestamp}] ${message}`);
}

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
    log("installing isolated dependency: ws -> <project>/tmp/node_modules");
    execFileSync("npm", ["install", "--prefix", tmpRoot, "ws"], {
      cwd: repoRoot,
      stdio: "inherit",
      shell: process.platform === "win32"
    });
  } else {
    log("isolated dependency present: <project>/tmp/node_modules/ws");
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
      res.on("data", (chunk) => body += chunk);
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
    try { this.ws?.close(); } catch {}
  }
}

async function startBrowser(executable) {
  try { fs.rmSync(browserProfileDir, { recursive: true, force: true }); } catch {}
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
  child.stderr.on("data", (chunk) => { stderr += String(chunk); });

  log(`starting browser: ${executable}`);
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const version = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`, 1000);
      log(`browser ready on port ${DEBUG_PORT}`);
      return { child, version };
    } catch {
      await wait(100);
    }
  }

  try { child.kill("SIGKILL"); } catch {}
  throw new Error(`Failed to start debug browser. ${stderr.trim()}`);
}

async function stopBrowser(browser) {
  try { browser.child.kill("SIGKILL"); } catch {}
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
    try { await cdp.send("Target.closeTarget", { targetId }); } catch {}
    await cdp.close();
  }

  return {
    initialize,
    navigate,
    evaluate,
    close
  };
}

async function waitForGameCards(page, timeoutMs = 15000) {
  const start = Date.now();
  while ((Date.now() - start) < timeoutMs) {
    const ready = await page.evaluate(`(() => document.querySelectorAll('#games-index-list article[data-game-id]').length > 0)()`);
    if (ready) {
      return;
    }
    await wait(200);
  }
  throw new Error("Timed out waiting for game cards on /games/index.html.");
}

function readExpectedMetadataSets() {
  const metadataPath = path.join(repoRoot, "games", "metadata", "games.index.metadata.json");
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  const games = Array.isArray(metadata?.games) ? metadata.games : [];
  const normalized = games
    .map((entry) => ({
      id: typeof entry?.id === "string" ? entry.id.trim() : "",
      title: typeof entry?.title === "string" ? entry.title.trim() : "",
      href: typeof entry?.href === "string" ? entry.href.trim() : ""
    }))
    .filter((entry) => entry.id && entry.title);
  const expectedWorkspaceEntries = normalized
    .filter((entry) => entry.href.startsWith("/games/") && !entry.href.includes(".."))
    .map((entry) => {
      const gameFolderHref = entry.href.endsWith("/index.html")
        ? entry.href.slice(0, -"/index.html".length)
        : entry.href.replace(/\/$/, "");
      const gameFolderPath = path.join(repoRoot, gameFolderHref.replace(/^\//, ""));
      const manifestPath = path.join(gameFolderPath, "game.manifest.json");
      const catalogPath = path.join(gameFolderPath, "assets", DEFAULT_GAME_ASSET_CATALOG_FILENAME);

      let hasManifestPalette = false;
      let hasManifestSkin = false;
      let expectedSkinName = "";
      let hasManifestToolAsset = false;
      let hasManifestVectors = false;
      let expectedVectorStrokeEnabled = false;
      let expectedVectorFillEnabled = false;
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
          const palette = manifest?.tools?.["palette-browser"]?.palette;
          hasManifestPalette = Array.isArray(palette?.swatches) && palette.swatches.length > 0;
          const skins = manifest?.tools?.["primitive-skin-editor"]?.skins;
          hasManifestSkin = Array.isArray(skins) && skins.length > 0;
          const spriteEntries = manifest?.tools?.["sprite-editor"]?.sprites;
          const tileMapEntries = manifest?.tools?.["tile-map-editor"]?.maps;
          const parallaxEntries = manifest?.tools?.["parallax-editor"]?.parallaxLevels;
          const vectorEntries = manifest?.tools?.["vector-asset-studio"]?.vectors;
          const assetBrowserMediaEntries = manifest?.tools?.["asset-browser"]?.assets?.media;

          const countEntries = (value) => {
            if (Array.isArray(value)) {
              return value.length;
            }
            if (value && typeof value === "object") {
              return Object.keys(value).length;
            }
            return 0;
          };
          hasManifestToolAsset = (
            countEntries(skins) > 0
            || countEntries(spriteEntries) > 0
            || countEntries(tileMapEntries) > 0
            || countEntries(parallaxEntries) > 0
            || countEntries(vectorEntries) > 0
            || countEntries(assetBrowserMediaEntries) > 0
          );
          hasManifestVectors = countEntries(vectorEntries) > 0;
          const firstSkin = hasManifestSkin ? skins[0] : null;
          const candidateSkinName = typeof firstSkin?.data?.name === "string"
            ? firstSkin.data.name.trim()
            : (typeof firstSkin?.name === "string" ? firstSkin.name.trim() : "");
          expectedSkinName = candidateSkinName || "";
          if (hasManifestVectors) {
            const firstVector = Array.isArray(vectorEntries)
              ? vectorEntries.find((entry) => Boolean(entry && typeof entry === "object"))
              : (() => {
                if (!vectorEntries || typeof vectorEntries !== "object") {
                  return null;
                }
                const firstKey = Object.keys(vectorEntries)[0];
                return firstKey ? vectorEntries[firstKey] : null;
              })();
            if (firstVector && typeof firstVector === "object" && firstVector.style && typeof firstVector.style === "object") {
              expectedVectorStrokeEnabled = firstVector.style.stroke === true;
              expectedVectorFillEnabled = firstVector.style.fill === true;
            }
          }
        } catch {
          // Leave expected values as false/empty when manifest parse fails.
        }
      }

      let catalogKinds = [];
      let hasCatalogPalette = false;
      let hasCatalogNonPalette = false;
      if (fs.existsSync(catalogPath)) {
        try {
          const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
          const entries = catalog?.assets && typeof catalog.assets === "object"
            ? Object.values(catalog.assets)
            : (catalog?.entries && typeof catalog.entries === "object" ? Object.values(catalog.entries) : []);
          const kinds = entries
            .map((value) => (typeof value?.kind === "string" ? value.kind.trim().toLowerCase() : ""))
            .filter(Boolean);
          catalogKinds = [...new Set(kinds)];
          hasCatalogPalette = catalogKinds.includes("palette");
          hasCatalogNonPalette = catalogKinds.some((kind) => kind !== "palette");
        } catch {
          // Keep derived catalog expectations empty when parsing fails.
        }
      }

      return {
        id: entry.id,
        href: entry.href,
        hasManifestPalette,
        hasManifestSkin,
        hasManifestToolAsset,
        hasManifestVectors,
        expectedVectorStrokeEnabled,
        expectedVectorFillEnabled,
        expectedSkinName,
        hasCatalogPalette,
        hasCatalogNonPalette,
        catalogKinds
      };
    });
  const expectedWorkspaceEntriesById = Object.fromEntries(
    expectedWorkspaceEntries.map((entry) => [entry.id, entry])
  );
  return {
    expectedCardIds: normalized.map((entry) => entry.id),
    expectedWorkspaceActionIds: expectedWorkspaceEntries.map((entry) => entry.id),
    expectedWorkspaceEntries,
    expectedWorkspaceEntriesById
  };
}

function setDifference(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

async function waitForMountedToolFrame(page, timeoutMs = 12000) {
  const start = Date.now();
  while ((Date.now() - start) < timeoutMs) {
    const frameReady = await page.evaluate(`(() => {
      const frame = document.querySelector('[data-tool-host-frame]');
      if (!(frame instanceof HTMLIFrameElement)) {
        return false;
      }
      const frameBodyText = String(frame.contentDocument?.body?.innerText || '').trim();
      return frameBodyText.length > 0;
    })()`);
    if (frameReady) {
      return true;
    }
    await wait(150);
  }
  return false;
}

async function inspectMountedWorkspaceState(page) {
  return await page.evaluate(`(() => {
    const frame = document.querySelector('[data-tool-host-frame]');
    if (!(frame instanceof HTMLIFrameElement)) {
      return {
        framePresent: false,
        frameText: "",
        hasWorkspaceLoaded: false,
        hasSharedPaletteLine: false,
        hasSharedAssetLine: false,
        missingSharedPalette: false,
        missingSharedAsset: false,
        hasGameSourceLine: false,
        hasAnyExpectedAssetKeyword: false,
        hasBouncingBallClassicSkin: false,
        paletteLabel: "",
        sharedAssetLabel: ""
      };
    }
    const text = String(frame.contentDocument?.body?.innerText || "");
    const paletteLabelMatch = text.match(/Shared Palette:\\s*([^\\n\\r]+)/i);
    const sharedAssetLabelMatch = text.match(/Shared Assets:\\s*([^\\n\\r]+)/i);
    return {
      framePresent: true,
      frameText: text,
      hasWorkspaceLoaded: /Workspace:\\s*Loaded/i.test(text),
      hasSharedPaletteLine: /Shared Palette:/i.test(text),
      hasSharedAssetLine: /Shared Assets:/i.test(text),
      missingSharedPalette: text.includes(${JSON.stringify(MISSING_SHARED_PALETTE_TEXT)}),
      missingSharedAsset: text.includes(${JSON.stringify(MISSING_SHARED_ASSET_TEXT)}),
      hasGameSourceLine: /Game Source:/i.test(text),
      hasAnyExpectedAssetKeyword: /(palette|skin|audio|image|vector|sprite|tilemap|parallax)/i.test(text),
      hasBouncingBallClassicSkin: text.includes(${JSON.stringify(BOUNCING_BALL_EXPECTED_SKIN_TEXT)}),
      paletteLabel: paletteLabelMatch ? String(paletteLabelMatch[1]).trim() : "",
      sharedAssetLabel: sharedAssetLabelMatch ? String(sharedAssetLabelMatch[1]).trim() : ""
    };
  })()`);
}

async function inspectVectorAssetSelectionState(page) {
  return await page.evaluate(`(() => {
    const frame = document.querySelector('[data-tool-host-frame]');
    if (!(frame instanceof HTMLIFrameElement)) {
      return {
        framePresent: false,
        frameText: "",
        paletteSelectedFalse: false,
        paintSelectedFalse: false,
        strokeSelectedFalse: false,
        fillDisabledNotePresent: false,
        editingEnabled: false
      };
    }
    const text = String(frame.contentDocument?.body?.innerText || "");
    return {
      framePresent: true,
      frameText: text,
      paletteSelectedFalse: /Palette\\s+Selected:\\s*false/i.test(text),
      paintSelectedFalse: /Paint\\s+selected:\\s*false/i.test(text),
      strokeSelectedFalse: /Stroke\\s+selected:\\s*false/i.test(text),
      fillDisabledNotePresent: /Paint\\s+selected:\\s*n\\/a\\s*\\(fill\\s+disabled\\)/i.test(text),
      editingEnabled: /Editing enabled\\./i.test(text)
    };
  })()`);
}

export async function run() {
  await ensureIsolatedWsDependency();
  ensureDir(tmpRoot);

  const executable = resolveBrowserExecutable();
  assert.ok(executable, "No supported Chromium/Chrome/Edge executable found.");

  const metadataSets = readExpectedMetadataSets();
  assert.ok(metadataSets.expectedCardIds.length > 0, "No expected game cards discovered from games index metadata.");
  assert.ok(metadataSets.expectedWorkspaceActionIds.length > 0, "No launchable games discovered from games index metadata.");

  const { server, port } = await launchServer(repoRoot);
  const baseUrl = `http://127.0.0.1:${port}`;
  log(`static server ready: ${baseUrl}`);

  let browser = null;
  let page = null;

  try {
    browser = await startBrowser(executable);
    page = await createPageController(browser.version.webSocketDebuggerUrl);
    await page.initialize();

    await page.navigate(`${baseUrl}/games/index.html`);
    await waitForGameCards(page);

    const snapshot = await page.evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('#games-index-list article[data-game-id]'));
      const actions = cards.map((card) => {
        const gameId = String(card.dataset.gameId || '').trim();
        const link = card.querySelector('a[data-workspace-launch-href]');
        return {
          gameId,
          href: link ? String(link.getAttribute('href') || '') : '',
          dataHref: link ? String(link.dataset.workspaceLaunchHref || '') : '',
          hasAction: !!link
        };
      });
      return {
        cardCount: cards.length,
        actions
      };
    })()`);

    const expectedCardIdsSorted = [...new Set(metadataSets.expectedCardIds)].sort();
    const expectedWorkspaceActionIdsSorted = [...new Set(metadataSets.expectedWorkspaceActionIds)].sort();

    const discoveredCardIds = [...new Set(snapshot.actions.map((entry) => entry.gameId).filter(Boolean))].sort();
    const actionEntries = snapshot.actions.filter((entry) => entry.hasAction && entry.href && entry.gameId);
    const discoveredWorkspaceActionIds = [...new Set(actionEntries.map((entry) => entry.gameId))].sort();

    const missingCardIds = setDifference(expectedCardIdsSorted, discoveredCardIds);
    const unexpectedCardIds = setDifference(discoveredCardIds, expectedCardIdsSorted);
    const missingWorkspaceActionIds = setDifference(expectedWorkspaceActionIdsSorted, discoveredWorkspaceActionIds);
    const unexpectedWorkspaceActionIds = setDifference(discoveredWorkspaceActionIds, expectedWorkspaceActionIdsSorted);

    const validationFailures = [];
    if (missingCardIds.length > 0) {
      validationFailures.push(`Missing game cards for ids: ${missingCardIds.join(", ")}`);
    }
    if (unexpectedCardIds.length > 0) {
      validationFailures.push(`Unexpected game ids in DOM: ${unexpectedCardIds.join(", ")}`);
    }
    if (missingWorkspaceActionIds.length > 0) {
      validationFailures.push(`Missing Workspace Manager action for launchable ids: ${missingWorkspaceActionIds.join(", ")}`);
    }
    if (unexpectedWorkspaceActionIds.length > 0) {
      validationFailures.push(`Unexpected Workspace Manager action ids: ${unexpectedWorkspaceActionIds.join(", ")}`);
    }

    let actionsWithGameId = 0;
    let actionsWithMountGame = 0;
    let actionsUsingLegacyGameQuery = 0;
    let actionsWithSharedPalette = 0;
    let actionsWithSharedAssets = 0;
    let actionsWithWorkspaceLoaded = 0;
    let actionsRequiringSharedAssets = 0;
    let actionsMeetingSharedAssetRequirement = 0;
    let gravityWellVectorBindingCheck = null;
    const invalidActionDetails = [];
    const diagnosticFailures = [];
    const assetPresenceFailures = [];
    const perGameObservations = [];

    for (const action of actionEntries) {
      const parsed = new URL(action.href, `${baseUrl}/games/index.html`);
      const expectedAssetModel = metadataSets.expectedWorkspaceEntriesById[action.gameId] || null;
      const gameFailures = [];
      const decodedPath = decodeURIComponent(parsed.pathname || "");
      if (decodedPath !== "/tools/Workspace Manager/index.html") {
        invalidActionDetails.push(`Game ${action.gameId} action path mismatch: ${parsed.pathname}`);
      }

      const gameIdParam = parsed.searchParams.get("gameId");
      const mountParam = parsed.searchParams.get("mount");
      const hasLegacyGameParam = parsed.searchParams.has("game");

      if (gameIdParam === action.gameId) {
        actionsWithGameId += 1;
      } else {
        invalidActionDetails.push(`Game ${action.gameId} action has invalid gameId query: ${gameIdParam || "(missing)"}`);
      }

      if (mountParam === "game") {
        actionsWithMountGame += 1;
      } else {
        invalidActionDetails.push(`Game ${action.gameId} action has invalid mount query: ${mountParam || "(missing)"}`);
      }

      if (hasLegacyGameParam) {
        actionsUsingLegacyGameQuery += 1;
        invalidActionDetails.push(`Game ${action.gameId} action still uses legacy ?game= query.`);
      }

      await page.navigate(parsed.toString());
      await wait(1200);
      const diagnosticPresent = await page.evaluate(`(() => {
        const text = String(document.body?.innerText || "");
        return text.includes(${JSON.stringify(DIAGNOSTIC_TEXT)});
      })()`);
      if (diagnosticPresent) {
        const failure = `Workspace Manager diagnostic shown for ${action.gameId}.`;
        diagnosticFailures.push(failure);
        gameFailures.push(failure);
      }

      const frameReady = await waitForMountedToolFrame(page);
      if (!frameReady) {
        const failure = `Workspace frame content did not render for ${action.gameId}.`;
        assetPresenceFailures.push(failure);
        gameFailures.push(failure);
        perGameObservations.push({
          gameId: action.gameId,
          href: parsed.toString(),
          openActionValid: !invalidActionDetails.some((detail) => detail.startsWith(`Game ${action.gameId} action`)),
          diagnosticVisible: diagnosticPresent,
          workspaceLoaded: false,
          sharedPalettePresent: false,
          sharedAssetsPresent: false,
          expectedManifestPalette: Boolean(expectedAssetModel?.hasManifestPalette),
          expectedManifestSkin: Boolean(expectedAssetModel?.hasManifestSkin),
          expectedSkinName: expectedAssetModel?.expectedSkinName || "",
          expectedCatalogKinds: expectedAssetModel?.catalogKinds || [],
          failures: gameFailures
        });
        continue;
      }

      const state = await inspectMountedWorkspaceState(page);
      if (state.hasWorkspaceLoaded) {
        actionsWithWorkspaceLoaded += 1;
      } else {
        const failure = `Workspace did not show "Workspace: Loaded" for ${action.gameId}.`;
        assetPresenceFailures.push(failure);
        gameFailures.push(failure);
      }

      if (state.hasSharedPaletteLine && !state.missingSharedPalette) {
        actionsWithSharedPalette += 1;
      } else {
        const failure = `Shared palette missing for ${action.gameId}.`;
        assetPresenceFailures.push(failure);
        gameFailures.push(failure);
      }

      const requiresSharedAsset = Boolean(
        expectedAssetModel?.hasCatalogNonPalette
        || expectedAssetModel?.hasManifestToolAsset
      );
      if (requiresSharedAsset) {
        actionsRequiringSharedAssets += 1;
      }
      if (state.hasSharedAssetLine && !state.missingSharedAsset) {
        actionsWithSharedAssets += 1;
        if (requiresSharedAsset) {
          actionsMeetingSharedAssetRequirement += 1;
        }
      } else if (requiresSharedAsset) {
        const failure = `Shared assets missing for ${action.gameId}.`;
        assetPresenceFailures.push(failure);
        gameFailures.push(failure);
      }

      if (!state.hasGameSourceLine) {
        const failure = `Game source line not visible in mounted tool frame for ${action.gameId}.`;
        assetPresenceFailures.push(failure);
        gameFailures.push(failure);
      }

      if (expectedAssetModel?.hasManifestPalette && state.missingSharedPalette) {
        const failure = `Manifest palette expected but UI shows missing palette for ${action.gameId}.`;
        assetPresenceFailures.push(failure);
        gameFailures.push(failure);
      }

      if (expectedAssetModel?.hasCatalogNonPalette && state.missingSharedAsset) {
        const failure = `Catalog assets expected but UI shows no shared asset selected for ${action.gameId}.`;
        assetPresenceFailures.push(failure);
        gameFailures.push(failure);
      }

      if (expectedAssetModel?.hasManifestSkin) {
        const expectedSkinName = expectedAssetModel.expectedSkinName || "";
        const hasNamedSkin = expectedSkinName
          ? state.frameText.includes(expectedSkinName)
          : /skin/i.test(state.frameText);
        if (!hasNamedSkin) {
          const failure = expectedSkinName
            ? `Expected skin "${expectedSkinName}" not visible for ${action.gameId}.`
            : `Expected skin data not visible for ${action.gameId}.`;
          assetPresenceFailures.push(failure);
          gameFailures.push(failure);
        }
      }

      if (action.gameId.toLowerCase() === "bouncing-ball" && state.missingSharedPalette) {
        const failure = "Bouncing-ball regression: UI shows \"Shared Palette: No shared palette selected\".";
        assetPresenceFailures.push(failure);
        gameFailures.push(failure);
      }

      if (!state.hasAnyExpectedAssetKeyword) {
        const failure = `Expected shared asset/tool section keywords missing for ${action.gameId}.`;
        assetPresenceFailures.push(failure);
        gameFailures.push(failure);
      }

      perGameObservations.push({
        gameId: action.gameId,
        href: parsed.toString(),
        openActionValid: !invalidActionDetails.some((detail) => detail.startsWith(`Game ${action.gameId} action`)),
        diagnosticVisible: diagnosticPresent,
        workspaceLoaded: state.hasWorkspaceLoaded,
        sharedPalettePresent: state.hasSharedPaletteLine && !state.missingSharedPalette,
        sharedAssetsPresent: state.hasSharedAssetLine && !state.missingSharedAsset,
        paletteLabel: state.paletteLabel,
        sharedAssetLabel: state.sharedAssetLabel,
        expectedManifestPalette: Boolean(expectedAssetModel?.hasManifestPalette),
        expectedManifestSkin: Boolean(expectedAssetModel?.hasManifestSkin),
        expectedManifestToolAsset: Boolean(expectedAssetModel?.hasManifestToolAsset),
        expectedSkinName: expectedAssetModel?.expectedSkinName || "",
        expectedCatalogKinds: expectedAssetModel?.catalogKinds || [],
        hasBouncingBallClassicSkin: state.hasBouncingBallClassicSkin,
        failures: gameFailures
      });
    }

    const gravityWellExpectation = metadataSets.expectedWorkspaceEntriesById.GravityWell
      || metadataSets.expectedWorkspaceEntriesById.gravitywell
      || null;
    const gravityWellWorkspaceAction = actionEntries.find((entry) => String(entry.gameId || "").toLowerCase() === "gravitywell");
    if (gravityWellWorkspaceAction && gravityWellExpectation?.hasManifestPalette && gravityWellExpectation?.hasManifestVectors) {
      const gravityVectorUrl = new URL("/tools/Workspace%20Manager/index.html", baseUrl);
      gravityVectorUrl.searchParams.set("gameId", "GravityWell");
      gravityVectorUrl.searchParams.set("mount", "game");
      gravityVectorUrl.searchParams.set("tool", "vector-asset-studio");

      await page.navigate(gravityVectorUrl.toString());
      await wait(1200);
      const vectorFrameReady = await waitForMountedToolFrame(page);
      if (!vectorFrameReady) {
        assetPresenceFailures.push("GravityWell vector binding check failed: Vector Asset Studio frame did not mount.");
      } else {
        const vectorState = await inspectVectorAssetSelectionState(page);
        gravityWellVectorBindingCheck = {
          href: gravityVectorUrl.toString(),
          ...vectorState,
          expectedVectorStrokeEnabled: gravityWellExpectation.expectedVectorStrokeEnabled === true,
          expectedVectorFillEnabled: gravityWellExpectation.expectedVectorFillEnabled === true
        };

        if (vectorState.paletteSelectedFalse) {
          assetPresenceFailures.push("GravityWell vector binding check failed: Vector Asset Studio reported Palette Selected: false.");
        }
        if (gravityWellExpectation.expectedVectorStrokeEnabled === true && vectorState.strokeSelectedFalse) {
          assetPresenceFailures.push("GravityWell vector binding check failed: stroke-enabled vector reported Stroke selected: false.");
        }
        if (gravityWellExpectation.expectedVectorFillEnabled === true && vectorState.paintSelectedFalse) {
          assetPresenceFailures.push("GravityWell vector binding check failed: fill-enabled vector reported Paint selected: false.");
        }
        if (gravityWellExpectation.expectedVectorFillEnabled !== true && vectorState.paintSelectedFalse && !vectorState.fillDisabledNotePresent) {
          assetPresenceFailures.push("GravityWell vector binding check failed: Paint selected was false without fill-disabled explanation.");
        }
      }
    }

    validationFailures.push(...invalidActionDetails);

    const summary = {
      generatedAt: new Date().toISOString(),
      expectedCardIds: expectedCardIdsSorted,
      discoveredCardIds,
      expectedWorkspaceActionIds: expectedWorkspaceActionIdsSorted,
      discoveredWorkspaceActionIds,
      gameCardsDiscovered: Number(snapshot.cardCount || 0),
      workspaceActionCount: Number(actionEntries.length || 0),
      actionsWithGameId,
      actionsWithMountGame,
      actionsUsingLegacyGameQuery,
      actionsWithWorkspaceLoaded,
      actionsWithSharedPalette,
      actionsWithSharedAssets,
      actionsRequiringSharedAssets,
      actionsMeetingSharedAssetRequirement,
      validationFailures,
      diagnosticFailures,
      assetPresenceFailures,
      gravityWellVectorBindingCheck,
      perGameObservations
    };

    fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2) + "\n");
    log(`results written: ${resultsPath}`);

    assert.equal(summary.gameCardsDiscovered, expectedCardIdsSorted.length, "Game card count mismatch on games/index.html.");
    assert.equal(summary.workspaceActionCount, expectedWorkspaceActionIdsSorted.length, "Workspace Manager action count mismatch.");
    assert.equal(summary.actionsWithGameId, summary.workspaceActionCount, "Not all actions use gameId=<id>.");
    assert.equal(summary.actionsWithMountGame, summary.workspaceActionCount, "Not all actions use mount=game.");
    assert.equal(summary.actionsUsingLegacyGameQuery, 0, "Legacy ?game= query detected.");
    assert.equal(summary.validationFailures.length, 0, `Workspace Manager action validation failures: ${summary.validationFailures.join(" | ")}`);
    assert.equal(summary.diagnosticFailures.length, 0, `Workspace Manager diagnostic visible for: ${summary.diagnosticFailures.join(" | ")}`);
    assert.equal(summary.actionsWithWorkspaceLoaded, summary.workspaceActionCount, "Not all actions loaded workspace state.");
    assert.equal(summary.actionsWithSharedPalette, summary.workspaceActionCount, "Not all actions loaded shared palette state.");
    assert.equal(
      summary.actionsMeetingSharedAssetRequirement,
      summary.actionsRequiringSharedAssets,
      "Not all games requiring shared assets loaded shared asset state."
    );
    assert.equal(summary.assetPresenceFailures.length, 0, `Workspace Manager asset-presence validation failures: ${summary.assetPresenceFailures.join(" | ")}`);

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
