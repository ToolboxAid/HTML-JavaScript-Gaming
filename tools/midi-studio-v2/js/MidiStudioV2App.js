import { readFileText } from "../../../src/engine/persistence/FilePersistenceService.js";

const TOOL_ID = "midi-studio-v2";

const EXAMPLE_TOOL_STATE = {
  schema: "html-js-gaming.midi-studio-v2",
  toolId: TOOL_ID,
  version: 1,
  runtimePreference: "rendered",
  activeSongId: "demo-test-song",
  directorMode: { enabled: true, defaultIntensity: "medium" },
  songs: [
    {
      id: "demo-test-song",
      name: "Demo Test Song",
      sourceMidi: "assets/music/demo/demo-test-song.mid",
      instrumentSet: "General MIDI demo",
      rendered: {
        wav: "assets/music/demo/demo-test-song.wav",
        mp3: "assets/music/demo/demo-test-song.mp3",
        ogg: "assets/music/demo/demo-test-song.ogg"
      },
      defaultRuntimeFormat: "ogg",
      loop: { enabled: true, startSeconds: 0, endSeconds: 16 },
      director: {
        mood: "demo",
        intensity: "medium",
        usage: ["uat", "timing-preview"],
        notes: "Explicit demo data for manual MIDI Studio V2 testing."
      },
      tags: ["demo", "test"]
    },
    {
      id: "demo-missing-target",
      name: "Demo Missing Target",
      sourceMidi: "",
      instrumentSet: "General MIDI demo",
      rendered: {},
      defaultRuntimeFormat: "ogg",
      loop: { enabled: false },
      director: {
        mood: "debug",
        intensity: "low",
        usage: ["export-status"],
        notes: "Demo song for missing source and missing rendered target status."
      },
      tags: ["demo", "missing-target"]
    }
  ]
};

const EXAMPLE_GUIDED_SHEET = {
  intro: "Am F",
  key: "A minor",
  loop: "Am F C G",
  style: "retro-arcade",
  tempo: "132"
};

const EXAMPLE_GRID = {
  bass: "",
  beatsPerBar: "4",
  chords: "Am F C G | Am F C G | C G F Am",
  drums: "",
  lead: "",
  pad: "",
  previewInstruments: {
    bass: "synth-bass",
    chords: "warm-pad",
    drums: "basic-drums",
    lead: "retro-pulse-lead",
    pad: "ambient-pad"
  },
  sections: "intro:1, loop:1, victory:1",
  subdivision: "1"
};

export class MidiStudioV2App {
  constructor({
    accordions,
    actionNav,
    audioDiagnostics,
    details,
    directorPanel,
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
    songSheet,
    songSheetParser,
    statusLog,
    windowRef = window
  }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.audioDiagnostics = audioDiagnostics;
    this.details = details;
    this.directorPanel = directorPanel;
    this.instrumentGrid = instrumentGrid;
    this.instrumentGridParser = instrumentGridParser;
    this.lastInstrumentGridResult = null;
    this.lastSongSheetResult = null;
    this.manifestLoader = manifestLoader;
    this.midiSourceDetails = midiSourceDetails;
    this.midiSourceInspection = midiSourceInspection;
    this.payload = null;
    this.playback = playback;
    this.playbackControl = playbackControl;
    this.previewSynth = previewSynth;
    this.renderedExportActions = renderedExportActions;
    this.selectedSongId = "";
    this.serializer = serializer;
    this.shell = shell;
    this.songList = songList;
    this.songSheet = songSheet;
    this.songSheetParser = songSheetParser;
    this.statusLog = statusLog;
    this.window = windowRef;
  }

