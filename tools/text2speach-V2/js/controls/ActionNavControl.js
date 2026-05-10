export class ActionNavControl {
  constructor({
    locationRef = window.location,
    returnToWorkspaceButton,
    speakButtons = [],
    stopButtons = [],
    toolNav,
    windowRef = window,
    workspaceNav
  }) {
    this.location = locationRef;
    this.returnToWorkspaceButton = returnToWorkspaceButton;
    this.speakButtons = speakButtons;
    this.stopButtons = stopButtons;
    this.toolNav = toolNav;
    this.window = windowRef;
    this.workspaceNav = workspaceNav;
  }

  mount({ onReturnToWorkspace, onSpeak, onStop }) {
    this.applyLaunchMode();
    this.speakButtons.forEach((button) => {
      button.addEventListener("click", onSpeak);
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
      && params.get("fromTool") === "workspace-manager-v2";
    this.toolNav.hidden = isWorkspaceManagerLaunch;
    this.workspaceNav.hidden = !isWorkspaceManagerLaunch;
  }

  setSpeakEnabled(isEnabled) {
    this.speakButtons.forEach((button) => {
      button.disabled = !isEnabled;
    });
  }

  setStopEnabled(isEnabled) {
    this.stopButtons.forEach((button) => {
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
