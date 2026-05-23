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
    this.activeCaptureId = "";
    this.activeGamepadIndex = null;
    this.comboCaptureInputs = [];
    this.pendingGestureInput = null;
    this.selectedGesture = null;
    this.rumbleSettingsByActionId = new Map();
    this.captureTimeoutMs = 8000;
    this.captureTimeoutTimer = null;
    this.contextMenuDisabled = false;
    this.shortcutSuppressionEnabled = false;
    this.activeInputBindings = new Set();
    this.gamepadPollIntervalMs = 750;
    this.gamepadPollTimer = null;
    this.lastGamepadStatusSignature = "";
    this.enabledDeviceIds = new Set();
    this.enabledDevicesInitialized = false;
    this.handleGamepadConnectionChange = this.handleGamepadConnectionChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
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
      onRefreshGamepads: () => this.refreshGamepads(),
      onSuppressShortcutsChanged: (isEnabled) => this.setShortcutSuppressionEnabled(isEnabled)
    });
    this.deviceList.mount({
      onDeviceEnabledChanged: (deviceId, isEnabled) => this.setDeviceEnabled(deviceId, isEnabled),
      onRumbleFeedbackChanged: (isEnabled) => {
        this.setSelectedActionRumbleEnabled(isEnabled);
      },
      onRumbleSettingsChanged: (settings) => this.setSelectedActionRumbleSettings(settings),
      onTestRumble: (gamepadIndex, settings) => {
        void this.testGamepadRumble(gamepadIndex, settings);
      }
    });
    this.gestureList.mount({
      onGestureSelected: (gesture) => this.selectGesture(gesture)
    });
    this.engineInputSources.attach();
    this.window.addEventListener("gamepadconnected", this.handleGamepadConnectionChange);
    this.window.addEventListener("gamepaddisconnected", this.handleGamepadConnectionChange);
    this.window.addEventListener("keydown", this.handleKeyDown, true);
    this.window.addEventListener("keyup", this.handleKeyUp, true);
    this.window.addEventListener("mousedown", this.handleMouseDown, true);
    this.window.addEventListener("mouseup", this.handleMouseUp, true);
    this.window.addEventListener("wheel", this.handleWheel, { capture: true, passive: false });
    this.workspaceRoot.addEventListener("contextmenu", this.handleContextMenu);
    this.workspaceRoot.addEventListener("keydown", this.handleKeyDown, true);
    this.workspaceRoot.addEventListener("wheel", this.handleWheel, { capture: true, passive: false });
    this.statusLog.mount();
    this.preview.mount({
      onDeleteAction: () => this.deleteSelectedAction(),
      onDeleteInput: (actionId, binding) => this.deleteActionInput(actionId, binding),
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

  deleteActionInput(actionId, binding) {
    const result = this.state.deleteActionInput(actionId, binding);
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    this.refreshActions();
  }

  startKeyboardCapture() {
    if (!this.ensureSelectedTileForCapture()) {
      return;
    }
    if (this.selectedGesture?.captureKind === "combo") {
      this.startComboCapture(this.selectedGesture.deviceLabel, "keyboard");
      return;
    }
    if (this.isCaptureActive("keyboard")) {
      this.cancelCapture("Keyboard");
      return;
    }
    this.beginCapture("keyboard");
    this.capture.showMessage(`Press a keyboard key to bind it to ${this.state.selectedActionLabel()}.`);
    this.statusLog.ok(`Keyboard capture armed for ${this.state.selectedActionLabel()}.`);
  }

  startMouseCapture() {
    if (!this.ensureSelectedTileForCapture()) {
      return;
    }
    if (this.selectedGesture?.captureKind === "combo") {
      this.startComboCapture(this.selectedGesture.deviceLabel, "mouse");
      return;
    }
    if (this.selectedGesture?.captureKind === "pointer-drag" || this.selectedGesture?.captureKind === "wheel") {
      this.captureSelectedGesture();
      return;
    }
    if (this.isCaptureActive("mouse")) {
      this.cancelCapture("Mouse");
      return;
    }
    this.beginCapture("mouse");
    this.capture.showMessage(`Click a mouse button to bind it to ${this.state.selectedActionLabel()}.`);
    this.statusLog.ok(`Mouse capture armed for ${this.state.selectedActionLabel()}.`);
  }

  startComboCapture(deviceLabel = "Combo", captureId = "combo") {
    if (!this.ensureSelectedTileForCapture()) {
      return;
    }
    if (this.isCaptureActive(captureId)) {
      this.cancelCapture(deviceLabel);
      return;
    }
    this.comboCaptureInputs = [];
    this.beginCapture(captureId, { mode: "combo" });
    this.capture.showMessage(`Combo capture: press any two keyboard, mouse, wheel, or game controller inputs for ${this.state.selectedActionLabel()}.`);
    this.statusLog.ok(`${deviceLabel} combo capture armed for ${this.state.selectedActionLabel()}.`);
    if (captureId.startsWith("gamepad:")) {
      this.tryCaptureComboGamepad();
    }
  }

  startGamepadCapture(gamepadIndex) {
    if (!this.ensureSelectedTileForCapture()) {
      return;
    }
    const selectedIndex = Number(gamepadIndex);
    if (!Number.isInteger(selectedIndex)) {
      this.statusLog.warn("Gamepad capture unavailable: choose a detected gamepad device before capturing.");
      return;
    }
    if (this.selectedGesture?.captureKind === "combo") {
      this.startComboCapture(this.selectedGesture.deviceLabel, `gamepad:${selectedIndex}`);
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

  selectGesture(gesture) {
    this.selectedGesture = gesture;
    this.pendingGestureInput = null;
    if (gesture.captureKind === "combo") {
      this.statusLog.ok(`${gesture.deviceLabel} ${gesture.label} selected. Press a Capture button to record a two-input combo.`);
      this.refreshActions();
      return;
    }
    if (gesture.captureKind === "pointer-drag" || gesture.captureKind === "wheel") {
      const result = this.engineInputSources.captureGesture(gesture.binding, this.enabledDeviceIds);
      if (result.ok) {
        this.pendingGestureInput = result.input;
      }
    }
    this.statusLog.ok(`${gesture.deviceLabel} ${gesture.label} selected for next capture.`);
    this.refreshActions();
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
      if (!isEditableInputEventTarget(event.target)) {
        this.activateInputBindings(keyboardDownBindings(event.code));
      }
      if (this.shouldSuppressKeyboardShortcut(event)) {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.addCapturedInput(this.engineInputSources.captureKeyboard(event, this.selectedGestureForSource("keyboard")));
  }

  handleKeyUp(event) {
    if (this.captureMode) {
      return;
    }
    this.clearActiveInputBindings(keyboardDownBindings(event.code));
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
      if (!isInteractiveInputMappingTarget(event.target)) {
        this.activateInputBindings([mouseButtonBinding(event)]);
      }
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.addCapturedInput(this.engineInputSources.captureMouse(event, this.selectedGestureForSource("mouse")));
  }

  handleMouseUp(event) {
    if (this.captureMode) {
      return;
    }
    this.clearActiveInputBindings([mouseButtonBinding(event)]);
  }

  handleWheel(event) {
    if (this.shouldSuppressWheelShortcut(event)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (this.captureMode !== "combo") {
      if (!isEditableInputEventTarget(event.target)) {
        this.activateInputBindings([this.engineInputSources.captureWheel(event).binding], { transient: true });
      }
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
    const result = this.engineInputSources.captureGamepad(this.activeGamepadIndex, this.selectedGestureForSource("gamepad"));
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

  recordComboInput(input, { silentDuplicate = false } = {}) {
    if (this.comboCaptureInputs.some((candidate) => candidate.binding === input.binding)) {
      if (silentDuplicate) {
        return;
      }
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
    this.syncGamepadActiveInputBindings();
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
    const gamepadChanged = this.syncGamepadActiveInputBindings();
    if (changed || gamepadChanged) {
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

  setSelectedActionRumbleEnabled(isEnabled) {
    this.setSelectedActionRumbleSettings({
      ...this.selectedRumbleSettings(),
      enabled: isEnabled
    });
    if (!isEnabled) {
      this.statusLog.ok(`Rumble disabled for ${this.state.selectedActionLabel()}.`);
      return;
    }

    if (!this.hasSupportedHaptics()) {
      this.statusLog.warn("Gamepad rumble unavailable: no connected gamepad exposes GamepadHapticActuator, hapticActuators, or vibrationActuator. Connect a compatible controller, click inside this page, and try Test Rumble.");
      return;
    }
    this.statusLog.ok(`Rumble enabled for ${this.state.selectedActionLabel()} as UI-local action configuration.`);
  }

  setSelectedActionRumbleSettings(settings) {
    this.rumbleSettingsByActionId.set(this.state.selectedActionId, {
      durationMs: Math.max(20, Math.min(2000, Number(settings.durationMs) || 80)),
      enabled: settings.enabled === true,
      strength: Math.max(0, Math.min(1, Number(settings.strength) || 0))
    });
    this.refreshActions();
  }

  async testGamepadRumble(gamepadIndex, settings) {
    const result = await this.engineInputSources.testGamepadRumble(gamepadIndex, settings);
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
  }

  setContextMenuDisabled(isDisabled) {
    this.contextMenuDisabled = isDisabled;
    this.statusLog.ok(`Browser context menu ${isDisabled ? "disabled" : "enabled"} within Input Mapping V2 workspace.`);
  }

  setShortcutSuppressionEnabled(isEnabled) {
    this.shortcutSuppressionEnabled = isEnabled;
    this.statusLog.ok(`Browser shortcut suppression ${isEnabled ? "enabled" : "disabled"} within Input Mapping V2 workspace.`);
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

  activateInputBindings(bindings, { transient = false } = {}) {
    let changed = false;
    bindings.filter(Boolean).forEach((binding) => {
      if (!this.activeInputBindings.has(binding)) {
        this.activeInputBindings.add(binding);
        changed = true;
      }
      if (transient) {
        this.window.setTimeout?.(() => {
          this.clearActiveInputBindings([binding]);
        }, 260);
      }
    });
    if (changed) {
      this.refreshActions();
    }
  }

  clearActiveInputBindings(bindings) {
    let changed = false;
    bindings.filter(Boolean).forEach((binding) => {
      if (this.activeInputBindings.delete(binding)) {
        changed = true;
      }
    });
    if (changed) {
      this.refreshActions();
    }
  }

  syncGamepadActiveInputBindings() {
    return this.replaceActiveInputBindings(
      (binding) => binding.startsWith("Pad"),
      this.engineInputSources.activeGamepadBindings()
    );
  }

  replaceActiveInputBindings(shouldReplace, nextBindings) {
    const previous = this.activeInputBindings;
    const next = new Set(nextBindings);
    this.activeInputBindings = new Set([
      ...[...previous].filter((binding) => !shouldReplace(binding)),
      ...next
    ]);
    return previous.size !== this.activeInputBindings.size
      || [...previous].some((binding) => !this.activeInputBindings.has(binding))
      || [...this.activeInputBindings].some((binding) => !previous.has(binding));
  }

  beginCapture(captureId, { mode = "" } = {}) {
    this.clearCapture();
    const captureMode = mode || (captureId.startsWith("gamepad:") ? "gamepad" : captureId);
    this.captureMode = captureMode;
    this.activeCaptureId = captureId;
    if (captureId.startsWith("gamepad:")) {
      this.activeGamepadIndex = Number(captureId.slice("gamepad:".length));
    } else {
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
    this.activeCaptureId = "";
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
    return captureId === this.activeCaptureId;
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
    this.recordComboInput(result.input, { silentDuplicate: true });
    return true;
  }

  captureSelectedGesture() {
    const pendingInput = this.pendingGestureInput?.binding === this.selectedGesture.binding
      ? this.pendingGestureInput
      : null;
    const result = pendingInput
      ? { ok: true, input: pendingInput }
      : this.engineInputSources.captureGesture(this.selectedGesture.binding, this.enabledDeviceIds);
    if (!result.ok) {
      this.statusLog.warn(result.message);
      this.refreshActions();
      return;
    }
    this.pendingGestureInput = null;
    this.addCapturedInput(result.input);
  }

  ensureSelectedTileForCapture() {
    if (this.state.selectedActionHasTile()) {
      return true;
    }
    const message = "Capture requires an existing selected mapping tile. Select an action and click Add before capturing input.";
    this.capture.showMessage(message);
    this.statusLog.warn(message);
    this.clearCapture();
    this.refreshActions();
    return false;
  }

  selectedRumbleSettings() {
    return this.rumbleSettingsByActionId.get(this.state.selectedActionId) ?? {
      durationMs: 80,
      enabled: false,
      strength: 0.25
    };
  }

  hasSupportedHaptics() {
    return this.engineInputSources.refreshGamepadState().haptics.gamepads.some((gamepad) => gamepad.supported);
  }

  shouldSuppressKeyboardShortcut(event) {
    return this.shortcutSuppressionEnabled
      && this.isWorkspaceEvent(event)
      && (event.key === "Alt" || event.altKey || event.ctrlKey || event.metaKey);
  }

  shouldSuppressWheelShortcut(event) {
    return this.shortcutSuppressionEnabled
      && this.isWorkspaceEvent(event)
      && (event.ctrlKey || event.metaKey);
  }

  selectedGestureForSource(source) {
    if (this.selectedGesture?.source !== source || this.selectedGesture.captureKind !== "descriptor") {
      return null;
    }
    return this.selectedGesture;
  }

  isWorkspaceEvent(event) {
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    return path.includes(this.workspaceRoot) || this.workspaceRoot.contains(event.target);
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
    this.deviceList.render(devices, this.enabledDeviceIds, gamepadStatus.haptics, this.selectedRumbleSettings());
    this.gestureList.render(gestures, this.selectedGesture?.binding ?? "");
    this.capture.render(
      this.state.selectedActionLabel(),
      gamepadStatus.gamepads,
      selectedAction?.inputs ?? [],
      this.captureMode,
      this.captureAvailability()
    );
    this.preview.render(actions, this.state.selectedActionId, this.activeInputBindings);
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

  captureAvailability() {
    if (!this.selectedGesture || this.selectedGesture.captureKind === "combo") {
      return allCaptureAvailable();
    }
    return {
      gamepad: this.selectedGesture.source === "gamepad",
      keyboard: this.selectedGesture.source === "keyboard",
      mouse: this.selectedGesture.source === "mouse"
    };
  }
}

function keyboardDownBindings(code) {
  if (!code) {
    return [];
  }
  return [code, `${code}:KeyboardHold`];
}

function mouseButtonBinding(event) {
  return `MouseButton${Number(event?.button ?? 0)}`;
}

function isEditableInputEventTarget(target) {
  if (!target || typeof target.closest !== "function") {
    return false;
  }
  return Boolean(target.closest("input, textarea, [contenteditable='true'], [contenteditable='']"));
}

function isInteractiveInputMappingTarget(target) {
  if (!target || typeof target.closest !== "function") {
    return false;
  }
  return Boolean(target.closest("button, input, select, textarea, label, .input-mapping-v2__mapping-card, [contenteditable='true'], [contenteditable='']"));
}

function allCaptureAvailable() {
  return {
    gamepad: true,
    keyboard: true,
    mouse: true
  };
}
