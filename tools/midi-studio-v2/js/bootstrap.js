import { GameManifestLoader } from "../../../src/tools/common/GameManifestLoader.js";
import { MidiStudioV2App } from "./MidiStudioV2App.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { ActionNavControl } from "./controls/ActionNavControl.js";
import { DirectorPanelControl } from "./controls/DirectorPanelControl.js";
import { InstrumentGridControl } from "./controls/InstrumentGridControl.js";
import { MidiSourceDetailsControl } from "./controls/MidiSourceDetailsControl.js";
import { PlaybackControl } from "./controls/PlaybackControl.js";
import { RenderedExportActionsControl } from "./controls/RenderedExportActionsControl.js";
import { SongDetailsControl } from "./controls/SongDetailsControl.js";
import { SongListControl } from "./controls/SongListControl.js";
import { SongSheetControl } from "./controls/SongSheetControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { ToolShellControl } from "./controls/ToolShellControl.js";
import { InstrumentGridParser } from "../../../src/engine/audio/InstrumentGridParser.js";
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

window.addEventListener("DOMContentLoaded", () => {
  const statusLog = new StatusLogControl({
    clearButton: requireElement("#clearStatusButton"),
    log: requireElement("#statusLog")
  });
  const app = new MidiStudioV2App({
    accordions: Array.from(document.querySelectorAll(".accordion-v2"), (section) => new AccordionSection(section)),
    actionNav: new ActionNavControl({
      returnToWorkspaceButton: requireElement("#returnToWorkspaceButton"),
      toolCopyJsonButton: requireElement("#toolCopyJsonButton"),
      toolExportToolStateButton: requireElement("#toolExportToolStateButton"),
      toolImportManifestButton: requireElement("#toolImportManifestButton"),
      toolImportManifestInput: requireElement("#toolImportManifestInput"),
      toolNav: requireElement(".tool-starter__tool__menu"),
      useExampleButton: requireElement("#useExampleButton"),
      workspaceCopyManifestButton: requireElement("#workspaceCopyManifestButton"),
      workspaceExportManifestButton: requireElement("#workspaceExportManifestButton"),
      workspaceImportManifestButton: requireElement("#workspaceImportManifestButton"),
      workspaceNav: requireElement(".tool-starter__workspace__menu")
    }),
    details: new SongDetailsControl({
      details: requireElement("#songDetails"),
      instrumentSetField: requireElement("#instrumentSetField"),
      inspector: requireElement("#inspectorOutput"),
      renderedTargets: requireElement("#renderedTargets"),
      sourceField: requireElement("#songSourceField")
    }),
    directorPanel: new DirectorPanelControl({ panel: requireElement("#directorPanel") }),
    instrumentGrid: new InstrumentGridControl({
      bassInput: requireElement("#instrumentGridBassInput"),
      beatsInput: requireElement("#instrumentGridBeatsInput"),
      chordsInput: requireElement("#instrumentGridChordsInput"),
      drumsInput: requireElement("#instrumentGridDrumsInput"),
      generateArpeggioButton: requireElement("#generateArpeggioFromChordsButton"),
      generateBassButton: requireElement("#generateBassFromChordsButton"),
      generateDrumsButton: requireElement("#generateBasicDrumsButton"),
      generatePadButton: requireElement("#generatePadFromChordsButton"),
      gridOutput: requireElement("#instrumentGridOutput"),
      jumpToSectionButton: requireElement("#jumpToSectionButton"),
      laneTypeSelect: requireElement("#instrumentGridLaneTypeSelect"),
      leadInput: requireElement("#instrumentGridLeadInput"),
      loopEndSelect: requireElement("#instrumentGridLoopEndSelect"),
      loopStartSelect: requireElement("#instrumentGridLoopStartSelect"),
      normalizeButton: requireElement("#normalizeInstrumentGridButton"),
      padInput: requireElement("#instrumentGridPadInput"),
      playLoopButton: requireElement("#playLoopButton"),
      playSectionButton: requireElement("#playSectionButton"),
      sectionPresetButtons: Array.from(document.querySelectorAll(".midi-studio-v2__section-preset")),
      sectionSelect: requireElement("#instrumentGridSectionSelect"),
      sectionsInput: requireElement("#instrumentGridSectionsInput"),
      snapIndicator: requireElement("#instrumentGridSnapIndicator"),
      stopTimingPreviewButton: requireElement("#stopTimingPreviewButton"),
      subdivisionInput: requireElement("#instrumentGridSubdivisionInput"),
      summary: requireElement("#instrumentGridSummary"),
      transportState: requireElement("#instrumentGridTransportState"),
      windowRef: window
    }),
    instrumentGridParser: new InstrumentGridParser(),
    manifestLoader: new GameManifestLoader({ windowRef: window }),
    midiSourceDetails: new MidiSourceDetailsControl({
      details: requireElement("#midiSourceDetails"),
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
    renderedExportActions: new RenderedExportActionsControl({
      exportTargetTypeSelect: requireElement("#renderedExportTargetTypeSelect"),
      mp3Button: requireElement("#exportMp3Button"),
      oggButton: requireElement("#exportOggButton"),
      wavButton: requireElement("#exportWavButton")
    }),
    serializer: new MidiStudioStateSerializer(),
    shell: new ToolShellControl(),
    songList: new SongListControl({ list: requireElement("#songList") }),
    songSheet: new SongSheetControl({
      introInput: requireElement("#songSheetIntroInput"),
      keyInput: requireElement("#songSheetKeyInput"),
      loopInput: requireElement("#songSheetLoopInput"),
      parseButton: requireElement("#parseSongSheetButton"),
      parseRawButton: requireElement("#parseRawSongSheetButton"),
      rawInput: requireElement("#songSheetInput"),
      styleInput: requireElement("#songSheetStyleInput"),
      summary: requireElement("#songSheetSummary"),
      tempoInput: requireElement("#songSheetTempoInput")
    }),
    songSheetParser: new SongSheetParser(),
    statusLog,
    windowRef: window
  });

  window.__midiStudioV2App = app;
  void app.start();
});
