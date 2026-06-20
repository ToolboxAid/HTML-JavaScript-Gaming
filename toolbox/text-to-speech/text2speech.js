import {
  createTextToSpeechQueueItem,
  filterTextToSpeechVoiceOptions,
  shapeTextToSpeechOptions,
  textToSpeechPayloadGenderValue,
  TextToSpeechEngine,
  uniqueTextToSpeechId,
  uniqueTextToSpeechName
} from "../../src/engine/audio/TextToSpeechEngine.js";
import {
  TEXT_TO_SPEECH_AGE_FILTER_OPTIONS,
  TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS,
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_DISPLAY_NAME,
  TEXT_TO_SPEECH_GENDER_FILTER_OPTIONS,
  TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
  TEXT_TO_SPEECH_RANGE_DEFAULTS,
  TEXT_TO_SPEECH_SCHEMA_ID,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS
} from "../../src/engine/audio/TextToSpeechDefaults.js";

const WORKSPACE_TOOL_STATE_KEY = "workspace.tools.text2speech-V2";
const TTS_URL_SOURCE_PARAM = "samplePresetPath";

const TTS_OWNERSHIP = Object.freeze({
  DESIGN: "Design",
  AUDIO: "Audio"
});

const TTS_MESSAGE_STATUSES = Object.freeze([
  "draft",
  "ready-for-preview",
  "speaking",
  "stopped",
  "blocked",
  "archived"
]);

const TTS_LANGUAGES = Object.freeze(TEXT_TO_SPEECH_LANGUAGE_OPTIONS.map((option) => ({
  code: option.value,
  name: option.label
})));

const TTS_PROVIDER_ADAPTER_PLAN = Object.freeze([
  {
    key: "browser-speech",
    name: "Browser Speech Synthesis",
    status: "implemented",
    boundary: "Local browser Web Speech API preview; no generated files.",
    requiredCapabilities: ["text input", "voice selection", "rate", "pitch", "volume", "speak", "pause", "resume", "stop"]
  },
  {
    key: "openai",
    name: "OpenAI",
    status: "planned",
    boundary: "External provider adapter; no implementation in this PR.",
    requiredCapabilities: ["text input", "voice selection", "generated audio file response", "usage metadata"]
  },
  {
    key: "elevenlabs",
    name: "ElevenLabs",
    status: "planned",
    boundary: "External provider adapter; no implementation in this PR.",
    requiredCapabilities: ["text input", "voice profile mapping", "generated audio file response", "provider job metadata"]
  },
  {
    key: "azure",
    name: "Azure AI Speech",
    status: "planned",
    boundary: "External provider adapter; no implementation in this PR.",
    requiredCapabilities: ["SSML-safe text", "language mapping", "voice deployment mapping", "generated audio file response"]
  },
  {
    key: "local",
    name: "Local Provider",
    status: "planned",
    boundary: "Local/offline adapter; no implementation in this PR.",
    requiredCapabilities: ["local model availability", "voice preset mapping", "file output", "device/runtime capability reporting"]
  }
]);

function boundedNumber(value, { fallback, max, min, value: defaultValue }) {
  const number = Number(value);
  const fallbackValue = fallback ?? defaultValue ?? min;
  return Math.min(max, Math.max(min, Number.isFinite(number) ? number : fallbackValue));
}

function formatRangeValue(value, kind) {
  const limits = TEXT_TO_SPEECH_RANGE_DEFAULTS[kind] || TEXT_TO_SPEECH_RANGE_DEFAULTS.rate;
  const boundedValue = boundedNumber(value, limits);
  return String(Math.round(boundedValue * 100) / 100);
}

function createTtsMessage({
  id,
  name,
  text,
  emotionKey = "neutral",
  voiceProfileKey = "browser-speech",
  languageCode = "en-US",
  status = "draft",
  metadata = {}
} = {}) {
  return {
    id: String(id || "tts-message-draft"),
    name: String(name || "Untitled TTS Message"),
    text: String(text || ""),
    emotionKey: String(emotionKey || "neutral"),
    voiceProfileKey: String(voiceProfileKey || "browser-speech"),
    languageCode: String(languageCode || "en-US"),
    status: TTS_MESSAGE_STATUSES.includes(status) ? status : "draft",
    owner: TTS_OWNERSHIP.DESIGN,
    audioOwner: TTS_OWNERSHIP.AUDIO,
    metadata: {
      creatorNotes: String(metadata.creatorNotes || ""),
      intent: String(metadata.intent || ""),
      sceneKey: String(metadata.sceneKey || ""),
      tags: Array.isArray(metadata.tags) ? metadata.tags.map(String) : []
    },
    generatedAudio: null
  };
}

