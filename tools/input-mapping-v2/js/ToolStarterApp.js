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
    this.doubleClickThresholdMs = 1000;
    this.doubleClickTimer = null;
    this.captureVisualStateMinimumMs = 300;
    this.captureVisualStateTimer = null;
    this.pendingDoubleClickInput = null;
    this.pendingKeyboardReleaseInput = null;
    this.pendingMouseDragInput = null;
    this.liveMouseDragInput = null;
    this.pendingGestureInput = null;
    this.selectedGesture = null;
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
    if (this.selectedGesture?.captureKind === "combo") {
      this.startComboCapture(this.selectedGesture.deviceLabel, "mouse");
      return;
    }
    if (this.isCaptureActive("mouse")) {
      this.cancelCapture("Mouse");
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
    if (this.captureMode) {
      this.clearCapture();
    }
    this.selectedGesture = gesture;
    this.pendingGestureInput = null;
    if (gesture.captureKind === "combo") {
      this.statusLog.ok(`${gesture.deviceLabel} ${gesture.label} selected. Press a Capture button to record a two-input combo.`);
      this.refreshActions();
      return;
    }
    if (gesture.captureKind === "wheel") {
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
    const gesture = this.selectedGestureForSource("keyboard");
    if (gesture?.binding === "KeyboardRelease") {
      this.pendingKeyboardReleaseInput = this.engineInputSources.captureKeyboard(event, gesture);
      this.capture.showMessage(`Keyboard Release recorded ${this.pendingKeyboardReleaseInput.displayLabelLines[1]}. Waiting for release.`);
      this.capture.setCaptureState("pending");
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
    const captureMode = mode || (captureId.startsWith("gamepad:") ? "gamepad" : captureId);
    this.captureMode = captureMode;
    this.activeCaptureId = captureId;
    if (captureId.startsWith("gamepad:")) {
      this.activeGamepadIndex = Number(captureId.slice("gamepad:".length));
    } else {
      this.activeGamepadIndex = null;
    }
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
    if (this.doubleClickTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.doubleClickTimer);
    }
    if (this.captureVisualStateTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.captureVisualStateTimer);
    }
    this.captureTimeoutTimer = null;
    this.doubleClickTimer = null;
    this.captureVisualStateTimer = null;
    this.captureMode = "";
    this.activeCaptureId = "";
    this.activeGamepadIndex = null;
    this.engineInputSources.resetComboCapture();
    this.lastCaptureWarning = "";
    this.pendingDoubleClickInput = null;
    this.pendingKeyboardReleaseInput = null;
    this.pendingMouseDragInput = null;
    this.capture.clearActiveCapture();
  }

  cancelCapture(captureLabel) {
    this.capture.showMessage(`${captureLabel} capture canceled for ${this.state.selectedActionLabel()}.`);
    this.statusLog.warn(`${captureLabel} capture canceled for ${this.state.selectedActionLabel()}.`);
    this.showCaptureCanceled();
    this.refreshActions();
  }

  isCaptureActive(captureId) {
    return captureId === this.activeCaptureId && !this.isCaptureVisualState();
  }

  isCaptureVisualState() {
    return this.captureMode === "complete" || this.captureMode === "canceled";
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

  startPendingMouseDrag(event, gesture) {
    const point = dragPointFromEvent(event);
    const button = Number(event.button ?? 0);
    this.pendingMouseDragInput = {
      button,
      currentPoint: point,
      gesture,
      isDragging: false,
      startPoint: point
    };
    this.capture.showMessage(`${gesture.deviceLabel} ${gesture.label} started with ${mouseButtonDetail(button)}. Move while holding the button.`);
    this.capture.setCaptureState("pending");
  }

  updatePendingMouseDrag(event) {
    if (!this.pendingMouseDragInput) {
      this.warnActiveCapture("Mouse Drag capture is waiting for a mouse button down before movement.");
      return;
    }
    const currentPoint = dragPointFromEvent(event);
    this.pendingMouseDragInput.currentPoint = currentPoint;
    this.pendingMouseDragInput.isDragging = this.pendingMouseDragInput.isDragging
      || dragDistance(this.pendingMouseDragInput.startPoint, currentPoint) >= dragThreshold();
    if (!this.pendingMouseDragInput.isDragging) {
      this.capture.showMessage(`${this.pendingMouseDragInput.gesture.deviceLabel} ${this.pendingMouseDragInput.gesture.label} is waiting for drag movement.`);
      this.capture.setCaptureState("pending");
      return;
    }
    if (this.pendingMouseDragInput.gesture.binding === "MousePrimaryDrag") {
      this.commitPendingMouseDrag({ released: false });
      return;
    }
    this.capture.showMessage(`${this.pendingMouseDragInput.gesture.deviceLabel} ${this.pendingMouseDragInput.gesture.label} tracking ${mouseButtonDetail(this.pendingMouseDragInput.button)}. Release to commit.`);
    this.capture.setCaptureState("pending");
  }

  finishPendingMouseDrag(event) {
    if (!this.pendingMouseDragInput) {
      this.warnActiveCapture("Mouse Drag Release capture is waiting for a mouse button down before release.");
      return;
    }
    this.pendingMouseDragInput.currentPoint = dragPointFromEvent(event);
    this.pendingMouseDragInput.isDragging = this.pendingMouseDragInput.isDragging
      || dragDistance(this.pendingMouseDragInput.startPoint, this.pendingMouseDragInput.currentPoint) >= dragThreshold();
    if (!this.pendingMouseDragInput.isDragging) {
      this.pendingMouseDragInput = null;
      this.warnActiveCapture("Mouse Drag capture needs movement before release; press, drag, and release again.");
      return;
    }
    this.commitPendingMouseDrag({ released: true });
  }

  commitPendingMouseDrag({ released }) {
    const pendingInput = this.pendingMouseDragInput;
    if (!pendingInput) {
      return;
    }
    const snapshot = mouseDragSnapshot(pendingInput, { released });
    const result = this.engineInputSources.capturePointerDragSnapshot(pendingInput.gesture.binding, snapshot);
    this.pendingMouseDragInput = null;
    if (!result.ok) {
      this.warnActiveCapture(result.message);
      return;
    }
    this.addCapturedInput(result.input);
  }

  startLiveMouseDrag(event) {
    const button = Number(event.button ?? 0);
    this.liveMouseDragInput = {
      binding: mouseButtonBinding(event),
      button,
      currentPoint: dragPointFromEvent(event),
      isDragging: false,
      startPoint: dragPointFromEvent(event)
    };
  }

  updateLiveMouseDrag(event) {
    if (!this.liveMouseDragInput) {
      return;
    }
    if (!mouseButtonIsDown(event, this.liveMouseDragInput.button)) {
      return;
    }
    const currentPoint = dragPointFromEvent(event);
    this.liveMouseDragInput.currentPoint = currentPoint;
    this.liveMouseDragInput.isDragging = this.liveMouseDragInput.isDragging
      || dragDistance(this.liveMouseDragInput.startPoint, currentPoint) >= dragThreshold();
    if (!this.liveMouseDragInput.isDragging) {
      return;
    }
    this.activateInputBindings([`${this.liveMouseDragInput.binding}:MousePrimaryDrag`]);
  }

  finishLiveMouseDrag(event) {
    const liveDrag = this.liveMouseDragInput;
    this.liveMouseDragInput = null;
    const binding = liveDrag?.binding ?? mouseButtonBinding(event);
    const activeDragBinding = `${binding}:MousePrimaryDrag`;
    const isDragging = liveDrag?.isDragging === true;
    this.clearActiveInputBindings([binding, activeDragBinding]);
    if (isDragging) {
      this.activateInputBindings([`${binding}:MousePrimaryDragRelease`], { transient: true });
    }
  }

  commitKeyboardRelease(event) {
    if (!this.pendingKeyboardReleaseInput) {
      this.warnActiveCapture("Keyboard Release capture needs a key down before release; press and release the key again.");
      return;
    }
    const releasedBinding = event.code || event.key;
    if (baseBinding(this.pendingKeyboardReleaseInput.binding) !== releasedBinding) {
      this.warnActiveCapture(`Keyboard Release capture is waiting for ${baseBinding(this.pendingKeyboardReleaseInput.binding)}; ${releasedBinding} was ignored.`);
      return;
    }
    this.addCapturedInput(this.pendingKeyboardReleaseInput);
  }

  recordDoubleClickInput(event, gesture) {
    const now = this.captureEventTime(event);
    const input = this.engineInputSources.captureMouse(event, gesture);
    const button = Number(event.button ?? 0);
    if (!this.pendingDoubleClickInput) {
      this.startPendingDoubleClick({ button, input, startedAt: now });
      return;
    }
    if (this.pendingDoubleClickInput.button !== button) {
      this.warnActiveCapture("Mouse Double Click capture needs the second click on the same mouse button; starting over with the latest click.");
      this.startPendingDoubleClick({ button, input, startedAt: now });
      return;
    }
    if (now - this.pendingDoubleClickInput.startedAt > this.doubleClickThresholdMs) {
      this.warnActiveCapture("Mouse Double Click capture needs two clicks within the double-click threshold; starting over with the latest click.");
      this.startPendingDoubleClick({ button, input, startedAt: now });
      return;
    }
    this.addCapturedInput(input);
  }

  startPendingDoubleClick(pendingInput) {
    if (this.doubleClickTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.doubleClickTimer);
    }
    this.pendingDoubleClickInput = pendingInput;
    this.capture.showMessage(`Mouse Double Click recorded first click on ${pendingInput.input.displayLabelLines[1]}. Waiting for second click.`);
    this.capture.setCaptureState("pending");
    this.doubleClickTimer = this.window.setTimeout?.(() => {
      this.capture.showMessage(`Mouse Double Click capture timed out waiting for the second click for ${this.state.selectedActionLabel()}.`);
      this.statusLog.warn(`Mouse Double Click capture timed out waiting for the second click for ${this.state.selectedActionLabel()}.`);
      this.showCaptureCanceled();
      this.refreshActions();
    }, this.doubleClickThresholdMs) ?? null;
  }

  showCaptureComplete() {
    this.capture.showMessage("Capture complete.");
    this.capture.setCaptureState("complete");
    this.finishCaptureVisualState("complete");
  }

  showCaptureCanceled() {
    this.capture.setCaptureState("canceled");
    this.finishCaptureVisualState("canceled");
  }

  finishCaptureVisualState(mode) {
    if (this.captureTimeoutTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.captureTimeoutTimer);
    }
    if (this.doubleClickTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.doubleClickTimer);
    }
    if (this.captureVisualStateTimer && typeof this.window.clearTimeout === "function") {
      this.window.clearTimeout(this.captureVisualStateTimer);
    }
    this.captureTimeoutTimer = null;
    this.doubleClickTimer = null;
    this.captureMode = mode;
    this.capture.setCaptureState(mode);
    this.engineInputSources.resetComboCapture();
    this.lastCaptureWarning = "";
    this.pendingDoubleClickInput = null;
    this.pendingKeyboardReleaseInput = null;
    this.pendingMouseDragInput = null;
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

