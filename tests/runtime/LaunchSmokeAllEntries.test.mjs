import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const reportsDir = path.join(repoRoot, 'docs', 'dev', 'reports');
const reportPath = path.join(reportsDir, 'launch_smoke_report.md');

const tmpRoot = path.join(repoRoot, 'tmp');
const ownedManifestPath = path.join(tmpRoot, 'launch-smoke-owned.json');
const isolatedNodeModulesRoot = path.join(tmpRoot, 'node_modules');
const isolatedPackageJsonPath = path.join(tmpRoot, 'package.json');
const runtimeDir = path.join(tmpRoot, 'launch-smoke-runtime');
const browserProfileDir = path.join(tmpRoot, 'launch-smoke-browser');

const DEFAULT_LOAD_WAIT_MS = 1500;
const GAME_POST_START_WAIT_MS = 3000;
const DEBUG_PORT = 9222;
const EXECUTION_STEPS = [
  'npm install --prefix ./tmp ws',
  'npm run test:launch-smoke',
].join(' â†’ ');

let WebSocketCtor = null;

function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[launch-smoke ${timestamp}] ${message}`);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeOwnedManifest(entries) {
  ensureDir(tmpRoot);
  const payload = {
    created: entries,
    note: 'Only these launch-smoke-owned artifacts may be cleaned automatically.'
  };
  fs.writeFileSync(ownedManifestPath, JSON.stringify(payload, null, 2) + '\n');
}

function cleanupOwnedArtifacts() {
  if (!fs.existsSync(ownedManifestPath)) {
    return;
  }

  let payload = null;
  try {
    payload = JSON.parse(fs.readFileSync(ownedManifestPath, 'utf8'));
  } catch {
    return;
  }

  const created = Array.isArray(payload?.created) ? payload.created : [];
  for (const rel of created) {
    const targetPath = path.join(tmpRoot, rel);
    if (!targetPath.startsWith(tmpRoot)) continue;
    try {
      fs.rmSync(targetPath, { recursive: true, force: true });
    } catch {}
  }

  try {
    fs.rmSync(ownedManifestPath, { force: true });
  } catch {}
}

function ensureIsolatedTmpLayout() {
  ensureDir(tmpRoot);
  ensureDir(runtimeDir);
  writeOwnedManifest([
    'launch-smoke-browser',
    'launch-smoke-runtime'
  ]);
}

async function ensureIsolatedWsDependency() {
  ensureDir(tmpRoot);

  if (!fs.existsSync(isolatedPackageJsonPath)) {
    const pkg = {
      private: true
    };
    fs.writeFileSync(isolatedPackageJsonPath, JSON.stringify({"private": true}, null, 2) + '\n');
  }

  const wsWrapperPath = path.join(isolatedNodeModulesRoot, 'ws', 'wrapper.mjs');
  if (!fs.existsSync(wsWrapperPath)) {
    log('installing isolated dependency: ws -> <project>/tmp/node_modules');
    execFileSync('npm', ['install', '--prefix', tmpRoot, 'ws'], {
      cwd: repoRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
  } else {
    log('isolated dependency present: <project>/tmp/node_modules/ws');
  }

  const wsModule = await import(pathToFileURL(wsWrapperPath).href);
  WebSocketCtor = wsModule.WebSocket;
  assert.ok(WebSocketCtor, 'Failed to load WebSocket from <project>/tmp/node_modules/ws');
}

function parseCliArgs(argv) {
  const args = argv.slice(2);
  const argSet = new Set(args);

  const rangeArg = args.find((arg) => arg.startsWith('--sample-range='));
  let sampleRange = null;

  if (rangeArg) {
    const raw = rangeArg.split('=')[1] || '';
    const match = raw.match(/^(\d{4})-(\d{4})$/);
    if (!match) {
      throw new Error(`Invalid --sample-range format: ${raw}. Use ####-####, for example 0101-0124`);
    }
    sampleRange = { start: match[1], end: match[2] };
  }

  const includeGames = argSet.has('--games');
  const includeSamples = argSet.has('--samples');
  const includeTools = argSet.has('--tools');
  const anyExplicitFilter = includeGames || includeSamples || includeTools;

  return {
    includeGames: anyExplicitFilter ? includeGames : true,
    includeSamples: anyExplicitFilter ? includeSamples : true,
    includeTools: anyExplicitFilter ? includeTools : true,
    sampleRange
  };
}

