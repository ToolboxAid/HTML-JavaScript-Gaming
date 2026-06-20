import {
  createMessageSegment,
  createEmotionProfile,
  createMessage,
  createMessageCategory,
  createTtsProfile,
  listEmotionProfiles,
  listMessageCategories,
  listMessages,
  listMessageSegments,
  listTtsProfiles,
  updateEmotionProfile,
  updateMessage,
  updateMessageCategory,
  updateMessageSegment,
  updateTtsProfile,
} from "./messages-api-client.js";

const elements = {
  active: document.querySelector("[data-messages-active]"),
  category: document.querySelector("[data-messages-category]"),
  categoryActive: document.querySelector("[data-messages-category-active]"),
  categoryCancel: document.querySelector("[data-messages-category-cancel]"),
  categoryCount: document.querySelector("[data-messages-category-count]"),
  categoryForm: document.querySelector("[data-messages-category-form]"),
  categoryKey: document.querySelector("[data-messages-category-key]"),
  categoryName: document.querySelector("[data-messages-category-name]"),
  categoryRows: document.querySelector("[data-messages-categories]"),
  count: document.querySelector("[data-messages-count]"),
  editorHeading: document.querySelector("[data-messages-editor-heading]"),
  emotionActive: document.querySelector("[data-messages-emotion-active]"),
  emotionCancel: document.querySelector("[data-messages-emotion-cancel]"),
  emotionCount: document.querySelector("[data-messages-emotion-count]"),
  emotionDescription: document.querySelector("[data-messages-emotion-description]"),
  emotionForm: document.querySelector("[data-messages-emotion-form]"),
  emotionKey: document.querySelector("[data-messages-emotion-key]"),
  emotionName: document.querySelector("[data-messages-emotion-name]"),
  emotionPauseAfter: document.querySelector("[data-messages-emotion-pause-after]"),
  emotionPauseBefore: document.querySelector("[data-messages-emotion-pause-before]"),
  emotionPitch: document.querySelector("[data-messages-emotion-pitch]"),
  emotionProfile: document.querySelector("[data-messages-emotion-profile]"),
  emotionRate: document.querySelector("[data-messages-emotion-rate]"),
  emotionRows: document.querySelector("[data-messages-emotions]"),
  emotionVolume: document.querySelector("[data-messages-emotion-volume]"),
  form: document.querySelector("[data-messages-form]"),
  key: document.querySelector("[data-messages-message-key]"),
  log: document.querySelector("[data-messages-log]"),
  name: document.querySelector("[data-messages-name]"),
  newMessage: document.querySelector("[data-messages-new]"),
  notes: document.querySelector("[data-messages-notes]"),
  persistenceEngine: document.querySelector("[data-messages-persistence-engine]"),
  persistenceOwner: document.querySelector("[data-messages-persistence-owner]"),
  persistenceSource: document.querySelector("[data-messages-persistence-source]"),
  selectedCategory: document.querySelector("[data-messages-selected-category]"),
  selectedEmotion: document.querySelector("[data-messages-selected-emotion]"),
  selectedName: document.querySelector("[data-messages-selected-name]"),
  selectedStatus: document.querySelector("[data-messages-selected-status]"),
  selectedText: document.querySelector("[data-messages-selected-text]"),
  segmentActive: document.querySelector("[data-messages-segment-active]"),
  segmentContext: document.querySelector("[data-messages-segment-context]"),
  segmentEmotionProfile: document.querySelector("[data-messages-segment-emotion-profile]"),
  segmentForm: document.querySelector("[data-messages-segment-form]"),
  segmentKey: document.querySelector("[data-messages-segment-key]"),
  segmentNew: document.querySelector("[data-messages-segment-new]"),
  segmentOrder: document.querySelector("[data-messages-segment-order]"),
  segmentReload: document.querySelector("[data-messages-segment-reload]"),
  segmentRows: document.querySelector("[data-messages-segments]"),
  segmentText: document.querySelector("[data-messages-segment-text]"),
  segmentValidationCard: document.querySelector("[data-messages-segment-validation-card]"),
  segmentValidationErrors: document.querySelector("[data-messages-segment-validation-errors]"),
  table: document.querySelector("[data-messages-table]"),
  text: document.querySelector("[data-messages-text]"),
  ttsActive: document.querySelector("[data-messages-tts-active]"),
  ttsCancel: document.querySelector("[data-messages-tts-cancel]"),
  ttsCount: document.querySelector("[data-messages-tts-count]"),
  ttsDescription: document.querySelector("[data-messages-tts-description]"),
  ttsForm: document.querySelector("[data-messages-tts-form]"),
  ttsKey: document.querySelector("[data-messages-tts-key]"),
  ttsLanguage: document.querySelector("[data-messages-tts-language]"),
  ttsName: document.querySelector("[data-messages-tts-name]"),
  ttsPitch: document.querySelector("[data-messages-tts-pitch]"),
  ttsProviderKey: document.querySelector("[data-messages-tts-provider-key]"),
  ttsRate: document.querySelector("[data-messages-tts-rate]"),
  ttsRows: document.querySelector("[data-messages-tts-profiles]"),
  ttsVoiceName: document.querySelector("[data-messages-tts-voice-name]"),
  ttsVolume: document.querySelector("[data-messages-tts-volume]"),
  validationCard: document.querySelector("[data-messages-validation-card]"),
  validationErrors: document.querySelector("[data-messages-validation-errors]"),
};

