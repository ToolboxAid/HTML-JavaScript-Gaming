export class ToolStarterApp {
  constructor({
    accordions,
    actionNav,
    actionSelection,
    capture,
    deviceList,
    engineInputSources,
    exportControl,
    gamepadDiagnostics,
    gestureList,
    inspector,
    preview,
    shell,
    state,
    statusLog,
    workspaceRoot,
    windowRef = window
  }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.actionSelection = actionSelection;
    this.capture = capture;
    this.deviceList = deviceList;
    this.engineInputSources = engineInputSources;
    this.exportControl = exportControl;
    this.gamepadDiagnostics = gamepadDiagnostics;
    this.gestureList = gestureList;
    this.inspector = inspector;
    this.preview = preview;
    this.shell = shell;
    this.state = state;
    this.statusLog = statusLog;
    this.workspaceRoot = workspaceRoot;
    this.window = windowRef;
    this.captureMode = "";
    this.activeGamepadIndex = null;
    this.comboCaptureInputs = [];
    this.rumbleFeedbackEnabled = false;
    this.captureTimeoutMs = 8000;
    this.captureTimeoutTimer = null;
    this.contextMenuDisabled = false;
    this.gamepadPollIntervalMs = 750;
    this.gamepadPollTimer = null;
    this.lastGamepadStatusSignature = "";
    this.enabledDeviceIds = new Set();
    this.enabledDevicesInitialized = false;
    this.handleGamepadConnectionChange = this.handleGamepadConnectionChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.pollGamepadDevices = this.pollGamepadDevices.bind(this);
  }

  start() {
    this.shell.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.actionNav.mount({
      onWorkspaceCopyManifest: () => this.statusLog.ok("Input Mapping V2 workspace copy action is ready."),
      onWorkspaceExportManifest: () => this.statusLog.ok("Input Mapping V2 workspace export action is ready."),
      onWorkspaceImportManifest: () => this.statusLog.ok("Input Mapping V2 workspace import action is ready.")
    });
    this.exportControl.mount({
      onCopyJson: () => {
        void this.copyJson();
      },
      onExport: () => this.exportToolState(),
      onImport: () => this.importJson()
    });
    this.actionSelection.mount({
      onActionChanged: (actionId) => this.selectAction(actionId),
      onAddAction: (label) => this.addAction(label),
      onDeleteAction: () => this.deleteSelectedAction()
    });
    this.capture.mount({
      onCaptureGamepad: (gamepadIndex) => this.startGamepadCapture(gamepadIndex),
      onCaptureKeyboard: () => this.startKeyboardCapture(),
      onCaptureMouse: () => this.startMouseCapture(),
      onDisableContextChanged: (isDisabled) => this.setContextMenuDisabled(isDisabled),
      onRefreshGamepads: () => this.refreshGamepads()
    });
    this.deviceList.mount({
      onDeviceEnabledChanged: (deviceId, isEnabled) => this.setDeviceEnabled(deviceId, isEnabled),
      onRumbleFeedbackChanged: (isEnabled) => {
        void this.setRumbleFeedback(isEnabled);
      }
    });
    this.gestureList.mount({
      onGestureSelected: (gesture) => this.captureGesture(gesture)
    });
    this.engineInputSources.attach();
    this.window.addEventListener("gamepadconnected", this.handleGamepadConnectionChange);
    this.window.addEventListener("gamepaddisconnected", this.handleGamepadConnectionChange);
    this.window.addEventListener("keydown", this.handleKeyDown, true);
    this.window.addEventListener("mousedown", this.handleMouseDown, true);
    this.window.addEventListener("wheel", this.handleWheel, true);
    this.workspaceRoot.addEventListener("contextmenu", this.handleContextMenu);
    this.statusLog.mount();
    this.preview.mount({
      onDeleteAction: () => this.deleteSelectedAction(),
      onDeleteMappings: () => this.deleteSelectedMappings(),
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

  deleteSelectedAction() {
    const result = this.state.deleteSelectedAction();
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    this.refreshActions();
  }

  deleteSelectedMappings() {
    const result = this.state.deleteSelectedMappings();
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

  startComboCapture(deviceLabel = "Combo") {
    if (this.isCaptureActive("combo")) {
      this.cancelCapture(deviceLabel);
      return;
    }
    this.comboCaptureInputs = [];
    this.beginCapture("combo");
    this.capture.showMessage(`Combo capture: press any two keyboard, mouse, wheel, or game controller inputs for ${this.state.selectedActionLabel()}.`);
    this.statusLog.ok(`${deviceLabel} combo capture armed for ${this.state.selectedActionLabel()}.`);
    this.tryCaptureComboGamepad();
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

  captureGesture(gesture) {
    const result = this.engineInputSources.captureGesture(gesture.binding, this.enabledDeviceIds);
    if (!result.ok) {
      this.statusLog.warn(result.message);
      this.refreshActions();
      return;
    }
    if (result.combo) {
      this.startComboCapture(gesture.deviceLabel);
      return;
    }
    this.addCapturedInput(result.input);
  }

  handleKeyDown(event) {
    if (this.captureMode === "combo") {
      event.preventDefault();
      event.stopPropagation();
      this.recordComboInput(this.engineInputSources.captureKeyboard(event));
      this.tryCaptureComboGamepad();
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
      this.tryCaptureComboGamepad();
      return;
    }
    if (this.captureMode !== "mouse") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.addCapturedInput(this.engineInputSources.captureMouse(event));
  }

  handleWheel(event) {
    if (this.captureMode !== "combo") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.recordComboInput(this.engineInputSources.captureWheel(event));
    this.tryCaptureComboGamepad();
  }

  handleContextMenu(event) {
    if (this.contextMenuDisabled) {
      event.preventDefault();
    }
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
      this.capture.showMessage(`Combo capture recorded ${input.label}. Press one more key, mouse, wheel, or game controller input.`);
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
    this.tryCaptureComboGamepad();
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

  setContextMenuDisabled(isDisabled) {
    this.contextMenuDisabled = isDisabled;
    this.statusLog.ok(`Browser context menu ${isDisabled ? "disabled" : "enabled"} within Input Mapping V2 workspace.`);
  }

  setDeviceEnabled(deviceId, isEnabled) {
    if (isEnabled) {
      this.enabledDeviceIds.add(deviceId);
      this.statusLog.ok(`${this.deviceLabel(deviceId)} gestures enabled.`);
    } else {
      this.enabledDeviceIds.delete(deviceId);
      this.statusLog.ok(`${this.deviceLabel(deviceId)} gestures disabled.`);
    }
    this.refreshActions();
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

  tryCaptureComboGamepad() {
    if (this.captureMode !== "combo" || !this.enabledDeviceIds.has("gameController")) {
      return false;
    }
    const result = this.engineInputSources.captureFirstActiveGamepad();
    if (!result.ok) {
      return false;
    }
    this.recordComboInput(result.input);
    return true;
  }

  exportToolState() {
    this.inspector.showObject(this.state.toolState());
    this.statusLog.ok("Input Mapping V2 JSON preview written.");
  }

  importJson() {
    this.statusLog.warn("Input Mapping V2 Import is available through workspace launch data; standalone file import is not wired for this tool.");
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
    const devices = this.engineInputSources.devices(gamepadStatus);
    this.initializeEnabledDevices(devices);
    const gestures = this.engineInputSources.gestures(this.enabledDeviceIds);
    const actions = this.state.actions();
    const selectedAction = actions.find((action) => action.id === this.state.selectedActionId);
    this.actionNav.setToolActionsEnabled(true);
    this.exportControl.setEnabled(true);
    this.actionSelection.render(actions, this.state.selectedActionId);
    this.deviceList.render(devices, this.enabledDeviceIds);
    this.gestureList.render(gestures);
    this.capture.render(this.state.selectedActionLabel(), gamepadStatus.gamepads, selectedAction?.inputs ?? [], this.captureMode);
    this.preview.render(actions, this.state.selectedActionId);
    this.inspector.showObject(this.state.payload());
    this.gamepadDiagnostics.render(this.engineInputSources.gamepadDiagnostics(gamepadStatus));
  }

  initializeEnabledDevices(devices) {
    if (this.enabledDevicesInitialized) {
      return;
    }
    this.enabledDeviceIds = new Set(devices
      .filter((device) => device.available && device.defaultEnabled)
      .map((device) => device.id));
    this.enabledDevicesInitialized = true;
  }

  deviceLabel(deviceId) {
    return this.engineInputSources.devices()
      .find((device) => device.id === deviceId)?.label ?? deviceId;
  }
}
