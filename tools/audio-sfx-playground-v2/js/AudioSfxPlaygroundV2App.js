function cloneSound(sound) {
  return {
    attackMs: sound.attackMs,
    durationMs: sound.durationMs,
    frequencyHz: sound.frequencyHz,
    name: sound.name,
    noise: sound.noise,
    noiseAmount: sound.noiseAmount,
    noiseDecayMs: sound.noiseDecayMs,
    noiseFilterHz: sound.noiseFilterHz,
    playbackMode: sound.playbackMode,
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

function cloneSoundEntries(soundEntries) {
  return soundEntries.map((entry) => ({
    id: entry.id,
    sound: cloneSound(entry.sound)
  }));
}

function snapshotsMatch(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function activeSoundFromToolState(toolState) {
  return toolState.payload.sounds.find((entry) => entry.id === toolState.payload.activeSoundId)?.sound || null;
}

const TOOL_ID = "audio-sfx-playground-v2";
const TOOL_SCHEMA_PATH = "tools/schemas/tools/audio-sfx-playground-v2.schema.json";

function toolStateFromPayload(payload) {
  return {
    $schema: TOOL_SCHEMA_PATH,
    schema: "html-js-gaming.tool-state",
    version: 1,
    toolId: TOOL_ID,
    payload
  };
}

export class AudioSfxPlaygroundV2App {
  constructor({
    accordions,
    actionNav,
    audioEngine,
    controls,
    inspector,
    manifestLoader = null,
    preview,
    serializer,
    shell,
    statusLog,
    tileList,
    windowRef = window,
    workspaceDirtyNotifier = null
  }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.activeSoundId = "";
    this.audioEngine = audioEngine;
    this.controls = controls;
    this.inspector = inspector;
    this.manifestLoader = manifestLoader;
    this.nextSoundNumber = 1;
    this.preview = preview;
    this.serializer = serializer;
    this.shell = shell;
    this.soundEntries = [];
    this.statusLog = statusLog;
    this.tileList = tileList;
    this.redoStack = [];
    this.undoStack = [];
    this.historyBaselineSnapshot = null;
    this.window = windowRef;
    this.workspaceDirtyNotifier = workspaceDirtyNotifier;
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
      onToolRedo: () => {
        void this.redo();
      },
      onToolStopAll: () => this.stopAll(),
      onToolStop: () => this.stop(),
      onToolUndo: () => {
        void this.undo();
      },
      onWorkspaceCopyManifest: () => this.statusLog.write("Copy manifest action ready for workspace wiring."),
      onWorkspaceExportManifest: () => this.statusLog.write("Export manifest action ready for workspace wiring."),
      onWorkspaceImportManifest: () => this.statusLog.write("Import manifest action ready for workspace wiring.")
    });
    this.controls.mount({
      onAdd: () => this.addCurrentSound(),
      onChange: () => this.handleEditorChange(),
      onDelete: () => this.deleteCurrentSound(),
      onRename: () => this.renameCurrentSound()
    });
    this.tileList.mount({
      onSelect: (soundId) => {
        void this.selectSound(soundId);
      }
    });
    this.statusLog.mount();
    this.refreshHistoryActions();
    void this.finishStartup();
  }

  async finishStartup() {
    await this.loadWorkspacePayload();
    this.renderSoundList();
    this.refreshPreview();
    this.resetHistoryBaseline();
    this.statusLog.write("Audio / SFX Playground V2 ready.");
  }

  async loadWorkspacePayload() {
    if (!this.manifestLoader) {
      return;
    }
    const result = await this.manifestLoader.loadInitialManifest();
    if (result.skipped) {
      return;
    }
    if (!result.ok) {
      this.statusLog.error(`Workspace payload load failed: ${result.message}`);
      return;
    }
    const payload = result.manifest?.tools?.[TOOL_ID] || null;
    if (!payload) {
      return;
    }
    const validation = this.serializer.readToolState(toolStateFromPayload(payload));
    if (!validation.valid) {
      this.statusLog.error(`Workspace payload load failed: ${validation.message}`);
      return;
    }
    const nextSoundEntries = cloneSoundEntries(validation.value.soundEntries);
    this.activeSoundId = validation.value.activeSoundId;
    this.soundEntries = nextSoundEntries;
    this.nextSoundNumber = nextSoundNumberAfter(nextSoundEntries);
    this.controls.loadSound(validation.value.sound);
    this.statusLog.write(`Loaded ${validation.value.sound.name} from Workspace V2.`);
  }

  currentToolState() {
    const validation = this.controls.validate({ nameOverride: this.activeSoundName() });
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
      this.actionNav.setPlaybackActionsEnabled(false);
      return;
    }
    this.preview.render(validation.value);
    this.inspector.showObject(toolState);
    this.actionNav.setToolActionsEnabled(true);
    this.actionNav.setPlaybackActionsEnabled(Boolean(this.activeSoundId));
  }

  handleEditorChange() {
    const beforeSnapshot = this.historyBaselineSnapshot;
    const validation = this.controls.validate({ nameOverride: this.activeSoundName() });
    if (validation.valid && this.updateActiveSound(this.soundForActiveEditorValue(validation.value))) {
      this.renderSoundList();
      this.commitUndoableChange({
        beforeSnapshot,
        changedKeys: ["data.sounds"],
        reason: "audio-sfx-editor-change"
      });
    }
    if (validation.valid && !this.activeSoundId) {
      this.commitUndoableChange({
        beforeSnapshot,
        changedKeys: ["data.sounds"],
        reason: "audio-sfx-editor-change",
        shouldSyncDirty: false
      });
    }
    this.refreshPreview();
  }

  createHistorySnapshot(editorSound = null) {
    const validation = editorSound
      ? { valid: true, value: editorSound }
      : this.controls.validate();
    if (!validation.valid) {
      return null;
    }
    return {
      activeSoundId: this.activeSoundId,
      editorSound: cloneSound(validation.value),
      editorStyleProfile: this.controls.currentStyleProfile(),
      nextSoundNumber: this.nextSoundNumber,
      soundEntries: cloneSoundEntries(this.soundEntries)
    };
  }

  resetHistoryBaseline() {
    this.historyBaselineSnapshot = this.createHistorySnapshot();
    this.refreshHistoryActions();
  }

  commitUndoableChange({ beforeSnapshot, changedKeys, reason, shouldSyncDirty = true }) {
    const afterSnapshot = this.createHistorySnapshot();
    if (!beforeSnapshot || !afterSnapshot || snapshotsMatch(beforeSnapshot, afterSnapshot)) {
      this.historyBaselineSnapshot = afterSnapshot;
      this.refreshHistoryActions();
      return false;
    }
    this.undoStack.push(beforeSnapshot);
    this.redoStack = [];
    this.historyBaselineSnapshot = afterSnapshot;
    this.refreshHistoryActions();
    if (shouldSyncDirty) {
      void this.syncWorkspaceDirty(reason, changedKeys);
    }
    return true;
  }

  restoreHistorySnapshot(snapshot) {
    this.activeSoundId = snapshot.activeSoundId;
    this.soundEntries = cloneSoundEntries(snapshot.soundEntries);
    this.nextSoundNumber = snapshot.nextSoundNumber;
    this.controls.loadSound(snapshot.editorSound, snapshot.editorStyleProfile);
    this.renderSoundList();
    this.refreshPreview();
    this.historyBaselineSnapshot = this.createHistorySnapshot();
    this.refreshHistoryActions();
  }

  refreshHistoryActions() {
    this.actionNav.setUndoRedoActionsEnabled({
      canRedo: this.redoStack.length > 0,
      canUndo: this.undoStack.length > 0
    });
  }

  async undo() {
    if (!this.undoStack.length) {
      this.refreshHistoryActions();
      return;
    }
    const currentSnapshot = this.createHistorySnapshot();
    const previousSnapshot = this.undoStack.pop();
    if (currentSnapshot) {
      this.redoStack.push(currentSnapshot);
    }
    this.restoreHistorySnapshot(previousSnapshot);
    await this.syncWorkspaceDirty("audio-sfx-undo", ["data.sounds", "data.activeSoundId"]);
    this.statusLog.write("Undid last Audio / SFX edit.");
  }

  async redo() {
    if (!this.redoStack.length) {
      this.refreshHistoryActions();
      return;
    }
    const currentSnapshot = this.createHistorySnapshot();
    const nextSnapshot = this.redoStack.pop();
    if (currentSnapshot) {
      this.undoStack.push(currentSnapshot);
    }
    this.restoreHistorySnapshot(nextSnapshot);
    await this.syncWorkspaceDirty("audio-sfx-redo", ["data.sounds", "data.activeSoundId"]);
    this.statusLog.write("Redid last Audio / SFX edit.");
  }

  async syncWorkspaceDirty(reason, changedKeys) {
    if (typeof this.workspaceDirtyNotifier !== "function") {
      return;
    }
    const { toolState, validation } = this.currentToolState();
    if (!validation.valid || !toolState) {
      this.statusLog.error(`Workspace dirty sync skipped: ${validation.message}`);
      return;
    }
    const result = await this.workspaceDirtyNotifier(toolState.payload, { reason, changedKeys });
    if (result.skipped) {
      return;
    }
    if (!result.ok) {
      this.statusLog.error(`Workspace dirty sync failed: ${result.message}`);
      return;
    }
    if (result.changed) {
      this.statusLog.write(`Workspace dirty state updated: ${result.reason}.`);
    }
  }

  hasDuplicateSoundName(name, excludedSoundId = "") {
    const normalizedName = normalizeSoundName(name);
    return this.soundEntries.some((entry) => entry.id !== excludedSoundId && normalizeSoundName(entry.sound.name) === normalizedName);
  }

  activeSoundName() {
    return this.soundEntries.find((entry) => entry.id === this.activeSoundId)?.sound.name || "";
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

  soundForActiveEditorValue(sound) {
    const entry = this.soundEntries.find((candidate) => candidate.id === this.activeSoundId);
    if (!entry) {
      return sound;
    }
    return {
      ...sound,
      name: entry.sound.name
    };
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

    const beforeSnapshot = this.createHistorySnapshot();
    const entry = this.createSoundEntry(validation.value);
    this.renderSoundList();
    this.refreshPreview();
    this.commitUndoableChange({
      beforeSnapshot,
      changedKeys: ["data.sounds", "data.activeSoundId"],
      reason: "audio-sfx-sound-added"
    });
    this.statusLog.write(`Added ${entry.sound.name}.`);
  }

  renameCurrentSound() {
    const entry = this.soundEntries.find((candidate) => candidate.id === this.activeSoundId);
    if (!entry) {
      this.statusLog.error("Select a saved SFX tile before renaming.");
      this.controls.setRenameEnabled(false);
      return;
    }
    const nextName = this.controls.currentName();
    if (!nextName) {
      this.statusLog.error("Name is required.");
      this.controls.showMessage("Name is required.", true);
      return;
    }
    if (this.hasDuplicateSoundName(nextName, entry.id)) {
      this.statusLog.error(duplicateSoundNameMessage(nextName));
      this.controls.showMessage("Name must be unique.", true);
      return;
    }
    const beforeSnapshot = this.createHistorySnapshot(entry.sound);
    this.audioEngine.stop(entry.sound.name);
    entry.sound.name = nextName;
    this.renderSoundList();
    this.refreshPreview();
    this.commitUndoableChange({
      beforeSnapshot,
      changedKeys: ["data.sounds"],
      reason: "audio-sfx-sound-renamed"
    });
    this.statusLog.write(`Renamed SFX to ${entry.sound.name}.`);
  }

  async selectSound(soundId) {
    const entry = this.soundEntries.find((candidate) => candidate.id === soundId);
    if (!entry) {
      this.statusLog.error(`Unable to select missing SFX entry: ${soundId}.`);
      return;
    }
    this.activeSoundId = entry.id;
    this.controls.loadSound(entry.sound);
    this.renderSoundList();
    this.refreshPreview();
    this.resetHistoryBaseline();
    this.statusLog.write(`Loaded ${entry.sound.name}.`);
    try {
      const playbackResult = await this.audioEngine.play(entry.sound);
      this.writePlaybackStatus(entry.sound, playbackResult);
    } catch (error) {
      this.statusLog.error(`Audio playback failed: ${error.message}`);
    }
  }

  renderSoundList() {
    this.tileList.render({
      activeSoundId: this.activeSoundId,
      soundEntries: this.soundEntries
    });
    this.controls.setDeleteEnabled(Boolean(this.activeSoundId));
    this.controls.setRenameEnabled(Boolean(this.activeSoundId));
    this.actionNav.setPlaybackActionsEnabled(Boolean(this.activeSoundId));
  }

  async play() {
    if (!this.activeSoundId) {
      this.statusLog.error("Select a saved SFX tile before playback.");
      return;
    }
    const { validation } = this.currentToolState();
    if (!validation.valid) {
      this.statusLog.error(validation.message);
      this.refreshPreview();
      return;
    }
    try {
      const sound = this.soundForActiveEditorValue(validation.value);
      const playbackResult = await this.audioEngine.play(sound);
      this.writePlaybackStatus(sound, playbackResult);
    } catch (error) {
      this.statusLog.error(`Audio playback failed: ${error.message}`);
    }
    this.refreshPreview();
  }

  writePlaybackStatus(sound, playbackResult) {
    if (playbackResult?.stopped) {
      return;
    }
    if (sound.playbackMode === "loop") {
      this.statusLog.write(`Looping ${sound.name}. Press Stop to end playback.`);
      return;
    }
    this.statusLog.write(`Played ${sound.name}.`);
  }

  stop() {
    const activeName = this.activeSoundName();
    if (!activeName) {
      this.statusLog.error("Select a saved SFX tile before stopping playback.");
      return;
    }
    const stopped = this.audioEngine.stop(activeName);
    if (!stopped) {
      this.statusLog.write(`No active playback found for ${activeName}.`);
      return;
    }
    this.statusLog.write(`Stopped ${activeName}.`);
  }

  stopAll() {
    const stoppedCount = this.audioEngine.stopAll();
    if (!stoppedCount) {
      this.statusLog.write("No active playback found.");
      return;
    }
    this.statusLog.write(`Stopped ${stoppedCount} active SFX playback${stoppedCount === 1 ? "" : "s"}.`);
  }

  deleteCurrentSound() {
    const entryIndex = this.soundEntries.findIndex((entry) => entry.id === this.activeSoundId);
    if (entryIndex === -1) {
      this.statusLog.error("Select a saved SFX tile before deleting.");
      this.controls.setDeleteEnabled(false);
      return;
    }
    const beforeSnapshot = this.createHistorySnapshot();
    const [entry] = this.soundEntries.splice(entryIndex, 1);
    this.audioEngine.stop(entry.sound.name);
    const nextEntry = this.soundEntries[Math.min(entryIndex, this.soundEntries.length - 1)] || null;
    this.activeSoundId = nextEntry?.id || "";
    if (nextEntry) {
      this.controls.loadSound(nextEntry.sound);
    }
    this.renderSoundList();
    this.refreshPreview();
    this.commitUndoableChange({
      beforeSnapshot,
      changedKeys: ["data.sounds", "data.activeSoundId"],
      reason: "audio-sfx-sound-deleted"
    });
    this.statusLog.write(`Deleted ${entry.sound.name}.`);
  }

  exportPayload() {
    const validation = this.controls.validate({ nameOverride: this.activeSoundName() });
    if (!validation.valid) {
      return { valid: false, message: validation.message, toolState: null, json: "" };
    }
    const activeSoundEntry = this.ensureActiveSoundEntry(this.soundForActiveEditorValue(validation.value));
    if (!activeSoundEntry.valid) {
      return { valid: false, message: activeSoundEntry.message, toolState: null, json: "" };
    }
    this.renderSoundList();
    this.resetHistoryBaseline();
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
      const beforeSnapshot = this.createHistorySnapshot();
      const nextSoundEntries = cloneSoundEntries(result.value.soundEntries);
      this.activeSoundId = result.value.activeSoundId;
      this.soundEntries = nextSoundEntries;
      this.nextSoundNumber = nextSoundNumberAfter(nextSoundEntries);
      this.controls.loadSound(result.value.sound);
      this.renderSoundList();
      this.refreshPreview();
      this.commitUndoableChange({
        beforeSnapshot,
        changedKeys: ["data.sounds", "data.activeSoundId"],
        reason: "audio-sfx-json-imported"
      });
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

    try {
      await this.writeClipboardText(exportResult.json);
      this.statusLog.write(`Copied JSON for ${activeSoundFromToolState(exportResult.toolState)?.name || "audio-sfx"}.`);
    } catch (error) {
      this.statusLog.error(`Copy JSON failed: ${error.message}`);
    }
  }

  async writeClipboardText(text) {
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      throw new Error("Clipboard API is unavailable. Use Export JSON instead.");
    }

    try {
      await this.window.navigator.clipboard.writeText(text);
    } catch (error) {
      throw new Error(`Clipboard API copy was blocked. Allow clipboard access or use Export JSON instead. ${error.message}`);
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
