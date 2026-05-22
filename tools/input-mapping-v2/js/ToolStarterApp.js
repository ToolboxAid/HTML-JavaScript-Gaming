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
    this.activeGamepadIndex = null;
    this.comboCaptureInputs = [];
    this.rumbleFeedbackEnabled = false;
    this.captureTimeoutMs = 8000;
    this.captureTimeoutTimer = null;
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
      onToolExport: () => this.exportToolState(),
      onWorkspaceCopyManifest: () => this.statusLog.ok("Input Mapping V2 workspace copy action is ready."),
      onWorkspaceExportManifest: () => this.statusLog.ok("Input Mapping V2 workspace export action is ready."),
      onWorkspaceImportManifest: () => this.statusLog.ok("Input Mapping V2 workspace import action is ready.")
    });
    this.actionSelection.mount({
      onActionChanged: (actionId) => this.selectAction(actionId),
      onAddAction: (label) => this.addAction(label),
      onClearAction: () => this.clearSelectedAction(),
      onDeleteAction: () => this.deleteSelectedAction(),
      onRumbleFeedbackChanged: (isEnabled) => {
        void this.setRumbleFeedback(isEnabled);
      }
    });
    this.capture.mount({
      onCaptureCombo: () => this.startComboCapture(),
      onCaptureGamepad: (gamepadIndex) => this.startGamepadCapture(gamepadIndex),
      onCaptureKeyboard: () => this.startKeyboardCapture(),
      onCaptureMouse: () => this.startMouseCapture(),
      onCapturePointerDrag: (binding) => this.capturePointerDrag(binding),
      onRefreshGamepads: () => this.refreshGamepads()
    });
    this.engineInputSources.attach();
    this.window.addEventListener("gamepadconnected", this.handleGamepadConnectionChange);
    this.window.addEventListener("gamepaddisconnected", this.handleGamepadConnectionChange);
    this.window.addEventListener("keydown", this.handleKeyDown, true);
    this.window.addEventListener("mousedown", this.handleMouseDown, true);
    this.statusLog.mount();
    this.preview.mount({
      onDeleteBinding: ({ actionId, binding }) => this.deleteBinding(actionId, binding),
      onSelectAction: (actionId) => this.selectAction(actionId)
    });
    this.statusLog.ok("Input Mapping V2 ready.");
    const initialGamepadStatus = this.engineInputSources.refreshGamepadState();
    this.trackGamepadStatus(initialGamepadStatus, { log: true });
    this.refreshActions(initialGamepadStatus);
    this.startGamepadPolling();
  }

  selectAction(actionId) {
    this.state.selectAction(actionId);
    this.clearCapture();
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

  deleteSelectedAction() {
    const result = this.state.deleteSelectedAction();
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    this.refreshActions();
  }

  startKeyboardCapture() {
    if (this.isCaptureActive("keyboard")) {
      this.cancelCapture("Keyboard");
      return;
    }
    this.beginCapture("keyboard");
    this.capture.showMessage(`Press a keyboard key to bind it to ${this.state.selectedActionLabel()}.`);
    this.statusLog.ok(`Keyboard capture armed for ${this.state.selectedActionLabel()}.`);
  }

  startMouseCapture() {
    if (this.isCaptureActive("mouse")) {
      this.cancelCapture("Mouse");
      return;
    }
    this.beginCapture("mouse");
    this.capture.showMessage(`Click a mouse button to bind it to ${this.state.selectedActionLabel()}.`);
    this.statusLog.ok(`Mouse capture armed for ${this.state.selectedActionLabel()}.`);
  }

  startComboCapture() {
    if (this.isCaptureActive("combo")) {
      this.cancelCapture("Combo");
      return;
    }
    this.comboCaptureInputs = [];
    this.beginCapture("combo");
    this.capture.showMessage(`Press two keys or mouse buttons to bind a combo to ${this.state.selectedActionLabel()}.`);
    this.statusLog.ok(`Combo capture armed for ${this.state.selectedActionLabel()}.`);
  }

  startGamepadCapture(gamepadIndex) {
    const selectedIndex = Number(gamepadIndex);
    if (!Number.isInteger(selectedIndex)) {
      this.statusLog.warn("Gamepad capture unavailable: choose a detected gamepad device before capturing.");
      return;
    }
    if (this.isCaptureActive(`gamepad:${selectedIndex}`)) {
      this.cancelCapture(`Gamepad ${selectedIndex}`);
      return;
    }
    this.beginCapture(`gamepad:${selectedIndex}`);
    this.capture.showMessage(`Press a button or move a stick on Gamepad ${selectedIndex} to bind it to ${this.state.selectedActionLabel()}.`);
    this.statusLog.ok(`Gamepad ${selectedIndex} capture armed for ${this.state.selectedActionLabel()}.`);
    this.tryCaptureActiveGamepad();
  }

  capturePointerDrag(binding) {
    const result = this.engineInputSources.capturePointerDrag(binding);
    if (!result.ok) {
      this.statusLog.warn(result.message);
      this.refreshActions();
      return;
    }
    this.addCapturedInput(result.input);
  }

  handleKeyDown(event) {
    if (this.captureMode === "combo") {
      event.preventDefault();
      event.stopPropagation();
      this.recordComboInput(this.engineInputSources.captureKeyboard(event));
      return;
    }
    if (this.captureMode !== "keyboard") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.addCapturedInput(this.engineInputSources.captureKeyboard(event));
  }

  handleMouseDown(event) {
    if (this.captureMode === "combo") {
      event.preventDefault();
      event.stopPropagation();
      this.recordComboInput(this.engineInputSources.captureMouse(event));
      return;
    }
    if (this.captureMode !== "mouse") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.addCapturedInput(this.engineInputSources.captureMouse(event));
  }

  tryCaptureActiveGamepad() {
    if (this.captureMode !== "gamepad" || !Number.isInteger(this.activeGamepadIndex)) {
      return false;
    }
    const result = this.engineInputSources.captureGamepad(this.activeGamepadIndex);
    if (result.waiting) {
      return false;
    }
    if (!result.ok) {
      this.capture.showMessage(result.message);
      this.statusLog.warn(result.message);
      this.clearCapture();
      this.refreshActions();
      return true;
    }
    this.addCapturedInput(result.input);
    return true;
  }

  recordComboInput(input) {
    if (this.comboCaptureInputs.some((candidate) => candidate.binding === input.binding)) {
      this.capture.showMessage("Combo capture needs two different inputs.");
      this.statusLog.warn("Combo capture needs two different inputs.");
      return;
    }

    this.comboCaptureInputs.push(input);
    if (this.comboCaptureInputs.length < 2) {
      this.capture.showMessage(`Combo capture recorded ${input.label}. Press one more key or mouse button.`);
      return;
    }

    const result = this.engineInputSources.captureCombo(this.comboCaptureInputs);
    if (!result.ok) {
      this.statusLog.warn(result.message);
      this.clearCapture();
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
    this.tryCaptureActiveGamepad();
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

  async setRumbleFeedback(isEnabled) {
    this.rumbleFeedbackEnabled = isEnabled;
    if (!isEnabled) {
      this.statusLog.ok("Gamepad rumble/haptic feedback disabled for this tool session.");
      return;
    }

    const result = await this.engineInputSources.requestGamepadRumblePreview();
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    if (result.ok) {
      this.statusLog.ok("Gamepad rumble/haptic feedback is UI-local because Input Mapping V2 toolState has no options field.");
    }
  }

  addCapturedInput(input) {
    const result = this.state.addBindingToSelectedAction(input);
    this.clearCapture();
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    this.refreshActions();
  }

  beginCapture(captureId) {
    this.clearCapture();
    if (captureId.startsWith("gamepad:")) {
      this.captureMode = "gamepad";
      this.activeGamepadIndex = Number(captureId.slice("gamepad:".length));
    } else {
      this.captureMode = captureId;
      this.activeGamepadIndex = null;
    }
    this.capture.setActiveCapture(captureId);
    const timeoutMs = this.captureTimeoutDelay();
    this.captureTimeoutTimer = this.window.setTimeout?.(() => {
      this.capture.showMessage(`${this.captureLabel()} capture timed out for ${this.state.selectedActionLabel()}.`);
      this.statusLog.warn(`${this.captureLabel()} capture timed out for ${this.state.selectedActionLabel()}.`);
      this.clearCapture();
      this.refreshActions();
    }, timeoutMs) ?? null;
  }

  clearCapture() {
    if (this.captureTimeoutTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.captureTimeoutTimer);
    }
    this.captureTimeoutTimer = null;
    this.captureMode = "";
    this.activeGamepadIndex = null;
    this.comboCaptureInputs = [];
    this.capture.clearActiveCapture();
  }

  cancelCapture(captureLabel) {
    this.capture.showMessage(`${captureLabel} capture canceled for ${this.state.selectedActionLabel()}.`);
    this.statusLog.warn(`${captureLabel} capture canceled for ${this.state.selectedActionLabel()}.`);
    this.clearCapture();
    this.refreshActions();
  }

  isCaptureActive(captureId) {
    if (this.captureMode === "gamepad" && Number.isInteger(this.activeGamepadIndex)) {
      return captureId === `gamepad:${this.activeGamepadIndex}`;
    }
    return captureId === this.captureMode;
  }

  captureTimeoutDelay() {
    const configuredTimeout = Number(this.window.__inputMappingV2CaptureTimeoutMs);
    return Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : this.captureTimeoutMs;
  }

  captureLabel() {
    if (this.captureMode === "keyboard") {
      return "Keyboard";
    }
    if (this.captureMode === "mouse") {
      return "Mouse";
    }
    if (this.captureMode === "combo") {
      return "Combo";
    }
    if (this.captureMode === "gamepad") {
      return "Gamepad";
    }
    return "Input";
  }

  deleteBinding(actionId, binding) {
    const result = this.state.removeBinding(actionId, binding);
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    this.refreshActions();
  }

  exportToolState() {
    this.inspector.showObject(this.state.toolState());
    this.statusLog.ok("Input Mapping V2 export preview written.");
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
    this.capture.render(this.state.selectedActionLabel(), gamepadStatus.gamepads, this.engineInputSources.pointerDragDescriptors());
    this.preview.render(this.state.actions(), this.state.selectedActionId);
    this.inspector.showObject(this.state.payload());
    this.sourceInventory.render(this.engineInputSources.sources(gamepadStatus));
    this.gamepadDiagnostics.render(this.engineInputSources.gamepadDiagnostics(gamepadStatus));
  }
}
