import {
  TEXT_TO_SPEECH_AGE_FILTER_OPTIONS,
  TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS,
  TEXT_TO_SPEECH_DEFAULT_QUEUE_DATA,
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_DISPLAY_NAME,
  TEXT_TO_SPEECH_GENDER_FILTER_OPTIONS,
  TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
  TEXT_TO_SPEECH_QUEUE_ITEM_REQUIRED_FIELDS,
  TEXT_TO_SPEECH_QUEUE_MODE_OPTIONS,
  TEXT_TO_SPEECH_RANGE_DEFAULTS,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS,
  TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS
} from "../../../src/engine/audio/TextToSpeechDefaults.js";

const WORKSPACE_TOOL_STATE_KEY = "workspace.tools.text2speach-V2";

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugFromName(name) {
  const slug = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "speech-item";
}

function validateQueue(queue) {
  if (!Array.isArray(queue) || queue.length === 0) {
    return { message: `${TEXT_TO_SPEECH_DISPLAY_NAME} queue must contain at least one speech item.`, ok: false };
  }
  for (const [index, item] of queue.entries()) {
    if (!isPlainObject(item)) {
      return { message: `${TEXT_TO_SPEECH_DISPLAY_NAME} queue item ${index + 1} must be an object.`, ok: false };
    }
    const missingFields = TEXT_TO_SPEECH_QUEUE_ITEM_REQUIRED_FIELDS.filter((field) => !Object.prototype.hasOwnProperty.call(item, field));
    if (missingFields.length > 0) {
      return { message: `${TEXT_TO_SPEECH_DISPLAY_NAME} queue item ${item.name || index + 1} is missing required options: ${missingFields.join(", ")}.`, ok: false };
    }
  }
  return { ok: true };
}

