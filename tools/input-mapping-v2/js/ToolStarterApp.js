export class ToolStarterApp {
  constructor({
    accordions,
    actionNav,
    actionSelection,
    capture,
    engineInputSources,
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
    this.inspector = inspector;
    this.preview = preview;
    this.shell = shell;
    this.sourceInventory = sourceInventory;
    this.state = state;
    this.statusLog = statusLog;
    this.window = windowRef;
    this.captureMode = "";
    this.handleGamepadConnectionChange = this.handleGamepadConnectionChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
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
      onClearAction: () => this.clearSelectedAction(),
      onResetActions: () => this.resetActions()
    });
    this.capture.mount({
      onCaptureGamepad: () => this.captureGamepad(),
      onCaptureKeyboard: () => this.startKeyboardCapture(),
      onCaptureMouse: () => this.startMouseCapture()
    });
    this.engineInputSources.attach();
    this.window.addEventListener("gamepadconnected", this.handleGamepadConnectionChange);
    this.window.addEventListener("gamepaddisconnected", this.handleGamepadConnectionChange);
    this.window.addEventListener("keydown", this.handleKeyDown, true);
    this.window.addEventListener("mousedown", this.handleMouseDown, true);
    this.statusLog.mount();
    this.preview.mount({
      onChangeTileAction: ({ actionId, nextActionId }) => this.changeTileAction(actionId, nextActionId),
      onDeleteBinding: ({ actionId, binding }) => this.deleteBinding(actionId, binding)
    });
    this.refreshActions();
    this.statusLog.ok("Input Mapping V2 ready.");
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

  changeTileAction(actionId, nextActionId) {
    const result = this.state.changeTileAction(actionId, nextActionId);
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    this.refreshActions();
  }

  clearSelectedAction() {
    const result = this.state.clearSelectedAction();
    this.statusLog[result.ok ? "ok" : "warn"](result.message);
    this.refreshActions();
  }

  resetActions() {
    this.state.reset();
    this.captureMode = "";
    this.statusLog.ok("Default actions restored.");
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

  captureGamepad() {
    const result = this.engineInputSources.captureGamepad();
    if (!result.ok) {
      this.capture.showMessage(result.message);
      this.statusLog.warn(result.message);
      this.refreshActions();
      return;
    }
    this.addCapturedInput(result.input);
  }

  handleGamepadConnectionChange() {
    const status = this.engineInputSources.refreshGamepadState();
    if (status.warning) {
      this.statusLog.warn(status.warning);
    } else {
      this.statusLog.ok(status.message);
    }
    this.refreshActions();
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

  refreshActions() {
    this.actionNav.setToolActionsEnabled(true);
    this.actionSelection.render(this.state.actions(), this.state.selectedActionId);
    this.capture.render(this.state.selectedActionLabel());
    this.preview.render(this.state.actions());
    this.inspector.showObject(this.state.payload());
    this.sourceInventory.render(this.engineInputSources.sources());
  }
}
