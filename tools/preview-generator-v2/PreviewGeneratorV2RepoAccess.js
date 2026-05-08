const WORKSPACE_REPO_WRITES_SESSION_KEY = "workspace.repo.writes";

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

  static createSessionRepoHandle({ manifest, reference, sessionStorageRef = window.sessionStorage } = {}) {
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
      gamesDir.ensureDirectoryPath(gameFolder);
    }
    return root;
  }

  static getWorkspaceRepoWritesSessionKey() {
    return WORKSPACE_REPO_WRITES_SESSION_KEY;
  }
}

export { PreviewGeneratorV2RepoAccess };
