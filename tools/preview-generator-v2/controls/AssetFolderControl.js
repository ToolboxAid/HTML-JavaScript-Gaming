class AssetFolderControl {
  constructor({ assetFolderInput }) {
    this.assetFolderInput = assetFolderInput;
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
