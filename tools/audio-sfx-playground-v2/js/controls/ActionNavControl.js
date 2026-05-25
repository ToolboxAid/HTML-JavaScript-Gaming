export class ActionNavControl {
  constructor({
    locationRef = window.location,
    returnToWorkspaceButton,
    windowRef = window,
    toolCopyJsonButton,
    toolExportToolStateButton,
    toolImportJsonButton,
    toolImportJsonInput,
    toolNav,
    toolPlayButton,
    workspaceCopyManifestButton,
    workspaceExportManifestButton,
    workspaceImportManifestButton,
    workspaceNav
  }) {
    this.location = locationRef;
    this.returnToWorkspaceButton = returnToWorkspaceButton;
    this.toolCopyJsonButton = toolCopyJsonButton;
    this.toolExportToolStateButton = toolExportToolStateButton;
    this.toolImportJsonButton = toolImportJsonButton;
    this.toolImportJsonInput = toolImportJsonInput;
    this.toolNav = toolNav;
    this.toolPlayButton = toolPlayButton;
    this.workspaceCopyManifestButton = workspaceCopyManifestButton;
    this.workspaceExportManifestButton = workspaceExportManifestButton;
    this.workspaceImportManifestButton = workspaceImportManifestButton;
    this.workspaceNav = workspaceNav;
    this.window = windowRef;
  }

  mount({
    onToolCopyJson,
    onToolExportToolState,
    onToolImportJson,
    onToolPlay,
    onWorkspaceCopyManifest,
    onWorkspaceExportManifest,
    onWorkspaceImportManifest
  }) {
    this.applyLaunchMode();
    this.toolPlayButton.addEventListener("click", onToolPlay);
    this.toolImportJsonButton.addEventListener("click", () => {
      this.toolImportJsonInput.value = "";
      this.toolImportJsonInput.click();
    });
    this.toolImportJsonInput.addEventListener("change", () => {
      const [file] = this.toolImportJsonInput.files;
      if (file) {
        onToolImportJson(file);
      }
    });
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
    this.toolPlayButton.disabled = !isEnabled;
    this.toolCopyJsonButton.disabled = !isEnabled;
    this.toolExportToolStateButton.disabled = !isEnabled;
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
