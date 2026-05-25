export class AudioSfxPlaygroundV2App {
  constructor({ accordions, actionNav, audioEngine, controls, inspector, preview, serializer, shell, statusLog, windowRef = window }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.audioEngine = audioEngine;
    this.controls = controls;
    this.inspector = inspector;
    this.preview = preview;
    this.serializer = serializer;
    this.shell = shell;
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
      onToolExportToolState: () => this.exportToolState(),
      onToolPlay: () => {
        void this.play();
      },
      onWorkspaceCopyManifest: () => this.statusLog.write("Copy manifest action ready for workspace wiring."),
      onWorkspaceExportManifest: () => this.statusLog.write("Export manifest action ready for workspace wiring."),
      onWorkspaceImportManifest: () => this.statusLog.write("Import manifest action ready for workspace wiring.")
    });
    this.controls.mount({
      onChange: () => this.refreshPreview()
    });
    this.statusLog.mount();
    this.refreshPreview();
    this.statusLog.write("Audio / SFX Playground V2 ready.");
  }

  currentToolState() {
    const validation = this.controls.validate();
    if (!validation.valid) {
      this.controls.showMessage(validation.message, true);
      return { toolState: null, validation };
    }
    const toolState = this.serializer.createToolState(validation.value);
    this.controls.showMessage("Ready to audition.", false);
    return { toolState, validation };
  }

  refreshPreview() {
    const { toolState, validation } = this.currentToolState();
    if (!validation.valid) {
      this.preview.clear(validation.message);
      this.inspector.showObject({ error: validation.message });
      this.actionNav.setToolActionsEnabled(false);
      return;
    }
    this.preview.render(toolState.payload.sound);
    this.inspector.showObject(toolState);
    this.actionNav.setToolActionsEnabled(true);
  }

  async play() {
    const { toolState, validation } = this.currentToolState();
    if (!validation.valid) {
      this.statusLog.error(validation.message);
      this.refreshPreview();
      return;
    }
    try {
      await this.audioEngine.play(toolState.payload.sound);
      this.statusLog.write(`Played ${toolState.payload.name}.`);
    } catch (error) {
      this.statusLog.error(`Audio playback failed: ${error.message}`);
    }
    this.refreshPreview();
  }

  exportToolState() {
    const { toolState, validation } = this.currentToolState();
    if (!validation.valid) {
      this.statusLog.error(validation.message);
      this.refreshPreview();
      return;
    }
    this.inspector.showObject(toolState);
    this.statusLog.write("toolState preview written to Output Summary.");
  }

  async copyJson() {
    const { toolState, validation } = this.currentToolState();
    if (!validation.valid) {
      this.statusLog.error(validation.message);
      this.refreshPreview();
      return;
    }

    const json = JSON.stringify(toolState, null, 2);
    this.inspector.showObject(toolState);
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      this.statusLog.write("toolState JSON preview written to Output Summary. Clipboard API is unavailable.");
      return;
    }

    try {
      await this.window.navigator.clipboard.writeText(json);
      this.statusLog.write("toolState JSON copied.");
    } catch (error) {
      this.statusLog.error(`Copy JSON failed: ${error.message}`);
    }
  }
}