function keyboardReleaseBindings(code) {
  if (!code) {
    return [];
  }
  return [`${code}:KeyboardRelease`];
}

function mouseButtonBinding(event) {
  return `MouseButton${Number(event?.button ?? 0)}`;
}

function isMouseDoubleClickEvent(event) {
  return Number(event?.detail ?? 0) >= 2;
}

function mouseButtonIsDown(event, button) {
  const buttons = Number(event?.buttons);
  if (!Number.isFinite(buttons) || buttons === 0) {
    return true;
  }
  return (buttons & mouseButtonMask(button)) !== 0;
}

function mouseButtonMask(button) {
  const buttonNumber = Number(button);
  if (buttonNumber === 0) {
    return 1;
  }
  if (buttonNumber === 1) {
    return 4;
  }
  if (buttonNumber === 2) {
    return 2;
  }
  if (buttonNumber === 3) {
    return 8;
  }
  if (buttonNumber === 4) {
    return 16;
  }
  return 0;
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

function baseBinding(binding) {
  return String(binding || "").split(":")[0];
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

function mouseDragSnapshot(pendingInput, { released }) {
  const bounds = dragBounds(pendingInput.startPoint, pendingInput.currentPoint);
  return {
    button: pendingInput.button,
    currentPoint: pendingInput.currentPoint,
    downPoint: pendingInput.startPoint,
    dragBounds: bounds,
    dragCurrent: pendingInput.currentPoint,
    dragEnd: released ? pendingInput.currentPoint : null,
    dragStart: pendingInput.startPoint,
    isDown: !released,
    isDragging: true,
    lastEventType: released ? "drag-release" : "drag",
    upPoint: released ? pendingInput.currentPoint : null,
    wasReleased: released
  };
}

function dragPointFromEvent(event) {
  return {
    x: finiteDragNumber(event.offsetX ?? event.clientX ?? event.pageX),
    y: finiteDragNumber(event.offsetY ?? event.clientY ?? event.pageY)
  };
}

function dragBounds(startPoint, endPoint) {
  const left = Math.min(startPoint.x, endPoint.x);
  const top = Math.min(startPoint.y, endPoint.y);
  const right = Math.max(startPoint.x, endPoint.x);
  const bottom = Math.max(startPoint.y, endPoint.y);
  return {
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
    x: left,
    y: top
  };
}

function dragDistance(startPoint, endPoint) {
  return Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
}

function dragThreshold() {
  return 4;
}

function finiteDragNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function mouseButtonDetail(button) {
  const buttonNumber = Number(button);
  if (buttonNumber === 0) {
    return "Mouse Left Button";
  }
  if (buttonNumber === 1) {
    return "Mouse Middle Button";
  }
  if (buttonNumber === 2) {
    return "Mouse Right Button";
  }
  if (buttonNumber === 3) {
    return "Mouse Button 4";
  }
  if (buttonNumber === 4) {
    return "Mouse Button 5";
  }
  return `Mouse Button ${buttonNumber + 1}`;
}
