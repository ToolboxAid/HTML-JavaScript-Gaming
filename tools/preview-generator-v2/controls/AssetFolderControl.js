class AssetFolderControl {
  constructor({ documentRef = document } = {}) {
    this.assetFolderInput = documentRef.getElementById("assetFolder");
  }

  getRawValue() {
    return String(this.assetFolderInput.value || "").trim();
  }

  hasValue() {
    return this.getRawValue().length > 0;
  }

  onInput(handler) {
    this.assetFolderInput.addEventListener("input", handler);
  }
}

export { AssetFolderControl };
