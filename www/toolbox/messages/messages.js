import {
  createMessage,
  createMessageSegment,
  deleteMessage,
  deleteMessageSegment,
  listEmotionProfiles,
  listMessages,
  listMessageSegments,
  listTtsProfiles,
  updateMessage,
  updateMessageSegment,
  validatePublishConfiguration,
} from "./messages-api-client.js";
import { getSessionCurrent } from "../../../src/api/session-api-client.js";

const NEW_ROW_KEY = "__new__";
const MESSAGE_TABLE_COLSPAN = 8;
const SIGN_IN_ROUTE = "account/sign-in.html";
const TYPEWRITER_SPEED_DEFAULT = 30;
const TTS_PROVIDER_REGISTRY = Object.freeze({
  "azure": Object.freeze({ activeRuntime: false, label: "Azure", requiresConfig: true }),
  "browser-speech": Object.freeze({ activeRuntime: true, label: "Browser Speech API", requiresConfig: false }),
  "elevenlabs": Object.freeze({ activeRuntime: false, label: "ElevenLabs", requiresConfig: true }),
  "openai": Object.freeze({ activeRuntime: false, label: "OpenAI", requiresConfig: true }),
  "polly": Object.freeze({ activeRuntime: false, label: "Polly", requiresConfig: true }),
});

const elements = {
  addMessage: document.querySelector("[data-messages-add-row]"),
  count: document.querySelector("[data-messages-count]"),
  log: document.querySelector("[data-messages-log]"),
  persistenceEngine: document.querySelector("[data-messages-persistence-engine]"),
  persistenceOwner: document.querySelector("[data-messages-persistence-owner]"),
  persistenceSource: document.querySelector("[data-messages-persistence-source]"),
  publishIssues: document.querySelector("[data-messages-publish-issues]"),
  publishStatus: document.querySelector("[data-messages-publish-status]"),
  publishValidate: document.querySelector("[data-messages-publish-validate]"),
  referencedCount: document.querySelector("[data-messages-referenced-count]"),
  selectedEmotion: document.querySelector("[data-messages-selected-emotion]"),
  selectedName: document.querySelector("[data-messages-selected-name]"),
  selectedSpeaker: document.querySelector("[data-messages-selected-speaker]"),
  selectedSegment: document.querySelector("[data-messages-selected-segment]"),
  selectedStatus: document.querySelector("[data-messages-selected-status]"),
  selectedText: document.querySelector("[data-messages-selected-text]"),
  selectedTrigger: document.querySelector("[data-messages-selected-trigger]"),
  selectedTypewriterSpeed: document.querySelector("[data-messages-selected-typewriter-speed]"),
  segmentCount: document.querySelector("[data-messages-segment-count]"),
  speechStatus: document.querySelector("[data-messages-speech-status]"),
  stopSpeech: document.querySelector("[data-messages-stop-speech]"),
  table: document.querySelector("[data-messages-table]"),
  usageCount: document.querySelector("[data-messages-usage-count]"),
  validationCard: document.querySelector("[data-messages-validation-card]"),
  validationErrors: document.querySelector("[data-messages-validation-errors]"),
  referenceList: document.querySelector("[data-messages-reference-list]"),
};

const state = {
  editingMessageKey: "",
  editingSegmentKey: "",
  editingSegmentMessageKey: "",
  emotionProfiles: [],
  messages: [],
  publishValidation: null,
  segments: [],
  selectedMessageKey: "",
  selectedSegmentKey: "",
  voiceProfiles: [],
};

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function createRowHeader(text) {
  const cell = document.createElement("th");
  cell.scope = "row";
  cell.textContent = text;
  return cell;
}

function createButton(label, dataName, value, options = {}) {
  const button = document.createElement("button");
  button.className = options.primary ? "btn btn--compact primary" : "btn btn--compact";
  button.type = "button";
  button.dataset[dataName] = value;
  button.textContent = label;
  if (options.disabled) {
    button.disabled = true;
  }
  if (options.title) {
    button.title = options.title;
  }
  if (options.ariaLabel) {
    button.setAttribute("aria-label", options.ariaLabel);
  }
  return button;
}

function createActionGroup(...buttons) {
  const group = document.createElement("div");
  group.className = "action-group action-group--tight";
  buttons.filter(Boolean).forEach((button) => group.append(button));
  return group;
}

function createInput(value, dataName, ariaLabel) {
  const input = document.createElement("input");
  input.dataset[dataName] = "";
  input.type = "text";
  input.value = value ?? "";
  input.setAttribute("aria-label", ariaLabel);
  return input;
}

function createNumberInput(value, dataName, ariaLabel, options = {}) {
  const input = createInput(String(value ?? ""), dataName, ariaLabel);
  input.type = "number";
  if (options.min !== undefined) {
    input.min = String(options.min);
  }
  if (options.step !== undefined) {
    input.step = String(options.step);
  }
  return input;
}

function createTextarea(value, dataName, ariaLabel) {
  const textarea = document.createElement("textarea");
  textarea.dataset[dataName] = "";
  textarea.rows = 3;
  textarea.value = value ?? "";
  textarea.setAttribute("aria-label", ariaLabel);
  return textarea;
}

function createSelect(value, dataName, options, placeholder, ariaLabel) {
  const select = document.createElement("select");
  select.dataset[dataName] = "";
  select.setAttribute("aria-label", ariaLabel);
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.append(placeholderOption);
  options.forEach((optionValue) => {
    const option = document.createElement("option");
    option.value = optionValue.key;
    option.textContent = optionValue.name;
    select.append(option);
  });
  select.value = options.some((optionValue) => optionValue.key === value) ? value : "";
  return select;
}

function tableMessage(colSpan, text) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = colSpan;
  cell.textContent = text;
  row.append(cell);
  return row;
}

function clearValidation() {
  if (elements.validationErrors) {
    elements.validationErrors.replaceChildren();
  }
  if (elements.validationCard) {
    elements.validationCard.hidden = true;
  }
}

