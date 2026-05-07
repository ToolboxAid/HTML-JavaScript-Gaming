export class ActionNavControl {
  constructor({
    locationRef = window.location,
    navExportJsonButton,
    navImportJsonButton,
    navImportJsonInput,
    returnToWorkspaceButton,
    toolNav,
    workspaceNav
  }) {
    this.location = locationRef;
    this.navExportJsonButton = navExportJsonButton;
    this.navImportJsonButton = navImportJsonButton;
    this.navImportJsonInput = navImportJsonInput;
    this.returnToWorkspaceButton = returnToWorkspaceButton;
    this.toolNav = toolNav;
    this.workspaceNav = workspaceNav;
  }

  mount({
    onNavExportJson,
    onNavImportJson,
    onReturnToWorkspace
  }) {
    this.applyLaunchMode();
    this.navImportJsonButton.addEventListener("click", () => this.navImportJsonInput.click());
    this.navImportJsonInput.addEventListener("change", () => {
      const file = this.navImportJsonInput.files?.[0] || null;
      this.navImportJsonInput.value = "";
      onNavImportJson(file);
    });
    this.navExportJsonButton.addEventListener("click", onNavExportJson);
    this.returnToWorkspaceButton.addEventListener("click", onReturnToWorkspace);
  }

  applyLaunchMode() {
    const params = new URLSearchParams(this.location.search);
    const mode = params.get("launch") === "workspace" && params.get("fromTool") === "workspace-manager-v2"
      ? "workspace"
      : "tool";
    this.toolNav.hidden = mode !== "tool";
    this.workspaceNav.hidden = mode !== "workspace";
  }

  setToolActionsEnabled(isEnabled) {
    this.navImportJsonButton.disabled = !isEnabled;
    this.navExportJsonButton.disabled = !isEnabled;
  }

  setWorkspaceActionsEnabled(isEnabled) {
    this.returnToWorkspaceButton.disabled = !isEnabled;
  }
}
