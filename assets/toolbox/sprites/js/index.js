const SPRITES_API_PATH = "/api/sprites/records";

const elements = {
  apiStatus: document.querySelector("[data-sprites-api-status]"),
  count: document.querySelector("[data-sprites-count]"),
  emptyState: document.querySelector("[data-sprites-empty-state]"),
  errorState: document.querySelector("[data-sprites-error-state]"),
  libraryStatus: document.querySelector("[data-sprites-library-status]"),
  metadata: document.querySelector("[data-sprites-metadata]"),
  outputStatus: document.querySelector("[data-sprites-output-status]"),
  outputSummary: document.querySelector("[data-sprites-output-summary]"),
  paletteStatus: document.querySelector("[data-sprites-palette-status]"),
  refresh: document.querySelector("[data-sprites-refresh]"),
  tableBody: document.querySelector("[data-sprites-table-body]"),
  updated: document.querySelector("[data-sprites-updated]"),
};

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

function createCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  return cell;
}

function createHeaderCell(value) {
  const cell = document.createElement("th");
  cell.scope = "row";
  cell.textContent = value;
  return cell;
}

function normalizeText(value, fallback = "Unavailable") {
  const text = String(value ?? "").trim();
  return text || fallback;
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

function paletteKeysFor(sprite) {
  if (Array.isArray(sprite?.paletteColorKeys)) {
    return sprite.paletteColorKeys.map((key) => String(key || "").trim()).filter(Boolean);
  }
  if (Array.isArray(sprite?.palette_color_keys)) {
    return sprite.palette_color_keys.map((key) => String(key || "").trim()).filter(Boolean);
  }
  return [];
}

function usageCountFor(sprite) {
  const count = Number(sprite?.usageCount ?? sprite?.usage_count ?? sprite?.references?.length);
  return Number.isFinite(count) && count >= 0 ? String(count) : "0";
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

function renderLoading() {
  setText(elements.apiStatus, "Loading");
  setText(elements.libraryStatus, "Loading");
  setText(elements.outputStatus, "Loading");
  setText(elements.outputSummary, "Waiting for Sprites API response.");
  setText(elements.emptyState, "Loading Sprites records.");
  setText(elements.updated, "Checking");
  setHidden(elements.emptyState, false);
  setHidden(elements.errorState, true);
  if (elements.tableBody) {
    const row = document.createElement("tr");
    const cell = createCell("Loading Sprites records.");
    cell.colSpan = 8;
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
  setText(elements.emptyState, "Sprites records cannot be loaded from the API yet.");
  setText(elements.errorState, detail);
  setText(elements.metadata, "Sprite metadata unavailable until the Sprites API responds.");
  setText(elements.paletteStatus, "Palette/Colors references unavailable until Sprites records load from the API.");
  setText(elements.updated, new Date().toLocaleTimeString());
  setHidden(elements.emptyState, false);
  setHidden(elements.errorState, false);
  if (elements.tableBody) {
    const row = document.createElement("tr");
    const cell = createCell("Sprites API unavailable.");
    cell.colSpan = 8;
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
    return;
  }
  setText(elements.paletteStatus, `${referencedKeys.size} Palette/Colors key reference${referencedKeys.size === 1 ? "" : "s"} surfaced from API records.`);
}

function renderRows(sprites) {
  if (!elements.tableBody) {
    return;
  }
  if (sprites.length === 0) {
    const row = document.createElement("tr");
    const cell = createCell("No Sprites records returned by the API.");
    cell.colSpan = 8;
    row.append(cell);
    elements.tableBody.replaceChildren(row);
    return;
  }

  const rows = sprites.map((sprite) => {
    const row = document.createElement("tr");
    const paletteKeys = paletteKeysFor(sprite);
    row.dataset.spritesRowKey = normalizeText(sprite?.key, "");
    row.append(
      createHeaderCell(normalizeText(sprite?.name)),
      createCell(normalizeText(sprite?.status)),
      createCell(normalizeText(sprite?.category, "None")),
      createCell(formatSource(sprite)),
      createCell(formatDimensions(sprite)),
      createCell(paletteKeys.length ? paletteKeys.join(", ") : "None"),
      createCell(formatTimestamp(sprite?.updatedAt ?? sprite?.updated_at)),
      createCell(usageCountFor(sprite))
    );
    row.addEventListener("click", () => {
      const key = normalizeText(sprite?.key, "Unavailable");
      const mimeType = normalizeText(sprite?.mimeType ?? sprite?.mime_type, "Unavailable");
      const sizeBytes = normalizeText(sprite?.sizeBytes ?? sprite?.size_bytes, "Unavailable");
      setText(elements.metadata, `${normalizeText(sprite?.name)} (${key}) | ${mimeType} | ${formatDimensions(sprite)} | ${sizeBytes} bytes`);
    });
    return row;
  });
  elements.tableBody.replaceChildren(...rows);
}

function renderSprites(payload) {
  const sprites = spriteRowsFromPayload(payload);
  const count = sprites.length;
  setText(elements.apiStatus, "Ready");
  setText(elements.libraryStatus, count > 0 ? "Ready" : "Empty");
  setText(elements.count, String(count));
  setText(elements.outputStatus, count > 0 ? "Ready" : "Empty");
  setText(elements.outputSummary, count > 0 ? `${count} sprite record${count === 1 ? "" : "s"} loaded from the API.` : "Sprites API responded with no records.");
  setText(elements.emptyState, count > 0 ? "" : "No Sprites records returned by the API.");
  setText(elements.updated, new Date().toLocaleTimeString());
  setText(elements.metadata, count > 0 ? "Select a sprite row to review its metadata." : "No sprite metadata available yet.");
  setHidden(elements.emptyState, count > 0);
  setHidden(elements.errorState, true);
  renderPaletteStatus(sprites);
  renderRows(sprites);
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

void loadSprites();
