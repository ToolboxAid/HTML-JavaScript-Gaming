import { downloadTextFile, readFileText } from '../../../src/engine/persistence/FilePersistenceService.js';

export class PaletteImportExportControl {
  constructor({ refs, app }) {
    this.refs = refs;
    this.app = app;
  }

  bind() {
    this.refs.importPaletteButton.addEventListener("click", () => {
      this.refs.importPaletteInput.click();
    });
    this.refs.importPaletteInput.addEventListener("change", () => {
      const file = this.refs.importPaletteInput.files?.[0] || null;
      this.refs.importPaletteInput.value = "";
      if (file) {
        void this.importPaletteJsonFromFile(file);
      }
    });
    this.refs.copyPaletteButton.addEventListener("click", () => {
      void this.copyPaletteJson();
    });
    this.refs.exportPaletteButton.addEventListener("click", () => {
      this.exportPaletteJson();
    });
  }

  render() {
    this.refs.paletteJsonPreview.textContent = JSON.stringify(this.app.getExportDocument(), null, 2);
  }

  async importPaletteJsonFromFile(file) {
    const rawText = await readFileText(file);
    let parsed = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      this.app.rejectImport(["Imported file is not valid JSON."]);
      return;
    }
    this.app.importPaletteDocument(parsed);
  }

  exportPaletteJson() {
    if (!this.app.preparePaletteDocument("Export blocked.")) {
      return;
    }

    downloadTextFile(JSON.stringify(this.app.getExportDocument(), null, 2), "tools.palette-manager-v2.json");
    this.app.setActionState([], "Exported tools.palette-manager-v2 JSON.");
  }

  async copyPaletteJson() {
    if (!this.app.preparePaletteDocument("Copy blocked.")) {
      return;
    }

    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      this.app.setActionState(["Clipboard API is unavailable."], "Copy blocked.");
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(this.app.getExportDocument(), null, 2));
    } catch {
      this.app.setActionState(["Clipboard write failed."], "Copy blocked.");
      return;
    }
    this.app.setActionState([], "Copied tools.palette-manager-v2 JSON.");
  }
}
