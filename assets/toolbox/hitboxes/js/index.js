import { createServerRepositoryClient } from "../../../../src/api/server-api-client.js";

const EMPTY_STATE = "Create an Object and assign a sprite or vector before editing hitboxes.";
const DEFAULT_BOUNDS = Object.freeze({ height: 64, width: 64, x: 0, y: 0 });
const DEFAULT_ORIGIN = Object.freeze({ x: 0, y: 0 });

const elements = {
  boundingBox: document.querySelector("[data-hitboxes-bounding-box]"),
  list: document.querySelector("[data-hitboxes-object-list]"),
  log: document.querySelector("[data-hitboxes-log]"),
  metaBounds: document.querySelector("[data-hitboxes-meta-bounds]"),
  metaKey: document.querySelector("[data-hitboxes-meta-key]"),
  metaName: document.querySelector("[data-hitboxes-meta-name]"),
  metaOrigin: document.querySelector("[data-hitboxes-meta-origin]"),
  metaVisual: document.querySelector("[data-hitboxes-meta-visual]"),
  objectCount: document.querySelector("[data-hitboxes-object-count]"),
  originMarker: document.querySelector("[data-hitboxes-origin-marker]"),
  previewFallback: document.querySelector("[data-hitboxes-preview-fallback]"),
  previewFrame: document.querySelector("[data-hitboxes-preview-frame]"),
  previewImage: document.querySelector("[data-hitboxes-preview-image]"),
  previewSummary: document.querySelector("[data-hitboxes-preview-summary]"),
  previewTitle: document.querySelector("[data-hitboxes-preview-title]"),
  selectedKey: document.querySelector("[data-hitboxes-selected-key]"),
  sourceStatus: document.querySelector("[data-hitboxes-source-status]"),
  visualType: document.querySelector("[data-hitboxes-visual-type]"),
};

const objectsRepository = createServerRepositoryClient("objects");
const state = {
  eligibleObjects: [],
  selectedKey: "",
};

function normalizeText(value) {
  return String(value || "").trim();
}

