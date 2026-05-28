export class ActionNavControl {
  constructor({
    locationRef = window.location,
    launchModeIndicator,
    nowPlayingLabel,
    projectDirtyState,
    returnToWorkspaceButton,
    resetSongEditsButton,
    saveProjectButton,
    stopAllAudioButton,
    toolCopyJsonButton,
    toolExportToolStateButton,
    toolImportManifestButton,
    toolImportManifestInput,
    toolNav,
    windowRef = window,
    workspaceCopyManifestButton,
    workspaceExportManifestButton,
    workspaceImportManifestButton,
    workspaceNav
  }) {
    this.location = locationRef;
    this.launchModeIndicator = launchModeIndicator;
    this.nowPlayingLabel = nowPlayingLabel;
    this.projectDirtyState = projectDirtyState;
    this.returnToWorkspaceButton = returnToWorkspaceButton;
    this.resetSongEditsButton = resetSongEditsButton;
    this.saveProjectButton = saveProjectButton;
    this.stopAllAudioButton = stopAllAudioButton;
    this.toolCopyJsonButton = toolCopyJsonButton;
    this.toolExportToolStateButton = toolExportToolStateButton;
    this.toolImportManifestButton = toolImportManifestButton;
    this.toolImportManifestInput = toolImportManifestInput;
    this.toolNav = toolNav;
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
    onResetSongEdits,
    onSaveProject,
    onStopAllAudio,
    onWorkspaceCopyManifest,
    onWorkspaceExportManifest,
    onWorkspaceImportManifest
  }) {
    this.applyLaunchMode();
    this.toolImportManifestButton.addEventListener("click", () => this.toolImportManifestInput.click());
    this.toolImportManifestInput.addEventListener("change", () => onToolImportManifest(this.toolImportManifestInput.files?.[0] || null));
    this.saveProjectButton.addEventListener("click", onSaveProject);
    this.resetSongEditsButton.addEventListener("click", onResetSongEdits);
    this.stopAllAudioButton.addEventListener("click", onStopAllAudio);
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
    if (this.launchModeIndicator) {
      this.launchModeIndicator.textContent = isWorkspace ? "Workspace Mode" : "Tool Mode";
      this.launchModeIndicator.dataset.midiStudioLaunchMode = isWorkspace ? "workspace" : "tool";
    }
    this.window.document.body.dataset.midiStudioLaunchMode = isWorkspace ? "workspace" : "tool";
  }

  setToolActionsEnabled(isEnabled) {
    this.toolCopyJsonButton.disabled = !isEnabled;
    this.toolExportToolStateButton.disabled = !isEnabled;
    this.saveProjectButton.disabled = !isEnabled;
    this.resetSongEditsButton.disabled = !isEnabled;
  }

  setDirtyState(isDirty) {
    if (!this.projectDirtyState) {
      return;
    }
    this.projectDirtyState.dataset.midiStudioDirtyState = isDirty ? "dirty" : "clean";
    this.projectDirtyState.textContent = isDirty ? "Unsaved changes" : "Saved";
  }

  setNowPlaying(song, { playing = false } = {}) {
    if (!this.nowPlayingLabel) {
      return;
    }
    if (!song) {
      this.nowPlayingLabel.textContent = "No song selected";
      return;
    }
    this.nowPlayingLabel.textContent = `${playing ? "Playing" : "Selected"}: ${song.name || song.id}`;
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
