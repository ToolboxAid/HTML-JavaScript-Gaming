export class ToolStarterApp {
  constructor({ accordions, actionNav, inspector, preview, serializer, shell, sourceInput, statusLog }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.inspector = inspector;
    this.preview = preview;
    this.serializer = serializer;
    this.shell = shell;
    this.sourceInput = sourceInput;
    this.statusLog = statusLog;
  }

  start() {
    this.shell.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.actionNav.mount({
      onExport: () => this.exportToolState(),
      onReset: () => this.reset(),
      onRun: () => this.run()
    });
    this.sourceInput.mount({
      onChange: () => this.refreshActions()
    });
    this.statusLog.mount();
    this.preview.clear();
    this.inspector.showObject({});
    this.refreshActions();
    this.statusLog.write("Starter template ready.");
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
    this.statusLog.write("Starter template reset.");
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

  refreshActions() {
    const hasValue = this.sourceInput.hasValue();
    if (!hasValue) {
      this.sourceInput.showMessage("Input is required before Run can process.", false);
    }
    this.actionNav.setRunEnabled(hasValue);
  }
}
