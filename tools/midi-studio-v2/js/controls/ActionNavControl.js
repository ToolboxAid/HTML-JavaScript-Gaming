export class ActionNavControl {
  constructor({
    locationRef = window.location,
    returnToWorkspaceButton,
    toolCopyJsonButton,
    toolExportToolStateButton,
    toolImportManifestButton,
    toolImportManifestInput,
    toolNav,
    useExampleButton,
    windowRef = window,
    workspaceCopyManifestButton,
    workspaceExportManifestButton,
    workspaceImportManifestButton,
    workspaceNav
  }) {
    this.location = locationRef;
    this.returnToWorkspaceButton = returnToWorkspaceButton;
    this.toolCopyJsonButton = toolCopyJsonButton;
    this.toolExportToolStateButton = toolExportToolStateButton;
    this.toolImportManifestButton = toolImportManifestButton;
    this.toolImportManifestInput = toolImportManifestInput;
    this.toolNav = toolNav;
    this.useExampleButton = useExampleButton;
    this.window = windowRef;
    this.workspaceCopyManifestButton = workspaceCopyManifestButton;
    this.workspaceExportManifestButton = workspaceExportManifestButton;
    this.workspaceImportManifestButton = workspaceImportManifestButton;
    this.workspaceNav = workspaceNav;
  }

  mount({
    onToolCopyJson,
    onToolExportToolState,
    onToolImportManifest,
    onUseExample,
    onWorkspaceCopyManifest,
    onWorkspaceExportManifest,
    onWorkspaceImportManifest
  }) {
    this.applyLaunchMode();
    this.toolImportManifestButton.addEventListener("click", () => this.toolImportManifestInput.click());
    this.toolImportManifestInput.addEventListener("change", () => onToolImportManifest(this.toolImportManifestInput.files?.[0] || null));
    this.useExampleButton.addEventListener("click", onUseExample);
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
    const isWorkspace = params.get("launch") === "workspace";
    const isWorkspaceManagerLaunch = isWorkspace && params.get("fromTool") === "workspace-manager-v2";
    this.toolNav.hidden = isWorkspace;
    this.workspaceNav.hidden = !isWorkspace;
    this.workspaceImportManifestButton.hidden = isWorkspaceManagerLaunch;
    this.workspaceCopyManifestButton.hidden = isWorkspaceManagerLaunch;
    this.workspaceExportManifestButton.hidden = isWorkspaceManagerLaunch;
    this.returnToWorkspaceButton.hidden = !isWorkspaceManagerLaunch;
  }

  setToolActionsEnabled(isEnabled) {
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
