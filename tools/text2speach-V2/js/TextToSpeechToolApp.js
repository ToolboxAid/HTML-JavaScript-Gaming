import {
  TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS,
  TEXT_TO_SPEECH_DEFAULT_QUEUE_DATA,
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
  TEXT_TO_SPEECH_QUEUE_ITEM_REQUIRED_FIELDS,
  TEXT_TO_SPEECH_QUEUE_MODE_OPTIONS,
  TEXT_TO_SPEECH_RANGE_DEFAULTS,
  TEXT_TO_SPEECH_REPEAT_COUNT_OPTIONS,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS
} from "../../../src/engine/audio/TextToSpeechDefaults.js";

const WORKSPACE_TOOL_STATE_KEY = "workspace.tools.text2speach-V2";

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateQueue(queue) {
  if (!Array.isArray(queue) || queue.length === 0) {
    return { message: "text2speach-V2 queue must contain at least one speech item.", ok: false };
  }
  for (const [index, item] of queue.entries()) {
    if (!isPlainObject(item)) {
      return { message: `text2speach-V2 queue item ${index + 1} must be an object.`, ok: false };
    }
    const missingFields = TEXT_TO_SPEECH_QUEUE_ITEM_REQUIRED_FIELDS.filter((field) => !Object.prototype.hasOwnProperty.call(item, field));
    if (missingFields.length > 0) {
      return { message: `text2speach-V2 queue item ${item.name || index + 1} is missing required options: ${missingFields.join(", ")}.`, ok: false };
    }
  }
  return { ok: true };
}

export class TextToSpeechToolApp {
  constructor({
    actionNav,
    engine,
    outputSummary,
    queueControl,
    speechOptions,
    statusLog,
    textInput,
    windowRef = window
  }) {
    this.actionNav = actionNav;
    this.engine = engine;
    this.outputSummary = outputSummary;
    this.queueControl = queueControl;
    this.speechOptions = speechOptions;
    this.statusLog = statusLog;
    this.textInput = textInput;
    this.window = windowRef;
  }

  start() {
    this.speechOptions.populate({
      characterPresetOptions: TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS,
      defaults: TEXT_TO_SPEECH_DEFAULTS,
      languageOptions: TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
      queueModeOptions: TEXT_TO_SPEECH_QUEUE_MODE_OPTIONS,
      rangeDefaults: TEXT_TO_SPEECH_RANGE_DEFAULTS,
      repeatCountOptions: TEXT_TO_SPEECH_REPEAT_COUNT_OPTIONS,
      ssmlLikePresetOptions: TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS
    });
    this.actionNav.mount({
      onPause: () => this.pause(),
      onResume: () => this.resume(),
      onReturnToWorkspace: (url) => {
        this.window.location.href = url;
      },
      onSpeak: () => this.speak(),
      onStop: () => this.stop()
    });
    this.queueControl.mount({
      onChange: (item) => this.applyQueueItem(item, "queue-item-selected")
    });
    this.textInput.mount({
      onInput: () => this.refreshOutputSummary("text-updated")
    });
    this.speechOptions.mount({
      onChange: ({ controlId } = {}) => {
        if (controlId === "language") {
          this.refreshVoices("language-changed");
        }
        this.refreshOutputSummary("settings-updated");
        if (this.speechOptions.value().autoSpeak) {
          this.speak();
        }
      }
    });
    this.statusLog.mount();
    this.loadQueue();
    this.refreshVoices();
    this.engine.onVoicesChanged(() => {
      this.refreshVoices("voiceschanged");
      this.refreshOutputSummary("voices-updated");
    });
    this.refreshOutputSummary("ready");
    this.refreshActionState();
    if (this.engine.isSupported()) {
      this.statusLog.ok("text2speach-V2 ready. SpeechSynthesis is available.");
    } else {
      this.statusLog.fail("text2speach-V2 unavailable: SpeechSynthesis is not available in this browser.");
    }
  }

  isWorkspaceLaunch() {
    const params = new URLSearchParams(this.window.location.search);
    return params.get("launch") === "workspace" && params.get("fromTool") === "workspace-manager-v2";
  }

