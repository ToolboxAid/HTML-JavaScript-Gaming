import { GameManifestLoader } from "../../../src/tools/common/GameManifestLoader.js";
import { MidiStudioV2App } from "./MidiStudioV2App.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { ActionNavControl } from "./controls/ActionNavControl.js";
import { AudioDiagnosticsControl } from "./controls/AudioDiagnosticsControl.js";
import { DirectorPanelControl } from "./controls/DirectorPanelControl.js";
import { ExportPanelControl } from "./controls/ExportPanelControl.js";
import { FutureControlsControl } from "./controls/FutureControlsControl.js";
import { InstrumentGridControl } from "./controls/InstrumentGridControl.js";
import { MidiSourceDetailsControl } from "./controls/MidiSourceDetailsControl.js";
import { PlaybackControl } from "./controls/PlaybackControl.js";
import { RenderedExportActionsControl } from "./controls/RenderedExportActionsControl.js";
import { SongDetailsControl } from "./controls/SongDetailsControl.js";
import { SongListControl } from "./controls/SongListControl.js";
import { SongSetupControl } from "./controls/SongSetupControl.js";
import { SongSheetControl } from "./controls/SongSheetControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { StudioTabsControl } from "./controls/StudioTabsControl.js";
import { ToolShellControl } from "./controls/ToolShellControl.js";
import { InstrumentGridParser } from "../../../src/engine/audio/InstrumentGridParser.js";
import { PreviewSynthEngine } from "../../../src/engine/audio/PreviewSynthEngine.js";
import { SongSheetParser } from "../../../src/engine/audio/SongSheetParser.js";
import { MidiPlaybackService } from "./services/MidiPlaybackService.js";
import { MidiSourceInspectionService } from "./services/MidiSourceInspectionService.js";
import { MidiStudioStateSerializer } from "./services/MidiStudioStateSerializer.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required MIDI Studio V2 element: ${selector}`);
  }
  return element;
}

function optionalElement(selector) {
  return document.querySelector(selector);
}

