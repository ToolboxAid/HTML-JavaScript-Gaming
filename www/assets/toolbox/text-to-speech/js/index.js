import {
  textToSpeechLanguageOptionsFromVoices,
  TextToSpeechEngine,
} from "../../../../../src/engine/audio/TextToSpeechEngine.js";
import {
  TEXT_TO_SPEECH_AGE_FILTER_OPTIONS,
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_DISPLAY_NAME,
  TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
  TEXT_TO_SPEECH_RANGE_DEFAULTS,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS
} from "../../../../../src/engine/audio/TextToSpeechDefaults.js";
import {
  createTtsProfile,
  deleteTtsProfile,
  listTtsProfiles,
  updateTtsProfile,
} from "../../../../toolbox/messages/messages-api-client.js";
import { getSessionCurrent } from "../../../../../src/api/session-api-client.js";

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
    requiredCapabilities: ["text input", "TTS Profile mapping", "generated audio file response", "provider job metadata"]
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

const TTS_PROFILE_CONTRACT_VERSION = "tts-profile-emotion-v1";
const NEW_ROW_KEY = "__new__";
const DEFAULT_TTS_PROFILE_ID = "tts-profile";
const DEFAULT_TTS_EMOTION_ID = "calm";
const SIGN_IN_ROUTE = "account/sign-in.html";
const RETIRED_TTS_PROFILE_PARENT_NAMES = Object.freeze([
  "Default Balanced Profile",
  "Hero",
  "Merchant",
  "Neutral",
  "Robot",
]);

const TTS_PROFILE_GENDER_OPTIONS = Object.freeze([
  Object.freeze({ label: "Neutral", value: "neutral" }),
  Object.freeze({ label: "Male", value: "male" }),
  Object.freeze({ label: "Female", value: "female" }),
  Object.freeze({ label: "Any", value: "any" })
]);

