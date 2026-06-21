import {
  createMessage,
  createMessageSegment,
  listEmotionProfiles,
  listMessages,
  listMessageSegments,
  listTtsProfiles,
  updateMessage,
  updateMessageSegment,
} from "./messages-api-client.js";
import { createMessageStudioTtsServiceRegistry } from "./message-tts-service-registry.js";

const NEW_ROW_KEY = "__new__";
const DEFAULT_TTS_PROFILE_KEY = "__default-balanced-tts__";
const DEFAULT_TTS_EMOTION_SETTINGS = Object.freeze([
  Object.freeze({ active: true, emotion: "calm", emotionLabel: "Calm", pitch: 1, rate: 1, ssmlLikePreset: "normal", volume: 1 }),
  Object.freeze({ active: true, emotion: "urgent", emotionLabel: "Urgent", pitch: 1.08, rate: 1.15, ssmlLikePreset: "normal", volume: 1 }),
  Object.freeze({ active: true, emotion: "whisper", emotionLabel: "Whisper", pitch: 0.95, rate: 0.9, ssmlLikePreset: "normal", volume: 0.55 }),
  Object.freeze({ active: true, emotion: "angry", emotionLabel: "Angry", pitch: 0.98, rate: 1.1, ssmlLikePreset: "normal", volume: 1 }),
]);
const DEFAULT_TTS_PROFILE = Object.freeze({
  active: true,
  description: "Balanced local browser playback option until authored TTS profiles are available.",
  emotionSettings: DEFAULT_TTS_EMOTION_SETTINGS,
  key: DEFAULT_TTS_PROFILE_KEY,
  language: "en-US",
  name: "Default Balanced TTS Profile",
  pitch: 1,
  providerKey: "browser-speech",
  rate: 1,
  voiceName: "",
  volume: 1,
});
const ttsServiceRegistry = createMessageStudioTtsServiceRegistry();

const elements = {
  count: document.querySelector("[data-messages-count]"),
  log: document.querySelector("[data-messages-log]"),
  persistenceEngine: document.querySelector("[data-messages-persistence-engine]"),
  persistenceOwner: document.querySelector("[data-messages-persistence-owner]"),
  persistenceSource: document.querySelector("[data-messages-persistence-source]"),
  previewStatus: document.querySelector("[data-messages-preview-status]"),
  previewTtsProfile: document.querySelector("[data-messages-preview-tts-profile]"),
  selectedEmotion: document.querySelector("[data-messages-selected-emotion]"),
  selectedName: document.querySelector("[data-messages-selected-name]"),
  selectedSegment: document.querySelector("[data-messages-selected-segment]"),
  selectedStatus: document.querySelector("[data-messages-selected-status]"),
  selectedText: document.querySelector("[data-messages-selected-text]"),
  segmentCount: document.querySelector("[data-messages-segment-count]"),
  speechTestTarget: document.querySelector("[data-messages-speech-test-target]"),
  stopSpeech: document.querySelector("[data-messages-stop-speech]"),
  table: document.querySelector("[data-messages-table]"),
  testSpeech: document.querySelector("[data-messages-test-speech]"),
  ttsCount: document.querySelector("[data-messages-tts-count]"),
  ttsService: document.querySelector("[data-messages-tts-service]"),
  validationCard: document.querySelector("[data-messages-validation-card]"),
  validationErrors: document.querySelector("[data-messages-validation-errors]"),
};