const state = {
  categories: [],
  emotionProfiles: [],
  messages: [],
  segments: [],
  selectedMessageKey: "",
  ttsProfiles: [],
};

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setValue(element, value) {
  if (element) {
    element.value = value;
  }
}

function setChecked(element, value) {
  if (element) {
    element.checked = value !== false;
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

function clearListValidation(list, card) {
  if (list) {
    list.replaceChildren();
  }
  if (card) {
    card.hidden = true;
  }
}

function showListValidation(errors, list, card) {
  if (!list || !card) {
    return;
  }
  list.replaceChildren();
  errors.forEach((error) => {
    const item = document.createElement("li");
    item.textContent = error;
    list.append(item);
  });
  card.hidden = errors.length === 0;
}

function clearValidation() {
  clearListValidation(elements.validationErrors, elements.validationCard);
}

function showValidation(errors) {
  showListValidation(errors, elements.validationErrors, elements.validationCard);
}

function clearSegmentValidation() {
  clearListValidation(elements.segmentValidationErrors, elements.segmentValidationCard);
}

function showSegmentValidation(errors) {
  showListValidation(errors, elements.segmentValidationErrors, elements.segmentValidationCard);
}

function activeCategories() {
  return state.categories.filter((category) => category.active);
}

function activeEmotionProfiles() {
  return state.emotionProfiles.filter((profile) => profile.active);
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
    select.append(option);
  });
  select.value = options.some((optionValue) => optionValue.key === currentValue) ? currentValue : "";
}

function renderCategoryRows() {
  if (!elements.categoryRows) {
    return;
  }
  elements.categoryRows.replaceChildren();
  state.categories.forEach((category) => {
    const row = document.createElement("tr");
    row.dataset.messagesCategoryRow = category.key;
    const actions = document.createElement("td");
    const group = document.createElement("div");
    group.className = "action-group action-group--tight";
    group.append(createButton("Edit", "messagesCategoryEdit", category.key));
    actions.append(group);
    row.append(
      createCell(category.name),
      createCell(statusForActive(category.active)),
      actions,
    );
    elements.categoryRows.append(row);
  });
}

function renderEmotionRows() {
  if (!elements.emotionRows) {
    return;
  }
  elements.emotionRows.replaceChildren();
  state.emotionProfiles.forEach((profile) => {
    const row = document.createElement("tr");
    row.dataset.messagesEmotionRow = profile.key;
    const actions = document.createElement("td");
    const group = document.createElement("div");
    group.className = "action-group action-group--tight";
    group.append(createButton("Edit", "messagesEmotionEdit", profile.key));
    actions.append(group);
    row.append(
      createCell(profile.name),
      createCell(String(profile.usageCount || 0)),
      createCell(statusForActive(profile.active)),
      actions,
    );
    elements.emotionRows.append(row);
  });
}

