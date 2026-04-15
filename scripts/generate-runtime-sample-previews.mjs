import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const SAMPLES_DIR = path.join(ROOT, 'samples');
const CAPTURE_PAGE_PATH = '/samples/shared/runtimePreviewCapture.html';
const OUTPUT_WIDTH = 640;
const OUTPUT_HEIGHT = 360;
const CAPTURE_SETTLE_MS = 3000;
const CAPTURE_TIMEOUT_MS = 12000;
const EDGE_RUNTIME_BUDGET_MS = 17000;
const FROZEN_SAMPLE_IDS = new Set(['1316', '1317', '1318']);

function discoverCanonicalSamples() {
  const results = [];
  const phaseEntries = fs.readdirSync(SAMPLES_DIR, { withFileTypes: true });
  const phaseDirs = phaseEntries
    .filter((entry) => entry.isDirectory() && /^phase\d{2}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  for (const phaseDir of phaseDirs) {
    const phase = phaseDir.slice(5);
    const phasePath = path.join(SAMPLES_DIR, phaseDir);
    const sampleEntries = fs.readdirSync(phasePath, { withFileTypes: true });
    const sampleIds = sampleEntries
      .filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))
      .map((entry) => entry.name)
      .sort();
    for (const sampleId of sampleIds) {
      const sampleDir = path.join(phasePath, sampleId);
      const entrypoint = path.join(sampleDir, 'index.html');
      if (!fs.existsSync(entrypoint)) {
        throw new Error('Missing sample entrypoint: ' + path.relative(ROOT, entrypoint));
      }
      results.push({
        phase,
        id: sampleId,
        phaseDir,
        sampleDir
      });
    }
  }

  return results;
}

function createStaticServer(rootDir) {
  const server = http.createServer((request, response) => {
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
      const contentType =
        ext === '.html'
          ? 'text/html; charset=utf-8'
          : ext === '.js' || ext === '.mjs'
            ? 'application/javascript; charset=utf-8'
            : ext === '.css'
              ? 'text/css; charset=utf-8'
              : ext === '.json'
                ? 'application/json; charset=utf-8'
                : ext === '.svg'
                  ? 'image/svg+xml'
                  : ext === '.png'
                    ? 'image/png'
                    : ext === '.jpg' || ext === '.jpeg'
                      ? 'image/jpeg'
                      : ext === '.webp'
                        ? 'image/webp'
                        : ext === '.gif'
                          ? 'image/gif'
                          : ext === '.ico'
                            ? 'image/x-icon'
                            : ext === '.woff'
                              ? 'font/woff'
                              : ext === '.woff2'
                                ? 'font/woff2'
                                : 'application/octet-stream';

      response.statusCode = 200;
      response.setHeader('Content-Type', contentType);
      fs.createReadStream(filePath).pipe(response);
    } catch {
      response.statusCode = 500;
      response.end('Server Error');
    }
  });

  return server;
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
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

function resolveBrowserExecutable() {
  const candidates = [
    process.env.EDGE_PATH || '',
    process.env.CHROME_PATH || '',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function runHeadlessScreenshot(executable, url, outputPngPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--mute-audio',
      '--run-all-compositor-stages-before-draw',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--window-size=' + OUTPUT_WIDTH + ',' + OUTPUT_HEIGHT,
      '--virtual-time-budget=' + EDGE_RUNTIME_BUDGET_MS,
      '--screenshot=' + outputPngPath,
      url
    ];

    const child = spawn(executable, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });

    child.on('error', (error) => reject(error));
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Headless screenshot failed (code ' + code + '): ' + stderr.trim()));
        return;
      }
      resolve();
    });
  });
}

function pngToSvg(pngFilePath) {
  const base64 = fs.readFileSync(pngFilePath).toString('base64');
  return [
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 " + OUTPUT_WIDTH + ' ' + OUTPUT_HEIGHT + "'>",
    "  <image width='" +
      OUTPUT_WIDTH +
      "' height='" +
      OUTPUT_HEIGHT +
      "' href='data:image/png;base64," +
      base64 +
      "' preserveAspectRatio='xMidYMid slice' />",
    '</svg>',
    ''
  ].join('\n');
}

