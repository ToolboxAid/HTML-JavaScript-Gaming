export class ActionNavControl {
  constructor({
    locationRef = window.location,
    toolCopyJsonButton,
    toolExportButton,
    toolExportToolStateButton,
    toolNav,
    workspaceCopyManifestButton,
    workspaceExportManifestButton,
    workspaceImportManifestButton,
    workspaceNav
  }) {
    this.location = locationRef;
    this.toolCopyJsonButton = toolCopyJsonButton;
    this.toolExportButton = toolExportButton;
    this.toolExportToolStateButton = toolExportToolStateButton;
    this.toolNav = toolNav;
    this.workspaceCopyManifestButton = workspaceCopyManifestButton;
    this.workspaceExportManifestButton = workspaceExportManifestButton;
    this.workspaceImportManifestButton = workspaceImportManifestButton;
    this.workspaceNav = workspaceNav;
  }

  mount({
    onToolCopyJson,
    onToolExport,
    onToolExportToolState,
    onWorkspaceCopyManifest,
    onWorkspaceExportManifest,
    onWorkspaceImportManifest
  }) {
    this.applyLaunchMode();
    this.toolExportButton.addEventListener("click", onToolExport);
    this.toolCopyJsonButton.addEventListener("click", onToolCopyJson);
    this.toolExportToolStateButton.addEventListener("click", onToolExportToolState);
    this.workspaceImportManifestButton.addEventListener("click", onWorkspaceImportManifest);
    this.workspaceCopyManifestButton.addEventListener("click", onWorkspaceCopyManifest);
    this.workspaceExportManifestButton.addEventListener("click", onWorkspaceExportManifest);
  }

  applyLaunchMode() {
    const mode = new URLSearchParams(this.location.search).get("launch") === "workspace"
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
}
