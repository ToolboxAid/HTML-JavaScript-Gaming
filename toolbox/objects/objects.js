import {
  OBJECT_MODEL_TRAIT_LIST,
  OBJECT_MODEL_TYPE_LIST,
  getObjectModelTrait,
  getObjectModelType,
  validateObjectDefinition,
} from "../../src/engine/object-model/index.js";
import { createAssetToolApiRepository } from "../assets/assets-api-client.js";

const ROLE_OPTIONS = Object.freeze([
  "Collectible",
  "Custom",
  "Enemy",
  "Goal",
  "Hazard",
  "Hero",
  "Platform",
  "Projectile",
  "Spawner",
  "UI",
  "Wall",
]);

const ROLE_TRAITS = Object.freeze({
  Collectible: Object.freeze(["collectible"]),
  Custom: Object.freeze([]),
  Enemy: Object.freeze([]),
  Goal: Object.freeze(["goal"]),
  Hazard: Object.freeze(["hazard"]),
  Hero: Object.freeze(["playerControlled"]),
  Platform: Object.freeze(["collides"]),
  Projectile: Object.freeze(["movable"]),
  Spawner: Object.freeze([]),
  UI: Object.freeze([]),
  Wall: Object.freeze(["collides"]),
});

const SETUP_REQUIREMENTS = Object.freeze([
  {
    action: "Add at least one object row.",
    label: "Object row",
    test: (objects) => objects.length > 0,
  },
  {
    action: "Give every saved object a name.",
    label: "Object names",
    test: (objects) => objects.length > 0 && objects.every((object) => object.name),
  },
  {
    action: "Choose a registered object type for every saved object.",
    label: "Object types",
    test: (objects) => objects.length > 0 && objects.every((object) => getObjectModelType(object.type)),
  },
  {
    action: "Choose a role for every saved object.",
    label: "Object roles",
    test: (objects) => objects.length > 0 && objects.every((object) => object.role),
  },
]);

const STARTER_OBJECTS = Object.freeze([
  Object.freeze({
    behavior: "Responds to player control mapping.",
    interaction: "Can interact with platforms, collectibles, hazards, and goals.",
    name: "Hero",
    render: Object.freeze({ type: "None" }),
    role: "Hero",
    state: "Active",
    type: "Dynamic",
  }),
  Object.freeze({
    behavior: "Moves through the scene under authored behavior.",
    interaction: "Can collide with walls, platforms, or targets.",
    name: "Projectile",
    render: Object.freeze({ type: "None" }),
    role: "Projectile",
    state: "Active",
    type: "Dynamic",
  }),
  Object.freeze({
    behavior: "Stays fixed in the scene.",
    interaction: "Provides a stable collision surface.",
    name: "Wall",
    render: Object.freeze({ type: "None" }),
    role: "Wall",
    state: "Active",
    type: "Static",
  }),
]);

const assetRepository = createAssetToolApiRepository();
let draftedObjects = [];
let editingRow = null;