window.addEventListener("DOMContentLoaded", () => {
  const statusLog = new StatusLogControl({
    clearButton: requireElement("#clearStatusButton"),
    log: requireElement("#statusLog")
  });
  const futureControls = new FutureControlsControl({
    controls: Array.from(document.querySelectorAll("[data-midi-studio-future-control]"))
  });
  futureControls.mount();
  const app = new MidiStudioV2App({
    accordions: Array.from(document.querySelectorAll(".accordion-v2"), (section) => new AccordionSection(section)),
    actionNav: new ActionNavControl({
      nowPlayingLabel: requireElement("#nowPlayingLabel"),
      projectDirtyState: requireElement("#projectDirtyState"),
      returnToWorkspaceButton: requireElement("#returnToWorkspaceButton"),
      resetSongEditsButton: requireElement("#resetSongEditsButton"),
      saveProjectButton: requireElement("#saveProjectButton"),
      stopAllAudioButton: requireElement("#stopAllAudioButton"),
      toolCopyJsonButton: requireElement("#toolCopyJsonButton"),
      toolExportToolStateButton: requireElement("#toolExportToolStateButton"),
      toolImportManifestButton: requireElement("#toolImportManifestButton"),
      toolImportManifestInput: requireElement("#toolImportManifestInput"),
      toolNav: requireElement(".tool-starter__tool__menu"),
      workspaceCopyManifestButton: requireElement("#workspaceCopyManifestButton"),
      workspaceExportManifestButton: requireElement("#workspaceExportManifestButton"),
      workspaceImportManifestButton: requireElement("#workspaceImportManifestButton"),
      workspaceNav: requireElement(".tool-starter__workspace__menu")
    }),
    audioDiagnostics: new AudioDiagnosticsControl({ details: requireElement("#audioDiagnostics") }),
    details: new SongDetailsControl({
      applyClassificationExampleButton: requireElement("#applyClassificationExampleButton"),
      classificationExampleSelect: requireElement("#classificationExampleSelect"),
      classificationLibrarySummary: requireElement("#classificationLibrarySummary"),
      details: requireElement("#songDetails"),
      gameUsageCustomInput: requireElement("#gameUsageCustomInput"),
      gameUsageInputs: Array.from(document.querySelectorAll("[data-game-usage-option]")),
      gameUsageSummary: requireElement("#gameUsageSummary"),
      generatedIdPreview: requireElement("#generatedIdPreview"),
      instrumentSetField: requireElement("#instrumentSetField"),
      inspector: requireElement("#inspectorOutput"),
      notesDetails: requireElement("#songDetailNotes"),
      renderedTargets: requireElement("#renderedTargets"),
      sectionsLoopDetails: requireElement("#songSectionsLoopDetails"),
      sourceField: requireElement("#songSourceField")
    }),
    directorPanel: new DirectorPanelControl({ panel: requireElement("#directorPanel") }),
    exportPanel: new ExportPanelControl({
      diagnosticTargets: requireElement("#renderedTargetDiagnostics"),
      manifestDetails: requireElement("#exportManifestReadinessDetails"),
      renderedTargets: requireElement("#renderedTargets"),
      sourceDetails: requireElement("#exportRenderSource"),
      statusDetails: requireElement("#exportStatusDetails")
    }),
    instrumentGrid: new InstrumentGridControl({
      addInstrumentButton: requireElement("#addInstrumentRowButton"),
      auditionKeyboard: requireElement("#instrumentAuditionKeyboard"),
      bassInput: requireElement("#instrumentGridBassInput"),
      beatsInput: requireElement("#instrumentGridBeatsInput"),
      chordsInput: requireElement("#instrumentGridChordsInput"),
      closeInstrumentPanelButton: requireElement("#closeInstrumentPanelButton"),
      drumsInput: requireElement("#instrumentGridDrumsInput"),
      duplicateInstrumentButton: requireElement("#duplicateInstrumentRowButton"),
      duplicateInstrumentPresetButton: requireElement("#duplicateInstrumentPresetButton"),
      generateArpeggioButton: requireElement("#generateArpeggioFromChordsButton"),
      generateBassButton: requireElement("#generateBassFromChordsButton"),
      generateDrumsButton: requireElement("#generateBasicDrumsButton"),
      generatePadButton: requireElement("#generatePadFromChordsButton"),
      gridOutput: requireElement("#instrumentGridOutput"),
      instrumentEditor: requireElement("#selectedInstrumentEditor"),
      instrumentList: requireElement("#instrumentList"),
      instrumentPresetSelect: requireElement("#instrumentPresetSelect"),
      instrumentPresetSummary: requireElement("#instrumentPresetSummary"),
      instrumentGridZoomInButton: requireElement("#instrumentGridZoomInButton"),
      instrumentGridZoomOutButton: requireElement("#instrumentGridZoomOutButton"),
      jumpToSectionButton: requireElement("#jumpToSectionButton"),
      laneTypeSelect: requireElement("#instrumentGridLaneTypeSelect"),
      leadInput: requireElement("#instrumentGridLeadInput"),
      loadInstrumentPresetButton: requireElement("#loadInstrumentPresetButton"),
      loopEndSelect: requireElement("#instrumentGridLoopEndSelect"),
      loopStartSelect: requireElement("#instrumentGridLoopStartSelect"),
      moveInstrumentDownButton: requireElement("#moveInstrumentDownButton"),
      moveInstrumentUpButton: requireElement("#moveInstrumentUpButton"),
      normalizeButton: requireElement("#normalizeInstrumentGridButton"),
      padInput: requireElement("#instrumentGridPadInput"),
      playLoopButton: requireElement("#playLoopButton"),
      playSectionButton: requireElement("#playSectionButton"),
      playSequenceButton: requireElement("#playSequenceButton"),
      quickInstrumentList: requireElement("#timelineInstrumentQuickList"),
      saveInstrumentPresetButton: requireElement("#saveInstrumentPresetButton"),
      sectionAvailability: requireElement("#instrumentGridSectionAvailability"),
      sectionPresetButtons: Array.from(document.querySelectorAll(".midi-studio-v2__section-preset")),
      sectionSelect: requireElement("#instrumentGridSectionSelect"),
      selectionDetails: requireElement("#timelineSelectionDetails"),
      sectionsInput: requireElement("#instrumentGridSectionsInput"),
      snapIndicator: requireElement("#instrumentGridSnapIndicator"),
      stopTimingPreviewButton: requireElement("#stopTimingPreviewButton"),
      subdivisionInput: requireElement("#instrumentGridSubdivisionInput"),
      summary: requireElement("#instrumentGridSummary"),
      timelineAddInstrumentButton: requireElement("#timelineAddInstrumentRowButton"),
      timelineCloseInstrumentPanelButton: requireElement("#timelineCloseInstrumentPanelButton"),
      transportState: requireElement("#instrumentGridTransportState"),
      windowRef: window
    }),
    instrumentGridParser: new InstrumentGridParser(),
    manifestLoader: new GameManifestLoader({ windowRef: window }),
    midiSourceDetails: new MidiSourceDetailsControl({
      details: requireElement("#midiSourceDetails"),
      importButton: requireElement("#importMidiSourceButton"),
      input: requireElement("#midiSourceFileInput"),
      inspectButton: requireElement("#inspectMidiSourceButton")
    }),
    midiSourceInspection: new MidiSourceInspectionService(),
    playback: new MidiPlaybackService(),
    playbackControl: new PlaybackControl({
      loopToggle: requireElement("#loopToggle"),
      playButton: requireElement("#playButton"),
      stateOutput: requireElement("#playbackState"),
      stopButton: requireElement("#stopButton")
    }),
    previewSynth: new PreviewSynthEngine({ windowRef: window }),
    renderedExportActions: new RenderedExportActionsControl({
      exportTargetTypeLabel: requireElement('label[for="renderedExportTargetTypeSelect"]'),
      exportTargetTypeSelect: requireElement("#renderedExportTargetTypeSelect"),
      saveButton: requireElement("#renderedExportSaveButton")
    }),
    serializer: new MidiStudioStateSerializer(),
    shell: new ToolShellControl(),
    songList: new SongListControl({
      duplicateSongButton: requireElement("#duplicateSongButton"),
      librarySelect: requireElement("#songLibrarySelect"),
      librarySummary: requireElement("#songLibrarySummary"),
      list: requireElement("#songList"),
      loadSongButton: requireElement("#loadSongButton"),
      saveSongButton: requireElement("#saveSongButton")
    }),
    songSetup: new SongSetupControl({ addSongButton: requireElement("#addSongButton") }),
    songSheet: new SongSheetControl({
      addCustomSectionButton: requireElement("#songSheetAddCustomSectionButton"),
      addSequenceButton: requireElement("#songSheetAddSectionToSequenceButton"),
      applyArrangementTemplateButton: requireElement("#songSheetApplyArrangementTemplateButton"),
      applyBassInput: requireElement("#songSheetApplyBassInput"),
      applyChordsPadInput: requireElement("#songSheetApplyChordsPadInput"),
      applyDrumsInput: requireElement("#songSheetApplyDrumsInput"),
      applyLeadInput: requireElement("#songSheetApplyLeadInput"),
      applyTemplateButton: requireElement("#songSheetApplySectionTemplateButton"),
      arrangementTemplateSelect: requireElement("#songSheetArrangementTemplateSelect"),
      arrangementTemplateSummary: requireElement("#songSheetArrangementTemplateSummary"),
      availableCount: requireElement("#songSheetAvailableCount"),
      availableSectionsList: requireElement("#songSheetAvailableSectionsList"),
      classificationGuide: requireElement("#songSheetClassificationGuide"),
      customSectionsInput: requireElement("#songSheetCustomSectionsInput"),
      duplicateSectionButton: requireElement("#songSheetDuplicateSectionButton"),
      duplicateSequenceButton: requireElement("#songSheetDuplicateSequenceButton"),
      keyInput: requireElement("#songSheetKeyInput"),
      loadSectionButton: requireElement("#songSheetLoadSectionButton"),
      moveSequenceDownButton: requireElement("#songSheetSequenceMoveDownButton"),
      moveSequenceUpButton: requireElement("#songSheetSequenceMoveUpButton"),
      namedSectionInputs: {
        Bridge: requireElement("#songSheetSectionBridgeInput"),
        Chorus: requireElement("#songSheetSectionChorusInput"),
        Intro: requireElement("#songSheetSectionIntroInput"),
        Outro: requireElement("#songSheetSectionOutroInput"),
        Verse: requireElement("#songSheetSectionVerseInput")
      },
      parseButton: requireElement("#parseSongSheetButton"),
      regenerateButton: requireElement("#regenerateArrangementButton"),
      removeSequenceButton: requireElement("#songSheetSequenceRemoveButton"),
      saveSectionButton: requireElement("#songSheetSaveSectionButton"),
      sequenceCount: requireElement("#songSheetSequenceCount"),
      sequenceInput: requireElement("#songSheetSequenceInput"),
      sequenceList: requireElement("#songSheetSequenceList"),
      sequenceSummary: requireElement("#songSheetSequenceSummary"),
      sectionLibrarySelect: requireElement("#songSheetSectionLibrarySelect"),
      sectionLibrarySummary: requireElement("#songSheetSectionLibrarySummary"),
      sectionMetricOutputs: {
        Bridge: requireElement("#songSheetSectionBridgeMetrics"),
        Chorus: requireElement("#songSheetSectionChorusMetrics"),
        Intro: requireElement("#songSheetSectionIntroMetrics"),
        Outro: requireElement("#songSheetSectionOutroMetrics"),
        Verse: requireElement("#songSheetSectionVerseMetrics")
      },
      sectionsInput: requireElement("#songSheetSectionsInput"),
      styleInput: requireElement("#songSheetStyleInput"),
      summary: optionalElement("#songSheetSummary"),
      templatePreview: requireElement("#songSheetTemplatePreview"),
      templateSectionSelect: requireElement("#songSheetTemplateSectionSelect"),
      tempoInput: requireElement("#songSheetTempoInput"),
      customSectionMetrics: requireElement("#songSheetCustomSectionMetrics"),
      warnings: optionalElement("#songSheetWarningsDetails")
    }),
    songSheetParser: new SongSheetParser(),
    statusLog,
    studioTabs: new StudioTabsControl({
      buttons: Array.from(document.querySelectorAll("[data-midi-studio-tab]")),
      defaultTab: "song-setup",
      panels: Array.from(document.querySelectorAll("[data-midi-studio-tab-panel]"))
    }),
    windowRef: window
  });

  window.__midiStudioV2App = app;
  void app.start();
});
