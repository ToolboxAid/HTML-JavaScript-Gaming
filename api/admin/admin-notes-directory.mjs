import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ADMIN_NOTES_DIRECTORY = "dev/archive/legacy-docs-build/admin-notes";
const DIRECTORY_LIST_QUERY = "adminNotesDirectory";
const DIRECTORY_API_PATH = "/api/dev/admin-notes/directory";
const NOTE_INDEX_FILE = "index.txt";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "accept, content-type");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function repoRelativePath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

function isInside(parentPath, childPath) {
  const relativePath = path.relative(parentPath, childPath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function safeAdminNotesFolder(repoRoot, requestPath) {
  const relativeFolderPath = repoRelativePath(decodeURIComponent(requestPath || ""));
  const hasTraversalSegment = relativeFolderPath
    .split("/")
    .some((segment) => segment === "." || segment === "..");
  if (hasTraversalSegment) {
    return null;
  }
  if (relativeFolderPath !== ADMIN_NOTES_DIRECTORY && !relativeFolderPath.startsWith(`${ADMIN_NOTES_DIRECTORY}/`)) {
    return null;
  }
  const notesRoot = path.resolve(repoRoot, ADMIN_NOTES_DIRECTORY);
  const folderPath = path.resolve(repoRoot, relativeFolderPath);
  if (!isInside(notesRoot, folderPath)) {
    return null;
  }
  return {
    absolutePath: folderPath,
    relativePath: relativeFolderPath,
  };
}

async function adminNotesDirectoryResult(repoRoot, folderPath) {
  const safeFolder = safeAdminNotesFolder(repoRoot, folderPath);
  if (!safeFolder) {
    return {
      payload: {
        entries: [],
        error: "Admin Notes directory listing is restricted to dev/archive/legacy-docs-build/admin-notes/.",
        ok: false,
      },
      statusCode: 403,
    };
  }

  const stat = await fs.stat(safeFolder.absolutePath).catch(() => null);
  if (!stat?.isDirectory()) {
    return {
      payload: {
        entries: [],
        error: `Admin Notes folder not found: ${safeFolder.relativePath}.`,
        ok: false,
      },
      statusCode: 404,
    };
  }

  const dirents = await fs.readdir(safeFolder.absolutePath, { withFileTypes: true });
  const entries = (await Promise.all(dirents.map(async (dirent) => {
    return fileEntry(safeFolder.relativePath, dirent) ||
      await folderEntry(safeFolder.relativePath, safeFolder.absolutePath, dirent);
  })))
    .filter(Boolean)
    .sort((left, right) => left.label.localeCompare(right.label));

  return {
    payload: {
      entries,
      folderFileUrl: pathToFileURL(safeFolder.absolutePath).href,
      folderPath: safeFolder.relativePath,
      ok: true,
    },
    statusCode: 200,
  };
}

function fileEntry(folderPath, dirent) {
  if (!dirent.isFile() || path.extname(dirent.name).toLowerCase() !== ".txt") {
    return null;
  }
  return {
    label: dirent.name,
    path: `${folderPath}/${dirent.name}`,
    type: "file",
  };
}

async function folderEntry(folderPath, absoluteFolderPath, dirent) {
  if (!dirent.isDirectory()) {
    return null;
  }
  const indexPath = path.join(absoluteFolderPath, dirent.name, NOTE_INDEX_FILE);
  const stat = await fs.stat(indexPath).catch(() => null);
  if (!stat?.isFile()) {
    return null;
  }
  return {
    label: `${dirent.name}/`,
    path: `${folderPath}/${dirent.name}/${NOTE_INDEX_FILE}`,
    type: "folder",
  };
}

export async function handleAdminNotesDirectoryApiRequest(requestUrl, response, { repoRoot }) {
  if (requestUrl.pathname !== DIRECTORY_API_PATH) {
    return false;
  }

  const folderPath = requestUrl.searchParams.get("folder") || ADMIN_NOTES_DIRECTORY;
  const result = await adminNotesDirectoryResult(repoRoot, folderPath);
  sendJson(response, result.statusCode, result.payload);
  return true;
}

export async function handleAdminNotesDirectoryRequest(requestUrl, response, { repoRoot }) {
  if (!requestUrl.searchParams.has(DIRECTORY_LIST_QUERY)) {
    return false;
  }

  const result = await adminNotesDirectoryResult(repoRoot, requestUrl.pathname);
  sendJson(response, result.statusCode, result.payload);
  return true;
}
