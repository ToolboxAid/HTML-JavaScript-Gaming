import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolveTeamPortConfig, supportedBootstrapTeamsMessage } from "./team-port-config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const DEFAULT_ENV_FILE = ".env";

function parseEnvValue(value) {
  const trimmed = String(value || "").trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseEnvLine(line) {
  const trimmed = String(line || "").trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
    return null;
  }
  const separatorIndex = trimmed.indexOf("=");
  const key = trimmed.slice(0, separatorIndex).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    return null;
  }
  return {
    key,
    value: parseEnvValue(trimmed.slice(separatorIndex + 1)),
  };
}

export function loadEnvironmentFile({
  env = process.env,
  envFile = path.resolve(repoRoot, DEFAULT_ENV_FILE),
} = {}) {
  if (!existsSync(envFile)) {
    return Object.freeze({
      loaded: false,
      loadedKeys: [],
      path: envFile,
    });
  }
  const loadedKeys = [];
  readFileSync(envFile, "utf8").split(/\r?\n/).forEach((line) => {
    const parsed = parseEnvLine(line);
    if (!parsed || env[parsed.key] !== undefined) {
      return;
    }
    env[parsed.key] = parsed.value;
    loadedKeys.push(parsed.key);
  });
  return Object.freeze({
    loaded: true,
    loadedKeys: Object.freeze(loadedKeys),
    path: envFile,
  });
}

export function applyTeamBootstrapEnvironment(env, teamConfig) {
  env.GAMEFOUNDRY_LOCAL_API_HOST = teamConfig.host;
  env.GAMEFOUNDRY_LOCAL_API_PORT = String(teamConfig.apiPort);
  env.GAMEFOUNDRY_SITE_URL = teamConfig.webUrl;
  env.GAMEFOUNDRY_API_URL = teamConfig.apiUrl;
  return env;
}

export function parseBootstrapArgs(argv = []) {
  const options = {
    openBrowser: false,
    startApi: true,
    startWeb: true,
    team: "owner",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--team") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for --team. Use --team ${supportedBootstrapTeamsMessage()}.`);
      }
      options.team = value;
      index += 1;
    } else if (argument.startsWith("--team=")) {
      options.team = argument.slice("--team=".length);
    } else if (argument === "--api-only") {
      options.startApi = true;
      options.startWeb = false;
    } else if (argument === "--web-only") {
      options.startApi = false;
      options.startWeb = true;
    } else if (argument === "--api") {
      options.startApi = true;
    } else if (argument === "--web") {
      options.startWeb = true;
    } else if (argument === "--no-api") {
      options.startApi = false;
    } else if (argument === "--no-web") {
      options.startWeb = false;
    } else if (argument === "--open") {
      options.openBrowser = true;
    } else if (argument === "--no-open") {
      options.openBrowser = false;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown bootstrap option "${argument}". Use --team ${supportedBootstrapTeamsMessage()}, --api-only, --web-only, or --open.`);
    }
  }

  if (!options.help && !options.startApi && !options.startWeb) {
    throw new Error("Bootstrap must start at least one process. Use --api-only, --web-only, or the default combined startup.");
  }

  return Object.freeze(options);
}

function contentTypeForPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js" || extension === ".mjs") return "text/javascript; charset=utf-8";
  if (extension === ".json") return "application/json; charset=utf-8";
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

function isInsideRoot(root, absolutePath) {
  const relativePath = path.relative(root, absolutePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function resolveWebRoutePath(requestPath) {
  const normalizedPath = path.normalize(decodeURIComponent(requestPath || "/")).replace(/^(\.\.[/\\])+/, "");
  const webPath = normalizedPath.replace(/\\/g, "/");
  if (webPath === "/tools" || webPath.startsWith("/tools/")) {
    return `/toolbox${webPath.slice("/tools".length)}`;
  }
  return normalizedPath;
}

export async function startStaticWebServer({
  host,
  port,
  root = repoRoot,
} = {}) {
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", `http://${host}:${port}`);
      const routePath = resolveWebRoutePath(requestUrl.pathname);
      const absolutePath = path.resolve(root, `.${routePath}`);
      if (!isInsideRoot(root, absolutePath)) {
        response.statusCode = 403;
        response.end("Forbidden");
        return;
      }

      let targetPath = absolutePath;
      const stat = await fs.stat(targetPath).catch(() => null);
      if (stat && stat.isDirectory()) {
        targetPath = path.join(targetPath, "index.html");
      }
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

  return Object.freeze({
    close: () => new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    }),
    server,
    url: `http://${host}:${port}`,
  });
}

