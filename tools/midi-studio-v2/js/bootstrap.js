import { GameManifestLoader } from "../../../src/tools/common/GameManifestLoader.js";
import { MidiStudioV2App } from "./MidiStudioV2App.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { ActionNavControl } from "./controls/ActionNavControl.js";
import { DirectorPanelControl } from "./controls/DirectorPanelControl.js";
import { PlaybackControl } from "./controls/PlaybackControl.js";
import { SongDetailsControl } from "./controls/SongDetailsControl.js";
import { SongListControl } from "./controls/SongListControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { ToolShellControl } from "./controls/ToolShellControl.js";
import { MidiPlaybackService } from "./services/MidiPlaybackService.js";
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
    manifestLoader: new GameManifestLoader({ windowRef: window }),
    playback: new MidiPlaybackService(),
    playbackControl: new PlaybackControl({
      loopToggle: requireElement("#loopToggle"),
      playButton: requireElement("#playButton"),
      stateOutput: requireElement("#playbackState"),
      stopButton: requireElement("#stopButton")
    }),
    serializer: new MidiStudioStateSerializer(),
    shell: new ToolShellControl(),
    songList: new SongListControl({ list: requireElement("#songList") }),
    statusLog,
    windowRef: window
  });

  window.__midiStudioV2App = app;
  void app.start();
});
