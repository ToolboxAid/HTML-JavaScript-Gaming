const IMPORT_DISABLED_REASON = "Import disabled: Input Mapping V2 imports through Workspace Manager game.manifest launch data. Edit game.manifest.json or relaunch from Workspace Manager with updated tool data.";

export class ActionNavControl {
  constructor({
    locationRef = window.location,
    returnToWorkspaceButton,
    windowRef = window,
    workspaceCopyManifestButton,
    workspaceExportManifestButton,
    workspaceImportManifestButton,
    workspaceNav
  }) {
    this.location = locationRef;
    this.returnToWorkspaceButton = returnToWorkspaceButton;
    this.workspaceCopyManifestButton = workspaceCopyManifestButton;
    this.workspaceExportManifestButton = workspaceExportManifestButton;
    this.workspaceImportManifestButton = workspaceImportManifestButton;
    this.workspaceNav = workspaceNav;
    this.window = windowRef;
  }

  mount({
    onWorkspaceCopyManifest,
    onWorkspaceExportManifest,
    onWorkspaceImportManifest
  }) {
    this.applyLaunchMode();
    this.disableImportAction();
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
    this.workspaceNav.hidden = mode !== "workspace";
    this.workspaceImportManifestButton.hidden = isWorkspaceManagerLaunch;
    this.workspaceCopyManifestButton.hidden = isWorkspaceManagerLaunch;
    this.workspaceExportManifestButton.hidden = isWorkspaceManagerLaunch;
    this.returnToWorkspaceButton.hidden = !isWorkspaceManagerLaunch;
  }

  setToolActionsEnabled(isEnabled) {
    this.disableImportAction();
    this.workspaceCopyManifestButton.disabled = !isEnabled;
    this.workspaceExportManifestButton.disabled = !isEnabled;
  }

  disableImportAction() {
    this.workspaceImportManifestButton.disabled = true;
    this.workspaceImportManifestButton.dataset.disabledReason = IMPORT_DISABLED_REASON;
    this.workspaceImportManifestButton.title = IMPORT_DISABLED_REASON;
  }

  workspaceManagerUrl() {
    const url = new URL("../workspace-manager-v2/index.html", this.location.href);
    const params = new URLSearchParams(this.location.search);
    const hostContextId = params.get("hostContextId") || "";
    if (hostContextId) {
      url.searchParams.set("hostContextId", hostContextId);
    }
    if (params.get("workspaceMode")?.toLowerCase() === "uat") {
      url.searchParams.set("workspace", "uat");
    }
    return url.href;
  }
}