export function formatBootstrapDiagnostics({
  envLoad,
  openBrowser,
  startApi,
  startWeb,
  teamConfig,
} = {}) {
  const envStatus = envLoad?.loaded
    ? `${path.relative(repoRoot, envLoad.path).replace(/\\/g, "/")} loaded (${envLoad.loadedKeys.length} key(s) applied)`
    : `${DEFAULT_ENV_FILE} not found; using process environment`;
  return [
    "GameFoundry local bootstrap",
    `Team: ${teamConfig.team}`,
    `Web: ${startWeb ? `enabled ${teamConfig.webUrl}` : "disabled"}`,
    `API: ${startApi ? `enabled ${teamConfig.apiUrl}` : "disabled"}`,
    `Selected ports: web ${teamConfig.webPort}, api ${teamConfig.apiPort}`,
    `Environment: ${envStatus}`,
    `Browser launch: ${openBrowser ? "enabled" : "disabled"}`,
  ];
}

function startApiProcess({ env }) {
  return spawn(
    process.execPath,
    ["--use-system-ca", "./dev/scripts/start-local-api-server.mjs"],
    {
      cwd: repoRoot,
      env,
      stdio: "inherit",
    }
  );
}

function browserLaunchCommand(url) {
  if (process.platform === "win32") {
    return { args: ["/c", "start", "", url], command: "cmd" };
  }
  if (process.platform === "darwin") {
    return { args: [url], command: "open" };
  }
  return { args: [url], command: "xdg-open" };
}

function openBrowser(url) {
  const launch = browserLaunchCommand(url);
  const child = spawn(launch.command, launch.args, {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

function printHelp() {
  console.log([
    "Usage: node ./dev/bootstrap/start-dev.mjs [--team owner|alpha|bravo|charlie|gamma|beta|default] [--api-only|--web-only] [--open]",
    "",
    "Default startup launches both the API runtime and static web server.",
    "Use --api-only for API-only startup or --web-only for web-only startup.",
  ].join("\n"));
}

export async function runBootstrap(argv = process.argv.slice(2), {
  env = process.env,
  startApi = startApiProcess,
  startWeb = startStaticWebServer,
} = {}) {
  const options = parseBootstrapArgs(argv);
  if (options.help) {
    printHelp();
    return Object.freeze({ status: "help" });
  }

  const teamConfig = resolveTeamPortConfig(options.team);
  const envLoad = loadEnvironmentFile({ env });
  const processEnv = applyTeamBootstrapEnvironment({ ...env }, teamConfig);

  formatBootstrapDiagnostics({
    envLoad,
    openBrowser: options.openBrowser,
    startApi: options.startApi,
    startWeb: options.startWeb,
    teamConfig,
  }).forEach((line) => console.log(line));

  let webServer = null;
  let apiProcess = null;
  let shuttingDown = false;

  async function shutdown(exitCode = 0) {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    if (apiProcess && !apiProcess.killed) {
      apiProcess.kill("SIGTERM");
    }
    if (webServer) {
      await webServer.close();
    }
    process.exit(exitCode);
  }

  if (options.startWeb) {
    webServer = await startWeb({
      host: teamConfig.host,
      port: teamConfig.webPort,
      root: repoRoot,
    });
    console.log(`GameFoundry static web server running at ${webServer.url}`);
  }

  if (options.startApi) {
    apiProcess = startApi({ env: processEnv });
    apiProcess.once("exit", async (code, signal) => {
      if (shuttingDown) {
        return;
      }
      const exitReason = signal || (code ?? "unknown");
      console.error(`GameFoundry API process exited (${exitReason}).`);
      await shutdown(code || 1);
    });
  }

  if (options.openBrowser) {
    openBrowser(options.startWeb ? teamConfig.webUrl : teamConfig.apiUrl);
  }

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      shutdown(0).catch((error) => {
        console.error(error instanceof Error ? error.stack || error.message : String(error));
        process.exit(1);
      });
    });
  }

  return Object.freeze({
    apiProcess,
    envLoad,
    teamConfig,
    webServer,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runBootstrap().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