const state = {
  editingMessageKey: "",
  editingSegmentKey: "",
  emotionProfiles: [],
  messageTtsProfileKeys: new Map(),
  messages: [],
  segmentTtsProfileKeys: new Map(),
  segments: [],
  selectedMessageKey: "",
  selectedSegmentKey: "",
  ttsServices: [],
  ttsProfiles: [],
};

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function statusForActive(active) {
  return active ? "Active" : "Inactive";
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

function createInput(value, dataName, type = "text") {
  const input = document.createElement("input");
  input.dataset[dataName] = "";
  input.type = type;
  input.value = value ?? "";
  return input;
}

function createNumberInput(value, dataName, options = {}) {
  const input = createInput(String(value ?? ""), dataName, "number");
  if (options.min !== undefined) {
    input.min = String(options.min);
  }
  if (options.max !== undefined) {
    input.max = String(options.max);
  }
  if (options.step !== undefined) {
    input.step = String(options.step);
  }
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

function createTextarea(value, dataName, rows = 4) {
  const textarea = document.createElement("textarea");
  textarea.dataset[dataName] = "";
  textarea.rows = rows;
  textarea.value = value ?? "";
  return textarea;
}

function createSelect(value, dataName, options, placeholder) {
  const select = document.createElement("select");
  select.dataset[dataName] = "";
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

function createTtsProfileSelect(value, dataName, identityKey) {
  const select = createSelect(
    value || defaultTtsProfileKey(),
    dataName,
    activeTtsProfileOptions(),
    "Select TTS profile",
  );
  if (identityKey) {
    select.dataset.messagesTtsIdentity = identityKey;
  }
  return select;
}

function populateSelect(select, options, placeholder) {
  if (!select) {
    return;
  }
  const currentValue = select.value;
  select.replaceChildren();
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.append(placeholderOption);
  options.forEach((optionValue) => {
    const option = document.createElement("option");
    option.value = optionValue.key;
    option.textContent = optionValue.name;
    option.disabled = optionValue.disabled === true;
    select.append(option);
  });
  select.value = options.some((optionValue) => optionValue.key === currentValue && optionValue.disabled !== true)
    ? currentValue
    : "";
}

function createField(labelText, field) {
  const label = document.createElement("label");
  const span = document.createElement("span");
  span.textContent = labelText;
  label.append(span, field);
  return label;
}

function tableMessage(colSpan, text) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = colSpan;
  cell.textContent = text;
  row.append(cell);
  return row;
}

function tableActionRow(colSpan, button) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = colSpan;
  cell.append(createActionGroup(button));
  row.append(cell);
  return row;
}

function createMessageAddControlRow() {
  const row = tableActionRow(6, createButton("Add Message", "messagesAddRow", NEW_ROW_KEY));
  row.dataset.messagesAddControlRow = "";
  return row;
}

function createSegmentAddControlRow() {
  const row = tableActionRow(5, createButton("Add Part", "messagesSegmentAddRow", state.selectedMessageKey));
  row.dataset.messagesSegmentAddControlRow = state.selectedMessageKey;
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

function activeEmotionProfiles() {
  return state.emotionProfiles.filter((profile) => profile.active);
}

function selectedMessage() {
  return state.messages.find((message) => message.key === state.selectedMessageKey) || null;
}

function selectedSegment() {
  return state.segments.find((segment) => segment.key === state.selectedSegmentKey) || null;
}

function emotionProfileByKey(profileKey) {
  return state.emotionProfiles.find((profile) => profile.key === profileKey) || null;
}

function emotionSettingKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "neutral";
}

function selectedEmotionSettingForProfile(profile, emotionProfile) {
  const settings = Array.isArray(profile?.emotionSettings)
    ? profile.emotionSettings.filter((setting) => setting?.active !== false)
    : [];
  const selectedEmotionKey = emotionSettingKey(emotionProfile?.name);
  const setting = settings.find((candidate) => (
    emotionSettingKey(candidate.emotion) === selectedEmotionKey
    || emotionSettingKey(candidate.emotionLabel) === selectedEmotionKey
  ));
  if (!setting) {
    return {
      message: `Selected TTS Profile "${profile?.name || "Unknown"}" does not include an Emotion Setting for "${emotionProfile?.name || "Unknown"}".`,
      ok: false,
    };
  }
  return { ok: true, setting };
}

function activeTtsProfileOptions() {
  const activeProfiles = state.ttsProfiles.filter((profile) => profile.active);
  return activeProfiles.length ? activeProfiles : [DEFAULT_TTS_PROFILE];
}

function defaultTtsProfileKey() {
  return activeTtsProfileOptions()[0]?.key || DEFAULT_TTS_PROFILE_KEY;
}

function ttsProfileOptionByKey(profileKey) {
  return activeTtsProfileOptions().find((profile) => profile.key === profileKey)
    || activeTtsProfileOptions()[0]
    || DEFAULT_TTS_PROFILE;
}

function selectedTtsProfileForMessage(messageKey) {
  return ttsProfileOptionByKey(state.messageTtsProfileKeys.get(messageKey) || defaultTtsProfileKey());
}

function selectedTtsProfileForSegment(segmentKey, messageKey = state.selectedMessageKey) {
  return ttsProfileOptionByKey(
    state.segmentTtsProfileKeys.get(segmentKey)
    || state.messageTtsProfileKeys.get(messageKey)
    || defaultTtsProfileKey(),
  );
}

function selectedTtsProfile() {
  return ttsProfileOptionByKey(elements.previewTtsProfile?.value || defaultTtsProfileKey());
}

function selectedTtsService() {
  return state.ttsServices.find((service) => service.key === elements.ttsService?.value) || null;
}

function selectedSpeechTarget() {
  const segment = selectedSegment();
  if (segment) {
    return {
      emotionProfile: emotionProfileByKey(segment.emotionProfileKey),
      id: segment.key,
      label: `Part ${segment.displayOrder}`,
      name: `${segment.messageName || "Message"} part ${segment.displayOrder}`,
      profile: selectedTtsProfileForSegment(segment.key, segment.messageKey),
      text: segment.segmentText,
      type: "part",
    };
  }
  const message = selectedMessage();
  if (!message) {
    return null;
  }
  return {
    emotionProfile: emotionProfileByKey(message.emotionProfileKey),
    id: message.key,
    label: `Message: ${message.name}`,
    name: message.name,
    profile: selectedTtsProfileForMessage(message.key),
    text: message.messageText,
    type: "message",
  };
}

function messageSegments(messageKey) {
  return state.segments
    .filter((segment) => segment.messageKey === messageKey)
    .sort((left, right) => left.displayOrder - right.displayOrder || left.createdAt.localeCompare(right.createdAt) || left.key.localeCompare(right.key));
}

function selectedMessageSegments() {
  return messageSegments(state.selectedMessageKey);
}

function nextSegmentOrder() {
  const segments = selectedMessageSegments();
  if (!segments.length) {
    return 1;
  }
  return Math.max(...segments.map((segment) => segment.displayOrder)) + 1;
}

function selectOptionsWithCurrent(currentKey) {
  const active = activeEmotionProfiles();
  const current = emotionProfileByKey(currentKey);
  if (current && !active.some((profile) => profile.key === current.key)) {
    return [...active, current];
  }
  return active;
}

function renderCounts() {
  setText(elements.count, String(state.messages.length));
  setText(elements.segmentCount, String(state.segments.length));
  setText(elements.ttsCount, String(activeTtsProfileOptions().length));
}

function renderPersistence(persistence = {}) {
  setText(elements.persistenceSource, "Local API");
  setText(elements.persistenceEngine, "Postgres target");
  setText(elements.persistenceOwner, persistence.owner || "messages");
}

function renderSelectedMessage() {
  const selected = selectedMessage();
  const segment = selectedSegment();
  setText(elements.selectedName, selected?.name || "None");
  setText(elements.selectedEmotion, selected?.emotionProfileName || "None");
  setText(elements.selectedSegment, segment ? `${segment.displayOrder}: ${segment.segmentText}` : "None");
  setText(elements.selectedStatus, selected ? statusForActive(selected.active) : "None");
  setText(elements.selectedText, segment?.segmentText || selected?.messageText || "No message selected.");
}

function renderTtsServiceOptions() {
  state.ttsServices = ttsServiceRegistry.listServices();
  const options = state.ttsServices.map((service) => ({
    disabled: !service.available,
    key: service.key,
    name: service.available ? service.name : `${service.name} unavailable`,
  }));
  populateSelect(elements.ttsService, options, "No TTS service available");
  const availableService = state.ttsServices.find((service) => service.available);
  if (!elements.ttsService?.value && availableService) {
    elements.ttsService.value = availableService.key;
  }
  if (elements.ttsService) {
    elements.ttsService.disabled = !availableService;
  }
}

function renderTtsProfileOptions() {
  const activeProfiles = activeTtsProfileOptions();
  populateSelect(elements.previewTtsProfile, activeProfiles, "Select TTS profile");
  const selected = selectedTtsProfile();
  if (!selected && activeProfiles[0]) {
    elements.previewTtsProfile.value = activeProfiles[0].key;
  }
  if (elements.previewTtsProfile) {
    elements.previewTtsProfile.disabled = activeProfiles.length === 0;
  }
}

function speechTestReadiness() {
  const service = selectedTtsService();
  const profile = selectedTtsProfile();
  const target = selectedSpeechTarget();
  if (!service) {
    const unavailableService = state.ttsServices.find((candidate) => !candidate.available);
    if (unavailableService) {
      return { message: unavailableService.unavailableMessage || "No TTS service is available in this browser.", ok: false };
    }
    return { message: "No TTS service is selected.", ok: false };
  }
  if (!service.available) {
    return { message: service.unavailableMessage || "Selected TTS service is unavailable.", ok: false };
  }
  if (!target) {
    return { message: "Select a message row or segment row before testing speech.", ok: false };
  }
  if (!profile) {
    return { message: "Select an active TTS profile before testing speech.", ok: false };
  }
  if (!target.emotionProfile) {
    return { message: "Selected item needs an Emotion before testing speech.", ok: false };
  }
  const emotionSetting = selectedEmotionSettingForProfile(profile, target.emotionProfile);
  if (!emotionSetting.ok) {
    return { message: emotionSetting.message, ok: false };
  }
  if (!String(target.text || "").trim()) {
    return { message: "Selected item needs message text before testing speech.", ok: false };
  }
  return { message: `Ready to test ${target.label}.`, ok: true };
}

function renderSpeechTestControls() {
  renderTtsServiceOptions();
  renderTtsProfileOptions();
  const target = selectedSpeechTarget();
  const readiness = speechTestReadiness();
  setText(elements.speechTestTarget, target?.label || "None");
  setText(elements.previewStatus, readiness.message);
  if (elements.testSpeech) {
    elements.testSpeech.disabled = !readiness.ok;
  }
  if (elements.stopSpeech) {
    elements.stopSpeech.disabled = !selectedTtsService()?.available;
  }
}

function createMessageEditRows(message = null) {
  const key = message?.key || NEW_ROW_KEY;
  const row = document.createElement("tr");
  row.dataset.messagesRowEditor = key;

  const nameCell = document.createElement("td");
  nameCell.append(createInput(message?.name || "", "messageName"));

  const typeCell = createCell(message?.categoryName || "Dialog");

  const statusCell = document.createElement("td");
  statusCell.append(createCheckbox(message?.active !== false, "messageActive"));

  const partCell = createCell(message ? String(messageSegments(message.key).length) : "0");

  const ttsCell = document.createElement("td");
  ttsCell.append(createTtsProfileSelect(
    message ? selectedTtsProfileForMessage(message.key).key : defaultTtsProfileKey(),
    "messageDefaultTtsProfile",
    key,
  ));

  const actions = document.createElement("td");
  actions.append(createActionGroup(
    createButton("Save", "messagesCommit", key),
    createButton("Cancel", "messagesCancel", key),
  ));

  row.append(nameCell, typeCell, statusCell, partCell, ttsCell, actions);

  const detailRow = document.createElement("tr");
  detailRow.dataset.messagesRowEditorDetails = key;
  const detailCell = document.createElement("td");
  detailCell.colSpan = 6;
  const stack = document.createElement("div");
  stack.className = "content-stack";
  stack.append(
    createField("Primary Emotion", createSelect(message?.emotionProfileKey || "", "messageEmotion", selectOptionsWithCurrent(message?.emotionProfileKey || ""), "Select emotion")),
    createField("Message Text", createTextarea(message?.messageText || "", "messageText", 6)),
    createField("Notes", createTextarea(message?.notes || "", "messageNotes", 3)),
  );
  detailCell.append(stack);
  detailRow.append(detailCell);

  return [row, detailRow];
}

function createMessageSegmentTable() {
  const wrapper = document.createElement("div");
  wrapper.className = "content-stack";

  const context = document.createElement("div");
  context.className = "kicker";
  context.textContent = "Message / Message Parts";
  const heading = document.createElement("h3");
  heading.textContent = "Message Parts";
  wrapper.append(context, heading);

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "table-wrapper";
  const table = document.createElement("table");
  table.className = "data-table";
  table.setAttribute("aria-label", "Message parts");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Text", "Emotion", "TTS Profile", "Status", "Actions"].forEach((label) => {
    const header = document.createElement("th");
    header.scope = "col";
    header.textContent = label;
    headerRow.append(header);
  });
  thead.append(headerRow);
  const tbody = document.createElement("tbody");
  tbody.dataset.messagesSegments = "";

  const segments = selectedMessageSegments();
  if (!segments.length && state.editingSegmentKey !== NEW_ROW_KEY) {
    tbody.append(tableMessage(5, "No message parts saved for this message."));
  }

  segments.forEach((segment, index) => {
    if (state.editingSegmentKey === segment.key) {
      tbody.append(createSegmentEditRow(segment));
      return;
    }
    const row = document.createElement("tr");
    row.dataset.messagesSegmentRow = segment.key;
    const actions = document.createElement("td");
    const moveUp = createButton("Move Up", "messagesSegmentMoveUp", segment.key);
    const moveDown = createButton("Move Down", "messagesSegmentMoveDown", segment.key);
    moveUp.disabled = index === 0;
    moveDown.disabled = index === segments.length - 1;
    actions.append(createActionGroup(
      createButton("Play Part", "messagesSegmentPlay", segment.key),
      createButton("Edit Part", "messagesSegmentEdit", segment.key),
      moveUp,
      moveDown,
      segment.active ? createButton("Disable", "messagesSegmentDisable", segment.key) : null,
    ));
    const ttsCell = document.createElement("td");
    ttsCell.append(createTtsProfileSelect(
      selectedTtsProfileForSegment(segment.key, segment.messageKey).key,
      "segmentTtsProfile",
      segment.key,
    ));
    row.append(
      createCell(segment.segmentText),
      createCell(segment.emotionProfileName || "Unknown"),
      ttsCell,
      createCell(statusForActive(segment.active)),
      actions,
    );
    tbody.append(row);
  });

  if (state.editingSegmentKey === NEW_ROW_KEY) {
    tbody.append(createSegmentEditRow(null));
  } else {
    tbody.append(createSegmentAddControlRow());
  }

  table.append(thead, tbody);
  tableWrapper.append(table);
  wrapper.append(tableWrapper);
  return wrapper;
}