function renderTtsRows() {
  if (!elements.ttsRows) {
    return;
  }
  elements.ttsRows.replaceChildren();
  state.ttsProfiles.forEach((profile) => {
    const row = document.createElement("tr");
    row.dataset.messagesTtsRow = profile.key;
    const actions = document.createElement("td");
    const group = document.createElement("div");
    group.className = "action-group action-group--tight";
    group.append(createButton("Edit", "messagesTtsEdit", profile.key));
    actions.append(group);
    row.append(
      createCell(profile.name),
      createCell(profile.providerKey),
      createCell(profile.language),
      createCell(statusForActive(profile.active)),
      actions,
    );
    elements.ttsRows.append(row);
  });
}

function renderMessageRows() {
  if (!elements.table) {
    return;
  }
  elements.table.replaceChildren();
  if (!state.messages.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No messages saved yet.";
    row.append(cell);
    elements.table.append(row);
    return;
  }
  state.messages.forEach((message) => {
    const row = document.createElement("tr");
    row.dataset.messagesRow = message.key;
    const actions = document.createElement("td");
    const group = document.createElement("div");
    group.className = "action-group action-group--tight";
    group.append(createButton("Edit", "messagesEdit", message.key));
    actions.append(group);
    row.append(
      createCell(message.name),
      createCell(message.categoryName || "Unknown"),
      createCell(message.emotionProfileName || "Unknown"),
      createCell(statusForActive(message.active)),
      actions,
    );
    elements.table.append(row);
  });
}

function selectedMessageSegments() {
  return state.segments
    .filter((segment) => segment.messageKey === state.selectedMessageKey)
    .sort((left, right) => left.displayOrder - right.displayOrder || left.createdAt.localeCompare(right.createdAt) || left.key.localeCompare(right.key));
}

function renderSegmentRows() {
  if (!elements.segmentRows) {
    return;
  }
  elements.segmentRows.replaceChildren();
  if (!state.selectedMessageKey) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "Save or select a message before adding segments.";
    row.append(cell);
    elements.segmentRows.append(row);
    return;
  }
  const segments = selectedMessageSegments();
  if (!segments.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No segments saved for this message.";
    row.append(cell);
    elements.segmentRows.append(row);
    return;
  }
  segments.forEach((segment, index) => {
    const row = document.createElement("tr");
    row.dataset.messagesSegmentRow = segment.key;
    const actions = document.createElement("td");
    const group = document.createElement("div");
    group.className = "action-group action-group--tight";
    const moveUp = createButton("Move Up", "messagesSegmentMoveUp", segment.key);
    const moveDown = createButton("Move Down", "messagesSegmentMoveDown", segment.key);
    moveUp.disabled = index === 0;
    moveDown.disabled = index === segments.length - 1;
    group.append(
      createButton("Edit", "messagesSegmentEdit", segment.key),
      moveUp,
      moveDown,
      createButton(segment.active ? "Disable" : "Enable", "messagesSegmentToggle", segment.key),
    );
    actions.append(group);
    row.append(
      createCell(String(segment.displayOrder)),
      createCell(segment.segmentText),
      createCell(segment.emotionProfileName || "Unknown"),
      createCell(statusForActive(segment.active)),
      actions,
    );
    elements.segmentRows.append(row);
  });
}

function renderSelectedMessage() {
  const selected = state.messages.find((message) => message.key === state.selectedMessageKey);
  setText(elements.selectedName, selected?.name || "None");
  setText(elements.selectedCategory, selected?.categoryName || "None");
  setText(elements.selectedEmotion, selected?.emotionProfileName || "None");
  setText(elements.selectedStatus, selected ? statusForActive(selected.active) : "None");
  setText(elements.selectedText, selected?.messageText || "No message selected.");
  setText(elements.segmentContext, selected ? `Segments for ${selected.name}` : "Save or select a message before adding segments.");
}

function renderCounts() {
  setText(elements.count, String(state.messages.length));
  setText(elements.categoryCount, String(state.categories.length));
  setText(elements.emotionCount, String(state.emotionProfiles.length));
  setText(elements.ttsCount, String(state.ttsProfiles.length));
}

function renderPersistence(persistence = {}) {
  setText(elements.persistenceSource, "Server API");
  setText(elements.persistenceEngine, persistence.engine || "SQLite");
  setText(elements.persistenceOwner, persistence.owner || "messages");
}

