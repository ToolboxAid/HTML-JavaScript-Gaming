import fs from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { localAdminNotesHeaderPartialPath } from "../../api/admin/admin-notes-menu.mjs";
import { startLocalApiServer } from "../../api/server/local-api-server.mjs";
import { resolveStaticRouteTarget } from "../../api/server/static-web-root.mjs";
import {
  parseRoleArgument,
  parseTeamArgument,
  resolveTeamPortConfig,
  supportedBootstrapRolesLabel,
  supportedBootstrapTeamsLabel,
} from "./team-port-config.mjs";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const DEFAULT_HOST = "127.0.0.1";
const RUNTIME_ENV_FILE = ".env";
const VALID_MODES = Object.freeze(["bootstrap", "api", "web"]);
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function parseRuntimeEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
    return null;
  }
  const index = trimmed.indexOf("=");
  const key = trimmed.slice(0, index).trim();
  let value = trimmed.slice(index + 1).trim();
  if (!key) {
    return null;
  }
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

export function loadRuntimeEnv({
  cwd = process.cwd(),
  env = process.env,
} = {}) {
  const envPath = path.resolve(cwd, RUNTIME_ENV_FILE);
  if (!existsSync(envPath)) {
    return {
      loaded: false,
      loadedKeys: 0,
    };
  }
  let loadedKeys = 0;
  readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
    const parsed = parseRuntimeEnvLine(line);
    if (!parsed || env[parsed.key] !== undefined) {
      return;
    }
    env[parsed.key] = parsed.value;
    loadedKeys += 1;
  });
  return {
    loaded: true,
    loadedKeys,
  };
}

function contentTypeForPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js" || extension === ".mjs") return "text/javascript; charset=utf-8";
  if (extension === ".json") return "application/json";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  if (extension === ".wav") return "audio/wav";
  if (extension === ".mp3") return "audio/mpeg";
  if (extension === ".ogg") return "audio/ogg";
  if (extension === ".m4a") return "audio/mp4";
  if (extension === ".woff2") return "font/woff2";
  if (extension === ".woff") return "font/woff";
  if (extension === ".ttf") return "font/ttf";
  if (extension === ".otf") return "font/otf";
  if (extension === ".csv") return "text/csv; charset=utf-8";
  if (extension === ".txt") return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

function parseModeArgument(args = []) {
  const values = Array.from(args);
  for (let index = 0; index < values.length; index += 1) {
    const argument = values[index];
    if (argument === "--mode") {
      const value = values[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing bootstrap mode after --mode. Use one of: ${VALID_MODES.join(", ")}.`);
      }
      return value.trim().toLowerCase();
    }
    if (argument.startsWith("--mode=")) {
      const value = argument.slice("--mode=".length).trim().toLowerCase();
      if (!value) {
        throw new Error(`Missing bootstrap mode after --mode=. Use one of: ${VALID_MODES.join(", ")}.`);
      }
      return value;
    }
  }
  return "bootstrap";
}

export function parseBootstrapOptions(args = []) {
  const mode = parseModeArgument(args);
  if (!VALID_MODES.includes(mode)) {
    throw new Error(`Unknown bootstrap mode "${mode}". Use one of: ${VALID_MODES.join(", ")}.`);
  }
  const role = parseRoleArgument(args);
  const team = parseTeamArgument(args);
  const ports = resolveTeamPortConfig({ role, team });
  return Object.freeze({
    api: mode === "api" || mode === "bootstrap",
    mode,
    ports,
    role: ports.role,
    team: ports.team,
    web: mode === "web" || mode === "bootstrap",
  });
}

function localUrl(host, port) {
  return `http://${host}:${port}`;
}

function apiUrl(host, port) {
  return `${localUrl(host, port)}/api`;
}

export function teamIndexUrl(webBaseUrl) {
  return `${String(webBaseUrl || "").replace(/\/+$/, "")}/index.html`;
}

export function shouldLaunchBrowser(options) {
  return Boolean(options?.api && options?.web && options?.role === "owner");
}

export function applyBootstrapEnvironment({
  env = process.env,
  host = DEFAULT_HOST,
  ports,
}) {
  env.GAMEFOUNDRY_LOCAL_API_HOST = host;
  env.GAMEFOUNDRY_LOCAL_API_PORT = String(ports.apiPort);
  env.GAMEFOUNDRY_API_URL = apiUrl(host, ports.apiPort);
  env.GAMEFOUNDRY_SITE_URL = localUrl(host, ports.webPort);
  return env;
}

export function formatBootstrapDiagnostics({
  apiBaseUrl,
  browserLaunch,
  mode,
  role,
  runtimeEnv,
  team,
  webBaseUrl,
}) {
  return [
    "GameFoundry team-aware dev bootstrap",
    `Mode: ${mode}`,
    `Team: ${team}`,
    `Role: ${role}`,
    `Web URL: ${webBaseUrl}`,
    `API URL: ${apiBaseUrl}/api`,
    browserLaunch?.enabled
      ? `Browser launch: ${browserLaunch.url}`
      : `Browser launch: ${browserLaunch?.reason || "not requested"}`,
    "Environment source: .env + process environment",
    `.env loaded: ${runtimeEnv.loaded ? `yes (${runtimeEnv.loadedKeys} new key(s))` : "no"}`,
    `Supported teams: ${supportedBootstrapTeamsLabel()}`,
    `Supported roles: ${supportedBootstrapRolesLabel()}`,
    "Legacy API alias remains: npm run dev:local-api",
    "Press Ctrl+C to stop.",
  ];
}

export function launchBrowser(url, {
  platform = process.platform,
  spawnFn = spawn,
} = {}) {
  let command;
  let args;
  if (platform === "win32") {
    command = "cmd";
    args = ["/c", "start", "", url];
  } else if (platform === "darwin") {
    command = "open";
    args = [url];
  } else {
    command = "xdg-open";
    args = [url];
  }
  const child = spawnFn(command, args, {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child?.unref?.();
  return {
    args,
    command,
    enabled: true,
    url,
  };
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

async function proxyApiRequest(request, response, requestUrl, apiBaseUrl) {
  const targetUrl = new URL(`${requestUrl.pathname}${requestUrl.search}`, apiBaseUrl);
  const headers = {};
  Object.entries(request.headers).forEach(([key, value]) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase()) && value !== undefined) {
      headers[key] = value;
    }
  });
  const method = request.method || "GET";
  const upstreamResponse = await fetch(targetUrl, {
    body: ["GET", "HEAD"].includes(method.toUpperCase()) ? undefined : await readRequestBody(request),
    headers,
    method,
  });
  response.statusCode = upstreamResponse.status;
  upstreamResponse.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      response.setHeader(key, value);
    }
  });
  const body = Buffer.from(await upstreamResponse.arrayBuffer());
  response.end(body);
}

