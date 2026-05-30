import { readFileText } from "../../../src/engine/persistence/FilePersistenceService.js";
import { deepClone } from "../../../src/shared/json/clone.js";
import { notifyWorkspaceToolDirty } from "../../../src/tools/common/WorkspaceDirtyNotifier.js";

const TOOL_ID = "midi-studio-v2";
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function camelCaseSongId(value) {
  const parts = String(value || "")
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.toLowerCase());
  if (!parts.length) {
    return "untitledSong";
  }
  return parts
    .map((part, index) => (index === 0 ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`))
    .join("");
}

function classificationIdSuffix(value) {
  const classification = String(value || "").trim().replace(/\s+/g, " ");
  return classification ? `-${classification}` : "";
}

export class MidiStudioV2App {
  constructor({
    accordions,
    actionNav,
    audioDiagnostics,
    details,
    directorPanel,
    exportPanel,
    instrumentGrid,
    instrumentGridParser,
    manifestLoader,
    midiSourceDetails,
    midiSourceInspection,
    playback,
    playbackControl,
    previewSynth,
    renderedExportActions,
    serializer,
    shell,
    songList,
    songSetup,
    songSheet,
    songSheetParser,
    statusLog,
    studioTabs,
    windowRef = window
  }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.audioDiagnostics = audioDiagnostics;
    this.details = details;
    this.directorPanel = directorPanel;
    this.exportPanel = exportPanel;
    this.instrumentGrid = instrumentGrid;
    this.instrumentGridParser = instrumentGridParser;
    this.instrumentGridResults = new WeakMap();
    this.importedSongBaselines = new Map();
    this.isDirty = false;
    this.lastSavedToolState = null;
    this.manifestLoader = manifestLoader;
    this.midiSourceDetails = midiSourceDetails;
    this.midiSourceInspection = midiSourceInspection;
    this.missingSectionWarnings = new Set();
    this.missingSectionWarningKey = "";
    this.lastSongSheetGenerationSummary = null;
    this.lastRegenerationProtectionSummary = null;
    this.pendingRegenerationSignature = "";
    this.payload = null;
    this.playbackCompletionTimer = null;
    this.playback = playback;
    this.playbackControl = playbackControl;
    this.previewSynth = previewSynth;
    this.renderedExportActions = renderedExportActions;
    this.serializer = serializer;
    this.shell = shell;
    this.songLibraryAssets = [];
    this.songList = songList;
    this.songSetup = songSetup;
    this.songSheet = songSheet;
    this.songSheetParser = songSheetParser;
    this.statusLog = statusLog;
    this.studioTabs = studioTabs;
    this.window = windowRef;
  }

  async start() {
    this.shell.mount({ onExpandedChange: (isExpanded) => this.handleExpandedModeChange(isExpanded) });
    this.studioTabs?.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.statusLog.mount();
    this.songList.mount({
      onDuplicateSong: () => this.duplicateSelectedSong(),
      onLoadSong: (assetId) => this.loadSongAsset(assetId),
      onSaveSong: () => this.saveSelectedSongAsset(),
      onSelect: (songId) => this.selectSong(songId)
    });
    this.songSetup.mount({ onAddSong: () => this.addSong() });
    this.details.mount({ onChange: (field, value) => this.handleSongDetailsChange(field, value) });
    this.exportPanel.mount({ onTargetChange: (format, value) => this.handleRenderedTargetChange(format, value) });
    this.songSheet.mount({
      onFieldChange: (field, value) => this.handleSongSheetFieldChange(field, value),
      onMetadataChange: (field, value) => this.handleSongDetailsChange(field, value),
      onParse: (sourceText) => this.parseSongSheet(sourceText),
      onRegenerate: (sourceText) => this.regenerateSongSheetArrangement(sourceText),
      onSectionLibraryAction: (result) => this.handleSongSheetSectionLibraryAction(result),
      onSequenceSelect: (detail) => this.handleSongSheetSequenceSelection(detail),
      onTemplateApply: (detail) => this.handleSectionTemplateApplied(detail)
    });
    this.instrumentGrid.mount({
      onGenerate: (lane, input) => this.generateInstrumentLane(lane, input),
      onLaneSettingChange: (kind, detail) => this.handlePreviewLaneSettingChange(kind, detail),
      onNormalize: (input) => this.normalizeInstrumentGrid(input),
      onNoteEdit: (input, detail) => this.syncEditedInstrumentGrid(input, detail),
      onTransport: (action, detail) => this.handleInstrumentGridTransport(action, detail)
    });
    this.midiSourceDetails.mount({
      onImport: (file) => this.importMidiSourceFile(file),
      onInspect: () => this.inspectSelectedSource()
    });
    this.playbackControl.mount({
      onPlay: () => this.playSelectedSong(),
      onStop: () => this.stopPlayback()
    });
    this.renderedExportActions.mount({ onExport: (format) => this.exportRenderedTarget(format) });
    this.actionNav.mount({
      onStopAllAudio: () => this.stopAllAudio(),
      onToolCopyJson: () => this.copyJson(),
      onToolExportToolState: () => this.exportToolState(),
      onToolImportManifest: (file) => this.importManifestFile(file),
      onResetSongEdits: () => this.resetSelectedSongEdits(),
      onSaveProject: () => this.saveProject(),
      onWorkspaceCopyManifest: () => this.statusLog.info("Workspace copy is owned by Workspace Manager V2."),
      onWorkspaceExportManifest: () => this.statusLog.info("Workspace export is owned by Workspace Manager V2."),
      onWorkspaceImportManifest: () => this.statusLog.info("Workspace import is owned by Workspace Manager V2.")
    });
    this.mountKeyboardShortcuts();
    this.renderEmpty();
    const loadResult = await this.manifestLoader.loadInitialManifest();
    if (loadResult.ok) {
      this.applyPayload(loadResult.manifest, loadResult.sourceLabel || "initial manifest");
    } else if (loadResult.skipped) {
      this.statusLog.info("No manifest or workspace toolState payload loaded. Import a manifest or launch from Workspace Manager V2.");
      this.statusLog.info("First-run guide: choose Import JSON Manifest, select a song, then press Play.");
    } else {
      this.statusLog.fail(loadResult.message);
    }
  }

  mountKeyboardShortcuts() {
    this.window.document.addEventListener("keydown", (event) => this.handleKeyboardShortcut(event));
  }

  handleKeyboardShortcut(event) {
    if (event.defaultPrevented) {
      return;
    }
    if (this.isEditableKeyboardTarget(event.target)) {
      return;
    }
    if (event.key === " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      if (this.playbackControl.isPlaying()) {
        this.stopPlayback();
        return;
      }
      void this.playSelectedSong();
      return;
    }
    if ((event.key === "Delete" || event.key === "Backspace") && this.instrumentGrid.deleteSelectedNotes()) {
      event.preventDefault();
      return;
    }
    if (event.key.startsWith("Arrow") && this.instrumentGrid.moveSelectionByKey(event.key)) {
      event.preventDefault();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "d" && this.instrumentGrid.duplicateSelectedNotes()) {
      event.preventDefault();
    }
  }

  isEditableKeyboardTarget(target) {
    return Boolean(target?.closest?.("input, textarea, select, option, button, [contenteditable='true']"));
  }

  renderEmpty() {
    this.payload = null;
    this.importedSongBaselines = new Map();
    this.lastSavedToolState = null;
    this.setDirtyState(false);
    this.songList.render([], "", this.songLibraryAssets);
    this.details.render(null, null);
    this.exportPanel.render(null, { payload: this.payload, playable: { count: 0 } });
    this.directorPanel.render(null, {});
    this.midiSourceDetails.render(null);
    this.midiSourceDetails.setEnabled(false);
    this.songSheet.render(null);
    this.instrumentGrid.render(null);
    this.instrumentGridResults = new WeakMap();
    this.playbackControl.setSelected(null);
    this.actionNav.setNowPlaying(null);
    this.actionNav.setToolActionsEnabled(false);
    this.updateAudioDiagnostics();
  }

  handleExpandedModeChange(isExpanded) {
    if (isExpanded) {
      this.statusLog.info("Entered MIDI Studio fullscreen view. Tool transport, Stop All Audio, recovery controls, and timeline instrument rows remain visible.");
      return;
    }
    this.statusLog.info("Exited MIDI Studio fullscreen view. Header, setup, and diagnostics layout restored.");
  }

  applyPayload(rawValue, sourceLabel) {
    const normalized = this.serializer.normalize(rawValue);
    if (!normalized.ok) {
      this.renderEmpty();
      this.statusLog.fail(`MIDI Studio V2 payload rejected before render from ${sourceLabel}: ${normalized.message}`);
      return false;
    }
    this.payload = normalized.payload;
    this.importedSongBaselines = new Map(this.payload.songs.map((song) => [song.id, deepClone(song)]));
    this.lastSavedToolState = null;
    this.setDirtyState(false);
    this.render();
    this.applySelectedSongArrangement("active manifest song");
    this.statusLog.ok(`Loaded ${this.payload.songs.length} MIDI song${this.payload.songs.length === 1 ? "" : "s"} from ${sourceLabel} via ${normalized.sourceKind}.`);
    this.statusLog.pass(`Import JSON PASS: canonical payload loaded with ${this.payload.songs.length} song${this.payload.songs.length === 1 ? "" : "s"}; selected song ${this.selectedSong()?.name || this.selectedSongId || "none"}.`);
    this.statusLog.info("Next: select a MIDI Studio song, review the Octave Timeline tab, then press Play to audition the imported arrangement.");
    return true;
  }

  render() {
    const song = this.selectedSong();
    this.songList.render(this.payload?.songs || [], this.selectedSongId, this.songLibraryAssets);
    this.details.render(song, this.payload);
    this.applyClassificationWorkflow(song, { log: false });
    this.exportPanel.render(song, { payload: this.payload, playable: this.playableEventSummary() });
    this.directorPanel.render(song, this.payload?.directorMode || {});
    this.midiSourceDetails.render(null);
    this.midiSourceDetails.setEnabled(Boolean(song));
    this.playbackControl.setSelected(song, this.playbackControlStatus(song));
    this.actionNav.setNowPlaying(song);
    this.actionNav.setToolActionsEnabled(Boolean(this.payload));
    this.updateAudioDiagnostics();
  }

  handleSongDetailsChange(field, value) {
    const song = this.selectedSong();
    if (!song) {
      return;
    }
    const arrangement = song.studioArrangement || null;
    if (field === "name") {
      song.name = String(value || "").trim() || song.id;
      const derivedId = this.uniqueDerivedSongId(song.name, song);
      this.updateSelectedSongId(derivedId);
      this.details.updateFieldValue("id", song.id);
      this.details.updateGeneratedIdPreview(song);
      this.details.renderClassificationLibrarySummary(song.classification);
      this.songList.render(this.payload?.songs || [], this.selectedSongId, this.songLibraryAssets);
      this.playbackControl.setSelected(song, this.playbackControlStatus(song));
      this.actionNav.setNowPlaying(song);
    } else if (field === "id") {
      this.details.updateFieldValue("id", song.id);
      this.details.updateGeneratedIdPreview(song);
      this.statusLog.info("Song id is derived from Name and Classification and is read-only by default.");
      return;
    } else if (field === "classification") {
      song.classification = String(value || "").trim();
      const derivedId = this.uniqueDerivedSongId(song.name, song);
      this.updateSelectedSongId(derivedId);
      this.details.updateFieldValue("id", song.id);
      this.details.updateGeneratedIdPreview(song);
      this.details.renderClassificationLibrarySummary(song.classification);
      this.songList.render(this.payload?.songs || [], this.selectedSongId, this.songLibraryAssets);
      this.playbackControl.setSelected(song, this.playbackControlStatus(song));
      this.actionNav.setNowPlaying(song);
      this.applyClassificationWorkflow(song);
    } else if (field === "tempo" && arrangement) {
      arrangement.tempo = String(value || "").trim();
      this.syncSongSheetFields(arrangement);
      this.parseSongSheet(this.songSheet.composeGuidedSheet(), { updateGrid: false });
    } else if (field === "key" && arrangement) {
      arrangement.key = String(value || "").trim();
      this.syncSongSheetFields(arrangement);
    } else if (field === "style" && arrangement) {
      arrangement.style = String(value || "").trim();
      this.syncSongSheetFields(arrangement);
    } else if (field === "loopEnabled") {
      song.loop.enabled = value === true;
    } else if (field === "loopStartSeconds") {
      song.loop.startSeconds = Number.isFinite(Number(value)) ? Number(value) : "";
    } else if (field === "loopEndSeconds") {
      song.loop.endSeconds = Number.isFinite(Number(value)) ? Number(value) : "";
    } else if (field === "defaultRuntimeFormat") {
      song.defaultRuntimeFormat = String(value || "").trim();
    } else if (field === "sourceMidi") {
      song.sourceMidi = String(value || "").trim();
      this.details.syncSourceFields(song);
    } else if (field === "instrumentSet") {
      song.instrumentSet = String(value || "").trim();
      this.details.syncSourceFields(song);
    } else if (field === "tags") {
      song.tags = String(value || "").split(",").map((tag) => tag.trim()).filter(Boolean);
    } else if (field === "usage") {
      song.director.usage = Array.isArray(value)
        ? value.map((entry) => String(entry || "").trim()).filter(Boolean)
        : String(value || "").split(",").map((entry) => entry.trim()).filter(Boolean);
      this.directorPanel.render(song, this.payload?.directorMode || {});
    } else if (field === "notes") {
      song.director.notes = String(value || "").trim();
    } else if (field === "sections" && arrangement) {
      arrangement.sections = String(value || "").trim();
    }
    this.details.showJson(song);
    this.exportPanel.render(this.selectedSong(), { payload: this.payload, playable: this.playableEventSummary() });
    this.markDirty({ changedKeys: ["data.songs"], reason: "midi-studio-song-details-edited" });
    this.statusLog.info(`Edited selected song detail: ${field}.`);
    this.updateAudioDiagnostics();
  }

  uniqueDerivedSongId(name, targetSong) {
    const baseId = `${camelCaseSongId(name)}${classificationIdSuffix(targetSong?.classification)}`;
    const existingIds = new Set((this.payload?.songs || [])
      .filter((song) => song !== targetSong)
      .map((song) => song.id));
    if (!existingIds.has(baseId)) {
      return baseId;
    }
    let index = 2;
    let candidate = `${baseId}${index}`;
    while (existingIds.has(candidate)) {
      index += 1;
      candidate = `${baseId}${index}`;
    }
    return candidate;
  }

  handleRenderedTargetChange(format, value) {
    const song = this.selectedSong();
    if (!song) {
      return;
    }
    const normalizedFormat = String(format || "").trim().toLowerCase();
    if (!["wav", "mp3", "ogg"].includes(normalizedFormat)) {
      return;
    }
    song.rendered = {
      ...(song.rendered || {}),
      [normalizedFormat]: String(value || "").trim()
    };
    this.details.showJson(song);
    const playable = this.playableEventSummary();
    this.exportPanel.renderSource(song, playable);
    this.exportPanel.renderManifestReadiness(this.payload, song, playable);
    this.exportPanel.renderDiagnostics(song, playable, this.payload);
    this.exportPanel.setStatus(this.exportPanel.exportReadiness(song, { payload: this.payload, playable }));
    this.markDirty({ changedKeys: ["data.songs.rendered"], reason: "midi-studio-rendered-target-edited" });
    this.statusLog.info(`Edited rendered ${normalizedFormat.toUpperCase()} target for ${song.name}.`);
  }

  handleSectionTemplateApplied({ label, chords } = {}) {
    const song = this.selectedSong();
    this.statusLog.info(`Applied ${label || "section"} template as editable starting chords${song ? ` for ${song.name}` : ""}: ${chords || "not declared"}.`);
  }

  handleSongSheetSectionLibraryAction(result = {}) {
    const message = result.message || "Section Library action completed.";
    if (result.ok) {
      this.statusLog.ok(message);
      return;
    }
    this.statusLog.warn(message);
  }

  applyClassificationWorkflow(song, { log = true } = {}) {
    const workflow = this.songSheet.applyClassificationWorkflow(song?.classification || "");
    if (log && song) {
      this.statusLog.info(`Classification ${workflow.classification} loaded ${workflow.summary.toLowerCase()}, instrument suggestions, and generation hints.`);
    }
    return workflow;
  }

  handleSongSheetSequenceSelection({ index = -1, label = "" } = {}) {
    if (!label) {
      return;
    }
    const selected = this.instrumentGrid.selectSequenceSection(label, index);
    if (selected) {
      this.statusLog.info(`Song Sequence selected ${label}; Octave Timeline section highlight synchronized.`);
    }
  }

  updateSelectedSongId(value) {
    const song = this.selectedSong();
    const nextId = String(value || "").trim();
    if (!song || !nextId) {
      this.statusLog.warn("Song Id was not updated because the value is empty.");
      return false;
    }
    if ((this.payload?.songs || []).some((candidate) => candidate !== song && candidate.id === nextId)) {
      this.statusLog.warn(`Song Id was not updated because ${nextId} already exists.`);
      return false;
    }
    const previousId = song.id;
    song.id = nextId;
    this.payload.activeSongId = nextId;
    if (this.importedSongBaselines.has(previousId)) {
      const baseline = this.importedSongBaselines.get(previousId);
      this.importedSongBaselines.delete(previousId);
      this.importedSongBaselines.set(nextId, { ...baseline, id: nextId });
    }
    this.songList.render(this.payload?.songs || [], this.selectedSongId, this.songLibraryAssets);
    return true;
  }

  songSheetStructureFromArrangement(arrangement) {
    const songSheet = arrangement?.songSheet || {};
    if (songSheet.sections) {
      return String(songSheet.sections || "");
    }
    const rows = [];
    if (songSheet.intro) {
      rows.push(`intro: ${String(songSheet.intro).trim()}`);
    }
    if (songSheet.loop) {
      rows.push(`loop: ${String(songSheet.loop).trim()}`);
    }
    return rows.join("\n");
  }

  songSheetSequenceFromArrangement(arrangement) {
    const songSheet = arrangement?.songSheet || {};
    if (songSheet.sequence) {
      return String(songSheet.sequence || "");
    }
    return this.songSheetStructureFromArrangement(arrangement)
      .split(/[\n;]+/)
      .map((entry) => {
        const bracketMatch = entry.trim().match(/^\[([^\]]+)\]/);
        if (bracketMatch) {
          return bracketMatch[1].trim();
        }
        const separatorIndex = entry.indexOf(":");
        return separatorIndex >= 0 ? entry.slice(0, separatorIndex).trim() : "";
      })
      .filter(Boolean)
      .join(", ");
  }

  songSheetApplyTargetsFromArrangement(arrangement) {
    const targets = arrangement?.songSheet?.applyTargets || {};
    return {
      bass: targets.bass !== false,
      chordsPad: targets.chordsPad !== false,
      drums: targets.drums === undefined ? this.hasDrumsInstrument(arrangement) : targets.drums === true,
      lead: targets.lead === true
    };
  }

  hasDrumsInstrument(arrangement) {
    return Object.keys(arrangement?.lanes || {}).some((lane) => lane === "drums" || lane.toLowerCase().includes("drum"));
  }

  handleSongSheetFieldChange(field, value) {
    if (field !== "sections" && field !== "sequence" && field !== "applyTargets") {
      return;
    }
    this.pendingRegenerationSignature = "";
    this.lastRegenerationProtectionSummary = null;
    this.songSheet.setRegenerationPending(false);
    const song = this.selectedSong();
    const arrangement = song?.studioArrangement || null;
    if (!arrangement) {
      this.statusLog.warn(`Song Sheet ${field} was not applied because no editable arrangement is selected.`);
      return;
    }
    arrangement.songSheet = {
      ...(arrangement.songSheet || {}),
      [field]: field === "applyTargets" ? { ...(value || {}) } : String(value || "").trim()
    };
    this.details.showJson(song);
    this.parseSongSheet(this.songSheet.composeGuidedSheet());
    this.markDirty({ changedKeys: ["data.songs.studioArrangement.songSheet"], reason: "midi-studio-song-sheet-structure-edited" });
    this.statusLog.info(`Updated Song Sheet ${field} for ${song.name}.`);
    this.updateAudioDiagnostics();
  }

  syncSongSheetFields(arrangement) {
    this.applyClassificationWorkflow(this.selectedSong(), { log: false });
    this.songSheet.applyGuidedDefaults({
      applyTargets: this.songSheetApplyTargetsFromArrangement(arrangement),
      sections: this.songSheetStructureFromArrangement(arrangement),
      key: arrangement.key,
      hasDrums: this.hasDrumsInstrument(arrangement),
      sequence: this.songSheetSequenceFromArrangement(arrangement),
      style: arrangement.style,
      tempo: arrangement.tempo
    });
  }

  selectedSong() {
    return (this.payload?.songs || []).find((song) => song.id === this.selectedSongId) || null;
  }

  playbackControlStatus(song) {
    if (!song || song.studioArrangement || this.playback.renderedPreviewSource(song)) {
      return { unwired: false };
    }
    return {
      detail: `Live MIDI playback is not implemented and ${song.name || song.id} has no rendered OGG/MP3/WAV target.`,
      status: "Incomplete",
      unwired: true
    };
  }

  selectedSongState() {
    const song = this.selectedSong();
    return {
      arrangement: song?.studioArrangement || null,
      gridResult: this.currentInstrumentGridResult(),
      payload: this.payload,
      song,
      songId: this.selectedSongId
    };
  }

  setDirtyState(isDirty) {
    this.isDirty = isDirty === true;
    this.actionNav.setDirtyState(this.isDirty);
    this.window.document.body.dataset.midiStudioDirty = this.isDirty ? "true" : "false";
  }

  markDirty({ changedKeys = ["data.songs"], reason = "midi-studio-song-updated" } = {}) {
    this.setDirtyState(true);
    const result = notifyWorkspaceToolDirty({
      changedKeys,
      payload: this.payload,
      reason,
      toolId: TOOL_ID,
      windowRef: this.window
    });
    if (!result.ok) {
      this.statusLog.warn(`Workspace dirty state not updated: ${result.message}`);
    }
    return result;
  }

  get selectedSongId() {
    return this.payload?.activeSongId || "";
  }

  set selectedSongId(songId) {
    if (this.payload) {
      this.payload.activeSongId = String(songId || "");
    }
  }

  currentInstrumentGridResult() {
    const song = this.selectedSong();
    return song ? this.instrumentGridResults.get(song) || null : null;
  }

  get lastInstrumentGridResult() {
    return this.currentInstrumentGridResult();
  }

  setCurrentInstrumentGridResult(result) {
    const song = this.selectedSong();
    if (!song) {
      return;
    }
    this.resetMissingSectionWarnings(result);
    if (result?.ok) {
      this.instrumentGridResults.set(song, result);
      return;
    }
    this.instrumentGridResults.delete(song);
  }

  clearCurrentInstrumentGridResult() {
    const song = this.selectedSong();
    if (song) {
      this.instrumentGridResults.delete(song);
    }
    this.resetMissingSectionWarnings(null);
  }

  resetMissingSectionWarnings(result) {
    const labels = result?.ok ? result.sections.map((section) => section.label).join("|") : "";
    const key = `${this.selectedSongId}:${labels}`;
    if (key !== this.missingSectionWarningKey) {
      this.missingSectionWarnings.clear();
      this.missingSectionWarningKey = key;
    }
  }

  selectSong(songId) {
    if (!this.payload?.songs.some((song) => song.id === songId)) {
      this.statusLog.fail(`Song selection failed: ${songId || "(missing song id)"} is not in the active MIDI payload.`);
      return;
    }
    this.stopPlayback({ log: false });
    this.payload.activeSongId = songId;
    this.render();
    this.applySelectedSongArrangement("selected song");
    this.statusLog.ok(`Selected MIDI song: ${this.selectedSong()?.name || songId}.`);
    this.updateAudioDiagnostics();
  }

  addSong() {
    this.stopPlayback({ log: false });
    if (!this.payload) {
      this.payload = {
        activeSongId: "",
        directorMode: { enabled: false },
        runtimePreference: "live-midi",
        songs: [],
        version: 1
      };
    }
    const song = this.createAddedSong();
    this.payload.songs.push(song);
    this.payload.activeSongId = song.id;
    this.importedSongBaselines.set(song.id, deepClone(song));
    this.render();
    this.applySelectedSongArrangement("Add Song");
    this.markDirty({ changedKeys: ["data.songs"], reason: "midi-studio-song-added" });
    this.statusLog.ok(`Added MIDI song: ${song.name}. Canonical model now has ${this.payload.songs.length} song${this.payload.songs.length === 1 ? "" : "s"}.`);
    this.updateAudioDiagnostics();
  }

  saveSelectedSongAsset() {
    const song = this.selectedSong();
    if (!song) {
      this.statusLog.fail("Save Song failed: no MIDI song is selected.");
      this.songList.setLibrarySummary("Save Song failed: no MIDI song is selected.", this.songLibraryAssets);
      return;
    }
    const asset = {
      classification: song.classification || "",
      generatedId: song.id,
      id: this.nextSongAssetId(),
      label: song.name || song.id,
      song: deepClone(song)
    };
    const existingAsset = this.songLibraryAssets.find((candidate) => candidate.generatedId === asset.generatedId);
    if (existingAsset) {
      existingAsset.classification = asset.classification;
      existingAsset.label = asset.label;
      existingAsset.song = asset.song;
      this.songList.render(this.payload?.songs || [], this.selectedSongId, this.songLibraryAssets);
      this.songList.selectSongLibraryAsset(existingAsset.id);
      this.songList.setLibrarySummary(`Updated song asset: ${existingAsset.label} (${existingAsset.generatedId}); duplicate generated IDs are prevented.`, this.songLibraryAssets);
      this.statusLog.ok(`Updated Song Library asset for generated ID ${existingAsset.generatedId}; duplicate generated IDs are prevented.`);
      return;
    }
    this.songLibraryAssets.push(asset);
    this.songList.render(this.payload?.songs || [], this.selectedSongId, this.songLibraryAssets);
    this.songList.selectSongLibraryAsset(asset.id);
    this.songList.setLibrarySummary(`Saved song asset: ${asset.label} (${asset.generatedId}).`, this.songLibraryAssets);
    this.statusLog.ok(`Saved Song Library asset: ${asset.label} (${asset.generatedId}).`);
  }

  loadSongAsset(assetId) {
    const asset = this.songLibraryAssets.find((candidate) => candidate.id === assetId);
    if (!asset) {
      this.statusLog.fail("Load Song failed: choose a saved Song Library asset first.");
      this.songList.setLibrarySummary("Load Song failed: choose a saved song asset first.", this.songLibraryAssets);
      return;
    }
    const song = this.insertSongClone(asset.song, { reason: "song-library-load", sourceLabel: asset.label });
    this.songList.selectSongLibraryAsset(asset.id);
    this.songList.setLibrarySummary(`Loaded song asset into canonical songs: ${song?.name || asset.label} (${song?.id || "id unavailable"}).`, this.songLibraryAssets);
    this.statusLog.ok(`Loaded Song Library asset into canonical song model: ${asset.label} as ${song?.id || "a unique generated ID"}.`);
  }

  duplicateSelectedSong() {
    const song = this.selectedSong();
    if (!song) {
      this.statusLog.fail("Duplicate Song failed: no MIDI song is selected.");
      this.songList.setLibrarySummary("Duplicate Song failed: no MIDI song is selected.", this.songLibraryAssets);
      return;
    }
    const copy = this.insertSongClone(song, { reason: "song-library-duplicate", sourceLabel: song.name || song.id });
    this.songList.setLibrarySummary(`Duplicated song into canonical songs: ${copy?.name || "copy"} (${copy?.id || "id unavailable"}).`, this.songLibraryAssets);
    this.statusLog.ok(`Duplicated MIDI song: ${song.name || song.id} as ${copy?.id || "a unique generated ID"}.`);
  }

  insertSongClone(sourceSong, { reason, sourceLabel }) {
    this.stopPlayback({ log: false });
    if (!this.payload) {
      this.payload = {
        activeSongId: "",
        directorMode: { enabled: false },
        runtimePreference: "live-midi",
        songs: [],
        version: 1
      };
    }
    const song = deepClone(sourceSong);
    song.name = this.nextSongCopyName(sourceSong.name || sourceSong.id || "Song");
    song.id = this.uniqueDerivedSongId(song.name, song);
    this.payload.songs.push(song);
    this.payload.activeSongId = song.id;
    this.importedSongBaselines.set(song.id, deepClone(song));
    this.render();
    this.applySelectedSongArrangement(sourceLabel || reason || "Song Library");
    this.markDirty({ changedKeys: ["data.songs"], reason });
    this.updateAudioDiagnostics();
    return song;
  }

  nextSongAssetId() {
    let index = this.songLibraryAssets.length + 1;
    const existingIds = new Set(this.songLibraryAssets.map((asset) => asset.id));
    while (existingIds.has(`song-asset-${index}`)) {
      index += 1;
    }
    return `song-asset-${index}`;
  }

  nextSongCopyName(sourceName) {
    const baseName = String(sourceName || "Song").trim() || "Song";
    const existingNames = new Set((this.payload?.songs || []).map((song) => String(song.name || "").toLowerCase()));
    let index = 1;
    let candidate = `${baseName} Copy ${index}`;
    while (existingNames.has(candidate.toLowerCase())) {
      index += 1;
      candidate = `${baseName} Copy ${index}`;
    }
    return candidate;
  }

  createAddedSong() {
    const source = this.selectedSong();
    const draftNumber = this.nextSongDraftNumber();
    const name = `New Song ${draftNumber}`;
    return {
      defaultRuntimeFormat: source?.defaultRuntimeFormat || "ogg",
      director: {
        mood: "draft",
        intensity: "medium",
        usage: ["song-setup"],
        notes: "Created in MIDI Studio V2 Song Setup."
      },
      classification: "",
      id: this.uniqueDerivedSongId(name, { classification: "" }),
      instrumentSet: source?.instrumentSet || "General MIDI",
      loop: source?.loop ? deepClone(source.loop) : { enabled: false, endSeconds: "", startSeconds: "" },
      name,
      rendered: { mp3: "", ogg: "", wav: "" },
      sourceMidi: "",
      studioArrangement: source?.studioArrangement ? deepClone(source.studioArrangement) : this.defaultAddedSongArrangement(),
      tags: ["draft"]
    };
  }

  nextSongDraftNumber() {
    const existingIds = new Set((this.payload?.songs || []).map((song) => song.id));
    let draftNumber = (this.payload?.songs?.length || 0) + 1;
    while (existingIds.has(camelCaseSongId(`New Song ${draftNumber}`))) {
      draftNumber += 1;
    }
    return draftNumber;
  }

  defaultAddedSongArrangement() {
    return {
      beatsPerBar: "4",
      key: "C major",
      lanes: {
        bass: "C2 - G2 - | C2 - G2 -",
        chords: "C - G - | C - G -",
        drums: "kick hat snare hat | kick hat snare hat",
        lead: "E4 - G4 - | E4 - G4 -",
        pad: "C - G - | C - G -"
      },
      previewInstruments: {
        bass: "synth-bass",
        chords: "warm-pad",
        drums: "basic-drums",
        lead: "retro-pulse-lead",
        pad: "ambient-pad"
      },
      previewLaneSettings: {
        instruments: {
          bass: "synth-bass",
          chords: "warm-pad",
          drums: "basic-drums",
          lead: "retro-pulse-lead",
          pad: "ambient-pad"
        }
      },
      sections: "draft:2",
      songSheet: {
        applyTargets: {
          bass: true,
          chordsPad: true,
          drums: true,
          lead: false
        },
        sequence: "draft",
        sections: "draft: C G"
      },
      style: "retro-arcade",
      subdivision: "1",
      tempo: "120"
    };
  }

  async playSelectedSong() {
    const song = this.selectedSong();
    this.clearPlaybackCompletionTimer();
    if (song?.studioArrangement) {
      return this.playSelectedArrangement(song);
    }
    const result = await this.playback.playRenderedPreview(song, { loop: this.playbackControl.loopEnabled() });
    if (!result.ok) {
      this.playbackControl.setStopped(song, this.playbackControlStatus(song));
      if (result.liveMidiNotImplemented) {
        this.statusLog.warn("Live MIDI synthesis not implemented.");
      }
      this.statusLog.fail(result.message);
      this.updateAudioDiagnostics();
      return;
    }
    this.playbackControl.setPlaying(song, { loop: this.playbackControl.loopEnabled() });
    this.actionNav.setNowPlaying(song, { playing: true });
    this.statusLog.ok(`Rendered preview started for ${song.name}: ${result.path}.`);
    this.updateAudioDiagnostics();
  }

  async playSelectedArrangement(song) {
    this.playback.stop();
    this.clearPlaybackCompletionTimer();
    if (!this.currentInstrumentGridResult()?.ok) {
      const arranged = this.applySelectedSongArrangement("play request");
      if (!arranged) {
        this.playbackControl.setStopped(song, this.playbackControlStatus(song));
        this.updateAudioDiagnostics();
        return;
      }
    }
    const gridResult = this.currentInstrumentGridResult();
    const section = this.instrumentGrid.selectedSection() || gridResult?.sections?.[0] || null;
    if (!section) {
      this.playbackControl.setStopped(song, this.playbackControlStatus(song));
      this.statusLog.fail(`Playable arrangement section not found for ${song.name}.`);
      this.updateAudioDiagnostics();
      return;
    }
    const started = await this.startPreviewSynth({
      endStep: section.endStep,
      label: section.label,
      loop: this.playbackControl.loopEnabled(),
      mode: "section",
      startStep: section.startStep
    });
    if (!started) {
      this.playbackControl.setStopped(song, this.playbackControlStatus(song));
      this.actionNav.setNowPlaying(song);
      return;
    }
    this.instrumentGrid.startTimingPreview({
      endStep: section.endStep,
      label: section.label,
      mode: this.playbackControl.loopEnabled() ? "loop" : "section",
      onComplete: () => this.handlePreviewPlaybackComplete({ label: section.label, mode: "section" }),
      startStep: section.startStep
    });
    this.playbackControl.setPlaying(song, { loop: this.playbackControl.loopEnabled() });
    this.actionNav.setNowPlaying(song, { playing: true });
    this.statusLog.ok(`Audible preview playback started for ${song.name}.`);
    this.updateAudioDiagnostics();
  }

  async inspectSelectedSource() {
    const song = this.selectedSong();
    this.midiSourceDetails.render(null);
    const result = await this.midiSourceInspection.inspect(song);
    if (!result.ok) {
      this.midiSourceDetails.render(result);
      this.statusLog.fail(result.message);
      return;
    }
    this.midiSourceDetails.render(result);
    this.statusLog.ok(`MIDI source inspected for ${song.name}: format ${result.format}, ${result.trackCount} track${result.trackCount === 1 ? "" : "s"}, ${result.ticksPerQuarterNote} TPQN.`);
  }

  async importMidiSourceFile(file) {
    if (!file) {
      return;
    }
    const result = await this.midiSourceInspection.inspectFile(file);
    this.midiSourceDetails.render(result);
    if (!result.ok) {
      this.statusLog.fail(result.message);
      return;
    }
    const song = this.createImportedMidiSong(file, result);
    if (!this.payload) {
      this.payload = {
        activeSongId: song.id,
        directorMode: { enabled: false },
        runtimePreference: "live-midi",
        songs: [song],
        version: 1
      };
    } else {
      this.payload.songs.push(song);
      this.payload.activeSongId = song.id;
    }
    this.importedSongBaselines.set(song.id, deepClone(song));
    this.render();
    this.midiSourceDetails.render(result);
    this.applySelectedSongArrangement("local MIDI import");
    this.statusLog.ok(`Imported MIDI source ${result.fileName}: format ${result.format}, ${result.trackCount} track${result.trackCount === 1 ? "" : "s"}.`);
    this.statusLog.ok(`Normalized ${song.studioArrangement.importedNoteCount} MIDI note${song.studioArrangement.importedNoteCount === 1 ? "" : "s"} into editable octave timeline data.`);
    this.updateAudioDiagnostics();
  }

  createImportedMidiSong(file, result) {
    const baseName = String(file.name || "imported-midi").replace(/\.[^.]+$/, "") || "imported-midi";
    const baseId = baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "imported-midi";
    const existingIds = new Set(this.payload?.songs?.map((song) => song.id) || []);
    let id = baseId;
    let index = 2;
    while (existingIds.has(id)) {
      id = `${baseId}-${index}`;
      index += 1;
    }
    return {
      defaultRuntimeFormat: "ogg",
      director: {
        mood: "imported",
        intensity: "medium",
        usage: ["midi-import"],
        notes: `Imported from local MIDI file ${result.fileName}.`
      },
      classification: "",
      id,
      instrumentSet: "Imported MIDI source",
      loop: { enabled: false },
      name: baseName.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      rendered: {},
      sourceMidi: result.fileName,
      studioArrangement: this.arrangementFromMidiInspection(result),
      tags: ["midi-import"]
    };
  }

  arrangementFromMidiInspection(result) {
    const ticksPerQuarterNote = Number(result.ticksPerQuarterNote || 480);
    const timeSignature = result.timeSignatureEvents?.[0] || { denominator: 4, numerator: 4 };
    const beatsPerBar = String(timeSignature.denominator === 4 ? timeSignature.numerator || 4 : 4);
    const safeBeatsPerBar = Number(beatsPerBar) || 4;
    const maxTick = Math.max(
      ticksPerQuarterNote,
      ...((result.normalizedNotes || []).map((note) => Number(note.endTick || note.startTick || 0)))
    );
    const barCount = Math.max(1, Math.ceil(maxTick / (ticksPerQuarterNote * safeBeatsPerBar)));
    const lanes = {};
    const previewInstruments = {};
    (result.normalizedNotes || []).forEach((note) => {
      const lane = this.importedLaneName(note);
      lanes[lane] = lanes[lane] || Array.from({ length: barCount }, () => Array.from({ length: safeBeatsPerBar }, () => "-"));
      previewInstruments[lane] = note.channel === 10 ? "basic-drums" : this.previewInstrumentForImportedProgram(result, note.channel);
      const stepIndex = Math.max(0, Math.min(barCount * safeBeatsPerBar - 1, Math.round(Number(note.startTick || 0) / ticksPerQuarterNote)));
      const barIndex = Math.floor(stepIndex / safeBeatsPerBar);
      const stepInBar = stepIndex % safeBeatsPerBar;
      lanes[lane][barIndex][stepInBar] = note.channel === 10 ? "kick" : this.noteNameFromMidiNumber(note.noteNumber);
    });
    if (!Object.keys(lanes).length) {
      lanes["imported-1"] = Array.from({ length: barCount }, () => Array.from({ length: safeBeatsPerBar }, () => "-"));
      previewInstruments["imported-1"] = "preview-acoustic-grand-piano";
    }
    return {
      beatsPerBar,
      importedNoteCount: result.normalizedNoteCount || 0,
      key: "C major",
      lanes: Object.fromEntries(Object.entries(lanes).map(([lane, bars]) => [lane, bars.map((tokens) => tokens.join(" ")).join(" | ")])),
      previewInstruments,
      previewLaneSettings: { instruments: previewInstruments },
      sections: `import:${barCount}`,
      songSheet: {
        applyTargets: {
          bass: true,
          chordsPad: true,
          drums: Object.keys(lanes).some((lane) => lane === "drums" || lane.toLowerCase().includes("drum")),
          lead: false
        },
        sequence: "import",
        sections: "import: C"
      },
      style: "midi-import",
      subdivision: "1",
      tempo: String(result.tempoEvents?.[0]?.bpm || 120)
    };
  }

  importedLaneName(note) {
    if (note.channel === 10) {
      return "drums";
    }
    return `track-${note.track}-ch-${note.channel}`;
  }

  previewInstrumentForImportedProgram(result, channel) {
    const program = result.programChanges?.find((entry) => entry.channel === channel)?.program;
    if (!Number.isFinite(Number(program))) {
      return "preview-acoustic-grand-piano";
    }
    const familyIndex = Math.floor(Number(program) / 8);
    return [
      "preview-acoustic-grand-piano",
      "preview-celesta",
      "preview-drawbar-organ",
      "preview-clean-guitar",
      "synth-bass",
      "preview-violin",
      "preview-string-ensemble",
      "preview-brass-stab",
      "preview-woodwind",
      "preview-flute",
      "retro-square-lead",
      "warm-pad",
      "preview-synth-fx",
      "preview-shamisen",
      "basic-drums",
      "preview-sci-fi"
    ][familyIndex] || "preview-acoustic-grand-piano";
  }

  noteNameFromMidiNumber(noteNumber) {
    const value = Number(noteNumber);
    if (!Number.isFinite(value)) {
      return "C4";
    }
    const rounded = Math.max(0, Math.min(127, Math.round(value)));
    const octave = Math.floor(rounded / 12) - 1;
    return `${NOTE_NAMES[rounded % 12]}${octave}`;
  }

  parseSongSheet(request, { generationAction = "parse", updateGrid = true } = {}) {
    if (generationAction !== "regenerate") {
      this.pendingRegenerationSignature = "";
      this.lastRegenerationProtectionSummary = null;
      this.songSheet.setRegenerationPending(false);
    }
    const result = request?.ok === false ? request : this.songSheetParser.parse(request?.sourceText || request);
    this.songSheet.render(result);
    if (!result.ok) {
      this.statusLog.fail(`Song Sheet rejected: ${result.message}`);
      this.updateAudioDiagnostics();
      return result;
    }
    this.syncSelectedArrangementFromSongSheetResult(result);
    this.instrumentGrid.setPreviewTempoBpm(result.tempo);
    if (result.warnings.length) {
      this.statusLog.warn(`Song Sheet parsed with warnings: ${result.warningSummary}`);
    }
    this.statusLog.ok(`Song Sheet parsed: ${result.sections.length} section${result.sections.length === 1 ? "" : "s"}, ${result.bars} bars, ${result.chordCount} chords.`);
    if (updateGrid) {
      const applied = this.applySongSheetToGrid(result, request?.applyTargets || this.songSheet.applyTargets(), { action: generationAction });
      this.updateAudioDiagnostics();
      return applied || result;
    }
    this.updateAudioDiagnostics();
    return result;
  }

  regenerateSongSheetArrangement(request) {
    const result = request?.ok === false ? request : this.songSheetParser.parse(request?.sourceText || request);
    this.songSheet.render(result);
    if (!result.ok) {
      this.pendingRegenerationSignature = "";
      this.lastRegenerationProtectionSummary = null;
      this.songSheet.setRegenerationPending(false);
      this.statusLog.fail(`Song Sheet rejected: ${result.message}`);
      this.updateAudioDiagnostics();
      return result;
    }
    const protection = this.regenerationProtectionSummary(request);
    const signature = this.regenerationRequestSignature(request);
    const needsConfirmation = protection.manualNoteCount > 0;
    const isConfirmed = needsConfirmation && this.pendingRegenerationSignature === signature;
    this.lastRegenerationProtectionSummary = protection;
    if (needsConfirmation && !isConfirmed) {
      this.pendingRegenerationSignature = signature;
      this.songSheet.setRegenerationPending(true);
      this.songSheet.render(result, this.regenerationProtectionDisplaySummary(result, protection));
      this.statusLog.warn(protection.message);
      this.updateAudioDiagnostics();
      return result;
    }
    this.pendingRegenerationSignature = "";
    this.songSheet.setRegenerationPending(false);
    this.statusLog.info("Regenerate Arrangement requested from the populated Song Sheet sequence and selected targets.");
    const applied = this.parseSongSheet(request, { generationAction: "regenerate", updateGrid: true });
    this.lastRegenerationProtectionSummary = null;
    return applied;
  }

  regenerationRequestSignature(request) {
    const targets = request?.applyTargets || this.songSheet.applyTargets();
    const normalizedTargets = {
      bass: targets.bass !== false,
      chordsPad: targets.chordsPad !== false,
      drums: targets.drums === true,
      lead: targets.lead === true
    };
    return JSON.stringify({
      sourceText: request?.sourceText || String(request || ""),
      targets: normalizedTargets
    });
  }

  regenerationProtectionSummary(request) {
    const plan = this.songSheetGenerationPlan(request?.applyTargets || this.songSheet.applyTargets());
    const generatedLaneSet = new Set(plan.generatedTargets);
    const result = this.instrumentGridParser.parse(this.instrumentGrid.readInput());
    let generatedNoteCount = 0;
    let manualNoteCount = 0;
    if (result.ok) {
      result.timeline
        .filter((event) => generatedLaneSet.has(event.lane))
        .forEach((event) => {
          if (event.source === "generated") {
            generatedNoteCount += 1;
          } else if (event.source === "manual") {
            manualNoteCount += 1;
          }
        });
    }
    const targetLanes = plan.generatedTargets.join(", ") || "none";
    const targetText = targetLanes === "none" ? "no generated target lanes" : `target lanes ${targetLanes}`;
    const message = manualNoteCount > 0
      ? `Regeneration may overwrite ${manualNoteCount} manual note${manualNoteCount === 1 ? "" : "s"} in ${targetText}. Generated notes before regeneration: ${generatedNoteCount}. Click Regenerate Arrangement again to confirm.`
      : `Regeneration ready: ${generatedNoteCount} generated note${generatedNoteCount === 1 ? "" : "s"} and 0 manual notes in ${targetText}.`;
    return {
      generatedNoteCount,
      manualNoteCount,
      message,
      targetLanes
    };
  }

  regenerationProtectionDisplaySummary(result, protection) {
    const plan = this.songSheetGenerationPlan(this.songSheet.applyTargets());
    return {
      ...(this.lastSongSheetGenerationSummary || {}),
      barsGenerated: result.bars,
      generatedNotesBeforeRegeneration: protection.generatedNoteCount,
      generatedInstruments: plan.targetLabels.join(", ") || "section colors only",
      generationTargets: plan.generationTargets,
      laneMapping: plan.laneMapping,
      manualNotesBeforeRegeneration: protection.manualNoteCount,
      regenerationProtection: protection.message,
      sectionsUsed: result.sections.map((section) => section.label).join(", "),
      targetLanesAffected: plan.targetLabels.join(", ") || "section colors only"
    };
  }

  songSheetGenerationPlan(targets = {}) {
    const normalizedTargets = {
      bass: targets.bass !== false,
      chordsPad: targets.chordsPad !== false,
      drums: targets.drums === true,
      lead: targets.lead === true
    };
    const mappings = [
      { enabled: normalizedTargets.chordsPad, generatedLanes: ["pad"], key: "chordsPad", label: "Chords/Pad", lanes: ["chords", "pad"] },
      { enabled: normalizedTargets.bass, generatedLanes: ["bass"], key: "bass", label: "Bass", lanes: ["bass"] },
      { enabled: normalizedTargets.drums, generatedLanes: ["drums"], key: "drums", label: "Drums", lanes: ["drums"] },
      { enabled: normalizedTargets.lead, generatedLanes: ["lead"], key: "lead", label: "Lead", lanes: ["lead"] }
    ];
    const enabledMappings = mappings.filter((mapping) => mapping.enabled);
    return {
      generatedTargets: enabledMappings.flatMap((mapping) => mapping.generatedLanes),
      generationTargets: enabledMappings.map((mapping) => mapping.label).join(", ") || "section colors only",
      laneMapping: mappings.map((mapping) => `${mapping.label} -> ${mapping.enabled ? mapping.lanes.join(", ") : "skipped"}`).join("; "),
      mappings,
      normalizedTargets,
      targetLabels: enabledMappings.map((mapping) => mapping.label),
      targetLaneKeys: enabledMappings.flatMap((mapping) => mapping.lanes)
    };
  }

  applySongSheetToGrid(result, targets = {}, { action = "parse" } = {}) {
    const playableSections = result.sections.filter((section) => section.bars > 0);
    if (!playableSections.length || !result.chordCount) {
      this.statusLog.warn("Song Sheet did not update the note grid because no playable chord sections were found.");
      return;
    }
    const beatsPerBar = "4";
    const sections = playableSections.map((section) => `${section.label}:${section.bars}`).join(", ");
    const chords = playableSections
      .flatMap((section) => section.chords.map((chord) => Array.from({ length: Number(beatsPerBar) }, () => chord).join(" ")))
      .join(" | ");
    const currentInput = this.instrumentGrid.readInput();
    const lanes = { ...(currentInput.lanes || {}) };
    const barCount = playableSections.reduce((total, section) => total + section.bars, 0);
    const restLane = Array.from({ length: barCount }, () => Array.from({ length: Number(beatsPerBar) }, () => "-").join(" ")).join(" | ");
    const laneMatchesBarCount = (source) => String(source || "").split("|").filter((bar) => bar.trim()).length === barCount;
    const generationPlan = this.songSheetGenerationPlan(targets);
    const normalizedTargets = generationPlan.normalizedTargets;
    if (normalizedTargets.chordsPad) {
      lanes.chords = chords;
    }
    const preservedLanes = [];
    const restAlignedLanes = [];
    Object.keys(lanes).forEach((lane) => {
      const isTargeted = (lane === "chords" || lane === "pad") && normalizedTargets.chordsPad
        || lane === "bass" && normalizedTargets.bass
        || lane === "drums" && normalizedTargets.drums
        || lane === "lead" && normalizedTargets.lead;
      if (isTargeted) {
        return;
      }
      if (laneMatchesBarCount(lanes[lane])) {
        preservedLanes.push(lane);
      } else {
        lanes[lane] = restLane;
        restAlignedLanes.push(lane);
      }
    });
    this.instrumentGrid.applyGridDefaults({
      bass: lanes.bass || "",
      beatsPerBar,
      chords: lanes.chords || "",
      drums: lanes.drums || "",
      lanes,
      lead: lanes.lead || "",
      pad: lanes.pad || "",
      previewInstruments: this.instrumentGrid.previewLaneSettings().instruments,
      previewLaneSettings: this.instrumentGrid.previewLaneSettings(),
      sections,
      subdivision: "1"
    });
    generationPlan.generatedTargets.forEach((lane) => {
      const generationInput = this.instrumentGrid.readInput();
      const generated = this.instrumentGridParser.generateLane({
        ...generationInput,
        lanes: {
          ...(generationInput.lanes || {}),
          chords
        }
      }, lane);
      if (generated.ok) {
        this.instrumentGrid.applyGeneratedLane(generated);
      }
    });
    const normalized = this.normalizeInstrumentGrid(this.instrumentGrid.readInput());
    const targetLaneSet = new Set(generationPlan.targetLaneKeys);
    const notesGenerated = normalized?.ok
      ? normalized.timeline.filter((event) => targetLaneSet.has(event.lane)).length
      : 0;
    const manualPreservation = [
      preservedLanes.length ? `kept ${preservedLanes.join(", ")}` : "",
      restAlignedLanes.length ? `aligned ${restAlignedLanes.join(", ")} to rests` : ""
    ].filter(Boolean).join("; ") || "none";
    const protection = action === "regenerate" ? this.lastRegenerationProtectionSummary : null;
    this.lastSongSheetGenerationSummary = {
      barsGenerated: barCount,
      generatedNotesBeforeRegeneration: protection?.generatedNoteCount,
      generatedInstruments: generationPlan.targetLabels.join(", ") || "section colors only",
      generationTargets: generationPlan.generationTargets,
      laneMapping: generationPlan.laneMapping,
      manualNotesBeforeRegeneration: protection?.manualNoteCount,
      manualLanesPreserved: manualPreservation,
      notesGenerated,
      regenerationProtection: protection?.message || (action === "regenerate" ? "No manual target-lane notes detected before regeneration." : ""),
      sectionsUsed: playableSections.map((section) => section.label).join(", "),
      targetLanesAffected: generationPlan.targetLabels.join(", ") || "section colors only"
    };
    this.songSheet.render(result, this.lastSongSheetGenerationSummary);
    const actionLabel = action === "regenerate" ? "Regenerated arrangement" : "Song Sheet updated the editable note grid";
    this.statusLog.ok(`${actionLabel} for ${generationPlan.targetLabels.join(", ") || "section colors only"}: ${barCount} bars, ${notesGenerated} notes. Manual lanes ${manualPreservation}.`);
    return normalized;
  }

  normalizeInstrumentGrid(input) {
    const result = this.instrumentGridParser.parse(input);
    this.instrumentGrid.render(result);
    this.setCurrentInstrumentGridResult(result.ok ? result : null);
    if (!result.ok) {
      this.statusLog.fail(`Instrument grid rejected: ${result.message}`);
      this.updateAudioDiagnostics();
      return result;
    }
    this.syncSelectedArrangementFromGridInput(input);
    if (result.warnings.length) {
      this.statusLog.warn(`Instrument grid normalized with warnings: ${result.warningSummary}`);
    }
    this.statusLog.ok(`Instrument grid normalized: ${result.sections.length} section${result.sections.length === 1 ? "" : "s"}, ${result.barCount} bars, ${result.eventCount} events.`);
    this.updateAudioDiagnostics();
    return result;
  }

  generateInstrumentLane(lane, input) {
    const generated = this.instrumentGridParser.generateLane(input, lane);
    if (!generated.ok) {
      this.statusLog.fail(`Instrument grid generation rejected: ${generated.message}`);
      this.updateAudioDiagnostics();
      return;
    }
    this.instrumentGrid.applyGeneratedLane(generated);
    const normalized = this.instrumentGridParser.parse(this.instrumentGrid.readInput());
    this.instrumentGrid.render(normalized);
    this.setCurrentInstrumentGridResult(normalized.ok ? normalized : null);
    if (generated.warnings.length) {
      this.statusLog.warn(`Instrument grid generation warnings: ${generated.warningSummary}`);
    }
    if (generated.skippedEmptyBars) {
      this.statusLog.warn(`Instrument grid generation skipped ${generated.skippedEmptyBars} empty bar${generated.skippedEmptyBars === 1 ? "" : "s"}.`);
    }
    if (!normalized.ok) {
      this.statusLog.fail(`Instrument grid generation normalized into invalid grid: ${normalized.message}`);
      this.updateAudioDiagnostics();
      return;
    }
    this.syncSelectedArrangementFromGridInput(this.instrumentGrid.readInput());
    if (normalized.warnings.length) {
      this.statusLog.warn(`Instrument grid normalized with warnings: ${normalized.warningSummary}`);
    }
    this.statusLog.ok(generated.message);
    this.updateAudioDiagnostics();
  }

  syncEditedInstrumentGrid(input, detail = {}) {
    const result = this.instrumentGridParser.parse(input);
    if (!result.ok) {
      this.statusLog.fail(`Instrument note edit rejected: ${result.message}`);
      this.updateAudioDiagnostics();
      return;
    }
    this.setCurrentInstrumentGridResult(result);
    if (["add-lane", "delete-lane", "duplicate-lane", "move-lane-down", "move-lane-up"].includes(detail.action)) {
      this.instrumentGrid.render(result);
    } else {
      this.instrumentGrid.syncEditedGridResult(result);
    }
    this.syncSelectedArrangementFromGridInput(input);
    this.markDirty({ changedKeys: ["data.songs.studioArrangement"], reason: "midi-studio-note-grid-edited" });
    if (detail.action === "add-lane") {
      this.statusLog.ok(`Added instrument row ${detail.laneLabel || detail.lane}; playback data updated.`);
    } else if (detail.action === "duplicate-lane") {
      this.statusLog.ok(`Duplicated instrument row ${detail.sourceLaneLabel || detail.sourceLane || "instrument"} as ${detail.laneLabel || detail.lane}; playback data updated.`);
    } else if (detail.action === "move-lane-up" || detail.action === "move-lane-down") {
      this.statusLog.ok(`Moved instrument row ${detail.laneLabel || detail.lane} ${detail.direction || "in order"}; canonical order updated.`);
    } else if (detail.action === "delete-lane") {
      this.statusLog.ok(`Deleted instrument row ${detail.laneLabel || detail.lane}; playback data updated.`);
    } else if (detail.action === "delete-selected-note") {
      this.statusLog.ok(`Deleted selected ${detail.rowToken || "note"} for ${detail.laneLabel || "instrument"}; playback data updated.`);
    } else if (detail.action === "duplicate-selected-note") {
      this.statusLog.ok(`Duplicated selected ${detail.rowToken || "note"} for ${detail.laneLabel || "instrument"}; playback data updated.`);
    } else if (detail.action === "paint-notes") {
      this.statusLog.ok(`Painted ${detail.rowToken || "notes"} for ${detail.laneLabel || "instrument"} across the timeline; playback data updated.`);
    } else if (detail.action === "erase-notes") {
      this.statusLog.ok(`Erased ${detail.rowToken || "notes"} for ${detail.laneLabel || "instrument"} across the timeline; playback data updated.`);
    } else if (detail.action === "toggle-note") {
      this.statusLog.ok(`Toggled ${detail.rowToken || detail.note || "note"} for ${detail.laneLabel || "instrument"}; visible timeline playback data updated.`);
    } else {
      this.statusLog.ok(`Edited ${detail.laneLabel || "instrument"} note cell; playback data updated.`);
    }
    if (detail.audition) {
      void this.auditionEditedTimelineCell(result, detail);
    }
    this.updateAudioDiagnostics();
  }

  async auditionEditedTimelineCell(result, detail = {}) {
    const stepIndex = Number(detail.auditionStepIndex);
    if (!result?.ok || !Number.isInteger(stepIndex)) {
      return;
    }
    this.preparePreviewAudition("edited note");
    const audition = await this.previewSynth.playGridRange({
      endStep: stepIndex,
      grid: result,
      label: `${detail.rowToken || "note"} step ${stepIndex + 1}`,
      laneSettings: this.instrumentGrid.previewLaneSettings(),
      loop: false,
      mode: "note audition",
      startStep: stepIndex,
      tempoBpm: this.previewTempoBpm()
    });
    if (!audition.ok) {
      this.statusLog.warn(`Preview Synth note audition unavailable: ${audition.message} Editing was kept.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (audition.warnings?.length) {
      this.statusLog.warn(`Preview Synth note audition warnings: ${audition.warnings.join("; ")}`);
    }
    this.statusLog.info(`Auditioned edited ${detail.rowToken || "note"} for ${detail.laneLabel || "instrument"}.`);
    this.updateAudioDiagnostics();
  }

  syncSelectedArrangementFromGridInput(input) {
    const song = this.selectedSong();
    if (!song?.studioArrangement) {
      return;
    }
    song.studioArrangement.beatsPerBar = String(input.beatsPerBar || "");
    song.studioArrangement.sections = String(input.sections || "");
    song.studioArrangement.subdivision = String(input.subdivision || "1");
    song.studioArrangement.lanes = { ...(input.lanes || {}) };
    song.studioArrangement.previewLaneSettings = deepClone(input.previewLaneSettings || {});
    song.studioArrangement.previewInstruments = { ...(input.previewLaneSettings?.instruments || {}) };
    this.details.showJson(song);
  }

  gridInputFromArrangement(arrangement) {
    return {
      bass: arrangement.lanes?.bass || "",
      beatsPerBar: arrangement.beatsPerBar,
      chords: arrangement.lanes?.chords || "",
      drums: arrangement.lanes?.drums || "",
      lanes: arrangement.lanes || {},
      lead: arrangement.lanes?.lead || "",
      pad: arrangement.lanes?.pad || "",
      previewInstruments: arrangement.previewInstruments || {},
      previewLaneSettings: arrangement.previewLaneSettings || { instruments: arrangement.previewInstruments || {} },
      sections: arrangement.sections,
      subdivision: arrangement.subdivision
    };
  }

  editableNoteCount(payload = this.payload) {
    return (payload?.songs || []).reduce((count, song) => {
      if (!song.studioArrangement) {
        return count;
      }
      const result = this.instrumentGridParser.parse(this.gridInputFromArrangement(song.studioArrangement));
      return result.ok ? count + result.timeline.length : count;
    }, 0);
  }

  syncSelectedArrangementFromSongSheetResult(result) {
    const song = this.selectedSong();
    if (!song?.studioArrangement || !result?.ok) {
      return;
    }
    song.studioArrangement.key = String(result.key || "");
    song.studioArrangement.style = String(result.style || "");
    song.studioArrangement.tempo = String(result.tempo || "");
    song.studioArrangement.songSheet = {
      applyTargets: this.songSheet.applyTargets(),
      sequence: this.songSheet.sequenceInput.value.trim(),
      sections: this.songSheet.sectionsInput.value.trim()
    };
    this.details.showJson(song);
  }

  async handleInstrumentGridTransport(action, detail = {}) {
    if (action === "invalid-section") {
      const label = String(detail.label || "(none)");
      const warningKey = `${this.missingSectionWarningKey}:${label.toLowerCase()}`;
      if (!this.missingSectionWarnings.has(warningKey)) {
        this.missingSectionWarnings.add(warningKey);
        this.statusLog.warn(`section ${label} does not exist. Normalize a section map containing that label or choose a listed custom section.`);
      }
      return;
    }
    if (action === "invalid-loop") {
      this.statusLog.warn(`Loop region unavailable: ${detail.message}`);
      return;
    }
    if (action === "invalid-sequence") {
      this.statusLog.warn(`Sequence preview unavailable: ${detail.message}`);
      return;
    }
    if (action === "play-section") {
      const started = await this.startPreviewSynth({
        endStep: detail.section.endStep,
        label: detail.section.label,
        loop: false,
        mode: "section",
        startStep: detail.section.startStep
      });
      if (started) {
        this.playbackControl.setPlaying(this.selectedSong(), { loop: false });
        this.actionNav.setNowPlaying(this.selectedSong(), { playing: true });
      }
      return started;
    }
    if (action === "play-loop") {
      const started = await this.startPreviewSynth({
        endStep: detail.endSection.endStep,
        label: `${detail.startSection.label} to ${detail.endSection.label}`,
        loop: true,
        mode: "loop",
        startStep: detail.startSection.startStep
      });
      if (started) {
        this.playbackControl.setPlaying(this.selectedSong(), { loop: true });
        this.actionNav.setNowPlaying(this.selectedSong(), { playing: true });
      }
      return started;
    }
    if (action === "play-sequence") {
      const started = await this.startPreviewSynth({
        endStep: detail.endStep,
        label: detail.label || "Song Sequence",
        loop: false,
        mode: "sequence",
        startStep: detail.startStep
      });
      if (started) {
        this.playbackControl.setPlaying(this.selectedSong(), { loop: false });
        this.actionNav.setNowPlaying(this.selectedSong(), { playing: true });
      }
      return started;
    }
    if (action === "jump-section") {
      this.statusLog.ok(`Timing playhead jumped to section ${detail.section.label}.`);
      return;
    }
    if (action === "select-section") {
      if (detail.source === "timeline-header") {
        this.songSheet.selectSequenceItem(detail.section.label, detail.sequenceIndex);
      }
      this.statusLog.info(`Timing section selected: ${detail.section.label}.`);
      return;
    }
    if (action === "set-loop-region") {
      this.statusLog.info(`Loop region set: ${detail.startSection.label} -> ${detail.endSection.label}.`);
      return;
    }
    if (action === "stop-preview") {
      this.clearPlaybackCompletionTimer();
      this.playback.stop();
      const stoppedCount = this.previewSynth.stop();
      this.instrumentGrid.clearPreviewPlaybackLanes();
      this.playbackControl.setStopped(this.selectedSong(), this.playbackControlStatus(this.selectedSong()));
      this.actionNav.setNowPlaying(this.selectedSong());
      this.statusLog.ok(`Preview playback stopped. Cleared ${stoppedCount} scheduled oscillator${stoppedCount === 1 ? "" : "s"}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (action === "preview-complete") {
      this.handlePreviewPlaybackComplete(detail);
    }
  }

  clearPlaybackCompletionTimer() {
    if (this.playbackCompletionTimer) {
      this.window.clearTimeout(this.playbackCompletionTimer);
      this.playbackCompletionTimer = null;
    }
  }

  handlePreviewPlaybackComplete({ label = "section", mode = "section" } = {}) {
    this.clearPlaybackCompletionTimer();
    const wasPlaying = this.playbackControl.isPlaying();
    this.playback.stop();
    const stoppedCount = this.previewSynth.stop();
    this.instrumentGrid.clearPreviewPlaybackLanes();
    if (wasPlaying) {
      this.playbackControl.setCompleted(this.selectedSong(), this.playbackControlStatus(this.selectedSong()));
    } else {
      this.playbackControl.setStopped(this.selectedSong(), this.playbackControlStatus(this.selectedSong()));
    }
    this.actionNav.setNowPlaying(this.selectedSong());
    this.statusLog.ok(`Preview Synth ${mode} playback complete: ${label}. Cleared ${stoppedCount} scheduled oscillator${stoppedCount === 1 ? "" : "s"}.`);
    this.updateAudioDiagnostics();
  }

  async startPreviewSynth({ endStep, label, loop, mode, startStep }) {
    const result = await this.previewSynth.playGridRange({
      endStep,
      grid: this.currentInstrumentGridResult(),
      label,
      laneSettings: this.instrumentGrid.previewLaneSettings(),
      loop,
      mode,
      startStep,
      tempoBpm: this.previewTempoBpm()
    });
    if (!result.ok) {
      this.instrumentGrid.clearPreviewPlaybackLanes();
      if (result.warnings?.length) {
        this.statusLog.warn(`Preview Synth warnings: ${result.warnings.join("; ")}`);
      }
      if (result.reason === "audio-suspended" || result.reason === "audio-resume-failed") {
        this.statusLog.warn("Browser audio did not unlock for Preview Synth. Start from a direct click/tap and check site audio permissions.");
      }
      this.statusLog.fail(result.message);
      this.updateAudioDiagnostics();
      return false;
    }
    if (result.warnings.length) {
      this.statusLog.warn(`Preview Synth warnings: ${result.warnings.join("; ")}`);
    }
    this.instrumentGrid.setPreviewPlaybackLanes(result.activeLanes);
    this.statusLog.info(`Playing ${mode}: ${label}.`);
    this.statusLog.ok(`Preview Synth started for ${mode} ${label} with ${result.eventCount} playable event${result.eventCount === 1 ? "" : "s"}.`);
    this.statusLog.warn("Preview Synth is an approximate Web Audio audition; SoundFont and real instrument playback are not implemented.");
    this.updateAudioDiagnostics();
    return true;
  }

  async handlePreviewLaneSettingChange(kind, detail) {
    if (kind === "instrument") {
      if (!detail.instrumentValue) {
        this.statusLog.warn(`Missing preview instrument selection for ${detail.laneLabel}. Choose a Preview Synth instrument before playback.`);
        this.updateAudioDiagnostics();
        return;
      }
      this.persistInstrumentSettings("instrument");
      this.statusLog.ok(`Preview instrument selected for ${detail.laneLabel}: ${detail.instrumentLabel}.`);
      if (detail.instrumentWarning) {
        this.statusLog.warn(`Preview Synth mapping: ${detail.instrumentWarning}`);
      }
      await this.auditionPreviewInstrument(detail);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "instrument-type") {
      this.persistInstrumentSettings("instrument-type");
      this.statusLog.ok(`Instrument type selected for ${detail.laneLabel}: ${detail.instrumentType}; instrument options updated to ${detail.instrumentLabel || "none"}.`);
      if (detail.instrumentWarning) {
        this.statusLog.warn(`Preview Synth mapping: ${detail.instrumentWarning}`);
      }
      await this.auditionPreviewInstrument(detail);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "audition-middle-c") {
      await this.auditionNote({ ...detail, note: "C4" });
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "audition-note") {
      await this.auditionNote(detail);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "mute") {
      this.persistInstrumentSettings("mute");
      this.statusLog[detail.enabled ? "warn" : "info"](`Lane ${detail.enabled ? "muted" : "unmuted"}: ${detail.laneLabel}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "solo") {
      this.persistInstrumentSettings("solo");
      this.statusLog[detail.enabled ? "ok" : "info"](`Lane ${detail.enabled ? "soloed" : "solo cleared"}: ${detail.laneLabel}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "visibility") {
      this.persistInstrumentSettings("visibility");
      this.statusLog.info(`Lane ${detail.enabled ? "shown" : "hidden"}: ${detail.laneLabel}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "delete-confirmation") {
      this.statusLog.warn(`Confirm delete requested for ${detail.laneLabel}. Confirming will remove its notes and instrument settings.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "delete-blocked") {
      this.statusLog.warn(`Final instrument cannot be deleted: ${detail.laneLabel}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "delete-cancelled") {
      this.statusLog.info(`Delete cancelled for ${detail.laneLabel}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "volume") {
      this.persistInstrumentSettings("volume");
      this.statusLog.info(`Lane volume set for ${detail.laneLabel}: ${detail.value}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "pan") {
      this.persistInstrumentSettings("pan");
      this.statusLog.info(`Lane pan set for ${detail.laneLabel}: ${detail.value}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "display-name") {
      this.persistInstrumentSettings("display-name");
      this.statusLog.info(`Instrument display name set for ${detail.laneLabel}: ${detail.value || "default"}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "octave-range") {
      this.persistInstrumentSettings("octave-range");
      this.statusLog.info(`Instrument octave range set for ${detail.laneLabel}: ${detail.value}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "transpose" || kind === "velocity" || kind === "duration") {
      this.persistInstrumentSettings(kind);
      this.statusLog.info(`Instrument ${kind} set for ${detail.laneLabel}: ${detail.value}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "instrument-preset-load") {
      this.persistInstrumentSettings("preset-load");
      this.statusLog.ok(`Instrument preset loaded for ${detail.laneLabel}: ${detail.presetLabel}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "select") {
      this.statusLog.info(`Selected instrument lane: ${detail.laneLabel}.`);
      this.updateAudioDiagnostics();
    }
  }

  persistInstrumentSettings(kind) {
    this.syncSelectedArrangementFromGridInput(this.instrumentGrid.readInput());
    this.markDirty({
      changedKeys: ["data.songs.studioArrangement.previewLaneSettings"],
      reason: `midi-studio-instrument-${kind}-edited`
    });
  }

  preparePreviewAudition(label = "instrument") {
    const snapshot = this.previewSynth.getSnapshot();
    const wasPlaybackControlActive = this.playbackControl.isPlaying();
    if (!snapshot.playing && !snapshot.activeNodeCount && !wasPlaybackControlActive) {
      return;
    }
    this.clearPlaybackCompletionTimer();
    this.playback.stop();
    const stoppedCount = this.previewSynth.stop();
    this.instrumentGrid.stopPreviewUi();
    if (wasPlaybackControlActive) {
      this.playbackControl.setStopped(this.selectedSong(), this.playbackControlStatus(this.selectedSong()));
      this.actionNav.setNowPlaying(this.selectedSong());
    }
    if (stoppedCount) {
      this.statusLog.info(`Stopped active Preview Synth playback before ${label} audition.`);
    }
  }

  async auditionPreviewInstrument(detail) {
    if (!detail.instrumentValue) {
      return;
    }
    this.preparePreviewAudition("instrument");
    const result = await this.previewSynth.previewInstrument({
      instrumentId: detail.instrumentValue,
      label: detail.instrumentLabel,
      lane: detail.lane
    });
    if (!result.ok) {
      this.statusLog.warn(result.message);
      return;
    }
    const previewLabel = result.mappedPreviewInstrumentLabel || detail.previewInstrumentLabel || result.instrumentLabel || detail.instrumentLabel;
    this.statusLog.info(`Auditioned ${detail.instrumentLabel} for ${detail.laneLabel} with ${previewLabel}.`);
  }

  async auditionNote(detail) {
    if (!detail.instrumentValue) {
      this.statusLog.warn(`Missing preview instrument selection for ${detail.laneLabel}. Choose a Preview Synth instrument before auditioning ${detail.note || "a note"}.`);
      return;
    }
    const note = String(detail.note || "C4").trim() || "C4";
    this.preparePreviewAudition("keyboard");
    const audition = await this.previewSynth.playGridRange({
      endStep: 0,
      grid: {
        ok: true,
        subdivision: 1,
        timeline: [{
          durationBeats: 0.25,
          kind: "note",
          lane: detail.lane,
          stepIndex: 0,
          value: note
        }]
      },
      label: note,
      laneSettings: this.instrumentGrid.previewLaneSettings(),
      loop: false,
      mode: "keyboard audition",
      startStep: 0,
      tempoBpm: this.previewTempoBpm()
    });
    if (!audition.ok) {
      this.statusLog.warn(`Preview Synth keyboard audition unavailable: ${audition.message}`);
      return;
    }
    if (detail.instrumentWarning) {
      this.statusLog.warn(`Preview Synth mapping: ${detail.instrumentWarning}`);
    }
    const previewLabel = detail.previewInstrumentLabel || detail.instrumentLabel;
    this.statusLog.info(`Auditioned ${note} for ${detail.laneLabel} with ${previewLabel}.`);
  }

  previewTempoBpm() {
    const parsedTempo = Number(this.selectedSong()?.studioArrangement?.tempo);
    return Number.isFinite(parsedTempo) && parsedTempo > 0 ? parsedTempo : 120;
  }

  exportRenderedTarget(format) {
    const song = this.selectedSong();
    const label = String(format || "").toUpperCase();
    if (!song) {
      const message = `Missing MIDI song for ${label} export. Load or select a song before exporting.`;
      this.statusLog.fail(message);
      this.exportPanel.setStatus({ level: "FAIL", message, payload: this.payload, playable: this.playableEventSummary(), song });
      return;
    }
    const target = String(song.rendered?.[format] || "").trim();
    if (!target) {
      const message = `Missing rendered ${label} export target for ${song.name}. Add music.songs[].rendered.${format} before exporting.`;
      this.statusLog.fail(message);
      this.exportPanel.setStatus({ level: "FAIL", message, payload: this.payload, playable: this.playableEventSummary(), song });
      return;
    }
    const message = `Export rendering not implemented for ${label}. Planned target: ${target}.`;
    this.statusLog.warn(message);
    this.exportPanel.setStatus({ level: "WARN", message, payload: this.payload, playable: this.playableEventSummary(), song });
  }

  applySelectedSongArrangement(sourceLabel) {
    const song = this.selectedSong();
    const arrangement = song?.studioArrangement || null;
    if (!song) {
      this.instrumentGrid.render(null);
      this.clearCurrentInstrumentGridResult();
      return false;
    }
    if (!arrangement) {
      this.instrumentGrid.render(null);
      this.clearCurrentInstrumentGridResult();
      this.statusLog.warn(`No editable studio arrangement is declared for ${song.name}. Import a manifest song with music.songs[].studioArrangement before using Play as an audible Preview Synth workflow.`);
      this.updateAudioDiagnostics();
      return false;
    }
    this.songSheet.applyGuidedDefaults({
      applyTargets: this.songSheetApplyTargetsFromArrangement(arrangement),
      key: arrangement.key,
      hasDrums: this.hasDrumsInstrument(arrangement),
      sequence: this.songSheetSequenceFromArrangement(arrangement),
      sections: this.songSheetStructureFromArrangement(arrangement) || `main: ${arrangement.lanes.chords || ""}`.trim(),
      style: arrangement.style,
      tempo: arrangement.tempo
    });
    this.instrumentGrid.applyGridDefaults({
      bass: arrangement.lanes.bass,
      beatsPerBar: arrangement.beatsPerBar,
      chords: arrangement.lanes.chords,
      drums: arrangement.lanes.drums,
      lanes: arrangement.lanes,
      lead: arrangement.lanes.lead,
      pad: arrangement.lanes.pad,
      previewInstruments: arrangement.previewInstruments,
      previewLaneSettings: arrangement.previewLaneSettings,
      sections: arrangement.sections,
      subdivision: arrangement.subdivision
    });
    this.parseSongSheet(this.songSheet.composeGuidedSheet(), { updateGrid: false });
    this.normalizeInstrumentGrid(this.instrumentGrid.readInput());
    const playable = this.playableEventSummary();
    if (playable.count > 0) {
      this.statusLog.ok(`Loaded editable studio arrangement for ${song.name} from ${sourceLabel}: ${playable.count} playable Preview Synth event${playable.count === 1 ? "" : "s"}.`);
      return true;
    }
    this.statusLog.fail(`Imported arrangement for ${song.name} has no playable Preview Synth events.`);
    this.updateAudioDiagnostics();
    return false;
  }

  stopPlayback({ log = true } = {}) {
    this.clearPlaybackCompletionTimer();
    this.playback.stop();
    const stoppedCount = this.previewSynth.stop();
    this.instrumentGrid.stopPreviewUi();
    this.playbackControl.setStopped(this.selectedSong(), this.playbackControlStatus(this.selectedSong()));
    this.actionNav.setNowPlaying(this.selectedSong());
    if (log) {
      this.statusLog.ok(`Stop completed. Cleared ${stoppedCount} scheduled oscillator${stoppedCount === 1 ? "" : "s"} and stopped all MIDI Studio preview audio.`);
    }
    this.updateAudioDiagnostics();
  }

  stopAllAudio() {
    this.clearPlaybackCompletionTimer();
    this.playback.stop();
    const stoppedCount = this.previewSynth.stop();
    this.instrumentGrid.stopPreviewUi();
    this.playbackControl.setStopped(this.selectedSong(), this.playbackControlStatus(this.selectedSong()));
    this.actionNav.setNowPlaying(this.selectedSong());
    this.statusLog.ok(`Stop All Audio completed. Cleared ${stoppedCount} scheduled oscillator${stoppedCount === 1 ? "" : "s"} and reset Preview Synth state.`);
    this.updateAudioDiagnostics();
  }

  playableEventSummary() {
    const gridResult = this.currentInstrumentGridResult();
    const section = this.instrumentGrid.selectedSection() || gridResult?.sections?.[0] || null;
    if (!gridResult?.ok || !section) {
      return { activeLanes: [], count: 0, totalCount: 0, warnings: [] };
    }
    const laneSettings = this.instrumentGrid.previewLaneSettings();
    const playable = this.previewSynth.playableEventsForRange(
      gridResult,
      section.startStep,
      section.endStep,
      laneSettings
    );
    const totalPlayable = this.previewSynth.playableEventsForRange(
      gridResult,
      0,
      Math.max(0, gridResult.totalSteps - 1),
      laneSettings
    );
    return {
      activeLanes: playable.activeLanes,
      count: playable.events.length,
      totalCount: totalPlayable.events.length,
      warnings: playable.warnings
    };
  }

  updateAudioDiagnostics() {
    if (!this.audioDiagnostics) {
      return;
    }
    const snapshot = this.previewSynth.getSnapshot();
    const laneDiagnostics = this.instrumentGrid.previewLaneDiagnostics();
    const playable = this.playableEventSummary();
    this.exportPanel.renderSource(this.selectedSong(), playable);
    this.exportPanel.renderManifestReadiness(this.payload, this.selectedSong(), playable);
    this.exportPanel.renderDiagnostics(this.selectedSong(), playable, this.payload);
    this.exportPanel.setStatus(this.exportPanel.exportReadiness(this.selectedSong(), { payload: this.payload, playable }));
    const selectedSection = this.instrumentGrid.selectedSection();
    const packSummary = Object.entries(laneDiagnostics.instrumentLabels)
      .map(([lane, label]) => `${lane}: ${label || "missing"}`)
      .join("; ");
    this.audioDiagnostics.render([
      ["Audio context state", snapshot.audioContextState],
      ["Selected song", this.selectedSong()?.name || "none"],
      ["Selected section", selectedSection?.label || "none"],
      ["Playable note count", playable.count],
      ["Active lanes", laneDiagnostics.activeLanes.length ? laneDiagnostics.activeLanes.join(", ") : "none"],
      ["Hidden lanes", laneDiagnostics.hiddenLanes.length ? laneDiagnostics.hiddenLanes.join(", ") : "none"],
      ["Muted lanes", laneDiagnostics.mutedLanes.length ? laneDiagnostics.mutedLanes.join(", ") : "none"],
      ["Soloed lanes", laneDiagnostics.soloedLanes.length ? laneDiagnostics.soloedLanes.join(", ") : "none"],
      ["Lane volumes", laneDiagnostics.volumeSummary || "none"],
      ["Lane pans", laneDiagnostics.panSummary || "none"],
      ["Current preview instrument pack", packSummary || "none"],
      ["Last playback error", snapshot.lastError || "none"]
    ]);
  }

  async importManifestFile(file) {
    if (!file) {
      return;
    }
    const loaded = typeof this.manifestLoader.loadFromFile === "function"
      ? await this.manifestLoader.loadFromFile(file)
      : null;
    if (loaded?.ok) {
      this.applyPayload(loaded.manifest, `Import JSON Manifest:${loaded.sourceLabel || file.name || "manifest.json"}`);
      return;
    }
    if (loaded && !loaded.skipped) {
      this.statusLog.fail(`Manifest import failed: ${loaded.message}`);
      return;
    }
    try {
      this.applyPayload(JSON.parse(await readFileText(file)), `Import JSON Manifest:${file.name || "manifest.json"}`);
    } catch (error) {
      this.statusLog.fail(`Manifest import failed: ${error.message}`);
    }
  }

  exportToolState() {
    if (!this.payload) {
      this.statusLog.fail("Export blocked: no MIDI Studio V2 payload is loaded.");
      return;
    }
    const toolState = this.serializer.createToolState(this.payload);
    const noteCount = this.editableNoteCount();
    this.details.showJson(toolState);
    this.statusLog.ok("MIDI Studio V2 toolState preview written to JSON Details.");
    this.statusLog.pass(`Export JSON PASS: MIDI Studio V2 toolState preview contains ${this.payload.songs.length} song${this.payload.songs.length === 1 ? "" : "s"} and ${noteCount} editable note event${noteCount === 1 ? "" : "s"}.`);
  }

  saveProject() {
    if (!this.payload) {
      this.statusLog.fail("Save Project failed: no MIDI Studio V2 payload is loaded.");
      return;
    }
    try {
      const toolState = this.serializer.createToolState(this.payload);
      JSON.stringify(toolState);
      this.lastSavedToolState = toolState;
      this.details.showJson(toolState);
      this.setDirtyState(false);
      const noteCount = this.editableNoteCount();
      this.statusLog.ok(`Save Project completed: ${this.payload.songs.length} song${this.payload.songs.length === 1 ? "" : "s"} saved with ${noteCount} editable note event${noteCount === 1 ? "" : "s"}.`);
      this.statusLog.pass(`Save Project PASS: canonical MIDI payload is serialized for Workspace Manager save ownership with ${noteCount} editable note event${noteCount === 1 ? "" : "s"}.`);
    } catch (error) {
      this.statusLog.fail(`Save Project failed: ${error.message}`);
    }
  }

  resetSelectedSongEdits() {
    const song = this.selectedSong();
    if (!song) {
      this.statusLog.fail("Reset Song Edits failed: no MIDI song is selected.");
      return;
    }
    const baseline = this.importedSongBaselines.get(song.id);
    if (!baseline) {
      this.statusLog.fail(`Reset Song Edits failed: imported state is unavailable for ${song.name || song.id}.`);
      return;
    }
    const index = this.payload.songs.findIndex((candidate) => candidate.id === song.id);
    if (index < 0) {
      this.statusLog.fail(`Reset Song Edits failed: ${song.id} is not in the active MIDI payload.`);
      return;
    }
    this.stopPlayback({ log: false });
    this.payload.songs[index] = deepClone(baseline);
    this.render();
    this.applySelectedSongArrangement("Reset Song Edits");
    this.setDirtyState(false);
    this.statusLog.ok(`Reset Song Edits restored ${baseline.name || baseline.id} to imported manifest state.`);
  }

  async copyJson() {
    if (!this.payload) {
      this.statusLog.fail("Copy blocked: no MIDI Studio V2 payload is loaded.");
      return;
    }
    const toolState = this.serializer.createToolState(this.payload);
    const json = JSON.stringify(toolState, null, 2);
    this.details.showJson(toolState);
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      this.statusLog.warn("Clipboard API unavailable; JSON Details contains the MIDI Studio V2 toolState.");
      return;
    }
    try {
      await this.window.navigator.clipboard.writeText(json);
      this.statusLog.ok("MIDI Studio V2 toolState JSON copied.");
    } catch (error) {
      this.statusLog.fail(`Copy JSON failed: ${error.message}`);
    }
  }
}

export { TOOL_ID };
