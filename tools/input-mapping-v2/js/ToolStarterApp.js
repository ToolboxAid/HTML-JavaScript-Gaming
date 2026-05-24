import InputCaptureSession, {
  isMouseDoubleClickEvent,
  keyboardDownBindings,
  keyboardReleaseBindings,
  mouseButtonBinding
} from "/src/engine/input/InputCaptureSession.js";

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
    this.doubleClickThresholdMs = 1000;
    this.captureSession = new InputCaptureSession({ doubleClickThresholdMs: this.doubleClickThresholdMs });
    this.capturePendingTimer = null;
    this.captureVisualStateMinimumMs = 300;
    this.captureVisualStateTimer = null;
    this.selectedGesture = null;
    this.selectedCaptureSource = "";
    this.selectedCaptureId = "";
    this.rumbleSettingsByActionId = new Map();
    this.captureTimeoutMs = 8000;
    this.captureTimeoutTimer = null;
    this.lastCaptureWarning = "";
    this.contextMenuDisabled = false;
    this.shortcutSuppressionEnabled = false;
    this.gamepadPollIntervalMs = 100;
    this.gamepadPollTimer = null;
    this.lastGamepadStatusSignature = "";
    this.enabledDeviceIds = new Set();
    this.enabledDevicesInitialized = false;
    this.handleGamepadConnectionChange = this.handleGamepadConnectionChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.pollGamepadDevices = this.pollGamepadDevices.bind(this);
  }

  get captureMode() {
    return this.captureSession.mode;
  }

  get activeCaptureId() {
    return this.captureSession.activeCaptureId;
  }

  get activeGamepadIndex() {
    return this.captureSession.activeGamepadIndex;
  }

  start() {
    this.shell.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.actionNav.mount({
      onWorkspaceCopyManifest: () => {
        void this.copyJson();
      },
      onWorkspaceExportManifest: () => this.exportToolState(),
      onWorkspaceImportManifest: () => this.importJson()
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
    this.window.addEventListener("mousemove", this.handleMouseMove, true);
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
    this.clearSelectedCaptureDevice();
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
    this.clearSelectedCaptureDevice();
    this.clearCapture();
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
    if (this.isCaptureActive("keyboard")) {
      this.cancelCapture("Keyboard");
      return;
    }
    const hadSelectedCaptureDevice = this.selectedCaptureSource === "keyboard" && this.selectedCaptureId === "keyboard";
    this.selectCaptureDevice("keyboard", "keyboard", "Keyboard");
    if (!hadSelectedCaptureDevice || !this.selectedGestureForCaptureSource("keyboard")) {
      this.capture.showMessage(`Keyboard capture device selected for ${this.state.selectedActionLabel()}. Choose a Keyboard gesture to capture.`);
      this.statusLog.ok(`Keyboard capture device selected for ${this.state.selectedActionLabel()}.`);
      this.refreshActions();
      return;
    }
    if (this.selectedGesture?.captureKind === "combo") {
      this.startComboCapture(this.selectedGesture.deviceLabel, "keyboard");
      return;
    }
    this.beginCapture("keyboard");
    const gesture = this.selectedGestureForCaptureSource("keyboard");
    const message = gesture?.binding === "KeyboardRelease"
      ? `Press and release a keyboard key to bind ${gesture.label} to ${this.state.selectedActionLabel()}.`
      : `Press a keyboard key to bind it to ${this.state.selectedActionLabel()}.`;
    this.capture.showMessage(message);
    this.statusLog.ok(`Keyboard capture armed for ${this.state.selectedActionLabel()}.`);
  }

  startMouseCapture() {
    if (!this.ensureSelectedTileForCapture()) {
      return;
    }
    if (this.isCaptureActive("mouse")) {
      this.cancelCapture("Mouse");
      return;
    }
    const hadSelectedCaptureDevice = this.selectedCaptureSource === "mouse" && this.selectedCaptureId === "mouse";
    this.selectCaptureDevice("mouse", "mouse", "Mouse");
    if (!hadSelectedCaptureDevice || !this.selectedGestureForCaptureSource("mouse")) {
      this.capture.showMessage(`Mouse capture device selected for ${this.state.selectedActionLabel()}. Choose a Mouse gesture to capture.`);
      this.statusLog.ok(`Mouse capture device selected for ${this.state.selectedActionLabel()}.`);
      this.refreshActions();
      return;
    }
    if (this.selectedGesture?.captureKind === "combo") {
      this.startComboCapture(this.selectedGesture.deviceLabel, "mouse");
      return;
    }
    this.beginCapture("mouse");
    const gesture = this.selectedGestureForCaptureSource("mouse");
    const message = mouseCaptureMessage(gesture, this.state.selectedActionLabel());
    this.capture.showMessage(message);
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
    this.beginCapture(captureId, { mode: "combo" });
    const result = this.engineInputSources.beginComboCapture({
      actionLabel: this.state.selectedActionLabel(),
      deviceLabel
    });
    this.capture.showMessage(result.message);
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
    const captureId = `gamepad:${selectedIndex}`;
    if (this.isCaptureActive(captureId)) {
      this.cancelCapture(`Gamepad ${selectedIndex}`);
      return;
    }
    const hadSelectedCaptureDevice = this.selectedCaptureSource === "gamepad" && this.selectedCaptureId === captureId;
    this.selectCaptureDevice("gamepad", captureId, `Gamepad ${selectedIndex}`);
    if (!hadSelectedCaptureDevice || !this.selectedGestureForCaptureSource("gamepad")) {
      this.capture.showMessage(`Gamepad ${selectedIndex} capture device selected for ${this.state.selectedActionLabel()}. Choose a Game Controller gesture to capture.`);
      this.statusLog.ok(`Gamepad ${selectedIndex} capture device selected for ${this.state.selectedActionLabel()}.`);
      this.refreshActions();
      return;
    }
    if (this.selectedGesture?.captureKind === "combo") {
      this.startComboCapture(this.selectedGesture.deviceLabel, captureId);
      return;
    }
    this.beginCapture(captureId);
    this.capture.showMessage(`Press a button or move a stick on Gamepad ${selectedIndex} to bind it to ${this.state.selectedActionLabel()}.`);
    this.statusLog.ok(`Gamepad ${selectedIndex} capture armed for ${this.state.selectedActionLabel()}.`);
    this.tryCaptureActiveGamepad();
  }

  selectGesture(gesture) {
    if (this.selectedCaptureSource && !this.engineInputSources.isGestureCompatibleWithCaptureSource(this.selectedCaptureSource, gesture)) {
      this.statusLog.warn(`${gesture.deviceLabel} ${gesture.label} is unavailable for the selected capture device. Choose a matching Capture device first.`);
      this.refreshActions();
      return;
    }
    if (this.captureMode) {
      this.clearCapture();
    }
    this.selectedGesture = gesture;
    if (gesture.captureKind === "combo") {
      this.statusLog.ok(`${gesture.deviceLabel} ${gesture.label} selected. ${this.selectedCaptureSource ? "Waiting for combo input." : "Press a Capture button to record a two-input combo."}`);
      this.refreshActions();
      this.startSelectedCaptureForGesture();
      return;
    }
    this.statusLog.ok(`${gesture.deviceLabel} ${gesture.label} selected for next capture.`);
    this.refreshActions();
    this.startSelectedCaptureForGesture();
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
    const gesture = this.selectedGestureForSource("keyboard");
    if (gesture?.binding === "KeyboardRelease") {
      const result = this.captureSession.startKeyboardRelease(this.engineInputSources.captureKeyboard(event, gesture));
      this.capture.showMessage(result.message);
      this.capture.setCaptureState(result.state);
      return;
    }
    this.addCapturedInput(this.engineInputSources.captureKeyboard(event, gesture));
  }

  handleKeyUp(event) {
    if (this.captureMode === "keyboard" && this.selectedGestureForSource("keyboard")?.binding === "KeyboardRelease") {
      event.preventDefault();
      event.stopPropagation();
      this.commitKeyboardRelease(event);
      return;
    }
    if (this.captureMode) {
      return;
    }
    this.clearActiveInputBindings(keyboardDownBindings(event.code));
    this.activateInputBindings(keyboardReleaseBindings(event.code), { transient: true });
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
        const binding = mouseButtonBinding(event);
        this.activateInputBindings([binding]);
        if (isMouseDoubleClickEvent(event)) {
          this.activateInputBindings([`${binding}:MouseDoubleClick`], { transient: true });
        }
        this.startLiveMouseDrag(event);
      }
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const gesture = this.selectedGestureForCaptureSource("mouse");
    if (gesture?.captureKind === "wheel") {
      this.warnActiveCapture(`${gesture.deviceLabel} ${gesture.label} capture expects wheel input; mouse click ignored.`);
      return;
    }
    if (gesture?.captureKind === "pointer-drag") {
      this.startPendingMouseDrag(event, gesture);
      return;
    }
    if (gesture?.binding === "MouseDoubleClick") {
      this.recordDoubleClickInput(event, gesture);
      return;
    }
    this.addCapturedInput(this.engineInputSources.captureMouse(event, this.selectedGestureForSource("mouse")));
  }

  handleMouseMove(event) {
    if (this.captureMode === "mouse" && this.selectedGestureForCaptureSource("mouse")?.captureKind === "pointer-drag") {
      event.preventDefault();
      event.stopPropagation();
      this.updatePendingMouseDrag(event);
      return;
    }
    if (this.captureMode) {
      return;
    }
    this.updateLiveMouseDrag(event);
  }

  handleMouseUp(event) {
    if (this.captureMode === "mouse" && this.selectedGestureForCaptureSource("mouse")?.captureKind === "pointer-drag") {
      event.preventDefault();
      event.stopPropagation();
      this.finishPendingMouseDrag(event);
      return;
    }
    if (this.captureMode) {
      return;
    }
    this.finishLiveMouseDrag(event);
  }

  handleWheel(event) {
    if (this.shouldSuppressWheelShortcut(event)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (this.captureMode === "mouse") {
      event.preventDefault();
      event.stopPropagation();
      this.captureWheelInput(event);
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

  tryCaptureActiveGamepad({ refresh = true } = {}) {
    if (this.captureMode !== "gamepad" || !Number.isInteger(this.activeGamepadIndex)) {
      return false;
    }
    const result = this.engineInputSources.captureGamepad(this.activeGamepadIndex, this.selectedGestureForSource("gamepad"), { refresh });
    if (result.waiting) {
      return false;
    }
    if (!result.ok) {
      if (result.invalid) {
        this.warnActiveCapture(result.message);
        return false;
      }
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
    const result = this.engineInputSources.recordComboInput(input, { silentDuplicate });
    if (!result.ok) {
      if (result.silent) {
        return;
      }
      this.capture.showMessage(result.message);
      this.capture.setCaptureState("warning");
      this.statusLog.warn(result.message);
      return;
    }
    if (result.waiting) {
      this.capture.showMessage(result.message);
      this.capture.setCaptureState("pending");
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
    this.tryCaptureComboGamepad({ refresh: false });
    this.tryCaptureActiveGamepad({ refresh: false });
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

  selectCaptureDevice(source, captureId, label) {
    this.selectedCaptureSource = source;
    this.selectedCaptureId = captureId;
    if (this.selectedGesture && this.selectedGesture.source !== source) {
      this.selectedGesture = null;
    }
    this.capture.setSelectedCapture(captureId);
    this.capture.showMessage(`${label} capture device selected for ${this.state.selectedActionLabel()}. Choose a matching gesture to capture.`);
  }

  clearSelectedCaptureDevice() {
    this.selectedCaptureSource = "";
    this.selectedCaptureId = "";
    this.capture.setSelectedCapture("");
  }

  startSelectedCaptureForGesture() {
    if (this.selectedCaptureId === "keyboard") {
      this.startKeyboardCapture();
      return;
    }
    if (this.selectedCaptureId === "mouse") {
      this.startMouseCapture();
      return;
    }
    if (this.selectedCaptureId.startsWith("gamepad:")) {
      this.startGamepadCapture(Number(this.selectedCaptureId.slice("gamepad:".length)));
    }
  }

  addCapturedInput(input) {
    const result = this.state.addBindingToSelectedAction(input);
    this.showCaptureComplete(result.message);
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    this.refreshActions();
  }

  activateInputBindings(bindings, { transient = false } = {}) {
    const changed = this.engineInputSources.activateInputBindings(bindings, { transient });
    if (changed) {
      this.refreshActions();
    }
    if (transient) {
      this.window.setTimeout?.(() => {
        this.refreshActions();
      }, 280);
    }
  }

  clearActiveInputBindings(bindings) {
    const changed = this.engineInputSources.clearActiveInputBindings(bindings);
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
    return this.engineInputSources.replaceActiveInputBindings(shouldReplace, nextBindings);
  }

  beginCapture(captureId, { mode = "" } = {}) {
    this.clearCapture();
    this.captureSession.begin(captureId, { mode });
    this.capture.setActiveCapture(captureId);
    this.capture.setCaptureState("waiting");
    const timeoutMs = this.captureTimeoutDelay();
    this.captureTimeoutTimer = this.window.setTimeout?.(() => {
      this.capture.showMessage(`${this.captureLabel()} capture timed out for ${this.state.selectedActionLabel()}.`);
      this.statusLog.warn(`${this.captureLabel()} capture timed out for ${this.state.selectedActionLabel()}.`);
      this.showCaptureCanceled();
      this.refreshActions();
    }, timeoutMs) ?? null;
  }

  clearCapture() {
    if (this.captureTimeoutTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.captureTimeoutTimer);
    }
    if (this.capturePendingTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.capturePendingTimer);
    }
    if (this.captureVisualStateTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.captureVisualStateTimer);
    }
    this.captureTimeoutTimer = null;
    this.capturePendingTimer = null;
    this.captureVisualStateTimer = null;
    this.captureSession.reset();
    this.engineInputSources.resetComboCapture();
    this.lastCaptureWarning = "";
    this.capture.clearActiveCapture();
  }

  cancelCapture(captureLabel) {
    this.capture.showMessage(`${captureLabel} capture canceled for ${this.state.selectedActionLabel()}.`);
    this.statusLog.warn(`${captureLabel} capture canceled for ${this.state.selectedActionLabel()}.`);
    this.showCaptureCanceled();
    this.refreshActions();
  }

  isCaptureActive(captureId) {
    return this.captureSession.isCaptureActive(captureId);
  }

  isCaptureVisualState() {
    return this.captureSession.isVisualState();
  }

  captureTimeoutDelay() {
    const configuredTimeout = Number(this.window.__inputMappingV2CaptureTimeoutMs);
    return Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : this.captureTimeoutMs;
  }

  captureLabel() {
    return this.captureSession.captureLabel();
  }

  tryCaptureComboGamepad({ refresh = true } = {}) {
    if (this.captureMode !== "combo" || !this.enabledDeviceIds.has("gameController")) {
      return false;
    }
    const result = this.engineInputSources.captureFirstActiveGamepad({ refresh });
    if (!result.ok) {
      return false;
    }
    this.recordComboInput(result.input, { silentDuplicate: true });
    return true;
  }

  captureSelectedGesture() {
    const result = this.engineInputSources.captureGesture(this.selectedGesture.binding, this.enabledDeviceIds);
    if (!result.ok) {
      this.statusLog.warn(result.message);
      this.refreshActions();
      return;
    }
    this.addCapturedInput(result.input);
  }

  startPendingMouseDrag(event, gesture) {
    const result = this.captureSession.startPointerDrag(event, gesture);
    this.capture.showMessage(result.message);
    this.capture.setCaptureState(result.state);
  }

  updatePendingMouseDrag(event) {
    const result = this.captureSession.updatePointerDrag(event);
    if (!result.ok) {
      this.warnActiveCapture(result.message);
      return;
    }
    if (result.complete) {
      this.commitPendingMouseDrag(result);
      return;
    }
    this.capture.showMessage(result.message);
    this.capture.setCaptureState("pending");
  }

  finishPendingMouseDrag(event) {
    const result = this.captureSession.finishPointerDrag(event);
    if (!result.ok) {
      this.warnActiveCapture(result.message);
      return;
    }
    this.commitPendingMouseDrag(result);
  }

  commitPendingMouseDrag(result) {
    if (!result?.gesture || !result.snapshot) {
      return;
    }
    const captureResult = this.engineInputSources.capturePointerDragSnapshot(result.gesture.binding, result.snapshot);
    if (!captureResult.ok) {
      this.warnActiveCapture(captureResult.message);
      return;
    }
    this.addCapturedInput(captureResult.input);
  }

  startLiveMouseDrag(event) {
    this.captureSession.startLivePointerDrag(event);
  }

  updateLiveMouseDrag(event) {
    const result = this.captureSession.updateLivePointerDrag(event);
    this.activateInputBindings(result.activeBindings);
  }

  finishLiveMouseDrag(event) {
    const result = this.captureSession.finishLivePointerDrag(event);
    this.clearActiveInputBindings(result.clearBindings);
    this.activateInputBindings(result.transientBindings, { transient: true });
  }

  commitKeyboardRelease(event) {
    const result = this.captureSession.commitKeyboardRelease(event);
    if (!result.ok) {
      this.warnActiveCapture(result.message);
      return;
    }
    this.addCapturedInput(result.input);
  }

  recordDoubleClickInput(event, gesture) {
    const input = this.engineInputSources.captureMouse(event, gesture);
    const result = this.captureSession.recordDoubleClick(event, input, {
      now: this.captureEventTime(event),
      thresholdMs: this.doubleClickThresholdMs
    });
    if (result.warning) {
      this.statusLog.warn(result.warning);
    }
    if (result.waiting) {
      this.startPendingDoubleClick(result);
      return;
    }
    this.clearPendingCaptureTimer();
    this.addCapturedInput(result.input);
  }

  startPendingDoubleClick(result) {
    this.clearPendingCaptureTimer();
    this.capture.showMessage(result.message);
    this.capture.setCaptureState(result.state);
    this.capturePendingTimer = this.window.setTimeout?.(() => {
      this.captureSession.resetDoubleClick();
      this.capture.showMessage(`Mouse Double Click capture timed out waiting for the second click for ${this.state.selectedActionLabel()}.`);
      this.statusLog.warn(`Mouse Double Click capture timed out waiting for the second click for ${this.state.selectedActionLabel()}.`);
      this.showCaptureCanceled();
      this.refreshActions();
    }, this.doubleClickThresholdMs) ?? null;
  }

  clearPendingCaptureTimer() {
    if (this.capturePendingTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.capturePendingTimer);
    }
    this.capturePendingTimer = null;
  }

  showCaptureComplete() {
    this.clearSelectedCaptureDevice();
    this.capture.showMessage("Capture complete.");
    this.capture.setCaptureState("complete");
    this.finishCaptureVisualState("complete");
  }

  showCaptureCanceled() {
    this.clearSelectedCaptureDevice();
    this.capture.setCaptureState("canceled");
    this.finishCaptureVisualState("canceled");
  }

  finishCaptureVisualState(mode) {
    if (this.captureTimeoutTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.captureTimeoutTimer);
    }
    if (this.capturePendingTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.capturePendingTimer);
    }
    if (this.captureVisualStateTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.captureVisualStateTimer);
    }
    this.captureTimeoutTimer = null;
    this.capturePendingTimer = null;
    this.captureSession.setVisualMode(mode);
    this.capture.setCaptureState(mode);
    this.engineInputSources.resetComboCapture();
    this.lastCaptureWarning = "";
    this.captureVisualStateTimer = this.window.setTimeout?.(() => {
      this.captureVisualStateTimer = null;
      this.clearCapture();
      this.refreshActions();
    }, this.captureVisualStateDelay()) ?? null;
  }

  captureVisualStateDelay() {
    const configuredDelay = Number(this.window.__inputMappingV2CaptureVisualMinimumMs);
    return Number.isFinite(configuredDelay) && configuredDelay >= 0
      ? configuredDelay
      : this.captureVisualStateMinimumMs;
  }

  captureWheelInput(event) {
    const gesture = this.selectedGestureForCaptureSource("mouse");
    if (gesture?.captureKind !== "wheel") {
      this.warnActiveCapture(`${gesture?.deviceLabel ?? "Mouse"} ${gesture?.label ?? "gesture"} capture expects mouse button input; wheel input ignored.`);
      return;
    }
    const input = this.engineInputSources.captureWheel(event);
    if (input.binding !== gesture.binding) {
      this.warnActiveCapture(`${gesture.deviceLabel} ${gesture.label} capture expects ${gesture.label}; ${input.displayLabelLines[1]} was ignored.`);
      return;
    }
    this.addCapturedInput(input);
  }

  warnActiveCapture(message) {
    this.capture.showMessage(message);
    this.capture.setCaptureState("warning");
    if (message !== this.lastCaptureWarning) {
      this.statusLog.warn(message);
      this.lastCaptureWarning = message;
    }
  }

  captureEventTime(event) {
    const eventTime = Number(event?.timeStamp);
    if (Number.isFinite(eventTime) && eventTime > 0) {
      return eventTime;
    }
    return Number(this.window.performance?.now?.()) || Date.now();
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

  selectedGestureForCaptureSource(source) {
    return this.selectedGesture?.source === source ? this.selectedGesture : null;
  }

  isWorkspaceEvent(event) {
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    return path.includes(this.workspaceRoot) || this.workspaceRoot.contains(event.target);
  }

  exportToolState() {
    this.inspector.showObject(this.state.payload());
    this.statusLog.ok("Input Mapping V2 JSON preview written.");
  }

  importJson() {
    this.statusLog.warn("Import disabled: Input Mapping V2 imports through Workspace Manager game.manifest launch data. Edit game.manifest.json or relaunch from Workspace Manager with updated tool data.");
  }

  async copyJson() {
    const payload = this.state.payload();
    const json = JSON.stringify(payload, null, 2);
    this.inspector.showObject(payload);
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
    const hasSelectedActionTile = this.state.selectedActionHasTile();
    this.actionNav.setToolActionsEnabled(true);
    this.exportControl.setEnabled(true);
    this.actionSelection.render(actions, this.state.selectedActionId);
    this.deviceList.render(devices, this.enabledDeviceIds, gamepadStatus.haptics, this.selectedRumbleSettings());
    this.gestureList.render(gestures, this.selectedGesture?.binding ?? "", this.captureGestureSourceFilter(), hasSelectedActionTile);
    this.capture.render(
      this.state.selectedActionLabel(),
      gamepadStatus.gamepads,
      selectedAction?.inputs ?? [],
      this.captureMode,
      this.captureAvailability(),
      this.selectedCaptureId || this.activeCaptureId,
      hasSelectedActionTile
    );
    this.preview.render(
      this.engineInputSources.actionsWithActiveInputState(actions),
      this.state.selectedActionId
    );
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
    return allCaptureAvailable();
  }

  captureGestureSourceFilter() {
    if (this.selectedCaptureSource) {
      return this.selectedCaptureSource;
    }
    if (this.captureMode === "keyboard" || this.captureMode === "mouse" || this.captureMode === "gamepad") {
      return this.captureMode;
    }
    if (this.captureMode === "combo") {
      return this.captureSourceFromId(this.activeCaptureId);
    }
    return "";
  }

  captureSourceFromId(captureId) {
    if (captureId === "keyboard" || captureId === "mouse") {
      return captureId;
    }
    return String(captureId || "").startsWith("gamepad:") ? "gamepad" : "";
  }
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

function mouseCaptureMessage(gesture, actionLabel) {
  if (gesture?.binding === "MouseDoubleClick") {
    return `Double-click a mouse button to bind it to ${actionLabel}.`;
  }
  if (gesture?.binding === "MousePrimaryDrag") {
    return `Press a mouse button and move while holding to bind Drag to ${actionLabel}.`;
  }
  if (gesture?.binding === "MousePrimaryDragRelease") {
    return `Press a mouse button, drag, and release to bind Drag Release to ${actionLabel}.`;
  }
  if (gesture?.captureKind === "wheel") {
    return `Scroll ${gesture.label.toLowerCase()} to bind it to ${actionLabel}.`;
  }
  return `Click a mouse button to bind it to ${actionLabel}.`;
}
