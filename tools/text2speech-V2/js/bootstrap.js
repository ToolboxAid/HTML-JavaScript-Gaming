import { mountAccordionV2 } from "../../../src/engine/theme/accordionV2/accordionV2.js";
import { TextToSpeechEngine } from "../../../src/engine/audio/TextToSpeechEngine.js";
import { TextToSpeechToolApp } from "./TextToSpeechToolApp.js";
import { ActionNavControl } from "./controls/ActionNavControl.js";
import { OutputSummaryControl } from "./controls/OutputSummaryControl.js";
import { QueueControl } from "./controls/QueueControl.js";
import { SpeechOptionsControl } from "./controls/SpeechOptionsControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { TextToSpeechShellControl } from "./controls/TextToSpeechShellControl.js";
import { TextInputControl } from "./controls/TextInputControl.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required text2speech-V2 element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  mountAccordionV2(document);
  const app = new TextToSpeechToolApp({
    actionNav: new ActionNavControl({
      pauseButtons: [requireElement("#text2speech-V2PauseButton")],
      returnToWorkspaceButton: requireElement("#returnToWorkspaceButton"),
      resumeButtons: [requireElement("#text2speech-V2ResumeButton")],
      speakButtons: [requireElement("#text2speech-V2SpeakButton")],
      stopButtons: [requireElement("#text2speech-V2StopButton")],
      toolCopyJsonButton: requireElement("#text2speech-V2CopyJsonButton"),
      toolExportJsonButton: requireElement("#text2speech-V2ExportJsonButton"),
      toolImportJsonButton: requireElement("#text2speech-V2ImportJsonButton"),
      toolImportJsonInput: requireElement("#text2speech-V2ImportJsonInput"),
      toolNav: requireElement('[data-launch-mode-nav="tool"]'),
      workspaceNav: requireElement('[data-launch-mode-nav="workspace"]')
    }),
    engine: new TextToSpeechEngine(),
    outputSummary: new OutputSummaryControl({
      summary: requireElement("#text2speech-V2SpeechSummary")
    }),
    queueControl: new QueueControl({
      addButton: requireElement("#text2speech-V2AddItemButton"),
      deleteButton: requireElement("#text2speech-V2DeleteItemButton"),
      duplicateButton: requireElement("#text2speech-V2DuplicateItemButton"),
      itemNameInput: requireElement("#text2speech-V2SpeechItemName"),
      queueTiles: requireElement("#text2speech-V2QueueTiles")
    }),
    speechOptions: new SpeechOptionsControl({
      ageFilterSelect: requireElement("#text2speech-V2AgeFilterSelect"),
      characterPresetSelect: requireElement("#text2speech-V2CharacterPresetSelect"),
      genderFilterSelect: requireElement("#text2speech-V2GenderFilterSelect"),
      languageSelect: requireElement("#text2speech-V2LanguageSelect"),
      pitchOutput: requireElement("#text2speech-V2PitchOutput"),
      pitchSlider: requireElement("#text2speech-V2PitchSlider"),
      queueModeSelect: requireElement("#text2speech-V2QueueModeSelect"),
      rateOutput: requireElement("#text2speech-V2RateOutput"),
      rateSlider: requireElement("#text2speech-V2RateSlider"),
      ssmlLikePresetSelect: requireElement("#text2speech-V2SsmlLikePresetSelect"),
      voiceDetails: requireElement("#text2speech-V2VoiceDetails"),
      voiceSelect: requireElement("#text2speech-V2VoiceSelect"),
      volumeOutput: requireElement("#text2speech-V2VolumeOutput"),
      volumeSlider: requireElement("#text2speech-V2VolumeSlider")
    }),
    statusLog: new StatusLogControl({
      clearButton: requireElement("#text2speech-V2ClearStatusButton"),
      log: requireElement("#text2speech-V2StatusLog")
    }),
    shell: new TextToSpeechShellControl(),
    textInput: new TextInputControl({
      input: requireElement("#text2speech-V2SpeechText")
    })
  });

  window["__text2speech-V2App"] = app;
  void app.start().catch((error) => {
    app.statusLog?.fail?.(`Text to Speech V2 startup failed: ${error.message}`);
  });
});