function createEmotionProfile({ key = "neutral", name = "Neutral", intensity = 0.5 } = {}) {
  const numericIntensity = Number(intensity);
  const safeIntensity = Number.isNaN(numericIntensity) ? 0.5 : Math.min(1, Math.max(0, numericIntensity));
  return { key: String(key), name: String(name), intensity: safeIntensity, owner: TTS_OWNERSHIP.DESIGN };
}

function createVoiceProfile({ key = "browser-speech", name = "Browser Speech", providerKey = "browser-speech", voiceId = "" } = {}) {
  return {
    key: String(key),
    name: String(name),
    providerKey: String(providerKey),
    voiceId: String(voiceId),
    owner: TTS_OWNERSHIP.DESIGN,
    generatedAudioOwner: TTS_OWNERSHIP.AUDIO
  };
}

function createSpeechPreviewRequest({
  pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
  rate = TEXT_TO_SPEECH_DEFAULTS.rate,
  text = "",
  voice = "",
  voiceOptions = [],
  volume = TEXT_TO_SPEECH_DEFAULTS.volume
} = {}) {
  const normalizedText = String(text || "").trim();
  if (!normalizedText) {
    return { ok: false, message: "Speech text is required before preview." };
  }

  const selectedVoice = voiceOptions.find((option) => String(option.value) === String(voice)) || null;
  if (!selectedVoice) {
    return { ok: false, message: "Select an available browser voice before preview." };
  }

  return {
    language: selectedVoice.language || TEXT_TO_SPEECH_DEFAULTS.language,
    ok: true,
    pitch: boundedNumber(pitch, TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch),
    rate: boundedNumber(rate, TEXT_TO_SPEECH_RANGE_DEFAULTS.rate),
    speechItemId: "browser-preview",
    speechItemName: "Browser Preview",
    text: normalizedText,
    voice: selectedVoice.value,
    voiceName: selectedVoice.name || selectedVoice.label || "selected voice",
    volume: boundedNumber(volume, TEXT_TO_SPEECH_RANGE_DEFAULTS.volume)
  };
}

function previewTtsMessage(message, options = {}) {
  return createSpeechPreviewRequest({
    ...options,
    text: message?.text
  });
}

function populateSelect(select, options, selectedValue = "") {
  if (!select) return;
  select.replaceChildren(...options.map((option) => {
    const node = document.createElement("option");
    node.value = String(option.value);
    node.textContent = option.label;
    node.selected = String(option.value) === String(selectedValue);
    return node;
  }));
  if (options.some((option) => String(option.value) === String(selectedValue))) {
    select.value = String(selectedValue);
  }
}

function setTextContent(root, selector, text) {
  const node = root.querySelector(selector);
  if (node) node.textContent = text;
}

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error || new Error("File read failed.")));
    reader.readAsText(file);
  });
}

function downloadTextFile(text, filename, documentRef = document) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = documentRef.createElement("a");
  link.href = url;
  link.download = filename;
  documentRef.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function validateTextToSpeechPayload(payload, sourceLabel = "payload") {
  if (!Array.isArray(payload)) {
    return { ok: false, message: `${TEXT_TO_SPEECH_DISPLAY_NAME} ${sourceLabel} must be a root array.` };
  }
  const required = ["id", "name", "text", "gender", "language", "voice", "voiceAge", "volume", "rate", "pitch", "characterPreset", "ssmlLikePreset"];
  for (const [index, item] of payload.entries()) {
    if (!isPlainObject(item)) {
      return { ok: false, message: `${TEXT_TO_SPEECH_DISPLAY_NAME} ${sourceLabel}[${index}] must be an object.` };
    }
    const missing = required.filter((key) => !Object.prototype.hasOwnProperty.call(item, key));
    if (missing.length) {
      return { ok: false, message: `${TEXT_TO_SPEECH_DISPLAY_NAME} ${sourceLabel}[${index}] missing: ${missing.join(", ")}.` };
    }
  }
  return { ok: true };
}

function queueItemMeta(item) {
  return [
    item.language || "no language",
    item.characterPreset || "manual",
    item.voiceAge || "any"
  ].join(" / ");
}

