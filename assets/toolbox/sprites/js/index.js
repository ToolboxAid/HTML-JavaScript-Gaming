const SPRITES_API_PATH = "/api/sprites/records";
const SIGN_IN_PATH = "account/sign-in.html";
const SPRITE_STATUSES = Object.freeze(["draft", "ready", "published", "archived"]);

const elements = {
  actionStatus: document.querySelector("[data-sprites-action-status]"),
  add: document.querySelector("[data-sprites-add]"),
  apiStatus: document.querySelector("[data-sprites-api-status]"),
  count: document.querySelector("[data-sprites-count]"),
  categoryFilter: document.querySelector("[data-sprites-category-filter]"),
  clearFilters: document.querySelector("[data-sprites-clear-filters]"),
  emptyState: document.querySelector("[data-sprites-empty-state]"),
  errorState: document.querySelector("[data-sprites-error-state]"),
  filterStatus: document.querySelector("[data-sprites-filter-status]"),
  libraryStatus: document.querySelector("[data-sprites-library-status]"),
  metadata: document.querySelector("[data-sprites-metadata]"),
  outputStatus: document.querySelector("[data-sprites-output-status]"),
  outputSummary: document.querySelector("[data-sprites-output-summary]"),
  paletteSelectionStatus: document.querySelector("[data-sprites-palette-selection-status]"),
  paletteStatus: document.querySelector("[data-sprites-palette-status]"),
  previewPanel: document.querySelector("[data-sprites-preview-panel]"),
  refresh: document.querySelector("[data-sprites-refresh]"),
  referencePanel: document.querySelector("[data-sprites-reference-panel]"),
  referenceStatus: document.querySelector("[data-sprites-reference-status]"),
  replace: document.querySelector("[data-sprites-replace]"),
  replaceStatus: document.querySelector("[data-sprites-replace-status]"),
  search: document.querySelector("[data-sprites-search]"),
  storageStatus: document.querySelector("[data-sprites-storage-status]"),
  statusFilter: document.querySelector("[data-sprites-status-filter]"),
  tableBody: document.querySelector("[data-sprites-table-body]"),
  tagFilter: document.querySelector("[data-sprites-tag-filter]"),
  updated: document.querySelector("[data-sprites-updated]"),
  validation: document.querySelector("[data-sprites-validation]"),
  duplicate: document.querySelector("[data-sprites-duplicate]"),
};

let currentSprites = [];
let editingKey = "";
let selectedSpriteKey = "";

function setText(target, value) {
  if (target) {
    target.textContent = value;
  }
}

function setHidden(target, hidden) {
  if (target) {
    target.hidden = hidden;
  }
}

function setDisabled(target, disabled) {
  if (target) {
    target.disabled = disabled;
  }
}

function createCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  return cell;
}

function createParagraph(value, className = "") {
  const paragraph = document.createElement("p");
  if (className) {
    paragraph.className = className;
  }
  paragraph.textContent = value;
  return paragraph;
}

function createHeaderCell(value) {
  const cell = document.createElement("th");
  cell.scope = "row";
  cell.textContent = value;
  return cell;
}

function createButton(label, datasetName, value, options = {}) {
  const button = document.createElement("button");
  button.className = options.primary ? "btn btn--compact primary" : "btn btn--compact";
  button.type = "button";
  button.dataset[datasetName] = value;
  button.textContent = label;
  if (options.disabled) {
    button.disabled = true;
  }
  if (options.label) {
    button.setAttribute("aria-label", options.label);
  }
  if (options.title) {
    button.title = options.title;
  }
  return button;
}

function createInput(value, label, datasetName) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value || "";
  input.setAttribute("aria-label", label);
  input.dataset[datasetName] = "true";
  return input;
}

function createStatusSelect(value) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Sprite status");
  select.dataset.spritesStatusInput = "true";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select status";
  select.append(placeholder);
  SPRITE_STATUSES.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    select.append(option);
  });
  select.value = SPRITE_STATUSES.includes(value) ? value : "";
  return select;
}