function statusFromPng(filePath) {
  const stat = fs.statSync(filePath);
  if (!stat.isFile() || stat.size < 3000) {
    return { ok: false, reason: 'Screenshot file too small.' };
  }
  return { ok: true, size: stat.size };
}

function buildCaptureUrl(port, sample) {
  const samplePath = '/samples/' + sample.phaseDir + '/' + sample.id + '/index.html';
  const params = new URLSearchParams();
  params.set('sample', samplePath);
  params.set('w', String(OUTPUT_WIDTH));
  params.set('h', String(OUTPUT_HEIGHT));
  params.set('settle', String(CAPTURE_SETTLE_MS));
  params.set('timeout', String(CAPTURE_TIMEOUT_MS));
  return 'http://127.0.0.1:' + port + CAPTURE_PAGE_PATH + '?' + params.toString();
}

async function generateRuntimePreviews() {
  const browserExecutable = resolveBrowserExecutable();
  if (!browserExecutable) {
    throw new Error('No supported headless browser executable found (Edge/Chrome).');
  }

  const capturePageFile = path.join(ROOT, CAPTURE_PAGE_PATH.replace(/^\//, '').replace(/\//g, path.sep));
  if (!fs.existsSync(capturePageFile)) {
    throw new Error('Missing capture page: ' + path.relative(ROOT, capturePageFile));
  }

  const allSamples = discoverCanonicalSamples();
  const samples = allSamples.filter((sample) => !FROZEN_SAMPLE_IDS.has(sample.id));
  const tempDir = path.join(ROOT, 'tmp', 'runtime_preview_capture');
  fs.mkdirSync(tempDir, { recursive: true });

  const { server, port } = await launchServer(ROOT);
  const failures = [];
  let generated = 0;
  let totalBytes = 0;

  try {
    for (const sample of samples) {
      const pngPath = path.join(tempDir, sample.id + '.png');
      const svgPath = path.join(sample.sampleDir, 'assets', 'preview.svg');
      fs.mkdirSync(path.dirname(svgPath), { recursive: true });

      const captureUrl = buildCaptureUrl(port, sample);
      try {
        await runHeadlessScreenshot(browserExecutable, captureUrl, pngPath);
      } catch (error) {
        failures.push(sample.id + ' screenshot failed: ' + error.message);
        continue;
      }

      if (!fs.existsSync(pngPath)) {
        failures.push(sample.id + ' screenshot output missing.');
        continue;
      }

      const screenshotStatus = statusFromPng(pngPath);
      if (!screenshotStatus.ok) {
        failures.push(sample.id + ' invalid screenshot: ' + screenshotStatus.reason);
        continue;
      }

      const svgContent = pngToSvg(pngPath);
      fs.writeFileSync(svgPath, svgContent, 'utf8');
      generated += 1;
      totalBytes += screenshotStatus.size;
    }
  } finally {
    await closeServer(server);
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Best effort cleanup.
    }
  }

  if (failures.length > 0) {
    throw new Error('Runtime preview generation failed for ' + failures.length + ' samples. First: ' + failures[0]);
  }
  if (generated !== samples.length) {
    throw new Error('Runtime preview generation incomplete: generated=' + generated + ' expected=' + samples.length);
  }

  const avgBytes = generated > 0 ? Math.round(totalBytes / generated) : 0;
  const skipped = allSamples.length - samples.length;
  console.log(
    'OK runtime previews generated=' + generated + ' skipped=' + skipped + ' (frozen samples) avgPngBytes=' + avgBytes
  );
}

try {
  await generateRuntimePreviews();
} catch (error) {
  console.error('FAIL ' + error.message);
  process.exit(1);
}