function initializeTextToSpeechTool(root = document, { engine = new TextToSpeechEngine() } = {}) {
  const elements = {
    addItem: root.querySelector("[data-tts-add-item]"),
    age: root.querySelector("[data-tts-age-select]"),
    characterPreset: root.querySelector("[data-tts-character-preset-select]"),
    clearStatus: root.querySelector("[data-tts-clear-status]"),
    copyJson: root.querySelector("[data-tts-copy-json]"),
    deleteItem: root.querySelector("[data-tts-delete-item]"),
    duplicateItem: root.querySelector("[data-tts-duplicate-item]"),
    exportJson: root.querySelector("[data-tts-export-json]"),
    gender: root.querySelector("[data-tts-gender-select]"),
    importJson: root.querySelector("[data-tts-import-json]"),
    importJsonInput: root.querySelector("[data-tts-import-json-input]"),
    itemName: root.querySelector("[data-tts-item-name]"),
    language: root.querySelector("[data-tts-language-select]"),
    outputSummary: root.querySelector("[data-tts-output-summary]"),
    pause: root.querySelector("[data-tts-pause]"),
    pitch: root.querySelector("[data-tts-pitch]"),
    pitchValue: root.querySelector("[data-tts-pitch-value]"),
    queueList: root.querySelector("[data-tts-queue-list]"),
    rate: root.querySelector("[data-tts-rate]"),
    rateValue: root.querySelector("[data-tts-rate-value]"),
    resume: root.querySelector("[data-tts-resume]"),
    returnWorkspace: root.querySelector("[data-tts-return-workspace]"),
    speak: root.querySelector("[data-tts-speak]"),
    ssmlPreset: root.querySelector("[data-tts-ssml-preset-select]"),
    standaloneActions: root.querySelector("[data-tts-standalone-actions]"),
    status: root.querySelector("[data-tts-status]"),
    statusLog: root.querySelector("[data-tts-status-log]"),
    stop: root.querySelector("[data-tts-stop]"),
    text: root.querySelector("[data-tts-text-input]"),
    voice: root.querySelector("[data-tts-voice-select]"),
    volume: root.querySelector("[data-tts-volume]"),
    volumeValue: root.querySelector("[data-tts-volume-value]"),
    workspaceActions: root.querySelector("[data-tts-workspace-actions]")
  };
  const state = {
    applyingItem: false,
    queue: [],
    selectedItemId: "",
    sliderOverrides: { pitch: false, rate: false, volume: false },
    voiceOptions: []
  };

  function writeStatus(message, level = "OK") {
    const line = `${level} ${message}`;
    if (elements.status) {
      elements.status.textContent = message;
      elements.status.dataset.ttsStatusState = level.toLowerCase();
    }
    if (elements.statusLog) {
      elements.statusLog.value = elements.statusLog.value ? `${elements.statusLog.value}\n${line}` : line;
      elements.statusLog.scrollTop = elements.statusLog.scrollHeight;
    }
  }

  function selectedItem() {
    return state.queue.find((item) => item.id === state.selectedItemId) || null;
  }

  function selectedVoiceOptions() {
    return Array.from(elements.voice?.options || []).map((option) => ({
      label: option.textContent || option.value,
      language: elements.language?.value || TEXT_TO_SPEECH_DEFAULTS.language,
      name: option.textContent || option.value,
      value: option.value
    })).filter((option) => option.value);
  }

  function currentOptions() {
    return {
      characterPreset: elements.characterPreset?.value || TEXT_TO_SPEECH_DEFAULTS.characterPreset,
      gender: textToSpeechPayloadGenderValue(elements.gender?.value || TEXT_TO_SPEECH_DEFAULTS.gender),
      language: elements.language?.value || TEXT_TO_SPEECH_DEFAULTS.language,
      pitch: Number(elements.pitch?.value || TEXT_TO_SPEECH_DEFAULTS.pitch),
      rate: Number(elements.rate?.value || TEXT_TO_SPEECH_DEFAULTS.rate),
      ssmlLikePreset: elements.ssmlPreset?.value || TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
      voice: elements.voice?.value || "",
      voiceAge: elements.age?.value || TEXT_TO_SPEECH_DEFAULTS.voiceAge,
      volume: Number(elements.volume?.value || TEXT_TO_SPEECH_DEFAULTS.volume)
    };
  }

  function itemFromControls(overrides = {}) {
    const currentItem = selectedItem();
    return createTextToSpeechQueueItem({
      ...currentOptions(),
      existingItems: state.queue.filter((item) => item.id !== currentItem?.id),
      id: overrides.id ?? currentItem?.id ?? "",
      name: overrides.name ?? elements.itemName?.value ?? currentItem?.name ?? "New speech item",
      text: overrides.text ?? elements.text?.value ?? currentItem?.text ?? ""
    });
  }

  function syncRangeOutputs() {
    if (elements.rate) elements.rate.value = formatRangeValue(elements.rate.value, "rate");
    if (elements.pitch) elements.pitch.value = formatRangeValue(elements.pitch.value, "pitch");
    if (elements.volume) elements.volume.value = formatRangeValue(elements.volume.value, "volume");
    if (elements.rateValue) elements.rateValue.textContent = elements.rate?.value || "1";
    if (elements.pitchValue) elements.pitchValue.textContent = elements.pitch?.value || "1";
    if (elements.volumeValue) elements.volumeValue.textContent = elements.volume?.value || "1";
  }

  function configureRanges() {
    [
      { input: elements.volume, kind: "volume" },
      { input: elements.rate, kind: "rate" },
      { input: elements.pitch, kind: "pitch" }
    ].forEach(({ input, kind }) => {
      const range = TEXT_TO_SPEECH_RANGE_DEFAULTS[kind];
      if (!input || !range) return;
      input.min = String(range.min);
      input.max = String(range.max);
      input.step = String(range.step);
      input.value = String(range.value);
    });
    syncRangeOutputs();
  }

  function applyShapedOptions({ resetOverrides = false } = {}) {
    if (resetOverrides) {
      state.sliderOverrides = { pitch: false, rate: false, volume: false };
    }
    const shaped = shapeTextToSpeechOptions(currentOptions(), state.sliderOverrides);
    if (elements.rate && !state.sliderOverrides.rate) elements.rate.value = String(shaped.rate);
    if (elements.pitch && !state.sliderOverrides.pitch) elements.pitch.value = String(shaped.pitch);
    if (elements.volume && !state.sliderOverrides.volume) elements.volume.value = String(shaped.volume);
    syncRangeOutputs();
  }

  function renderOutputSummary() {
    if (elements.outputSummary) {
      elements.outputSummary.textContent = JSON.stringify(state.queue, null, 2);
    }
    setTextContent(root, "[data-tts-text-count]", String(String(elements.text?.value || "").length));
  }

  function renderQueue() {
    if (!elements.queueList) return;
    elements.queueList.replaceChildren(...state.queue.map((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn";
      button.dataset.ttsQueueItem = item.id;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(item.id === state.selectedItemId));
      button.textContent = `${item.name} - ${queueItemMeta(item)}`;
      return button;
    }));
    renderOutputSummary();
  }

  function markWorkspaceDirty(reason, changedKeys = []) {
    if (!isWorkspaceLaunch()) return;
    const rawToolState = window.sessionStorage.getItem(WORKSPACE_TOOL_STATE_KEY);
    if (!rawToolState) {
      writeStatus(`Cannot mark ${TEXT_TO_SPEECH_DISPLAY_NAME} dirty: missing ${WORKSPACE_TOOL_STATE_KEY}.`, "FAIL");
      return;
    }
    try {
      const toolState = JSON.parse(rawToolState);
      window.sessionStorage.setItem(WORKSPACE_TOOL_STATE_KEY, JSON.stringify({
        ...toolState,
        data: state.queue,
        dirty: {
          changedAt: new Date().toISOString(),
          changedKeys,
          isDirty: true,
          reason
        }
      }));
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} dirty state: true; reason=${reason}.`);
    } catch (error) {
      writeStatus(`Cannot mark ${TEXT_TO_SPEECH_DISPLAY_NAME} dirty: ${error.message}`, "FAIL");
    }
  }

  function syncSelectedItemFromControls(reason, changedKeys = []) {
    if (state.applyingItem) return;
    const item = selectedItem();
    if (!item) return;
    const nextItem = itemFromControls({ id: item.id, name: elements.itemName?.value || item.name });
    const index = state.queue.findIndex((entry) => entry.id === item.id);
    if (index >= 0) {
      state.queue[index] = nextItem;
      state.selectedItemId = nextItem.id;
      renderQueue();
      markWorkspaceDirty(reason, changedKeys);
    }
  }

  function selectItem(itemId, { writeLog = true } = {}) {
    const item = state.queue.find((entry) => entry.id === itemId);
    if (!item) return;
    state.selectedItemId = item.id;
    state.applyingItem = true;
    try {
      if (elements.itemName) elements.itemName.value = item.name;
      if (elements.text) elements.text.value = item.text;
      if (elements.gender) elements.gender.value = item.gender === "any" ? "any" : item.gender;
      if (elements.age) elements.age.value = item.voiceAge;
      if (elements.characterPreset) elements.characterPreset.value = item.characterPreset;
      if (elements.ssmlPreset) elements.ssmlPreset.value = item.ssmlLikePreset;
      if (elements.rate) elements.rate.value = String(item.rate);
      if (elements.pitch) elements.pitch.value = String(item.pitch);
      if (elements.volume) elements.volume.value = String(item.volume);
      syncRangeOutputs();
      refreshVoices({ selectedVoice: item.voice });
    } finally {
      state.applyingItem = false;
    }
    renderQueue();
    refreshActionState();
    if (writeLog) writeStatus(`Selected speech item: ${item.name}.`);
  }

  function addItem() {
    const requestedName = String(elements.itemName?.value || "").trim();
    if (!requestedName) {
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} Add blocked: Name is required before creating a named speech item.`, "FAIL");
      return;
    }
    const item = createTextToSpeechQueueItem({
      ...currentOptions(),
      existingItems: state.queue,
      name: requestedName,
      text: elements.text?.value || "New speech line."
    });
    state.queue.push(item);
    state.selectedItemId = item.id;
    renderQueue();
    selectItem(item.id, { writeLog: false });
    markWorkspaceDirty("speech-item-added", [`queue.${item.id}`]);
    writeStatus(`Added speech item: ${item.name}.`);
  }

  function duplicateItem() {
    const item = itemFromControls();
    if (!selectedItem()) {
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} duplicate failed: no named sentence is selected.`, "FAIL");
      return;
    }
    const name = uniqueTextToSpeechName(`${item.name} copy`, state.queue);
    const copy = {
      ...item,
      id: uniqueTextToSpeechId(name, state.queue),
      name
    };
    state.queue.push(copy);
    selectItem(copy.id, { writeLog: false });
    markWorkspaceDirty("speech-item-duplicated", [`queue.${copy.id}`]);
    writeStatus(`Duplicated speech item: ${copy.name}.`);
  }

  function deleteItem() {
    const item = selectedItem();
    if (!item) {
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} delete failed: no named sentence is selected.`, "FAIL");
      return;
    }
    const index = state.queue.findIndex((entry) => entry.id === item.id);
    state.queue.splice(index, 1);
    state.selectedItemId = state.queue[Math.min(index, state.queue.length - 1)]?.id || "";
    renderQueue();
    if (state.selectedItemId) {
      selectItem(state.selectedItemId, { writeLog: false });
    } else {
      if (elements.itemName) elements.itemName.value = "";
      if (elements.text) elements.text.value = "";
      renderOutputSummary();
    }
    markWorkspaceDirty("speech-item-deleted", ["queue"]);
    writeStatus(`Deleted speech item: ${item.name}.`);
  }

  function refreshVoices({ selectedVoice = elements.voice?.value || "" } = {}) {
    state.voiceOptions = engine.voiceOptions();
    const gender = elements.gender?.value || "any";
    const filteredByGender = filterTextToSpeechVoiceOptions(state.voiceOptions, { gender });
    const languageOptions = filteredByGender.languageOptions.length
      ? filteredByGender.languageOptions
      : TEXT_TO_SPEECH_LANGUAGE_OPTIONS;
    const previousLanguage = elements.language?.value || TEXT_TO_SPEECH_DEFAULTS.language;
    const language = languageOptions.some((option) => option.value === previousLanguage)
      ? previousLanguage
      : languageOptions[0]?.value || TEXT_TO_SPEECH_DEFAULTS.language;
    populateSelect(elements.language, languageOptions, language);
    const result = filterTextToSpeechVoiceOptions(state.voiceOptions, { gender, language });
    populateSelect(elements.voice, result.matchingVoices.map((option) => ({
      label: option.label,
      value: option.value
    })), selectedVoice);
    if (elements.voice && !elements.voice.value && result.matchingVoices[0]) {
      elements.voice.value = result.matchingVoices[0].value;
    }
    if (elements.voice && result.matchingVoices.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = state.voiceOptions.length ? `No ${result.genderLabel} voices for ${language}` : "No browser voices available";
      elements.voice.replaceChildren(option);
    }
    setTextContent(root, "[data-tts-voice-count]", String(state.voiceOptions.length));
    setTextContent(root, "[data-tts-voice-details]", state.voiceOptions.length
      ? `${result.matchingVoices.length} matching ${result.genderLabel} voice${result.matchingVoices.length === 1 ? "" : "s"} for ${language}.`
      : "No SpeechSynthesis voices loaded.");
    refreshActionState();
    return result;
  }

  function refreshActionState() {
    const hasText = Boolean(String(elements.text?.value || "").trim());
    const hasVoice = Boolean(elements.voice?.value);
    const supported = engine.isSupported();
    if (elements.speak) elements.speak.disabled = !(supported && hasText && hasVoice && selectedItem());
    if (elements.pause) elements.pause.disabled = !(engine.canPause() && selectedItem());
    if (elements.resume) elements.resume.disabled = !(engine.canResume() && selectedItem());
    if (elements.stop) elements.stop.disabled = !(supported && selectedItem());
    if (elements.copyJson) elements.copyJson.disabled = isWorkspaceLaunch();
    if (elements.exportJson) elements.exportJson.disabled = isWorkspaceLaunch();
    if (elements.importJson) elements.importJson.disabled = isWorkspaceLaunch();
    setTextContent(root, "[data-tts-text-count]", String(String(elements.text?.value || "").length));
  }

  function isWorkspaceLaunch() {
    const params = new URLSearchParams(window.location.search);
    return params.get("launch") === "workspace"
      && params.get("fromTool") === "workspace-manager-v2"
      && Boolean(params.get("hostContextId"));
  }

  function applyLaunchMode() {
    const workspaceLaunch = isWorkspaceLaunch();
    if (elements.standaloneActions) elements.standaloneActions.hidden = workspaceLaunch;
    if (elements.workspaceActions) elements.workspaceActions.hidden = !workspaceLaunch;
  }

  function workspaceManagerUrl() {
    const url = new URL("../workspace-manager-v2/index.html", window.location.href);
    const params = new URLSearchParams(window.location.search);
    const hostContextId = params.get("hostContextId") || "";
    if (hostContextId) url.searchParams.set("hostContextId", hostContextId);
    if (params.get("workspaceMode")?.toLowerCase() === "uat") url.searchParams.set("workspace", "uat");
    return url.href;
  }

  async function loadQueue() {
    if (isWorkspaceLaunch()) {
      const rawToolState = window.sessionStorage.getItem(WORKSPACE_TOOL_STATE_KEY);
      if (!rawToolState) {
        writeStatus(`Workspace launch missing ${WORKSPACE_TOOL_STATE_KEY}; queue cannot render.`, "FAIL");
        return;
      }
      try {
        const toolState = JSON.parse(rawToolState);
        const payload = toolState?.data ?? [];
        const validation = validateTextToSpeechPayload(payload, WORKSPACE_TOOL_STATE_KEY);
        if (!validation.ok) {
          writeStatus(validation.message, "FAIL");
          return;
        }
        state.queue = payload.map((item) => ({ ...item }));
        writeStatus(`Loaded ${state.queue.length} ${TEXT_TO_SPEECH_DISPLAY_NAME} item(s) from Project Workspace toolState.`);
      } catch (error) {
        writeStatus(`${WORKSPACE_TOOL_STATE_KEY} is invalid JSON: ${error.message}`, "FAIL");
        return;
      }
    } else {
      const params = new URLSearchParams(window.location.search);
      const samplePresetPath = String(params.get(TTS_URL_SOURCE_PARAM) || "").trim();
      if (samplePresetPath) {
        try {
          const response = await fetch(samplePresetPath, { cache: "no-store" });
          if (!response.ok) throw new Error(`${response.status}`);
          const payload = await response.json();
          const validation = validateTextToSpeechPayload(payload, samplePresetPath);
          if (!validation.ok) {
            writeStatus(validation.message, "FAIL");
            return;
          }
          state.queue = payload.map((item) => ({ ...item }));
          writeStatus(`Loaded preset for ${TEXT_TO_SPEECH_DISPLAY_NAME}: ${samplePresetPath}.`);
        } catch (error) {
          writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} URL JSON source ${samplePresetPath} failed: ${error.message}.`, "FAIL");
          return;
        }
      }
    }
    if (state.queue.length === 0) {
      state.queue = [createTextToSpeechQueueItem({
        ...TEXT_TO_SPEECH_DEFAULTS,
        existingItems: [],
        name: "Narrator welcome",
        text: elements.text?.value || "Welcome to the arena, hero."
      })];
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} empty launch: created a local named sentence draft.`);
    }
    state.selectedItemId = state.queue[0]?.id || "";
    renderQueue();
    if (state.selectedItemId) selectItem(state.selectedItemId, { writeLog: false });
  }

  async function importJson(file) {
    if (isWorkspaceLaunch()) {
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} Import JSON is only available during standalone launch.`, "FAIL");
      return;
    }
    if (!file) {
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} Import JSON blocked: choose a JSON file first.`, "FAIL");
      return;
    }
    try {
      const payload = JSON.parse(await readFileText(file));
      const validation = validateTextToSpeechPayload(payload, file.name || "selected JSON file");
      if (!validation.ok) {
        writeStatus(`Import JSON blocked: ${validation.message}`, "FAIL");
        return;
      }
      state.queue = payload.map((item) => ({ ...item }));
      state.selectedItemId = state.queue[0]?.id || "";
      renderQueue();
      if (state.selectedItemId) selectItem(state.selectedItemId, { writeLog: false });
      writeStatus(`Imported ${state.queue.length} ${TEXT_TO_SPEECH_DISPLAY_NAME} item(s) from ${file.name || "selected JSON file"}; schema=${TEXT_TO_SPEECH_SCHEMA_ID}.`);
    } catch (error) {
      writeStatus(`Import JSON failed: ${error.message}`, "FAIL");
    }
  }

  async function copyJson() {
    const json = JSON.stringify(state.queue, null, 2);
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      writeStatus("Copy JSON failed: Clipboard API is unavailable.", "FAIL");
      return;
    }
    try {
      await navigator.clipboard.writeText(json);
      writeStatus(`Copied ${TEXT_TO_SPEECH_DISPLAY_NAME} JSON root array to clipboard (${state.queue.length} item(s)).`);
    } catch (error) {
      writeStatus(`Copy JSON failed: ${error.message}`, "FAIL");
    }
  }

  function exportJson() {
    downloadTextFile(JSON.stringify(state.queue, null, 2), "text-to-speech-v2.json");
    writeStatus(`Exported ${TEXT_TO_SPEECH_DISPLAY_NAME} JSON root array (${state.queue.length} item(s)).`);
  }

  function speak() {
    const item = selectedItem();
    if (!item) {
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} Speak blocked: select a named speech item with text first.`, "FAIL");
      return;
    }
    syncSelectedItemFromControls("speak-sync", ["speechOptions", "text"]);
    const request = createSpeechPreviewRequest({
      ...currentOptions(),
      text: elements.text?.value,
      voiceOptions: selectedVoiceOptions()
    });
    if (!request.ok) {
      writeStatus(request.message, "FAIL");
      refreshActionState();
      return;
    }
    const result = engine.speak({
      ...currentOptions(),
      speechItemId: item.id,
      speechItemName: item.name,
      text: request.text
    });
    if (!result.ok) {
      writeStatus(result.message, "FAIL");
      refreshActionState();
      return;
    }
    writeStatus(`Speech queued: ${result.speechItemName}; ${result.language}; voice=${result.voiceName}; rate=${result.rate}; pitch=${result.pitch}; volume=${result.volume}; queuedItems=${result.queuedSpeechItems.length}.`);
    renderOutputSummary();
    refreshActionState();
  }

  function pause() {
    const result = engine.pause();
    if (!result.ok) {
      writeStatus(result.message, "FAIL");
      return;
    }
    writeStatus("Speech paused.");
  }

  function resume() {
    const result = engine.resume();
    if (!result.ok) {
      writeStatus(result.message, "FAIL");
      return;
    }
    writeStatus("Speech resumed.");
  }

  function stop() {
    const result = engine.stop();
    if (!result.ok) {
      writeStatus(result.message, "FAIL");
      return;
    }
    writeStatus(`Speech stopped. Cleared ${result.stoppedCount} queued item${result.stoppedCount === 1 ? "" : "s"}.`);
    refreshActionState();
  }

  function mountEvents() {
    elements.queueList?.addEventListener("click", (event) => {
      const itemButton = event.target.closest("[data-tts-queue-item]");
      if (itemButton) selectItem(itemButton.dataset.ttsQueueItem || "");
    });
    elements.addItem?.addEventListener("click", addItem);
    elements.duplicateItem?.addEventListener("click", duplicateItem);
    elements.deleteItem?.addEventListener("click", deleteItem);
    elements.speak?.addEventListener("click", speak);
    elements.pause?.addEventListener("click", pause);
    elements.resume?.addEventListener("click", resume);
    elements.stop?.addEventListener("click", stop);
    elements.clearStatus?.addEventListener("click", () => {
      if (elements.statusLog) elements.statusLog.value = "";
      if (elements.status) elements.status.textContent = "Status cleared.";
    });
    elements.importJson?.addEventListener("click", () => elements.importJsonInput?.click());
    elements.importJsonInput?.addEventListener("change", () => {
      void importJson(elements.importJsonInput.files?.[0] || null);
      elements.importJsonInput.value = "";
    });
    elements.copyJson?.addEventListener("click", () => {
      void copyJson();
    });
    elements.exportJson?.addEventListener("click", exportJson);
    elements.returnWorkspace?.addEventListener("click", () => {
      window.location.href = workspaceManagerUrl();
    });
    elements.itemName?.addEventListener("input", () => syncSelectedItemFromControls("speech-item-renamed", ["name"]));
    elements.text?.addEventListener("input", () => {
      syncSelectedItemFromControls("text-updated", ["text"]);
      refreshActionState();
    });
    [elements.gender, elements.language].forEach((select) => {
      select?.addEventListener("change", () => {
        refreshVoices();
        syncSelectedItemFromControls("voice-filter-updated", ["gender", "language", "voice"]);
      });
    });
    elements.voice?.addEventListener("change", () => syncSelectedItemFromControls("voice-updated", ["voice"]));
    elements.characterPreset?.addEventListener("change", () => {
      if (elements.ssmlPreset) {
        elements.ssmlPreset.value = TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS[elements.characterPreset.value]?.ssmlLikePreset || "normal";
      }
      applyShapedOptions({ resetOverrides: true });
      syncSelectedItemFromControls("character-preset-updated", ["characterPreset", "rate", "pitch", "volume"]);
    });
    [elements.age, elements.ssmlPreset].forEach((select) => {
      select?.addEventListener("change", () => {
        applyShapedOptions();
        syncSelectedItemFromControls("speech-shaping-updated", ["voiceAge", "ssmlLikePreset", "rate", "pitch", "volume"]);
      });
    });
    [
      { input: elements.pitch, kind: "pitch" },
      { input: elements.rate, kind: "rate" },
      { input: elements.volume, kind: "volume" }
    ].forEach(({ input, kind }) => {
      input?.addEventListener("input", () => {
        state.sliderOverrides[kind] = true;
        syncRangeOutputs();
        syncSelectedItemFromControls(`${kind}-updated`, [kind]);
        refreshActionState();
      });
      input?.addEventListener("dblclick", () => {
        state.sliderOverrides[kind] = false;
        applyShapedOptions();
        syncSelectedItemFromControls(`${kind}-reset`, [kind]);
      });
    });
  }

  function populateStaticControls() {
    populateSelect(elements.gender, TEXT_TO_SPEECH_GENDER_FILTER_OPTIONS, TEXT_TO_SPEECH_DEFAULTS.gender);
    populateSelect(elements.age, TEXT_TO_SPEECH_AGE_FILTER_OPTIONS, TEXT_TO_SPEECH_DEFAULTS.voiceAge);
    populateSelect(elements.characterPreset, TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS, TEXT_TO_SPEECH_DEFAULTS.characterPreset);
    populateSelect(elements.ssmlPreset, TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS, TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset);
    populateSelect(elements.language, TEXT_TO_SPEECH_LANGUAGE_OPTIONS, TEXT_TO_SPEECH_DEFAULTS.language);
    configureRanges();
  }

  function markUnavailable() {
    setTextContent(root, "[data-tts-engine-label]", "Unavailable");
    setTextContent(root, "[data-tts-engine-status]", "SpeechSynthesis is unavailable in this browser. Use a browser with Web Speech API support.");
    writeStatus("SpeechSynthesis is unavailable in this browser. Use a browser with Web Speech API support.", "FAIL");
    populateSelect(elements.voice, [{ label: "No browser voices available", value: "" }], "");
    refreshActionState();
  }

  async function start() {
    applyLaunchMode();
    populateStaticControls();
    mountEvents();
    if (!engine.isSupported()) {
      await loadQueue();
      markUnavailable();
      return;
    }
    setTextContent(root, "[data-tts-engine-label]", "Ready");
    setTextContent(root, "[data-tts-engine-status]", "Browser SpeechSynthesis is available for local preview.");
    refreshVoices();
    engine.onVoicesChanged(() => {
      refreshVoices();
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} voices updated from browser SpeechSynthesis.`);
    });
    await loadQueue();
    refreshVoices({ selectedVoice: selectedItem()?.voice || elements.voice?.value || "" });
    writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} ready. SpeechSynthesis is available.`);
  }

  void start().catch((error) => {
    writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} startup failed: ${error.message}`, "FAIL");
  });

  return {
    engine,
    queue: () => state.queue.map((item) => ({ ...item })),
    speechSupported: engine.isSupported()
  };
}

if (typeof document !== "undefined") {
  initializeTextToSpeechTool(document);
}

export {
  TTS_LANGUAGES,
  TTS_MESSAGE_STATUSES,
  TTS_OWNERSHIP,
  TTS_PROVIDER_ADAPTER_PLAN,
  createEmotionProfile,
  createSpeechPreviewRequest,
  createTtsMessage,
  createVoiceProfile,
  initializeTextToSpeechTool,
  previewTtsMessage,
  validateTextToSpeechPayload
};