const TTS_PROFILE_EMOTION_OPTIONS = Object.freeze([
  Object.freeze({ label: "Happy", value: "happy" }),
  Object.freeze({ label: "Angry", value: "angry" }),
  Object.freeze({ label: "Scared", value: "scared" }),
  Object.freeze({ label: "Calm", value: "calm" }),
  Object.freeze({ label: "Urgent", value: "urgent" }),
  Object.freeze({ label: "Whisper", value: "whisper" }),
  Object.freeze({ label: "Excited", value: "excited" }),
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
  emotionKey = DEFAULT_TTS_EMOTION_ID,
  voiceProfileKey = "browser-speech",
  languageCode = "en-US",
  status = "draft",
  metadata = {}
} = {}) {
  return {
    id: String(id || "tts-message-draft"),
    name: String(name || "Untitled TTS Message"),
    text: String(text || ""),
    emotionKey: String(emotionKey || DEFAULT_TTS_EMOTION_ID),
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

function createEmotionProfile({ key = DEFAULT_TTS_EMOTION_ID, name = "Calm", intensity = 0.5 } = {}) {
  const numericIntensity = Number(intensity);
  const safeIntensity = Number.isNaN(numericIntensity) ? 0.5 : Math.min(1, Math.max(0, numericIntensity));
  return { key: String(key), name: String(name), intensity: safeIntensity, owner: TTS_OWNERSHIP.AUDIO };
}

function createVoiceProfile({ key = "browser-speech", name = "Browser Speech", providerKey = "browser-speech", voiceId = "" } = {}) {
  return {
    key: String(key),
    name: String(name),
    providerKey: String(providerKey),
    voiceId: String(voiceId),
    owner: TTS_OWNERSHIP.AUDIO,
    generatedAudioOwner: TTS_OWNERSHIP.AUDIO
  };
}

function slugFromText(value, fallback = "tts-profile") {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function labelForOption(options, value, fallback = "") {
  return options.find((option) => String(option.value) === String(value))?.label || fallback || String(value || "");
}

function isRetiredTextToSpeechProfileName(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return RETIRED_TTS_PROFILE_PARENT_NAMES.some((name) => name.toLowerCase() === normalized);
}

function createTextToSpeechProfileEmotion({
  active = true,
  displayOrder = 0,
  emotion = DEFAULT_TTS_EMOTION_ID,
  emotionLabel = "",
  id = "",
  messageUsageCount = 0,
  messagePartsUsageCount = 0,
  pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
  references = [],
  settingKey = "",
  rate = TEXT_TO_SPEECH_DEFAULTS.rate,
  ssmlLikePreset = TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
  usageCount = 0,
  volume = TEXT_TO_SPEECH_DEFAULTS.volume
} = {}) {
  const emotionKey = slugFromText(emotion, DEFAULT_TTS_EMOTION_ID);
  const messageCount = Math.max(0, Number(messageUsageCount) || 0);
  const sentenceCount = Math.max(0, Number(messagePartsUsageCount) || 0);
  return {
    active: active !== false,
    displayOrder: Number(displayOrder || 0),
    emotion: emotionKey,
    emotionLabel: String(emotionLabel || labelForOption(TTS_PROFILE_EMOTION_OPTIONS, emotionKey, emotionKey)),
    id: id || emotionKey,
    messagePartsUsageCount: sentenceCount,
    messageUsageCount: messageCount,
    pitch: boundedNumber(pitch, TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch),
    rate: boundedNumber(rate, TEXT_TO_SPEECH_RANGE_DEFAULTS.rate),
    references: Array.isArray(references) ? references : [],
    settingKey: String(settingKey || ""),
    ssmlLikePreset: TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS.some((option) => option.value === ssmlLikePreset) ? ssmlLikePreset : "normal",
    usageCount: Math.max(0, Number(usageCount) || messageCount + sentenceCount),
    volume: boundedNumber(volume, TEXT_TO_SPEECH_RANGE_DEFAULTS.volume)
  };
}

function createTextToSpeechProfile({
  active = true,
  age = TEXT_TO_SPEECH_DEFAULTS.voiceAge,
  emotions = [],
  gender = "neutral",
  id = "",
  language = TEXT_TO_SPEECH_DEFAULTS.language,
  messageStudioUsageCount = 0,
  name = "Untitled TTS Profile",
  references = [],
  segmentUsageCount = 0,
  usageCount = 0,
  voice = "",
  voiceName = ""
} = {}) {
  const profileName = String(name || "Untitled TTS Profile").trim() || "Untitled TTS Profile";
  const emotionRows = Array.isArray(emotions)
    ? emotions.map((emotion) => createTextToSpeechProfileEmotion(emotion))
    : [];
  return {
    active: active !== false,
    age: String(age || TEXT_TO_SPEECH_DEFAULTS.voiceAge),
    emotions: emotionRows,
    gender: String(gender || "neutral"),
    id: id || slugFromText(profileName, "tts-profile"),
    language: String(language || TEXT_TO_SPEECH_DEFAULTS.language),
    messageStudioUsageCount: Math.max(0, Number(messageStudioUsageCount) || 0),
    name: profileName,
    owner: TTS_OWNERSHIP.AUDIO,
    providerKey: "browser-speech",
    references: Array.isArray(references) ? references : [],
    segmentUsageCount: Math.max(0, Number(segmentUsageCount) || 0),
    usageCount: Math.max(0, Number(usageCount) || Number(messageStudioUsageCount) || 0),
    voice: String(voice || ""),
    voiceName: String(voiceName || voice || "Default browser voice")
  };
}

function createTextToSpeechProfileEmotionFromApi(setting = {}) {
  return createTextToSpeechProfileEmotion({
    active: setting.active !== false,
    displayOrder: setting.displayOrder || 0,
    emotion: setting.emotion || setting.emotionLabel || setting.name || DEFAULT_TTS_EMOTION_ID,
    emotionLabel: setting.emotionLabel || setting.name || setting.emotion || "",
    id: setting.key || setting.emotionProfileKey || setting.emotion || "",
    messagePartsUsageCount: setting.segmentUsageCount ?? setting.messagePartsUsageCount ?? 0,
    messageUsageCount: setting.messageUsageCount || 0,
    pitch: setting.pitch,
    rate: setting.rate,
    references: setting.references || [],
    settingKey: setting.settingKey || "",
    ssmlLikePreset: setting.ssmlLikePreset || "normal",
    usageCount: setting.usageCount || 0,
    volume: setting.volume,
  });
}

function createTextToSpeechProfileFromApi(profile = {}) {
  return createTextToSpeechProfile({
    active: profile.active !== false,
    age: profile.age || profile.ageFilter || TEXT_TO_SPEECH_DEFAULTS.voiceAge,
    emotions: Array.isArray(profile.emotionSettings)
      ? profile.emotionSettings
        .slice()
        .sort((left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0))
        .map((setting) => createTextToSpeechProfileEmotionFromApi(setting))
      : [],
    gender: profile.gender || "neutral",
    id: profile.key || profile.id || "",
    language: profile.language || TEXT_TO_SPEECH_DEFAULTS.language,
    messageStudioUsageCount: profile.usageCount ?? profile.messageUsageCount ?? 0,
    name: profile.name,
    references: profile.references || [],
    segmentUsageCount: profile.segmentUsageCount || 0,
    usageCount: profile.usageCount || 0,
    voice: profile.voice || profile.voiceName || "",
    voiceName: profile.voiceName || profile.voice || "Default browser voice",
  });
}

function defaultVoiceForProfile(voiceOptions = [], preferredGender = "") {
  if (!voiceOptions.length) {
    return null;
  }
  const preferred = voiceOptions.find((option) => {
    const text = `${option.name || ""} ${option.label || ""}`.toLowerCase();
    if (preferredGender === "male") return /\bmale\b|\bman\b|\bdavid\b|\bmark\b/.test(text);
    if (preferredGender === "female") return /\bfemale\b|\bwoman\b|\bzira\b/.test(text);
    return false;
  });
  return preferred || voiceOptions[0];
}

function createDefaultEmotionSettings() {
  return [];
}

function createDefaultTextToSpeechProfiles() {
  return [];
}

function signInUrl() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return SIGN_IN_ROUTE;
  }
  return new URL(SIGN_IN_ROUTE, document.baseURI || window.location.href).href;
}

function isDefaultBrowserVoice(value) {
  return ["browser default", "default", "default browser voice"].includes(String(value || "").trim().toLowerCase());
}

function previewVoiceForProfile({ language = "", voice = "", voiceOptions = [] } = {}) {
  const normalizedVoice = String(voice || "").trim();
  const selectedVoice = voiceOptions.find((option) => String(option.value) === normalizedVoice
    || String(option.name) === normalizedVoice
    || String(option.label) === normalizedVoice);
  if (selectedVoice) {
    return { defaultBrowserVoice: false, voice: selectedVoice };
  }
  if (!isDefaultBrowserVoice(normalizedVoice)) {
    return { defaultBrowserVoice: false, voice: null };
  }
  const selectedDefault = voiceOptions.find((option) => !language || option.language === language)
    || voiceOptions[0]
    || null;
  return { defaultBrowserVoice: true, voice: selectedDefault };
}

function createSpeechPreviewRequest({
  language = TEXT_TO_SPEECH_DEFAULTS.language,
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

  const previewVoice = previewVoiceForProfile({ language, voice, voiceOptions });
  const selectedVoice = previewVoice.voice;
  if (!selectedVoice) {
    return { ok: false, message: "Select an available browser voice before preview." };
  }

  return {
    language: language || selectedVoice.language || TEXT_TO_SPEECH_DEFAULTS.language,
    ok: true,
    pitch: boundedNumber(pitch, TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch),
    rate: boundedNumber(rate, TEXT_TO_SPEECH_RANGE_DEFAULTS.rate),
    speechItemId: "browser-preview",
    speechItemName: "Browser Preview",
    text: normalizedText,
    voice: selectedVoice.value,
    voiceName: previewVoice.defaultBrowserVoice ? "Default browser voice" : selectedVoice.name || selectedVoice.label || "selected voice",
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

function initializeTextToSpeechTool(root = document, { engine = new TextToSpeechEngine() } = {}) {
  const elements = {
    clearStatus: root.querySelector("[data-tts-clear-status]"),
    pause: root.querySelector("[data-tts-pause]"),
    profileCount: root.querySelector("[data-tts-profile-count]"),
    profileEmotionCount: root.querySelector("[data-tts-emotion-count]"),
    profileTable: root.querySelector("[data-tts-profile-table]"),
    resume: root.querySelector("[data-tts-resume]"),
    returnWorkspace: root.querySelector("[data-tts-return-workspace]"),
    speak: root.querySelector("[data-tts-speak]"),
    status: root.querySelector("[data-tts-status]"),
    statusLog: root.querySelector("[data-tts-status-log]"),
    stop: root.querySelector("[data-tts-stop]"),
    text: root.querySelector("[data-tts-text-input]"),
    workspaceActions: root.querySelector("[data-tts-workspace-actions]")
  };
  const state = {
    editingEmotionId: "",
    editingProfileId: "",
    profiles: [],
    selectedEmotionId: "",
    selectedProfileId: "",
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

  function selectedProfile() {
    return state.profiles.find((profile) => profile.id === state.selectedProfileId) || null;
  }

  function previewProfile() {
    return selectedProfile() || state.profiles.find((profile) => profile.active) || state.profiles[0] || null;
  }

  function previewEmotion(profile = previewProfile()) {
    if (!profile?.emotions?.length) {
      return null;
    }
    return profile.emotions.find((emotion) => emotion.id === state.selectedEmotionId)
      || profile.emotions.find((emotion) => emotion.emotion === "neutral" && emotion.active !== false)
      || profile.emotions.find((emotion) => emotion.active !== false)
      || profile.emotions[0];
  }

  function previewSpeechLabel(profile, emotion) {
    return `${profile?.name || "TTS Profile"} / ${emotion?.emotionLabel || "Emotion"}`;
  }

  function profileInUseByMessageStudio(profile) {
    return Number(profile?.usageCount ?? profile?.messageStudioUsageCount ?? 0) > 0;
  }

  function emotionInUseByMessageParts(emotion) {
    return Number(emotion?.usageCount ?? emotion?.messagePartsUsageCount ?? 0) > 0;
  }

  function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
  }

  function createButton(label, dataName, value) {
    const button = document.createElement("button");
    button.className = "btn btn--compact";
    button.type = "button";
    button.dataset[dataName] = value;
    button.textContent = label;
    return button;
  }

  function createActionGroup(...buttons) {
    const group = document.createElement("div");
    group.className = "action-group action-group--tight";
    buttons.filter(Boolean).forEach((button) => group.append(button));
    return group;
  }

  function tableMessage(colSpan, text) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = colSpan;
    cell.textContent = text;
    row.append(cell);
    return row;
  }

  function tableActionRow(colSpan, ...buttons) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = colSpan;
    cell.append(createActionGroup(...buttons));
    row.append(cell);
    return row;
  }

  function createTextInput(value, dataName) {
    const input = document.createElement("input");
    input.dataset[dataName] = "";
    input.type = "text";
    input.value = value || "";
    return input;
  }

  function createNumberInput(value, dataName, kind) {
    const input = document.createElement("input");
    const range = TEXT_TO_SPEECH_RANGE_DEFAULTS[kind] || TEXT_TO_SPEECH_RANGE_DEFAULTS.rate;
    input.dataset[dataName] = "";
    input.type = "range";
    input.min = String(range.min);
    input.max = String(range.max);
    input.step = String(range.step);
    input.value = formatRangeValue(value ?? range.value, kind);
    return input;
  }

  function createCheckbox(checked, dataName) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.dataset[dataName] = "";
    input.type = "checkbox";
    input.checked = checked !== false;
    label.append(input, " Active");
    return label;
  }

  function createEditorSelect(value, dataName, options, placeholder = "") {
    const select = document.createElement("select");
    select.dataset[dataName] = "";
    if (placeholder) {
      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = placeholder;
      select.append(placeholderOption);
    }
    options.forEach((optionValue) => {
      const option = document.createElement("option");
      option.value = String(optionValue.value);
      option.textContent = optionValue.label;
      select.append(option);
    });
    select.value = options.some((optionValue) => String(optionValue.value) === String(value)) ? String(value) : String(options[0]?.value || "");
    return select;
  }

  function voiceSelectOptions(currentValue = "") {
    const options = state.voiceOptions.length
      ? state.voiceOptions.map((option) => ({ label: option.label, value: option.value }))
      : [{ label: "No browser voices available", value: "" }];
    if (currentValue && !options.some((option) => String(option.value) === String(currentValue))) {
      return [{ label: profileVoiceName({ voice: currentValue, voiceName: currentValue }), value: currentValue }, ...options];
    }
    return options;
  }

  function languageSelectOptions() {
    const voiceLanguages = textToSpeechLanguageOptionsFromVoices(state.voiceOptions);
    return voiceLanguages.length ? voiceLanguages : TEXT_TO_SPEECH_LANGUAGE_OPTIONS;
  }

  function profileVoiceName(profile) {
    const match = state.voiceOptions.find((option) => option.value === profile.voice);
    return match?.name || match?.label || profile.voiceName || "No voice selected";
  }

  function renderProfileCounts() {
    if (elements.profileCount) elements.profileCount.textContent = String(state.profiles.length);
    if (elements.profileEmotionCount) {
      const emotionCount = state.profiles.reduce((total, profile) => total + profile.emotions.length, 0);
      elements.profileEmotionCount.textContent = String(emotionCount);
    }
  }

  function renderProfileRows() {
    if (!elements.profileTable) return;
    elements.profileTable.replaceChildren();

    state.profiles.forEach((profile) => {
      if (state.editingProfileId === profile.id) {
        elements.profileTable.append(createProfileEditRow(profile));
        appendEmotionHost(profile.id);
        return;
      }

      const row = document.createElement("tr");
      row.dataset.ttsProfileRow = profile.id;
      const nameCell = document.createElement("td");
      nameCell.dataset.ttsProfileNameCell = profile.id;
      nameCell.setAttribute("role", "button");
      nameCell.tabIndex = 0;
      nameCell.setAttribute("aria-expanded", String(state.selectedProfileId === profile.id));
      nameCell.title = "Open emotions";
      nameCell.textContent = `${state.selectedProfileId === profile.id ? "v" : ">"} ${profile.name}`;
      const deleteButton = createButton("Delete", "ttsDeleteProfile", profile.id);
      if (profileInUseByMessageStudio(profile)) {
        deleteButton.disabled = true;
        deleteButton.title = "Delete disabled: profile is in use by Message Studio data.";
      }
      const actions = createActionGroup(
        createButton("Edit Profile", "ttsEditProfile", profile.id),
        deleteButton,
      );
      row.append(
        nameCell,
        createCell(labelForOption(TTS_PROFILE_GENDER_OPTIONS, profile.gender, "Neutral")),
        createCell(profileVoiceName(profile)),
        createCell(profile.language),
        createCell(labelForOption(TEXT_TO_SPEECH_AGE_FILTER_OPTIONS, profile.age, "Any")),
        createCell(String(profile.emotions.length)),
        createCell(String(profile.usageCount || profile.messageStudioUsageCount || 0)),
        createCell(profile.active ? "Active" : "Inactive"),
        (() => {
          const cell = document.createElement("td");
          cell.append(actions);
          return cell;
        })(),
      );
      elements.profileTable.append(row);
      appendEmotionHost(profile.id);
    });

    if (state.editingProfileId === NEW_ROW_KEY) {
      elements.profileTable.append(createProfileEditRow(null));
    }

    if (!state.profiles.length && state.editingProfileId !== NEW_ROW_KEY) {
      elements.profileTable.append(tableMessage(9, "No TTS profiles yet."));
    }
    if (!state.editingProfileId) {
      elements.profileTable.append(createProfileAddControlRow());
    }
    renderProfileCounts();
  }

  function createProfileAddControlRow() {
    const row = tableActionRow(9, createButton("Add Profile", "ttsAddProfileRow", NEW_ROW_KEY));
    row.dataset.ttsProfileAddControlRow = "";
    return row;
  }

  function createProfileEditRow(profile = null) {
    const key = profile?.id || NEW_ROW_KEY;
    const row = document.createElement("tr");
    row.dataset.ttsProfileEditor = key;

    const nameCell = document.createElement("td");
    nameCell.append(createTextInput(profile?.name || "", "ttsProfileName"));
    const genderCell = document.createElement("td");
    genderCell.append(createEditorSelect(profile?.gender || "neutral", "ttsProfileGender", TTS_PROFILE_GENDER_OPTIONS));
    const voiceCell = document.createElement("td");
    voiceCell.append(createEditorSelect(profile?.voice || "", "ttsProfileVoice", voiceSelectOptions(profile?.voice || ""), "Select voice"));
    const languageCell = document.createElement("td");
    languageCell.append(createEditorSelect(profile?.language || TEXT_TO_SPEECH_DEFAULTS.language, "ttsProfileLanguage", languageSelectOptions()));
    const ageCell = document.createElement("td");
    ageCell.append(createEditorSelect(profile?.age || TEXT_TO_SPEECH_DEFAULTS.voiceAge, "ttsProfileAge", TEXT_TO_SPEECH_AGE_FILTER_OPTIONS));
    const emotionCountCell = createCell(profile ? String(profile.emotions.length) : "0");
    const usageCell = createCell(profile ? String(profile.usageCount || profile.messageStudioUsageCount || 0) : "0");
    const statusCell = document.createElement("td");
    statusCell.append(createCheckbox(profile?.active !== false, "ttsProfileActive"));
    const actionsCell = document.createElement("td");
    actionsCell.append(createActionGroup(
      createButton("Save", "ttsCommitProfile", key),
      createButton("Cancel", "ttsCancelProfile", key),
    ));

    row.append(nameCell, genderCell, voiceCell, languageCell, ageCell, emotionCountCell, usageCell, statusCell, actionsCell);
    return row;
  }

  function appendEmotionHost(profileId) {
    if (state.selectedProfileId !== profileId) return;
    const hostRow = document.createElement("tr");
    hostRow.dataset.ttsEmotionHost = profileId;
    const cell = document.createElement("td");
    cell.colSpan = 9;
    cell.append(createEmotionTable(profileId));
    hostRow.append(cell);
    elements.profileTable.append(hostRow);
  }

  function createEmotionTable(profileId) {
    const profile = state.profiles.find((candidate) => candidate.id === profileId);
    const wrapper = document.createElement("div");
    wrapper.className = "content-stack";

    const tableWrapper = document.createElement("div");
    tableWrapper.className = "table-wrapper";
    const table = document.createElement("table");
    table.className = "data-table";
    table.setAttribute("aria-label", "TTS Profile Emotions");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["Emotion", "Pitch", "Rate", "Volume", "Usage", "Actions"].forEach((label) => {
      const header = document.createElement("th");
      header.scope = "col";
      header.textContent = label;
      headerRow.append(header);
    });
    thead.append(headerRow);
    const tbody = document.createElement("tbody");
    tbody.dataset.ttsEmotionTable = profileId;

    if (!profile?.emotions.length && state.editingEmotionId !== NEW_ROW_KEY) {
      tbody.append(tableMessage(6, "No emotions for this profile."));
    }

    profile?.emotions.forEach((emotion) => {
      if (state.editingEmotionId === emotion.id) {
        tbody.append(createEmotionEditRow(emotion));
        return;
      }
      const row = document.createElement("tr");
      row.dataset.ttsEmotionRow = emotion.id;
      const deleteButton = createButton("Delete", "ttsDeleteEmotion", emotion.id);
      if (emotionInUseByMessageParts(emotion)) {
        deleteButton.disabled = true;
        deleteButton.title = "Delete disabled: emotion is in use by sentences.";
      }
      const actions = createActionGroup(
        createButton("Edit Emotion", "ttsEditEmotion", emotion.id),
        deleteButton,
        createButton("Play", "ttsPlayEmotion", emotion.id),
      );
      const actionsCell = document.createElement("td");
      actionsCell.append(actions);
      row.append(
        createCell(emotion.emotionLabel),
        createCell(String(emotion.pitch)),
        createCell(String(emotion.rate)),
        createCell(String(emotion.volume)),
        createCell(String(emotion.usageCount || emotion.messagePartsUsageCount || 0)),
        actionsCell,
      );
      tbody.append(row);
    });

    if (state.editingEmotionId === NEW_ROW_KEY) {
      tbody.append(createEmotionEditRow(null));
    }
    if (!state.editingEmotionId) {
      tbody.append(createEmotionAddControlRow(profileId));
    }

    table.append(thead, tbody);
    tableWrapper.append(table);
    wrapper.append(tableWrapper);
    return wrapper;
  }

  function createEmotionAddControlRow(profileId) {
    const row = tableActionRow(6, createButton("Add Emotion", "ttsAddEmotion", profileId));
    row.dataset.ttsEmotionAddControlRow = profileId;
    return row;
  }

  function createEmotionEditRow(emotion = null) {
    const key = emotion?.id || NEW_ROW_KEY;
    const row = document.createElement("tr");
    row.dataset.ttsEmotionEditor = key;
    const emotionCell = document.createElement("td");
    emotionCell.append(createEditorSelect(emotion?.emotion || "neutral", "ttsEmotionName", TTS_PROFILE_EMOTION_OPTIONS));
    const pitchCell = document.createElement("td");
    pitchCell.append(createNumberInput(emotion?.pitch ?? 1, "ttsEmotionPitch", "pitch"));
    const rateCell = document.createElement("td");
    rateCell.append(createNumberInput(emotion?.rate ?? 1, "ttsEmotionRate", "rate"));
    const volumeCell = document.createElement("td");
    volumeCell.append(createNumberInput(emotion?.volume ?? 1, "ttsEmotionVolume", "volume"));
    const usageCell = createCell(emotion ? String(emotion.usageCount || emotion.messagePartsUsageCount || 0) : "0");
    const actionsCell = document.createElement("td");
    actionsCell.append(createActionGroup(
      createButton("Play", "ttsPlayEditingEmotion", key),
      createButton("Save", "ttsCommitEmotion", key),
      createButton("Cancel", "ttsCancelEmotion", key),
    ));
    row.append(emotionCell, pitchCell, rateCell, volumeCell, usageCell, actionsCell);
    return row;
  }

  function editorValue(rootNode, selector) {
    return rootNode?.querySelector(selector)?.value || "";
  }

  function editorChecked(rootNode, selector) {
    return rootNode?.querySelector(selector)?.checked !== false;
  }

  function profileValues(key) {
    const row = elements.profileTable?.querySelector(`[data-tts-profile-editor="${key}"]`);
    const voiceValue = editorValue(row, "[data-tts-profile-voice]");
    const selectedVoice = state.voiceOptions.find((option) => option.value === voiceValue);
    return createTextToSpeechProfile({
      active: editorChecked(row, "[data-tts-profile-active]"),
      age: editorValue(row, "[data-tts-profile-age]"),
      emotions: key === NEW_ROW_KEY ? [] : state.profiles.find((profile) => profile.id === key)?.emotions || [],
      gender: editorValue(row, "[data-tts-profile-gender]"),
      id: key === NEW_ROW_KEY ? "" : key,
      language: editorValue(row, "[data-tts-profile-language]"),
      name: editorValue(row, "[data-tts-profile-name]"),
      voice: voiceValue,
      voiceName: selectedVoice?.name || selectedVoice?.label || voiceValue,
    });
  }

  function validateProfile(profile) {
    const errors = [];
    if (!profile.name.trim()) errors.push("Profile Name is required.");
    if (!profile.language.trim()) errors.push("Language is required.");
    if (!profile.emotions.length) errors.push("At least one Emotion is required.");
    if (state.profiles.some((candidate) => candidate.id !== profile.id && candidate.name.toLowerCase() === profile.name.toLowerCase())) {
      errors.push("Profile Name must be unique.");
    }
    return errors;
  }

  function currentSessionState() {
    try {
      const session = getSessionCurrent();
      return {
        apiAvailable: true,
        authenticated: Boolean(session?.authenticated && session.userKey),
        session,
      };
    } catch (error) {
      console.warn("Text To Speech could not verify the current session.", error instanceof Error ? error.message : String(error || ""));
      return {
        apiAvailable: false,
        authenticated: false,
        session: null,
      };
    }
  }

  function requireAuthenticatedWrite(action) {
    const sessionState = currentSessionState();
    if (!sessionState.apiAvailable) {
      writeStatus("Session status could not be verified. Try again shortly.", "FAIL");
      return false;
    }
    if (!sessionState.authenticated) {
      writeStatus(`Sign in before ${action}.`, "FAIL");
      window.location.href = signInUrl();
      return false;
    }
    return true;
  }

  function profileApiPayload(profile) {
    return {
      active: profile.active !== false,
      description: `${profile.name} Text To Speech profile.`,
      emotionSettings: profile.emotions.map((emotion, index) => ({
        active: emotion.active !== false,
        displayOrder: index + 1,
        emotion: emotion.emotion,
        emotionLabel: emotion.emotionLabel,
        key: emotion.id,
        pitch: emotion.pitch,
        rate: emotion.rate,
        ssmlLikePreset: emotion.ssmlLikePreset || "normal",
        volume: emotion.volume,
      })),
      language: profile.language,
      name: profile.name,
      pitch: TEXT_TO_SPEECH_DEFAULTS.pitch,
      providerKey: profile.providerKey || "browser-speech",
      rate: TEXT_TO_SPEECH_DEFAULTS.rate,
      voiceName: profile.voiceName || profile.voice || "Default browser voice",
      volume: TEXT_TO_SPEECH_DEFAULTS.volume,
    };
  }

  function loadProfilesFromApi() {
    const payload = listTtsProfiles();
    state.profiles = (payload.ttsProfiles || [])
      .filter((profile) => !isRetiredTextToSpeechProfileName(profile?.name))
      .map((profile) => createTextToSpeechProfileFromApi(profile));
    if (state.selectedProfileId && !state.profiles.some((profile) => profile.id === state.selectedProfileId)) {
      state.selectedProfileId = "";
    }
    if (state.selectedEmotionId && !selectedProfile()?.emotions.some((emotion) => emotion.id === state.selectedEmotionId)) {
      state.selectedEmotionId = "";
    }
    renderProfileRows();
    refreshActionState();
    return payload;
  }

  function saveProfileToApi(key, profile) {
    const payload = key === NEW_ROW_KEY
      ? createTtsProfile(profileApiPayload(profile))
      : updateTtsProfile(key, profileApiPayload(profile));
    const saved = payload.ttsProfile || null;
    if (!saved) {
      throw new Error("TTS Profile could not be saved.");
    }
    return createTextToSpeechProfileFromApi(saved);
  }

  function saveProfileEmotionSettings(profile) {
    const payload = updateTtsProfile(profile.id, profileApiPayload(profile));
    const saved = payload.ttsProfile || null;
    if (!saved) {
      throw new Error("TTS Profile emotions could not be saved.");
    }
    return createTextToSpeechProfileFromApi(saved);
  }

  function emotionValues(key) {
    const row = elements.profileTable?.querySelector(`[data-tts-emotion-editor="${key}"]`);
    const existing = selectedProfile()?.emotions.find((emotion) => emotion.id === key) || null;
    return createTextToSpeechProfileEmotion({
      active: existing?.active !== false,
      emotion: editorValue(row, "[data-tts-emotion-name]"),
      id: key === NEW_ROW_KEY ? "" : key,
      pitch: editorValue(row, "[data-tts-emotion-pitch]"),
      rate: editorValue(row, "[data-tts-emotion-rate]"),
      ssmlLikePreset: existing?.ssmlLikePreset || "normal",
      volume: editorValue(row, "[data-tts-emotion-volume]"),
    });
  }

  function validateEmotion(emotion, existingId = "") {
    const errors = [];
    if (!state.selectedProfileId) errors.push("Select a TTS Profile before adding an emotion.");
    if (!emotion.emotion) errors.push("Emotion is required.");
    const profile = selectedProfile();
    if (profile?.emotions.some((candidate) => candidate.id !== existingId && candidate.emotion === emotion.emotion)) {
      errors.push("Emotion must be unique within the selected TTS Profile.");
    }
    return errors;
  }

  function addProfile() {
    if (engine.isSupported()) {
      refreshVoices();
    }
    state.editingProfileId = NEW_ROW_KEY;
    state.editingEmotionId = "";
    state.selectedProfileId = "";
    renderProfileRows();
    writeStatus("Ready to add a TTS profile.");
  }

  function commitProfile(key) {
    if (!requireAuthenticatedWrite("saving Text To Speech profiles")) {
      return;
    }
    const profile = profileValues(key);
    const errors = validateProfile(profile);
    if (errors.length) {
      writeStatus(`TTS Profile save blocked: ${errors.join(" ")}`, "FAIL");
      return;
    }
    let savedProfile = null;
    try {
      savedProfile = saveProfileToApi(key, profile);
    } catch (error) {
      writeStatus(`TTS Profile save blocked: ${error.message}`, "FAIL");
      return;
    }
    const index = state.profiles.findIndex((candidate) => candidate.id === savedProfile.id);
    if (index === -1) {
      state.profiles.push(savedProfile);
    } else {
      state.profiles[index] = savedProfile;
    }
    state.selectedProfileId = savedProfile.id;
    state.selectedEmotionId = previewEmotion(savedProfile)?.id || "";
    state.editingProfileId = "";
    renderProfileRows();
    refreshActionState();
    writeStatus(`Saved TTS profile: ${savedProfile.name}.`);
  }

  function deleteProfile(key) {
    if (!requireAuthenticatedWrite("deleting Text To Speech profiles")) {
      return;
    }
    const profile = state.profiles.find((candidate) => candidate.id === key);
    if (!profile) return;
    if (profileInUseByMessageStudio(profile)) {
      writeStatus(`Delete profile disabled: ${profile.name} is in use by Message Studio data.`, "FAIL");
      return;
    }
    try {
      deleteTtsProfile(key);
    } catch (error) {
      writeStatus(`Delete profile blocked: ${error.message}`, "FAIL");
      return;
    }
    state.profiles = state.profiles.filter((candidate) => candidate.id !== key);
    if (state.selectedProfileId === key) state.selectedProfileId = state.profiles[0]?.id || "";
    if (!state.selectedProfileId) state.selectedEmotionId = "";
    renderProfileRows();
    refreshActionState();
    writeStatus(`Deleted TTS profile: ${profile.name}.`);
  }

  function addEmotion(profileId) {
    state.selectedProfileId = profileId;
    state.editingProfileId = "";
    state.editingEmotionId = NEW_ROW_KEY;
    renderProfileRows();
    writeStatus("Ready to add an emotion.");
  }

  function playEditingEmotion(key) {
    const profile = selectedProfile();
    const emotion = emotionValues(key);
    if (key !== NEW_ROW_KEY) {
      state.selectedEmotionId = key;
    }
    speakEmotion(profile, emotion);
  }

  function commitEmotion(key) {
    if (!requireAuthenticatedWrite("saving Text To Speech emotion settings")) {
      return;
    }
    const emotion = emotionValues(key);
    const errors = validateEmotion(emotion, key === NEW_ROW_KEY ? "" : key);
    if (errors.length) {
      writeStatus(`Emotion save blocked: ${errors.join(" ")}`, "FAIL");
      return;
    }
    const profile = selectedProfile();
    if (!profile) return;
    if (key === NEW_ROW_KEY) {
      profile.emotions.push(emotion);
    } else {
      const index = profile.emotions.findIndex((candidate) => candidate.id === key);
      const existing = profile.emotions[index];
      profile.emotions[index] = {
        ...emotion,
        messagePartsUsageCount: existing?.messagePartsUsageCount || 0,
      };
    }
    let savedProfile = null;
    try {
      savedProfile = saveProfileEmotionSettings(profile);
    } catch (error) {
      writeStatus(`Emotion save blocked: ${error.message}`, "FAIL");
      loadProfilesFromApi();
      return;
    }
    const profileIndex = state.profiles.findIndex((candidate) => candidate.id === savedProfile.id);
    if (profileIndex !== -1) {
      state.profiles[profileIndex] = savedProfile;
    }
    const savedEmotion = savedProfile.emotions.find((candidate) => candidate.emotion === emotion.emotion)
      || savedProfile.emotions.find((candidate) => candidate.id === emotion.id)
      || emotion;
    state.editingEmotionId = "";
    state.selectedProfileId = savedProfile.id;
    state.selectedEmotionId = savedEmotion.id;
    renderProfileRows();
    refreshActionState();
    writeStatus(`Saved emotion: ${savedEmotion.emotionLabel}.`);
  }

  function deleteEmotion(key) {
    if (!requireAuthenticatedWrite("deleting Text To Speech emotion settings")) {
      return;
    }
    const profile = selectedProfile();
    const emotion = profile?.emotions.find((candidate) => candidate.id === key);
    if (!profile || !emotion) return;
    if (emotionInUseByMessageParts(emotion)) {
      writeStatus(`Delete emotion disabled: ${emotion.emotionLabel} is in use by sentences.`, "FAIL");
      return;
    }
    const nextProfile = {
      ...profile,
      emotions: profile.emotions.filter((candidate) => candidate.id !== key),
    };
    let savedProfile = null;
    try {
      savedProfile = saveProfileEmotionSettings(nextProfile);
    } catch (error) {
      writeStatus(`Delete emotion blocked: ${error.message}`, "FAIL");
      loadProfilesFromApi();
      return;
    }
    const profileIndex = state.profiles.findIndex((candidate) => candidate.id === savedProfile.id);
    if (profileIndex !== -1) {
      state.profiles[profileIndex] = savedProfile;
    }
    if (state.selectedEmotionId === key) state.selectedEmotionId = previewEmotion(savedProfile)?.id || "";
    renderProfileRows();
    refreshActionState();
    writeStatus(`Deleted emotion: ${emotion.emotionLabel}.`);
  }

  function selectProfile(profileId) {
    if (!state.profiles.some((profile) => profile.id === profileId)) return;
    state.selectedProfileId = state.selectedProfileId === profileId ? "" : profileId;
    state.selectedEmotionId = state.selectedProfileId ? previewEmotion(selectedProfile())?.id || "" : "";
    state.editingEmotionId = "";
    renderProfileRows();
    refreshActionState();
    if (state.selectedProfileId) {
      writeStatus(`Opened emotions for ${selectedProfile()?.name}.`);
    }
  }

  function renderPreviewSummary() {
    setTextContent(root, "[data-tts-text-count]", String(String(elements.text?.value || "").length));
  }

  function refreshVoices() {
    state.voiceOptions = engine.voiceOptions();
    setTextContent(root, "[data-tts-voice-count]", String(state.voiceOptions.length));
    refreshActionState();
    return state.voiceOptions;
  }

  function loadServerProfiles() {
    try {
      loadProfilesFromApi();
    } catch (error) {
      state.profiles = [];
      state.selectedProfileId = "";
      state.selectedEmotionId = "";
      renderProfileRows();
      refreshActionState();
      writeStatus(`Text To Speech profiles could not be loaded from Local API: ${error.message}`, "FAIL");
    }
  }

  function refreshActionState() {
    const hasText = Boolean(String(elements.text?.value || "").trim());
    const profile = previewProfile();
    const hasVoice = Boolean(profile?.voice);
    const supported = engine.isSupported();
    if (elements.speak) elements.speak.disabled = !(supported && hasText && hasVoice);
    if (elements.pause) elements.pause.disabled = !engine.canPause();
    if (elements.resume) elements.resume.disabled = !engine.canResume();
    if (elements.stop) elements.stop.disabled = !supported;
    renderPreviewSummary();
  }

  function isWorkspaceLaunch() {
    const params = new URLSearchParams(window.location.search);
    return params.get("launch") === "workspace"
      && params.get("fromTool") === "workspace-manager-v2"
      && Boolean(params.get("hostContextId"));
  }

  function applyLaunchMode() {
    const workspaceLaunch = isWorkspaceLaunch();
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

  function speakEmotion(profile, emotion) {
    if (!engine.isSupported()) {
      writeStatus("SpeechSynthesis is unavailable in this browser. Use a browser with Web Speech API support.", "FAIL");
      refreshActionState();
      return;
    }
    if (!profile) {
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} Speak blocked: add or select a TTS Profile first.`, "FAIL");
      return;
    }
    if (!emotion) {
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} Speak blocked: add or select an emotion first.`, "FAIL");
      return;
    }
    const request = createSpeechPreviewRequest({
      language: profile.language,
      pitch: emotion.pitch,
      rate: emotion.rate,
      text: elements.text?.value,
      voice: profile.voice,
      voiceOptions: state.voiceOptions,
      volume: emotion.volume,
    });
    if (!request.ok) {
      writeStatus(request.message, "FAIL");
      refreshActionState();
      return;
    }
    const result = engine.speak({
      gender: profile.gender,
      language: request.language,
      pitch: request.pitch,
      rate: request.rate,
      speechItemId: `${profile.id}:${emotion.id}:preview`,
      speechItemName: previewSpeechLabel(profile, emotion),
      ssmlLikePreset: emotion.ssmlLikePreset,
      text: request.text,
      voice: request.voice,
      voiceAge: profile.age,
      volume: request.volume,
    });
    if (!result.ok) {
      writeStatus(result.message, "FAIL");
      refreshActionState();
      return;
    }
    writeStatus(`Speech queued: ${result.speechItemName}; ${result.language}; voice=${result.voiceName}; rate=${result.rate}; pitch=${result.pitch}; volume=${result.volume}; queuedItems=${result.queuedSpeechItems.length}.`);
    renderPreviewSummary();
    refreshActionState();
  }

  function speak() {
    const profile = previewProfile();
    speakEmotion(profile, previewEmotion(profile));
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
    elements.profileTable?.addEventListener("click", (event) => {
      const addProfileButton = event.target.closest("[data-tts-add-profile-row]");
      const addEmotionButton = event.target.closest("[data-tts-add-emotion]");
      const commitEmotionButton = event.target.closest("[data-tts-commit-emotion]");
      const cancelEmotionButton = event.target.closest("[data-tts-cancel-emotion]");
      const deleteEmotionButton = event.target.closest("[data-tts-delete-emotion]");
      const playEditingEmotionButton = event.target.closest("[data-tts-play-editing-emotion]");
      const playEmotionButton = event.target.closest("[data-tts-play-emotion]");
      const deleteProfileButton = event.target.closest("[data-tts-delete-profile]");
      const emotionRow = event.target.closest("[data-tts-emotion-row]");
      const editEmotionButton = event.target.closest("[data-tts-edit-emotion]");
      const editProfileButton = event.target.closest("[data-tts-edit-profile]");
      const commitProfileButton = event.target.closest("[data-tts-commit-profile]");
      const cancelProfileButton = event.target.closest("[data-tts-cancel-profile]");
      const profileNameCell = event.target.closest("[data-tts-profile-name-cell]");

      if (addProfileButton) {
        addProfile();
        return;
      }
      if (commitProfileButton) {
        commitProfile(commitProfileButton.dataset.ttsCommitProfile);
        return;
      }
      if (cancelProfileButton) {
        state.editingProfileId = "";
        renderProfileRows();
        writeStatus("TTS profile edit canceled.");
        return;
      }
      if (editProfileButton) {
        if (engine.isSupported()) {
          refreshVoices();
        }
        state.editingProfileId = editProfileButton.dataset.ttsEditProfile;
        state.selectedProfileId = editProfileButton.dataset.ttsEditProfile;
        state.selectedEmotionId = previewEmotion(selectedProfile())?.id || "";
        state.editingEmotionId = "";
        renderProfileRows();
        writeStatus("TTS profile opened inline.");
        return;
      }
      if (deleteProfileButton) {
        deleteProfile(deleteProfileButton.dataset.ttsDeleteProfile);
        return;
      }
      if (addEmotionButton) {
        addEmotion(addEmotionButton.dataset.ttsAddEmotion);
        return;
      }
      if (playEditingEmotionButton) {
        playEditingEmotion(playEditingEmotionButton.dataset.ttsPlayEditingEmotion);
        return;
      }
      if (commitEmotionButton) {
        commitEmotion(commitEmotionButton.dataset.ttsCommitEmotion);
        return;
      }
      if (cancelEmotionButton) {
        state.editingEmotionId = "";
        renderProfileRows();
        writeStatus("Emotion edit canceled.");
        return;
      }
      if (editEmotionButton) {
        state.editingEmotionId = editEmotionButton.dataset.ttsEditEmotion;
        state.selectedEmotionId = editEmotionButton.dataset.ttsEditEmotion;
        renderProfileRows();
        writeStatus("Emotion opened inline.");
        return;
      }
      if (deleteEmotionButton) {
        deleteEmotion(deleteEmotionButton.dataset.ttsDeleteEmotion);
        return;
      }
      if (playEmotionButton) {
        const profile = selectedProfile();
        const emotion = profile?.emotions.find((candidate) => candidate.id === playEmotionButton.dataset.ttsPlayEmotion) || null;
        state.selectedEmotionId = playEmotionButton.dataset.ttsPlayEmotion;
        speakEmotion(profile, emotion);
        return;
      }
      if (emotionRow) {
        state.selectedEmotionId = emotionRow.dataset.ttsEmotionRow;
        refreshActionState();
        writeStatus(`Selected emotion: ${previewEmotion()?.emotionLabel || "Unknown"}.`);
        return;
      }
      if (profileNameCell) {
        selectProfile(profileNameCell.dataset.ttsProfileNameCell);
      }
    });
    elements.profileTable?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const profileNameCell = event.target.closest("[data-tts-profile-name-cell]");
      if (!profileNameCell) return;
      event.preventDefault();
      selectProfile(profileNameCell.dataset.ttsProfileNameCell);
    });
    elements.speak?.addEventListener("click", speak);
    elements.pause?.addEventListener("click", pause);
    elements.resume?.addEventListener("click", resume);
    elements.stop?.addEventListener("click", stop);
    elements.clearStatus?.addEventListener("click", () => {
      if (elements.statusLog) elements.statusLog.value = "";
      if (elements.status) elements.status.textContent = "Status cleared.";
    });
    elements.returnWorkspace?.addEventListener("click", () => {
      window.location.href = workspaceManagerUrl();
    });
    elements.text?.addEventListener("input", () => {
      refreshActionState();
    });
  }

  function markUnavailable() {
    setTextContent(root, "[data-tts-engine-label]", "Unavailable");
    setTextContent(root, "[data-tts-engine-status]", "SpeechSynthesis is unavailable in this browser. Use a browser with Web Speech API support.");
    writeStatus("SpeechSynthesis is unavailable in this browser. Use a browser with Web Speech API support.", "FAIL");
    setTextContent(root, "[data-tts-voice-count]", "0");
    refreshActionState();
  }

  async function start() {
    applyLaunchMode();
    mountEvents();
    loadServerProfiles();
    if (!engine.isSupported()) {
      markUnavailable();
      return;
    }
    setTextContent(root, "[data-tts-engine-label]", "Ready");
    setTextContent(root, "[data-tts-engine-status]", "Browser SpeechSynthesis is available for local preview.");
    refreshVoices();
    engine.onVoicesChanged(() => {
      refreshVoices();
      renderProfileRows();
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} voices updated from browser SpeechSynthesis.`);
    });
    writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} ready. SpeechSynthesis is available.`);
  }

  void start().catch((error) => {
    writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} startup failed: ${error.message}`, "FAIL");
  });

  return {
    engine,
    profiles: () => state.profiles.map((profile) => ({ ...profile })),
    speechSupported: engine.isSupported()
  };
}

if (typeof document !== "undefined" && document.querySelector("[data-tts-profile-table]")) {
  initializeTextToSpeechTool(document);
}

export {
  TTS_LANGUAGES,
  TTS_MESSAGE_STATUSES,
  TTS_OWNERSHIP,
  TTS_PROFILE_CONTRACT_VERSION,
  TTS_PROVIDER_ADAPTER_PLAN,
  createEmotionProfile,
  createDefaultTextToSpeechProfiles,
  createSpeechPreviewRequest,
  createTextToSpeechProfile,
  createTextToSpeechProfileEmotion,
  createTtsMessage,
  createVoiceProfile,
  initializeTextToSpeechTool,
  previewTtsMessage
};