function normalizeText(value, fallback = "Unavailable") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function normalizeCategory(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function setActionStatus(value) {
  setText(elements.actionStatus, value);
  setText(elements.validation, value);
}

function formatTimestamp(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "Unavailable";
  }
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    return text;
  }
  return date.toLocaleString();
}

function formatDimensions(sprite) {
  const width = Number(sprite?.width ?? sprite?.dimensions?.width);
  const height = Number(sprite?.height ?? sprite?.dimensions?.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return "Unavailable";
  }
  return `${width} x ${height}`;
}

function formatSource(sprite) {
  return normalizeText(sprite?.sourceName || sprite?.sourcePath || sprite?.storagePath || sprite?.storageKey || sprite?.sourceStorageReference);
}

function previewSourceFor(sprite) {
  const source = String(sprite?.storagePath || sprite?.source || sprite?.sourcePath || sprite?.sourceName || "").trim();
  if (!source || /^https?:\/\//i.test(source)) {
    return "";
  }
  return source;
}

function paletteKeysFor(sprite) {
  if (Array.isArray(sprite?.paletteColorKeys)) {
    return sprite.paletteColorKeys.map((key) => String(key || "").trim()).filter(Boolean);
  }
  if (Array.isArray(sprite?.palette_color_keys)) {
    return sprite.palette_color_keys.map((key) => String(key || "").trim()).filter(Boolean);
  }
  return [];
}

function tagKeysFor(sprite) {
  if (Array.isArray(sprite?.tagKeys)) {
    return sprite.tagKeys.map((key) => String(key || "").trim()).filter(Boolean);
  }
  if (Array.isArray(sprite?.tag_keys)) {
    return sprite.tag_keys.map((key) => String(key || "").trim()).filter(Boolean);
  }
  return [];
}

function usageCountFor(sprite) {
  const count = Number(sprite?.usageCount ?? sprite?.usage_count ?? sprite?.references?.length);
  return Number.isFinite(count) && count >= 0 ? String(count) : "0";
}

function referencesFor(sprite) {
  return Array.isArray(sprite?.references) ? sprite.references : [];
}

