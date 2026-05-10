import { mountAccordionV2 } from "../../../src/engine/theme/accordionV2/accordionV2.js";
import { TextToSpeechEngine } from "../../../src/engine/audio/TextToSpeechEngine.js";
import { TextToSpeechToolApp } from "./TextToSpeechToolApp.js";
import { ActionNavControl } from "./controls/ActionNavControl.js";
import { OutputSummaryControl } from "./controls/OutputSummaryControl.js";
import { SpeechOptionsControl } from "./controls/SpeechOptionsControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { TextInputControl } from "./controls/TextInputControl.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required text2speach-V2 element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  mountAccordionV2(document);
  const app = new TextToSpeechToolApp({
    actionNav: new ActionNavControl({
      returnToWorkspaceButton: requireElement("#returnToWorkspaceButton"),
      speakButtons: [
        requireElement("#text2speach-V2SpeakButton"),
        requireElement("#text2speach-V2WorkspaceSpeakButton")
      ],
      stopButtons: [
        requireElement("#text2speach-V2StopButton"),
        requireElement("#text2speach-V2WorkspaceStopButton")
      ],
      toolNav: requireElement('[data-launch-mode-nav="tool"]'),
      workspaceNav: requireElement('[data-launch-mode-nav="workspace"]')
    }),
    engine: new TextToSpeechEngine(),
    outputSummary: new OutputSummaryControl({
      preview: requireElement("#text2speach-V2SpeechPreview"),
      summary: requireElement("#text2speach-V2SpeechSummary")
    }),
    speechOptions: new SpeechOptionsControl({
      languageSelect: requireElement("#text2speach-V2LanguageSelect"),
      pitchSelect: requireElement("#text2speach-V2PitchSelect"),
      rateSelect: requireElement("#text2speach-V2RateSelect"),
      volumeSelect: requireElement("#text2speach-V2VolumeSelect")
    }),
    statusLog: new StatusLogControl({
      clearButton: requireElement("#text2speach-V2ClearStatusButton"),
      log: requireElement("#text2speach-V2StatusLog")
    }),
    textInput: new TextInputControl({
      input: requireElement("#text2speach-V2SpeechText")
    })
  });

  app.start();
  window["__text2speach-V2App"] = app;
});
