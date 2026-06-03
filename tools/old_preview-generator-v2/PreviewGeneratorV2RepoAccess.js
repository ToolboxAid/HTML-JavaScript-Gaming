const WORKSPACE_REPO_WRITES_SESSION_KEY = "workspace.repo.writes";
const WORKSPACE_REPO_HANDLE_DB_NAME = "workspace-manager-v2-repo-handles";
const WORKSPACE_REPO_HANDLE_STORE_NAME = "repo-handles";
const WORKSPACE_REPO_HANDLE_STORE_KEY = "active-repo-handle";

function normalizePath(value) {
  return String(value || "")
    .replaceAll("\\", "/")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

function readSessionWrites(sessionStorageRef) {
  try {
    const rawValue = sessionStorageRef.getItem(WORKSPACE_REPO_WRITES_SESSION_KEY);
    const writes = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(writes) ? writes : [];
  } catch {
    return [];
  }
}

function appendSessionWrite(sessionStorageRef, write) {
  const writes = readSessionWrites(sessionStorageRef);
  writes.push(write);
  sessionStorageRef.setItem(WORKSPACE_REPO_WRITES_SESSION_KEY, JSON.stringify(writes));
}

function expectedRepoHandleName(reference) {
  if (!reference || typeof reference !== "object") {
    return "";
  }
  return String(reference.handleName || reference.displayName || "").trim();
}

function validateRestoredRepoHandle(repoHandle, reference, source) {
  if (!repoHandle || repoHandle.kind !== "directory" || typeof repoHandle.getDirectoryHandle !== "function") {
    return {
      message: `Workspace Manager V2 repo handle cache returned no live FileSystemDirectoryHandle from ${source}.`,
      ok: false
    };
  }

  const expectedName = expectedRepoHandleName(reference);
  const actualName = String(repoHandle.name || "").trim();
  if (expectedName && actualName && expectedName !== actualName) {
    return {
      message: `Workspace Manager V2 repo handle cache returned handle root ${actualName}, expected ${expectedName}.`,
      ok: false
    };
  }

  return {
    ok: true,
    repoHandle,
    source
  };
}

function openRepoHandleDatabase(windowRef) {
  return new Promise((resolve, reject) => {
    const indexedDb = windowRef?.indexedDB;
    if (!indexedDb || typeof indexedDb.open !== "function") {
      reject(new Error("IndexedDB is unavailable."));
      return;
    }

    const request = indexedDb.open(WORKSPACE_REPO_HANDLE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (db && !db.objectStoreNames.contains(WORKSPACE_REPO_HANDLE_STORE_NAME)) {
        db.createObjectStore(WORKSPACE_REPO_HANDLE_STORE_NAME);
      }
    };
    request.onerror = () => {
      reject(request.error || new Error("Unable to open Workspace Manager V2 repo handle cache."));
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function readCachedRepoHandleFromDatabase(windowRef) {
  return new Promise((resolve, reject) => {
    let db = null;
    openRepoHandleDatabase(windowRef)
      .then((openedDb) => {
        db = openedDb;
        const transaction = db.transaction(WORKSPACE_REPO_HANDLE_STORE_NAME, "readonly");
        const store = transaction.objectStore(WORKSPACE_REPO_HANDLE_STORE_NAME);
        const request = store.get(WORKSPACE_REPO_HANDLE_STORE_KEY);
        request.onerror = () => {
          reject(request.error || new Error("Unable to read Workspace Manager V2 repo handle cache."));
        };
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        transaction.oncomplete = () => {
          if (db && typeof db.close === "function") {
            db.close();
          }
        };
        transaction.onerror = () => {
          reject(transaction.error || new Error("Unable to complete Workspace Manager V2 repo handle cache read."));
          if (db && typeof db.close === "function") {
            db.close();
          }
        };
      })
      .catch(reject);
  });
}

class PreviewGeneratorV2SessionFileHandle {
  constructor({ name, path, sessionStorageRef }) {
    this.kind = "file";
    this.name = name;
    this.path = path;
    this.sessionStorageRef = sessionStorageRef;
    this.contents = "";
  }

  async getFile() {
    const handle = this;
    return {
      async text() {
        return handle.contents;
      }
    };
  }

  async createWritable() {
    const handle = this;
    return {
      async write(contents) {
        handle.contents = String(contents);
        appendSessionWrite(handle.sessionStorageRef, {
          path: handle.path,
          contents: handle.contents
        });
      },
      async close() {}
    };
  }
}

class PreviewGeneratorV2SessionDirectoryHandle {
  constructor({ name, path, sessionStorageRef }) {
    this.kind = "directory";
    this.name = name;
    this.path = path;
    this.sessionStorageRef = sessionStorageRef;
    this.children = new Map();
  }

  addDirectory(name) {
    const directory = new PreviewGeneratorV2SessionDirectoryHandle({
      name,
      path: `${this.path}/${name}`,
      sessionStorageRef: this.sessionStorageRef
    });
    this.children.set(name, directory);
    return directory;
  }

  addFile(name) {
    const file = new PreviewGeneratorV2SessionFileHandle({
      name,
      path: `${this.path}/${name}`,
      sessionStorageRef: this.sessionStorageRef
    });
    this.children.set(name, file);
    return file;
  }

  ensureDirectoryPath(relativePath) {
    let current = this;
    normalizePath(relativePath)
      .split("/")
      .filter(Boolean)
      .forEach((part) => {
        const child = current.children.get(part);
        current = child?.kind === "directory" ? child : current.addDirectory(part);
      });
    return current;
  }

  async getDirectoryHandle(name, options = {}) {
    const child = this.children.get(name);
    if (child?.kind === "directory") {
      return child;
    }
    if (options.create) {
      return this.addDirectory(name);
    }
    throw new Error(`Missing directory: ${this.path}/${name}`);
  }

  async getFileHandle(name, options = {}) {
    const child = this.children.get(name);
    if (child?.kind === "file") {
      return child;
    }
    if (options.create) {
      return this.addFile(name);
    }
    throw new Error(`Missing file: ${this.path}/${name}`);
  }

  async *entries() {
    for (const entry of this.children.entries()) {
      yield entry;
    }
  }
}

class PreviewGeneratorV2RepoAccess {
  static getRepoDestinationDisplayName(handle) {
    const handleName = String(handle?.name || "").trim();
    return handleName || "selected repo folder";
  }

  static async getDirectoryHandle(parentHandle, name) {
    return await parentHandle.getDirectoryHandle(name);
  }

  static async getFileHandle(parentHandle, name, create = false) {
    return await parentHandle.getFileHandle(name, { create });
  }

  static async hasIndexHtml(directoryHandle) {
    try {
      await PreviewGeneratorV2RepoAccess.getFileHandle(directoryHandle, "index.html", false);
      return true;
    } catch {
      return false;
    }
  }

  static async restoreWorkspaceManagerRepoHandle(reference, { windowRef = window } = {}) {
    const hook = windowRef?.__workspaceManagerV2RepoHandleCache;
    if (hook && typeof hook.restore === "function") {
      try {
        const hookValue = await hook.restore({ reference });
        const hookHandle = hookValue?.handle || hookValue?.repoHandle || hookValue;
        const hookResult = validateRestoredRepoHandle(hookHandle, reference, "workspace-manager-v2 runtime repo handle cache");
        if (!hookResult.ok) {
          return hookResult;
        }
        return hookResult;
      } catch (error) {
        return {
          message: `Workspace Manager V2 runtime repo handle cache restore failed: ${error?.message || error}`,
          ok: false
        };
      }
    }

    try {
      const cachedValue = await readCachedRepoHandleFromDatabase(windowRef);
      const cachedHandle = cachedValue?.handle || cachedValue?.repoHandle || cachedValue;
      const cachedResult = validateRestoredRepoHandle(cachedHandle, reference, "workspace-manager-v2 IndexedDB repo handle cache");
      if (!cachedResult.ok) {
        return cachedResult;
      }
      return cachedResult;
    } catch (error) {
      return {
        message: `Workspace Manager V2 IndexedDB repo handle cache restore failed: ${error?.message || error}`,
        ok: false
      };
    }
  }

  static createSessionRepoHandle({ manifest, previewAssetFolder = "", reference, sessionStorageRef = window.sessionStorage } = {}) {
    const repoName = String(reference?.displayName || reference?.handleName || manifest?.repoRoot || "selected").trim() || "selected";
    const root = new PreviewGeneratorV2SessionDirectoryHandle({
      name: repoName,
      path: repoName,
      sessionStorageRef
    });
    root.addDirectory("tools");
    const gamesDir = root.addDirectory("games");
    const gameRoot = normalizePath(manifest?.gameRoot);
    const gameFolder = gameRoot.replace(/^games\//, "").replace(/\/+$/, "");
    if (gameFolder) {
      const gameDir = gamesDir.ensureDirectoryPath(gameFolder);
      const assetFolder = normalizePath(previewAssetFolder);
      if (assetFolder) {
        gameDir.ensureDirectoryPath(assetFolder);
      }
    }
    return root;
  }

  static getWorkspaceRepoWritesSessionKey() {
    return WORKSPACE_REPO_WRITES_SESSION_KEY;
  }
}

export { PreviewGeneratorV2RepoAccess };