  async start() {
    this.shell.mount({ onExpandedChange: (isExpanded) => this.handleExpandedModeChange(isExpanded) });
    this.accordions.forEach((accordion) => accordion.mount());
    this.statusLog.mount();
    this.songList.mount({ onSelect: (songId) => this.selectSong(songId) });
    this.songSheet.mount({ onParse: (sourceText) => this.parseSongSheet(sourceText) });
    this.instrumentGrid.mount({
      onGenerate: (lane, input) => this.generateInstrumentLane(lane, input),
      onLaneSettingChange: (kind, detail) => this.handlePreviewLaneSettingChange(kind, detail),
      onNormalize: (input) => this.normalizeInstrumentGrid(input),
      onTransport: (action, detail) => this.handleInstrumentGridTransport(action, detail)
    });
    this.midiSourceDetails.mount({ onInspect: () => this.inspectSelectedSource() });
    this.playbackControl.mount({
      onPlay: () => this.playSelectedSong(),
      onStop: () => this.stopPlayback()
    });
    this.renderedExportActions.mount({ onExport: (format) => this.exportRenderedTarget(format) });
    this.actionNav.mount({
      onLoadExampleAndPlay: () => {
        void this.loadExampleAndPlay();
      },
      onStopAllAudio: () => this.stopAllAudio(),
      onToolCopyJson: () => this.copyJson(),
      onToolExportToolState: () => this.exportToolState(),
      onToolImportManifest: (file) => this.importManifestFile(file),
      onUseExample: () => this.useExampleToolState(),
      onWorkspaceCopyManifest: () => this.statusLog.info("Workspace copy is owned by Workspace Manager V2."),
      onWorkspaceExportManifest: () => this.statusLog.info("Workspace export is owned by Workspace Manager V2."),
      onWorkspaceImportManifest: () => this.statusLog.info("Workspace import is owned by Workspace Manager V2.")
    });
    this.renderEmpty();
    const loadResult = await this.manifestLoader.loadInitialManifest();
    if (loadResult.ok) {
      this.applyPayload(loadResult.manifest, loadResult.sourceLabel || "initial manifest");
    } else if (loadResult.skipped) {
      this.statusLog.info("No manifest or workspace toolState payload loaded. Import a manifest or launch from Workspace Manager V2.");
      this.statusLog.info("First-run guide: choose Use Example Test Song, or choose style/key/tempo and enter intro/loop chords.");
    } else {
      this.statusLog.fail(loadResult.message);
    }
  }

  renderEmpty() {
    this.payload = null;
    this.selectedSongId = "";
    this.songList.render([], "");
    this.details.render(null, null);
    this.directorPanel.render(null, {});
    this.midiSourceDetails.render(null);
    this.midiSourceDetails.setEnabled(false);
    this.songSheet.render(null);
    this.instrumentGrid.render(null);
    this.lastInstrumentGridResult = null;
    this.lastSongSheetResult = null;
    this.playbackControl.setSelected(null);
    this.actionNav.setToolActionsEnabled(false);
    this.updateAudioDiagnostics();
  }

  handleExpandedModeChange(isExpanded) {
    if (isExpanded) {
      this.statusLog.info("Entered expanded MIDI Studio workspace view. Header details are hidden; NAV, Status, and recovery actions remain available.");
      return;
    }
    this.statusLog.info("Exited expanded MIDI Studio workspace view. Header and details are visible.");
  }

  applyPayload(rawValue, sourceLabel) {
    const normalized = this.serializer.normalize(rawValue);
    if (!normalized.ok) {
      this.renderEmpty();
      this.statusLog.fail(`MIDI Studio V2 payload rejected before render from ${sourceLabel}: ${normalized.message}`);
      return false;
    }
    this.payload = normalized.payload;
    this.selectedSongId = this.payload.activeSongId;
    this.render();
    this.statusLog.ok(`Loaded ${this.payload.songs.length} MIDI song${this.payload.songs.length === 1 ? "" : "s"} from ${sourceLabel} via ${normalized.sourceKind}.`);
    this.statusLog.warn("Live MIDI synthesis not implemented. sourceMidi is musical instruction data; rendered OGG/MP3/WAV targets are used for preview and gameplay audio.");
    this.statusLog.info("Next: parse guided Song Sheet fields, generate lanes, normalize the grid, then test Preview Synth timing preview or export status.");
    return true;
  }

  render() {
    const song = this.selectedSong();
    this.songList.render(this.payload?.songs || [], this.selectedSongId);
    this.details.render(song, this.payload);
    this.directorPanel.render(song, this.payload?.directorMode || {});
    this.midiSourceDetails.render(null);
    this.midiSourceDetails.setEnabled(Boolean(song));
    this.playbackControl.setSelected(song);
    this.actionNav.setToolActionsEnabled(Boolean(this.payload));
    this.updateAudioDiagnostics();
  }

