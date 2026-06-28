import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleAdminNotesDirectoryRequest } from "../admin/admin-notes-directory.mjs";
import { localAdminNotesHeaderPartialPath } from "../admin/admin-notes-menu.mjs";
import { createLocalApiRouter } from "./local-api-router.mjs";
import { resolveStaticRouteTarget } from "./static-web-root.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");

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

export async function startLocalApiServer({
  host = "127.0.0.1",
  port = 5501,
  webRoot,
} = {}) {
  const handleApiRuntimeRequest = createLocalApiRouter({ repoRoot });
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", `http://${host}:${port}`);
      if (await handleApiRuntimeRequest(request, response, requestUrl)) {
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
    server.once("error", reject);
    server.listen(port, host, resolve);
  });

  return {
    baseUrl: `http://${host}:${port}`,
    close: async () => {
      await handleApiRuntimeRequest.close?.();
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
