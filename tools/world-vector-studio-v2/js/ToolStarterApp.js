export class ToolStarterApp {
  constructor({ accordions, actionNav, inspector, preview, serializer, shell, sourceInput, statusLog, windowRef = window }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.inspector = inspector;
    this.preview = preview;
    this.serializer = serializer;
    this.shell = shell;
    this.sourceInput = sourceInput;
    this.statusLog = statusLog;
    this.window = windowRef;
  }

  start() {
    this.shell.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.actionNav.mount({
      onToolCopyJson: () => {
        void this.copyJson();
      },
      onToolExport: () => this.run(),
      onToolExportToolState: () => this.exportToolState(),
      onWorkspaceCopyManifest: () => this.statusLog.write("Copy manifest action ready for workspace wiring."),
      onWorkspaceExportManifest: () => this.statusLog.write("Export manifest action ready for workspace wiring."),
      onWorkspaceImportManifest: () => this.statusLog.write("Import manifest action ready for workspace wiring.")
    });
    this.sourceInput.mount({
      onChange: () => this.refreshActions()
    });
    this.statusLog.mount();
    this.preview.clear();
    this.inspector.showObject({});
    this.refreshActions();
    this.statusLog.write("World Vector Studio ready.");
  }

  run() {
    const validation = this.sourceInput.validate();
    if (!validation.valid) {
      this.preview.clear();
      this.statusLog.error(validation.message);
      this.refreshActions();
      return;
    }

    const toolState = this.serializer.createToolState({ sourceValue: validation.value });
    this.preview.render(toolState.payload);
    this.inspector.showObject(toolState);
    this.statusLog.write(`Processed source value: ${validation.value}`);
    this.refreshActions();
  }

  reset() {
    this.sourceInput.clear();
    this.preview.clear();
    this.inspector.showObject({});
    this.statusLog.write("World Vector Studio reset.");
    this.refreshActions();
  }

  exportToolState() {
    const validation = this.sourceInput.validate();
    if (!validation.valid) {
      this.statusLog.error(validation.message);
      this.refreshActions();
      return;
    }

    const toolState = this.serializer.createToolState({ sourceValue: validation.value });
    this.inspector.showObject(toolState);
    this.statusLog.write("toolState preview written to Output Summary.");
    this.refreshActions();
  }

  async copyJson() {
    const validation = this.sourceInput.validate();
    if (!validation.valid) {
      this.statusLog.error(validation.message);
      this.refreshActions();
      return;
    }

    const toolState = this.serializer.createToolState({ sourceValue: validation.value });
    this.inspector.showObject(toolState);
    const json = JSON.stringify(toolState, null, 2);
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      this.statusLog.write("toolState JSON preview written to Output Summary. Clipboard API is unavailable.");
      this.refreshActions();
      return;
    }

    try {
      await this.window.navigator.clipboard.writeText(json);
      this.statusLog.write("toolState JSON copied.");
    } catch (error) {
      this.statusLog.error(`Copy JSON failed: ${error.message}`);
    }
    this.refreshActions();
  }

  refreshActions() {
    const hasValue = this.sourceInput.hasValue();
    if (!hasValue) {
      this.sourceInput.showMessage("Input is required before Export can process.", false);
    }
    this.actionNav.setToolActionsEnabled(hasValue);
  }
}
