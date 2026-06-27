export class ActionNavControl {
  constructor({
    locationRef = window.location,
    pauseButtons = [],
    returnToWorkspaceButton,
    resumeButtons = [],
    speakButtons = [],
    stopButtons = [],
    toolCopyJsonButton,
    toolExportJsonButton,
    toolImportJsonButton,
    toolImportJsonInput,
    toolNav,
    windowRef = window,
    workspaceNav
  }) {
    this.location = locationRef;
    this.pauseButtons = pauseButtons;
    this.returnToWorkspaceButton = returnToWorkspaceButton;
    this.resumeButtons = resumeButtons;
    this.speakButtons = speakButtons;
    this.stopButtons = stopButtons;
    this.toolCopyJsonButton = toolCopyJsonButton;
    this.toolExportJsonButton = toolExportJsonButton;
    this.toolImportJsonButton = toolImportJsonButton;
    this.toolImportJsonInput = toolImportJsonInput;
    this.toolNav = toolNav;
    this.window = windowRef;
    this.workspaceNav = workspaceNav;
  }

  mount({
    onCopyJson,
    onExportJson,
    onImportJson,
    onPause,
    onResume,
    onReturnToWorkspace,
    onSpeak,
    onStop
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
    this.speakButtons.forEach((button) => {
      button.addEventListener("click", onSpeak);
    });
    this.pauseButtons.forEach((button) => {
      button.addEventListener("click", onPause);
    });
    this.resumeButtons.forEach((button) => {
      button.addEventListener("click", onResume);
    });
    this.stopButtons.forEach((button) => {
      button.addEventListener("click", onStop);
    });
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

  setSpeakEnabled(isEnabled) {
    this.speakButtons.forEach((button) => {
      button.disabled = !isEnabled;
    });
  }

  setPauseEnabled(isEnabled) {
    this.pauseButtons.forEach((button) => {
      button.disabled = !isEnabled;
    });
  }

  setResumeEnabled(isEnabled) {
    this.resumeButtons.forEach((button) => {
      button.disabled = !isEnabled;
    });
  }

  setStopEnabled(isEnabled) {
    this.stopButtons.forEach((button) => {
      button.disabled = !isEnabled;
    });
  }

  setToolJsonActionsEnabled(isEnabled) {
    [
      this.toolImportJsonButton,
      this.toolCopyJsonButton,
      this.toolExportJsonButton
    ].forEach((button) => {
      button.disabled = !isEnabled;
    });
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
