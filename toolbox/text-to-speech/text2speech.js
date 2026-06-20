import {
  TEXT_TO_SPEECH_AGE_FILTER_OPTIONS,
  TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS,
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_GENDER_FILTER_OPTIONS,
  TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
  TEXT_TO_SPEECH_RANGE_DEFAULTS,
  TEXT_TO_SPEECH_SCHEMA_ID,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS,
  TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS,
} from "../../src/engine/audio/TextToSpeechDefaults.js";
import { TextToSpeechEngine } from "../../src/engine/audio/TextToSpeechEngine.js";
import {
  downloadTextFile,
  readFileText,
} from "../../src/engine/persistence/FilePersistenceService.js";

const WORKSPACE_TOOL_STATE_KEY = "workspace.tools.text2speech-V2";
const URL_SOURCE_PARAM = "samplePresetPath";

const TTS_OWNERSHIP = Object.freeze({
  DESIGN: "Design",
  AUDIO: "Audio",
});

const TTS_MESSAGE_STATUSES = Object.freeze([
  "draft",
  "ready-for-preview",
  "speaking",
  "paused",
  "stopped",
  "blocked",
  "archived",
]);

const TTS_LANGUAGES = Object.freeze(TEXT_TO_SPEECH_LANGUAGE_OPTIONS.map((option) => ({
  code: option.value,
  name: option.label,
})));

const TTS_ARCHIVED_FEATURE_INVENTORY = Object.freeze([
  "Import JSON",
  "Copy JSON",
  "Export JSON",
  "Project Workspace return launch",
  "Name field for speech items",
  "Add named sentence",
  "Duplicate named sentence",
  "Delete named sentence",
  "Editable speech text",
  "Gender helper filter",
  "Language voice filter",
  "Browser voice selection",
  "Voice details",
  "Voice age shaping",
  "Character preset shaping",
  "SSML-like preset shaping",
  "Volume slider",
  "Rate slider",
  "Pitch slider",
  "Speak playback",
  "Pause playback",
  "Resume playback",
  "Stop playback",
  "Named sentence queue",
  "Output summary JSON",
  "Status log with clear",
  "URL JSON sample source",
  "Workspace session payload loading",
]);

const TTS_PROVIDER_ADAPTER_PLAN = Object.freeze([
  {
    key: "browser-speech",
    name: "Browser Speech Synthesis",
    status: "implemented",
    boundary: "Local browser Web Speech API preview; no generated files.",
    requiredCapabilities: ["text input", "voice selection", "rate", "pitch", "volume", "speak", "pause", "resume", "stop"],
  },
  {
    key: "openai",
    name: "OpenAI",
    status: "planned",
    boundary: "External provider adapter; no implementation in this PR.",
    requiredCapabilities: ["text input", "voice selection", "generated audio file response", "usage metadata"],
  },
  {
    key: "elevenlabs",
    name: "ElevenLabs",
    status: "planned",
    boundary: "External provider adapter; no implementation in this PR.",
    requiredCapabilities: ["text input", "voice profile mapping", "generated audio file response", "provider job metadata"],
  },
  {
    key: "azure",
    name: "Azure AI Speech",
    status: "planned",
    boundary: "External provider adapter; no implementation in this PR.",
    requiredCapabilities: ["SSML-safe text", "language mapping", "voice deployment mapping", "generated audio file response"],
  },
  {
    key: "local",
    name: "Local Provider",
    status: "planned",
    boundary: "Local/offline adapter; no implementation in this PR.",
    requiredCapabilities: ["local model availability", "voice preset mapping", "file output", "device/runtime capability reporting"],
  },
]);

const RANGE_LIMITS = Object.freeze({
  pitch: Object.freeze({ fallback: TEXT_TO_SPEECH_DEFAULTS.pitch, max: TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch.max, min: TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch.min }),
  rate: Object.freeze({ fallback: TEXT_TO_SPEECH_DEFAULTS.rate, max: TEXT_TO_SPEECH_RANGE_DEFAULTS.rate.max, min: TEXT_TO_SPEECH_RANGE_DEFAULTS.rate.min }),
  volume: Object.freeze({ fallback: TEXT_TO_SPEECH_DEFAULTS.volume, max: TEXT_TO_SPEECH_RANGE_DEFAULTS.volume.max, min: TEXT_TO_SPEECH_RANGE_DEFAULTS.volume.min }),
});

const REQUIRED_QUEUE_ITEM_FIELDS = Object.freeze([
  "id",
  "name",
  "text",
  "gender",
  "language",
  "voice",
  "voiceAge",
  "volume",
  "rate",
  "pitch",
  "characterPreset",
  "ssmlLikePreset",
]);

const CHARACTER_PRESET_VALUES = new Set(TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS.map((option) => option.value));
const GENDER_VALUES = new Set(["any", "male-preferred", "female-preferred"]);
const SSML_PRESET_VALUES = new Set(TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS.map((option) => option.value));
const VOICE_AGE_VALUES = new Set(TEXT_TO_SPEECH_AGE_FILTER_OPTIONS.map((option) => option.value));

function boundedNumber(value, { fallback, max, min }) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function createTtsMessage({
  id,
  name,
  text,
  emotionKey = "neutral",
  voiceProfileKey = "browser-speech",
  languageCode = "en-US",
  status = "draft",
  metadata = {},
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
      tags: Array.isArray(metadata.tags) ? metadata.tags.map(String) : [],
    },
    generatedAudio: null,
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
    generatedAudioOwner: TTS_OWNERSHIP.AUDIO,
  };
}

function slugFromName(name) {
  const slug = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "speech-item";
}

function payloadGenderValue(value) {
  return value === "neutral" ? "any" : String(value || "any");
}

