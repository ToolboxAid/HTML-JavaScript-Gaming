import {
  OBJECT_MODEL_TRAIT_LIST,
  getObjectModelTrait,
  getObjectModelType,
  validateObjectDefinition,
} from "../../src/engine/object-model/index.js";
import { createAssetToolApiRepository } from "../assets/assets-api-client.js";
import { createObjectsToolApiRepository } from "./objects-api-client.js";

const CAPABILITY_LABELS = Object.freeze({
  collectible: "Can Be Collected",
  collides: "Can Collide",
  damageable: "Takes Damage",
  goal: "Completes Goal",
  hazard: "Causes Damage",
  killable: "Can Be Removed",
  movable: "Can Move",
  playerControlled: "Player Controlled",
  scores: "Scores Points",
});

const OBJECT_TYPE_TEMPLATES = Object.freeze([
  Object.freeze({
    capabilities: Object.freeze(["collectible", "scores"]),
    modelType: "Collectible",
    renderType: "Sprite",
    state: "Active",
    type: "Collectible",
  }),
  Object.freeze({
    capabilities: Object.freeze([]),
    modelType: "Static",
    renderType: "None",
    state: "Active",
    type: "Custom",
  }),
  Object.freeze({
    capabilities: Object.freeze([]),
    modelType: "Static",
    renderType: "Sprite",
    state: "Idle",
    type: "Decoration",
  }),
  Object.freeze({
    capabilities: Object.freeze(["movable", "collides", "hazard", "damageable"]),
    modelType: "Dynamic",
    renderType: "Sprite",
    state: "Active",
    type: "Enemy",
  }),
  Object.freeze({
    capabilities: Object.freeze(["goal", "scores"]),
    modelType: "Goal",
    renderType: "Sprite",
    state: "Active",
    type: "Goal",
  }),
  Object.freeze({
    capabilities: Object.freeze(["hazard", "damageable"]),
    modelType: "Hazard",
    renderType: "Sprite",
    state: "Active",
    type: "Hazard",
  }),
  Object.freeze({
    capabilities: Object.freeze(["playerControlled", "movable", "collides", "damageable"]),
    modelType: "Dynamic",
    renderType: "Sprite",
    state: "Active",
    type: "Hero",
  }),
  Object.freeze({
    capabilities: Object.freeze(["collides"]),
    modelType: "Static",
    renderType: "None",
    state: "Active",
    type: "Platform",
  }),
  Object.freeze({
    capabilities: Object.freeze(["movable", "collides", "hazard"]),
    modelType: "Dynamic",
    renderType: "Sprite",
    state: "Active",
    type: "Projectile",
  }),
  Object.freeze({
    capabilities: Object.freeze([]),
    modelType: "Static",
    renderType: "None",
    state: "Active",
    type: "Spawn Point",
  }),
  Object.freeze({
    capabilities: Object.freeze(["collides"]),
    modelType: "Static",
    renderType: "None",
    state: "Active",
    type: "Wall",
  }),
]);

const STARTER_OBJECTS = Object.freeze([
  Object.freeze({
    behavior: "Responds to player control mapping.",
    interaction: "Can interact with platforms, collectibles, hazards, and goals.",
    name: "Hero",
    render: Object.freeze({ type: "None" }),
    role: "Hero",
    state: "Active",
  }),
  Object.freeze({
    behavior: "Moves through the scene under authored behavior.",
    interaction: "Can collide with walls, platforms, or targets.",
    name: "Projectile",
    render: Object.freeze({ type: "None" }),
    role: "Projectile",
    state: "Active",
  }),
  Object.freeze({
    behavior: "Stays fixed in the scene.",
    interaction: "Provides a stable collision surface.",
    name: "Wall",
    render: Object.freeze({ type: "None" }),
    role: "Wall",
    state: "Active",
  }),
]);

let assetRepository = createAssetToolApiRepository();
let objectsRepository = createObjectsToolApiRepository();
let draftedObjects = [];
let editingRow = null;
let storageIssue = null;