const elements = {
  addRow: document.querySelector("[data-objects-add-row]"),
  count: document.querySelector("[data-objects-count]"),
  editSprite: document.querySelector("[data-objects-edit-sprite]"),
  list: document.querySelector("[data-objects-list]"),
  log: document.querySelector("[data-objects-log]"),
  outputDynamic: document.querySelector("[data-objects-output-dynamic]"),
  outputReadiness: document.querySelector("[data-objects-output-readiness]"),
  outputRenderAsset: document.querySelector("[data-objects-output-render-asset]"),
  outputSetup: document.querySelector("[data-objects-output-setup]"),
  outputSpritePreview: document.querySelector("[data-objects-output-sprite-preview]"),
  outputStatic: document.querySelector("[data-objects-output-static]"),
  readiness: document.querySelector("[data-objects-readiness]"),
  requirements: document.querySelector("[data-objects-requirements]"),
  resetTable: document.querySelector("[data-objects-reset-table]"),
  roleBasics: document.querySelector("[data-objects-role-basics]"),
  seedStarter: document.querySelector("[data-objects-seed-starter]"),
  traitBasics: document.querySelector("[data-objects-trait-basics]"),
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

function actionButton(text, dataName, value = "") {
  const button = document.createElement("button");
  button.className = "btn btn--compact";
  button.type = "button";
  button.textContent = text;
  button.dataset[dataName] = value;
  return button;
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

function statusText(ok) {
  return ok ? "OK" : "Needs Action";
}

function sortedObjectTypes() {
  return [...OBJECT_MODEL_TYPE_LIST].sort((left, right) => left.label.localeCompare(right.label));
}

function sortedTraits() {
  return [...OBJECT_MODEL_TRAIT_LIST].sort((left, right) => left.id.localeCompare(right.id));
}

function objectTypeOptions() {
  return sortedObjectTypes().map((objectType) => ({
    label: objectType.label,
    value: objectType.id,
  }));
}

function roleOptions() {
  return ROLE_OPTIONS.map((role) => ({ label: role, value: role }));
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
  (ROLE_TRAITS[object.role] || []).forEach((traitId) => traitIds.add(traitId));
  traitIdsFromSource(source).forEach((traitId) => traitIds.add(traitId));

  return Object.freeze([...traitIds]);
}

function cloneObject(source = {}) {
  const object = {
    behavior: normalizeText(source.behavior),
    id: objectKeyFromText(source.id || source.name),
    interaction: normalizeText(source.interaction),
    name: normalizeText(source.name),
    render: normalizeRenderConfig(source),
    role: normalizeText(source.role),
    state: normalizeText(source.state) || "Active",
    type: normalizeText(source.type),
  };

  return {
    ...object,
    traits: traitsForObject(source, object),
  };
}

function defaultEditingValues(source = {}) {
  return {
    id: objectId(source),
    name: normalizeText(source.name),
    renderType: normalizeText(source.render?.type) || "None",
    role: normalizeText(source.role),
    state: normalizeText(source.state) || "Active",
    type: normalizeText(source.type),
  };
}

function issueLabel(issue) {
  if (issue.path.endsWith(".name")) {
    return "Object Name";
  }
  if (issue.path.endsWith(".type")) {
    return "Object Type";
  }
  if (issue.path.includes(".traits")) {
    return "Object Traits";
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
  return validateObjectDefinition(object).issues.map((issue) => ({
    action: issue.action,
    label: labelPrefix ? `${labelPrefix} ${issueLabel(issue)}` : issueLabel(issue),
  }));
}

function definitionForReadiness(object) {
  if (object.render?.type !== "Sprite" || object.render.assetKey) {
    return object;
  }
  return {
    ...object,
    render: Object.freeze({ type: "None" }),
  };
}

function rowFindings(object, ignoreObjectId = "") {
  const findings = objectDefinitionFindings(definitionForReadiness(object), "");
  if (!object.role) {
    findings.push({
      action: "Choose the role this object serves.",
      label: "Role",
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
    objectDefinitionFindings(object, label).forEach((finding) => {
      findings.push(finding);
    });
    if (!object.role) {
      findings.push({
        action: `${label} needs a role.`,
        label: `${label} Role`,
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

  SETUP_REQUIREMENTS.forEach((requirement) => {
    if (!requirement.test(objects)) {
      findings.push({
        action: requirement.action,
        label: requirement.label,
      });
    }
  });

  return findings;
}

function readinessLabel(findings) {
  return findings.length === 0 ? "Ready" : "Needs Input";
}

function renderValidation(findings) {
  if (!elements.validationList || !elements.validationOverlay) {
    return;
  }

  elements.validationList.replaceChildren();

  if (findings.length === 0) {
    elements.validationList.append(listItem("PASS: Object setup rows are ready."));
    elements.validationOverlay.hidden = true;
    return;
  }

  findings.forEach((finding) => {
    elements.validationList.append(listItem(`${finding.label}: ${finding.action}`));
  });
  elements.validationOverlay.hidden = false;
}

function renderRequirements(objects) {
  if (!elements.requirements) {
    return;
  }

  elements.requirements.replaceChildren();
  SETUP_REQUIREMENTS.forEach((requirement) => {
    const row = document.createElement("tr");
    row.append(tableCell(requirement.label), tableCell(statusText(requirement.test(objects))));
    elements.requirements.append(row);
  });
}

function traitLabel(traitId) {
  const trait = getObjectModelTrait(traitId);
  return trait ? trait.label : traitId;
}

function traitText(traitIds) {
  if (!traitIds.length) {
    return "None";
  }
  return traitIds.map(traitLabel).join(", ");
}

function renderAssetText(object) {
  if (object.render?.type !== "Sprite") {
    return "None";
  }
  return object.render.assetKey || "Sprite asset missing";
}

function linkedSpriteObject(objects) {
  return objects.find((object) => object.render?.type === "Sprite" && object.render.assetKey) || null;
}

function spriteEditorHref(object) {
  const assetKey = encodeURIComponent(object.render.assetKey);
  const objectKey = encodeURIComponent(objectId(object));
  return `/toolbox/sprites/index.html?assetKey=${assetKey}&objectKey=${objectKey}&sourceTool=objects`;
}

function assetHandoffMessage(result, fallback) {
  const message = result?.message || fallback;
  const diagnostics = Array.isArray(result?.diagnostics)
    ? result.diagnostics.map((diagnostic) => normalizeText(diagnostic.action)).filter(Boolean)
    : [];
  return diagnostics.length ? `${message} ${diagnostics.join(" ")}` : message;
}

function editingObjectFromRow(row) {
  return cloneObject({
    name: row.querySelector("[data-objects-row-name]")?.value,
    render: { type: row.querySelector("[data-objects-row-render-type]")?.value || "None" },
    role: row.querySelector("[data-objects-row-role]")?.value,
    state: row.querySelector("[data-objects-row-state]")?.value,
    type: row.querySelector("[data-objects-row-type]")?.value,
  });
}

function updateRenderAssetPreview(row) {
  const preview = row.querySelector("[data-objects-row-render-asset-preview]");
  const renderType = row.querySelector("[data-objects-row-render-type]")?.value || "None";
  if (!preview) {
    return;
  }
  preview.textContent = renderType === "Sprite" ? "Links on save" : "None";
}

function editingRowElement() {
  return elements.list?.querySelector("[data-objects-editing-row]") || null;
}

function renderEditingRow(values) {
  const row = document.createElement("tr");
  row.dataset.objectsEditingRow = "true";
  row.dataset.objectsRow = editingRow.mode;

  const name = textInput({ ariaLabel: "Object Name", value: values.name });
  name.dataset.objectsRowName = "true";

  const type = selectElement({
    ariaLabel: "Object Type",
    options: objectTypeOptions(),
    placeholder: "Select type",
    selectedValue: values.type,
  });
  type.dataset.objectsRowType = "true";

  const role = selectElement({
    ariaLabel: "Role",
    options: roleOptions(),
    placeholder: "Select role",
    selectedValue: values.role,
  });
  role.dataset.objectsRowRole = "true";

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
  renderAsset.textContent = values.renderType === "Sprite" ? "Links on save" : "None";

  const actions = document.createElement("td");
  actions.append(
    actionButton("Save", "objectsSaveRow"),
    actionButton("Cancel", "objectsCancelRow")
  );

  row.append(
    controlCell(name),
    controlCell(type),
    controlCell(role),
    controlCell(state),
    controlCell(renderType),
    tableCell("Updates on save"),
    renderAsset,
    actions
  );
  return row;
}

function renderSavedRow(object) {
  const row = document.createElement("tr");
  const id = objectId(object);
  const actions = document.createElement("td");
  actions.append(
    actionButton("Edit", "objectsEditRow", id),
    actionButton("Trash", "objectsTrashRow", id)
  );
  row.dataset.objectsRow = id;
  row.append(
    tableCell(object.name),
    tableCell(object.type),
    tableCell(object.role),
    tableCell(object.state),
    tableCell(object.render?.type || "None"),
    tableCell(traitText(object.traits)),
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
    empty.colSpan = 8;
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
    elements.list.append(renderEditingRow(defaultEditingValues()));
  }
}

function renderOutput(objects, findings) {
  const staticCount = objects.filter((object) => object.type === "Static").length;
  const dynamicCount = objects.filter((object) => object.type === "Dynamic").length;
  const readiness = readinessLabel(findings);
  const linkedSprite = linkedSpriteObject(objects);

  setText(elements.count, String(objects.length));
  setText(elements.readiness, readiness);
  setText(elements.outputReadiness, readiness);
  setText(elements.outputStatic, String(staticCount));
  setText(elements.outputDynamic, String(dynamicCount));
  setText(
    elements.outputSetup,
    findings.length === 0
      ? "Object setup table has the required row details."
      : "Object setup table needs validation actions."
  );
  setText(elements.outputRenderAsset, linkedSprite ? linkedSprite.render.assetKey : "None");
  setText(
    elements.outputSpritePreview,
    linkedSprite
      ? `${linkedSprite.render.assetKey}: ${linkedSprite.render.previewPath || "No preview path returned by shared asset record."}`
      : "No sprite asset linked."
  );
  if (elements.editSprite) {
    elements.editSprite.hidden = !linkedSprite;
    if (linkedSprite) {
      elements.editSprite.href = spriteEditorHref(linkedSprite);
      elements.editSprite.textContent = `Edit ${linkedSprite.render.assetKey}`;
    } else {
      elements.editSprite.removeAttribute("href");
      elements.editSprite.textContent = "Edit Sprite";
    }
  }
}

function renderRegistryBasics() {
  if (elements.roleBasics) {
    elements.roleBasics.replaceChildren();
    ROLE_OPTIONS.forEach((role) => {
      elements.roleBasics.append(listItem(role));
    });
  }

  if (elements.typeBasics) {
    elements.typeBasics.replaceChildren();
    sortedObjectTypes().forEach((objectType) => {
      const item = document.createElement("li");
      const label = document.createElement("strong");
      label.textContent = `${objectType.label}:`;
      item.append(label, ` ${objectType.description} Traits: ${traitText(objectType.traits)}.`);
      elements.typeBasics.append(item);
    });
  }

  if (elements.traitBasics) {
    elements.traitBasics.replaceChildren();
    sortedTraits().forEach((trait) => {
      const item = document.createElement("li");
      const label = document.createElement("strong");
      label.textContent = `${trait.id}:`;
      item.append(label, ` ${trait.description}`);
      elements.traitBasics.append(item);
    });
  }
}

function render() {
  const findings = objectListFindings(draftedObjects);
  renderRequirements(draftedObjects);
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

  const result = assetRepository.ensureSpriteAssetForObject({
    objectKey: objectId(object),
    objectName: object.name,
  });
  const asset = result?.asset || null;
  if (result?.error || !result?.linked || !asset?.id) {
    return {
      finding: {
        action: result?.message || "Create or resolve the shared sprite asset record before saving this object.",
        label: "Render Asset",
      },
      message: assetHandoffMessage(result, "Sprite asset handoff failed."),
      object,
    };
  }

  return {
    message: assetHandoffMessage(result, `Linked sprite asset ${asset.id}.`),
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
  let findings = rowFindings(object, editingRow.originalId);
  if (findings.length > 0) {
    renderValidation(findings);
    setText(elements.log, `Row blocked: ${findings.length} validation action${findings.length === 1 ? "" : "s"}.`);
    return;
  }

  const handoff = ensureSpriteRender(object);
  if (handoff.finding) {
    renderValidation([handoff.finding]);
    setText(elements.log, handoff.message);
    return;
  }
  object = handoff.object;
  findings = rowFindings(object, editingRow.originalId);
  if (findings.length > 0) {
    renderValidation(findings);
    setText(elements.log, `Row blocked after render handoff: ${findings.length} validation action${findings.length === 1 ? "" : "s"}.`);
    return;
  }

  if (editingRow.mode === "edit") {
    draftedObjects = draftedObjects.map((savedObject) => (
      objectId(savedObject) === editingRow.originalId ? object : savedObject
    ));
    setText(elements.log, handoff.message ? `Saved ${object.name}. ${handoff.message}` : `Saved ${object.name}.`);
  } else {
    draftedObjects = [...draftedObjects, object];
    setText(elements.log, handoff.message ? `Added ${object.name}. ${handoff.message}` : `Added ${object.name}.`);
  }
  editingRow = null;
  render();
}

function trashRow(objectKey) {
  const beforeCount = draftedObjects.length;
  draftedObjects = draftedObjects.filter((object) => objectId(object) !== objectKey);
  const removed = beforeCount !== draftedObjects.length;
  setText(elements.log, removed ? "Trashed object row." : "Trash skipped: object row was already absent.");
  render();
}

function seedStarterObjects() {
  if (editingRow) {
    setText(elements.log, "Seed blocked: save or cancel the active row first.");
    return;
  }
  draftedObjects = STARTER_OBJECTS.map(cloneObject);
  setText(elements.log, "Seeded starter objects: Hero, Projectile, and Wall.");
  render();
}

function validateObjects() {
  const findings = objectListFindings(draftedObjects);
  renderValidation(findings);
  setText(
    elements.log,
    findings.length === 0
      ? "Validation PASS: Object setup rows are ready for authoring handoff."
      : `Validation found ${findings.length} action${findings.length === 1 ? "" : "s"} for object setup.`
  );
  renderOutput(draftedObjects, findings);
}

function resetTable() {
  draftedObjects = [];
  editingRow = null;
  setText(elements.log, "Reset the in-memory Objects table.");
  render();
}

elements.addRow?.addEventListener("click", addRow);
elements.seedStarter?.addEventListener("click", seedStarterObjects);
elements.validate?.addEventListener("click", validateObjects);
elements.resetTable?.addEventListener("click", resetTable);
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
  const control = event.target instanceof HTMLElement ? event.target.closest("[data-objects-row-render-type]") : null;
  if (control) {
    const row = control.closest("[data-objects-editing-row]");
    if (row) {
      updateRenderAssetPreview(row);
    }
  }
});

renderRegistryBasics();
render();