function withoutLegacyRepeatFields(item) {
  const currentItem = { ...item };
  const removedLegacyFields = Object.prototype.hasOwnProperty.call(currentItem, "delayBetweenRepeatsMs")
    || Object.prototype.hasOwnProperty.call(currentItem, "repeatCount");
  delete currentItem.delayBetweenRepeatsMs;
  delete currentItem.repeatCount;
  return {
    item: currentItem,
    removedLegacyFields
  };
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
    this.isApplyingQueueItem = false;
  }

  start() {
    this.speechOptions.populate({
      ageFilterOptions: TEXT_TO_SPEECH_AGE_FILTER_OPTIONS,
      characterPresetOptions: TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS,
      characterPresetDefaults: TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS,
      defaults: TEXT_TO_SPEECH_DEFAULTS,
      genderFilterOptions: TEXT_TO_SPEECH_GENDER_FILTER_OPTIONS,
      languageOptions: TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
      queueModeOptions: TEXT_TO_SPEECH_QUEUE_MODE_OPTIONS,
      rangeDefaults: TEXT_TO_SPEECH_RANGE_DEFAULTS,
      ssmlLikePresetDefaults: TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS,
      ssmlLikePresetOptions: TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS,
      voiceAgePresetDefaults: TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS
    });
    this.actionNav.mount({
      onPause: () => this.pause(),
      onResume: () => this.resume(),
      onReturnToWorkspace: (url) => {
        this.window.location.href = url;
      },
      onSpeak: () => this.speak(),
      onStop: () => this.stop(),
      onStopAll: () => this.stopAll()
    });
    this.queueControl.mount({
      onAdd: () => this.addSpeechItem(),
      onChange: (item) => this.applyQueueItem(item, "queue-item-selected"),
      onDelete: () => this.deleteSpeechItem(),
      onDuplicate: () => this.duplicateSpeechItem(),
      onNameChange: (name) => this.updateSelectedItemName(name)
    });
    this.textInput.mount({
      onInput: () => {
        if (this.isApplyingQueueItem) {
          return;
        }
        this.syncSelectedItemFromControls("text-updated", ["text"]);
        this.refreshOutputSummary("text-updated");
        this.speakIfAuto();
      }
    });
    this.speechOptions.mount({
      onChange: ({ controlId } = {}) => {
        if (controlId === "gender" || controlId === "language") {
          this.refreshVoices(`${controlId}-changed`);
        }
        if (controlId === "age") {
          const options = this.speechOptions.value();
          this.statusLog.ok(`Voice Age shaping applied: ${this.speechOptions.selectedVoiceAgeLabel()}; rate=${options.rate}; pitch=${options.pitch}.`);
        } else if (controlId === "ssmlLikePreset") {
          const options = this.speechOptions.value();
          this.statusLog.ok(`SSML-like preset applied: ${options.ssmlLikePreset}; rate=${options.rate}; pitch=${options.pitch}; volume=${options.volume}.`);
        }
        this.syncSelectedItemFromControls("settings-updated", [controlId || "speechOptions"]);
        this.refreshOutputSummary("settings-updated");
        this.speakIfAuto();
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
      this.statusLog.ok(`${TEXT_TO_SPEECH_DISPLAY_NAME} ready. SpeechSynthesis is available.`);
    } else {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} unavailable: SpeechSynthesis is not available in this browser.`);
    }
  }

  isWorkspaceLaunch() {
    const params = new URLSearchParams(this.window.location.search);
    return params.get("launch") === "workspace" && params.get("fromTool") === "workspace-manager-v2";
  }

  loadQueue() {
    const queueData = this.queueData();
    const migration = this.queueWithoutLegacyRepeatFields(queueData.queue);
    const validation = validateQueue(migration.queue);
    if (!validation.ok) {
      this.statusLog.fail(validation.message);
      this.actionNav.setSpeakEnabled(false);
      return;
    }
    this.queueControl.populate(migration.queue);
    this.applyQueueItem(this.queueControl.selectedItem() || migration.queue[0], "queue-loaded");
    this.statusLog.ok(`Loaded ${migration.queue.length} schema-complete ${TEXT_TO_SPEECH_DISPLAY_NAME} queue items.`);
    if (migration.removedLegacyFieldCount > 0) {
      this.statusLog.ok(`Migrated ${migration.removedLegacyFieldCount} ${TEXT_TO_SPEECH_DISPLAY_NAME} queue item(s): ignored legacy repeatCount/delayBetweenRepeatsMs fields.`);
      this.markWorkspaceDirty("legacy-repeat-fields-migrated", ["queue"]);
    }
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

  uniqueItemName(baseName) {
    const existingNames = new Set(this.queueControl.selectedQueue().map((item) => item.name));
    if (!existingNames.has(baseName)) {
      return baseName;
    }
    for (let index = 2; index < 1000; index += 1) {
      const candidate = `${baseName} ${index}`;
      if (!existingNames.has(candidate)) {
        return candidate;
      }
    }
    return `${baseName} ${Date.now().toString(36)}`;
  }

  uniqueItemId(baseName) {
    const existingIds = new Set(this.queueControl.selectedQueue().map((item) => item.id));
    const baseId = slugFromName(baseName);
    if (!existingIds.has(baseId)) {
      return baseId;
    }
    for (let index = 2; index < 1000; index += 1) {
      const candidate = `${baseId}-${index}`;
      if (!existingIds.has(candidate)) {
        return candidate;
      }
    }
    return `${baseId}-${Date.now().toString(36)}`;
  }

  queueWithoutLegacyRepeatFields(queue) {
    if (!Array.isArray(queue)) {
      return { queue: [], removedLegacyFieldCount: 0 };
    }
    let removedLegacyFieldCount = 0;
    return {
      queue: queue.map((item) => {
        if (!isPlainObject(item)) {
          return item;
        }
        const result = withoutLegacyRepeatFields(item);
        if (result.removedLegacyFields) {
          removedLegacyFieldCount += 1;
        }
        return result.item;
      }),
      removedLegacyFieldCount
    };
  }

  speechItemFromControls({ id, name, text = this.textInput.text() || TEXT_TO_SPEECH_DEFAULTS.sampleText } = {}) {
    const itemName = String(name || "").trim() || this.uniqueItemName("New speech item");
    return {
      id: id || this.uniqueItemId(itemName),
      name: itemName,
      text,
      ...this.speechOptions.value()
    };
  }

  selectedItemFromControls() {
    const selectedItem = this.queueControl.selectedItem();
    if (!selectedItem) {
      return null;
    }
    return this.speechItemFromControls({
      id: selectedItem.id,
      name: this.queueControl.itemName() || selectedItem.name
    });
  }

  syncSelectedItemFromControls(reason, changedKeys) {
    const item = this.selectedItemFromControls();
    if (!item) {
      return;
    }
    this.queueControl.replaceSelectedItem(item);
    this.markWorkspaceDirty(reason, changedKeys);
  }

  markWorkspaceDirty(reason, changedKeys) {
    if (!this.isWorkspaceLaunch()) {
      return;
    }
    const rawToolState = this.window.sessionStorage.getItem(WORKSPACE_TOOL_STATE_KEY);
    if (!rawToolState) {
      this.statusLog.fail(`Cannot mark ${TEXT_TO_SPEECH_DISPLAY_NAME} dirty: missing ${WORKSPACE_TOOL_STATE_KEY}.`);
      return;
    }
    try {
      const toolState = JSON.parse(rawToolState);
      if (!isPlainObject(toolState)) {
        this.statusLog.fail(`Cannot mark ${TEXT_TO_SPEECH_DISPLAY_NAME} dirty: ${WORKSPACE_TOOL_STATE_KEY} is not an object.`);
        return;
      }
      this.window.sessionStorage.setItem(WORKSPACE_TOOL_STATE_KEY, JSON.stringify({
        ...toolState,
        data: {
          ...(isPlainObject(toolState.data) ? toolState.data : {}),
          queue: this.queueControl.selectedQueue()
        },
        dirty: {
          isDirty: true,
          reason,
          changedAt: new Date().toISOString(),
          changedKeys
        }
      }));
    } catch (error) {
      this.statusLog.fail(`Cannot mark ${TEXT_TO_SPEECH_DISPLAY_NAME} dirty: ${error.message}`);
    }
  }

  addSpeechItem() {
    const requestedName = this.queueControl.itemName();
    if (!requestedName) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} Add blocked: Name is required before creating a named speech item.`);
      return;
    }
    const name = this.uniqueItemName(requestedName);
    const item = this.speechItemFromControls({
      id: this.uniqueItemId(name),
      name,
      text: this.textInput.text() || "New speech line."
    });
    this.queueControl.addItem(item);
    this.applyQueueItem(item, "queue-item-added");
    this.markWorkspaceDirty("speech-item-added", [`queue.${item.id}`]);
    this.statusLog.ok(`Added speech item: ${item.name}.`);
  }

  updateSelectedItemName(name) {
    if (this.isApplyingQueueItem) {
      return;
    }
    const selectedItem = this.queueControl.selectedItem();
    if (!selectedItem) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} name update failed: no named speech item is selected.`);
      return;
    }
    const itemName = String(name || "").trim();
    if (!itemName) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} name update blocked: Name is required and the selected item remains ${selectedItem.name}.`);
      return;
    }
    const item = {
      ...selectedItem,
      name: itemName
    };
    this.queueControl.replaceSelectedItem(item);
    this.markWorkspaceDirty("speech-item-renamed", [`queue.${item.id}.name`]);
    this.refreshOutputSummary("speech-item-renamed");
  }

  duplicateSpeechItem() {
    const selectedItem = this.selectedItemFromControls();
    if (!selectedItem) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} duplicate failed: no named sentence is selected.`);
      return;
    }
    this.queueControl.replaceSelectedItem(selectedItem);
    const name = this.uniqueItemName(`${selectedItem.name} copy`);
    const item = {
      ...clone(selectedItem),
      id: this.uniqueItemId(name),
      name
    };
    this.queueControl.addItem(item);
    this.applyQueueItem(item, "queue-item-duplicated");
    this.markWorkspaceDirty("speech-item-duplicated", [`queue.${item.id}`]);
    this.statusLog.ok(`Duplicated speech item: ${item.name}.`);
  }

  deleteSpeechItem() {
    const selectedItem = this.queueControl.selectedItem();
    if (!selectedItem) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} delete failed: no named sentence is selected.`);
      return;
    }
    const replacementItem = this.queueControl.selectedQueue().length === 1
      ? this.speechItemFromControls({
        id: this.uniqueItemId("New speech item"),
        name: this.uniqueItemName("New speech item"),
        text: "New speech line."
      })
      : null;
    const nextItem = this.queueControl.deleteSelectedItem(replacementItem);
    if (!nextItem) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} delete failed: no replacement named sentence is available.`);
      return;
    }
    this.applyQueueItem(nextItem, "queue-item-deleted");
    this.markWorkspaceDirty("speech-item-deleted", ["queue"]);
    this.statusLog.ok(`Deleted speech item: ${selectedItem.name}.`);
  }

  refreshVoices(source = "initial", selectedVoice = undefined) {
    const result = this.speechOptions.populateVoices(this.engine.voiceOptions(), selectedVoice);
    if (result.matchingVoiceCount > 0) {
      const action = source === "voiceschanged"
        ? "Updated"
        : source === "initial" ? "Loaded" : "Filtered";
      const voiceScope = result.genderFilter === "any"
        ? `${result.voiceCount} voices`
        : `${result.filteredVoiceCount} ${result.filterLabel} voices from ${result.voiceCount} total`;
      this.statusLog.ok(`${action} ${result.matchingVoiceCount} matching SpeechSynthesis voices for ${TEXT_TO_SPEECH_DISPLAY_NAME} (${voiceScope}; ${result.languageCount} languages; gender=${result.genderFilterLabel}; age=${result.ageFilterLabel}; language=${result.language}).`);
    } else {
      const message = result.voiceCount === 0
        ? `${TEXT_TO_SPEECH_DISPLAY_NAME} voice dropdown has no SpeechSynthesis voices; waiting for voiceschanged. Speak is disabled.`
        : result.filteredVoiceCount === 0
          ? `${TEXT_TO_SPEECH_DISPLAY_NAME} voice dropdown has no ${result.filterLabel} SpeechSynthesis voices; choose another Gender. Speak is disabled.`
        : `${TEXT_TO_SPEECH_DISPLAY_NAME} voice dropdown has no SpeechSynthesis voices matching ${result.language}; voice selection cleared. Speak is disabled.`;
      this.statusLog.fail(message);
    }
    if (result.languageAdjusted) {
      this.statusLog.ok(`Language selection adjusted from ${result.previousLanguage || "(none)"} to ${result.language || "(none)"} because available ${result.filterLabel} SpeechSynthesis voices changed.`);
    }
    if (source === "gender-changed" || source === "language-changed") {
      this.statusLog.ok(`Filter counts: available languages=${result.languageCount}; available voices=${result.filteredVoiceCount}; selected voice=${result.selectedVoiceLabel || "(none)"}; gender is a helper filter only, not a voice transformation.`);
    }
    if ((source === "age-changed" || source === "gender-changed" || source === "language-changed") && result.selectionAdjusted) {
      if (result.selectedVoice) {
        this.statusLog.ok(`Voice selection adjusted for ${result.filterLabel} / ${result.language}: ${result.selectedVoiceLabel}.`);
      } else {
        this.statusLog.fail(`Voice selection cleared for ${result.filterLabel} / ${result.language}: no matching SpeechSynthesis voices.`);
      }
    }
    this.refreshActionState();
    return result;
  }

  speakIfAuto() {
    if (this.speechOptions.value().autoSpeak && this.textInput.hasText() && this.speechOptions.hasVoice()) {
      this.speak();
    }
  }

  applyQueueItem(item, status) {
    if (!item) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} queue selection failed: no speech item is selected.`);
      return;
    }
    this.isApplyingQueueItem = true;
    try {
      this.queueControl.setItemName(item.name);
      this.textInput.setText(item.text, { emit: false });
      this.speechOptions.setValue(item);
    } finally {
      this.isApplyingQueueItem = false;
    }
    if (status !== "queue-loaded") {
      this.refreshVoices(status, item.voice);
    }
    this.refreshOutputSummary(status);
  }

  speechState(status) {
    const options = this.speechOptions.value();
    return {
      ...options,
      activeSpeakers: this.engine.activeSpeakerList(),
      queue: this.queueControl.selectedQueue(),
      selectedQueueItemId: this.queueControl.selectedItem()?.id || "",
      selectedQueueItemName: this.queueControl.selectedItem()?.name || "",
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
    this.actionNav.setStopAllEnabled(this.engine.isSupported());
  }

  speak() {
    const selectedItem = this.queueControl.selectedItem();
    const result = this.engine.speak({
      ...this.speechOptions.value(),
      speakerId: selectedItem?.id || "",
      speakerName: selectedItem?.name || "",
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
      selectedQueueItemName: this.queueControl.selectedItem()?.name || "",
      status: "speak-queued"
    });
    this.statusLog.ok(`Speak queued: ${result.speakerName}; ${result.language}; voice=${result.voiceName}; rate=${result.rate}; pitch=${result.pitch}; volume=${result.volume}; activeSpeakers=${result.activeSpeakers.length}.`);
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
    const selectedItem = this.queueControl.selectedItem();
    const result = this.engine.stop({ speakerId: selectedItem?.id || "" });
    if (!result.ok) {
      this.statusLog.fail(result.message);
      this.refreshOutputSummary("stop-failed");
      return;
    }
    this.statusLog.ok(`Speech stopped: ${result.speakerName}.`);
    this.refreshOutputSummary("stopped");
  }

  stopAll() {
    const result = this.engine.stopAll();
    if (!result.ok) {
      this.statusLog.fail(result.message);
      this.refreshOutputSummary("stop-all-failed");
      return;
    }
    this.statusLog.ok(`All speech stopped: ${result.stoppedCount} active speaker(s) cleared.`);
    this.refreshOutputSummary("stopped-all");
  }
}