  selectedSong() {
    return (this.payload?.songs || []).find((song) => song.id === this.selectedSongId) || null;
  }

  selectSong(songId) {
    if (!this.payload?.songs.some((song) => song.id === songId)) {
      this.statusLog.fail(`Song selection failed: ${songId || "(missing song id)"} is not in the active MIDI payload.`);
      return;
    }
    this.stopPlayback();
    this.selectedSongId = songId;
    this.payload.activeSongId = songId;
    this.render();
    this.statusLog.ok(`Selected MIDI song: ${this.selectedSong()?.name || songId}.`);
    this.updateAudioDiagnostics();
  }

  async playSelectedSong() {
    const song = this.selectedSong();
    const result = await this.playback.playRenderedPreview(song, { loop: this.playbackControl.loopEnabled() });
    if (!result.ok) {
      this.playbackControl.setStopped(song);
      if (result.liveMidiNotImplemented) {
        this.statusLog.warn("Live MIDI synthesis not implemented.");
      }
      this.statusLog.fail(result.message);
      this.updateAudioDiagnostics();
      return;
    }
    this.playbackControl.setPlaying(song);
    this.statusLog.ok(`Rendered preview started for ${song.name}: ${result.path}.`);
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

  parseSongSheet(request) {
    const result = request?.ok === false ? request : this.songSheetParser.parse(request?.sourceText || request);
    this.songSheet.render(result);
    if (!result.ok) {
      this.lastSongSheetResult = null;
      this.statusLog.fail(`Song Sheet rejected: ${result.message}`);
      this.updateAudioDiagnostics();
      return;
    }
    this.lastSongSheetResult = result;
    if (result.warnings.length) {
      this.statusLog.warn(`Song Sheet parsed with warnings: ${result.warningSummary}`);
    }
    this.statusLog.ok(`Song Sheet parsed: ${result.sections.length} section${result.sections.length === 1 ? "" : "s"}, ${result.bars} bars, ${result.chordCount} chords.`);
    this.updateAudioDiagnostics();
  }

  normalizeInstrumentGrid(input) {
    const result = this.instrumentGridParser.parse(input);
    this.instrumentGrid.render(result);
    this.lastInstrumentGridResult = result.ok ? result : null;
    if (!result.ok) {
      this.statusLog.fail(`Instrument grid rejected: ${result.message}`);
      this.updateAudioDiagnostics();
      return;
    }
    if (result.warnings.length) {
      this.statusLog.warn(`Instrument grid normalized with warnings: ${result.warningSummary}`);
    }
    this.statusLog.ok(`Instrument grid normalized: ${result.sections.length} section${result.sections.length === 1 ? "" : "s"}, ${result.barCount} bars, ${result.eventCount} events.`);
    this.updateAudioDiagnostics();
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
    this.lastInstrumentGridResult = normalized.ok ? normalized : null;
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
    if (normalized.warnings.length) {
      this.statusLog.warn(`Instrument grid normalized with warnings: ${normalized.warningSummary}`);
    }
    this.statusLog.ok(generated.message);
    this.updateAudioDiagnostics();
  }

  async handleInstrumentGridTransport(action, detail = {}) {
    if (action === "invalid-section") {
      this.statusLog.fail(`Instrument grid section not found: ${detail.label}. Normalize a section map containing that label or choose a listed custom section.`);
      return;
    }
    if (action === "invalid-loop") {
      this.statusLog.fail(`Instrument grid loop rejected: ${detail.message}`);
      return;
    }
    if (action === "play-section") {
      return this.startPreviewSynth({
        endStep: detail.section.endStep,
        label: detail.section.label,
        loop: false,
        mode: "section",
        startStep: detail.section.startStep
      });
    }
    if (action === "play-loop") {
      return this.startPreviewSynth({
        endStep: detail.endSection.endStep,
        label: `${detail.startSection.label} to ${detail.endSection.label}`,
        loop: true,
        mode: "loop",
        startStep: detail.startSection.startStep
      });
    }
    if (action === "jump-section") {
      this.statusLog.ok(`Timing playhead jumped to section ${detail.section.label}.`);
      return;
    }
    if (action === "select-section") {
      this.statusLog.info(`Timing section selected: ${detail.section.label}.`);
      return;
    }
    if (action === "stop-preview") {
      const stoppedCount = this.previewSynth.stop();
      this.statusLog.ok(`Preview playback stopped. Cleared ${stoppedCount} scheduled oscillator${stoppedCount === 1 ? "" : "s"}.`);
      this.updateAudioDiagnostics();
    }
  }

  async startPreviewSynth({ endStep, label, loop, mode, startStep }) {
    const result = await this.previewSynth.playGridRange({
      endStep,
      grid: this.lastInstrumentGridResult,
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
    this.statusLog.ok(`Preview Synth started for ${mode} ${label} with ${result.eventCount} playable event${result.eventCount === 1 ? "" : "s"}.`);
    this.statusLog.info("Preview Synth uses temporary oscillator instruments for grid audition only; SoundFont playback is not implemented.");
    this.updateAudioDiagnostics();
    return true;
  }

  handlePreviewLaneSettingChange(kind, detail) {
    if (kind === "instrument") {
      if (!detail.instrumentValue) {
        this.statusLog.warn(`Missing preview instrument selection for ${detail.laneLabel}. Choose a Preview Synth instrument before playback.`);
        this.updateAudioDiagnostics();
        return;
      }
      this.statusLog.ok(`Preview instrument selected for ${detail.laneLabel}: ${detail.instrumentLabel}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "mute") {
      this.statusLog[detail.enabled ? "warn" : "info"](`Lane ${detail.enabled ? "muted" : "unmuted"}: ${detail.laneLabel}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "solo") {
      this.statusLog[detail.enabled ? "ok" : "info"](`Lane ${detail.enabled ? "soloed" : "solo cleared"}: ${detail.laneLabel}.`);
      this.updateAudioDiagnostics();
    }
  }

  previewTempoBpm() {
    const parsedTempo = Number(this.lastSongSheetResult?.tempo);
    return Number.isFinite(parsedTempo) && parsedTempo > 0 ? parsedTempo : 120;
  }

  exportRenderedTarget(format) {
    const song = this.selectedSong();
    const label = String(format || "").toUpperCase();
    if (!song) {
      this.statusLog.fail(`Missing MIDI song for ${label} export. Load or select a song before exporting.`);
      return;
    }
    const target = String(song.rendered?.[format] || "").trim();
    if (!target) {
      this.statusLog.fail(`Missing rendered ${label} export target for ${song.name}. Add music.songs[].rendered.${format} before exporting.`);
      return;
    }
    this.statusLog.warn(`Export rendering not implemented for ${label}. Planned target: ${target}.`);
  }

  useExampleToolState() {
    if (!this.prepareExampleToolState()) {
      return;
    }
    this.statusLog.info("Demo next step: click Play Section or Play Loop to hear Preview Synth audition audio, or use Load Example And Play for the one-click UAT path.");
  }

  async loadExampleAndPlay() {
    this.statusLog.ok("Load Example And Play started.");
    if (!this.prepareExampleToolState()) {
      this.statusLog.fail("Load Example And Play stopped because explicit demo data could not be loaded.");
      this.updateAudioDiagnostics();
      return;
    }
    this.statusLog.ok("Load Example And Play loaded explicit demo data.");
    this.statusLog.ok("Load Example And Play assigned Preview Synth instruments.");
    const section = this.instrumentGrid.selectedSection() || this.lastInstrumentGridResult?.sections?.[0] || null;
    if (!section) {
      this.statusLog.fail("Load Example And Play could not find a normalized section to preview.");
      this.updateAudioDiagnostics();
      return;
    }
    this.statusLog.ok(`Load Example And Play selected section: ${section.label}.`);
    const started = await this.startPreviewSynth({
      endStep: section.endStep,
      label: section.label,
      loop: false,
      mode: "section",
      startStep: section.startStep
    });
    if (!started) {
      this.statusLog.fail("Load Example And Play could not start audible Preview Synth playback.");
      this.updateAudioDiagnostics();
      return;
    }
    this.instrumentGrid.startTimingPreview({
      endStep: section.endStep,
      label: section.label,
      mode: "section",
      startStep: section.startStep
    });
    this.statusLog.ok("Load Example And Play started audible Preview Synth playback and moved the playhead.");
    this.updateAudioDiagnostics();
  }

  prepareExampleToolState() {
    if (!this.applyPayload(EXAMPLE_TOOL_STATE, "explicit demo toolState")) {
      return false;
    }
    this.songSheet.applyGuidedDefaults(EXAMPLE_GUIDED_SHEET);
    this.instrumentGrid.applyGridDefaults(EXAMPLE_GRID);
    this.statusLog.ok("Loaded explicit demo test song data. Demo paths are declared for UAT only; they are not hidden fallback assets.");
    this.parseSongSheet(this.songSheet.composeGuidedSheet());
    ["bass", "pad", "lead", "drums"].forEach((lane) => {
      const input = this.instrumentGrid.readInput();
      const laneText = String(input.lanes?.[lane] || "").trim();
      if (laneText) {
        return;
      }
      const generated = this.instrumentGridParser.generateLane(input, lane);
      if (!generated.ok) {
        this.statusLog.fail(`Demo lane generation rejected for ${lane}: ${generated.message}`);
        return;
      }
      this.instrumentGrid.applyGeneratedLane(generated);
      if (generated.warnings.length) {
        this.statusLog.warn(`Demo lane generation warnings for ${lane}: ${generated.warningSummary}`);
      }
      if (generated.skippedEmptyBars) {
        this.statusLog.warn(`Demo lane generation skipped ${generated.skippedEmptyBars} empty bar${generated.skippedEmptyBars === 1 ? "" : "s"} for ${lane}.`);
      }
      this.statusLog.ok(generated.message);
    });
    this.normalizeInstrumentGrid(this.instrumentGrid.readInput());
    const playable = this.playableEventSummary();
    if (playable.count > 0) {
      this.statusLog.ok(`Demo grid has ${playable.count} playable Preview Synth note${playable.count === 1 ? "" : "s"} after lane generation.`);
    } else {
      this.statusLog.fail("Demo grid has no playable Preview Synth notes after lane generation.");
    }
    this.updateAudioDiagnostics();
    return true;
  }

  stopPlayback() {
    this.playback.stop();
    this.previewSynth.stop();
    this.instrumentGrid.clearPreviewPlaybackLanes();
    this.playbackControl.setStopped(this.selectedSong());
    this.updateAudioDiagnostics();
  }

  stopAllAudio() {
    this.playback.stop();
    const stoppedCount = this.previewSynth.stop();
    this.instrumentGrid.stopPreviewUi();
    this.playbackControl.setStopped(this.selectedSong());
    this.statusLog.ok(`Stop All Audio completed. Cleared ${stoppedCount} scheduled oscillator${stoppedCount === 1 ? "" : "s"} and reset Preview Synth state.`);
    this.updateAudioDiagnostics();
  }

  playableEventSummary() {
    const section = this.instrumentGrid.selectedSection() || this.lastInstrumentGridResult?.sections?.[0] || null;
    if (!this.lastInstrumentGridResult?.ok || !section) {
      return { activeLanes: [], count: 0, warnings: [] };
    }
    const playable = this.previewSynth.playableEventsForRange(
      this.lastInstrumentGridResult,
      section.startStep,
      section.endStep,
      this.instrumentGrid.previewLaneSettings()
    );
    return {
      activeLanes: playable.activeLanes,
      count: playable.events.length,
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
      ["Muted lanes", laneDiagnostics.mutedLanes.length ? laneDiagnostics.mutedLanes.join(", ") : "none"],
      ["Soloed lanes", laneDiagnostics.soloedLanes.length ? laneDiagnostics.soloedLanes.join(", ") : "none"],
      ["Current preview instrument pack", packSummary || "none"],
      ["Last playback error", snapshot.lastError || "none"]
    ]);
  }

  async importManifestFile(file) {
    if (!file) {
      return;
    }
    try {
      this.applyPayload(JSON.parse(await readFileText(file)), `import:${file.name || "manifest.json"}`);
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
    this.details.showJson(toolState);
    this.statusLog.ok("MIDI Studio V2 toolState preview written to JSON Details.");
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