function createSegmentEditRow(segment = null) {
  const key = segment?.key || NEW_ROW_KEY;
  const row = document.createElement("tr");
  row.dataset.messagesSegmentEditor = key;
  row.dataset.messagesSegmentOrder = String(segment?.displayOrder || nextSegmentOrder());

  const textCell = document.createElement("td");
  textCell.append(createTextarea(segment?.segmentText || "", "segmentText", 3));

  const emotionCell = document.createElement("td");
  emotionCell.append(createSelect(segment?.emotionProfileKey || "", "segmentEmotion", selectOptionsWithCurrent(segment?.emotionProfileKey || ""), "Select emotion"));

  const ttsCell = document.createElement("td");
  ttsCell.append(createTtsProfileSelect(
    segment ? selectedTtsProfileForSegment(segment.key, segment.messageKey).key : selectedTtsProfileForMessage(state.selectedMessageKey).key,
    "segmentTtsProfile",
    key,
  ));

  const statusCell = document.createElement("td");
  statusCell.append(createCheckbox(segment?.active !== false, "segmentActive"));

  const actions = document.createElement("td");
  actions.append(createActionGroup(
    createButton("Save", "messagesSegmentCommit", key),
    createButton("Cancel", "messagesSegmentCancel", key),
  ));

  row.append(textCell, emotionCell, ttsCell, statusCell, actions);
  return row;
}