function render(persistence = {}) {
  populateSelect(elements.category, activeCategories(), "Select category");
  populateSelect(elements.emotionProfile, activeEmotionProfiles(), "Select emotion profile");
  populateSelect(elements.segmentEmotionProfile, activeEmotionProfiles(), "Select emotion profile");
  renderCategoryRows();
  renderEmotionRows();
  renderTtsRows();
  renderMessageRows();
  renderSelectedMessage();
  renderSegmentRows();
  renderCounts();
  renderPersistence(persistence);
}

function messageFormValues() {
  return {
    active: elements.active?.checked !== false,
    categoryKey: elements.category?.value || "",
    emotionProfileKey: elements.emotionProfile?.value || "",
    messageText: elements.text?.value || "",
    name: elements.name?.value || "",
    notes: elements.notes?.value || "",
  };
}

function validateMessage(values) {
  const errors = [];
  if (!values.name.trim()) {
    errors.push("Message Name is required.");
  }
  if (!values.categoryKey) {
    errors.push("Category is required.");
  }
  if (!values.emotionProfileKey) {
    errors.push("Emotion Profile is required.");
  }
  if (!values.messageText.trim()) {
    errors.push("Message Text is required.");
  }
  return errors;
}

function nextSegmentOrder() {
  const segments = selectedMessageSegments();
  if (!segments.length) {
    return 1;
  }
  return Math.max(...segments.map((segment) => segment.displayOrder)) + 1;
}

function resetSegmentForm() {
  setValue(elements.segmentKey, "");
  setValue(elements.segmentEmotionProfile, "");
  setValue(elements.segmentOrder, state.selectedMessageKey ? String(nextSegmentOrder()) : "");
  setValue(elements.segmentText, "");
  setChecked(elements.segmentActive, true);
  clearSegmentValidation();
}

function segmentFormValues() {
  return {
    active: elements.segmentActive?.checked !== false,
    displayOrder: elements.segmentOrder?.value || "",
    emotionProfileKey: elements.segmentEmotionProfile?.value || "",
    messageKey: state.selectedMessageKey,
    segmentText: elements.segmentText?.value || "",
  };
}

