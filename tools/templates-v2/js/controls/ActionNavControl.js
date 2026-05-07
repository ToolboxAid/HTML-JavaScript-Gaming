export class ActionNavControl {
  constructor({
    locationRef = window.location,
    returnToWorkspaceButton,
    windowRef = window,
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
    this.returnToWorkspaceButton = returnToWorkspaceButton;
    this.toolCopyJsonButton = toolCopyJsonButton;
    this.toolExportButton = toolExportButton;
    this.toolExportToolStateButton = toolExportToolStateButton;
    this.toolNav = toolNav;
    this.workspaceCopyManifestButton = workspaceCopyManifestButton;
    this.workspaceExportManifestButton = workspaceExportManifestButton;
    this.workspaceImportManifestButton = workspaceImportManifestButton;
    this.workspaceNav = workspaceNav;
    this.window = windowRef;
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
    this.returnToWorkspaceButton.addEventListener("click", () => {
      this.window.location.href = this.workspaceManagerUrl();
    });
  }

  applyLaunchMode() {
    const params = new URLSearchParams(this.location.search);
    const mode = params.get("launch") === "workspace"
      ? "workspace"
      : "tool";
    const isWorkspaceManagerLaunch = mode === "workspace" && params.get("fromTool") === "workspace-manager-v2";
    this.toolNav.hidden = mode !== "tool";
    this.workspaceNav.hidden = mode !== "workspace";
    this.workspaceImportManifestButton.hidden = isWorkspaceManagerLaunch;
    this.workspaceCopyManifestButton.hidden = isWorkspaceManagerLaunch;
    this.workspaceExportManifestButton.hidden = isWorkspaceManagerLaunch;
    this.returnToWorkspaceButton.hidden = !isWorkspaceManagerLaunch;
  }

  setToolActionsEnabled(isEnabled) {
    this.toolExportButton.disabled = !isEnabled;
    this.toolCopyJsonButton.disabled = !isEnabled;
    this.toolExportToolStateButton.disabled = !isEnabled;
  }

  workspaceManagerUrl() {
    const url = new URL("../workspace-manager-v2/index.html", this.location.href);
    const hostContextId = new URLSearchParams(this.location.search).get("hostContextId") || "";
    if (hostContextId) {
      url.searchParams.set("hostContextId", hostContextId);
    }
    return url.href;
  }
}
