function cloneSound(sound) {
  return {
    attackMs: sound.attackMs,
    durationMs: sound.durationMs,
    frequencyHz: sound.frequencyHz,
    name: sound.name,
    noise: sound.noise,
    pitchSweepCents: sound.pitchSweepCents,
    releaseMs: sound.releaseMs,
    volume: sound.volume,
    waveform: sound.waveform
  };
}

function nextSoundNumberAfter(soundEntries) {
  let highest = 0;
  soundEntries.forEach((entry) => {
    const match = /^sfx-(\d+)$/.exec(entry.id);
    if (match) {
      highest = Math.max(highest, Number.parseInt(match[1], 10));
    }
  });
  return highest + 1;
}

function exportFileName(name) {
  const baseName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${baseName || "audio-sfx"}-tool-state.json`;
}

function duplicateSoundNameMessage(name) {
  return `Duplicate SFX name: ${name.trim()}.`;
}

function normalizeSoundName(name) {
  return name.trim().toLowerCase();
}

function activeSoundFromToolState(toolState) {
  return toolState.payload.sounds.find((entry) => entry.id === toolState.payload.activeSoundId)?.sound || null;
}

export class AudioSfxPlaygroundV2App {
  constructor({ accordions, actionNav, audioEngine, controls, inspector, preview, serializer, shell, statusLog, tileList, windowRef = window }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.activeSoundId = "";
    this.audioEngine = audioEngine;
    this.controls = controls;
    this.inspector = inspector;
    this.nextSoundNumber = 1;
    this.preview = preview;
    this.serializer = serializer;
    this.shell = shell;
    this.soundEntries = [];
    this.statusLog = statusLog;
    this.tileList = tileList;
    this.window = windowRef;
  }

  start() {
    this.shell.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.actionNav.mount({
      onToolCopyJson: () => {
        void this.copyJson();
      },
      onToolExportToolState: () => this.exportJson(),
      onToolImportJson: (file) => {
        void this.importJson(file);
      },
      onToolPlay: () => {
        void this.play();
      },
      onWorkspaceCopyManifest: () => this.statusLog.write("Copy manifest action ready for workspace wiring."),
      onWorkspaceExportManifest: () => this.statusLog.write("Export manifest action ready for workspace wiring."),
      onWorkspaceImportManifest: () => this.statusLog.write("Import manifest action ready for workspace wiring.")
    });
    this.controls.mount({
      onAdd: () => this.addCurrentSound(),
      onChange: () => this.handleEditorChange(),
      onDelete: () => this.deleteCurrentSound()
    });
    this.tileList.mount({
      onSelect: (soundId) => this.selectSound(soundId)
    });
    this.statusLog.mount();
    this.renderSoundList();
    this.refreshPreview();
    this.statusLog.write("Audio / SFX Playground V2 ready.");
  }

  currentToolState() {
    const validation = this.controls.validate();
    if (!validation.valid) {
      this.controls.showMessage(validation.message, true);
      return { toolState: null, validation };
    }
    const toolState = this.serializer.createToolState({
      activeSoundId: this.activeSoundId,
      soundEntries: this.soundEntries
    });
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
    this.preview.render(validation.value);
    this.inspector.showObject(toolState);
    this.actionNav.setToolActionsEnabled(true);
  }

  handleEditorChange() {
    const validation = this.controls.validate();
    if (validation.valid && this.activeSoundId && this.hasDuplicateSoundName(validation.value.name, this.activeSoundId)) {
      this.statusLog.error(duplicateSoundNameMessage(validation.value.name));
      this.controls.showMessage("Name must be unique.", true);
      return;
    }
    if (validation.valid && this.updateActiveSound(validation.value)) {
      this.renderSoundList();
    }
    this.refreshPreview();
  }

  hasDuplicateSoundName(name, excludedSoundId = "") {
    const normalizedName = normalizeSoundName(name);
    return this.soundEntries.some((entry) => entry.id !== excludedSoundId && normalizeSoundName(entry.sound.name) === normalizedName);
  }

  createSoundEntry(sound) {
    const entry = {
      id: `sfx-${this.nextSoundNumber}`,
      sound: cloneSound(sound)
    };
    this.nextSoundNumber += 1;
    this.soundEntries.push(entry);
    this.activeSoundId = entry.id;
    return entry;
  }

  updateActiveSound(sound) {
    const entry = this.soundEntries.find((candidate) => candidate.id === this.activeSoundId);
    if (!entry) {
      return null;
    }
    entry.sound = cloneSound(sound);
    return entry;
  }

  ensureActiveSoundEntry(sound) {
    const activeEntry = this.soundEntries.find((entry) => entry.id === this.activeSoundId);
    const excludedSoundId = activeEntry?.id || "";
    if (this.hasDuplicateSoundName(sound.name, excludedSoundId)) {
      return {
        valid: false,
        message: duplicateSoundNameMessage(sound.name)
      };
    }
    return {
      valid: true,
      entry: this.updateActiveSound(sound) || this.createSoundEntry(sound)
    };
  }

  addCurrentSound() {
    const validation = this.controls.validate();
    if (!validation.valid) {
      this.statusLog.error(validation.message);
      this.refreshPreview();
      return;
    }
    if (this.hasDuplicateSoundName(validation.value.name)) {
      this.statusLog.error(duplicateSoundNameMessage(validation.value.name));
      this.controls.showMessage("Name must be unique.", true);
      return;
    }

    const entry = this.createSoundEntry(validation.value);
    this.renderSoundList();
    this.refreshPreview();
    this.statusLog.write(`Added ${entry.sound.name}.`);
  }

  selectSound(soundId) {
    const entry = this.soundEntries.find((candidate) => candidate.id === soundId);
    if (!entry) {
      this.statusLog.error(`Unable to select missing SFX entry: ${soundId}.`);
      return;
    }
    this.activeSoundId = entry.id;
    this.controls.loadSound(entry.sound);
    this.renderSoundList();
    this.refreshPreview();
    this.statusLog.write(`Loaded ${entry.sound.name}.`);
  }

  renderSoundList() {
    this.tileList.render({
      activeSoundId: this.activeSoundId,
      soundEntries: this.soundEntries
    });
    this.controls.setDeleteEnabled(Boolean(this.activeSoundId));
  }

  async play() {
    const { validation } = this.currentToolState();
    if (!validation.valid) {
      this.statusLog.error(validation.message);
      this.refreshPreview();
      return;
    }
    try {
      await this.audioEngine.play(validation.value);
      this.statusLog.write(`Played ${validation.value.name}.`);
    } catch (error) {
      this.statusLog.error(`Audio playback failed: ${error.message}`);
    }
    this.refreshPreview();
  }

  deleteCurrentSound() {
    const entryIndex = this.soundEntries.findIndex((entry) => entry.id === this.activeSoundId);
    if (entryIndex === -1) {
      this.statusLog.error("Select a saved SFX tile before deleting.");
      this.controls.setDeleteEnabled(false);
      return;
    }
    const [entry] = this.soundEntries.splice(entryIndex, 1);
    const nextEntry = this.soundEntries[Math.min(entryIndex, this.soundEntries.length - 1)] || null;
    this.activeSoundId = nextEntry?.id || "";
    if (nextEntry) {
      this.controls.loadSound(nextEntry.sound);
    }
    this.renderSoundList();
    this.refreshPreview();
    this.statusLog.write(`Deleted ${entry.sound.name}.`);
  }

  exportPayload() {
    const validation = this.controls.validate();
    if (!validation.valid) {
      return { valid: false, message: validation.message, toolState: null, json: "" };
    }
    const activeSoundEntry = this.ensureActiveSoundEntry(validation.value);
    if (!activeSoundEntry.valid) {
      return { valid: false, message: activeSoundEntry.message, toolState: null, json: "" };
    }
    this.renderSoundList();
    const toolState = this.serializer.createToolState({
      activeSoundId: this.activeSoundId,
      soundEntries: this.soundEntries
    });

    const exportValidation = this.serializer.readToolState(toolState);
    if (!exportValidation.valid) {
      return { valid: false, message: exportValidation.message, toolState: null, json: "" };
    }
    return {
      valid: true,
      message: "",
      toolState,
      json: JSON.stringify(toolState, null, 2)
    };
  }

  exportJson() {
    const exportResult = this.exportPayload();
    if (!exportResult.valid) {
      this.statusLog.error(`Export JSON failed: ${exportResult.message}`);
      this.refreshPreview();
      return;
    }

    try {
      this.downloadJson(exportResult);
      this.inspector.showObject(exportResult.toolState);
      this.statusLog.write(`Exported JSON for ${activeSoundFromToolState(exportResult.toolState)?.name || "audio-sfx"}.`);
    } catch (error) {
      this.statusLog.error(`Export JSON failed: ${error.message}`);
    }
  }

  async importJson(file) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = this.serializer.readToolState(parsed);
      if (!result.valid) {
        this.statusLog.error(`Import JSON failed: ${result.message}`);
        return;
      }
      const nextSoundEntries = result.value.soundEntries.map((entry) => ({
        id: entry.id,
        sound: cloneSound(entry.sound)
      }));
      this.activeSoundId = result.value.activeSoundId;
      this.soundEntries = nextSoundEntries;
      this.nextSoundNumber = nextSoundNumberAfter(nextSoundEntries);
      this.controls.loadSound(result.value.sound);
      this.renderSoundList();
      this.refreshPreview();
      this.statusLog.write(`Imported JSON from ${file.name}.`);
    } catch (error) {
      this.statusLog.error(`Import JSON failed: ${error.message}`);
    }
  }

  async copyJson() {
    const exportResult = this.exportPayload();
    if (!exportResult.valid) {
      this.statusLog.error(`Copy JSON failed: ${exportResult.message}`);
      this.refreshPreview();
      return;
    }

    this.inspector.showObject(exportResult.toolState);
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      this.statusLog.error("Copy JSON failed: Clipboard API is unavailable.");
      return;
    }

    try {
      await this.window.navigator.clipboard.writeText(exportResult.json);
      this.statusLog.write("JSON copied.");
    } catch (error) {
      this.statusLog.error(`Copy JSON failed: ${error.message}`);
    }
  }

  downloadJson(exportResult) {
    const documentRef = this.window.document;
    const BlobConstructor = this.window.Blob;
    const urlApi = this.window.URL;
    if (!documentRef?.body || typeof BlobConstructor !== "function" || typeof urlApi?.createObjectURL !== "function") {
      throw new Error("Browser download APIs are unavailable.");
    }

    const blob = new BlobConstructor([exportResult.json], { type: "application/json" });
    const url = urlApi.createObjectURL(blob);
    const link = documentRef.createElement("a");
    link.href = url;
    link.download = exportFileName(activeSoundFromToolState(exportResult.toolState)?.name || "audio-sfx");
    try {
      documentRef.body.append(link);
      link.click();
    } finally {
      link.remove();
      urlApi.revokeObjectURL(url);
    }
  }
}