function sampleInRange(id, range) {
  if (!range) return true;
  return id >= range.start && id <= range.end;
}

function discoverSamples(range) {
  const baseDir = path.join(repoRoot, 'samples');
  const results = [];
  if (!fs.existsSync(baseDir)) return results;

  for (const phaseEntry of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (!phaseEntry.isDirectory() || !/^phase\d{2}$/.test(phaseEntry.name)) continue;
    const phaseDir = path.join(baseDir, phaseEntry.name);

    for (const sampleEntry of fs.readdirSync(phaseDir, { withFileTypes: true })) {
      if (!sampleEntry.isDirectory() || !/^\d{4}$/.test(sampleEntry.name)) continue;
      if (!sampleInRange(sampleEntry.name, range)) continue;

      const relPath = path.join('samples', phaseEntry.name, sampleEntry.name, 'index.html');
      if (!fs.existsSync(path.join(repoRoot, relPath))) continue;
      results.push({ type: 'sample', id: sampleEntry.name, label: sampleEntry.name, relPath });
    }
  }

  return results.sort((a, b) => a.relPath.localeCompare(b.relPath));
}

function discoverDirectoryEntries(kind, dirName) {
  const baseDir = path.join(repoRoot, dirName);
  const results = [];
  if (!fs.existsSync(baseDir)) return results;

  for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const relPath = path.join(dirName, entry.name, 'index.html');
    if (!fs.existsSync(path.join(repoRoot, relPath))) continue;
    results.push({ type: kind, id: entry.name, label: entry.name, relPath });
  }

  return results.sort((a, b) => a.relPath.localeCompare(b.relPath));
}

function discoverEntries(filters) {
  return [
    ...(filters.includeGames ? discoverDirectoryEntries('game', 'games') : []),
    ...(filters.includeSamples ? discoverSamples(filters.sampleRange) : []),
    ...(filters.includeTools ? discoverDirectoryEntries('tool', 'tools') : []),
  ];
}

function createStaticServer(rootDir) {
  return http.createServer((request, response) => {
    try {
      const requestPath = request.url ? request.url.split('?')[0] : '/';
      const decodedPath = decodeURIComponent(requestPath || '/');
      const normalizedPath = decodedPath === '/' ? '/index.html' : decodedPath;
      const absolutePath = path.resolve(rootDir, '.' + normalizedPath);

      if (!absolutePath.startsWith(rootDir)) {
        response.statusCode = 403;
        response.end('Forbidden');
        return;
      }

      let stat;
      try {
        stat = fs.statSync(absolutePath);
      } catch {
        response.statusCode = 404;
        response.end('Not Found');
        return;
      }

      let filePath = absolutePath;
      if (stat.isDirectory()) {
        filePath = path.join(absolutePath, 'index.html');
      }

      if (!fs.existsSync(filePath)) {
        response.statusCode = 404;
        response.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2'
      }[ext] || 'application/octet-stream';

      response.statusCode = 200;
      response.setHeader('Content-Type', contentType);
      fs.createReadStream(filePath).pipe(response);
    } catch {
      response.statusCode = 500;
      response.end('Server Error');
    }
  });
}

function launchServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = createStaticServer(rootDir);
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to resolve local server address.'));
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
    process.env.CHROMIUM_PATH || '',
    process.env.CHROME_PATH || '',
    process.env.EDGE_PATH || '',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
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
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
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
    this.eventHandlers = new Map();
    this.ws = null;
  }

  async connect() {
    this.ws = new WebSocketCtor(this.wsUrl);

    await new Promise((resolve, reject) => {
      this.ws.once('open', resolve);
      this.ws.once('error', reject);
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(String(data));

      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message || 'CDP command failed'));
        else pending.resolve(message.result || {});
        return;
      }

      if (message.method) {
        const handlers = this.eventHandlers.get(message.method) || [];
        for (const handler of handlers) {
          try { handler(message); } catch {}
        }
      }
    });
  }

  on(method, handler) {
    const handlers = this.eventHandlers.get(method) || [];
    handlers.push(handler);
    this.eventHandlers.set(method, handlers);
  }

  async send(method, params = {}, sessionId = undefined) {
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
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
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-sync',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1600,900',
    'about:blank'
  ];

  const child = spawn(executable, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += String(chunk); });

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

  try { child.kill('SIGKILL'); } catch {}
  throw new Error(`Failed to start debug browser. ${stderr.trim()}`);
}

async function stopBrowser(browser) {
  try { browser.child.kill('SIGKILL'); } catch {}
}

async function createPageController(browserWsUrl) {
  const cdp = new CdpConnection(browserWsUrl);
  await cdp.connect();

  const created = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const targetId = created.targetId;

  const attached = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = attached.sessionId;

  const eventState = {
    consoleMessages: [],
    pageErrors: [],
    requestFailures: [],
    dialogMessages: []
  };

  cdp.on('Runtime.consoleAPICalled', (message) => {
    if (message.sessionId !== sessionId) return;
    const type = message.params?.type || 'log';
    const args = (message.params?.args || []).map((arg) => arg.value ?? arg.description ?? '[unserializable]');
    const text = args.join(' ');
    if (type === 'error' || type === 'assert') eventState.consoleMessages.push(`${type}: ${text}`);
  });

  cdp.on('Runtime.exceptionThrown', (message) => {
    if (message.sessionId !== sessionId) return;
    const details = message.params?.exceptionDetails || {};
    const msg = details.text || details.exception?.description || 'Runtime exception';
    eventState.pageErrors.push(msg);
  });

  cdp.on('Network.loadingFailed', (message) => {
    if (message.sessionId !== sessionId) return;
    if (message.params?.canceled) return;
    eventState.requestFailures.push(`${message.params?.errorText || 'request failed'} ${message.params?.requestId || ''}`.trim());
  });

  cdp.on('Page.javascriptDialogOpening', (message) => {
    if (message.sessionId !== sessionId) return;
    eventState.dialogMessages.push(`${message.params?.type || 'dialog'}: ${message.params?.message || ''}`);
  });

  async function send(method, params = {}) {
    return await cdp.send(method, params, sessionId);
  }

  async function initialize() {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Log.enable');
  }

  function resetEvents() {
    eventState.consoleMessages = [];
    eventState.pageErrors = [];
    eventState.requestFailures = [];
    eventState.dialogMessages = [];
  }

  async function navigate(url) {
    await send('Page.navigate', { url });
  }

  async function pressEnter() {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', windowsVirtualKeyCode: 13, code: 'Enter', key: 'Enter' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 13, code: 'Enter', key: 'Enter' });
  }

  async function close() {
    try { await cdp.send('Target.closeTarget', { targetId }); } catch {}
    await cdp.close();
  }

  return {
    initialize,
    navigate,
    pressEnter,
    resetEvents,
    getEvents: () => ({
      consoleMessages: [...eventState.consoleMessages],
      pageErrors: [...eventState.pageErrors],
      requestFailures: [...eventState.requestFailures],
      dialogMessages: [...eventState.dialogMessages]
    }),
    close
  };
}

async function runEntry(page, baseUrl, entry, index, total) {
  const url = `${baseUrl}/${entry.relPath.replaceAll(path.sep, '/')}`;
  log(`[${index + 1}/${total}] launching ${entry.type}: ${entry.label}`);
  log(`url: ${url}`);

  page.resetEvents();
  await page.navigate(url);
  await wait(DEFAULT_LOAD_WAIT_MS);

  if (entry.type === 'game') {
    log(`sending Enter to start game: ${entry.label}`);
    await page.pressEnter();
    await wait(GAME_POST_START_WAIT_MS);
  }

  const events = page.getEvents();
  const passed =
    events.consoleMessages.length === 0 &&
    events.pageErrors.length === 0 &&
    events.requestFailures.length === 0 &&
    events.dialogMessages.length === 0;

  log(`${passed ? 'PASS' : 'FAIL'} ${entry.label}`);

  return { entry, url, ...events, passed };
}