function createSpeechQueueItem({
  characterPreset = TEXT_TO_SPEECH_DEFAULTS.characterPreset,
  gender = TEXT_TO_SPEECH_DEFAULTS.gender,
  id,
  language = TEXT_TO_SPEECH_DEFAULTS.language,
  name,
  pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
  rate = TEXT_TO_SPEECH_DEFAULTS.rate,
  ssmlLikePreset = TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
  text = "",
  voice = TEXT_TO_SPEECH_DEFAULTS.voice,
  voiceAge = TEXT_TO_SPEECH_DEFAULTS.voiceAge,
  volume = TEXT_TO_SPEECH_DEFAULTS.volume,
} = {}) {
  const itemName = String(name || "New speech item").trim() || "New speech item";
  return {
    id: String(id || slugFromName(itemName)),
    name: itemName,
    text: String(text || ""),
    gender: GENDER_VALUES.has(payloadGenderValue(gender)) ? payloadGenderValue(gender) : TEXT_TO_SPEECH_DEFAULTS.gender,
    language: String(language || TEXT_TO_SPEECH_DEFAULTS.language),
    voice: String(voice || ""),
    voiceAge: VOICE_AGE_VALUES.has(String(voiceAge)) ? String(voiceAge) : TEXT_TO_SPEECH_DEFAULTS.voiceAge,
    volume: boundedNumber(volume, RANGE_LIMITS.volume),
    rate: boundedNumber(rate, RANGE_LIMITS.rate),
    pitch: boundedNumber(pitch, RANGE_LIMITS.pitch),
    characterPreset: CHARACTER_PRESET_VALUES.has(String(characterPreset)) ? String(characterPreset) : TEXT_TO_SPEECH_DEFAULTS.characterPreset,
    ssmlLikePreset: SSML_PRESET_VALUES.has(String(ssmlLikePreset)) ? String(ssmlLikePreset) : TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
  };
}

function validateSpeechPayload(payload) {
  if (!Array.isArray(payload)) {
    return { ok: false, message: "Text To Speech JSON must be a root array of named speech items." };
  }
  const errors = [];
  payload.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`item ${index + 1}: expected object`);
      return;
    }
    REQUIRED_QUEUE_ITEM_FIELDS.forEach((field) => {
      if (!Object.prototype.hasOwnProperty.call(item, field)) {
        errors.push(`item ${index + 1}: ${field} is required`);
      }
    });
    if (!String(item.id || "").trim()) errors.push(`item ${index + 1}: id is required`);
    if (!String(item.name || "").trim()) errors.push(`item ${index + 1}: name is required`);
    if (!String(item.text || "").trim()) errors.push(`item ${index + 1}: text is required`);
    if (!GENDER_VALUES.has(String(item.gender))) errors.push(`item ${index + 1}: gender must be any, male-preferred, or female-preferred`);
    if (!VOICE_AGE_VALUES.has(String(item.voiceAge))) errors.push(`item ${index + 1}: voiceAge is invalid`);
    if (!CHARACTER_PRESET_VALUES.has(String(item.characterPreset))) errors.push(`item ${index + 1}: characterPreset is invalid`);
    if (!SSML_PRESET_VALUES.has(String(item.ssmlLikePreset))) errors.push(`item ${index + 1}: ssmlLikePreset is invalid`);
    if (boundedNumber(item.volume, RANGE_LIMITS.volume) !== Number(item.volume)) errors.push(`item ${index + 1}: volume must be 0-1`);
    if (boundedNumber(item.rate, RANGE_LIMITS.rate) !== Number(item.rate)) errors.push(`item ${index + 1}: rate must be 0.1-2`);
    if (boundedNumber(item.pitch, RANGE_LIMITS.pitch) !== Number(item.pitch)) errors.push(`item ${index + 1}: pitch must be 0.1-2`);
  });
  return errors.length
    ? { ok: false, message: errors.join(" | ") }
    : { ok: true };
}

function normalizeSpeechPayload(payload) {
  const validation = validateSpeechPayload(payload);
  if (!validation.ok) return validation;
  return {
    ok: true,
    payload: payload.map((item) => createSpeechQueueItem(item)),
  };
}

function createSpeechPreviewRequest({
  characterPreset = TEXT_TO_SPEECH_DEFAULTS.characterPreset,
  gender = TEXT_TO_SPEECH_DEFAULTS.gender,
  language = TEXT_TO_SPEECH_DEFAULTS.language,
  pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
  rate = TEXT_TO_SPEECH_DEFAULTS.rate,
  speechItemId = "browser-preview",
  speechItemName = "Browser Preview",
  ssmlLikePreset = TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
  text = "",
  voice = "",
  voiceAge = TEXT_TO_SPEECH_DEFAULTS.voiceAge,
  voiceOptions = [],
  volume = TEXT_TO_SPEECH_DEFAULTS.volume,
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
    characterPreset,
    gender: payloadGenderValue(gender),
    language: language || selectedVoice.language || TEXT_TO_SPEECH_DEFAULTS.language,
    ok: true,
    pitch: boundedNumber(pitch, RANGE_LIMITS.pitch),
    rate: boundedNumber(rate, RANGE_LIMITS.rate),
    speechItemId,
    speechItemName,
    ssmlLikePreset,
    text: normalizedText,
    voice: selectedVoice.value,
    voiceAge,
    voiceName: selectedVoice.name || selectedVoice.label || "selected voice",
    volume: boundedNumber(volume, RANGE_LIMITS.volume),
  };
}

function previewTtsMessage(message, options = {}) {
  return createSpeechPreviewRequest({
    ...options,
    text: message?.text,
  });
}

