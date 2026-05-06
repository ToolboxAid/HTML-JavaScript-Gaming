export class ActionNavControl {
  constructor({
    locationRef = window.location,
    toolCopyJsonButton,
    toolExportButton,
    toolExportToolStateButton,
    toolNav,
    workspaceCopyManifestButton,
    workspaceInsertAssetsButton,
    workspaceNav
  }) {
    this.location = locationRef;
    this.toolCopyJsonButton = toolCopyJsonButton;
    this.toolExportButton = toolExportButton;
    this.toolExportToolStateButton = toolExportToolStateButton;
    this.toolNav = toolNav;
    this.workspaceCopyManifestButton = workspaceCopyManifestButton;
    this.workspaceInsertAssetsButton = workspaceInsertAssetsButton;
    this.workspaceNav = workspaceNav;
  }

  mount({
    onToolCopyJson,
    onToolExport,
    onToolExportToolState,
    onWorkspaceCopyManifest,
    onWorkspaceInsertAssets
  }) {
    this.applyLaunchMode();
    this.toolExportButton.addEventListener("click", onToolExport);
    this.toolCopyJsonButton.addEventListener("click", onToolCopyJson);
    this.toolExportToolStateButton.addEventListener("click", onToolExportToolState);
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
    this.toolExportButton.disabled = !isEnabled;
    this.toolCopyJsonButton.disabled = !isEnabled;
    this.toolExportToolStateButton.disabled = !isEnabled;
  }

  setWorkspaceActionsEnabled(canInsert, canCopyManifest) {
    this.workspaceInsertAssetsButton.disabled = !canInsert;
    this.workspaceCopyManifestButton.disabled = !canCopyManifest;
  }
}