const elements = {
  addRow: document.querySelector("[data-objects-add-row]"),
  assetStatus: document.querySelector("[data-objects-asset-status]"),
  count: document.querySelector("[data-objects-count]"),
  editSprite: document.querySelector("[data-objects-edit-sprite]"),
  list: document.querySelector("[data-objects-list]"),
  log: document.querySelector("[data-objects-log]"),
  outputCount: document.querySelector("[data-objects-output-count]"),
  outputReadiness: document.querySelector("[data-objects-output-readiness]"),
  outputRenderAsset: document.querySelector("[data-objects-output-render-asset]"),
  outputSetup: document.querySelector("[data-objects-output-setup]"),
  outputSpritePreview: document.querySelector("[data-objects-output-sprite-preview]"),
  readiness: document.querySelector("[data-objects-readiness]"),
  resetTable: document.querySelector("[data-objects-reset-table]"),
  capabilityBasics: document.querySelector("[data-objects-capability-basics]"),
  seedStarter: document.querySelector("[data-objects-seed-starter]"),
  templateCatalog: document.querySelector("[data-objects-template-catalog]"),
  templateSelect: document.querySelector("[data-objects-template-select]"),
  typeBasics: document.querySelector("[data-objects-type-basics]"),
  validate: document.querySelector("[data-objects-validate]"),
  validationList: document.querySelector("[data-objects-validation-list]"),
  validationOverlay: document.querySelector("[data-objects-validation-overlay]"),
};

function normalizeText(value) {
  return String(value || "").trim();
}

