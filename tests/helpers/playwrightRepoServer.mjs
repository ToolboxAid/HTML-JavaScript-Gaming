import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createMockApiRouter } from "../../src/dev-runtime/server/mock-api-router.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const adminNotesRoot = path.resolve(repoRoot, "docs_build", "dev", "admin-notes");
const adminNotesRootRelative = "docs_build/dev/admin-notes";
const adminNotesIndexFile = "index.txt";

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

function isInsideAdminNotesRoot(absolutePath) {
  const relativePath = path.relative(adminNotesRoot, absolutePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function repoRelativePath(absolutePath) {
  return path.relative(repoRoot, absolutePath).replace(/\\/g, "/");
}

async function writeAdminNotesDirectoryListing(absolutePath, response) {
  if (!isInsideAdminNotesRoot(absolutePath)) {
    response.statusCode = 403;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Forbidden", entries: [] }));
    return;
  }

  const stat = await fs.stat(absolutePath).catch(() => null);
  if (!stat || !stat.isDirectory()) {
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({
      root: adminNotesRootRelative,
      folderPath: repoRelativePath(absolutePath),
      folderFileUrl: "",
      entries: []
    }));
    return;
  }

  const directoryEntries = await fs.readdir(absolutePath, { withFileTypes: true });
  const entries = await Promise.all(directoryEntries.map(async (entry) => {
    const absoluteEntryPath = path.join(absolutePath, entry.name);
    if (entry.isDirectory()) {
      const indexPath = path.join(absoluteEntryPath, adminNotesIndexFile);
      const hasIndex = Boolean(await fs.stat(indexPath).catch(() => null));
      return {
        type: "folder",
        label: `${entry.name}/`,
        path: repoRelativePath(indexPath),
        hasIndex
      };
    }
    if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".txt") {
      return {
        type: "file",
        label: entry.name,
        path: repoRelativePath(absoluteEntryPath)
      };
    }
    return null;
  }));

  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify({
    root: adminNotesRootRelative,
    folderPath: repoRelativePath(absolutePath),
    folderFileUrl: pathToFileURL(absolutePath).href,
    entries: entries.filter(Boolean)
  }));
}

export async function startRepoServer() {
  const handleMockApiRequest = createMockApiRouter();
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
      if (await handleMockApiRequest(request, response, requestUrl)) {
        return;
      }
      const decodedPath = decodeURIComponent(requestUrl.pathname);
      const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
      const absolutePath = path.resolve(repoRoot, `.${normalizedPath}`);
      if (!isInsideRepoRoot(absolutePath)) {
        response.statusCode = 403;
        response.end("Forbidden");
        return;
      }
      if (requestUrl.searchParams.has("adminNotesDirectory")) {
        await writeAdminNotesDirectoryListing(absolutePath, response);
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
