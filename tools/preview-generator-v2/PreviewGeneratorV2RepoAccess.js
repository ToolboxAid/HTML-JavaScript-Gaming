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
}

export { PreviewGeneratorV2RepoAccess };