function objectKeyFromText(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function objectId(object) {
  return objectKeyFromText(object.id || object.name);
}

function normalizeRenderConfig(source = {}) {
  const render = source.render && typeof source.render === "object" ? source.render : {};
  const renderType = normalizeText(render.type) === "Sprite" ? "Sprite" : "None";
  if (renderType !== "Sprite") {
    return Object.freeze({ type: "None" });
  }

  return Object.freeze({
    assetKey: normalizeText(render.assetKey),
    previewPath: normalizeText(render.previewPath),
    type: "Sprite",
  });
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function listItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function tableCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function actionButton(text, dataName, value = "", className = "btn btn--compact") {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.textContent = text;
  button.dataset[dataName] = value;
  return button;
}

function actionLink(text, href, dataName, value = "", className = "btn btn--compact") {
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.textContent = text;
  if (dataName) {
    link.dataset[dataName] = value;
  }
  return link;
}

function optionElement(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

function selectElement({ ariaLabel, options, placeholder, selectedValue }) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", ariaLabel);
  if (placeholder) {
    select.append(optionElement("", placeholder));
  }
  options.forEach((option) => {
    select.append(optionElement(option.value, option.label));
  });
  select.value = selectedValue || "";
  return select;
}

function textInput({ ariaLabel, value }) {
  const input = document.createElement("input");
  input.setAttribute("aria-label", ariaLabel);
  input.type = "text";
  input.value = value || "";
  return input;
}

function controlCell(control) {
  const cell = document.createElement("td");
  cell.append(control);
  return cell;
}

function actionCell(actions) {
  const cell = document.createElement("td");
  const group = document.createElement("div");
  group.className = "action-group action-group--tight";
  group.append(...actions);
  cell.append(group);
  return cell;
}

function sortedCapabilities() {
  return [...OBJECT_MODEL_TRAIT_LIST].sort((left, right) => left.id.localeCompare(right.id));
}

function typeOptions() {
  return OBJECT_TYPE_TEMPLATES.map((template) => ({ label: template.type, value: template.type }));
}

function templateForType(type) {
  return OBJECT_TYPE_TEMPLATES.find((template) => template.type === type) || null;
}

function selectedTemplate() {
  return templateForType(elements.templateSelect?.value || "");
}

function templateSource(template) {
  if (!template) {
    return {};
  }
  return {
    render: { type: template.renderType },
    role: template.type,
    state: template.state,
    traits: template.capabilities,
  };
}

function modelTypeForSetupType(setupType) {
  const objectType = templateForType(setupType)?.modelType || "";
  return getObjectModelType(objectType) ? objectType : "";
}

function traitIdsFromSource(source) {
  return Array.isArray(source.traits)
    ? source.traits.map(normalizeText).filter(Boolean)
    : [];
}

function traitsForObject(source, object) {
  const traitIds = new Set();
  const objectType = getObjectModelType(object.type);

  (objectType?.traits || []).forEach((traitId) => traitIds.add(traitId));
  (templateForType(object.role)?.capabilities || []).forEach((traitId) => traitIds.add(traitId));
  traitIdsFromSource(source).forEach((traitId) => traitIds.add(traitId));

  return Object.freeze([...traitIds]);
}

function cloneObject(source = {}) {
  const role = normalizeText(source.role);
  const object = {
    behavior: normalizeText(source.behavior),
    id: objectKeyFromText(source.id || source.name),
    interaction: normalizeText(source.interaction),
    name: normalizeText(source.name),
    render: normalizeRenderConfig(source),
    role,
    state: normalizeText(source.state) || "Active",
    type: modelTypeForSetupType(role) || normalizeText(source.type),
  };

  return {
    ...object,
    traits: traitsForObject(source, object),
  };
}

function defaultEditingValues(source = {}) {
  return {
    assetKey: normalizeText(source.render?.assetKey),
    capabilities: traitIdsFromSource(source),
    id: objectId(source),
    name: normalizeText(source.name),
    previewPath: normalizeText(source.render?.previewPath),
    renderType: normalizeText(source.render?.type) || "None",
    role: normalizeText(source.role),
    state: normalizeText(source.state) || "Active",
  };
}

function issueLabel(issue) {
  if (issue.path.endsWith(".name")) {
    return "Object Name";
  }
  if (issue.path.endsWith(".type")) {
    return "Type";
  }
  if (issue.path.includes(".traits")) {
    return "Capabilities";
  }
  if (issue.path.includes(".render")) {
    return "Render Asset";
  }
  if (issue.path.endsWith(".state")) {
    return "Initial State";
  }
  return "Object Definition";
}

function objectDefinitionFindings(object, labelPrefix) {
  return validateObjectDefinition(object).issues
    .filter((issue) => !(issue.path.endsWith(".type") && !object.role))
    .map((issue) => ({
      action: issue.path.endsWith(".type")
        ? "Choose a type so Objects can finish setup."
        : issue.action,
      label: labelPrefix ? `${labelPrefix} ${issueLabel(issue)}` : issueLabel(issue),
    }));
}

function definitionForReadiness(object, { allowPendingSprite = false } = {}) {
  if (object.render?.type !== "Sprite" || object.render.assetKey) {
    return object;
  }
  if (!allowPendingSprite) {
    return object;
  }
  return {
    ...object,
    render: Object.freeze({ type: "None" }),
  };
}

function rowFindings(object, ignoreObjectId = "", options = {}) {
  const findings = objectDefinitionFindings(definitionForReadiness(object, options), "");
  if (!object.role) {
    findings.push({
      action: "Choose the type this object uses.",
      label: "Type",
    });
  }
  if (object.name && draftedObjects.some((savedObject) => objectId(savedObject) === objectId(object) && objectId(savedObject) !== ignoreObjectId)) {
    findings.push({
      action: "Use a unique object name or remove the existing row first.",
      label: "Duplicate Object",
    });
  }
  return findings;
}

function objectListFindings(objects) {
  const findings = [];
  const seenIds = new Set();

  objects.forEach((object, index) => {
    const label = object.name || `Object ${index + 1}`;
    objectDefinitionFindings(definitionForReadiness(object), label).forEach((finding) => {
      findings.push(finding);
    });
    if (!object.role) {
      findings.push({
        action: `${label} needs a type.`,
        label: `${label} Type`,
      });
    }
    const id = objectId(object);
    if (!id) {
      findings.push({
        action: `Object ${index + 1} needs a name.`,
        label: `Object ${index + 1} Name`,
      });
    } else if (seenIds.has(id)) {
      findings.push({
        action: `${label} duplicates another object name.`,
        label: `${label} Duplicate`,
      });
    }
    seenIds.add(id);
  });

  return findings;
}

function missingRenderAssetCount(objects) {
  return objects.filter((object) => object.render?.type === "Sprite" && !object.render.assetKey).length;
}

function spriteObjectCount(objects) {
  return objects.filter((object) => object.render?.type === "Sprite").length;
}

function objectStatusLabel(objects, findings) {
  if (objects.length === 0) {
    return "Not Configured";
  }
  if (objects.some((object) => objectGapLabels(object).length > 0) || missingRenderAssetCount(objects) > 0 || findings.length > 0) {
    return "Pending Setup";
  }
  return "Complete";
}

function renderValidation(findings) {
  if (!elements.validationList || !elements.validationOverlay) {
    return;
  }

  elements.validationList.replaceChildren();

  if (findings.length === 0) {
    elements.validationList.append(listItem("PASS: Object details are valid."));
    elements.validationOverlay.hidden = true;
    return;
  }

  findings.forEach((finding) => {
    elements.validationList.append(listItem(`${finding.label}: ${finding.action}`));
  });
  elements.validationOverlay.hidden = false;
}

function capabilityLabel(traitId) {
  const trait = getObjectModelTrait(traitId);
  return CAPABILITY_LABELS[traitId] || trait?.label || traitId;
}

function capabilityText(traitIds) {
  if (!traitIds.length) {
    return "None";
  }
  return traitIds.map(capabilityLabel).join(", ");
}

function capabilityIdsFromRow(row) {
  return normalizeText(row.dataset.objectsCapabilityIds)
    .split(",")
    .map(normalizeText)
    .filter(Boolean);
}

function setRowCapabilities(row, capabilityIds) {
  row.dataset.objectsCapabilityIds = capabilityIds.join(",");
  const preview = row.querySelector("[data-objects-row-capabilities-preview]");
  if (preview) {
    preview.textContent = capabilityText(capabilityIds);
  }
}

function renderAssetText(object) {
  if (object.render?.type !== "Sprite") {
    return "None";
  }
  return renderAssetDisplayForKey(object.render.assetKey);
}

function linkedSpriteObject(objects) {
  return objects.find((object) => object.render?.type === "Sprite" && object.render.assetKey) || null;
}

function spriteEditorHref(object) {
  const linkedAsset = linkedSpriteAsset(object.render.assetKey);
  const assetKey = encodeURIComponent(normalizeText(linkedAsset?.id) || object.render.assetKey);
  const objectKey = encodeURIComponent(objectId(object));
  return `/toolbox/sprites/index.html?assetKey=${assetKey}&objectKey=${objectKey}&sourceTool=objects`;
}

function hitboxesHref(object) {
  const objectKey = encodeURIComponent(objectId(object));
  return `/toolbox/hitboxes/index.html?objectKey=${objectKey}&sourceTool=objects`;
}

function eventsHref(object) {
  const objectKey = encodeURIComponent(objectId(object));
  return `/toolbox/events/index.html?objectKey=${objectKey}&sourceTool=objects`;
}

function objectGapLabels(object) {
  const gaps = [];
  if (object.render?.type === "Sprite" && !object.render.assetKey) {
    gaps.push("Missing Render Asset");
  }
  if (objectId(object)) {
    gaps.push("Missing Hitbox", "Missing Events");
  }
  return gaps;
}

function rowConfigurationActions(object) {
  const id = objectId(object);
  if (!id) {
    return [];
  }
  const links = [];
  if (object.render?.type === "Sprite" && object.render.assetKey) {
    const editSprite = actionLink("Edit Sprite", spriteEditorHref(object), "objectsRowEditSprite", id, "btn btn--compact cyan");
    editSprite.title = "Sprite asset ready.";
    links.push(editSprite);
  }
  const openHitboxes = actionLink("Open Hitboxes", hitboxesHref(object), "objectsRowOpenHitboxes", id, "btn btn--compact primary");
  const openEvents = actionLink("Open Events", eventsHref(object), "objectsRowOpenEvents", id, "btn btn--compact primary");
  openHitboxes.title = "Missing Hitbox.";
  openEvents.title = "Missing Events. Events configure when object behavior happens.";
  links.push(openHitboxes, openEvents);
  return links;
}

function assetLinkMessage(result, fallback) {
  const legacyLinkTerm = new RegExp(["hand", "off"].join(""), "gi");
  return normalizeText(result?.message || fallback).replace(legacyLinkTerm, "link");
}

function listAssetRecords() {
  let assets = assetRepository.listAssets();
  if (Array.isArray(assets)) {
    if (assets.length) {
      return assets;
    }
  } else if (assets?.error) {
    assetRepository = createAssetToolApiRepository();
    assets = assetRepository.listAssets();
    if (Array.isArray(assets) && assets.length) {
      return assets;
    }
  }

  let tables = assetRepository.getTables();
  if (tables?.error) {
    assetRepository = createAssetToolApiRepository();
    tables = assetRepository.getTables();
  }
  return Array.isArray(tables?.asset_library_items) ? tables.asset_library_items : [];
}

function linkedSpriteAsset(assetKey) {
  const key = normalizeText(assetKey);
  if (!key) {
    return null;
  }
  return listAssetRecords().find((asset) => asset.id === key) || null;
}

function assetDisplayText(asset, fallbackKey = "") {
  const key = normalizeText(asset?.id || fallbackKey);
  const name = normalizeText(asset?.name);
  if (key && name && name !== key) {
    return `${name} (${key})`;
  }
  return name || key || "Sprite asset missing";
}

function renderAssetDisplayForKey(assetKey) {
  const key = normalizeText(assetKey);
  if (!key) {
    return "Sprite asset missing";
  }
  const linkedAsset = linkedSpriteAsset(key);
  return assetDisplayText(linkedAsset, key);
}

function linkedSpritePreviewPath(object, linkedAsset) {
  return normalizeText(linkedAsset?.storedPath || linkedAsset?.path || object?.render?.previewPath);
}

function ensureSpriteAssetForObject(input) {
  let result = assetRepository.ensureSpriteAssetForObject(input);
  if (result?.error) {
    assetRepository = createAssetToolApiRepository();
    result = assetRepository.ensureSpriteAssetForObject(input);
  }
  return result;
}

function objectStorageFinding(result) {
  const finding = Array.isArray(result?.validation?.findings)
    ? result.validation.findings[0]
    : null;
  if (finding) {
    return {
      action: normalizeText(finding.action || result.message),
      label: normalizeText(finding.label) || "Object Storage",
    };
  }
  return {
    action: normalizeText(result?.message) || "Start the local server API so Objects can save through the shared data adapter.",
    label: "Object Storage",
  };
}

function readPersistedObjects() {
  let result = objectsRepository.listObjects();
  if (Array.isArray(result)) {
    storageIssue = null;
    return result.map(cloneObject);
  }
  if (result?.error) {
    objectsRepository = createObjectsToolApiRepository();
    result = objectsRepository.listObjects();
    if (Array.isArray(result)) {
      storageIssue = null;
      return result.map(cloneObject);
    }
  }
  storageIssue = objectStorageFinding(result);
  renderValidation([storageIssue]);
  setText(elements.log, storageIssue.action);
  return null;
}

function persistDraftedObjects(nextObjects) {
  const normalizedObjects = nextObjects.map(cloneObject);
  let result = objectsRepository.replaceObjects(normalizedObjects);
  if (result?.error) {
    objectsRepository = createObjectsToolApiRepository();
    result = objectsRepository.replaceObjects(normalizedObjects);
  }
  if (Array.isArray(result?.objects)) {
    storageIssue = null;
    return result.objects.map(cloneObject);
  }
  storageIssue = objectStorageFinding(result);
  renderValidation([storageIssue]);
  setText(elements.log, storageIssue.action);
  return null;
}

function editingObjectFromRow(row) {
  const renderType = row.querySelector("[data-objects-row-render-type]")?.value || "None";
  const render = renderType === "Sprite"
    ? {
        assetKey: normalizeText(row.dataset.objectsExistingAssetKey),
        previewPath: normalizeText(row.dataset.objectsExistingPreviewPath),
        type: "Sprite",
      }
    : { type: "None" };

  return cloneObject({
    name: row.querySelector("[data-objects-row-name]")?.value,
    render,
    role: row.querySelector("[data-objects-row-type]")?.value,
    state: row.querySelector("[data-objects-row-state]")?.value,
    traits: capabilityIdsFromRow(row),
  });
}

function updateRenderAssetPreview(row) {
  const preview = row.querySelector("[data-objects-row-render-asset-preview]");
  const renderType = row.querySelector("[data-objects-row-render-type]")?.value || "None";
  if (!preview) {
    return;
  }
  preview.textContent = renderType === "Sprite"
    ? row.dataset.objectsExistingAssetKey
      ? renderAssetDisplayForKey(row.dataset.objectsExistingAssetKey)
      : "Links on save"
    : "None";
}

function applyTemplateToRow(row, template) {
  if (!row || !template) {
    return;
  }
  const type = row.querySelector("[data-objects-row-type]");
  const state = row.querySelector("[data-objects-row-state]");
  const renderType = row.querySelector("[data-objects-row-render-type]");
  if (type) {
    type.value = template.type;
  }
  if (state) {
    state.value = template.state;
  }
  if (renderType) {
    renderType.value = template.renderType;
  }
  row.dataset.objectsExistingAssetKey = "";
  row.dataset.objectsExistingPreviewPath = "";
  setRowCapabilities(row, [...template.capabilities]);
  updateRenderAssetPreview(row);
}

function editingRowElement() {
  return elements.list?.querySelector("[data-objects-editing-row]") || null;
}

function renderEditingRow(values) {
  const row = document.createElement("tr");
  row.dataset.objectsEditingRow = "true";
  row.dataset.objectsRow = editingRow.mode;
  row.dataset.objectsExistingAssetKey = values.renderType === "Sprite" ? values.assetKey || "" : "";
  row.dataset.objectsExistingPreviewPath = values.renderType === "Sprite" ? values.previewPath || "" : "";
  row.dataset.objectsCapabilityIds = (values.capabilities || []).join(",");

  const name = textInput({ ariaLabel: "Object Name", value: values.name });
  name.dataset.objectsRowName = "true";

  const type = selectElement({
    ariaLabel: "Type",
    options: typeOptions(),
    placeholder: "Select type",
    selectedValue: values.role,
  });
  type.dataset.objectsRowType = "true";

  const state = selectElement({
    ariaLabel: "Initial State",
    options: [
      { label: "Active", value: "Active" },
      { label: "Disabled", value: "Disabled" },
      { label: "Idle", value: "Idle" },
    ],
    selectedValue: values.state,
  });
  state.dataset.objectsRowState = "true";

  const renderType = selectElement({
    ariaLabel: "Render Type",
    options: [
      { label: "None", value: "None" },
      { label: "Sprite", value: "Sprite" },
    ],
    selectedValue: values.renderType,
  });
  renderType.dataset.objectsRowRenderType = "true";

  const renderAsset = document.createElement("td");
  renderAsset.dataset.objectsRowRenderAssetPreview = "true";
  renderAsset.textContent = values.renderType === "Sprite"
    ? values.assetKey
      ? renderAssetDisplayForKey(values.assetKey)
      : "Links on save"
    : "None";

  const capabilities = tableCell(capabilityText(values.capabilities || []));
  capabilities.dataset.objectsRowCapabilitiesPreview = "true";

  const actions = actionCell([
    actionButton("Save", "objectsSaveRow"),
    actionButton("Cancel", "objectsCancelRow"),
  ]);

  row.append(
    controlCell(name),
    controlCell(type),
    controlCell(state),
    controlCell(renderType),
    capabilities,
    renderAsset,
    actions
  );
  return row;
}

function renderSavedRow(object) {
  const row = document.createElement("tr");
  const id = objectId(object);
  const actions = actionCell([
    actionButton("Edit", "objectsEditRow", id),
    ...rowConfigurationActions(object),
    actionButton("Trash", "objectsTrashRow", id),
  ]);
  row.dataset.objectsRow = id;
  row.append(
    tableCell(object.name),
    tableCell(object.role),
    tableCell(object.state),
    tableCell(object.render?.type || "None"),
    tableCell(capabilityText(object.traits)),
    tableCell(renderAssetText(object)),
    actions
  );
  return row;
}

function renderObjectList(objects) {
  if (!elements.list) {
    return;
  }

  elements.list.replaceChildren();
  if (objects.length === 0 && !editingRow) {
    const row = document.createElement("tr");
    const empty = document.createElement("td");
    empty.colSpan = 7;
    empty.textContent = "No objects drafted yet.";
    row.append(empty);
    elements.list.append(row);
    return;
  }

  objects.forEach((object) => {
    if (editingRow?.mode === "edit" && editingRow.originalId === objectId(object)) {
      elements.list.append(renderEditingRow(defaultEditingValues(object)));
      return;
    }
    elements.list.append(renderSavedRow(object));
  });

  if (editingRow?.mode === "new") {
    elements.list.append(renderEditingRow(defaultEditingValues(templateSource(selectedTemplate()))));
  }
}

function renderOutput(objects, findings) {
  const readiness = objectStatusLabel(objects, findings);
  const linkedSprite = linkedSpriteObject(objects);
  const linkedAsset = linkedSprite ? linkedSpriteAsset(linkedSprite.render.assetKey) : null;
  const linkedAssetText = linkedSprite ? assetDisplayText(linkedAsset, linkedSprite.render.assetKey) : "None";
  const linkedPreviewPath = linkedSpritePreviewPath(linkedSprite, linkedAsset);
  const linkedSpriteCount = spriteObjectCount(objects) - missingRenderAssetCount(objects);

  setText(elements.count, String(objects.length));
  setText(elements.readiness, readiness);
  setText(elements.outputReadiness, readiness);
  setText(elements.outputCount, String(objects.length));
  setText(
    elements.assetStatus,
    linkedSpriteCount > 0
      ? `${linkedSpriteCount} Linked`
      : "Not Configured"
  );
  setText(
    elements.outputSetup,
    objects.length === 0
      ? "Add objects to begin setup."
      : findings.length === 0
        ? "Objects have saved setup details."
        : "Review the object details marked in validation."
  );
  setText(elements.outputRenderAsset, linkedAssetText);
  setText(
    elements.outputSpritePreview,
    linkedSprite
      ? `${linkedAssetText}: ${linkedPreviewPath || "No preview path returned by shared asset record."}`
      : "No sprite asset linked."
  );
  if (elements.editSprite) {
    elements.editSprite.hidden = !linkedSprite;
    if (linkedSprite) {
      elements.editSprite.href = spriteEditorHref(linkedSprite);
      elements.editSprite.textContent = `Edit ${linkedAssetText}`;
    } else {
      elements.editSprite.removeAttribute("href");
      elements.editSprite.textContent = "Edit Sprite";
    }
  }
}

function renderTemplateCatalog() {
  if (elements.templateCatalog) {
    elements.templateCatalog.replaceChildren();
    OBJECT_TYPE_TEMPLATES.forEach((template) => {
      const row = document.createElement("tr");
      row.append(
        tableCell(template.type),
        tableCell(capabilityText(template.capabilities))
      );
      elements.templateCatalog.append(row);
    });
  }

  if (elements.templateSelect) {
    elements.templateSelect.replaceChildren(optionElement("", "Select template"));
    OBJECT_TYPE_TEMPLATES.forEach((template) => {
      elements.templateSelect.append(optionElement(template.type, template.type));
    });
  }
}

function renderRegistryBasics() {
  if (elements.typeBasics) {
    elements.typeBasics.replaceChildren();
    OBJECT_TYPE_TEMPLATES.forEach((template) => {
      elements.typeBasics.append(listItem(template.type));
    });
  }

  if (elements.capabilityBasics) {
    elements.capabilityBasics.replaceChildren();
    sortedCapabilities().forEach((trait) => {
      const item = document.createElement("li");
      const label = document.createElement("strong");
      label.textContent = `${capabilityLabel(trait.id)}:`;
      item.append(label, ` ${trait.description}`);
      elements.capabilityBasics.append(item);
    });
  }
}

function render() {
  const findings = [
    ...objectListFindings(draftedObjects),
    ...(storageIssue ? [storageIssue] : []),
  ];
  renderObjectList(draftedObjects);
  renderOutput(draftedObjects, findings);
  renderValidation(findings);
  if (elements.addRow) {
    elements.addRow.disabled = Boolean(editingRow);
  }
}

function ensureSpriteRender(object) {
  if (object.render?.type !== "Sprite") {
    return { message: "", object };
  }

  const existingAssetKey = normalizeText(object.render.assetKey);
  if (existingAssetKey) {
    const asset = linkedSpriteAsset(existingAssetKey);
    if (asset?.id) {
      return {
        message: "",
        object: {
          ...object,
          render: Object.freeze({
            assetKey: normalizeText(asset.id),
            previewPath: normalizeText(asset.storedPath || asset.path || object.render.previewPath),
            type: "Sprite",
          }),
        },
      };
    }
  }

  const result = ensureSpriteAssetForObject({
    objectKey: objectId(object),
    objectName: object.name,
  });
  const asset = result?.asset || null;
  if (result?.error || !result?.linked || !asset?.id) {
    return {
      finding: {
        action: assetLinkMessage(result, "Create or resolve the shared sprite asset record before saving this object."),
        label: "Render Asset",
      },
      message: assetLinkMessage(result, "Sprite asset link failed."),
      object,
    };
  }

  return {
    message: assetLinkMessage(result, `Linked sprite asset ${asset.id}.`),
    object: {
      ...object,
      render: Object.freeze({
        assetKey: normalizeText(asset.id),
        previewPath: normalizeText(asset.storedPath || asset.path),
        type: "Sprite",
      }),
    },
  };
}

function addRow() {
  if (editingRow) {
    return;
  }
  editingRow = { mode: "new", originalId: "" };
  setText(elements.log, "New object row ready. Save or cancel before adding another row.");
  render();
}

function editRow(objectKey) {
  if (editingRow) {
    return;
  }
  editingRow = { mode: "edit", originalId: objectKey };
  setText(elements.log, "Editing object row. Save or cancel before adding another row.");
  render();
}

function cancelRow() {
  editingRow = null;
  setText(elements.log, "Canceled row editing.");
  render();
}

function saveRow() {
  const row = editingRowElement();
  if (!row || !editingRow) {
    return;
  }

  let object = editingObjectFromRow(row);
  let findings = rowFindings(object, editingRow.originalId, { allowPendingSprite: true });
  if (findings.length > 0) {
    renderValidation(findings);
    setText(elements.log, `Row blocked: ${findings.length} validation action${findings.length === 1 ? "" : "s"}.`);
    return;
  }

  const assetLink = ensureSpriteRender(object);
  if (assetLink.finding) {
    renderValidation([assetLink.finding]);
    setText(elements.log, assetLink.message);
    return;
  }
  object = assetLink.object;
  findings = rowFindings(object, editingRow.originalId);
  if (findings.length > 0) {
    renderValidation(findings);
    setText(elements.log, `Row blocked after sprite asset link: ${findings.length} validation action${findings.length === 1 ? "" : "s"}.`);
    return;
  }

  let nextObjects = [];
  if (editingRow.mode === "edit") {
    nextObjects = draftedObjects.map((savedObject) => (
      objectId(savedObject) === editingRow.originalId ? object : savedObject
    ));
  } else {
    nextObjects = [...draftedObjects, object];
  }

  const savedObjects = persistDraftedObjects(nextObjects);
  if (!savedObjects) {
    return;
  }
  draftedObjects = savedObjects;
  setText(
    elements.log,
    editingRow.mode === "edit"
      ? assetLink.message ? `Saved ${object.name}. ${assetLink.message}` : `Saved ${object.name}.`
      : assetLink.message ? `Added ${object.name}. ${assetLink.message}` : `Added ${object.name}.`
  );
  editingRow = null;
  render();
}

function trashRow(objectKey) {
  const beforeCount = draftedObjects.length;
  const nextObjects = draftedObjects.filter((object) => objectId(object) !== objectKey);
  const removed = beforeCount !== nextObjects.length;
  if (removed) {
    const savedObjects = persistDraftedObjects(nextObjects);
    if (!savedObjects) {
      return;
    }
    draftedObjects = savedObjects;
  }
  setText(elements.log, removed ? "Trashed object row." : "Trash skipped: object row was already absent.");
  render();
}

function seedStarterObjects() {
  if (editingRow) {
    setText(elements.log, "Seed blocked: save or cancel the active row first.");
    return;
  }
  const savedObjects = persistDraftedObjects(STARTER_OBJECTS.map(cloneObject));
  if (!savedObjects) {
    return;
  }
  draftedObjects = savedObjects;
  setText(elements.log, "Seeded starter objects: Hero, Projectile, and Wall.");
  render();
}

function validateObjects() {
  const findings = [
    ...objectListFindings(draftedObjects),
    ...(storageIssue ? [storageIssue] : []),
  ];
  renderValidation(findings);
  setText(
    elements.log,
    findings.length === 0
      ? "Validation PASS: Object details are ready for review."
      : `Validation found ${findings.length} action${findings.length === 1 ? "" : "s"} for object details.`
  );
  renderOutput(draftedObjects, findings);
}

function resetTable() {
  const savedObjects = persistDraftedObjects([]);
  if (!savedObjects) {
    return;
  }
  draftedObjects = savedObjects;
  editingRow = null;
  setText(elements.log, "Reset the Objects table.");
  render();
}

function refreshLinkedRenderAssetDisplay() {
  if (!editingRow) {
    render();
    return;
  }
  const row = editingRowElement();
  if (row) {
    updateRenderAssetPreview(row);
  }
  const findings = objectListFindings(draftedObjects);
  renderOutput(draftedObjects, findings);
}

elements.addRow?.addEventListener("click", addRow);
elements.seedStarter?.addEventListener("click", seedStarterObjects);
elements.validate?.addEventListener("click", validateObjects);
elements.resetTable?.addEventListener("click", resetTable);
elements.templateSelect?.addEventListener("change", () => {
  const template = selectedTemplate();
  if (!template) {
    return;
  }
  const row = editingRowElement();
  if (row) {
    applyTemplateToRow(row, template);
    setText(elements.log, `Applied ${template.type} template to the active row.`);
    return;
  }
  setText(elements.log, `${template.type} template selected for the next object row.`);
});
elements.list?.addEventListener("click", (event) => {
  const button = event.target instanceof HTMLElement ? event.target.closest("button") : null;
  if (!button) {
    return;
  }
  if (button.dataset.objectsSaveRow !== undefined) {
    saveRow();
  } else if (button.dataset.objectsCancelRow !== undefined) {
    cancelRow();
  } else if (button.dataset.objectsEditRow !== undefined) {
    editRow(button.dataset.objectsEditRow || "");
  } else if (button.dataset.objectsTrashRow !== undefined) {
    trashRow(button.dataset.objectsTrashRow || "");
  }
});
elements.list?.addEventListener("change", (event) => {
  const control = event.target instanceof HTMLElement
    ? event.target.closest("[data-objects-row-render-type], [data-objects-row-type]")
    : null;
  if (!control) {
    return;
  }
  const row = control.closest("[data-objects-editing-row]");
  if (!row) {
    return;
  }
  if (control.matches("[data-objects-row-render-type]")) {
    updateRenderAssetPreview(row);
    return;
  }
  const template = templateForType(control.value);
  setRowCapabilities(row, template ? [...template.capabilities] : []);
  if (elements.templateSelect && template) {
    elements.templateSelect.value = template.type;
  }
});
window.addEventListener("focus", refreshLinkedRenderAssetDisplay);
window.addEventListener("pageshow", refreshLinkedRenderAssetDisplay);
window.addEventListener("gamefoundry:objects-refresh-assets", refreshLinkedRenderAssetDisplay);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    refreshLinkedRenderAssetDisplay();
  }
});

renderTemplateCatalog();
renderRegistryBasics();
draftedObjects = readPersistedObjects() || [];
render();
