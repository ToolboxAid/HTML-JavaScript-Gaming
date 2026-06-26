import { createServerRepositoryClient } from "../../../../src/api/server-api-client.js";
import { getSessionCurrent } from "../../../../src/api/session-api-client.js";

const repository = createServerRepositoryClient("sprites");

const elements = {
  add: document.querySelector("[data-sprites-add]"),
  categoryFilter: document.querySelector("[data-sprites-category-filter]"),
  count: document.querySelector("[data-sprites-count]"),
  libraryStatus: document.querySelector("[data-sprites-library-status]"),
  log: document.querySelector("[data-sprites-log]"),
  metadata: document.querySelector("[data-sprites-metadata]"),
  paletteState: document.querySelector("[data-sprites-palette-state]"),
  preview: document.querySelector("[data-sprites-preview]"),
  references: document.querySelector("[data-sprites-references]"),
  search: document.querySelector("[data-sprites-search]"),
  statusFilter: document.querySelector("[data-sprites-status-filter]"),
  tableBody: document.querySelector("[data-sprites-table-body]"),
  tagFilter: document.querySelector("[data-sprites-tag-filter]"),
  validation: document.querySelector("[data-sprites-validation]"),
  visibleCount: document.querySelector("[data-sprites-visible-count]"),
};

let snapshot = emptySnapshot();
let editingSpriteId = "";
let selectedSpriteId = "";
let filterState = {
  category: "",
  query: "",
  status: "",
  tagKey: "",
};

function emptySnapshot() {
  return {
    categories: [],
    paletteColors: [],
    paletteOwnership: "Palette/Colors is the reusable color source of truth.",
    preview: { message: "Preview unavailable until the Sprites API is ready.", status: "Unavailable" },
    referenceContract: { message: "Reference contract unavailable.", references: [], usageCount: 0 },
    selectedSprite: null,
    sprites: [],
    statusOptions: [],
    tags: [],
    validation: { findings: [], status: "Loading" },
  };
}

function normalizeText(value) {
  return String(value || "").trim();
}

function setText(target, value) {
  if (target) {
    target.textContent = value;
  }
}

function option(value, label = value) {
  const optionElement = document.createElement("option");
  optionElement.value = value;
  optionElement.textContent = label;
  return optionElement;
}

function replaceSelectOptions(select, values, selectedValue = "", includeAllLabel = "") {
  if (!select) {
    return;
  }
  const options = includeAllLabel ? [option("", includeAllLabel)] : [];
  values.forEach((value) => {
    options.push(option(value));
  });
  select.replaceChildren(...options);
  select.value = selectedValue;
}

function tagLabel(tagKey) {
  return snapshot.tags.find((tag) => tag.id === tagKey)?.name || tagKey;
}

function paletteLabel(paletteColorKey) {
  const swatch = snapshot.paletteColors.find((color) => color.key === paletteColorKey);
  return swatch ? `${swatch.name} (${swatch.key})` : paletteColorKey || "None";
}

function currentSession() {
  try {
    return getSessionCurrent();
  } catch {
    return { authenticated: false };
  }
}

function requireCreatorSession() {
  if (currentSession()?.authenticated === true) {
    return true;
  }
  window.location.href = "account/sign-in.html";
  return false;
}

function loadSnapshot() {
  const result = repository.getSpritesSnapshot();
  if (!result || result.error) {
    const diagnostic = result?.message || result?.validation?.findings?.[0]?.action || repository.__apiDiagnostic?.() || "Sprites API unavailable.";
    snapshot = emptySnapshot();
    snapshot.validation.findings = [{ action: diagnostic, label: "Sprites API", status: "Blocked" }];
    snapshot.validation.status = "Blocked";
    setText(elements.log, diagnostic);
    render();
    return;
  }
  snapshot = result;
  if (!selectedSpriteId && snapshot.selectedSprite?.id) {
    selectedSpriteId = snapshot.selectedSprite.id;
  }
  if (selectedSpriteId && !snapshot.sprites.some((sprite) => sprite.id === selectedSpriteId)) {
    selectedSpriteId = snapshot.selectedSprite?.id || snapshot.sprites[0]?.id || "";
  }
  render();
}