function populateSelect(select, options, selectedValue) {
  if (!select) return;
  select.replaceChildren(...options.map((option) => {
    const node = document.createElement("option");
    node.value = String(option.value);
    node.textContent = String(option.label);
    node.selected = String(option.value) === String(selectedValue);
    return node;
  }));
}

function optionLabelCompare(left, right) {
  return String(left.label).localeCompare(String(right.label), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function voiceGender(option) {
  const voiceText = `${option.gender || ""} ${option.name || ""} ${option.label || ""}`;
  const voiceLanguage = String(option.language || "").toLowerCase();
  if (/\bneutral\b|\bnon[-\s]?binary\b|\bandrogynous\b/i.test(voiceText)) return "neutral";
  if (voiceLanguage === "es-es" || /\bmale\b|\bman\b|\bdavid\b|\bmark\b/i.test(voiceText)) return "male";
  if (/\bfemale\b|\bwoman\b|\bzira\b/i.test(voiceText)) return "female";
  return "unknown";
}

function genderFilterLabel(value) {
  if (value === "male-preferred") return "Male";
  if (value === "female-preferred") return "Female";
  if (value === "neutral") return "Neutral";
  return "Any";
}

function ageFilterLabel(value) {
  if (value === "adult") return "Adult";
  if (value === "child") return "Child";
  if (value === "elderly") return "Elderly";
  if (value === "teen") return "Teen";
  return "Any";
}

function voicesForGender(voiceOptions, genderFilter) {
  if (genderFilter === "male-preferred") return voiceOptions.filter((option) => voiceGender(option) === "male");
  if (genderFilter === "female-preferred") return voiceOptions.filter((option) => voiceGender(option) === "female");
  if (genderFilter === "neutral") return voiceOptions.filter((option) => ["neutral", "unknown"].includes(voiceGender(option)));
  return voiceOptions;
}

function languageOptionsFromVoices(voiceOptions) {
  const languageCounts = new Map();
  voiceOptions.forEach((option) => {
    const language = String(option.language || "").trim();
    if (language) languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
  });
  return Array.from(languageCounts.entries())
    .map(([language, count]) => ({ label: `${language} (${count} ${count === 1 ? "voice" : "voices"})`, value: language }))
    .sort(optionLabelCompare);
}

function shapedSliderValue(value, input) {
  const min = Number(input?.min || 0);
  const max = Number(input?.max || 1);
  const clamped = Math.min(max, Math.max(min, Number(value)));
  const step = String(input?.step || "1");
  const decimalPart = step.includes(".") ? step.split(".")[1] : "";
  const multiplier = 10 ** decimalPart.length;
  return String(Math.round(clamped * multiplier) / multiplier);
}

function setTextContent(root, selector, text) {
  const node = root.querySelector(selector);
  if (node) node.textContent = text;
}

function setStatus(root, message, state = "info") {
  const status = root.querySelector("[data-tts-status]");
  if (!status) return;
  status.textContent = message;
  status.dataset.ttsStatusState = state;
}

function writeStatus(root, message, state = "ready") {
  const prefix = state === "error" ? "FAIL" : "OK";
  setStatus(root, message, state);
  const log = root.querySelector("[data-tts-status-log]");
  if (!log) return;
  const line = `${prefix} ${message}`;
  log.value = log.value ? `${log.value}\n${line}` : line;
  log.scrollTop = log.scrollHeight;
}

function queueItemMeta(item) {
  return [item.language || "no language", item.characterPreset || "manual", item.voiceAge || "any"].join(" / ");
}

function controlsFromRoot(root) {
  return {
    addButton: root.querySelector("[data-tts-add-item]"),
    ageFilter: root.querySelector("[data-tts-age-filter]"),
    characterPreset: root.querySelector("[data-tts-character-preset]"),
    clearStatusButton: root.querySelector("[data-tts-clear-status]"),
    copyJsonButton: root.querySelector("[data-tts-copy-json]"),
    deleteButton: root.querySelector("[data-tts-delete-item]"),
    duplicateButton: root.querySelector("[data-tts-duplicate-item]"),
    exportJsonButton: root.querySelector("[data-tts-export-json]"),
    genderFilter: root.querySelector("[data-tts-gender-filter]"),
    importJsonButton: root.querySelector("[data-tts-import-json]"),
    importJsonInput: root.querySelector("[data-tts-import-json-input]"),
    jsonActions: root.querySelector("[data-tts-tool-json-actions]"),
    languageSelect: root.querySelector("[data-tts-language-select]"),
    nameInput: root.querySelector("[data-tts-name-input]"),
    outputSummary: root.querySelector("[data-tts-output-summary]"),
    pauseButton: root.querySelector("[data-tts-pause]"),
    pitchInput: root.querySelector("[data-tts-pitch]"),
    pitchValue: root.querySelector("[data-tts-pitch-value]"),
    queueList: root.querySelector("[data-tts-queue-list]"),
    rateInput: root.querySelector("[data-tts-rate]"),
    rateValue: root.querySelector("[data-tts-rate-value]"),
    resumeButton: root.querySelector("[data-tts-resume]"),
    returnWorkspaceButton: root.querySelector("[data-tts-return-workspace]"),
    speakButton: root.querySelector("[data-tts-speak]"),
    ssmlPreset: root.querySelector("[data-tts-ssml-preset]"),
    statusLog: root.querySelector("[data-tts-status-log]"),
    stopButton: root.querySelector("[data-tts-stop]"),
    textInput: root.querySelector("[data-tts-text-input]"),
    voiceSelect: root.querySelector("[data-tts-voice-select]"),
    volumeInput: root.querySelector("[data-tts-volume]"),
    volumeValue: root.querySelector("[data-tts-volume-value]"),
  };
}

function isProjectWorkspaceLaunch(windowRef) {
  const params = new URLSearchParams(windowRef.location?.search || "");
  return params.get("launch") === "workspace"
    && params.get("fromTool") === "workspace-manager-v2"
    && Boolean(params.get("hostContextId"));
}

function workspaceReturnUrl(windowRef) {
  const url = new URL("../workspace-manager-v2/index.html", windowRef.location?.href || "http://localhost/toolbox/text-to-speech/index.html");
  const params = new URLSearchParams(windowRef.location?.search || "");
  const hostContextId = params.get("hostContextId") || "";
  if (hostContextId) url.searchParams.set("hostContextId", hostContextId);
  if (params.get("workspaceMode")?.toLowerCase() === "uat") url.searchParams.set("workspace", "uat");
  return url.href;
}

function initializeTextToSpeechTool(root = document, {
  engine = new TextToSpeechEngine(),
  windowRef = globalThis.window || globalThis,
} = {}) {
  const controls = controlsFromRoot(root);
  const state = {
    filteredVoiceOptions: [],
    matchingVoiceOptions: [],
    queue: [],
    selectedId: "",
    sliderOverrides: { pitch: false, rate: false, volume: false },
    voiceOptions: [],
  };

  function selectedItem() {
    return state.queue.find((item) => item.id === state.selectedId) || null;
  }

  function uniqueItemName(baseName) {
    const requestedName = String(baseName || "New speech item").trim() || "New speech item";
    const names = new Set(state.queue.map((item) => item.name));
    if (!names.has(requestedName)) return requestedName;
    for (let index = 2; index < 1000; index += 1) {
      const candidate = `${requestedName} ${index}`;
      if (!names.has(candidate)) return candidate;
    }
    return `${requestedName} ${Date.now().toString(36)}`;
  }

  function uniqueItemId(baseName) {
    const ids = new Set(state.queue.map((item) => item.id));
    const baseId = slugFromName(baseName);
    if (!ids.has(baseId)) return baseId;
    for (let index = 2; index < 1000; index += 1) {
      const candidate = `${baseId}-${index}`;
      if (!ids.has(candidate)) return candidate;
    }
    return `${baseId}-${Date.now().toString(36)}`;
  }

  function currentControlsItem(overrides = {}) {
    const itemName = String(overrides.name ?? controls.nameInput?.value ?? "").trim();
    return createSpeechQueueItem({
      characterPreset: controls.characterPreset?.value,
      gender: controls.genderFilter?.value,
      id: overrides.id || selectedItem()?.id || uniqueItemId(itemName || "Browser Preview"),
      language: controls.languageSelect?.value,
      name: itemName || overrides.fallbackName || selectedItem()?.name || "Browser Preview",
      pitch: controls.pitchInput?.value,
      rate: controls.rateInput?.value,
      ssmlLikePreset: controls.ssmlPreset?.value,
      text: controls.textInput?.value,
      voice: controls.voiceSelect?.value,
      voiceAge: controls.ageFilter?.value,
      volume: controls.volumeInput?.value,
    });
  }

  function renderSummary() {
    setTextContent(root, "[data-tts-queue-count]", String(state.queue.length));
    if (controls.outputSummary) {
      controls.outputSummary.textContent = JSON.stringify(state.queue, null, 2);
    }
  }

  function renderQueue() {
    if (!controls.queueList) return;
    controls.queueList.replaceChildren();
    if (state.queue.length === 0) {
      const empty = document.createElement("p");
      empty.className = "field-hint";
      empty.textContent = "No named sentences.";
      controls.queueList.append(empty);
      renderSummary();
      return;
    }
    state.queue.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn";
      button.dataset.ttsQueueItemId = item.id;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(item.id === state.selectedId));
      button.textContent = `${item.name} - ${queueItemMeta(item)}`;
      controls.queueList.append(button);
    });
    renderSummary();
  }

  function refreshActionState() {
    const hasText = Boolean(String(controls.textInput?.value || "").trim());
    const hasVoice = Boolean(controls.voiceSelect?.value);
    const supported = engine.isSupported();
    const canPreview = supported && hasText && hasVoice;
    if (controls.speakButton) controls.speakButton.disabled = !canPreview;
    if (controls.pauseButton) controls.pauseButton.disabled = !(canPreview && engine.canPause());
    if (controls.resumeButton) controls.resumeButton.disabled = !(canPreview && engine.canResume());
    if (controls.stopButton) controls.stopButton.disabled = !supported;
    if (controls.duplicateButton) controls.duplicateButton.disabled = !selectedItem();
    if (controls.deleteButton) controls.deleteButton.disabled = !selectedItem();
    setTextContent(root, "[data-tts-text-count]", String(String(controls.textInput?.value || "").length));
  }

  function syncRange(input, output, kind) {
    if (!input) return;
    input.value = shapedSliderValue(boundedNumber(input.value, RANGE_LIMITS[kind]), input);
    if (output) output.textContent = input.value;
  }

  function syncRanges() {
    syncRange(controls.rateInput, controls.rateValue, "rate");
    syncRange(controls.pitchInput, controls.pitchValue, "pitch");
    syncRange(controls.volumeInput, controls.volumeValue, "volume");
  }

  function markWorkspaceDirty(reason, changedKeys) {
    if (!isProjectWorkspaceLaunch(windowRef)) return;
    const rawToolState = windowRef.sessionStorage?.getItem(WORKSPACE_TOOL_STATE_KEY);
    if (!rawToolState) {
      writeStatus(root, `Project Workspace dirty state skipped: missing ${WORKSPACE_TOOL_STATE_KEY}.`, "error");
      return;
    }
    try {
      const toolState = JSON.parse(rawToolState);
      windowRef.sessionStorage.setItem(WORKSPACE_TOOL_STATE_KEY, JSON.stringify({
        ...toolState,
        data: state.queue,
        dirty: {
          isDirty: true,
          reason,
          changedAt: new Date().toISOString(),
          changedKeys,
        },
      }));
      writeStatus(root, `Project Workspace dirty state: true; reason=${reason}; queue=${state.queue.length}.`, "ready");
    } catch (error) {
      writeStatus(root, `Project Workspace dirty state failed: ${error.message}`, "error");
    }
  }

  function syncSelectedItem(reason = "settings-updated", changedKeys = ["speechOptions"]) {
    const item = selectedItem();
    if (!item) {
      renderSummary();
      refreshActionState();
      return;
    }
    const nextItem = currentControlsItem({ id: item.id, name: controls.nameInput?.value || item.name });
    const index = state.queue.findIndex((entry) => entry.id === item.id);
    if (index >= 0) {
      state.queue[index] = nextItem;
      state.selectedId = nextItem.id;
      renderQueue();
      markWorkspaceDirty(reason, changedKeys);
    }
    refreshActionState();
  }

  function voiceDetailsText() {
    if (state.voiceOptions.length === 0) return "No SpeechSynthesis voices loaded.";
    if (state.filteredVoiceOptions.length === 0) {
      return `0 voices match ${genderFilterLabel(controls.genderFilter?.value)}.\n${state.voiceOptions.length} total voices loaded.`;
    }
    if (state.matchingVoiceOptions.length === 0) {
      return `0 voices match ${genderFilterLabel(controls.genderFilter?.value)} for ${controls.languageSelect?.value || "selected language"}.`;
    }
    return `${state.matchingVoiceOptions.length} voices match ${genderFilterLabel(controls.genderFilter?.value)}:\n${state.matchingVoiceOptions
      .map((option) => `- ${option.language || "unknown"}: ${option.name || option.label}`)
      .join("\n")}`;
  }

  function refreshVoices({ selectedVoice = undefined, source = "initial" } = {}) {
    const previousLanguage = controls.languageSelect?.value || TEXT_TO_SPEECH_DEFAULTS.language;
    const previousVoice = selectedVoice === undefined ? controls.voiceSelect?.value || "" : selectedVoice;
    state.voiceOptions = engine.voiceOptions();
    state.filteredVoiceOptions = voicesForGender(state.voiceOptions, controls.genderFilter?.value || "any");
    const voiceLanguageOptions = languageOptionsFromVoices(state.filteredVoiceOptions);
    const languageOptions = voiceLanguageOptions.length ? voiceLanguageOptions : TEXT_TO_SPEECH_LANGUAGE_OPTIONS;
    let selectedLanguage = previousLanguage;
    if (!languageOptions.some((option) => option.value === selectedLanguage)) {
      selectedLanguage = languageOptions.some((option) => option.value === TEXT_TO_SPEECH_DEFAULTS.language)
        ? TEXT_TO_SPEECH_DEFAULTS.language
        : languageOptions[0]?.value || "";
    }
    populateSelect(controls.languageSelect, languageOptions, selectedLanguage);
    if (controls.languageSelect) controls.languageSelect.value = selectedLanguage;

    state.matchingVoiceOptions = state.filteredVoiceOptions
      .filter((option) => option.language === selectedLanguage)
      .sort(optionLabelCompare);
    if (state.voiceOptions.length === 0) {
      populateSelect(controls.voiceSelect, [{ label: "No SpeechSynthesis voices available", value: "" }], "");
    } else if (state.matchingVoiceOptions.length === 0) {
      populateSelect(controls.voiceSelect, [{ label: `No ${genderFilterLabel(controls.genderFilter?.value)} voices for ${selectedLanguage}`, value: "" }], "");
    } else {
      const selected = state.matchingVoiceOptions.some((option) => option.value === previousVoice)
        ? previousVoice
        : state.matchingVoiceOptions[0].value;
      populateSelect(controls.voiceSelect, state.matchingVoiceOptions, selected);
      if (controls.voiceSelect) controls.voiceSelect.value = selected;
    }
    setTextContent(root, "[data-tts-voice-count]", String(state.voiceOptions.length));
    setTextContent(root, "[data-tts-voice-details]", voiceDetailsText());
    if (source !== "initial") {
      writeStatus(root, `Voice filter updated: gender=${genderFilterLabel(controls.genderFilter?.value)}; language=${controls.languageSelect?.value || "(none)"}; voices=${state.matchingVoiceOptions.length}.`, state.matchingVoiceOptions.length ? "ready" : "error");
    }
    syncSelectedItem("voice-filter-updated", ["voice", "language", "gender"]);
    refreshActionState();
  }

  function applyPresetDerivedSliders({ resetOverrides = false } = {}) {
    if (resetOverrides) state.sliderOverrides = { pitch: false, rate: false, volume: false };
    const characterPreset = TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS[controls.characterPreset?.value] || TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS.manual;
    const voiceAgePreset = TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS[controls.ageFilter?.value] || TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS.any;
    const ssmlPreset = TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS[controls.ssmlPreset?.value] || TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS.normal;
    if (controls.volumeInput && !state.sliderOverrides.volume) {
      controls.volumeInput.value = shapedSliderValue(Number(characterPreset.volume) * Number(ssmlPreset.volumeMultiplier), controls.volumeInput);
    }
    if (controls.rateInput && !state.sliderOverrides.rate) {
      controls.rateInput.value = shapedSliderValue(Number(characterPreset.rate) * Number(voiceAgePreset.rateMultiplier) * Number(ssmlPreset.rateMultiplier), controls.rateInput);
    }
    if (controls.pitchInput && !state.sliderOverrides.pitch) {
      controls.pitchInput.value = shapedSliderValue(Number(characterPreset.pitch) + Number(voiceAgePreset.pitchOffset) + Number(ssmlPreset.pitchOffset), controls.pitchInput);
    }
    syncRanges();
  }

  function applyQueueItem(item, source = "queue-item-selected") {
    if (!item) return;
    state.selectedId = item.id;
    if (controls.nameInput) controls.nameInput.value = item.name;
    if (controls.textInput) controls.textInput.value = item.text;
    if (controls.genderFilter) controls.genderFilter.value = item.gender === "any" ? "any" : item.gender;
    if (controls.ageFilter) controls.ageFilter.value = item.voiceAge;
    if (controls.characterPreset) controls.characterPreset.value = item.characterPreset;
    if (controls.ssmlPreset) controls.ssmlPreset.value = item.ssmlLikePreset;
    if (controls.volumeInput) controls.volumeInput.value = String(item.volume);
    if (controls.rateInput) controls.rateInput.value = String(item.rate);
    if (controls.pitchInput) controls.pitchInput.value = String(item.pitch);
    syncRanges();
    refreshVoices({ selectedVoice: item.voice, source });
    renderQueue();
    refreshActionState();
  }

  function replaceQueue(nextQueue, source = "queue-loaded") {
    state.queue = nextQueue.map((item) => createSpeechQueueItem(item));
    state.selectedId = state.queue[0]?.id || "";
    if (state.queue.length > 0) {
      applyQueueItem(state.queue[0], source);
    } else {
      renderQueue();
      refreshActionState();
    }
  }

  function addSpeechItem() {
    const requestedName = String(controls.nameInput?.value || "").trim();
    if (!requestedName) {
      writeStatus(root, "Add blocked: Name is required before creating a named sentence.", "error");
      return;
    }
    const name = uniqueItemName(requestedName);
    const item = currentControlsItem({ fallbackName: name, id: uniqueItemId(name), name });
    state.queue.push(item);
    applyQueueItem(item, "queue-item-added");
    markWorkspaceDirty("speech-item-added", [`queue.${item.id}`]);
    writeStatus(root, `Added speech item: ${item.name}.`, "ready");
  }

  function duplicateSpeechItem() {
    const item = selectedItem();
    if (!item) {
      writeStatus(root, "Duplicate failed: no named sentence is selected.", "error");
      return;
    }
    const syncedItem = currentControlsItem({ id: item.id, name: item.name });
    const name = uniqueItemName(`${syncedItem.name} copy`);
    const duplicate = createSpeechQueueItem({ ...syncedItem, id: uniqueItemId(name), name });
    state.queue.push(duplicate);
    applyQueueItem(duplicate, "queue-item-duplicated");
    markWorkspaceDirty("speech-item-duplicated", [`queue.${duplicate.id}`]);
    writeStatus(root, `Duplicated speech item: ${duplicate.name}.`, "ready");
  }

  function deleteSpeechItem() {
    const item = selectedItem();
    if (!item) {
      writeStatus(root, "Delete failed: no named sentence is selected.", "error");
      return;
    }
    const index = state.queue.findIndex((entry) => entry.id === item.id);
    state.queue.splice(index, 1);
    const nextItem = state.queue[Math.min(index, state.queue.length - 1)] || null;
    state.selectedId = nextItem?.id || "";
    if (nextItem) {
      applyQueueItem(nextItem, "queue-item-deleted");
    } else {
      if (controls.nameInput) controls.nameInput.value = "";
      renderQueue();
      renderSummary();
      refreshActionState();
    }
    markWorkspaceDirty("speech-item-deleted", ["queue"]);
    writeStatus(root, `Deleted speech item: ${item.name}.`, "ready");
  }

  function collectSpeechRequest() {
    const currentItem = selectedItem();
    return createSpeechPreviewRequest({
      ...currentControlsItem({
        fallbackName: currentItem?.name || "Browser Preview",
        id: currentItem?.id || "browser-preview",
        name: currentItem?.name || "Browser Preview",
      }),
      speechItemId: currentItem?.id || "browser-preview",
      speechItemName: currentItem?.name || "Browser Preview",
      voiceOptions: state.voiceOptions,
    });
  }

  function speak() {
    const request = collectSpeechRequest();
    if (!request.ok) {
      writeStatus(root, request.message, "error");
      refreshActionState();
      return;
    }
    const result = engine.speak(request);
    if (!result.ok) {
      writeStatus(root, result.message, "error");
      refreshActionState();
      return;
    }
    writeStatus(root, `Speech queued: ${result.speechItemName}; ${result.language}; voice=${result.voiceName}; rate=${result.rate}; pitch=${result.pitch}; volume=${result.volume}; queuedItems=${result.queuedSpeechItems.length}.`, "ready");
    syncSelectedItem("speech-previewed", ["speech"]);
  }

  function pause() {
    const result = engine.pause();
    if (!result.ok) {
      writeStatus(root, result.message, "error");
      return;
    }
    writeStatus(root, "Speech paused.", "ready");
  }

  function resume() {
    const result = engine.resume();
    if (!result.ok) {
      writeStatus(root, result.message, "error");
      return;
    }
    writeStatus(root, "Speech resumed.", "ready");
  }

  function stop() {
    const result = engine.stop();
    if (!result.ok) {
      writeStatus(root, result.message, "error");
      return;
    }
    writeStatus(root, `Speech queue stopped: ${result.stoppedCount} queued item${result.stoppedCount === 1 ? "" : "s"} cleared.`, "ready");
  }

  async function importJson(file) {
    if (!file) {
      writeStatus(root, "Import JSON blocked: choose a JSON file first.", "error");
      return;
    }
    try {
      const parsed = JSON.parse(await readFileText(file, { windowRef }));
      const normalized = normalizeSpeechPayload(parsed);
      if (!normalized.ok) {
        writeStatus(root, `Import JSON blocked: ${normalized.message}`, "error");
        return;
      }
      replaceQueue(normalized.payload, "json-imported");
      writeStatus(root, `Imported ${normalized.payload.length} Text To Speech item${normalized.payload.length === 1 ? "" : "s"} from ${file.name || "selected JSON file"}.`, "ready");
    } catch (error) {
      writeStatus(root, `Import JSON failed: ${error.message}`, "error");
    }
  }

  async function copyJson() {
    if (!windowRef.navigator?.clipboard || typeof windowRef.navigator.clipboard.writeText !== "function") {
      writeStatus(root, "Copy JSON failed: Clipboard API is unavailable.", "error");
      return;
    }
    try {
      await windowRef.navigator.clipboard.writeText(JSON.stringify(state.queue, null, 2));
      writeStatus(root, `Copied Text To Speech JSON root array to clipboard (${state.queue.length} item${state.queue.length === 1 ? "" : "s"}).`, "ready");
    } catch (error) {
      writeStatus(root, `Copy JSON failed: ${error.message}`, "error");
    }
  }

  function exportJson() {
    const didExport = downloadTextFile(`${JSON.stringify(state.queue, null, 2)}\n`, "text-to-speech-v2.json", {
      appendToBody: true,
      documentRef: root,
      windowRef,
    });
    writeStatus(root, didExport
      ? `Exported Text To Speech JSON root array (${state.queue.length} item${state.queue.length === 1 ? "" : "s"}).`
      : "Export JSON failed: browser download APIs are unavailable.", didExport ? "ready" : "error");
  }

  async function loadQueueFromUrlSource(sourcePath) {
    if (typeof windowRef.fetch !== "function") {
      writeStatus(root, "URL JSON source failed: Fetch API is unavailable.", "error");
      return false;
    }
    try {
      const response = await windowRef.fetch(sourcePath, { cache: "no-store" });
      if (!response.ok) {
        writeStatus(root, `URL JSON source ${sourcePath} failed: ${response.status}.`, "error");
        return false;
      }
      const normalized = normalizeSpeechPayload(await response.json());
      if (!normalized.ok) {
        writeStatus(root, `URL JSON source blocked: ${normalized.message}`, "error");
        return false;
      }
      replaceQueue(normalized.payload, "url-json-loaded");
      writeStatus(root, `Loaded preset for Text To Speech: ${sourcePath}.`, "ready");
      return true;
    } catch (error) {
      writeStatus(root, `URL JSON source ${sourcePath} failed: ${error.message}`, "error");
      return false;
    }
  }

  function loadWorkspaceQueue() {
    const rawToolState = windowRef.sessionStorage?.getItem(WORKSPACE_TOOL_STATE_KEY);
    if (!rawToolState) {
      writeStatus(root, `Project Workspace launch missing ${WORKSPACE_TOOL_STATE_KEY}; queue cannot render.`, "error");
      return false;
    }
    try {
      const toolState = JSON.parse(rawToolState);
      if (!Object.prototype.hasOwnProperty.call(toolState, "data") || toolState.data === null) {
        writeStatus(root, "Project Workspace launch has no Text To Speech payload.", "ready");
        return false;
      }
      const normalized = normalizeSpeechPayload(toolState.data);
      if (!normalized.ok) {
        writeStatus(root, `Project Workspace payload blocked: ${normalized.message}`, "error");
        return false;
      }
      replaceQueue(normalized.payload, "workspace-loaded");
      writeStatus(root, `Loaded ${normalized.payload.length} Project Workspace Text To Speech item${normalized.payload.length === 1 ? "" : "s"}.`, "ready");
      return true;
    } catch (error) {
      writeStatus(root, `${WORKSPACE_TOOL_STATE_KEY} is invalid JSON: ${error.message}`, "error");
      return false;
    }
  }

  async function loadInitialQueue() {
    const params = new URLSearchParams(windowRef.location?.search || "");
    if (isProjectWorkspaceLaunch(windowRef) && loadWorkspaceQueue()) return;
    const samplePresetPath = String(params.get(URL_SOURCE_PARAM) || "").trim();
    if (samplePresetPath && await loadQueueFromUrlSource(samplePresetPath)) return;
    renderQueue();
    writeStatus(root, "Text To Speech empty state: add a named sentence or preview the current text directly.", "ready");
  }

  function markUnavailable() {
    setTextContent(root, "[data-tts-engine-label]", "Unavailable");
    setTextContent(root, "[data-tts-engine-status]", "SpeechSynthesis is unavailable in this browser. Use a browser with Web Speech API support.");
    writeStatus(root, "SpeechSynthesis is unavailable in this browser. Use a browser with Web Speech API support.", "error");
    populateSelect(controls.voiceSelect, [{ label: "No browser voices available", value: "" }], "");
    if (controls.voiceSelect) controls.voiceSelect.disabled = true;
    refreshActionState();
  }

  function bindEvents() {
    controls.queueList?.addEventListener("click", (event) => {
      const tile = event.target.closest("[data-tts-queue-item-id]");
      if (!tile) return;
      const item = state.queue.find((entry) => entry.id === tile.dataset.ttsQueueItemId);
      if (item) applyQueueItem(item, "queue-item-selected");
    });
    controls.addButton?.addEventListener("click", addSpeechItem);
    controls.duplicateButton?.addEventListener("click", duplicateSpeechItem);
    controls.deleteButton?.addEventListener("click", deleteSpeechItem);
    controls.speakButton?.addEventListener("click", speak);
    controls.pauseButton?.addEventListener("click", pause);
    controls.resumeButton?.addEventListener("click", resume);
    controls.stopButton?.addEventListener("click", stop);
    controls.importJsonButton?.addEventListener("click", () => controls.importJsonInput?.click());
    controls.importJsonInput?.addEventListener("change", () => {
      const file = controls.importJsonInput?.files?.[0] || null;
      void importJson(file);
      if (controls.importJsonInput) controls.importJsonInput.value = "";
    });
    controls.copyJsonButton?.addEventListener("click", () => {
      void copyJson();
    });
    controls.exportJsonButton?.addEventListener("click", exportJson);
    controls.clearStatusButton?.addEventListener("click", () => {
      if (controls.statusLog) controls.statusLog.value = "";
    });
    controls.returnWorkspaceButton?.addEventListener("click", () => {
      windowRef.location.href = workspaceReturnUrl(windowRef);
    });
    controls.nameInput?.addEventListener("input", () => syncSelectedItem("speech-item-renamed", ["name"]));
    controls.textInput?.addEventListener("input", () => syncSelectedItem("text-updated", ["text"]));
    controls.genderFilter?.addEventListener("change", () => refreshVoices({ source: "gender-changed" }));
    controls.languageSelect?.addEventListener("change", () => refreshVoices({ source: "language-changed", selectedVoice: controls.voiceSelect?.value || "" }));
    controls.voiceSelect?.addEventListener("change", () => syncSelectedItem("voice-updated", ["voice"]));
    controls.ageFilter?.addEventListener("change", () => {
      applyPresetDerivedSliders();
      writeStatus(root, `Voice Age shaping applied: ${ageFilterLabel(controls.ageFilter?.value)}; rate=${controls.rateInput?.value}; pitch=${controls.pitchInput?.value}.`, "ready");
      syncSelectedItem("age-updated", ["voiceAge", "rate", "pitch"]);
    });
    controls.characterPreset?.addEventListener("change", () => {
      const preset = TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS[controls.characterPreset?.value];
      if (preset?.ssmlLikePreset && controls.ssmlPreset) controls.ssmlPreset.value = preset.ssmlLikePreset;
      applyPresetDerivedSliders({ resetOverrides: true });
      syncSelectedItem("character-preset-updated", ["characterPreset", "ssmlLikePreset", "rate", "pitch", "volume"]);
    });
    controls.ssmlPreset?.addEventListener("change", () => {
      applyPresetDerivedSliders({ resetOverrides: true });
      writeStatus(root, `SSML-like preset applied: ${controls.ssmlPreset?.value}; rate=${controls.rateInput?.value}; pitch=${controls.pitchInput?.value}; volume=${controls.volumeInput?.value}.`, "ready");
      syncSelectedItem("ssml-preset-updated", ["ssmlLikePreset", "rate", "pitch", "volume"]);
    });
    [
      { input: controls.pitchInput, key: "pitch", output: controls.pitchValue },
      { input: controls.rateInput, key: "rate", output: controls.rateValue },
      { input: controls.volumeInput, key: "volume", output: controls.volumeValue },
    ].forEach(({ input, key, output }) => {
      input?.addEventListener("input", () => {
        state.sliderOverrides[key] = true;
        syncRange(input, output, key);
        syncSelectedItem(`${key}-updated`, [key]);
      });
    });
  }

  populateSelect(controls.genderFilter, TEXT_TO_SPEECH_GENDER_FILTER_OPTIONS, TEXT_TO_SPEECH_DEFAULTS.gender);
  populateSelect(controls.ageFilter, TEXT_TO_SPEECH_AGE_FILTER_OPTIONS, TEXT_TO_SPEECH_DEFAULTS.voiceAge);
  populateSelect(controls.characterPreset, TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS, TEXT_TO_SPEECH_DEFAULTS.characterPreset);
  populateSelect(controls.ssmlPreset, TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS, TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset);
  populateSelect(controls.languageSelect, TEXT_TO_SPEECH_LANGUAGE_OPTIONS, TEXT_TO_SPEECH_DEFAULTS.language);
  syncRanges();
  bindEvents();

  if (isProjectWorkspaceLaunch(windowRef)) {
    if (controls.jsonActions) controls.jsonActions.hidden = true;
    if (controls.returnWorkspaceButton) controls.returnWorkspaceButton.hidden = false;
  }

  if (!engine.isSupported()) {
    markUnavailable();
    void loadInitialQueue().finally(() => {
      markUnavailable();
    });
    return { controls, engine, speechSupported: false, state };
  }

  setTextContent(root, "[data-tts-engine-label]", "Ready");
  setTextContent(root, "[data-tts-engine-status]", "Browser SpeechSynthesis is available for local preview.");
  refreshVoices({ source: "initial" });
  engine.onVoicesChanged(() => {
    refreshVoices({ source: "voiceschanged" });
  });
  void loadInitialQueue();
  refreshActionState();
  return { controls, engine, speechSupported: true, state };
}

if (typeof document !== "undefined") {
  initializeTextToSpeechTool(document);
}

export {
  TTS_ARCHIVED_FEATURE_INVENTORY,
  TTS_LANGUAGES,
  TTS_MESSAGE_STATUSES,
  TTS_OWNERSHIP,
  TTS_PROVIDER_ADAPTER_PLAN,
  createEmotionProfile,
  createSpeechPreviewRequest,
  createSpeechQueueItem,
  createTtsMessage,
  createVoiceProfile,
  initializeTextToSpeechTool,
  normalizeSpeechPayload,
  previewTtsMessage,
  validateSpeechPayload,
};