function validateSegment(values) {
  const errors = [];
  if (!state.selectedMessageKey) {
    errors.push("Save or select a message before adding segments.");
  }
  if (!values.segmentText.trim()) {
    errors.push("Segment Text is required.");
  }
  if (!values.emotionProfileKey) {
    errors.push("Emotion Profile is required.");
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

function ttsProfileFormValues() {
  return {
    active: elements.ttsActive?.checked !== false,
    description: elements.ttsDescription?.value || "",
    language: elements.ttsLanguage?.value || "",
    name: elements.ttsName?.value || "",
    pitch: Number(elements.ttsPitch?.value || 1),
    providerKey: elements.ttsProviderKey?.value || "",
    rate: Number(elements.ttsRate?.value || 1),
    voiceName: elements.ttsVoiceName?.value || "",
    volume: Number(elements.ttsVolume?.value || 1),
  };
}

function validateTtsProfile(values) {
  const errors = [];
  if (!values.name.trim()) {
    errors.push("TTS Profile Name is required.");
  }
  if (!values.providerKey.trim()) {
    errors.push("Provider Key is required.");
  }
  if (!values.language.trim()) {
    errors.push("Language is required.");
  }
  return errors;
}

function resetMessageForm() {
  state.selectedMessageKey = "";
  setValue(elements.key, "");
  setValue(elements.name, "");
  setValue(elements.category, "");
  setValue(elements.emotionProfile, "");
  setValue(elements.text, "");
  setValue(elements.notes, "");
  setChecked(elements.active, true);
  setText(elements.editorHeading, "New Message");
  clearValidation();
  resetSegmentForm();
  renderSelectedMessage();
  renderSegmentRows();
}

function editMessage(messageKey) {
  const message = state.messages.find((candidate) => candidate.key === messageKey);
  if (!message) {
    return;
  }
  state.selectedMessageKey = message.key;
  setValue(elements.key, message.key);
  setValue(elements.name, message.name);
  setValue(elements.category, message.categoryKey);
  setValue(elements.emotionProfile, message.emotionProfileKey);
  setValue(elements.text, message.messageText);
  setValue(elements.notes, message.notes || "");
  setChecked(elements.active, message.active);
  setText(elements.editorHeading, `Edit ${message.name}`);
  clearValidation();
  resetSegmentForm();
  renderSelectedMessage();
  renderSegmentRows();
}

function editSegment(segmentKey) {
  const segment = state.segments.find((candidate) => candidate.key === segmentKey);
  if (!segment) {
    return;
  }
  setValue(elements.segmentKey, segment.key);
  setValue(elements.segmentEmotionProfile, segment.emotionProfileKey);
  setValue(elements.segmentOrder, String(segment.displayOrder));
  setValue(elements.segmentText, segment.segmentText);
  setChecked(elements.segmentActive, segment.active);
  clearSegmentValidation();
}

function resetCategoryForm() {
  setValue(elements.categoryKey, "");
  setValue(elements.categoryName, "");
  setChecked(elements.categoryActive, true);
}

function editCategory(categoryKey) {
  const category = state.categories.find((candidate) => candidate.key === categoryKey);
  if (!category) {
    return;
  }
  setValue(elements.categoryKey, category.key);
  setValue(elements.categoryName, category.name);
  setChecked(elements.categoryActive, category.active);
}

function resetEmotionForm() {
  setValue(elements.emotionKey, "");
  setValue(elements.emotionName, "");
  setValue(elements.emotionDescription, "");
  setValue(elements.emotionVolume, "1");
  setValue(elements.emotionPitch, "1");
  setValue(elements.emotionRate, "1");
  setValue(elements.emotionPauseBefore, "0");
  setValue(elements.emotionPauseAfter, "0");
  setChecked(elements.emotionActive, true);
}

function resetTtsForm() {
  setValue(elements.ttsKey, "");
  setValue(elements.ttsName, "");
  setValue(elements.ttsDescription, "");
  setValue(elements.ttsProviderKey, "browser-speech");
  setValue(elements.ttsVoiceName, "");
  setValue(elements.ttsLanguage, "en-US");
  setValue(elements.ttsVolume, "1");
  setValue(elements.ttsPitch, "1");
  setValue(elements.ttsRate, "1");
  setChecked(elements.ttsActive, true);
}

function editEmotionProfile(profileKey) {
  const profile = state.emotionProfiles.find((candidate) => candidate.key === profileKey);
  if (!profile) {
    return;
  }
  setValue(elements.emotionKey, profile.key);
  setValue(elements.emotionName, profile.name);
  setValue(elements.emotionDescription, profile.description || "");
  setValue(elements.emotionVolume, String(profile.volume));
  setValue(elements.emotionPitch, String(profile.pitch));
  setValue(elements.emotionRate, String(profile.rate));
  setValue(elements.emotionPauseBefore, String(profile.pauseBeforeMs));
  setValue(elements.emotionPauseAfter, String(profile.pauseAfterMs));
  setChecked(elements.emotionActive, profile.active);
}

function editTtsProfile(profileKey) {
  const profile = state.ttsProfiles.find((candidate) => candidate.key === profileKey);
  if (!profile) {
    return;
  }
  setValue(elements.ttsKey, profile.key);
  setValue(elements.ttsName, profile.name);
  setValue(elements.ttsDescription, profile.description || "");
  setValue(elements.ttsProviderKey, profile.providerKey);
  setValue(elements.ttsVoiceName, profile.voiceName || "");
  setValue(elements.ttsLanguage, profile.language);
  setValue(elements.ttsVolume, String(profile.volume));
  setValue(elements.ttsPitch, String(profile.pitch));
  setValue(elements.ttsRate, String(profile.rate));
  setChecked(elements.ttsActive, profile.active);
}

async function loadAll() {
  const categoryPayload = listMessageCategories();
  const emotionPayload = listEmotionProfiles();
  const ttsPayload = listTtsProfiles();
  const messagesPayload = listMessages();
  const segmentsPayload = listMessageSegments();
  state.categories = categoryPayload.categories || [];
  state.emotionProfiles = emotionPayload.emotionProfiles || [];
  state.ttsProfiles = ttsPayload.ttsProfiles || [];
  state.messages = messagesPayload.messages || [];
  state.segments = segmentsPayload.segments || [];
  render(messagesPayload.persistence || categoryPayload.persistence || emotionPayload.persistence || ttsPayload.persistence || segmentsPayload.persistence);
  setText(elements.log, "Messages loaded from the Local API.");
}

async function reloadSegments() {
  const segmentsPayload = listMessageSegments();
  const emotionPayload = listEmotionProfiles();
  state.segments = segmentsPayload.segments || [];
  state.emotionProfiles = emotionPayload.emotionProfiles || [];
  populateSelect(elements.emotionProfile, activeEmotionProfiles(), "Select emotion profile");
  populateSelect(elements.segmentEmotionProfile, activeEmotionProfiles(), "Select emotion profile");
  renderEmotionRows();
  renderSegmentRows();
  resetSegmentForm();
  renderPersistence(segmentsPayload.persistence || emotionPayload.persistence || {});
}

async function refreshAfterSave(message) {
  await loadAll();
  if (message?.key) {
    editMessage(message.key);
  }
}

elements.form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = messageFormValues();
  const errors = validateMessage(values);
  if (errors.length) {
    showValidation(errors);
    setText(elements.log, "Message save blocked by validation.");
    return;
  }
  clearValidation();
  try {
    const messageKey = elements.key?.value || "";
    const result = messageKey
      ? updateMessage(messageKey, values)
      : createMessage(values);
    await refreshAfterSave(result.message);
    setText(elements.log, `Saved ${result.message.name}.`);
  } catch (error) {
    showValidation([error instanceof Error ? error.message : String(error || "Message save failed.")]);
    setText(elements.log, "Message save failed.");
  }
});