  loadQueue() {
    const queueData = this.queueData();
    const validation = validateQueue(queueData.queue);
    if (!validation.ok) {
      this.statusLog.fail(validation.message);
      this.actionNav.setSpeakEnabled(false);
      return;
    }
    this.queueControl.populate(queueData.queue);
    this.applyQueueItem(this.queueControl.selectedItem() || queueData.queue[0], "queue-loaded");
    this.statusLog.ok(`Loaded ${queueData.queue.length} schema-complete text2speach-V2 queue items.`);
  }

  queueData() {
    if (!this.isWorkspaceLaunch()) {
      return TEXT_TO_SPEECH_DEFAULT_QUEUE_DATA;
    }
    const rawToolState = this.window.sessionStorage.getItem(WORKSPACE_TOOL_STATE_KEY);
    if (!rawToolState) {
      this.statusLog.fail(`Workspace launch missing ${WORKSPACE_TOOL_STATE_KEY}; queue cannot render.`);
      return { queue: [] };
    }
    try {
      const toolState = JSON.parse(rawToolState);
      return isPlainObject(toolState?.data) ? toolState.data : { queue: [] };
    } catch (error) {
      this.statusLog.fail(`${WORKSPACE_TOOL_STATE_KEY} is invalid JSON: ${error.message}`);
      return { queue: [] };
    }
  }

  refreshVoices(source = "initial") {
    const result = this.speechOptions.populateVoices(this.engine.voiceOptions(), this.speechOptions.value().voice);
    if (result.matchingVoiceCount > 0) {
      const action = source === "voiceschanged"
        ? "Updated"
        : source === "initial" ? "Loaded" : "Filtered";
      this.statusLog.ok(`${action} ${result.matchingVoiceCount} matching SpeechSynthesis voices for text2speach-V2 (${result.voiceCount} available; language=${result.language}).`);
    } else {
      const message = result.voiceCount === 0
        ? "text2speach-V2 voice dropdown has no SpeechSynthesis voices; waiting for voiceschanged. Speak is disabled."
        : `text2speach-V2 voice dropdown has no SpeechSynthesis voices matching ${result.language}; voice selection cleared. Speak is disabled.`;
      this.statusLog.fail(message);
    }
    if (source === "language-changed" && result.selectionAdjusted) {
      if (result.selectedVoice) {
        this.statusLog.ok(`Voice selection adjusted for language ${result.language}: ${result.selectedVoiceLabel}.`);
      } else {
        this.statusLog.fail(`Voice selection cleared for language ${result.language}: no matching SpeechSynthesis voices.`);
      }
    }
    this.refreshActionState();
    return result;
  }

  applyQueueItem(item, status) {
    if (!item) {
      this.statusLog.fail("text2speach-V2 queue selection failed: no speech item is selected.");
      return;
    }
    this.textInput.setText(item.text);
    this.speechOptions.setValue(item);
    if (status !== "queue-loaded") {
      this.refreshVoices(status);
    }
    this.refreshOutputSummary(status);
  }

  speechState(status) {
    const options = this.speechOptions.value();
    return {
      ...options,
      queue: this.queueControl.selectedQueue(),
      selectedQueueItemId: this.queueControl.selectedItem()?.id || "",
      status,
      text: this.textInput.text()
    };
  }

  refreshOutputSummary(status) {
    this.outputSummary.render(this.speechState(status));
    this.refreshActionState();
  }

  refreshActionState() {
    const canSpeak = this.engine.isSupported() && this.textInput.hasText() && this.speechOptions.hasVoice();
    this.actionNav.setSpeakEnabled(canSpeak);
    this.actionNav.setPauseEnabled(this.engine.canPause());
    this.actionNav.setResumeEnabled(this.engine.canResume());
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
      ...result,
      queue: this.queueControl.selectedQueue(),
      selectedQueueItemId: this.queueControl.selectedItem()?.id || "",
      status: "speak-queued"
    });
    this.statusLog.ok(`Speak queued: ${result.language}; voice=${result.voiceName}; rate=${result.rate}; pitch=${result.pitch}; volume=${result.volume}; repeats=${result.queuedCount}.`);
    this.refreshActionState();
  }

  pause() {
    const result = this.engine.pause();
    if (!result.ok) {
      this.statusLog.fail(result.message);
      return;
    }
    this.statusLog.ok("Speech paused.");
    this.refreshOutputSummary("paused");
  }

  resume() {
    const result = this.engine.resume();
    if (!result.ok) {
      this.statusLog.fail(result.message);
      return;
    }
    this.statusLog.ok("Speech resumed.");
    this.refreshOutputSummary("resumed");
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