function numericUsageCount(sprite) {
  const count = Number(sprite?.usageCount ?? sprite?.usage_count ?? referencesFor(sprite).length);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

function spriteRowsFromPayload(payload) {
  if (Array.isArray(payload?.data?.sprites)) {
    return payload.data.sprites;
  }
  if (Array.isArray(payload?.sprites)) {
    return payload.sprites;
  }
  return [];
}

function uniqueSorted(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
}

function setSelectOptions(select, values, allLabel) {
  if (!select) {
    return;
  }
  const current = select.value;
  const options = [""].concat(values);
  select.replaceChildren(...options.map((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value || allLabel;
    return option;
  }));
  select.value = options.includes(current) ? current : "";
}

function renderFilterOptions(sprites) {
  setSelectOptions(elements.statusFilter, SPRITE_STATUSES, "All statuses");
  setSelectOptions(elements.categoryFilter, uniqueSorted(sprites.map((sprite) => sprite.category)), "All categories");
  setSelectOptions(elements.tagFilter, uniqueSorted(sprites.flatMap(tagKeysFor)), "All tag keys");
}

function filterValues() {
  return {
    category: String(elements.categoryFilter?.value || "").trim(),
    search: String(elements.search?.value || "").trim().toLowerCase(),
    status: String(elements.statusFilter?.value || "").trim(),
    tagKey: String(elements.tagFilter?.value || "").trim(),
  };
}

function spriteMatchesFilters(sprite, filters) {
  if (filters.status && sprite.status !== filters.status) {
    return false;
  }
  if (filters.category && sprite.category !== filters.category) {
    return false;
  }
  if (filters.tagKey && !tagKeysFor(sprite).includes(filters.tagKey)) {
    return false;
  }
  if (!filters.search) {
    return true;
  }
  const haystack = [
    sprite.name,
    sprite.status,
    sprite.category,
    sprite.source,
    sprite.storagePath,
    ...tagKeysFor(sprite),
    ...paletteKeysFor(sprite),
  ].map((value) => String(value || "").toLowerCase()).join(" ");
  return haystack.includes(filters.search);
}

function filteredSprites() {
  const filters = filterValues();
  return currentSprites.filter((sprite) => spriteMatchesFilters(sprite, filters));
}

function renderFilterStatus(visibleCount, totalCount) {
  if (totalCount === 0) {
    setText(elements.filterStatus, "No API-backed Sprites records are available to filter.");
    return;
  }
  const filters = filterValues();
  const activeFilters = Object.values(filters).filter(Boolean).length;
  setText(
    elements.filterStatus,
    activeFilters > 0
      ? `${visibleCount} of ${totalCount} Sprites records match current filters.`
      : `${totalCount} Sprites records available.`
  );
}

function renderLoading() {
  setText(elements.apiStatus, "Loading");
  setText(elements.libraryStatus, "Loading");
  setText(elements.outputStatus, "Loading");
  setText(elements.outputSummary, "Waiting for Sprites API response.");
  setActionStatus("Loading Sprites records.");
  setText(elements.filterStatus, "Filters load with API-backed Sprites records.");
  setText(elements.storageStatus, "Storage import is checking API capabilities.");
  setText(elements.replaceStatus, "Select a sprite to update source metadata through the API.");
  setText(elements.emptyState, "Loading Sprites records.");
  setText(elements.updated, "Checking");
  setHidden(elements.emptyState, false);
  setHidden(elements.errorState, true);
  if (elements.tableBody) {
    const row = document.createElement("tr");
    const cell = createCell("Loading Sprites records.");
    cell.colSpan = 9;
    row.append(cell);
    elements.tableBody.replaceChildren(row);
  }
}

function renderUnavailable(message) {
  const detail = normalizeText(message, "Sprites API unavailable.");
  setText(elements.apiStatus, "Unavailable");
  setText(elements.libraryStatus, "Unavailable");
  setText(elements.outputStatus, "Unavailable");
  setText(elements.outputSummary, detail);
  setActionStatus(detail);
  setText(elements.emptyState, "Sprites records cannot be loaded from the API yet.");
  setText(elements.errorState, detail);
  setText(elements.metadata, "Sprite metadata unavailable until the Sprites API responds.");
  setText(elements.paletteStatus, "Palette/Colors references unavailable until Sprites records load from the API.");
  setText(elements.paletteSelectionStatus, "Palette/Colors selection unavailable until API-backed key records are available.");
  setText(elements.storageStatus, "Storage import unavailable because the Sprites API is not responding.");
  setText(elements.filterStatus, "Filters unavailable until Sprites records load from the API.");
  setText(elements.referenceStatus, "References unavailable until Sprites records load from the API.");
  setText(elements.replaceStatus, "Replace metadata unavailable until the Sprites API responds.");
  renderPreviewPanel(null);
  renderReferencePanel(null);
  setText(elements.updated, new Date().toLocaleTimeString());
  setHidden(elements.emptyState, false);
  setHidden(elements.errorState, false);
  if (elements.tableBody) {
    const row = document.createElement("tr");
    const cell = createCell("Sprites API unavailable.");
    cell.colSpan = 9;
    row.append(cell);
    elements.tableBody.replaceChildren(row);
  }
}

function renderPaletteStatus(sprites) {
  const referencedKeys = new Set();
  sprites.forEach((sprite) => {
    paletteKeysFor(sprite).forEach((key) => referencedKeys.add(key));
  });
  if (referencedKeys.size === 0) {
    setText(elements.paletteStatus, "No Palette/Colors references in current Sprites records.");
    setText(elements.paletteSelectionStatus, "Palette/Colors selection unavailable: no API-backed Palette/Colors key records are attached to Sprites yet.");
    return;
  }
  setText(elements.paletteStatus, `${referencedKeys.size} Palette/Colors key reference${referencedKeys.size === 1 ? "" : "s"} surfaced from API records.`);
  setText(elements.paletteSelectionStatus, "Palette/Colors key references are display-only until the Palette/Colors selection API is available.");
}

function renderPreviewPanel(sprite) {
  if (!elements.previewPanel) {
    return;
  }
  elements.previewPanel.replaceChildren();
  if (!sprite) {
    elements.previewPanel.append(createParagraph("No sprite selected for preview.", "status"));
    setDisabled(elements.duplicate, true);
    setDisabled(elements.replace, true);
    return;
  }
  const source = previewSourceFor(sprite);
  if (source) {
    const image = document.createElement("img");
    image.src = source;
    image.alt = `${normalizeText(sprite.name)} preview`;
    image.loading = "lazy";
    elements.previewPanel.append(image);
  } else {
    elements.previewPanel.append(createParagraph("Image preview unavailable for this sprite source.", "status"));
  }

  const metadata = document.createElement("div");
  metadata.className = "table-wrapper";
  const table = document.createElement("table");
  table.className = "data-table";
  table.setAttribute("aria-label", "Selected sprite metadata");
  const body = document.createElement("tbody");
  [
    ["File/Source", formatSource(sprite)],
    ["MIME/Type", normalizeText(sprite.mimeType ?? sprite.mime_type)],
    ["Dimensions", formatDimensions(sprite)],
    ["File Size", normalizeText(sprite.sizeBytes ?? sprite.size_bytes, "Unavailable")],
    ["Updated At", formatTimestamp(sprite.updatedAt ?? sprite.updated_at)],
    ["Updated By", normalizeText(sprite.updatedBy ?? sprite.updated_by)],
    ["Palette Keys", paletteKeysFor(sprite).join(", ") || "None"],
  ].forEach(([label, value]) => {
    const row = document.createElement("tr");
    row.append(createHeaderCell(label), createCell(value));
    body.append(row);
  });
  table.append(body);
  metadata.append(table);
  elements.previewPanel.append(metadata);
  setDisabled(elements.duplicate, false);
  setDisabled(elements.replace, false);
}

function renderReferencePanel(sprite) {
  if (!elements.referencePanel) {
    return;
  }
  elements.referencePanel.replaceChildren();
  if (!sprite) {
    setText(elements.referenceStatus, "Select a sprite to review API-provided usage references.");
    elements.referencePanel.append(createParagraph("No sprite selected for reference review.", "status"));
    return;
  }
  const references = referencesFor(sprite);
  const usageCount = numericUsageCount(sprite);
  setText(
    elements.referenceStatus,
    usageCount > 0
      ? `${usageCount} usage reference${usageCount === 1 ? "" : "s"} reported by the Sprites API.`
      : "No usage references reported by the Sprites API."
  );
  if (!references.length) {
    elements.referencePanel.append(createParagraph("No references reported yet. Future Objects and Worlds references will appear here when the API supplies them.", "status"));
    return;
  }
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  const table = document.createElement("table");
  table.className = "data-table";
  table.setAttribute("aria-label", "Sprite usage references");
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.append(createCell("Source Type"), createCell("Source Key"), createCell("Label"));
  head.append(headRow);
  const body = document.createElement("tbody");
  references.forEach((reference) => {
    const row = document.createElement("tr");
    row.append(
      createCell(normalizeText(reference.sourceType)),
      createCell(normalizeText(reference.sourceKey)),
      createCell(normalizeText(reference.label, "No label"))
    );
    body.append(row);
  });
  table.append(head, body);
  wrapper.append(table);
  elements.referencePanel.append(wrapper);
}

function selectSprite(sprite) {
  selectedSpriteKey = sprite?.key || "";
  if (!sprite) {
    setText(elements.metadata, "Select a sprite row to review its metadata.");
    renderPreviewPanel(null);
    renderReferencePanel(null);
    return;
  }
  const key = normalizeText(sprite?.key, "Unavailable");
  const mimeType = normalizeText(sprite?.mimeType ?? sprite?.mime_type, "Unavailable");
  const sizeBytes = normalizeText(sprite?.sizeBytes ?? sprite?.size_bytes, "Unavailable");
  setText(elements.metadata, `${normalizeText(sprite?.name)} (${key}) | ${mimeType} | ${formatDimensions(sprite)} | ${sizeBytes} bytes`);
  renderPreviewPanel(sprite);
  renderReferencePanel(sprite);
}

function renderRows(sprites, emptyMessage = "No Sprites records returned by the API.") {
  if (!elements.tableBody) {
    return;
  }
  if (sprites.length === 0) {
    const row = document.createElement("tr");
    const cell = createCell(emptyMessage);
    cell.colSpan = 9;
    row.append(cell);
    elements.tableBody.replaceChildren(...(editingKey === "__new__" ? [createEditRow(), row] : [row]));
    return;
  }

  const rows = [
    ...(editingKey === "__new__" ? [createEditRow()] : []),
    ...sprites.map((sprite) => {
      if (editingKey === sprite.key) {
        return createEditRow(sprite);
      }
      return createSpriteRow(sprite);
    }),
  ];
  elements.tableBody.replaceChildren(...rows);
}

function createEditRow(sprite = null) {
  const row = document.createElement("tr");
  row.dataset.spritesEditingRow = sprite?.key || "__new__";

  const nameCell = document.createElement("td");
  nameCell.append(createInput(sprite?.name || "", "Sprite name", "spritesNameInput"));

  const statusCell = document.createElement("td");
  statusCell.append(createStatusSelect(sprite?.status || ""));

  const categoryCell = document.createElement("td");
  categoryCell.append(createInput(sprite?.category || "", "Sprite category", "spritesCategoryInput"));

  const sourceCell = document.createElement("td");
  sourceCell.append(createInput(sprite?.source || sprite?.sourceName || sprite?.storagePath || "", "Sprite source reference", "spritesSourceInput"));

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "action-group action-group--tight";
  actions.append(
    createButton("Save", "spritesSave", sprite?.key || "__new__", { primary: true }),
    createButton("Cancel", "spritesCancel", sprite?.key || "__new__")
  );
  actionsCell.append(actions);

  row.append(
    nameCell,
    statusCell,
    categoryCell,
    sourceCell,
    createCell(formatDimensions(sprite || {})),
    createCell(sprite ? paletteKeysFor(sprite).join(", ") || "None" : "None"),
    createCell(sprite ? formatTimestamp(sprite.updatedAt ?? sprite.updated_at) : "Server-owned"),
    createCell(sprite ? usageCountFor(sprite) : "0"),
    actionsCell
  );
  return row;
}

function createSpriteRow(sprite) {
    const row = document.createElement("tr");
    const paletteKeys = paletteKeysFor(sprite);
    row.dataset.spritesRowKey = normalizeText(sprite?.key, "");
    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    const usageCount = numericUsageCount(sprite);
    const name = normalizeText(sprite?.name);
    const archived = sprite?.archived === true || sprite?.status === "archived";
    actions.className = "action-group action-group--tight";
    actions.append(
      createButton("Edit", "spritesEdit", sprite?.key || "", { label: `Edit ${name}` }),
      createButton("Duplicate", "spritesDuplicateRow", sprite?.key || "", { label: `Duplicate ${name}` }),
      createButton(archived ? "Archived" : usageCount > 0 ? "Archive Safely" : "Archive", "spritesArchive", sprite?.key || "", {
        disabled: archived,
        label: archived ? `${name} is already archived` : usageCount > 0 ? `Archive safely ${name}` : `Archive ${name}`,
        title: usageCount > 0 ? "Sprite is referenced. Archive is the safe action; destructive delete is blocked." : "",
      }),
      createButton(usageCount > 0 ? "Delete Blocked" : "Delete", "spritesDelete", sprite?.key || "", {
        disabled: usageCount > 0,
        label: usageCount > 0 ? `Delete blocked for ${name}` : `Delete ${name}`,
        title: usageCount > 0 ? "Sprite is referenced. Archive it instead of deleting it." : "",
      })
    );
    actionsCell.append(actions);
    row.append(
      createHeaderCell(normalizeText(sprite?.name)),
      createCell(normalizeText(sprite?.status)),
      createCell(normalizeText(sprite?.category, "None")),
      createCell(formatSource(sprite)),
      createCell(formatDimensions(sprite)),
      createCell(paletteKeys.length ? paletteKeys.join(", ") : "None"),
      createCell(formatTimestamp(sprite?.updatedAt ?? sprite?.updated_at)),
      createCell(usageCountFor(sprite)),
      actionsCell
    );
    row.addEventListener("click", () => {
      selectSprite(sprite);
    });
    return row;
}

function renderSprites(payload) {
  const sprites = spriteRowsFromPayload(payload);
  currentSprites = sprites;
  const count = sprites.length;
  renderFilterOptions(sprites);
  const visibleSprites = filteredSprites();
  setText(elements.apiStatus, "Ready");
  setText(elements.libraryStatus, count > 0 ? "Ready" : "Empty");
  setText(elements.count, String(count));
  setText(elements.outputStatus, count > 0 ? "Ready" : "Empty");
  setText(elements.outputSummary, count > 0 ? `${visibleSprites.length} of ${count} sprite record${count === 1 ? "" : "s"} displayed from the API.` : "Sprites API responded with no records.");
  setText(elements.emptyState, count > 0 ? "" : "No Sprites records returned by the API.");
  setText(elements.updated, new Date().toLocaleTimeString());
  setText(elements.metadata, count > 0 ? "Select a sprite row to review its metadata." : "No sprite metadata available yet.");
  setActionStatus("Ready for API-backed edits.");
  setText(elements.storageStatus, "Binary upload/storage import is not configured for Sprites yet. Existing source and storage metadata can be reviewed and replaced through the API.");
  setText(elements.replaceStatus, "Select a sprite to replace source metadata or duplicate with a server-owned key.");
  selectSprite(sprites.find((sprite) => sprite.key === selectedSpriteKey) || null);
  setHidden(elements.emptyState, count > 0);
  setHidden(elements.errorState, true);
  renderPaletteStatus(sprites);
  renderFilterStatus(visibleSprites.length, count);
  renderRows(
    visibleSprites,
    count > 0 ? "No Sprites records match current filters." : "No Sprites records returned by the API."
  );
}

function bodyFromSprite(sprite, overrides = {}) {
  return {
    category: normalizeCategory(overrides.category ?? sprite?.category),
    height: sprite?.height ?? null,
    mimeType: String(overrides.mimeType ?? sprite?.mimeType ?? "").trim(),
    name: String(overrides.name ?? sprite?.name ?? "").trim(),
    originalName: String(overrides.originalName ?? sprite?.originalName ?? "").trim(),
    paletteColorKeys: paletteKeysFor(sprite),
    sizeBytes: sprite?.sizeBytes ?? null,
    source: String(overrides.source ?? sprite?.source ?? "").trim(),
    status: String(overrides.status ?? sprite?.status ?? "").trim(),
    storagePath: String(overrides.storagePath ?? sprite?.storagePath ?? "").trim(),
    tagKeys: Array.isArray(sprite?.tagKeys) ? sprite.tagKeys : [],
    width: sprite?.width ?? null,
  };
}

function collectEditingValues(row) {
  return {
    category: normalizeCategory(row.querySelector("[data-sprites-category-input]")?.value),
    name: String(row.querySelector("[data-sprites-name-input]")?.value ?? "").trim(),
    source: String(row.querySelector("[data-sprites-source-input]")?.value ?? "").trim(),
    status: String(row.querySelector("[data-sprites-status-input]")?.value ?? "").trim(),
  };
}

function validateSpriteValues(values) {
  const issues = [];
  if (!values.name) {
    issues.push("Sprite name is required.");
  }
  if (!SPRITE_STATUSES.includes(values.status)) {
    issues.push(`Sprite status must be one of: ${SPRITE_STATUSES.join(", ")}.`);
  }
  return issues;
}

function redirectGuestToSignIn() {
  window.location.href = SIGN_IN_PATH;
}

async function readJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function writeSprite(path, body = {}) {
  const response = await fetch(path, {
    body: JSON.stringify(body),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    method: "POST",
  });
  const payload = await readJsonResponse(response);
  if (response.status === 401 || response.status === 403) {
    redirectGuestToSignIn();
    return null;
  }
  if (!response.ok || payload?.ok === false) {
    const message = payload?.error?.message || payload?.error || payload?.message || `Sprites API returned ${response.status}.`;
    throw new Error(message);
  }
  return payload;
}

async function saveEditingRow(row, key) {
  const values = collectEditingValues(row);
  const issues = validateSpriteValues(values);
  if (issues.length) {
    setActionStatus(issues.join(" "));
    return;
  }
  const body = {
    category: values.category,
    name: values.name,
    source: values.source,
    status: values.status,
  };
  try {
    setActionStatus("Saving sprite record.");
    const path = key === "__new__" ? SPRITES_API_PATH : `${SPRITES_API_PATH}/${encodeURIComponent(key)}`;
    const payload = await writeSprite(path, body);
    if (!payload) {
      return;
    }
    editingKey = "";
    setActionStatus("Sprite record saved.");
    await loadSprites();
  } catch (error) {
    setActionStatus(error instanceof Error ? error.message : "Sprite save failed.");
  }
}

async function archiveSprite(key) {
  try {
    setActionStatus("Archiving sprite record.");
    const payload = await writeSprite(`${SPRITES_API_PATH}/${encodeURIComponent(key)}/archive`);
    if (!payload) {
      return;
    }
    setActionStatus("Sprite record archived.");
    await loadSprites();
  } catch (error) {
    setActionStatus(error instanceof Error ? error.message : "Sprite archive failed.");
  }
}

async function deleteSprite(key) {
  const sprite = currentSprites.find((item) => item.key === key);
  if (sprite && numericUsageCount(sprite) > 0) {
    setActionStatus("Sprite is referenced. Archive it instead of deleting it.");
    return;
  }
  try {
    setActionStatus("Deleting sprite record.");
    const payload = await writeSprite(`${SPRITES_API_PATH}/${encodeURIComponent(key)}/delete`);
    if (!payload) {
      return;
    }
    setActionStatus("Sprite record deleted.");
    await loadSprites();
  } catch (error) {
    setActionStatus(error instanceof Error ? error.message : "Sprite delete failed.");
  }
}

async function duplicateSprite(key) {
  const sprite = currentSprites.find((item) => item.key === key);
  if (!sprite) {
    setActionStatus("Select a sprite before duplicating.");
    return;
  }
  try {
    setActionStatus("Duplicating sprite through the API.");
    const payload = await writeSprite(SPRITES_API_PATH, bodyFromSprite(sprite, {
      name: `${normalizeText(sprite.name, "Sprite")} Copy`,
      status: sprite.status || "draft",
    }));
    if (!payload) {
      return;
    }
    selectedSpriteKey = payload?.data?.sprite?.key || "";
    setActionStatus("Sprite duplicated with an API-owned key.");
    await loadSprites();
  } catch (error) {
    setActionStatus(error instanceof Error ? error.message : "Sprite duplicate failed.");
  }
}

async function replaceSpriteMetadata(key) {
  const sprite = currentSprites.find((item) => item.key === key);
  if (!sprite) {
    setActionStatus("Select a sprite before replacing metadata.");
    return;
  }
  try {
    setActionStatus("Replacing sprite source metadata through the API.");
    const payload = await writeSprite(`${SPRITES_API_PATH}/${encodeURIComponent(key)}`, bodyFromSprite(sprite, {
      source: sprite.source || sprite.storagePath || sprite.sourceName || "",
    }));
    if (!payload) {
      return;
    }
    setActionStatus("Sprite source metadata replaced.");
    await loadSprites();
  } catch (error) {
    setActionStatus(error instanceof Error ? error.message : "Sprite replace metadata failed.");
  }
}

async function loadSprites() {
  renderLoading();
  try {
    const response = await fetch(SPRITES_API_PATH, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    if (!response.ok || payload?.ok === false) {
      const message = payload?.error?.message || payload?.message || `Sprites API returned ${response.status}.`;
      renderUnavailable(message);
      return;
    }
    renderSprites(payload || {});
  } catch (error) {
    renderUnavailable(error instanceof Error ? error.message : "Sprites API request failed.");
  }
}

elements.refresh?.addEventListener("click", () => {
  void loadSprites();
});

elements.add?.addEventListener("click", () => {
  editingKey = "__new__";
  renderRows(filteredSprites());
  setActionStatus("New sprite row ready. Name and status are required.");
});

elements.tableBody?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const editKey = target.dataset.spritesEdit;
  const cancelKey = target.dataset.spritesCancel;
  const saveKey = target.dataset.spritesSave;
  const archiveKey = target.dataset.spritesArchive;
  const deleteKey = target.dataset.spritesDelete;
  const duplicateKey = target.dataset.spritesDuplicateRow;
  if (editKey !== undefined) {
    editingKey = editKey;
    renderRows(filteredSprites());
    setActionStatus("Editing sprite row. Name and status are required.");
    return;
  }
  if (cancelKey !== undefined) {
    editingKey = "";
    renderRows(filteredSprites());
    setActionStatus("Sprite edit cancelled.");
    return;
  }
  if (saveKey !== undefined) {
    const row = target.closest("[data-sprites-editing-row]");
    if (row) {
      void saveEditingRow(row, saveKey);
    }
    return;
  }
  if (archiveKey !== undefined) {
    void archiveSprite(archiveKey);
    return;
  }
  if (duplicateKey !== undefined) {
    void duplicateSprite(duplicateKey);
    return;
  }
  if (deleteKey !== undefined) {
    void deleteSprite(deleteKey);
  }
});