function showValidation(errors) {
  if (!elements.validationErrors || !elements.validationCard) {
    return;
  }
  elements.validationErrors.replaceChildren();
  errors.forEach((error) => {
    const item = document.createElement("li");
    item.textContent = error;
    elements.validationErrors.append(item);
  });
  elements.validationCard.hidden = errors.length === 0;
}

function showCreatorSafeFailure(message) {
  const safeMessage = message || "Message Studio could not finish that action. Check the Local API connection and try again.";
  showValidation([safeMessage]);
  setText(elements.log, safeMessage);
}

function signInUrl() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return SIGN_IN_ROUTE;
  }
  return new URL(SIGN_IN_ROUTE, document.baseURI || window.location.href).href;
}

function currentSessionState() {
  try {
    const session = getSessionCurrent();
    return {
      apiAvailable: true,
      authenticated: Boolean(session?.authenticated && session.userKey),
    };
  } catch (error) {
    console.warn("Message Studio could not verify the current session.", error instanceof Error ? error.message : String(error || ""));
    return {
      apiAvailable: false,
      authenticated: false,
    };
  }
}

function requireAuthenticatedWrite(action) {
  const sessionState = currentSessionState();
  if (!sessionState.apiAvailable) {
    showCreatorSafeFailure("Session status could not be verified. Try again shortly.");
    return false;
  }
  if (!sessionState.authenticated) {
    setText(elements.log, `Sign in before ${action}.`);
    window.location.href = signInUrl();
    return false;
  }
  return true;
}

function activeVoiceProfiles() {
  return state.voiceProfiles.filter((profile) => profile.active);
}

function voiceProfileByKey(profileKey) {
  return state.voiceProfiles.find((profile) => profile.key === profileKey) || null;
}

function ttsProfileByKey(profileKey) {
  return voiceProfileByKey(profileKey);
}

function voiceOptionsWithCurrent(currentKey) {
  const active = activeVoiceProfiles();
  const current = voiceProfileByKey(currentKey);
  if (current && !active.some((profile) => profile.key === current.key)) {
    return [...active, current];
  }
  return active;
}

function emotionOptionsForTtsProfile(profileKey) {
  const profile = ttsProfileByKey(profileKey);
  const settings = Array.isArray(profile?.emotionSettings) ? profile.emotionSettings : [];
  return settings
    .filter((setting) => setting.active !== false)
    .map((setting) => ({
      key: setting.key || emotionProfileByLabel(setting.emotionLabel || setting.emotion)?.key || setting.emotion,
      name: setting.emotionLabel || setting.name || setting.emotion,
    }))
    .filter((setting) => setting.key && setting.name);
}