function objectKey(object = {}) {
  return normalizeText(object.id || object.key || object.objectKey || object.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function finiteNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function normalizeBounds(source = {}) {
  const bounds = source.bounds && typeof source.bounds === "object" ? source.bounds : {};
  const size = source.size && typeof source.size === "object" ? source.size : {};
  return Object.freeze({
    height: Math.max(1, finiteNumber(bounds.height ?? size.height, DEFAULT_BOUNDS.height)),
    width: Math.max(1, finiteNumber(bounds.width ?? size.width, DEFAULT_BOUNDS.width)),
    x: finiteNumber(bounds.x ?? source.x, DEFAULT_BOUNDS.x),
    y: finiteNumber(bounds.y ?? source.y, DEFAULT_BOUNDS.y),
  });
}

function normalizeOrigin(source = {}) {
  const origin = source.origin && typeof source.origin === "object"
    ? source.origin
    : source.objectOrigin && typeof source.objectOrigin === "object"
      ? source.objectOrigin
      : DEFAULT_ORIGIN;
  return Object.freeze({
    x: finiteNumber(origin.x, DEFAULT_ORIGIN.x),
    y: finiteNumber(origin.y, DEFAULT_ORIGIN.y),
  });
}

function visualMetadataForObject(object = {}) {
  const render = object.render && typeof object.render === "object" ? object.render : {};
  const assignedVisual = object.assignedVisualAsset && typeof object.assignedVisualAsset === "object" ? object.assignedVisualAsset : {};
  const visualAsset = object.visualAsset && typeof object.visualAsset === "object" ? object.visualAsset : {};
  const candidates = [render, assignedVisual, visualAsset, object];
  const assetKey = candidates.map((candidate) => normalizeText(candidate.assetKey || candidate.assetId || candidate.id)).find(Boolean) || "";
  const previewPath = candidates.map((candidate) => normalizeText(candidate.previewPath || candidate.path || candidate.storedPath || candidate.imagePath)).find(Boolean) || "";
  const type = candidates.map((candidate) => normalizeText(candidate.type || candidate.assetType || candidate.kind)).find(Boolean) || "";
  const label = candidates.map((candidate) => normalizeText(candidate.label || candidate.name || candidate.assetName)).find(Boolean) || assetKey;

  if (!assetKey && !previewPath) {
    return null;
  }

  return Object.freeze({
    assetKey,
    label: label || assetKey || "Assigned visual asset",
    previewPath,
    type: type || "Asset",
  });
}

function eligibleObjectFromSource(object = {}) {
  const visual = visualMetadataForObject(object);
  if (!visual) {
    return null;
  }
  const key = objectKey(object);
  if (!key) {
    return null;
  }
  return Object.freeze({
    bounds: normalizeBounds(object),
    key,
    name: normalizeText(object.name) || key,
    origin: normalizeOrigin(object),
    source: Object.freeze({ ...object }),
    visual,
  });
}

function tableMessage(text) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 3;
  cell.textContent = text;
  row.append(cell);
  return row;
}

function tableCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function visualLabel(visual) {
  const type = normalizeText(visual.type);
  const label = normalizeText(visual.label);
  const key = normalizeText(visual.assetKey);
  return `${label || key || "Assigned visual"}${type ? ` / ${type}` : ""}`;
}

function sourceButton(object) {
  const button = document.createElement("button");
  button.className = object.key === state.selectedKey ? "btn btn--compact primary" : "btn btn--compact";
  button.type = "button";
  button.dataset.hitboxesSelectObject = object.key;
  button.textContent = object.name;
  return button;
}

function objectRow(object) {
  const row = document.createElement("tr");
  row.dataset.hitboxesObjectRow = object.key;
  const nameCell = document.createElement("th");
  nameCell.scope = "row";
  nameCell.append(sourceButton(object));
  row.append(nameCell, tableCell(object.key), tableCell(visualLabel(object.visual)));
  return row;
}

function previewImageUrl(visual) {
  const path = normalizeText(visual.previewPath);
  if (!path) {
    return "";
  }
  if (/^(https?:|data:|blob:|\/)/i.test(path)) {
    return path;
  }
  return `/api/storage/project-assets/read?key=${encodeURIComponent(path)}`;
}

function boundsText(bounds) {
  return `${bounds.width}x${bounds.height} at ${bounds.x},${bounds.y}`;
}

function originText(origin) {
  return `${origin.x},${origin.y}`;
}

function selectedObject() {
  return state.eligibleObjects.find((object) => object.key === state.selectedKey) || null;
}

function renderList() {
  if (!elements.list) {
    return;
  }
  if (!state.eligibleObjects.length) {
    elements.list.replaceChildren(tableMessage(EMPTY_STATE));
    return;
  }
  elements.list.replaceChildren(...state.eligibleObjects.map(objectRow));
}

function renderSelectedObject() {
  const object = selectedObject();
  setText(elements.objectCount, String(state.eligibleObjects.length));

  if (!object) {
    setText(elements.selectedKey, "None");
    setText(elements.visualType, "None");
    setText(elements.previewTitle, "No Object selected");
    setText(elements.previewSummary, state.eligibleObjects.length ? "Select an Object with assigned visual metadata to prepare hitbox editing." : EMPTY_STATE);
    setText(elements.previewFallback, state.eligibleObjects.length ? "Select an Object to preview assigned visual metadata." : EMPTY_STATE);
    setText(elements.boundingBox, "Bounding box: none");
    setText(elements.originMarker, "Origin: none");
    setText(elements.metaName, "None");
    setText(elements.metaKey, "None");
    setText(elements.metaVisual, "None");
    setText(elements.metaBounds, "None");
    setText(elements.metaOrigin, "None");
    setText(elements.log, state.eligibleObjects.length ? "Select Object A." : EMPTY_STATE);
    if (elements.previewImage) {
      elements.previewImage.hidden = true;
      elements.previewImage.removeAttribute("src");
    }
    return;
  }

  const imageUrl = previewImageUrl(object.visual);
  setText(elements.selectedKey, object.key);
  setText(elements.visualType, object.visual.type);
  setText(elements.previewTitle, object.name);
  setText(elements.previewSummary, `Object A uses ${visualLabel(object.visual)} from the Objects service contract.`);
  setText(elements.previewFallback, `Assigned visual metadata exists for ${object.name}; rendering is pending if no image appears.`);
  setText(elements.boundingBox, `Bounding box: ${boundsText(object.bounds)}`);
  setText(elements.originMarker, `Origin: ${originText(object.origin)}`);
  setText(elements.metaName, object.name);
  setText(elements.metaKey, object.key);
  setText(elements.metaVisual, visualLabel(object.visual));
  setText(elements.metaBounds, boundsText(object.bounds));
  setText(elements.metaOrigin, originText(object.origin));
  setText(elements.log, `Selected Object A: ${object.name}.`);

  if (elements.previewImage) {
    if (imageUrl) {
      elements.previewImage.alt = `${object.name} assigned visual preview`;
      elements.previewImage.src = imageUrl;
      elements.previewImage.hidden = false;
    } else {
      elements.previewImage.hidden = true;
      elements.previewImage.removeAttribute("src");
    }
  }
}

function render() {
  setText(elements.sourceStatus, state.eligibleObjects.length ? "Objects loaded from Local API." : EMPTY_STATE);
  renderList();
  renderSelectedObject();
}

function loadObjects() {
  const result = objectsRepository.listObjects();
  if (!Array.isArray(result)) {
    const message = result?.message || result?.validation?.findings?.[0]?.action || "Objects service is unavailable.";
    state.eligibleObjects = [];
    state.selectedKey = "";
    render();
    setText(elements.sourceStatus, message);
    setText(elements.log, message);
    return;
  }

  state.eligibleObjects = result.map(eligibleObjectFromSource).filter(Boolean);
  const params = new URLSearchParams(window.location.search);
  const requestedKey = normalizeText(params.get("objectKey"));
  state.selectedKey = state.eligibleObjects.some((object) => object.key === requestedKey)
    ? requestedKey
    : state.eligibleObjects[0]?.key || "";
  render();
}

elements.list?.addEventListener("click", (event) => {
  const button = event.target instanceof HTMLElement ? event.target.closest("[data-hitboxes-select-object]") : null;
  if (!button) {
    return;
  }
  state.selectedKey = button.dataset.hitboxesSelectObject || "";
  render();
});

elements.previewImage?.addEventListener("error", () => {
  const object = selectedObject();
  if (!object || !elements.previewImage) {
    return;
  }
  elements.previewImage.hidden = true;
  elements.previewImage.removeAttribute("src");
  setText(elements.previewFallback, `Assigned visual metadata exists for ${object.name}; rendering is pending for ${object.visual.previewPath || object.visual.assetKey}.`);
});

loadObjects();
