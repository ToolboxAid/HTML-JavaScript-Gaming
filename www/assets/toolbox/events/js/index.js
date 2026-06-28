import {
  requireServerApiData,
  safeRequestServerApi,
} from "../../../../../src/api/server-api-client.js";

const NEW_ROW_KEY = "__new__";
const TABLE_COLSPAN = 5;
const EVENT_ACTION_OPTIONS = Object.freeze([
  Object.freeze({ key: "show-message", name: "Show Message", requiresMessage: true }),
  Object.freeze({ key: "speak-message", name: "Speak Message", requiresMessage: true }),
  Object.freeze({ key: "wait-for-continue", name: "Wait For Continue", requiresMessage: false }),
]);

const elements = {
  addAction: document.querySelector("[data-events-add-action]"),
  log: document.querySelector("[data-events-log]"),
  persistenceSource: document.querySelector("[data-events-persistence-source]"),
  persistenceStorage: document.querySelector("[data-events-persistence-storage]"),
  table: document.querySelector("[data-events-actions-table]"),
  validationCard: document.querySelector("[data-events-validation-card]"),
  validationErrors: document.querySelector("[data-events-validation-errors]"),
};

const state = {
  editingKey: "",
  eventActions: [],
  messages: [],
};

function readData(path, context) {
  return requireServerApiData(safeRequestServerApi(path), context);
}

function writeData(path, body, context) {
  return requireServerApiData(
    safeRequestServerApi(path, {
      body,
      method: "POST",
    }),
    context,
  );
}

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

