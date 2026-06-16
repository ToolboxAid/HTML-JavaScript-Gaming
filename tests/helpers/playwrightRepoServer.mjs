import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { handleAdminNotesDirectoryRequest } from "../../src/dev-runtime/admin/admin-notes-directory.mjs";
import { localAdminNotesHeaderPartialPath } from "../../src/dev-runtime/admin/admin-notes-menu.mjs";
import { createLocalApiRouter } from "../../src/dev-runtime/server/local-api-router.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
let repoServerRunId = 0;

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

function isInsideRepoRoot(absolutePath) {
  const relativePath = path.relative(repoRoot, absolutePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function resolveBrowserRoutePath(decodedPath) {
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const webPath = normalizedPath.replace(/\\/g, "/");
  if (webPath === "/tools" || webPath.startsWith("/tools/")) {
    return `/toolbox${webPath.slice("/tools".length)}`;
  }
  if (webPath === "/admin/admin-notes.html") {
    return "/src/dev-runtime/admin/notes.html";
  }
  return normalizedPath;
}

export async function startRepoServer() {
  const previousAuthProvider = process.env.GAMEFOUNDRY_AUTH_PROVIDER;
  const previousDbProvider = process.env.GAMEFOUNDRY_DB_PROVIDER;
  const defaultAuthProvider = !previousAuthProvider && (!previousDbProvider || previousDbProvider === "local-db");
  const defaultDbProvider = !previousDbProvider && (!previousAuthProvider || previousAuthProvider === "local-db");
  if (defaultAuthProvider) {
    process.env.GAMEFOUNDRY_AUTH_PROVIDER = "local-db";
  }
  if (defaultDbProvider) {
    process.env.GAMEFOUNDRY_DB_PROVIDER = "local-db";
  }
  const previousLocalDbPath = process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
  let localDbPath = "";
  if (!previousLocalDbPath) {
    repoServerRunId += 1;
    localDbPath = path.join(repoRoot, "tmp", "local-db", `playwright-repo-server-${process.pid}-${repoServerRunId}.sqlite`);
    process.env.GAMEFOUNDRY_LOCAL_DB_PATH = localDbPath;
  }
  const handleLocalApiRequest = createLocalApiRouter();
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
      const normalizedPath = resolveBrowserRoutePath(decodedPath);
      const absolutePath = path.resolve(repoRoot, `.${normalizedPath}`);
      if (!isInsideRepoRoot(absolutePath)) {
        response.statusCode = 403;
        response.end("Forbidden");
        return;
      }
      let targetPath = absolutePath;
      const stat = await fs.stat(targetPath).catch(() => null);
      if (stat && stat.isDirectory()) {
        targetPath = path.join(targetPath, "index.html");
      }
      targetPath = localAdminNotesHeaderPartialPath(repoRoot, targetPath);
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
      if (!previousLocalDbPath) {
        await fs.rm(localDbPath, { force: true });
        delete process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
      }
      if (defaultAuthProvider) {
        if (previousAuthProvider === undefined) {
          delete process.env.GAMEFOUNDRY_AUTH_PROVIDER;
        } else {
          process.env.GAMEFOUNDRY_AUTH_PROVIDER = previousAuthProvider;
        }
      }
      if (defaultDbProvider) {
        if (previousDbProvider === undefined) {
          delete process.env.GAMEFOUNDRY_DB_PROVIDER;
        } else {
          process.env.GAMEFOUNDRY_DB_PROVIDER = previousDbProvider;
        }
      }
    }
  };
}