elements.newMessage?.addEventListener("click", () => {
  resetMessageForm();
  setText(elements.log, "Ready for a new message.");
});

elements.table?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-messages-edit]");
  if (editButton) {
    editMessage(editButton.dataset.messagesEdit);
    setText(elements.log, "Message loaded for editing.");
  }
});

elements.segmentForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = segmentFormValues();
  const errors = validateSegment(values);
  if (errors.length) {
    showSegmentValidation(errors);
    setText(elements.log, "Segment save blocked by validation.");
    return;
  }
  clearSegmentValidation();
  try {
    const segmentKey = elements.segmentKey?.value || "";
    const result = segmentKey
      ? updateMessageSegment(segmentKey, values)
      : createMessageSegment(values);
    await reloadSegments();
    setText(elements.log, `Saved segment ${result.segment.displayOrder}.`);
  } catch (error) {
    showSegmentValidation([error instanceof Error ? error.message : String(error || "Segment save failed.")]);
    setText(elements.log, "Segment save failed.");
  }
});

elements.segmentNew?.addEventListener("click", () => {
  resetSegmentForm();
  setText(elements.log, "Ready for a new segment.");
});

elements.segmentReload?.addEventListener("click", async () => {
  try {
    await reloadSegments();
    setText(elements.log, "Segments reloaded from the Local API.");
  } catch (error) {
    showSegmentValidation([error instanceof Error ? error.message : String(error || "Segments reload failed.")]);
    setText(elements.log, "Segments reload failed.");
  }
});

elements.segmentRows?.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-messages-segment-edit]");
  if (editButton) {
    editSegment(editButton.dataset.messagesSegmentEdit);
    setText(elements.log, "Segment loaded for editing.");
    return;
  }

  const moveUpButton = event.target.closest("[data-messages-segment-move-up]");
  const moveDownButton = event.target.closest("[data-messages-segment-move-down]");
  if (moveUpButton || moveDownButton) {
    const segmentKey = moveUpButton?.dataset.messagesSegmentMoveUp || moveDownButton?.dataset.messagesSegmentMoveDown;
    const direction = moveUpButton ? -1 : 1;
    const segments = selectedMessageSegments();
    const currentIndex = segments.findIndex((segment) => segment.key === segmentKey);
    const target = segments[currentIndex + direction];
    const current = segments[currentIndex];
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
      await reloadSegments();
      setText(elements.log, "Segment order updated.");
    } catch (error) {
      showSegmentValidation([error instanceof Error ? error.message : String(error || "Segment reorder failed.")]);
      setText(elements.log, "Segment reorder failed.");
    }
    return;
  }

  const toggleButton = event.target.closest("[data-messages-segment-toggle]");
  if (toggleButton) {
    const segment = state.segments.find((candidate) => candidate.key === toggleButton.dataset.messagesSegmentToggle);
    if (!segment) {
      return;
    }
    try {
      const result = updateMessageSegment(segment.key, {
        active: !segment.active,
        displayOrder: segment.displayOrder,
        emotionProfileKey: segment.emotionProfileKey,
        messageKey: segment.messageKey,
        segmentText: segment.segmentText,
      });
      await reloadSegments();
      setText(elements.log, `${result.segment.active ? "Enabled" : "Disabled"} segment ${result.segment.displayOrder}.`);
    } catch (error) {
      showSegmentValidation([error instanceof Error ? error.message : String(error || "Segment status update failed.")]);
      setText(elements.log, "Segment status update failed.");
    }
  }
});

