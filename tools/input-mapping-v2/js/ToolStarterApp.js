export class ToolStarterApp {
  constructor({
    accordions,
    actionNav,
    actionSelection,
    capture,
    engineInputSources,
    gamepadDiagnostics,
    inspector,
    preview,
    shell,
    sourceInventory,
    state,
    statusLog,
    windowRef = window
  }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.actionSelection = actionSelection;
    this.capture = capture;
    this.engineInputSources = engineInputSources;
    this.gamepadDiagnostics = gamepadDiagnostics;
    this.inspector = inspector;
    this.preview = preview;
    this.shell = shell;
    this.sourceInventory = sourceInventory;
    this.state = state;
    this.statusLog = statusLog;
    this.window = windowRef;
    this.captureMode = "";
    this.gamepadPollIntervalMs = 750;
    this.gamepadPollTimer = null;
    this.lastGamepadStatusSignature = "";
    this.handleGamepadConnectionChange = this.handleGamepadConnectionChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.pollGamepadDevices = this.pollGamepadDevices.bind(this);
  }

  start() {
    this.shell.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.actionNav.mount({
      onToolCopyJson: () => {
        void this.copyJson();
      },
      onToolExport: () => this.exportMappings(),
      onToolExportToolState: () => this.exportToolState(),
      onWorkspaceCopyManifest: () => this.statusLog.ok("Input Mapping V2 workspace copy action is ready."),
      onWorkspaceExportManifest: () => this.statusLog.ok("Input Mapping V2 workspace export action is ready."),
      onWorkspaceImportManifest: () => this.statusLog.ok("Input Mapping V2 workspace import action is ready.")
    });
    this.actionSelection.mount({
      onActionChanged: (actionId) => this.selectAction(actionId),
      onAddAction: (label) => this.addAction(label),
      onClearAction: () => this.clearSelectedAction()
    });
    this.capture.mount({
      onCaptureGamepad: (gamepadIndex) => this.captureGamepad(gamepadIndex),
      onCaptureKeyboard: () => this.startKeyboardCapture(),
      onCaptureMouse: () => this.startMouseCapture(),
      onRefreshGamepads: () => this.refreshGamepads(),
      onStartGamepadPolling: () => this.startListeningForGamepads()
    });
    this.engineInputSources.attach();
    this.window.addEventListener("gamepadconnected", this.handleGamepadConnectionChange);
    this.window.addEventListener("gamepaddisconnected", this.handleGamepadConnectionChange);
    this.window.addEventListener("keydown", this.handleKeyDown, true);
    this.window.addEventListener("mousedown", this.handleMouseDown, true);
    this.statusLog.mount();
    this.preview.mount({
      onDeleteBinding: ({ actionId, binding }) => this.deleteBinding(actionId, binding)
    });
    this.statusLog.ok("Input Mapping V2 ready.");
    const initialGamepadStatus = this.engineInputSources.refreshGamepadState();
    this.trackGamepadStatus(initialGamepadStatus, { log: true });
    this.refreshActions(initialGamepadStatus);
    this.startGamepadPolling();
  }

  selectAction(actionId) {
    this.state.selectAction(actionId);
    this.captureMode = "";
    this.refreshActions();
  }

  addAction(label) {
    const result = this.state.addAction(label);
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    this.refreshActions();
  }

  clearSelectedAction() {
    const result = this.state.clearSelectedAction();
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    this.refreshActions();
  }

  startKeyboardCapture() {
    this.captureMode = "keyboard";
    this.capture.showMessage(`Press a keyboard key to bind it to ${this.state.selectedActionLabel()}.`);
    this.statusLog.ok(`Keyboard capture armed for ${this.state.selectedActionLabel()}.`);
  }

  startMouseCapture() {
    this.captureMode = "mouse";
    this.capture.showMessage(`Click a mouse button to bind it to ${this.state.selectedActionLabel()}.`);
    this.statusLog.ok(`Mouse capture armed for ${this.state.selectedActionLabel()}.`);
  }

  handleKeyDown(event) {
    if (this.captureMode !== "keyboard") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.captureMode = "";
    this.addCapturedInput(this.engineInputSources.captureKeyboard(event));
  }

  handleMouseDown(event) {
    if (this.captureMode !== "mouse") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.captureMode = "";
    this.addCapturedInput(this.engineInputSources.captureMouse(event));
  }

  captureGamepad(gamepadIndex) {
    const result = this.engineInputSources.captureGamepad(gamepadIndex);
    if (!result.ok) {
      this.capture.showMessage(result.message);
      this.statusLog.warn(result.message);
      this.refreshActions();
      return;
    }
    this.addCapturedInput(result.input);
  }

  handleGamepadConnectionChange() {
    this.refreshGamepads();
  }

  refreshGamepads() {
    const status = this.engineInputSources.refreshGamepadState();
    this.trackGamepadStatus(status, { log: true });
    this.refreshActions(status);
  }

  startListeningForGamepads() {
    this.startGamepadPolling();
    const status = this.engineInputSources.refreshGamepadState();
    this.trackGamepadStatus(status, { log: true });
    this.capture.showMessage("Gamepad polling is active. Keep this browser tab focused and press a controller button if the browser has not exposed the device yet.");
    this.statusLog.ok("Gamepad listening/polling is active.");
    this.refreshActions(status);
  }

  startGamepadPolling() {
    if (this.gamepadPollTimer || typeof this.window.setInterval !== "function") {
      return;
    }
    this.gamepadPollTimer = this.window.setInterval(this.pollGamepadDevices, this.gamepadPollIntervalMs);
  }

  pollGamepadDevices() {
    const status = this.engineInputSources.refreshGamepadState();
    const changed = this.trackGamepadStatus(status);
    if (changed) {
      this.refreshActions(status);
    }
  }

  trackGamepadStatus(status, { log = false } = {}) {
    const signature = `${status.warning}|${status.connectedCount}|${status.connectedLabels}`;
    const changed = signature !== this.lastGamepadStatusSignature;
    if (log || (changed && this.lastGamepadStatusSignature)) {
      this.logGamepadStatus(status);
    }
    this.lastGamepadStatusSignature = signature;
    return changed;
  }

  logGamepadStatus(status) {
    if (status.warning) {
      this.statusLog.warn(status.warning);
      return;
    }
    this.statusLog.ok(status.message);
  }

  addCapturedInput(input) {
    const result = this.state.addBindingToSelectedAction(input);
    this.capture.showMessage(result.message);
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    this.refreshActions();
  }

  deleteBinding(actionId, binding) {
    const result = this.state.removeBinding(actionId, binding);
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    this.refreshActions();
  }

  exportMappings() {
    this.inspector.showObject(this.state.payload());
    this.statusLog.ok("Mapping JSON preview written.");
  }

  exportToolState() {
    this.inspector.showObject(this.state.toolState());
    this.statusLog.ok("Input Mapping V2 toolState preview written.");
  }

  async copyJson() {
    const json = JSON.stringify(this.state.payload(), null, 2);
    this.inspector.showObject(this.state.payload());
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      this.statusLog.warn("Mapping JSON preview written. Clipboard API is unavailable.");
      this.refreshActions();
      return;
    }

    try {
      await this.window.navigator.clipboard.writeText(json);
      this.statusLog.ok("Mapping JSON copied.");
    } catch (error) {
      this.statusLog.fail(`Copy JSON failed: ${error.message}`);
    }
    this.refreshActions();
  }

  refreshActions(gamepadStatus = this.engineInputSources.refreshGamepadState()) {
    this.actionNav.setToolActionsEnabled(true);
    this.actionSelection.render(this.state.actions(), this.state.selectedActionId);
    this.capture.render(this.state.selectedActionLabel(), gamepadStatus.gamepads);
    this.preview.render(this.state.actions());
    this.inspector.showObject(this.state.payload());
    this.sourceInventory.render(this.engineInputSources.sources(gamepadStatus));
    this.gamepadDiagnostics.render(this.engineInputSources.gamepadDiagnostics(gamepadStatus));
  }
}
