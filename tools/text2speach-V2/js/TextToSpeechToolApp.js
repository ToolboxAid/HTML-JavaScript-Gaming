import {
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
  TEXT_TO_SPEECH_PITCH_OPTIONS,
  TEXT_TO_SPEECH_RATE_OPTIONS,
  TEXT_TO_SPEECH_VOLUME_OPTIONS
} from "../../../src/engine/audio/TextToSpeechDefaults.js";

export class TextToSpeechToolApp {
  constructor({ actionNav, engine, outputSummary, speechOptions, statusLog, textInput, windowRef = window }) {
    this.actionNav = actionNav;
    this.engine = engine;
    this.outputSummary = outputSummary;
    this.speechOptions = speechOptions;
    this.statusLog = statusLog;
    this.textInput = textInput;
    this.window = windowRef;
  }

  start() {
    this.speechOptions.populate({
      defaults: TEXT_TO_SPEECH_DEFAULTS,
      languageOptions: TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
      pitchOptions: TEXT_TO_SPEECH_PITCH_OPTIONS,
      rateOptions: TEXT_TO_SPEECH_RATE_OPTIONS,
      volumeOptions: TEXT_TO_SPEECH_VOLUME_OPTIONS
    });
    this.actionNav.mount({
      onReturnToWorkspace: (url) => {
        this.window.location.href = url;
      },
      onSpeak: () => this.speak(),
      onStop: () => this.stop()
    });
    this.textInput.mount({
      onInput: () => this.refreshActionState()
    });
    this.speechOptions.mount({
      onChange: () => this.refreshOutputSummary("settings-updated")
    });
    this.statusLog.mount();
    this.textInput.setText(TEXT_TO_SPEECH_DEFAULTS.sampleText);
    this.refreshOutputSummary("ready");
    this.refreshActionState();
    if (this.engine.isSupported()) {
      this.statusLog.ok("text2speach-V2 ready. SpeechSynthesis is available.");
    } else {
      this.statusLog.fail("text2speach-V2 unavailable: SpeechSynthesis is not available in this browser.");
    }
  }

  speechState(status) {
    const options = this.speechOptions.value();
    return {
      language: options.language,
      pitch: options.pitch,
      rate: options.rate,
      status,
      text: this.textInput.text(),
      volume: options.volume
    };
  }

  refreshOutputSummary(status) {
    this.outputSummary.render(this.speechState(status));
    this.refreshActionState();
  }

  refreshActionState() {
    const canSpeak = this.engine.isSupported() && this.textInput.hasText();
    this.actionNav.setSpeakEnabled(canSpeak);
    this.actionNav.setStopEnabled(this.engine.isSupported());
  }

  speak() {
    const result = this.engine.speak({
      ...this.speechOptions.value(),
      text: this.textInput.text()
    });
    if (!result.ok) {
      this.statusLog.fail(result.message);
      this.refreshOutputSummary("speak-failed");
      return;
    }
    this.outputSummary.render({
      language: result.language,
      pitch: result.pitch,
      rate: result.rate,
      status: "speak-queued",
      text: result.text,
      voiceName: result.voiceName,
      volume: result.volume
    });
    this.statusLog.ok(`Speak queued: ${result.language}; rate=${result.rate}; pitch=${result.pitch}; volume=${result.volume}.`);
    this.refreshActionState();
  }

  stop() {
    const result = this.engine.stop();
    if (!result.ok) {
      this.statusLog.fail(result.message);
      return;
    }
    this.statusLog.ok("Speech stopped.");
    this.refreshOutputSummary("stopped");
  }
}
