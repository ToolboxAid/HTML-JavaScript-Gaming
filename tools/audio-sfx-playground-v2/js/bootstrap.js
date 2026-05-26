import { AudioSfxPlaygroundV2App } from "./AudioSfxPlaygroundV2App.js";
import { ActionNavControl } from "./controls/ActionNavControl.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { InspectorControl } from "./controls/InspectorControl.js";
import { SfxControlPanel } from "./controls/SfxControlPanel.js";
import { SfxPreviewControl } from "./controls/SfxPreviewControl.js";
import { SfxTileListControl } from "./controls/SfxTileListControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { ToolShellControl } from "./controls/ToolShellControl.js";
import { AudioSfxEngine } from "./services/AudioSfxEngine.js";
import { ToolStateSerializer } from "./services/ToolStateSerializer.js";
import { GameManifestLoader } from "../../../src/tools/common/GameManifestLoader.js";
import { notifyWorkspaceToolDirty } from "../../../src/tools/common/WorkspaceDirtyNotifier.js";

const TOOL_ID = "audio-sfx-playground-v2";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required Audio / SFX Playground V2 element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  const accordions = Array.from(document.querySelectorAll(".accordion-v2"), (section) => new AccordionSection(section));
  const serializer = new ToolStateSerializer();
  const statusLog = new StatusLogControl({
    log: requireElement("#statusLog"),
    clearButton: requireElement("#clearStatusButton")
  });
  const app = new AudioSfxPlaygroundV2App({
    accordions,
    actionNav: new ActionNavControl({
      returnToWorkspaceButton: requireElement("#returnToWorkspaceButton"),
      toolCopyJsonButton: requireElement("#toolCopyJsonButton"),
      toolExportToolStateButton: requireElement("#toolExportToolStateButton"),
      toolImportJsonButton: requireElement("#toolImportJsonButton"),
      toolImportJsonInput: requireElement("#toolImportJsonInput"),
      toolNav: requireElement(".tool-starter__tool__menu"),
      toolPlayButton: requireElement("#toolPlayButton"),
      toolStopButton: requireElement("#toolStopButton"),
      workspaceCopyManifestButton: requireElement("#workspaceCopyManifestButton"),
      workspaceExportManifestButton: requireElement("#workspaceExportManifestButton"),
      workspaceImportManifestButton: requireElement("#workspaceImportManifestButton"),
      workspaceNav: requireElement(".tool-starter__workspace__menu")
    }),
    audioEngine: new AudioSfxEngine({ windowRef: window }),
    controls: new SfxControlPanel({
      addButton: requireElement("#addSfxButton"),
      attackInput: requireElement("#attackInput"),
      attackValue: requireElement("#attackValue"),
      durationInput: requireElement("#durationInput"),
      durationValue: requireElement("#durationValue"),
      frequencyInput: requireElement("#frequencyInput"),
      frequencyValue: requireElement("#frequencyValue"),
      deleteButton: requireElement("#deleteSfxButton"),
      nameInput: requireElement("#nameInput"),
      noiseAmountInput: requireElement("#noiseAmountInput"),
      noiseAmountValue: requireElement("#noiseAmountValue"),
      noiseDecayInput: requireElement("#noiseDecayInput"),
      noiseDecayValue: requireElement("#noiseDecayValue"),
      noiseFilterInput: requireElement("#noiseFilterInput"),
      noiseFilterValue: requireElement("#noiseFilterValue"),
      noiseInput: requireElement("#noiseInput"),
      playbackModeSelect: requireElement("#playbackModeSelect"),
      pitchSweepInput: requireElement("#pitchSweepInput"),
      pitchSweepValue: requireElement("#pitchSweepValue"),
      releaseInput: requireElement("#releaseInput"),
      releaseValue: requireElement("#releaseValue"),
      renameButton: requireElement("#renameSfxButton"),
      settingsHelper: requireElement("#settingsHelper"),
      styleDescription: requireElement("#styleDescription"),
      styleExamples: requireElement("#styleExamples"),
      styleProfileSelect: requireElement("#styleProfileSelect"),
      validationMessage: requireElement("#sfxValidationMessage"),
      volumeInput: requireElement("#volumeInput"),
      volumeValue: requireElement("#volumeValue"),
      waveformSelect: requireElement("#waveformSelect")
    }),
    inspector: new InspectorControl(requireElement("#inspectorOutput")),
    manifestLoader: new GameManifestLoader({ windowRef: window }),
    preview: new SfxPreviewControl(requireElement("#previewOutput")),
    serializer,
    shell: new ToolShellControl(),
    statusLog,
    tileList: new SfxTileListControl({
      list: requireElement("#sfxTileList")
    }),
    workspaceDirtyNotifier: (payload, options) => notifyWorkspaceToolDirty({
      ...options,
      payload,
      toolId: TOOL_ID,
      windowRef: window
    }),
    windowRef: window
  });

  window.__audioSfxPlaygroundV2App = app;
  app.start();
});