function filteredSprites() {
  const query = filterState.query.toLowerCase();
  return snapshot.sprites.filter((sprite) => {
    const matchesStatus = !filterState.status || sprite.status === filterState.status;
    const matchesCategory = !filterState.category || sprite.category === filterState.category;
    const matchesTag = !filterState.tagKey || (Array.isArray(sprite.tagKeys) && sprite.tagKeys.includes(filterState.tagKey));
    const searchable = [
      sprite.name,
      sprite.key,
      sprite.category,
      sprite.status,
      sprite.paletteColorKey,
      ...(Array.isArray(sprite.tagKeys) ? sprite.tagKeys.map(tagLabel) : []),
    ].join(" ").toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    return matchesStatus && matchesCategory && matchesTag && matchesQuery;
  });
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function createButton(label, action, spriteId = "") {
  const button = document.createElement("button");
  button.className = "btn btn--compact";
  button.type = "button";
  button.dataset.spritesAction = action;
  if (spriteId) {
    button.dataset.spriteId = spriteId;
  }
  button.textContent = label;
  return button;
}

function createInput(value, label, name) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value || "";
  input.setAttribute("aria-label", label);
  input.dataset.spritesField = name;
  return input;
}

function createSelect(values, selectedValue, label, name, emptyLabel = "") {
  const select = document.createElement("select");
  select.setAttribute("aria-label", label);
  select.dataset.spritesField = name;
  const options = [];
  if (emptyLabel) {
    options.push(option("", emptyLabel));
  }
  values.forEach((value) => options.push(option(value)));
  select.replaceChildren(...options);
  select.value = selectedValue || "";
  return select;
}

function createPaletteSelect(selectedValue) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Palette color reference");
  select.dataset.spritesField = "paletteColorKey";
  const options = [option("", "No Palette color reference")];
  snapshot.paletteColors.forEach((color) => {
    options.push(option(color.key, `${color.name} (${color.key})`));
  });
  select.replaceChildren(...options);
  select.value = selectedValue || "";
  if (snapshot.paletteColors.length === 0) {
    select.disabled = true;
  }
  return select;
}

function createTagSelect(selectedTagKeys = []) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Shared tag reference");
  select.dataset.spritesField = "tagKeys";
  select.replaceChildren(
    option("", "No shared tag"),
    ...snapshot.tags.map((tag) => option(tag.id, tag.name)),
  );
  select.value = selectedTagKeys[0] || "";
  if (snapshot.tags.length === 0) {
    select.disabled = true;
  }
  return select;
}

function createEditorRow(sprite = {}) {
  const row = document.createElement("tr");
  const isNew = !sprite.id;
  row.dataset.spritesEditorRow = isNew ? "__new__" : sprite.id;

  const nameCell = document.createElement("td");
  nameCell.append(createInput(sprite.name || "", "Sprite name", "name"));
  row.append(nameCell);

  const statusCell = document.createElement("td");
  statusCell.append(createSelect(snapshot.statusOptions, sprite.status || "Ready", "Sprite status", "status"));
  row.append(statusCell);

  const categoryCell = document.createElement("td");
  categoryCell.append(createSelect(snapshot.categories, sprite.category || "Sprite", "Sprite category", "category"));
  row.append(categoryCell);

  const tagsCell = document.createElement("td");
  tagsCell.append(createTagSelect(sprite.tagKeys || []));
  row.append(tagsCell);

  const paletteCell = document.createElement("td");
  paletteCell.append(createPaletteSelect(sprite.paletteColorKey || ""));
  row.append(paletteCell);

  row.append(createCell(isNew ? "New sprite" : sprite.updatedAt || "Unavailable"));

  const actionsCell = document.createElement("td");
  actionsCell.append(
    createButton("Save", "save", sprite.id || "__new__"),
    document.createTextNode(" "),
    createButton("Cancel", "cancel", sprite.id || "__new__"),
  );
  row.append(actionsCell);
  return row;
}