elements.categoryForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = {
    active: elements.categoryActive?.checked !== false,
    name: elements.categoryName?.value || "",
  };
  try {
    const categoryKey = elements.categoryKey?.value || "";
    const result = categoryKey
      ? updateMessageCategory(categoryKey, input)
      : createMessageCategory(input);
    await loadAll();
    resetCategoryForm();
    setText(elements.log, `Saved category ${result.category.name}.`);
  } catch (error) {
    setText(elements.log, error instanceof Error ? error.message : String(error || "Category save failed."));
  }
});

elements.categoryCancel?.addEventListener("click", () => {
  resetCategoryForm();
  setText(elements.log, "Ready for a new category.");
});

elements.categoryRows?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-messages-category-edit]");
  if (editButton) {
    editCategory(editButton.dataset.messagesCategoryEdit);
    setText(elements.log, "Category loaded for editing.");
  }
});

elements.emotionForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = {
    active: elements.emotionActive?.checked !== false,
    description: elements.emotionDescription?.value || "",
    name: elements.emotionName?.value || "",
    pauseAfterMs: Number(elements.emotionPauseAfter?.value || 0),
    pauseBeforeMs: Number(elements.emotionPauseBefore?.value || 0),
    pitch: Number(elements.emotionPitch?.value || 1),
    rate: Number(elements.emotionRate?.value || 1),
    volume: Number(elements.emotionVolume?.value || 1),
  };
  try {
    const profileKey = elements.emotionKey?.value || "";
    const result = profileKey
      ? updateEmotionProfile(profileKey, input)
      : createEmotionProfile(input);
    await loadAll();
    resetEmotionForm();
    setText(elements.log, `Saved emotion profile ${result.emotionProfile.name}.`);
  } catch (error) {
    setText(elements.log, error instanceof Error ? error.message : String(error || "Emotion profile save failed."));
  }
});

elements.emotionCancel?.addEventListener("click", () => {
  resetEmotionForm();
  setText(elements.log, "Ready for a new emotion profile.");
});

elements.emotionRows?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-messages-emotion-edit]");
  if (editButton) {
    editEmotionProfile(editButton.dataset.messagesEmotionEdit);
    setText(elements.log, "Emotion profile loaded for editing.");
  }
});

elements.ttsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = ttsProfileFormValues();
  const errors = validateTtsProfile(input);
  if (errors.length) {
    setText(elements.log, errors.join(" "));
    return;
  }
  try {
    const ttsKey = elements.ttsKey?.value || "";
    const result = ttsKey
      ? updateTtsProfile(ttsKey, input)
      : createTtsProfile(input);
    await loadAll();
    resetTtsForm();
    setText(elements.log, `Saved TTS profile ${result.ttsProfile.name}.`);
  } catch (error) {
    setText(elements.log, error instanceof Error ? error.message : String(error || "TTS profile save failed."));
  }
});

elements.ttsCancel?.addEventListener("click", () => {
  resetTtsForm();
  setText(elements.log, "Ready for a new TTS profile.");
});

elements.ttsRows?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-messages-tts-edit]");
  if (editButton) {
    editTtsProfile(editButton.dataset.messagesTtsEdit);
    setText(elements.log, "TTS profile loaded for editing.");
  }
});

try {
  await loadAll();
  resetMessageForm();
  resetCategoryForm();
  resetEmotionForm();
  resetTtsForm();
} catch (error) {
  setText(elements.log, error instanceof Error ? error.message : String(error || "Messages failed to load."));
  showValidation(["Messages could not load from the Local API. Start the Local API server and reload this tool."]);
}
