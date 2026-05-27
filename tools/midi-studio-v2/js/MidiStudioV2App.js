import { readFileText } from "../../../src/engine/persistence/FilePersistenceService.js";

const TOOL_ID = "midi-studio-v2";

export class MidiStudioV2App {
  constructor({
    accordions,
    actionNav,
    details,
    directorPanel,
    manifestLoader,
    midiSourceDetails,
    midiSourceInspection,
    playback,
    playbackControl,
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
    this.details = details;
    this.directorPanel = directorPanel;
    this.manifestLoader = manifestLoader;
    this.midiSourceDetails = midiSourceDetails;
    this.midiSourceInspection = midiSourceInspection;
    this.payload = null;
    this.playback = playback;
    this.playbackControl = playbackControl;
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
    this.shell.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.statusLog.mount();
    this.songList.mount({ onSelect: (songId) => this.selectSong(songId) });
    this.songSheet.mount({ onParse: (sourceText) => this.parseSongSheet(sourceText) });
    this.midiSourceDetails.mount({ onInspect: () => this.inspectSelectedSource() });
    this.playbackControl.mount({
      onPlay: () => this.playSelectedSong(),
      onStop: () => this.stopPlayback()
    });
    this.renderedExportActions.mount({ onExport: (format) => this.exportRenderedTarget(format) });
    this.actionNav.mount({
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
    this.playbackControl.setSelected(null);
    this.actionNav.setToolActionsEnabled(false);
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
      return;
    }
    this.playbackControl.setPlaying(song);
    this.statusLog.ok(`Rendered preview started for ${song.name}: ${result.path}.`);
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
      this.statusLog.fail(`Song Sheet rejected: ${result.message}`);
      return;
    }
    if (result.warnings.length) {
      this.statusLog.warn(`Song Sheet parsed with warnings: ${result.warningSummary}`);
    }
    this.statusLog.ok(`Song Sheet parsed: ${result.sections.length} section${result.sections.length === 1 ? "" : "s"}, ${result.bars} bars, ${result.chordCount} chords.`);
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

  stopPlayback() {
    this.playback.stop();
    this.playbackControl.setStopped(this.selectedSong());
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