function createInput(value, dataName, ariaLabel) {
  const input = document.createElement("input");
  input.dataset[dataName] = "";
  input.type = "text";
  input.value = value || "";
  input.setAttribute("aria-label", ariaLabel);
  return input;
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

function createButton(label, dataName, value, options = {}) {
  const button = document.createElement("button");
  button.className = options.primary ? "btn btn--compact primary" : "btn btn--compact";
  button.type = "button";
  button.dataset[dataName] = value;
  button.textContent = label;
  return button;
}

function createActionGroup(...buttons) {
  const group = document.createElement("div");
  group.className = "action-group action-group--tight";
  buttons.forEach((button) => group.append(button));
  return group;
}

function tableMessage(text) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = TABLE_COLSPAN;
  cell.textContent = text;
  row.append(cell);
  return row;
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

function actionTypeDefinition(actionType) {
  return EVENT_ACTION_OPTIONS.find((option) => option.key === actionType) || null;
}

function activeMessages() {
  return state.messages.filter((message) => message.active !== false);
}

function clearValidation() {
  elements.validationErrors?.replaceChildren();
  if (elements.validationCard) {
    elements.validationCard.hidden = true;
  }
}

function showValidation(errors) {
  if (!elements.validationCard || !elements.validationErrors) {
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
  const safeMessage = message || "Event action could not be saved. Check the Local API connection and try again.";
  showValidation([safeMessage]);
  setText(elements.log, safeMessage);
}

function renderPersistence(persistence = {}) {
  setText(elements.persistenceSource, "Local API");
  setText(elements.persistenceStorage, persistence.storage === "server-owned" ? "Local DB" : "Local DB");
}

function createEditRow(action = null) {
  const key = action?.key || NEW_ROW_KEY;
  const row = document.createElement("tr");
  row.dataset.eventsActionEditor = key;

  const nameCell = document.createElement("td");
  nameCell.append(createInput(action?.name || "", "eventActionName", "Action"));

  const typeCell = document.createElement("td");
  typeCell.append(createSelect(action?.actionType || "", "eventActionType", EVENT_ACTION_OPTIONS, "Select action", "Event option"));

  const messageCell = document.createElement("td");
  messageCell.append(createSelect(action?.messageKey || "", "eventActionMessage", activeMessages(), "Select message", "Message"));

  const actions = document.createElement("td");
  actions.append(createActionGroup(
    createButton("Save", "eventsActionCommit", key, { primary: true }),
    createButton("Cancel", "eventsActionCancel", key),
  ));

  row.append(
    nameCell,
    typeCell,
    messageCell,
    createCell(action ? formatUpdated(action.updatedAt) : "New"),
    actions,
  );
  return row;
}

function createActionRow(action) {
  const row = document.createElement("tr");
  row.dataset.eventsActionRow = action.key;
  const actions = document.createElement("td");
  actions.append(createActionGroup(
    createButton("Edit", "eventsActionEdit", action.key),
  ));
  row.append(
    createRowHeader(action.name),
    createCell(action.actionLabel || actionTypeDefinition(action.actionType)?.name || "Unknown action"),
    createCell(action.messageName || "No message required"),
    createCell(formatUpdated(action.updatedAt)),
    actions,
  );
  return row;
}

function renderRows() {
  if (!elements.table) {
    return;
  }
  elements.table.replaceChildren();
  if (state.editingKey === NEW_ROW_KEY) {
    elements.table.append(createEditRow(null));
  }
  if (!state.eventActions.length && state.editingKey !== NEW_ROW_KEY) {
    elements.table.append(tableMessage("No event actions yet. Add an action when your event flow is ready."));
    return;
  }
  state.eventActions.forEach((action) => {
    if (state.editingKey === action.key) {
      elements.table.append(createEditRow(action));
      return;
    }
    elements.table.append(createActionRow(action));
  });
}

function editorValue(root, selector) {
  return root?.querySelector(selector)?.value || "";
}

function actionValues(key) {
  const root = elements.table?.querySelector(`[data-events-action-editor="${key}"]`);
  const existing = state.eventActions.find((action) => action.key === key) || null;
  return {
    active: existing ? existing.active : true,
    actionType: editorValue(root, "[data-event-action-type]"),
    messageKey: editorValue(root, "[data-event-action-message]"),
    name: editorValue(root, "[data-event-action-name]"),
  };
}

function validateAction(values) {
  const errors = [];
  const actionDefinition = actionTypeDefinition(values.actionType);
  if (!values.name.trim()) {
    errors.push("Action is required.");
  }
  if (!actionDefinition) {
    errors.push("Event option is required.");
  } else if (actionDefinition.requiresMessage && !values.messageKey) {
    errors.push("Message is required for this event option.");
  } else if (!actionDefinition.requiresMessage && values.messageKey) {
    errors.push("Message is not used by this event option.");
  }
  return errors;
}

function loadAll() {
  const messagePayload = readData("/messages/messages", "Messages list");
  const actionPayload = readData("/messages/event-actions", "Message event actions");
  state.messages = messagePayload.messages || [];
  state.eventActions = actionPayload.eventActions || [];
  renderPersistence(actionPayload.persistence || messagePayload.persistence);
  renderRows();
  setText(elements.log, "Events loaded.");
}

function reloadAfterChange() {
  loadAll();
  renderRows();
}

function beginAddAction() {
  clearValidation();
  state.editingKey = NEW_ROW_KEY;
  renderRows();
  setText(elements.log, "Ready to add an event action.");
}

function beginEditAction(key) {
  clearValidation();
  state.editingKey = key;
  renderRows();
  setText(elements.log, "Event action row opened inline.");
}

function cancelEdit() {
  state.editingKey = "";
  clearValidation();
  renderRows();
  setText(elements.log, "Event action edit canceled.");
}

function commitAction(key) {
  const values = actionValues(key);
  const errors = validateAction(values);
  if (errors.length) {
    showValidation(errors);
    setText(elements.log, "Event action needs required fields.");
    return;
  }
  clearValidation();
  try {
    const result = key === NEW_ROW_KEY
      ? writeData("/messages/event-actions", values, "Create message event action")
      : writeData(`/messages/event-actions/${encodeURIComponent(key)}`, values, "Update message event action");
    state.editingKey = "";
    reloadAfterChange();
    setText(elements.log, `Saved event action ${result.eventAction.name}.`);
  } catch {
    showCreatorSafeFailure("Event action was not saved. Check required fields and try again.");
  }
}

elements.addAction?.addEventListener("click", () => {
  beginAddAction();
});

elements.table?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-events-action-edit]");
  const commitButton = event.target.closest("[data-events-action-commit]");
  const cancelButton = event.target.closest("[data-events-action-cancel]");
  if (editButton) {
    beginEditAction(editButton.dataset.eventsActionEdit);
    return;
  }
  if (commitButton) {
    commitAction(commitButton.dataset.eventsActionCommit);
    return;
  }
  if (cancelButton) {
    cancelEdit();
  }
});

try {
  loadAll();
} catch {
  showCreatorSafeFailure("Events could not load message event actions. Start the Local API and reload this tool.");
}