export async function startStaticWebServer({
  apiBaseUrl,
  host = DEFAULT_HOST,
  port,
  webRoot,
} = {}) {
  if (!apiBaseUrl) {
    throw new Error("startStaticWebServer requires apiBaseUrl.");
  }
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", `http://${host}:${port}`);
      if (requestUrl.pathname === "/api" || requestUrl.pathname.startsWith("/api/")) {
        await proxyApiRequest(request, response, requestUrl, apiBaseUrl);
        return;
      }
      const decodedPath = decodeURIComponent(requestUrl.pathname);
      const routeTarget = await resolveStaticRouteTarget({ decodedPath, repoRoot, webRoot });
      if (!routeTarget.targetPath) {
        response.statusCode = 404;
        response.end("Not Found");
        return;
      }
      const targetPath = localAdminNotesHeaderPartialPath(repoRoot, routeTarget.targetPath);
      const responseContents = await fs.readFile(targetPath);
      response.statusCode = 200;
      response.setHeader("Content-Type", contentTypeForPath(targetPath));
      response.end(responseContents);
    } catch {
      response.statusCode = 404;
      response.end("Not Found");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });

  return {
    baseUrl: localUrl(host, server.address()?.port || port),
    close: async () => {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    },
    server,
  };
}

export async function startBootstrapRuntime(
  options = parseBootstrapOptions(process.argv.slice(2)),
  {
    apiServerStarter = startLocalApiServer,
    browserLauncher = launchBrowser,
    env = process.env,
    loadEnv = () => loadRuntimeEnv({ env }),
    webServerStarter = startStaticWebServer,
  } = {},
) {
  const runtimeEnv = loadEnv();
  const host = DEFAULT_HOST;
  applyBootstrapEnvironment({ env, host, ports: options.ports });
  const apiBaseUrl = localUrl(host, options.ports.apiPort);
  const webBaseUrl = env.GAMEFOUNDRY_SITE_URL;
  const servers = [];

  if (options.api) {
    servers.push(await apiServerStarter({ host, port: options.ports.apiPort }));
  }
  if (options.web) {
    servers.push(await webServerStarter({ apiBaseUrl, host, port: options.ports.webPort }));
  }

  const browserUrl = teamIndexUrl(webBaseUrl);
  const browserLaunch = shouldLaunchBrowser(options)
    ? browserLauncher(browserUrl)
    : {
      enabled: false,
      reason: options.role === "codex"
        ? "skipped for codex role"
        : "requires bootstrap mode with API and web servers",
      url: browserUrl,
    };

  return {
    close: async () => {
      await Promise.all(servers.map((server) => server.close()));
    },
    diagnostics: formatBootstrapDiagnostics({
      apiBaseUrl,
      browserLaunch,
      mode: options.mode,
      role: options.role,
      runtimeEnv,
      team: options.team,
      webBaseUrl,
    }),
    servers,
  };
}

async function main() {
  let runtime;
  try {
    runtime = await startBootstrapRuntime();
    runtime.diagnostics.forEach((line) => console.log(line));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, async () => {
      await runtime.close();
      process.exit(0);
    });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