function appendSelectedSegmentsHost(messageKey) {
  if (state.selectedMessageKey !== messageKey) {
    return;
  }
  const hostRow = document.createElement("tr");
  hostRow.dataset.messagesSegmentHost = messageKey;
  const cell = document.createElement("td");
  cell.colSpan = 6;
  cell.append(createMessageSegmentTable());
  hostRow.append(cell);
  elements.table.append(hostRow);
}

function renderMessageRows() {
  if (!elements.table) {
    return;
  }
  elements.table.replaceChildren();
  if (!state.messages.length && state.editingMessageKey !== NEW_ROW_KEY) {
    elements.table.append(tableMessage(6, "No messages saved yet. Add a message such as Bat Encounter."));
    elements.table.append(createMessageAddControlRow());
    return;
  }

  state.messages.forEach((message) => {
    if (state.editingMessageKey === message.key) {
      createMessageEditRows(message).forEach((row) => elements.table.append(row));
      appendSelectedSegmentsHost(message.key);
      return;
    }

    const row = document.createElement("tr");
    row.dataset.messagesRow = message.key;
    const nameCell = document.createElement("td");
    const isExpanded = state.selectedMessageKey === message.key;
    nameCell.dataset.messagesNameCell = message.key;
    nameCell.tabIndex = 0;
    nameCell.setAttribute("role", "button");
    nameCell.setAttribute("aria-expanded", String(isExpanded));
    nameCell.textContent = `${isExpanded ? "v" : ">"} ${message.name}`;
    const ttsCell = document.createElement("td");
    ttsCell.append(createTtsProfileSelect(
      selectedTtsProfileForMessage(message.key).key,
      "messageDefaultTtsProfile",
      message.key,
    ));
    const actions = document.createElement("td");
    actions.append(createActionGroup(
      createButton("Play Message", "messagesPlay", message.key),
      createButton("Edit Message", "messagesEdit", message.key),
      message.active ? createButton("Disable", "messagesDisable", message.key) : null,
    ));
    row.append(
      nameCell,
      createCell(message.categoryName || "Dialog"),
      createCell(statusForActive(message.active)),
      createCell(String(messageSegments(message.key).length)),
      ttsCell,
      actions,
    );
    elements.table.append(row);
    appendSelectedSegmentsHost(message.key);
  });

  if (state.editingMessageKey === NEW_ROW_KEY) {
    createMessageEditRows(null).forEach((row) => elements.table.append(row));
  } else {
    elements.table.append(createMessageAddControlRow());
  }
}

