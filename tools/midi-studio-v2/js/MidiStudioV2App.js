import { readFileText } from "../../../src/engine/persistence/FilePersistenceService.js";

const TOOL_ID = "midi-studio-v2";

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
    studioTabs,
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
    this.studioTabs = studioTabs;
    this.window = windowRef;
  }

  async start() {
    this.shell.mount({ onExpandedChange: (isExpanded) => this.handleExpandedModeChange(isExpanded) });
    this.studioTabs?.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.statusLog.mount();
    this.songList.mount({ onSelect: (songId) => this.selectSong(songId) });
    this.details.mount({ onChange: (field, value) => this.handleSongDetailsChange(field, value) });
    this.songSheet.mount({ onParse: (sourceText) => this.parseSongSheet(sourceText) });
    this.instrumentGrid.mount({
      onGenerate: (lane, input) => this.generateInstrumentLane(lane, input),
      onLaneSettingChange: (kind, detail) => this.handlePreviewLaneSettingChange(kind, detail),
      onNormalize: (input) => this.normalizeInstrumentGrid(input),
      onNoteEdit: (input, detail) => this.syncEditedInstrumentGrid(input, detail),
      onTransport: (action, detail) => this.handleInstrumentGridTransport(action, detail)
    });
    this.midiSourceDetails.mount({ onInspect: () => this.inspectSelectedSource() });
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
      this.statusLog.info("First-run guide: choose Import JSON Manifest, select a song, then press Play.");
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
    this.selectedSongId = this.payload.activeSongId;
    this.render();
    this.applySelectedSongArrangement("active manifest song");
    this.statusLog.ok(`Loaded ${this.payload.songs.length} MIDI song${this.payload.songs.length === 1 ? "" : "s"} from ${sourceLabel} via ${normalized.sourceKind}.`);
    this.statusLog.info("Next: select a MIDI Studio song, review the Studio tab timeline, then press Play to audition the imported arrangement.");
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
      this.songList.render(this.payload?.songs || [], this.selectedSongId);
      this.playbackControl.setSelected(song);
      this.actionNav.setNowPlaying(song);
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
    }
    this.details.showJson(song);
    this.statusLog.info(`Edited selected song detail: ${field}.`);
    this.updateAudioDiagnostics();
  }

  syncSongSheetFields(arrangement) {
    this.songSheet.applyGuidedDefaults({
      intro: this.songSheet.introInput.value,
      key: arrangement.key,
      loop: this.songSheet.loopInput.value,
      style: arrangement.style,
      tempo: arrangement.tempo
    });
  }

  selectedSong() {
    return (this.payload?.songs || []).find((song) => song.id === this.selectedSongId) || null;
  }

  selectSong(songId) {
    if (!this.payload?.songs.some((song) => song.id === songId)) {
      this.statusLog.fail(`Song selection failed: ${songId || "(missing song id)"} is not in the active MIDI payload.`);
      return;
    }
    this.stopPlayback({ log: false });
    this.selectedSongId = songId;
    this.payload.activeSongId = songId;
    this.render();
    this.applySelectedSongArrangement("selected song");
    this.statusLog.ok(`Selected MIDI song: ${this.selectedSong()?.name || songId}.`);
    this.updateAudioDiagnostics();
  }

  async playSelectedSong() {
    const song = this.selectedSong();
    if (song?.studioArrangement) {
      return this.playSelectedArrangement(song);
    }
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
    this.actionNav.setNowPlaying(song, { playing: true });
    this.statusLog.ok(`Rendered preview started for ${song.name}: ${result.path}.`);
    this.updateAudioDiagnostics();
  }

  async playSelectedArrangement(song) {
    this.playback.stop();
    if (!this.lastInstrumentGridResult?.ok) {
      const arranged = this.applySelectedSongArrangement("play request");
      if (!arranged) {
        this.playbackControl.setStopped(song);
        this.updateAudioDiagnostics();
        return;
      }
    }
    const section = this.instrumentGrid.selectedSection() || this.lastInstrumentGridResult?.sections?.[0] || null;
    if (!section) {
      this.playbackControl.setStopped(song);
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
      this.playbackControl.setStopped(song);
      this.actionNav.setNowPlaying(song);
      return;
    }
    this.instrumentGrid.startTimingPreview({
      endStep: section.endStep,
      label: section.label,
      mode: "section",
      startStep: section.startStep
    });
    this.playbackControl.setPlaying(song);
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

  parseSongSheet(request, { updateGrid = true } = {}) {
    const result = request?.ok === false ? request : this.songSheetParser.parse(request?.sourceText || request);
    this.songSheet.render(result);
    if (!result.ok) {
      this.lastSongSheetResult = null;
      this.statusLog.fail(`Song Sheet rejected: ${result.message}`);
      this.updateAudioDiagnostics();
      return;
    }
    this.lastSongSheetResult = result;
    this.instrumentGrid.setPreviewTempoBpm(result.tempo);
    if (result.warnings.length) {
      this.statusLog.warn(`Song Sheet parsed with warnings: ${result.warningSummary}`);
    }
    this.statusLog.ok(`Song Sheet parsed: ${result.sections.length} section${result.sections.length === 1 ? "" : "s"}, ${result.bars} bars, ${result.chordCount} chords.`);
    if (updateGrid) {
      this.applySongSheetToGrid(result);
    }
    this.updateAudioDiagnostics();
  }

  applySongSheetToGrid(result) {
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
    this.instrumentGrid.applyGridDefaults({
      bass: "",
      beatsPerBar,
      chords,
      drums: "",
      lead: "",
      pad: "",
      previewInstruments: this.instrumentGrid.previewLaneSettings().instruments,
      sections,
      subdivision: "1"
    });
    ["bass", "pad", "lead", "drums"].forEach((lane) => {
      const generated = this.instrumentGridParser.generateLane(this.instrumentGrid.readInput(), lane);
      if (generated.ok) {
        this.instrumentGrid.applyGeneratedLane(generated);
      }
    });
    this.normalizeInstrumentGrid(this.instrumentGrid.readInput());
    this.statusLog.ok("Song Sheet updated the editable note grid.");
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

  syncEditedInstrumentGrid(input, detail = {}) {
    const result = this.instrumentGridParser.parse(input);
    if (!result.ok) {
      this.statusLog.fail(`Instrument note edit rejected: ${result.message}`);
      this.updateAudioDiagnostics();
      return;
    }
    this.lastInstrumentGridResult = result;
    this.instrumentGrid.syncEditedGridResult(result);
    this.statusLog.ok(`Edited ${detail.laneLabel || "instrument"} note cell; playback data updated.`);
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
    this.statusLog.warn("Preview Synth is an approximate Web Audio audition; SoundFont and real instrument playback are not implemented.");
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
      return;
    }
    if (kind === "volume") {
      this.statusLog.info(`Lane volume set for ${detail.laneLabel}: ${detail.value}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "pan") {
      this.statusLog.info(`Lane pan set for ${detail.laneLabel}: ${detail.value}.`);
      this.updateAudioDiagnostics();
      return;
    }
    if (kind === "select") {
      this.statusLog.info(`Selected instrument lane: ${detail.laneLabel}.`);
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

  applySelectedSongArrangement(sourceLabel) {
    const song = this.selectedSong();
    const arrangement = song?.studioArrangement || null;
    if (!song) {
      this.instrumentGrid.render(null);
      this.lastInstrumentGridResult = null;
      this.lastSongSheetResult = null;
      return false;
    }
    if (!arrangement) {
      this.instrumentGrid.render(null);
      this.lastInstrumentGridResult = null;
      this.lastSongSheetResult = null;
      this.statusLog.warn(`No editable studio arrangement is declared for ${song.name}. Import a manifest song with music.songs[].studioArrangement before using Play as an audible Preview Synth workflow.`);
      this.updateAudioDiagnostics();
      return false;
    }
    this.songSheet.applyGuidedDefaults({
      intro: arrangement.songSheet?.intro || arrangement.lanes.chords,
      key: arrangement.key,
      loop: arrangement.songSheet?.loop || arrangement.lanes.chords,
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
    this.playback.stop();
    const stoppedCount = this.previewSynth.stop();
    this.instrumentGrid.stopPreviewUi();
    this.playbackControl.setStopped(this.selectedSong());
    this.actionNav.setNowPlaying(this.selectedSong());
    if (log) {
      this.statusLog.ok(`Stop completed. Cleared ${stoppedCount} scheduled oscillator${stoppedCount === 1 ? "" : "s"} and stopped all MIDI Studio preview audio.`);
    }
    this.updateAudioDiagnostics();
  }

  stopAllAudio() {
    this.playback.stop();
    const stoppedCount = this.previewSynth.stop();
    this.instrumentGrid.stopPreviewUi();
    this.playbackControl.setStopped(this.selectedSong());
    this.actionNav.setNowPlaying(this.selectedSong());
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
