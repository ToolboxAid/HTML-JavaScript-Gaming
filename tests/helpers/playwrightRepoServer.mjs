import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

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

export async function startRepoServer() {
  const previewWrites = new Map();
  const previewAbsoluteWrites = new Map();
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
      const decodedPath = decodeURIComponent(requestUrl.pathname);
      if (request.method === "GET" && decodedPath === "/__workspace-manager-v2/repo-root") {
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify({ repoRoot }));
        return;
      }
      if (request.method === "PUT" && decodedPath === "/__workspace-manager-v2/write-preview") {
        const absoluteWritePath = String(request.headers["x-workspace-preview-absolute-path"] || "");
        const relativeWritePath = String(request.headers["x-workspace-preview-relative-path"] || "");
        const resolvedWritePath = path.resolve(absoluteWritePath);
        const repoRelativePath = relativeWritePath
          ? relativeWritePath.replaceAll("\\", "/").replace(/^\/+/, "")
          : path.relative(repoRoot, resolvedWritePath).replaceAll("\\", "/");
        if (!absoluteWritePath || !isInsideRepoRoot(resolvedWritePath)) {
          response.statusCode = 403;
          response.end("Preview write path must be inside the repo root.");
          return;
        }
        if (!repoRelativePath || repoRelativePath.startsWith("..") || path.isAbsolute(repoRelativePath)) {
          response.statusCode = 400;
          response.end("Preview write relative path is invalid.");
          return;
        }
        const bodyChunks = [];
        for await (const chunk of request) {
          bodyChunks.push(chunk);
        }
        const body = Buffer.concat(bodyChunks).toString("utf8");
        previewWrites.set(repoRelativePath, body);
        previewAbsoluteWrites.set(resolvedWritePath, body);
        response.statusCode = 200;
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.end("OK");
        return;
      }
      const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
      const absolutePath = path.resolve(repoRoot, `.${normalizedPath}`);
      if (!isInsideRepoRoot(absolutePath)) {
        response.statusCode = 403;
        response.end("Forbidden");
        return;
      }
      if (request.method === "PUT") {
        const bodyChunks = [];
        for await (const chunk of request) {
          bodyChunks.push(chunk);
        }
        const repoRelativePath = normalizedPath
          .replaceAll("\\", "/")
          .replace(/^\/+/, "");
        previewWrites.set(repoRelativePath, Buffer.concat(bodyChunks).toString("utf8"));
        response.statusCode = 200;
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.end("OK");
        return;
      }
      let targetPath = absolutePath;
      const stat = await fs.stat(targetPath).catch(() => null);
      if (stat && stat.isDirectory()) {
        targetPath = path.join(targetPath, "index.html");
      }
      const fileContents = await fs.readFile(targetPath);
      response.statusCode = 200;
      response.setHeader("Content-Type", contentTypeForPath(targetPath));
      response.end(fileContents);
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
    previewAbsoluteWrites,
    previewWrites,
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
