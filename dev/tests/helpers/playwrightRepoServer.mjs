import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { handleAdminNotesDirectoryRequest } from "../../../src/dev-runtime/admin/admin-notes-directory.mjs";
import { localAdminNotesHeaderPartialPath } from "../../../src/dev-runtime/admin/admin-notes-menu.mjs";
import { createLocalApiRouter } from "../../../src/dev-runtime/server/local-api-router.mjs";
import { resolveStaticRouteTarget } from "../../../src/dev-runtime/server/static-web-root.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
let runtimeEnvLoaded = false;

function parseEnvValue(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if ((quote === "\"" || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  const commentIndex = trimmed.indexOf(" #");
  return commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex).trim();
}

async function loadRuntimeEnv() {
  if (runtimeEnvLoaded) {
    return;
  }
  runtimeEnvLoaded = true;
  const envPath = path.join(repoRoot, ".env");
  const contents = await fs.readFile(envPath, "utf8").catch(() => "");
  if (!contents) {
    return;
  }
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }
    const normalized = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
    const separatorIndex = normalized.indexOf("=");
    if (separatorIndex <= 0) {
      return;
    }
    const key = normalized.slice(0, separatorIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || process.env[key] !== undefined) {
      return;
    }
    process.env[key] = parseEnvValue(normalized.slice(separatorIndex + 1));
  });
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

export async function startRepoServer({
  gameJourneyCompletionMetricsPostgresClient = null,
  messagesPostgresClient = null,
  webRoot,
} = {}) {
  await loadRuntimeEnv();
  const handleLocalApiRequest = createLocalApiRouter({
    gameJourneyCompletionMetricsPostgresClient,
    messagesPostgresClient,
    repoRoot,
  });
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
      if (await handleLocalApiRequest(request, response, requestUrl)) {
        return;
      }
      if (await handleAdminNotesDirectoryRequest(requestUrl, response, { repoRoot })) {
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
    server.listen(0, "127.0.0.1", () => resolve());
    server.on("error", reject);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to start UI test server.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    repoRoot,
    close: async () => {
      await handleLocalApiRequest.close?.();
      await new Promise((resolve, reject) => {
        const forceClose = setTimeout(() => {
          server.closeAllConnections?.();
        }, 250);
        server.close((error) => {
          clearTimeout(forceClose);
          if (error) reject(error);
          else resolve();
        });
        server.closeIdleConnections?.();
      });
    }
  };
}