function render(persistence = {}) {
  renderMessageRows();
  renderSelectedMessage();
  renderCounts();
  renderPersistence(persistence);
  renderSpeechTestControls();
}

function editorValue(root, selector) {
  return root?.querySelector(selector)?.value || "";
}

function editorChecked(root, selector) {
  return root?.querySelector(selector)?.checked !== false;
}

function messageValues(key) {
  const root = elements.table?.querySelector(`[data-messages-row-editor="${key}"]`);
  const details = elements.table?.querySelector(`[data-messages-row-editor-details="${key}"]`);
  return {
    active: editorChecked(root, "[data-message-active]"),
    emotionProfileKey: editorValue(details, "[data-message-emotion]"),
    messageText: editorValue(details, "[data-message-text]"),
    name: editorValue(root, "[data-message-name]"),
    notes: editorValue(details, "[data-message-notes]"),
  };
}

function validateMessage(values) {
  const errors = [];
  if (!values.name.trim()) {
    errors.push("Message Name is required.");
  }
  if (!values.emotionProfileKey) {
    errors.push("Emotion is required.");
  }
  if (!values.messageText.trim()) {
    errors.push("Message Text is required.");
  }
  return errors;
}

function segmentValues(key) {
  const root = elements.table?.querySelector(`[data-messages-segment-editor="${key}"]`);
  return {
    active: editorChecked(root, "[data-segment-active]"),
    displayOrder: editorValue(root, "[data-segment-order]") || root?.dataset.messagesSegmentOrder || String(nextSegmentOrder()),
    emotionProfileKey: editorValue(root, "[data-segment-emotion]"),
    messageKey: state.selectedMessageKey,
    segmentText: editorValue(root, "[data-segment-text]"),
  };
}

function validateSegment(values) {
  const errors = [];
  if (!state.selectedMessageKey) {
    errors.push("Select a message before adding parts.");
  }
  if (!values.segmentText.trim()) {
    errors.push("Part Text is required.");
  }
  if (!values.emotionProfileKey) {
    errors.push("Emotion is required.");
  }
  if (String(values.displayOrder).trim() === "") {
    errors.push("Display Order is required.");
  } else {
    const displayOrder = Number(values.displayOrder);
    if (!Number.isInteger(displayOrder) || displayOrder < 1) {
      errors.push("Display Order must be a whole number of 1 or greater.");
    }
  }
  return errors;
}

async function loadAll() {
  const emotionPayload = listEmotionProfiles();
  const ttsPayload = listTtsProfiles();
  const messagesPayload = listMessages();
  const segmentsPayload = listMessageSegments();
  state.emotionProfiles = emotionPayload.emotionProfiles || [];
  state.ttsProfiles = ttsPayload.ttsProfiles || [];
  state.messages = messagesPayload.messages || [];
  state.segments = segmentsPayload.segments || [];
  if (state.selectedMessageKey && !state.messages.some((message) => message.key === state.selectedMessageKey)) {
    state.selectedMessageKey = "";
  }
  if (state.selectedSegmentKey && !state.segments.some((segment) => segment.key === state.selectedSegmentKey && segment.messageKey === state.selectedMessageKey)) {
    state.selectedSegmentKey = "";
  }
  render(messagesPayload.persistence || emotionPayload.persistence || ttsPayload.persistence || segmentsPayload.persistence);
  setText(elements.log, "Message Studio loaded from the Local API.");
}

