export class ActionNavControl {
  constructor({
    locationRef = window.location,
    navExportJsonButton,
    navImportJsonButton,
    navImportJsonInput,
    toolNav,
    workspaceCopyManifestButton,
    workspaceInsertAssetsButton,
    workspaceNav
  }) {
    this.location = locationRef;
    this.navExportJsonButton = navExportJsonButton;
    this.navImportJsonButton = navImportJsonButton;
    this.navImportJsonInput = navImportJsonInput;
    this.toolNav = toolNav;
    this.workspaceCopyManifestButton = workspaceCopyManifestButton;
    this.workspaceInsertAssetsButton = workspaceInsertAssetsButton;
    this.workspaceNav = workspaceNav;
  }

  mount({
    onNavExportJson,
    onNavImportJson,
    onWorkspaceCopyManifest,
    onWorkspaceInsertAssets
  }) {
    this.applyLaunchMode();
    this.navImportJsonButton.addEventListener("click", () => this.navImportJsonInput.click());
    this.navImportJsonInput.addEventListener("change", () => {
      const file = this.navImportJsonInput.files?.[0] || null;
      this.navImportJsonInput.value = "";
      onNavImportJson(file);
    });
    this.navExportJsonButton.addEventListener("click", onNavExportJson);
    this.workspaceInsertAssetsButton.addEventListener("click", onWorkspaceInsertAssets);
    this.workspaceCopyManifestButton.addEventListener("click", onWorkspaceCopyManifest);
  }

  applyLaunchMode() {
    const params = new URLSearchParams(this.location.search);
    const mode = params.get("launch") === "workspace" || params.get("fromTool") === "workspace-v2"
      ? "workspace"
      : "tool";
    this.toolNav.hidden = mode !== "tool";
    this.workspaceNav.hidden = mode !== "workspace";
  }

  setToolActionsEnabled(isEnabled) {
    this.navImportJsonButton.disabled = !isEnabled;
    this.navExportJsonButton.disabled = !isEnabled;
  }

  setWorkspaceActionsEnabled(canInsert, canCopyManifest) {
    this.workspaceInsertAssetsButton.disabled = !canInsert;
    this.workspaceCopyManifestButton.disabled = !canCopyManifest;
  }
}
