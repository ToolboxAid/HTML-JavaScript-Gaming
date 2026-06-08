import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { handleAdminNotesDirectoryRequest } from "../../src/dev-runtime/admin/admin-notes-directory.mjs";
import { localAdminNotesHeaderPartialPath } from "../../src/dev-runtime/admin/admin-notes-menu.mjs";
import { createMockApiRouter } from "../../src/dev-runtime/server/mock-api-router.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

function contentTypeForPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js" || extension === ".mjs") return "text/javascript; charset=utf-8";
  if (extension === ".json") return "application/json; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
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
  return normalizedPath;
}

export async function startRepoServer() {
  const handleMockApiRequest = createMockApiRouter();
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
      if (await handleMockApiRequest(request, response, requestUrl)) {
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
    }
  };
}