async function reloadAfterChange(messageKey = state.selectedMessageKey, segmentKey = state.selectedSegmentKey) {
  await loadAll();
  state.selectedMessageKey = messageKey && state.messages.some((message) => message.key === messageKey) ? messageKey : "";
  state.selectedSegmentKey = segmentKey && state.segments.some((segment) => segment.key === segmentKey && segment.messageKey === state.selectedMessageKey) ? segmentKey : "";
  render();
}

async function commitMessage(key) {
  const values = messageValues(key);
  const errors = validateMessage(values);
  if (errors.length) {
    showValidation(errors);
    setText(elements.log, "Message row update blocked by validation.");
    return;
  }
  clearValidation();
  try {
    const result = key === NEW_ROW_KEY
      ? createMessage(values)
      : updateMessage(key, values);
    state.editingMessageKey = "";
    if (key === NEW_ROW_KEY) {
      state.selectedMessageKey = "";
      state.selectedSegmentKey = "";
    } else {
      state.selectedMessageKey = result.message.key;
    }
    await reloadAfterChange(state.selectedMessageKey, state.selectedSegmentKey);
    setText(elements.log, `Updated row ${result.message.name}.`);
  } catch (error) {
    showValidation([error instanceof Error ? error.message : String(error || "Message row update failed.")]);
    setText(elements.log, "Message row update failed.");
  }
}

async function commitSegment(key) {
  const values = segmentValues(key);
  const errors = validateSegment(values);
  if (errors.length) {
    showValidation(errors);
    setText(elements.log, "Segment row update blocked by validation.");
    return;
  }
  clearValidation();
  try {
    const result = key === NEW_ROW_KEY
      ? createMessageSegment(values)
      : updateMessageSegment(key, values);
    state.editingSegmentKey = "";
    state.selectedSegmentKey = result.segment.key;
    await reloadAfterChange(state.selectedMessageKey, result.segment.key);
    setText(elements.log, `Updated message part ${result.segment.displayOrder}.`);
  } catch (error) {
    showValidation([error instanceof Error ? error.message : String(error || "Segment row update failed.")]);
    setText(elements.log, "Message part update failed.");
  }
}

async function disableMessage(key) {
  const message = state.messages.find((candidate) => candidate.key === key);
  if (!message) {
    return;
  }
  try {
    const result = updateMessage(key, {
      active: false,
      emotionProfileKey: message.emotionProfileKey,
      messageText: message.messageText,
      name: message.name,
      notes: message.notes,
    });
    state.selectedMessageKey = result.message.key;
    await reloadAfterChange(result.message.key);
    setText(elements.log, `Disabled row ${result.message.name}.`);
  } catch (error) {
    showValidation([error instanceof Error ? error.message : String(error || "Message row status update failed.")]);
    setText(elements.log, "Message row status update failed.");
  }
}

async function disableSegment(key) {
  const segment = state.segments.find((candidate) => candidate.key === key);
  if (!segment) {
    return;
  }
  try {
    const result = updateMessageSegment(key, {
      active: false,
      displayOrder: segment.displayOrder,
      emotionProfileKey: segment.emotionProfileKey,
      messageKey: segment.messageKey,
      segmentText: segment.segmentText,
    });
    state.selectedSegmentKey = result.segment.key;
    await reloadAfterChange(segment.messageKey, result.segment.key);
    setText(elements.log, `Disabled message part ${result.segment.displayOrder}.`);
  } catch (error) {
    showValidation([error instanceof Error ? error.message : String(error || "Segment status update failed.")]);
    setText(elements.log, "Message part status update failed.");
  }
}

function testSelectedSpeech() {
  const readiness = speechTestReadiness();
  if (!readiness.ok) {
    setText(elements.previewStatus, readiness.message);
    setText(elements.log, readiness.message);
    return;
  }
  const service = selectedTtsService();
  const target = selectedSpeechTarget();
  const result = speakTarget(service, target, target.profile || selectedTtsProfile());
  if (!result.ok) {
    setText(elements.previewStatus, result.message || "Speech test failed.");
    setText(elements.log, result.message || "Speech test failed.");
    return;
  }
  const message = `Speech test started for ${target.label} using ${service.name}.`;
  setText(elements.previewStatus, message);
  setText(elements.log, message);
}

function visiblePlaybackError(message) {
  const safeMessage = message || "Message Studio playback failed. Check the selected message, part, and TTS profile.";
  showValidation([safeMessage]);
  setText(elements.previewStatus, safeMessage);
  setText(elements.log, safeMessage);
  return { message: safeMessage, ok: false };
}

function playbackService() {
  return selectedTtsService() || state.ttsServices.find((service) => service.available) || null;
}