function rowValues(row) {
  const field = (name) => row.querySelector(`[data-sprites-field='${name}']`);
  const tagKey = normalizeText(field("tagKeys")?.value);
  return {
    category: normalizeText(field("category")?.value),
    name: normalizeText(field("name")?.value),
    paletteColorKey: normalizeText(field("paletteColorKey")?.value),
    status: normalizeText(field("status")?.value),
    tagKeys: tagKey ? [tagKey] : [],
  };
}

function renderRows() {
  if (!elements.tableBody) {
    return;
  }
  const rows = [];
  const sprites = filteredSprites();

  sprites.forEach((sprite) => {
    if (editingSpriteId === sprite.id) {
      rows.push(createEditorRow(sprite));
      return;
    }
    const row = document.createElement("tr");
    row.dataset.spritesRow = sprite.id;
    if (sprite.id === selectedSpriteId) {
      row.dataset.spritesSelected = "true";
    }
    row.append(
      createCell(sprite.name || "Unnamed Sprite"),
      createCell(sprite.status || "Unavailable"),
      createCell(sprite.category || "Uncategorized"),
      createCell((sprite.tagKeys || []).map(tagLabel).join(", ") || "No shared tags"),
      createCell(sprite.paletteColorKey || "None"),
      createCell(sprite.updatedAt || "Unavailable"),
    );
    const actionsCell = document.createElement("td");
    actionsCell.append(
      createButton("View", "view", sprite.id),
      document.createTextNode(" "),
      createButton("Edit", "edit", sprite.id),
      document.createTextNode(" "),
      createButton("Archive", "archive", sprite.id),
    );
    row.append(actionsCell);
    rows.push(row);
  });

  if (editingSpriteId === "__new__") {
    rows.push(createEditorRow());
  }

  if (rows.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 7;
    emptyCell.textContent = snapshot.sprites.length === 0
      ? "No sprite records yet. Add a sprite to begin testing the MVP."
      : "No sprites match the current filters.";
    emptyRow.append(emptyCell);
    rows.push(emptyRow);
  }
  elements.tableBody.replaceChildren(...rows);
}

function renderFilters() {
  replaceSelectOptions(elements.statusFilter, snapshot.statusOptions, filterState.status, "All statuses");
  replaceSelectOptions(elements.categoryFilter, snapshot.categories, filterState.category, "All categories");
  if (elements.tagFilter) {
    const tagOptions = [option("", "All tags"), ...snapshot.tags.map((tag) => option(tag.id, tag.name))];
    elements.tagFilter.replaceChildren(...tagOptions);
    elements.tagFilter.value = filterState.tagKey;
  }
}

function renderPaletteState() {
  if (!elements.paletteState) {
    return;
  }
  if (snapshot.paletteColors.length === 0) {
    elements.paletteState.textContent = "Palette/Colors has no reusable color records available. Sprites will save Palette color references as empty keys.";
    return;
  }
  elements.paletteState.textContent = `${snapshot.paletteColors.length} Palette/Colors record${snapshot.paletteColors.length === 1 ? "" : "s"} available by API key. Sprites store paletteColorKey only.`;
}

function renderMetadata() {
  const sprite = snapshot.sprites.find((candidate) => candidate.id === selectedSpriteId) || snapshot.selectedSprite;
  if (!elements.metadata || !elements.preview || !elements.references) {
    return;
  }
  if (!sprite) {
    elements.metadata.replaceChildren(listItem("No selected sprite details."));
    elements.preview.replaceChildren(paragraph(snapshot.preview.message || "Preview unavailable."));
    elements.references.replaceChildren(paragraph(snapshot.referenceContract.message || "Reference protection unavailable."));
    return;
  }
  elements.metadata.replaceChildren(
    listItem(`Key: ${sprite.key || sprite.id}`),
    listItem(`Source: ${sprite.source || "Unavailable"}`),
    listItem(`File: ${sprite.fileName || sprite.originalName || "Unavailable"}`),
    listItem(`MIME/type: ${sprite.mimeType || "Unavailable"}`),
    listItem(`Dimensions: ${sprite.dimensions || "Unavailable"}`),
    listItem(`Size: ${sprite.size ? `${sprite.size} bytes` : "Unavailable"}`),
    listItem(`Palette color key: ${sprite.paletteColorKey || "None"}`),
    listItem(`Updated by: ${sprite.updatedBy || "Unavailable"}`),
    listItem(`Updated at: ${sprite.updatedAt || "Unavailable"}`),
  );
  elements.preview.replaceChildren(
    paragraph(sprite.previewStatus || snapshot.preview.message || "Preview unavailable."),
    paragraph(`Stored path: ${sprite.storedPath || sprite.path || "Unavailable"}`),
  );
  const referenceSummary = sprite.referenceSummary || snapshot.referenceContract;
  elements.references.replaceChildren(
    paragraph(referenceSummary.message || "Reference protection unavailable."),
    paragraph(`Usage count: ${referenceSummary.usageCount || 0}`),
  );
}

function listItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function paragraph(text) {
  const item = document.createElement("p");
  item.textContent = text;
  return item;
}

function renderValidation() {
  if (!elements.validation) {
    return;
  }
  const findings = snapshot.validation?.findings || [];
  if (findings.length === 0) {
    elements.validation.replaceChildren(listItem("No validation findings."));
    return;
  }
  elements.validation.replaceChildren(
    ...findings.map((finding) => listItem(`${finding.label || "Finding"}: ${finding.action || finding.status || "Needs input"}`)),
  );
}

function renderSummary() {
  const visible = filteredSprites();
  setText(elements.count, String(snapshot.sprites.length));
  setText(elements.visibleCount, String(visible.length));
  setText(elements.libraryStatus, snapshot.validation?.status || "Unavailable");
  if (!elements.log?.textContent || elements.log.textContent === "Sprites loading.") {
    setText(elements.log, snapshot.sprites.length ? "Sprites ready." : "Sprites ready. Add a sprite to begin.");
  }
}

function render() {
  renderFilters();
  renderPaletteState();
  renderRows();
  renderMetadata();
  renderValidation();
  renderSummary();
}

function saveEditorRow(row) {
  if (!requireCreatorSession()) {
    return;
  }
  const spriteId = row.dataset.spritesEditorRow;
  const values = rowValues(row);
  const result = spriteId === "__new__"
    ? repository.createSpriteRecord(values)
    : repository.updateSpriteRecord(spriteId, values);
  setText(elements.log, result?.message || "Sprite save did not return a message.");
  if (result?.created || result?.updated) {
    editingSpriteId = "";
    selectedSpriteId = result.asset?.id || selectedSpriteId;
  }
  loadSnapshot();
}

elements.add?.addEventListener("click", () => {
  editingSpriteId = "__new__";
  selectedSpriteId = "";
  setText(elements.log, "Adding sprite.");
  render();
});

elements.tableBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-sprites-action]");
  if (!button) {
    return;
  }
  const spriteId = button.dataset.spriteId || "";
  const action = button.dataset.spritesAction;
  if (action === "view") {
    selectedSpriteId = spriteId;
    setText(elements.log, "Viewing sprite.");
    render();
    return;
  }
  if (action === "edit") {
    selectedSpriteId = spriteId;
    editingSpriteId = spriteId;
    setText(elements.log, "Editing sprite.");
    render();
    return;
  }
  if (action === "cancel") {
    editingSpriteId = "";
    setText(elements.log, "Sprite edit canceled.");
    render();
    return;
  }
  if (action === "save") {
    const row = button.closest("[data-sprites-editor-row]");
    saveEditorRow(row);
    return;
  }
  if (action === "archive") {
    if (!requireCreatorSession()) {
      return;
    }
    const result = repository.archiveSpriteRecord(spriteId);
    setText(elements.log, result?.message || "Sprite archive did not return a message.");
    selectedSpriteId = spriteId;
    loadSnapshot();
  }
});

elements.search?.addEventListener("input", () => {
  filterState.query = normalizeText(elements.search.value);
  render();
});

elements.statusFilter?.addEventListener("change", () => {
  filterState.status = normalizeText(elements.statusFilter.value);
  render();
});

elements.categoryFilter?.addEventListener("change", () => {
  filterState.category = normalizeText(elements.categoryFilter.value);
  render();
});

elements.tagFilter?.addEventListener("change", () => {
  filterState.tagKey = normalizeText(elements.tagFilter.value);
  render();
});

loadSnapshot();
