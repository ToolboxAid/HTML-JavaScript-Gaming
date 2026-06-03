export class ActionNavControl {
  constructor({
    locationRef = window.location,
    returnToWorkspaceButton,
    windowRef = window,
    toolCopyJsonButton,
    toolExportJsonButton,
    toolImportJsonButton,
    toolImportJsonInput,
    toolNav,
    workspaceNav
  }) {
    this.location = locationRef;
    this.returnToWorkspaceButton = returnToWorkspaceButton;
    this.toolCopyJsonButton = toolCopyJsonButton;
    this.toolExportJsonButton = toolExportJsonButton;
    this.toolImportJsonButton = toolImportJsonButton;
    this.toolImportJsonInput = toolImportJsonInput;
    this.toolNav = toolNav;
    this.workspaceNav = workspaceNav;
    this.window = windowRef;
  }

  mount({
    onCopyJson,
    onExportJson,
    onImportJson,
    onReturnToWorkspace
  }) {
    this.applyLaunchMode();
    this.toolImportJsonButton.addEventListener("click", () => {
      this.toolImportJsonInput.click();
    });
    this.toolImportJsonInput.addEventListener("change", () => {
      const file = this.toolImportJsonInput.files?.[0] || null;
      onImportJson(file);
      this.toolImportJsonInput.value = "";
    });
    this.toolCopyJsonButton.addEventListener("click", onCopyJson);
    this.toolExportJsonButton.addEventListener("click", onExportJson);
    this.returnToWorkspaceButton.addEventListener("click", () => {
      onReturnToWorkspace(this.workspaceManagerUrl());
    });
  }

  applyLaunchMode() {
    const params = new URLSearchParams(this.location.search);
    const isWorkspaceManagerLaunch = params.get("launch") === "workspace"
      && params.get("fromTool") === "workspace-manager-v2"
      && Boolean(params.get("hostContextId"));
    this.toolNav.hidden = isWorkspaceManagerLaunch;
    this.workspaceNav.hidden = !isWorkspaceManagerLaunch;
  }

  setJsonPayloadActionsEnabled(isEnabled) {
    this.toolCopyJsonButton.disabled = !isEnabled;
    this.toolExportJsonButton.disabled = !isEnabled;
    this.toolCopyJsonButton.title = isEnabled ? "Copy schema-valid Object Vector Studio V2 JSON." : "Disabled until a schema-valid Object Vector Studio V2 payload is loaded.";
    this.toolExportJsonButton.title = isEnabled ? "Export schema-valid Object Vector Studio V2 JSON." : "Disabled until a schema-valid Object Vector Studio V2 payload is loaded.";
  }

  setImportEnabled(isEnabled) {
    this.toolImportJsonButton.disabled = !isEnabled;
    this.toolImportJsonInput.disabled = !isEnabled;
    this.toolImportJsonButton.title = isEnabled ? "Import Object Vector Studio V2 JSON." : "Disabled while schema is loading or workspace launch owns the payload source.";
  }

  isWorkspaceLaunch() {
    return this.workspaceNav.hidden === false;
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