function speakTarget(service, target, profile) {
  if (!service) {
    return visiblePlaybackError("Audio engine is unavailable. Use a browser with SpeechSynthesis support and reload Message Studio.");
  }
  if (!service.available) {
    return visiblePlaybackError(service.unavailableMessage || "Audio engine is unavailable for Message Studio playback.");
  }
  if (!target) {
    return visiblePlaybackError("Select a message or message part before playback.");
  }
  if (!profile) {
    return visiblePlaybackError("Select a TTS profile before playback.");
  }
  if (!target.emotionProfile) {
    return visiblePlaybackError("Selected message or part needs an Emotion before playback.");
  }
  const emotionSetting = selectedEmotionSettingForProfile(profile, target.emotionProfile);
  if (!emotionSetting.ok) {
    return visiblePlaybackError(emotionSetting.message);
  }
  if (!String(target.text || "").trim()) {
    return visiblePlaybackError("Selected message or part needs text before playback.");
  }
  return ttsServiceRegistry.speak(service.key, {
    language: profile.language,
    pitch: emotionSetting.setting.pitch ?? profile.pitch ?? 1,
    rate: emotionSetting.setting.rate ?? profile.rate ?? 1,
    speechItemId: target.id,
    speechItemName: target.name,
    ssmlLikePreset: emotionSetting.setting.ssmlLikePreset || "normal",
    text: target.text,
    voice: profile.voiceName,
    volume: emotionSetting.setting.volume ?? profile.volume ?? 1,
  });
}

function segmentPlaybackTarget(segment) {
  if (!segment) {
    return null;
  }
  return {
    emotionProfile: emotionProfileByKey(segment.emotionProfileKey),
    id: segment.key,
    label: `Part ${segment.displayOrder}`,
    name: `${segment.messageName || "Message"} part ${segment.displayOrder}`,
    profile: selectedTtsProfileForSegment(segment.key, segment.messageKey),
    text: segment.segmentText,
    type: "part",
  };
}

function playPart(key) {
  const segment = state.segments.find((candidate) => candidate.key === key);
  const target = segmentPlaybackTarget(segment);
  const result = speakTarget(playbackService(), target, target?.profile);
  if (!result.ok) {
    return;
  }
  clearValidation();
  const message = `Play Part queued ${target.label} using ${target.profile.name}.`;
  setText(elements.previewStatus, message);
  setText(elements.log, message);
}

function playMessage(key) {
  const messageRecord = state.messages.find((candidate) => candidate.key === key);
  if (!messageRecord) {
    visiblePlaybackError("Choose an existing message before playback.");
    return;
  }
  const parts = messageSegments(messageRecord.key).filter((segment) => segment.active);
  if (!parts.length) {
    visiblePlaybackError("Add at least one active Message Part before playing this message.");
    return;
  }
  const service = playbackService();
  for (const part of parts) {
    const target = segmentPlaybackTarget(part);
    const result = speakTarget(service, target, target?.profile || selectedTtsProfileForMessage(messageRecord.key));
    if (!result.ok) {
      return;
    }
  }
  clearValidation();
  const message = `Play Message queued ${parts.length} parts for ${messageRecord.name}.`;
  setText(elements.previewStatus, message);
  setText(elements.log, message);
}

function stopSpeech() {
  const result = ttsServiceRegistry.stop();
  if (!result.ok) {
    visiblePlaybackError(result.message || "Message Studio playback could not be stopped.");
    return;
  }
  clearValidation();
  const message = `Message Studio playback stopped. Cleared ${result.stoppedCount} queued item${result.stoppedCount === 1 ? "" : "s"}.`;
  setText(elements.previewStatus, message);
  setText(elements.log, message);
}

async function moveSegment(key, direction) {
  const segments = selectedMessageSegments();
  const currentIndex = segments.findIndex((segment) => segment.key === key);
  const current = segments[currentIndex];
  const target = segments[currentIndex + direction];
  if (!current || !target) {
    return;
  }
  try {
    updateMessageSegment(current.key, {
      active: current.active,
      displayOrder: target.displayOrder,
      emotionProfileKey: current.emotionProfileKey,
      messageKey: current.messageKey,
      segmentText: current.segmentText,
    });
    updateMessageSegment(target.key, {
      active: target.active,
      displayOrder: current.displayOrder,
      emotionProfileKey: target.emotionProfileKey,
      messageKey: target.messageKey,
      segmentText: target.segmentText,
    });
    await reloadAfterChange(state.selectedMessageKey, current.key);
    setText(elements.log, "Message part order updated.");
  } catch (error) {
    showValidation([error instanceof Error ? error.message : String(error || "Segment reorder failed.")]);
    setText(elements.log, "Message part reorder failed.");
  }
}

elements.previewTtsProfile?.addEventListener("change", () => {
  renderSpeechTestControls();
});

elements.ttsService?.addEventListener("change", () => {
  renderSpeechTestControls();
});

elements.testSpeech?.addEventListener("click", () => {
  testSelectedSpeech();
});

elements.stopSpeech?.addEventListener("click", () => {
  stopSpeech();
});

ttsServiceRegistry.onServicesChanged(() => {
  renderSpeechTestControls();
});

elements.table?.addEventListener("change", (event) => {
  const messageSelect = event.target.closest("[data-message-default-tts-profile]");
  const segmentSelect = event.target.closest("[data-segment-tts-profile]");
  if (messageSelect) {
    const key = messageSelect.dataset.messagesTtsIdentity || state.selectedMessageKey;
    if (key && key !== NEW_ROW_KEY) {
      state.messageTtsProfileKeys.set(key, messageSelect.value || defaultTtsProfileKey());
    }
    renderSpeechTestControls();
    setText(elements.log, "Default TTS profile selected for this message playback session.");
  }
  if (segmentSelect) {
    const key = segmentSelect.dataset.messagesTtsIdentity || state.selectedSegmentKey;
    if (key && key !== NEW_ROW_KEY) {
      state.segmentTtsProfileKeys.set(key, segmentSelect.value || defaultTtsProfileKey());
    }
    renderSpeechTestControls();
    setText(elements.log, "TTS profile selected for this part playback session.");
  }
});

