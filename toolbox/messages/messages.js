import {
  createEmotionProfile,
  createMessage,
  createMessageCategory,
  listEmotionProfiles,
  listMessageCategories,
  listMessages,
  updateEmotionProfile,
  updateMessage,
  updateMessageCategory,
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
  table: document.querySelector("[data-messages-table]"),
  text: document.querySelector("[data-messages-text]"),
  validationCard: document.querySelector("[data-messages-validation-card]"),
  validationErrors: document.querySelector("[data-messages-validation-errors]"),
};

const state = {
  categories: [],
  emotionProfiles: [],
  messages: [],
  selectedMessageKey: "",
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
      createCell(statusForActive(profile.active)),
      actions,
    );
    elements.emotionRows.append(row);
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

function renderSelectedMessage() {
  const selected = state.messages.find((message) => message.key === state.selectedMessageKey);
  setText(elements.selectedName, selected?.name || "None");
  setText(elements.selectedCategory, selected?.categoryName || "None");
  setText(elements.selectedEmotion, selected?.emotionProfileName || "None");
  setText(elements.selectedStatus, selected ? statusForActive(selected.active) : "None");
  setText(elements.selectedText, selected?.messageText || "No message selected.");
}

function renderCounts() {
  setText(elements.count, String(state.messages.length));
  setText(elements.categoryCount, String(state.categories.length));
  setText(elements.emotionCount, String(state.emotionProfiles.length));
}

function renderPersistence(persistence = {}) {
  setText(elements.persistenceSource, "Server API");
  setText(elements.persistenceEngine, persistence.engine || "SQLite");
  setText(elements.persistenceOwner, persistence.owner || "messages");
}

function render(persistence = {}) {
  populateSelect(elements.category, activeCategories(), "Select category");
  populateSelect(elements.emotionProfile, activeEmotionProfiles(), "Select emotion profile");
  renderCategoryRows();
  renderEmotionRows();
  renderMessageRows();
  renderSelectedMessage();
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
  renderSelectedMessage();
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
  renderSelectedMessage();
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

async function loadAll() {
  const categoryPayload = listMessageCategories();
  const emotionPayload = listEmotionProfiles();
  const messagesPayload = listMessages();
  state.categories = categoryPayload.categories || [];
  state.emotionProfiles = emotionPayload.emotionProfiles || [];
  state.messages = messagesPayload.messages || [];
  render(messagesPayload.persistence || categoryPayload.persistence || emotionPayload.persistence);
  setText(elements.log, "Messages loaded from the Local API.");
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

try {
  await loadAll();
  resetMessageForm();
  resetCategoryForm();
  resetEmotionForm();
} catch (error) {
  setText(elements.log, error instanceof Error ? error.message : String(error || "Messages failed to load."));
  showValidation(["Messages could not load from the Local API. Start the Local API server and reload this tool."]);
}
