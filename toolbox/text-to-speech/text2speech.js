import {
  textToSpeechLanguageOptionsFromVoices,
  TextToSpeechEngine,
} from "../../src/engine/audio/TextToSpeechEngine.js";
import {
  TEXT_TO_SPEECH_AGE_FILTER_OPTIONS,
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_DISPLAY_NAME,
  TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
  TEXT_TO_SPEECH_RANGE_DEFAULTS,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS
} from "../../src/engine/audio/TextToSpeechDefaults.js";

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

const TTS_PROFILE_CONTRACT_VERSION = "tts-profile-emotion-v1";
const NEW_ROW_KEY = "__new__";
const DEFAULT_TTS_PROFILE_ID = "default-balanced-profile";
const DEFAULT_TTS_EMOTION_ID = "neutral";

const TTS_PROFILE_GENDER_OPTIONS = Object.freeze([
  Object.freeze({ label: "Neutral", value: "neutral" }),
  Object.freeze({ label: "Male", value: "male" }),
  Object.freeze({ label: "Female", value: "female" }),
  Object.freeze({ label: "Any", value: "any" })
]);

const TTS_PROFILE_EMOTION_OPTIONS = Object.freeze([
  Object.freeze({ label: "Neutral", value: "neutral" }),
  Object.freeze({ label: "Happy", value: "happy" }),
  Object.freeze({ label: "Angry", value: "angry" }),
  Object.freeze({ label: "Scared", value: "scared" }),
  Object.freeze({ label: "Calm", value: "calm" }),
  Object.freeze({ label: "Urgent", value: "urgent" }),
  Object.freeze({ label: "Whisper", value: "whisper" }),
  Object.freeze({ label: "Excited", value: "excited" })
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

function createTextToSpeechProfileEmotion({
  active = true,
  emotion = "neutral",
  id = "",
  messagePartsUsageCount = 0,
  pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
  rate = TEXT_TO_SPEECH_DEFAULTS.rate,
  ssmlLikePreset = TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
  volume = TEXT_TO_SPEECH_DEFAULTS.volume
} = {}) {
  const emotionKey = slugFromText(emotion, DEFAULT_TTS_EMOTION_ID);
  return {
    active: active !== false,
    emotion: emotionKey,
    emotionLabel: labelForOption(TTS_PROFILE_EMOTION_OPTIONS, emotionKey, "Neutral"),
    id: id || emotionKey,
    messagePartsUsageCount: Math.max(0, Number(messagePartsUsageCount) || 0),
    pitch: boundedNumber(pitch, TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch),
    rate: boundedNumber(rate, TEXT_TO_SPEECH_RANGE_DEFAULTS.rate),
    ssmlLikePreset: TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS.some((option) => option.value === ssmlLikePreset) ? ssmlLikePreset : "normal",
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
  name = "Default Balanced Profile",
  voice = "",
  voiceName = ""
} = {}) {
  const profileName = String(name || "Default Balanced Profile").trim() || "Default Balanced Profile";
  const emotionRows = Array.isArray(emotions) && emotions.length
    ? emotions.map((emotion) => createTextToSpeechProfileEmotion(emotion))
    : [createTextToSpeechProfileEmotion()];
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
    voice: String(voice || ""),
    voiceName: String(voiceName || voice || "Default browser voice")
  };
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

function createDefaultEmotionSettings({ markNeutralInUse = false } = {}) {
  return [
    createTextToSpeechProfileEmotion({
      emotion: "neutral",
      messagePartsUsageCount: markNeutralInUse ? 1 : 0,
    }),
    createTextToSpeechProfileEmotion({ emotion: "happy", pitch: 1.08, rate: 1.04 }),
    createTextToSpeechProfileEmotion({ emotion: "angry", pitch: 0.96, rate: 1.08, volume: 1 }),
    createTextToSpeechProfileEmotion({ emotion: "scared", pitch: 1.12, rate: 1.12, volume: 0.9 }),
  ];
}

function createDefaultTextToSpeechProfiles(voiceOptions = []) {
  const balancedVoice = defaultVoiceForProfile(voiceOptions);
  const manVoice = defaultVoiceForProfile(voiceOptions, "male") || balancedVoice;
  const womanVoice = defaultVoiceForProfile(voiceOptions, "female") || voiceOptions[1] || balancedVoice;
  return [
    createTextToSpeechProfile({
      emotions: createDefaultEmotionSettings({ markNeutralInUse: true }),
      id: DEFAULT_TTS_PROFILE_ID,
      language: balancedVoice?.language || TEXT_TO_SPEECH_DEFAULTS.language,
      messageStudioUsageCount: 1,
      name: "Default Balanced Profile",
      voice: balancedVoice?.value || "",
      voiceName: balancedVoice?.name || balancedVoice?.label || "Default browser voice"
    }),
    createTextToSpeechProfile({
      emotions: createDefaultEmotionSettings(),
      gender: "male",
      id: "man-profile-1",
      language: manVoice?.language || TEXT_TO_SPEECH_DEFAULTS.language,
      name: "Man Profile 1",
      voice: manVoice?.value || "",
      voiceName: manVoice?.name || manVoice?.label || "Default browser voice"
    }),
    createTextToSpeechProfile({
      emotions: createDefaultEmotionSettings(),
      gender: "female",
      id: "woman-profile-2",
      language: womanVoice?.language || TEXT_TO_SPEECH_DEFAULTS.language,
      name: "Woman Profile 2",
      voice: womanVoice?.value || "",
      voiceName: womanVoice?.name || womanVoice?.label || "Default browser voice"
    })
  ];
}

function createMessageStudioTtsProfileOptions(profiles = []) {
  return profiles
    .filter((profile) => profile?.active !== false)
    .map((profile) => ({
      active: true,
      emotionSettings: Array.isArray(profile.emotions)
        ? profile.emotions.filter((emotion) => emotion.active !== false).map((emotion) => ({
          emotion: emotion.emotion,
          emotionLabel: emotion.emotionLabel,
          pitch: emotion.pitch,
          rate: emotion.rate,
          ssmlLikePreset: emotion.ssmlLikePreset,
          volume: emotion.volume
        }))
        : [],
      key: profile.id,
      language: profile.language,
      name: profile.name,
      providerKey: profile.providerKey || "browser-speech",
      voiceName: profile.voiceName || profile.voice || ""
    }));
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
    return Number(profile?.messageStudioUsageCount || 0) > 0;
  }

  function emotionInUseByMessageParts(emotion) {
    return Number(emotion?.messagePartsUsageCount || 0) > 0;
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
    input.type = "number";
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

  function voiceSelectOptions() {
    return state.voiceOptions.length
      ? state.voiceOptions.map((option) => ({ label: option.label, value: option.value }))
      : [{ label: "No browser voices available", value: "" }];
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
      nameCell.title = "Open Emotion Settings";
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
        createCell(profileVoiceName(profile)),
        createCell(profile.language),
        createCell(labelForOption(TTS_PROFILE_GENDER_OPTIONS, profile.gender, "Neutral")),
        createCell(labelForOption(TEXT_TO_SPEECH_AGE_FILTER_OPTIONS, profile.age, "Any")),
        createCell(String(profile.emotions.length)),
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
      elements.profileTable.append(tableMessage(8, "No TTS profiles yet."));
    }
    if (!state.editingProfileId) {
      elements.profileTable.append(createProfileAddControlRow());
    }
    renderProfileCounts();
  }

  function createProfileAddControlRow() {
    const row = tableActionRow(8, createButton("Add Profile", "ttsAddProfileRow", NEW_ROW_KEY));
    row.dataset.ttsProfileAddControlRow = "";
    return row;
  }

  function createProfileEditRow(profile = null) {
    const key = profile?.id || NEW_ROW_KEY;
    const row = document.createElement("tr");
    row.dataset.ttsProfileEditor = key;

    const nameCell = document.createElement("td");
    nameCell.append(createTextInput(profile?.name || "", "ttsProfileName"));
    const voiceCell = document.createElement("td");
    voiceCell.append(createEditorSelect(profile?.voice || "", "ttsProfileVoice", voiceSelectOptions(), "Select voice"));
    const languageCell = document.createElement("td");
    languageCell.append(createEditorSelect(profile?.language || TEXT_TO_SPEECH_DEFAULTS.language, "ttsProfileLanguage", languageSelectOptions()));
    const genderCell = document.createElement("td");
    genderCell.append(createEditorSelect(profile?.gender || "neutral", "ttsProfileGender", TTS_PROFILE_GENDER_OPTIONS));
    const ageCell = document.createElement("td");
    ageCell.append(createEditorSelect(profile?.age || TEXT_TO_SPEECH_DEFAULTS.voiceAge, "ttsProfileAge", TEXT_TO_SPEECH_AGE_FILTER_OPTIONS));
    const emotionCountCell = createCell(profile ? String(profile.emotions.length) : "1");
    const statusCell = document.createElement("td");
    statusCell.append(createCheckbox(profile?.active !== false, "ttsProfileActive"));
    const actionsCell = document.createElement("td");
    actionsCell.append(createActionGroup(
      createButton("Save", "ttsCommitProfile", key),
      createButton("Cancel", "ttsCancelProfile", key),
    ));

    row.append(nameCell, voiceCell, languageCell, genderCell, ageCell, emotionCountCell, statusCell, actionsCell);
    return row;
  }

  function appendEmotionHost(profileId) {
    if (state.selectedProfileId !== profileId) return;
    const hostRow = document.createElement("tr");
    hostRow.dataset.ttsEmotionHost = profileId;
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.append(createEmotionTable(profileId));
    hostRow.append(cell);
    elements.profileTable.append(hostRow);
  }

  function createEmotionTable(profileId) {
    const profile = state.profiles.find((candidate) => candidate.id === profileId);
    const wrapper = document.createElement("div");
    wrapper.className = "content-stack";
    const context = document.createElement("div");
    context.className = "kicker";
    context.textContent = "TTS Profile / Emotion Settings";
    const heading = document.createElement("h3");
    heading.textContent = "Emotion Settings";
    wrapper.append(context, heading);

    const tableWrapper = document.createElement("div");
    tableWrapper.className = "table-wrapper";
    const table = document.createElement("table");
    table.className = "data-table";
    table.setAttribute("aria-label", "Emotion Settings");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["Emotion", "Pitch", "Rate", "Volume", "Preset", "Status", "Actions"].forEach((label) => {
      const header = document.createElement("th");
      header.scope = "col";
      header.textContent = label;
      headerRow.append(header);
    });
    thead.append(headerRow);
    const tbody = document.createElement("tbody");
    tbody.dataset.ttsEmotionTable = profileId;

    if (!profile?.emotions.length && state.editingEmotionId !== NEW_ROW_KEY) {
      tbody.append(tableMessage(7, "No emotion settings for this profile."));
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
        deleteButton.title = "Delete disabled: emotion is in use by Message Parts.";
      }
      const actions = createActionGroup(
        createButton("Edit Emotion", "ttsEditEmotion", emotion.id),
        deleteButton,
      );
      const actionsCell = document.createElement("td");
      actionsCell.append(actions);
      row.append(
        createCell(emotion.emotionLabel),
        createCell(String(emotion.pitch)),
        createCell(String(emotion.rate)),
        createCell(String(emotion.volume)),
        createCell(labelForOption(TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS, emotion.ssmlLikePreset, "Normal")),
        createCell(emotion.active ? "Active" : "Inactive"),
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
    const row = tableActionRow(7, createButton("Add Emotion", "ttsAddEmotion", profileId));
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
    const presetCell = document.createElement("td");
    presetCell.append(createEditorSelect(emotion?.ssmlLikePreset || "normal", "ttsEmotionSsmlPreset", TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS));
    const statusCell = document.createElement("td");
    statusCell.append(createCheckbox(emotion?.active !== false, "ttsEmotionActive"));
    const actionsCell = document.createElement("td");
    actionsCell.append(createActionGroup(
      createButton("Save", "ttsCommitEmotion", key),
      createButton("Cancel", "ttsCancelEmotion", key),
    ));
    row.append(emotionCell, pitchCell, rateCell, volumeCell, presetCell, statusCell, actionsCell);
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
      emotions: key === NEW_ROW_KEY ? [createTextToSpeechProfileEmotion()] : state.profiles.find((profile) => profile.id === key)?.emotions || [],
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
    if (state.profiles.some((candidate) => candidate.id !== profile.id && candidate.name.toLowerCase() === profile.name.toLowerCase())) {
      errors.push("Profile Name must be unique.");
    }
    return errors;
  }

  function emotionValues(key) {
    const row = elements.profileTable?.querySelector(`[data-tts-emotion-editor="${key}"]`);
    return createTextToSpeechProfileEmotion({
      active: editorChecked(row, "[data-tts-emotion-active]"),
      emotion: editorValue(row, "[data-tts-emotion-name]"),
      id: key === NEW_ROW_KEY ? "" : key,
      pitch: editorValue(row, "[data-tts-emotion-pitch]"),
      rate: editorValue(row, "[data-tts-emotion-rate]"),
      ssmlLikePreset: editorValue(row, "[data-tts-emotion-ssml-preset]"),
      volume: editorValue(row, "[data-tts-emotion-volume]"),
    });
  }

  function validateEmotion(emotion, existingId = "") {
    const errors = [];
    if (!state.selectedProfileId) errors.push("Select a TTS Profile before adding Emotion Settings.");
    if (!emotion.emotion) errors.push("Emotion is required.");
    const profile = selectedProfile();
    if (profile?.emotions.some((candidate) => candidate.id !== existingId && candidate.emotion === emotion.emotion)) {
      errors.push("Emotion must be unique within the selected TTS Profile.");
    }
    return errors;
  }

  function addProfile() {
    state.editingProfileId = NEW_ROW_KEY;
    state.editingEmotionId = "";
    state.selectedProfileId = "";
    renderProfileRows();
    writeStatus("Ready to add a TTS profile.");
  }

  function commitProfile(key) {
    const profile = profileValues(key);
    const errors = validateProfile(profile);
    if (errors.length) {
      writeStatus(`TTS Profile save blocked: ${errors.join(" ")}`, "FAIL");
      return;
    }
    if (key === NEW_ROW_KEY) {
      state.profiles.push(profile);
    } else {
      const index = state.profiles.findIndex((candidate) => candidate.id === key);
      const existing = state.profiles[index];
      state.profiles[index] = {
        ...profile,
        emotions: existing?.emotions || profile.emotions,
        messageStudioUsageCount: existing?.messageStudioUsageCount || 0,
      };
    }
    state.selectedProfileId = profile.id;
    state.selectedEmotionId = previewEmotion(profile)?.id || "";
    state.editingProfileId = "";
    renderProfileRows();
    refreshActionState();
    writeStatus(`Saved TTS profile: ${profile.name}.`);
  }

  function deleteProfile(key) {
    const profile = state.profiles.find((candidate) => candidate.id === key);
    if (!profile) return;
    if (profileInUseByMessageStudio(profile)) {
      writeStatus(`Delete profile disabled: ${profile.name} is in use by Message Studio data.`, "FAIL");
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
    writeStatus("Ready to add an emotion setting.");
  }

  function commitEmotion(key) {
    const emotion = emotionValues(key);
    const errors = validateEmotion(emotion, key === NEW_ROW_KEY ? "" : key);
    if (errors.length) {
      writeStatus(`Emotion setting save blocked: ${errors.join(" ")}`, "FAIL");
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
    state.editingEmotionId = "";
    state.selectedEmotionId = emotion.id;
    renderProfileRows();
    refreshActionState();
    writeStatus(`Saved emotion setting: ${emotion.emotionLabel}.`);
  }

  function deleteEmotion(key) {
    const profile = selectedProfile();
    const emotion = profile?.emotions.find((candidate) => candidate.id === key);
    if (!profile || !emotion) return;
    if (emotionInUseByMessageParts(emotion)) {
      writeStatus(`Delete emotion disabled: ${emotion.emotionLabel} is in use by Message Parts.`, "FAIL");
      return;
    }
    profile.emotions = profile.emotions.filter((candidate) => candidate.id !== key);
    if (state.selectedEmotionId === key) state.selectedEmotionId = previewEmotion(profile)?.id || "";
    renderProfileRows();
    refreshActionState();
    writeStatus(`Deleted emotion setting: ${emotion.emotionLabel}.`);
  }

  function selectProfile(profileId) {
    if (!state.profiles.some((profile) => profile.id === profileId)) return;
    state.selectedProfileId = state.selectedProfileId === profileId ? "" : profileId;
    state.selectedEmotionId = state.selectedProfileId ? previewEmotion(selectedProfile())?.id || "" : "";
    state.editingEmotionId = "";
    renderProfileRows();
    refreshActionState();
    if (state.selectedProfileId) {
      writeStatus(`Opened Emotion Settings for ${selectedProfile()?.name}.`);
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

  function ensureDefaultProfiles() {
    if (state.profiles.length) {
      return;
    }
    state.profiles = createDefaultTextToSpeechProfiles(state.voiceOptions);
    state.selectedProfileId = "";
    state.selectedEmotionId = "";
    renderProfileRows();
    refreshActionState();
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

  function speak() {
    const profile = previewProfile();
    const emotion = previewEmotion(profile);
    if (!profile) {
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} Speak blocked: add or select a TTS Profile first.`, "FAIL");
      return;
    }
    if (!emotion) {
      writeStatus(`${TEXT_TO_SPEECH_DISPLAY_NAME} Speak blocked: add or select an Emotion Setting first.`, "FAIL");
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
      language: profile.language,
      pitch: request.pitch,
      rate: request.rate,
      speechItemId: `${profile.id}:${emotion.id}:preview`,
      speechItemName: previewSpeechLabel(profile, emotion),
      ssmlLikePreset: emotion.ssmlLikePreset,
      text: request.text,
      voice: profile.voice,
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
      if (commitEmotionButton) {
        commitEmotion(commitEmotionButton.dataset.ttsCommitEmotion);
        return;
      }
      if (cancelEmotionButton) {
        state.editingEmotionId = "";
        renderProfileRows();
        writeStatus("Emotion setting edit canceled.");
        return;
      }
      if (editEmotionButton) {
        state.editingEmotionId = editEmotionButton.dataset.ttsEditEmotion;
        state.selectedEmotionId = editEmotionButton.dataset.ttsEditEmotion;
        renderProfileRows();
        writeStatus("Emotion setting opened inline.");
        return;
      }
      if (deleteEmotionButton) {
        deleteEmotion(deleteEmotionButton.dataset.ttsDeleteEmotion);
        return;
      }
      if (emotionRow) {
        state.selectedEmotionId = emotionRow.dataset.ttsEmotionRow;
        refreshActionState();
        writeStatus(`Selected Emotion Setting: ${previewEmotion()?.emotionLabel || "Unknown"}.`);
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
    if (!engine.isSupported()) {
      ensureDefaultProfiles();
      markUnavailable();
      return;
    }
    setTextContent(root, "[data-tts-engine-label]", "Ready");
    setTextContent(root, "[data-tts-engine-status]", "Browser SpeechSynthesis is available for local preview.");
    refreshVoices();
    ensureDefaultProfiles();
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

if (typeof document !== "undefined") {
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
  createMessageStudioTtsProfileOptions,
  createSpeechPreviewRequest,
  createTextToSpeechProfile,
  createTextToSpeechProfileEmotion,
  createTtsMessage,
  createVoiceProfile,
  initializeTextToSpeechTool,
  previewTtsMessage
};
