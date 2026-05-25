import { AudioSfxPlaygroundV2App } from "./AudioSfxPlaygroundV2App.js";
import { ActionNavControl } from "./controls/ActionNavControl.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { InspectorControl } from "./controls/InspectorControl.js";
import { SfxControlPanel } from "./controls/SfxControlPanel.js";
import { SfxPreviewControl } from "./controls/SfxPreviewControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { ToolShellControl } from "./controls/ToolShellControl.js";
import { AudioSfxEngine } from "./services/AudioSfxEngine.js";
import { ToolStateSerializer } from "./services/ToolStateSerializer.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required Audio / SFX Playground V2 element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  const accordions = Array.from(document.querySelectorAll(".accordion-v2"), (section) => new AccordionSection(section));
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
      toolNav: requireElement(".audio-sfx__tool__menu"),
      toolPlayButton: requireElement("#toolPlayButton"),
      workspaceCopyManifestButton: requireElement("#workspaceCopyManifestButton"),
      workspaceExportManifestButton: requireElement("#workspaceExportManifestButton"),
      workspaceImportManifestButton: requireElement("#workspaceImportManifestButton"),
      workspaceNav: requireElement(".audio-sfx__workspace__menu")
    }),
    audioEngine: new AudioSfxEngine({ windowRef: window }),
    controls: new SfxControlPanel({
      attackInput: requireElement("#attackInput"),
      attackValue: requireElement("#attackValue"),
      durationInput: requireElement("#durationInput"),
      durationValue: requireElement("#durationValue"),
      frequencyInput: requireElement("#frequencyInput"),
      frequencyValue: requireElement("#frequencyValue"),
      noiseInput: requireElement("#noiseInput"),
      pitchSweepInput: requireElement("#pitchSweepInput"),
      pitchSweepValue: requireElement("#pitchSweepValue"),
      presetSelect: requireElement("#presetSelect"),
      releaseInput: requireElement("#releaseInput"),
      releaseValue: requireElement("#releaseValue"),
      validationMessage: requireElement("#sfxValidationMessage"),
      volumeInput: requireElement("#volumeInput"),
      volumeValue: requireElement("#volumeValue"),
      waveformSelect: requireElement("#waveformSelect")
    }),
    inspector: new InspectorControl(requireElement("#inspectorOutput")),
    preview: new SfxPreviewControl(requireElement("#previewOutput")),
    serializer: new ToolStateSerializer(),
    shell: new ToolShellControl(),
    statusLog,
    windowRef: window
  });

  window.__audioSfxPlaygroundV2App = app;
  app.start();
});