elements.duplicate?.addEventListener("click", () => {
  void duplicateSprite(selectedSpriteKey);
});

elements.replace?.addEventListener("click", () => {
  void replaceSpriteMetadata(selectedSpriteKey);
});

[elements.search, elements.statusFilter, elements.categoryFilter, elements.tagFilter].forEach((control) => {
  control?.addEventListener("input", () => {
    editingKey = "";
    const visibleSprites = filteredSprites();
    renderFilterStatus(visibleSprites.length, currentSprites.length);
    renderRows(visibleSprites, "No Sprites records match current filters.");
  });
  control?.addEventListener("change", () => {
    editingKey = "";
    const visibleSprites = filteredSprites();
    renderFilterStatus(visibleSprites.length, currentSprites.length);
    renderRows(visibleSprites, "No Sprites records match current filters.");
  });
});

elements.clearFilters?.addEventListener("click", () => {
  if (elements.search) {
    elements.search.value = "";
  }
  if (elements.statusFilter) {
    elements.statusFilter.value = "";
  }
  if (elements.categoryFilter) {
    elements.categoryFilter.value = "";
  }
  if (elements.tagFilter) {
    elements.tagFilter.value = "";
  }
  const visibleSprites = filteredSprites();
  renderFilterStatus(visibleSprites.length, currentSprites.length);
  renderRows(visibleSprites);
});

void loadSprites();