elements.table?.addEventListener("click", async (event) => {
  if (event.target.closest("[data-message-default-tts-profile], [data-segment-tts-profile]")) {
    return;
  }
  const row = event.target.closest("[data-messages-row]");
  const messageAddButton = event.target.closest("[data-messages-add-row]");
  const messageNameCell = event.target.closest("[data-messages-name-cell]");
  const segmentRow = event.target.closest("[data-messages-segment-row]");
  const playButton = event.target.closest("[data-messages-play]");
  const editButton = event.target.closest("[data-messages-edit]");
  const commitButton = event.target.closest("[data-messages-commit]");
  const cancelButton = event.target.closest("[data-messages-cancel]");
  const disableButton = event.target.closest("[data-messages-disable]");
  const segmentAddButton = event.target.closest("[data-messages-segment-add-row]");
  const segmentPlayButton = event.target.closest("[data-messages-segment-play]");
  const segmentEditButton = event.target.closest("[data-messages-segment-edit]");
  const segmentCommitButton = event.target.closest("[data-messages-segment-commit]");
  const segmentCancelButton = event.target.closest("[data-messages-segment-cancel]");
  const segmentDisableButton = event.target.closest("[data-messages-segment-disable]");
  const moveUpButton = event.target.closest("[data-messages-segment-move-up]");
  const moveDownButton = event.target.closest("[data-messages-segment-move-down]");

  if (messageAddButton) {
    clearValidation();
    state.editingMessageKey = NEW_ROW_KEY;
    state.editingSegmentKey = "";
    render();
    setText(elements.log, "Ready to add a message row.");
    return;
  }
  if (playButton) {
    state.selectedMessageKey = playButton.dataset.messagesPlay;
    state.selectedSegmentKey = "";
    state.editingSegmentKey = "";
    render();
    playMessage(playButton.dataset.messagesPlay);
    return;
  }
  if (editButton) {
    clearValidation();
    state.editingMessageKey = editButton.dataset.messagesEdit;
    state.selectedMessageKey = editButton.dataset.messagesEdit;
    state.selectedSegmentKey = "";
    render();
    setText(elements.log, "Message row opened inline.");
    return;
  }
  if (commitButton) {
    await commitMessage(commitButton.dataset.messagesCommit);
    return;
  }
  if (cancelButton) {
    state.editingMessageKey = "";
    clearValidation();
    render();
    setText(elements.log, "Message row edit canceled.");
    return;
  }
  if (disableButton) {
    await disableMessage(disableButton.dataset.messagesDisable);
    return;
  }
  if (segmentAddButton) {
    clearValidation();
    state.editingSegmentKey = NEW_ROW_KEY;
    render();
    setText(elements.log, "Ready to add a message part.");
    return;
  }
  if (segmentPlayButton) {
    const segment = state.segments.find((candidate) => candidate.key === segmentPlayButton.dataset.messagesSegmentPlay);
    if (segment) {
      state.selectedMessageKey = segment.messageKey;
      state.selectedSegmentKey = segment.key;
      render();
    }
    playPart(segmentPlayButton.dataset.messagesSegmentPlay);
    return;
  }
  if (segmentEditButton) {
    clearValidation();
    state.editingSegmentKey = segmentEditButton.dataset.messagesSegmentEdit;
    state.selectedSegmentKey = segmentEditButton.dataset.messagesSegmentEdit;
    render();
    setText(elements.log, "Message part opened inline.");
    return;
  }
  if (segmentCommitButton) {
    await commitSegment(segmentCommitButton.dataset.messagesSegmentCommit);
    return;
  }
  if (segmentCancelButton) {
    state.editingSegmentKey = "";
    clearValidation();
    render();
    setText(elements.log, "Message part edit canceled.");
    return;
  }
  if (segmentDisableButton) {
    await disableSegment(segmentDisableButton.dataset.messagesSegmentDisable);
    return;
  }
  if (moveUpButton || moveDownButton) {
    const key = moveUpButton?.dataset.messagesSegmentMoveUp || moveDownButton?.dataset.messagesSegmentMoveDown;
    state.selectedSegmentKey = key;
    await moveSegment(key, moveUpButton ? -1 : 1);
    return;
  }
  if (segmentRow) {
    state.selectedSegmentKey = segmentRow.dataset.messagesSegmentRow;
    render();
    return;
  }
  if ((messageNameCell || row) && row) {
    state.selectedMessageKey = state.selectedMessageKey === row.dataset.messagesRow ? "" : row.dataset.messagesRow;
    state.selectedSegmentKey = "";
    state.editingSegmentKey = "";
    render();
  }
});

elements.table?.addEventListener("keydown", (event) => {
  const messageNameCell = event.target.closest("[data-messages-name-cell]");
  if (!messageNameCell || !["Enter", " "].includes(event.key)) {
    return;
  }
  event.preventDefault();
  messageNameCell.click();
});

try {
  await loadAll();
} catch (error) {
  setText(elements.log, error instanceof Error ? error.message : String(error || "Messages failed to load."));
  showValidation(["Message Studio could not load from the Local API. Start the Local API server and reload this tool."]);
}