function emotionProfileByLabel(label) {
  const normalized = String(label || "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return state.emotionProfiles.find((profile) => String(profile.name || "").trim().toLowerCase() === normalized) || null;
}

function emotionSettingForKey(profileKey, emotionKey) {
  const profile = ttsProfileByKey(profileKey);
  const settings = Array.isArray(profile?.emotionSettings) ? profile.emotionSettings : [];
  return settings.find((candidate) => candidate.key === emotionKey)
    || settings.find((candidate) => candidate.emotion === emotionKey)
    || null;
}

function profileEmotionKeyOrDefault(profileKey, currentKey = "") {
  const options = emotionOptionsForTtsProfile(profileKey);
  return options.some((option) => option.key === currentKey) ? currentKey : options[0]?.key || "";
}

function selectedMessage() {
  return state.messages.find((message) => message.key === state.selectedMessageKey) || null;
}

function selectedSegment() {
  return state.segments.find((segment) => segment.key === state.selectedSegmentKey) || null;
}

function messageSegments(messageKey) {
  return state.segments
    .filter((segment) => segment.messageKey === messageKey)
    .sort((left, right) => left.displayOrder - right.displayOrder || left.createdAt.localeCompare(right.createdAt) || left.key.localeCompare(right.key));
}

function nextSegmentOrder(messageKey) {
  const segments = messageSegments(messageKey);
  if (!segments.length) {
    return 1;
  }
  return Math.max(...segments.map((segment) => Number(segment.displayOrder) || 0)) + 1;
}

function messageReferenceCount(messageKey) {
  return messageSegments(messageKey).length;
}

function isMessageReferenced(messageKey) {
  return messageReferenceCount(messageKey) > 0;
}

function tagsForMessage(message) {
  return message?.categoryName || "No tags";
}

function formatTypewriterSpeed(value) {
  const speed = Number(value);
  return Number.isFinite(speed) ? `${speed} cps` : `${TYPEWRITER_SPEED_DEFAULT} cps`;
}

function formatUpdated(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return date.toLocaleString(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function renderCounts() {
  setText(elements.count, String(state.messages.length));
  setText(elements.segmentCount, String(state.segments.length));
  setText(elements.referencedCount, String(state.messages.filter((message) => isMessageReferenced(message.key)).length));
}

function renderPersistence(persistence = {}) {
  setText(elements.persistenceSource, "Local API");
  setText(elements.persistenceEngine, "Local DB target");
  setText(elements.persistenceOwner, persistence.owner || "messages");
}

function renderSelectedMessage() {
  const selected = selectedMessage();
  const segment = selectedSegment();
  setText(elements.selectedName, selected?.name || "None");
  setText(elements.selectedSpeaker, selected?.speaker || "None");
  setText(elements.selectedEmotion, segment?.emotionProfileName || selected?.emotionProfileName || "None");
  setText(elements.selectedSegment, segment ? `Sentence ${segment.displayOrder}` : selected ? `${messageReferenceCount(selected.key)} sentence${messageReferenceCount(selected.key) === 1 ? "" : "s"}` : "None");
  setText(elements.selectedStatus, selected ? `${selected.active === false ? "Archived" : "Active"} / ${isMessageReferenced(selected.key) ? "Referenced" : "Unreferenced"}` : "None");
  setText(elements.selectedTrigger, selected?.trigger || "None");
  setText(elements.selectedTypewriterSpeed, selected ? formatTypewriterSpeed(selected.typewriterSpeed) : "None");
  setText(elements.selectedText, segment?.segmentText || selected?.messageText || "No message selected.");
}

function renderReferenceUsage() {
  if (!elements.referenceList) {
    return;
  }
  const selected = selectedMessage();
  const references = selected ? messageSegments(selected.key) : [];
  setText(elements.usageCount, String(references.length));
  elements.referenceList.replaceChildren();
  if (!selected) {
    const item = document.createElement("li");
    item.textContent = "Select a message to view references.";
    elements.referenceList.append(item);
    return;
  }
  if (!references.length) {
    const item = document.createElement("li");
    item.textContent = "This message has no sentences yet.";
    elements.referenceList.append(item);
    return;
  }
  references.forEach((reference) => {
    const item = document.createElement("li");
    const snippet = reference.segmentText ? `: ${reference.segmentText}` : "";
    item.textContent = `Sentence ${reference.displayOrder}${snippet}`;
    elements.referenceList.append(item);
  });
}

function renderPublishValidation() {
  if (!elements.publishIssues || !elements.publishStatus) {
    return;
  }
  elements.publishIssues.replaceChildren();
  if (!state.publishValidation) {
    setText(elements.publishStatus, "Not checked");
    const item = document.createElement("li");
    item.textContent = "Run validation before publishing.";
    elements.publishIssues.append(item);
    return;
  }
  if (state.publishValidation.valid) {
    setText(elements.publishStatus, "Ready");
    const item = document.createElement("li");
    item.textContent = "No message publish issues.";
    elements.publishIssues.append(item);
    return;
  }
  setText(elements.publishStatus, "Blocked");
  const issues = Array.isArray(state.publishValidation.issues) ? state.publishValidation.issues : [];
  if (!issues.length) {
    const item = document.createElement("li");
    item.textContent = "Message publish validation is blocked. Review messages and profile references.";
    elements.publishIssues.append(item);
    return;
  }
  issues.forEach((issue) => {
    const item = document.createElement("li");
    const targetName = issue.targetName ? `${issue.targetName}: ` : "";
    item.textContent = `${targetName}${issue.message || "Review this message before publishing."}`;
    elements.publishIssues.append(item);
  });
}

function speechRuntime() {
  const synthesis = window.speechSynthesis;
  const Utterance = window.SpeechSynthesisUtterance;
  if (!synthesis || !Utterance) {
    throw new Error("Browser Speech API is unavailable.");
  }
  return { synthesis, Utterance };
}

function profilePreferenceLabel(value, fallback = "Any") {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return fallback;
  }
  const labels = new Map([
    ["adult", "Adult"],
    ["any", "Any"],
    ["child", "Child"],
    ["elderly", "Elderly"],
    ["female", "Female"],
    ["female-preferred", "Female"],
    ["male", "Male"],
    ["male-preferred", "Male"],
    ["neutral", "Neutral"],
    ["teen", "Teen"],
  ]);
  const key = normalized.toLowerCase();
  if (labels.has(key)) {
    return labels.get(key);
  }
  return normalized
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function profileValue(value, fallback) {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function playbackProfileDetails(profile) {
  return {
    ageFilter: profilePreferenceLabel(profile?.ageFilter || profile?.voiceAge || profile?.age, "Any"),
    gender: profilePreferenceLabel(profile?.gender || profile?.genderFilter || profile?.voiceGender, "Any"),
    language: profileValue(profile?.language, "No language selected"),
    profile: profileValue(profile?.name, "No TTS Profile"),
    voice: profileValue(profile?.voiceName || profile?.voice, "No voice selected"),
  };
}

function playbackDiagnostics(profile) {
  const details = playbackProfileDetails(profile);
  return [
    "Playing:",
    `Profile: ${details.profile}`,
    `Gender: ${details.gender}`,
    `Voice: ${details.voice}`,
    `Language: ${details.language}`,
    `Age Filter: ${details.ageFilter}`,
  ].join("\n");
}

function playbackStatus(profile, label) {
  const details = playbackProfileDetails(profile);
  return `Speaking ${label}. Profile: ${details.profile}; Gender: ${details.gender}; Voice: ${details.voice}; Language: ${details.language}; Age Filter: ${details.ageFilter}.`;
}

function browserVoiceForProfile(synthesis, voiceProfile) {
  const voiceName = String(voiceProfile?.voiceName || "").trim();
  if (!voiceName) {
    throw new Error("Select a voice for this TTS Profile before playing.");
  }
  if (voiceName === "Browser default") {
    return null;
  }
  const voices = typeof synthesis.getVoices === "function" ? synthesis.getVoices() : [];
  return voices.find((voice) => voice.name === voiceName || voice.voiceURI === voiceName) || null;
}

function runtimeProviderForProfile(voiceProfile) {
  const provider = TTS_PROVIDER_REGISTRY[voiceProfile?.providerKey || ""];
  if (!provider) {
    throw new Error("TTS Profile provider is not supported.");
  }
  if (!provider.activeRuntime || provider.requiresConfig) {
    throw new Error("TTS Profile provider is not active for browser playback.");
  }
  return provider;
}

function speechItemFromMessage(message) {
  const profileKey = message.voiceProfileKey || "";
  const emotionKey = message.emotionProfileKey || "";
  const voice = ttsProfileByKey(profileKey);
  const emotion = emotionSettingForKey(profileKey, emotionKey);
  return {
    emotion,
    emotionKey,
    label: message.name,
    profileKey,
    text: message.messageText,
    voice,
  };
}

function speechItemFromSegment(segment) {
  const message = state.messages.find((candidate) => candidate.key === segment.messageKey) || null;
  const profileKey = message?.voiceProfileKey || "";
  const emotionKey = segment.emotionProfileKey || "";
  const emotion = emotionSettingForKey(profileKey, emotionKey);
  const voice = ttsProfileByKey(profileKey);
  return {
    emotion,
    emotionKey,
    label: `${segment.messageName || "Message"} sentence ${segment.displayOrder}`,
    profileKey,
    text: segment.segmentText,
    voice,
  };
}

function selectedSpeechItems() {
  const segment = selectedSegment();
  if (segment) {
    return [speechItemFromSegment(segment)];
  }
  const message = selectedMessage();
  if (!message) {
    return [];
  }
  const segments = messageSegments(message.key);
  return segments.length ? segments.map(speechItemFromSegment) : [speechItemFromMessage(message)];
}

function assertSpeechItem(item) {
  if (!String(item?.text || "").trim()) {
    throw new Error("Add sentence text before playback.");
  }
  if (!item.profileKey) {
    throw new Error("Select a TTS Profile for this message before playing.");
  }
  if (!item.voice) {
    throw new Error("Select a TTS Profile for this message before playing.");
  }
  if (!String(item.voice.voiceName || "").trim()) {
    throw new Error("Select a voice for this TTS Profile before playing.");
  }
  if (!item.emotionKey) {
    throw new Error("Select an emotion for this sentence before playing.");
  }
  if (!item.emotion) {
    throw new Error("Add this emotion to the selected TTS Profile before playing.");
  }
  runtimeProviderForProfile(item.voice);
}

function speechPlaybackGuidance(error) {
  const message = error instanceof Error ? error.message : "";
  return message || "Speech playback could not start. Check the selected message, emotion, and TTS Profile.";
}

function speakQueue(items, runtime, index = 0) {
  if (index >= items.length) {
    setText(elements.speechStatus, "Speech playback complete.");
    return;
  }
  const item = items[index];
  try {
    assertSpeechItem(item);
    const utterance = new runtime.Utterance(item.text);
    utterance.rate = Number(item.emotion.rate);
    utterance.pitch = Number(item.emotion.pitch);
    utterance.volume = Number(item.emotion.volume);
    utterance.lang = item.voice.language || "en-US";
    utterance.voice = browserVoiceForProfile(runtime.synthesis, item.voice);
    utterance.onend = () => speakQueue(items, runtime, index + 1);
    utterance.onerror = () => {
      showCreatorSafeFailure("Speech playback stopped before it finished. Check the selected profiles and try again.");
      setText(elements.speechStatus, "Speech playback stopped.");
    };
    if (index === 0) {
      setText(elements.log, playbackDiagnostics(item.voice));
    }
    setText(elements.speechStatus, playbackStatus(item.voice, item.label));
    runtime.synthesis.speak(utterance);
  } catch (error) {
    showCreatorSafeFailure(speechPlaybackGuidance(error));
    setText(elements.speechStatus, "Speech playback unavailable.");
  }
}

function speakSelected() {
  clearValidation();
  const items = selectedSpeechItems();
  if (!items.length) {
    showCreatorSafeFailure("Select a message or sentence before starting speech playback.");
    setText(elements.speechStatus, "No selection.");
    return;
  }
  try {
    const runtime = speechRuntime();
    runtime.synthesis.cancel();
    speakQueue(items, runtime);
  } catch {
    showCreatorSafeFailure("Browser speech playback is unavailable in this browser.");
    setText(elements.speechStatus, "Speech playback unavailable.");
  }
}

function playMessage(key) {
  clearValidation();
  state.selectedMessageKey = key;
  state.selectedSegmentKey = "";
  const message = selectedMessage();
  if (!message) {
    showCreatorSafeFailure("Select a message before starting speech playback.");
    setText(elements.speechStatus, "No selection.");
    return;
  }
  const segments = messageSegments(message.key);
  if (!segments.length) {
    showCreatorSafeFailure("Add at least one sentence before playing this message.");
    setText(elements.speechStatus, "No sentences available.");
    return;
  }
  const items = segments.map(speechItemFromSegment);
  try {
    const runtime = speechRuntime();
    runtime.synthesis.cancel();
    speakQueue(items, runtime);
  } catch {
    showCreatorSafeFailure("Browser speech playback is unavailable in this browser.");
    setText(elements.speechStatus, "Speech playback unavailable.");
  }
}

function playSentence(key) {
  clearValidation();
  const segment = state.segments.find((candidate) => candidate.key === key);
  if (!segment) {
    showCreatorSafeFailure("Select a sentence before starting speech playback.");
    setText(elements.speechStatus, "No selection.");
    return;
  }
  state.selectedMessageKey = segment.messageKey;
  state.selectedSegmentKey = segment.key;
  try {
    const runtime = speechRuntime();
    runtime.synthesis.cancel();
    speakQueue([speechItemFromSegment(segment)], runtime);
  } catch {
    showCreatorSafeFailure("Browser speech playback is unavailable in this browser.");
    setText(elements.speechStatus, "Speech playback unavailable.");
  }
}

function stopSpeech() {
  try {
    window.speechSynthesis?.cancel?.();
  } catch {
    showCreatorSafeFailure("Speech playback could not be stopped. Reload the tool and try again.");
    return;
  }
  setText(elements.speechStatus, "Speech playback stopped.");
  setText(elements.log, "Speech playback stopped.");
}

function createMessageEditRow(message = null) {
  const key = message?.key || NEW_ROW_KEY;
  const row = document.createElement("tr");
  row.dataset.messagesRowEditor = key;

  const messageCell = document.createElement("td");
  messageCell.append(createInput(message?.name || "", "messageName", "Message"));

  const speakerCell = document.createElement("td");
  speakerCell.append(createInput(message?.speaker || "", "messageSpeaker", "Speaker"));

  const textCell = document.createElement("td");
  textCell.append(createTextarea(message?.messageText || "", "messageText", "Message text"));

  const triggerCell = document.createElement("td");
  triggerCell.append(createInput(message?.trigger || "", "messageTrigger", "Trigger"));

  const typewriterSpeedCell = document.createElement("td");
  typewriterSpeedCell.append(createNumberInput(
    message?.typewriterSpeed ?? TYPEWRITER_SPEED_DEFAULT,
    "messageTypewriterSpeed",
    "Typewriter speed",
    { min: 0, step: 1 },
  ));

  const profileCell = document.createElement("td");
  profileCell.append(createSelect(
    message?.voiceProfileKey || "",
    "messageTtsProfile",
    voiceOptionsWithCurrent(message?.voiceProfileKey || ""),
    "Select TTS profile",
    "TTS Profile",
  ));

  const actions = document.createElement("td");
  actions.append(createActionGroup(
    createButton("Save", "messagesCommit", key, { primary: true }),
    createButton("Cancel", "messagesCancel", key),
  ));

  row.append(
    messageCell,
    speakerCell,
    textCell,
    triggerCell,
    typewriterSpeedCell,
    profileCell,
    createCell(message ? formatUpdated(message.updatedAt) : "New"),
    actions,
  );
  return row;
}

function createMessageSegmentEditRow(messageKey, segment = null) {
  const key = segment?.key || NEW_ROW_KEY;
  const row = document.createElement("tr");
  row.dataset.messagesSegmentEditor = key;
  row.dataset.messagesSegmentMessage = messageKey;

  const orderCell = document.createElement("td");
  orderCell.append(createNumberInput(segment?.displayOrder || nextSegmentOrder(messageKey), "segmentOrder", "Order", { min: 1, step: 1 }));

  const textCell = document.createElement("td");
  textCell.append(createTextarea(segment?.segmentText || "", "segmentText", "Sentence text"));

  const emotionCell = document.createElement("td");
  const message = state.messages.find((candidate) => candidate.key === messageKey) || null;
  emotionCell.append(createSelect(
    segment?.emotionProfileKey || "",
    "segmentEmotion",
    emotionOptionsForTtsProfile(message?.voiceProfileKey || segment?.voiceProfileKey || ""),
    "Select emotion",
    "Sentence emotion",
  ));

  const actions = document.createElement("td");
  actions.append(createActionGroup(
    createButton("Save", "messagesSegmentCommit", key, { primary: true }),
    createButton("Cancel", "messagesSegmentCancel", key),
  ));

  row.append(
    orderCell,
    textCell,
    emotionCell,
    actions,
  );
  return row;
}

function createMessageSegmentRow(segment) {
  const row = document.createElement("tr");
  row.dataset.messagesSegmentRow = segment.key;
  row.setAttribute("aria-selected", String(state.selectedSegmentKey === segment.key));
  const archiveButton = createButton(segment.active === false ? "Restore" : "Archive", "messagesSegmentArchive", segment.key, {
    ariaLabel: `${segment.active === false ? "Restore" : "Archive"} sentence ${segment.displayOrder}`,
  });
  const actions = document.createElement("td");
  actions.append(createActionGroup(
    createButton("Play", "messagesSegmentPlay", segment.key, {
      ariaLabel: `Play sentence ${segment.displayOrder}`,
    }),
    createButton("Edit", "messagesSegmentEdit", segment.key),
    archiveButton,
    createButton("Delete", "messagesSegmentDelete", segment.key),
  ));
  row.append(
    createCell(segment.active === false ? `${segment.displayOrder} (Archived)` : String(segment.displayOrder)),
    createCell(segment.segmentText || "No text"),
    createCell(segment.emotionProfileName || "No emotion"),
    actions,
  );
  return row;
}

function createMessagePartsTable(message) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-stack";

  const header = document.createElement("div");
  header.className = "surface-header";
  const title = document.createElement("div");
  const kicker = document.createElement("div");
  kicker.className = "kicker";
  kicker.textContent = "Message / Sentences";
  const heading = document.createElement("h4");
  heading.textContent = `${message.name} Sentences`;
  title.append(kicker, heading);
  const actions = document.createElement("div");
  actions.className = "action-group action-group--tight";
  actions.append(createButton("Add Sentence", "messagesSegmentAdd", message.key));
  header.append(title, actions);

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "table-wrapper";
  const table = document.createElement("table");
  table.className = "data-table data-table--fixed";
  table.setAttribute("aria-label", `${message.name} Sentences`);
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Order", "Text", "Emotion", "Actions"].forEach((label) => {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = label;
    headerRow.append(cell);
  });
  thead.append(headerRow);
  const tbody = document.createElement("tbody");
  tbody.dataset.messagesSegmentTable = message.key;

  const segments = messageSegments(message.key);
  if (!segments.length && !(state.editingSegmentKey === NEW_ROW_KEY && state.editingSegmentMessageKey === message.key)) {
    tbody.append(tableMessage(4, "No sentences yet. Add a sentence for this message when ready."));
  }
  segments.forEach((segment) => {
    if (state.editingSegmentKey === segment.key) {
      tbody.append(createMessageSegmentEditRow(message.key, segment));
      return;
    }
    tbody.append(createMessageSegmentRow(segment));
  });
  if (state.editingSegmentKey === NEW_ROW_KEY && state.editingSegmentMessageKey === message.key) {
    tbody.append(createMessageSegmentEditRow(message.key, null));
  }

  table.append(thead, tbody);
  tableWrapper.append(table);
  wrapper.append(header, tableWrapper);
  return wrapper;
}

function appendMessagePartsHost(message) {
  if (state.selectedMessageKey !== message.key) {
    return;
  }
  const hostRow = document.createElement("tr");
  hostRow.dataset.messagesPartsHost = message.key;
  const cell = document.createElement("td");
  cell.colSpan = MESSAGE_TABLE_COLSPAN;
  cell.append(createMessagePartsTable(message));
  hostRow.append(cell);
  elements.table.append(hostRow);
}

function createMessageRow(message) {
  const row = document.createElement("tr");
  row.dataset.messagesRow = message.key;
  row.tabIndex = 0;
  row.setAttribute("aria-selected", String(state.selectedMessageKey === message.key));
  row.setAttribute("aria-expanded", String(state.selectedMessageKey === message.key));

  const referenced = isMessageReferenced(message.key);
  const deleteButton = createButton("Delete", "messagesDelete", message.key, {
    ariaLabel: referenced ? `Delete disabled for referenced message ${message.name}` : `Delete ${message.name}`,
    disabled: referenced,
    title: referenced ? "Delete disabled: this message has sentences." : "Delete message",
  });
  const archiveButton = createButton(message.active === false ? "Restore" : "Archive", "messagesArchive", message.key, {
    ariaLabel: `${message.active === false ? "Restore" : "Archive"} ${message.name}`,
  });
  const actions = document.createElement("td");
  actions.append(createActionGroup(
    createButton("Play", "messagesPlay", message.key, {
      ariaLabel: `Play ${message.name}`,
    }),
    createButton("Sentences", "messagesToggleParts", message.key, {
      ariaLabel: `${state.selectedMessageKey === message.key ? "Hide" : "Show"} sentences for ${message.name}`,
    }),
    createButton("Edit", "messagesEdit", message.key),
    archiveButton,
    deleteButton,
  ));

  row.append(
    createRowHeader(message.active === false ? `${message.name} (Archived)` : message.name),
    createCell(message.speaker || "No speaker"),
    createCell(message.messageText || "No text"),
    createCell(message.trigger || "No trigger"),
    createCell(formatTypewriterSpeed(message.typewriterSpeed)),
    createCell(message.voiceProfileName || "No TTS profile"),
    createCell(formatUpdated(message.updatedAt)),
    actions,
  );
  return row;
}

function renderMessageRows() {
  if (!elements.table) {
    return;
  }
  elements.table.replaceChildren();

  if (state.editingMessageKey === NEW_ROW_KEY) {
    elements.table.append(createMessageEditRow(null));
  }

  if (!state.messages.length && state.editingMessageKey !== NEW_ROW_KEY) {
    elements.table.append(tableMessage(MESSAGE_TABLE_COLSPAN, "No messages yet. Add your first message when you are ready."));
    return;
  }

  state.messages.forEach((message) => {
    if (state.editingMessageKey === message.key) {
      elements.table.append(createMessageEditRow(message));
      return;
    }
    elements.table.append(createMessageRow(message));
    appendMessagePartsHost(message);
  });
}

function render(persistence = {}) {
  renderMessageRows();
  renderSelectedMessage();
  renderReferenceUsage();
  renderPublishValidation();
  renderCounts();
  renderPersistence(persistence);
}

function editorValue(root, selector) {
  return root?.querySelector(selector)?.value || "";
}

function messageValues(key) {
  const root = elements.table?.querySelector(`[data-messages-row-editor="${key}"]`);
  const existing = state.messages.find((message) => message.key === key) || null;
  const name = editorValue(root, "[data-message-name]");
  const messageText = editorValue(root, "[data-message-text]");
  const speaker = editorValue(root, "[data-message-speaker]");
  const trigger = editorValue(root, "[data-message-trigger]");
  const typewriterSpeed = editorValue(root, "[data-message-typewriter-speed]");
  const voiceProfileKey = editorValue(root, "[data-message-tts-profile]");
  const emotionProfileKey = profileEmotionKeyOrDefault(voiceProfileKey, existing?.emotionProfileKey || "");
  return {
    active: existing ? existing.active : true,
    emotionProfileKey,
    messageText,
    name,
    notes: existing?.notes || "",
    speaker,
    trigger,
    typewriterSpeed,
    voiceProfileKey,
  };
}

function validateMessage(values) {
  const errors = [];
  if (!values.name.trim()) {
    errors.push("Message is required.");
  }
  if (!values.messageText.trim()) {
    errors.push("Message text is required.");
  }
  const typewriterSpeed = Number(values.typewriterSpeed);
  if (!Number.isFinite(typewriterSpeed) || typewriterSpeed < 0) {
    errors.push("Typewriter speed must be 0 or greater.");
  }
  if (!values.voiceProfileKey) {
    errors.push("TTS Profile is required.");
  }
  if (!values.emotionProfileKey) {
    errors.push("The selected TTS Profile needs at least one emotion before saving a message.");
  }
  return errors;
}

function segmentValues(key) {
  const root = elements.table?.querySelector(`[data-messages-segment-editor="${key}"]`);
  const existing = state.segments.find((segment) => segment.key === key) || null;
  const messageKey = root?.dataset.messagesSegmentMessage || existing?.messageKey || state.selectedMessageKey;
  const message = state.messages.find((candidate) => candidate.key === messageKey) || null;
  return {
    active: existing ? existing.active : true,
    displayOrder: editorValue(root, "[data-segment-order]"),
    emotionProfileKey: editorValue(root, "[data-segment-emotion]"),
    messageKey,
    segmentText: editorValue(root, "[data-segment-text]"),
    voiceProfileKey: message?.voiceProfileKey || existing?.voiceProfileKey || "",
  };
}

function validateSegment(values) {
  const errors = [];
  if (!values.messageKey) {
    errors.push("Select a message before adding a sentence.");
  }
  if (!values.segmentText.trim()) {
    errors.push("Sentence text is required.");
  }
  if (!values.emotionProfileKey) {
    errors.push("Emotion is required.");
  }
  const displayOrder = Number(values.displayOrder);
  if (!Number.isInteger(displayOrder) || displayOrder < 1) {
    errors.push("Order must be a whole number of 1 or greater.");
  }
  return errors;
}

function markPublishValidationStale() {
  state.publishValidation = null;
}

async function runPublishValidation() {
  clearValidation();
  try {
    const result = validatePublishConfiguration();
    state.publishValidation = result.publishValidation || null;
    renderPublishValidation();
    setText(elements.log, state.publishValidation?.valid
      ? "Publish validation passed."
      : "Publish blocked by message validation.");
  } catch {
    showCreatorSafeFailure("Publish validation could not run. Check the Local API connection and try again.");
  }
}

async function loadAll() {
  const emotionPayload = listEmotionProfiles();
  const messagesPayload = listMessages();
  const segmentsPayload = listMessageSegments();
  const voicePayload = listTtsProfiles();
  state.emotionProfiles = emotionPayload.emotionProfiles || [];
  state.messages = messagesPayload.messages || [];
  state.segments = segmentsPayload.segments || [];
  state.voiceProfiles = voicePayload.ttsProfiles || [];
  if (state.selectedMessageKey && !state.messages.some((message) => message.key === state.selectedMessageKey)) {
    state.selectedMessageKey = "";
  }
  if (state.selectedSegmentKey && !state.segments.some((segment) => segment.key === state.selectedSegmentKey)) {
    state.selectedSegmentKey = "";
  }
  render(messagesPayload.persistence || emotionPayload.persistence || segmentsPayload.persistence || voicePayload.persistence);
  if (!state.voiceProfiles.length) {
    setText(elements.log, "Message Studio loaded. Add a TTS Profile in Text To Speech before adding playback.");
    return;
  }
  setText(elements.log, "Message Studio loaded.");
}

async function reloadAfterChange(messageKey = state.selectedMessageKey) {
  markPublishValidationStale();
  await loadAll();
  state.selectedMessageKey = messageKey && state.messages.some((message) => message.key === messageKey) ? messageKey : "";
  render();
}

async function commitMessage(key) {
  if (!requireAuthenticatedWrite("saving Messages")) {
    return;
  }
  const values = messageValues(key);
  const errors = validateMessage(values);
  if (errors.length) {
    showValidation(errors);
    setText(elements.log, "Message row needs required fields.");
    return;
  }
  clearValidation();
  try {
    const payload = {
      ...values,
      typewriterSpeed: Number(values.typewriterSpeed),
    };
    const result = key === NEW_ROW_KEY
      ? createMessage(payload)
      : updateMessage(key, payload);
    state.editingMessageKey = "";
    await reloadAfterChange(result.message.key);
    setText(elements.log, `Saved message ${result.message.name}.`);
  } catch {
    showCreatorSafeFailure("Message was not saved. Check required fields and try again.");
  }
}

async function deleteMessageRecord(key) {
  if (!requireAuthenticatedWrite("deleting Messages")) {
    return;
  }
  const message = state.messages.find((candidate) => candidate.key === key);
  if (!message) {
    return;
  }
  if (isMessageReferenced(key)) {
    showCreatorSafeFailure("Delete is blocked because this message has sentences.");
    return;
  }
  clearValidation();
  try {
    deleteMessage(key);
    state.editingMessageKey = "";
    state.selectedMessageKey = "";
    await reloadAfterChange("");
    setText(elements.log, `Deleted message ${message.name}.`);
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "";
    showCreatorSafeFailure(
      messageText.toLowerCase().includes("referenced")
        ? "Delete is blocked because this message has sentences."
        : "Message was not deleted. Check the Local API connection and try again.",
    );
  }
}

async function archiveMessageRecord(key) {
  if (!requireAuthenticatedWrite("updating Messages")) {
    return;
  }
  const message = state.messages.find((candidate) => candidate.key === key);
  if (!message) {
    return;
  }
  clearValidation();
  try {
    const result = updateMessage(key, { active: message.active === false });
    await reloadAfterChange(result.message.key);
    setText(elements.log, `${result.message.active === false ? "Archived" : "Restored"} message ${result.message.name}.`);
  } catch {
    showCreatorSafeFailure("Message archive status was not changed. Check the Local API connection and try again.");
  }
}

async function commitSegment(key) {
  if (!requireAuthenticatedWrite("saving Message sentences")) {
    return;
  }
  const values = segmentValues(key);
  const errors = validateSegment(values);
  if (errors.length) {
    showValidation(errors);
    setText(elements.log, "Sentence row needs required fields.");
    return;
  }
  clearValidation();
  try {
    const payload = {
      ...values,
      displayOrder: Number(values.displayOrder),
    };
    const result = key === NEW_ROW_KEY
      ? createMessageSegment(payload)
      : updateMessageSegment(key, payload);
    state.editingSegmentKey = "";
    state.editingSegmentMessageKey = "";
    state.selectedMessageKey = result.segment.messageKey;
    state.selectedSegmentKey = result.segment.key;
    await reloadAfterChange(result.segment.messageKey);
    setText(elements.log, `Saved sentence ${result.segment.displayOrder}.`);
  } catch {
    showCreatorSafeFailure("Sentence was not saved. Check required fields and try again.");
  }
}

async function deleteSegmentRecord(key) {
  if (!requireAuthenticatedWrite("deleting Message sentences")) {
    return;
  }
  const segment = state.segments.find((candidate) => candidate.key === key);
  if (!segment) {
    return;
  }
  clearValidation();
  try {
    deleteMessageSegment(key);
    state.editingSegmentKey = "";
    state.editingSegmentMessageKey = "";
    state.selectedSegmentKey = "";
    await reloadAfterChange(segment.messageKey);
    setText(elements.log, `Deleted sentence ${segment.displayOrder}.`);
  } catch {
    showCreatorSafeFailure("Sentence was not deleted. Check the Local API connection and try again.");
  }
}

async function archiveSegmentRecord(key) {
  if (!requireAuthenticatedWrite("updating Message sentences")) {
    return;
  }
  const segment = state.segments.find((candidate) => candidate.key === key);
  if (!segment) {
    return;
  }
  clearValidation();
  try {
    const result = updateMessageSegment(key, {
      active: segment.active === false,
      displayOrder: segment.displayOrder,
      emotionProfileKey: segment.emotionProfileKey,
      messageKey: segment.messageKey,
      segmentText: segment.segmentText,
      voiceProfileKey: segment.voiceProfileKey,
    });
    state.editingSegmentKey = "";
    state.editingSegmentMessageKey = "";
    state.selectedMessageKey = result.segment.messageKey;
    state.selectedSegmentKey = result.segment.key;
    await reloadAfterChange(result.segment.messageKey);
    setText(elements.log, `${result.segment.active === false ? "Archived" : "Restored"} sentence ${result.segment.displayOrder}.`);
  } catch {
    showCreatorSafeFailure("Sentence archive status was not changed. Check the Local API connection and try again.");
  }
}

function beginAddMessage() {
  clearValidation();
  state.editingMessageKey = NEW_ROW_KEY;
  state.editingSegmentKey = "";
  state.editingSegmentMessageKey = "";
  state.selectedMessageKey = "";
  render();
  setText(elements.log, "Ready to add a message.");
}

function beginEditMessage(key) {
  clearValidation();
  state.editingMessageKey = key;
  state.editingSegmentKey = "";
  state.editingSegmentMessageKey = "";
  state.selectedMessageKey = key;
  state.selectedSegmentKey = "";
  render();
  setText(elements.log, "Message row opened inline.");
}

function cancelMessageEdit() {
  state.editingMessageKey = "";
  clearValidation();
  render();
  setText(elements.log, "Message row edit canceled.");
}

function beginAddSegment(messageKey) {
  clearValidation();
  state.editingMessageKey = "";
  state.editingSegmentKey = NEW_ROW_KEY;
  state.editingSegmentMessageKey = messageKey;
  state.selectedMessageKey = messageKey;
  state.selectedSegmentKey = "";
  render();
  setText(elements.log, "Ready to add a sentence.");
}

function beginEditSegment(key) {
  const segment = state.segments.find((candidate) => candidate.key === key);
  if (!segment) {
    return;
  }
  clearValidation();
  state.editingMessageKey = "";
  state.editingSegmentKey = key;
  state.editingSegmentMessageKey = segment.messageKey;
  state.selectedMessageKey = segment.messageKey;
  state.selectedSegmentKey = key;
  render();
  setText(elements.log, "Sentence row opened inline.");
}

function cancelSegmentEdit() {
  state.editingSegmentKey = "";
  state.editingSegmentMessageKey = "";
  clearValidation();
  render();
  setText(elements.log, "Sentence row edit canceled.");
}

elements.addMessage?.addEventListener("click", () => {
  beginAddMessage();
});

elements.stopSpeech?.addEventListener("click", () => {
  stopSpeech();
});

elements.publishValidate?.addEventListener("click", () => {
  runPublishValidation();
});

elements.table?.addEventListener("click", async (event) => {
  const togglePartsButton = event.target.closest("[data-messages-toggle-parts]");
  const editButton = event.target.closest("[data-messages-edit]");
  const commitButton = event.target.closest("[data-messages-commit]");
  const cancelButton = event.target.closest("[data-messages-cancel]");
  const archiveButton = event.target.closest("[data-messages-archive]");
  const deleteButton = event.target.closest("[data-messages-delete]");
  const playButton = event.target.closest("[data-messages-play]");
  const segmentAddButton = event.target.closest("[data-messages-segment-add]");
  const segmentEditButton = event.target.closest("[data-messages-segment-edit]");
  const segmentCommitButton = event.target.closest("[data-messages-segment-commit]");
  const segmentCancelButton = event.target.closest("[data-messages-segment-cancel]");
  const segmentArchiveButton = event.target.closest("[data-messages-segment-archive]");
  const segmentDeleteButton = event.target.closest("[data-messages-segment-delete]");
  const segmentPlayButton = event.target.closest("[data-messages-segment-play]");
  const segmentRow = event.target.closest("[data-messages-segment-row]");
  const row = event.target.closest("[data-messages-row]");

  if (togglePartsButton) {
    const key = togglePartsButton.dataset.messagesToggleParts;
    state.selectedMessageKey = state.selectedMessageKey === key ? "" : key;
    state.selectedSegmentKey = "";
    state.editingSegmentKey = "";
    state.editingSegmentMessageKey = "";
    clearValidation();
    render();
    setText(elements.log, state.selectedMessageKey ? "Sentences expanded." : "Sentences collapsed.");
    return;
  }
  if (editButton) {
    beginEditMessage(editButton.dataset.messagesEdit);
    return;
  }
  if (commitButton) {
    await commitMessage(commitButton.dataset.messagesCommit);
    return;
  }
  if (cancelButton) {
    cancelMessageEdit();
    return;
  }
  if (archiveButton) {
    await archiveMessageRecord(archiveButton.dataset.messagesArchive);
    return;
  }
  if (deleteButton) {
    await deleteMessageRecord(deleteButton.dataset.messagesDelete);
    return;
  }
  if (playButton) {
    playMessage(playButton.dataset.messagesPlay);
    return;
  }
  if (segmentAddButton) {
    beginAddSegment(segmentAddButton.dataset.messagesSegmentAdd);
    return;
  }
  if (segmentEditButton) {
    beginEditSegment(segmentEditButton.dataset.messagesSegmentEdit);
    return;
  }
  if (segmentCommitButton) {
    await commitSegment(segmentCommitButton.dataset.messagesSegmentCommit);
    return;
  }
  if (segmentCancelButton) {
    cancelSegmentEdit();
    return;
  }
  if (segmentArchiveButton) {
    await archiveSegmentRecord(segmentArchiveButton.dataset.messagesSegmentArchive);
    return;
  }
  if (segmentDeleteButton) {
    await deleteSegmentRecord(segmentDeleteButton.dataset.messagesSegmentDelete);
    return;
  }
  if (segmentPlayButton) {
    playSentence(segmentPlayButton.dataset.messagesSegmentPlay);
    return;
  }
  if (segmentRow && !event.target.closest("button, input, select, textarea")) {
    const segment = state.segments.find((candidate) => candidate.key === segmentRow.dataset.messagesSegmentRow);
    if (segment) {
      state.selectedMessageKey = segment.messageKey;
      state.selectedSegmentKey = segment.key;
      render();
    }
    return;
  }
  if (row && !event.target.closest("button, input, select, textarea")) {
    state.selectedMessageKey = state.selectedMessageKey === row.dataset.messagesRow ? "" : row.dataset.messagesRow;
    state.selectedSegmentKey = "";
    state.editingSegmentKey = "";
    state.editingSegmentMessageKey = "";
    render();
  }
});

elements.table?.addEventListener("keydown", (event) => {
  const row = event.target.closest("[data-messages-row]");
  if (!row || !["Enter", " "].includes(event.key)) {
    return;
  }
  event.preventDefault();
  state.selectedMessageKey = state.selectedMessageKey === row.dataset.messagesRow ? "" : row.dataset.messagesRow;
  render();
});

try {
  await loadAll();
} catch {
  showCreatorSafeFailure("Message Studio could not load messages. Start the Local API and reload this tool.");
}