function writeReport(results, filters) {
  ensureDir(reportsDir);
  const filterSummary = [
    `games=${filters.includeGames}`,
    `samples=${filters.includeSamples}`,
    `tools=${filters.includeTools}`,
    `sampleRange=${filters.sampleRange ? `${filters.sampleRange.start}-${filters.sampleRange.end}` : 'all'}`
  ].join(', ');

  const lines = [
    '# Launch Smoke Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Filters: ${filterSummary}`,
    '',
    '| Status | Type | Label | Path | Notes | Steps |',
    '| --- | --- | --- | --- | --- | --- |'
  ];

  for (const result of results) {
    const notes = [
      ...result.consoleMessages.map((x) => `console ${x}`),
      ...result.pageErrors.map((x) => `exception ${x}`),
      ...result.requestFailures.map((x) => `request ${x}`),
      ...result.dialogMessages.map((x) => `dialog ${x}`)
    ];
    lines.push(`| ${result.passed ? 'PASS' : 'FAIL'} | ${result.entry.type} | ${result.entry.label} | ${result.entry.relPath} | ${notes.join('<br>') || ''} | ${EXECUTION_STEPS} |`);
  }

  fs.writeFileSync(reportPath, lines.join('\n'));
  log(`report written: ${reportPath}`);
}

export async function run() {
  cleanupOwnedArtifacts();
  ensureIsolatedTmpLayout();
  await ensureIsolatedWsDependency();

  const filters = parseCliArgs(process.argv);
  const executable = resolveBrowserExecutable();
  assert.ok(executable, 'No supported Chromium/Chrome/Edge executable found.');

  const entries = discoverEntries(filters);
  assert.ok(entries.length > 0, 'No matching games, samples, or tools discovered.');

  log(`filters: games=${filters.includeGames} samples=${filters.includeSamples} tools=${filters.includeTools} sampleRange=${filters.sampleRange ? `${filters.sampleRange.start}-${filters.sampleRange.end}` : 'all'}`);
  log(`isolated deps: ${path.join('<project>', 'tmp', 'node_modules')}`);
  log(`discovered ${entries.length} entries`);

  const { server, port } = await launchServer(repoRoot);
  const baseUrl = `http://127.0.0.1:${port}`;
  log(`static server ready: ${baseUrl}`);

  let browser = null;
  let page = null;
  const results = [];

  try {
    browser = await startBrowser(executable);
    page = await createPageController(browser.version.webSocketDebuggerUrl);
    await page.initialize();
    log('cdp page session ready');

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      try {
        const result = await runEntry(page, baseUrl, entry, index, entries.length);
        results.push(result);
      } catch (error) {
        log(`ERROR ${entry.label}: ${error.message}`);
        results.push({
          entry,
          url: `${baseUrl}/${entry.relPath.replaceAll(path.sep, '/')}`,
          consoleMessages: [],
          pageErrors: [error.message],
          requestFailures: [],
          dialogMessages: [],
          passed: false
        });
      }
    }
  } finally {
    writeReport(results, filters);

    const failures = results.filter((x) => !x.passed);
    const passes = results.length - failures.length;

    log(`summary: PASS=${passes} FAIL=${failures.length} TOTAL=${results.length}`);
    log(`report: ${reportPath}`);
    log(`isolated node_modules: ${isolatedNodeModulesRoot}`);

    if (failures.length > 0) {
      log(`failed entries: ${failures.map((x) => x.entry.label).join(', ')}`);
    } else {
      log('failed entries: none');
    }

    if (page) await page.close();
    if (browser) await stopBrowser(browser);

    await closeServer(server);
    cleanupOwnedArtifacts();
  }

  const failures = results.filter((x) => !x.passed);
  assert.equal(failures.length, 0, `Launch smoke failures detected: ${failures.map((x) => x.entry.label).join(', ')}`);
}

