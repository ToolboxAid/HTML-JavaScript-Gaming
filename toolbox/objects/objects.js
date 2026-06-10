import {
  OBJECT_MODEL_TRAIT_LIST,
  OBJECT_MODEL_TYPE_LIST,
  getObjectModelTrait,
  getObjectModelType,
  validateObjectDefinition,
} from "../../src/engine/object-model/index.js";

const MVP_REQUIREMENTS = Object.freeze([
  {
    action: "Add a Dynamic object with the Paddle role.",
    label: "Dynamic paddle",
    test: (objects) => objects.some((object) => object.type === "Dynamic" && object.role === "Paddle")
  },
  {
    action: "Add a Dynamic object with the Ball role.",
    label: "Dynamic ball",
    test: (objects) => objects.some((object) => object.type === "Dynamic" && object.role === "Ball")
  },
  {
    action: "Add a Static object, usually a Boundary, so the ball has a fixed play area.",
    label: "Static play boundary",
    test: (objects) => objects.some((object) => object.type === "Static")
  }
]);

const MVP_ROLE_TRAITS = Object.freeze({
  Ball: Object.freeze(["bounces"]),
  Boundary: Object.freeze([]),
  Goal: Object.freeze([]),
  Hazard: Object.freeze([]),
  Paddle: Object.freeze(["playerControlled"]),
  Pickup: Object.freeze([]),
});

const SEEDED_OBJECTS = Object.freeze([
  Object.freeze({
    behavior: "Moves horizontally from player input.",
    interaction: "Deflects the ball and stays inside the play area.",
    name: "Player Paddle",
    role: "Paddle",
    state: "Active",
    type: "Dynamic"
  }),
  Object.freeze({
    behavior: "Moves continuously after launch.",
    interaction: "Bounces off the paddle and static boundary.",
    name: "Game Ball",
    role: "Ball",
    state: "Active",
    type: "Dynamic"
  }),
  Object.freeze({
    behavior: "Does not move.",
    interaction: "Keeps the ball inside the MVP playfield.",
    name: "Arena Boundary",
    role: "Boundary",
    state: "Active",
    type: "Static"
  })
]);

let draftedObjects = [];

const elements = {
  behavior: document.querySelector("[data-objects-behavior]"),
  count: document.querySelector("[data-objects-count]"),
  form: document.querySelector("[data-objects-form]"),
  interaction: document.querySelector("[data-objects-interaction]"),
  list: document.querySelector("[data-objects-list]"),
  log: document.querySelector("[data-objects-log]"),
  name: document.querySelector("[data-objects-name]"),
  outputDynamic: document.querySelector("[data-objects-output-dynamic]"),
  outputMvp: document.querySelector("[data-objects-output-mvp]"),
  outputReadiness: document.querySelector("[data-objects-output-readiness]"),
  outputStatic: document.querySelector("[data-objects-output-static]"),
  readiness: document.querySelector("[data-objects-readiness]"),
  requirements: document.querySelector("[data-objects-requirements]"),
  resetDraft: document.querySelector("[data-objects-reset-draft]"),
  role: document.querySelector("[data-objects-role]"),
  seedMvp: document.querySelector("[data-objects-seed-mvp]"),
  state: document.querySelector("[data-objects-state]"),
  traitBasics: document.querySelector("[data-objects-trait-basics]"),
  type: document.querySelector("[data-objects-type]"),
  typeBasics: document.querySelector("[data-objects-type-basics]"),
  validate: document.querySelector("[data-objects-validate]"),
  validationList: document.querySelector("[data-objects-validation-list]"),
  validationOverlay: document.querySelector("[data-objects-validation-overlay]")
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

function optionElement(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
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

function traitIdsFromSource(source) {
  return Array.isArray(source.traits)
    ? source.traits.map(normalizeText).filter(Boolean)
    : [];
}

function traitsForObject(source, object) {
  const traitIds = new Set();
  const objectType = getObjectModelType(object.type);

  (objectType?.traits || []).forEach((traitId) => traitIds.add(traitId));
  (MVP_ROLE_TRAITS[object.role] || []).forEach((traitId) => traitIds.add(traitId));
  traitIdsFromSource(source).forEach((traitId) => traitIds.add(traitId));

  return Object.freeze([...traitIds]);
}

function cloneObject(source = {}) {
  const object = {
    behavior: normalizeText(source.behavior),
    id: objectKeyFromText(source.id || source.name),
    interaction: normalizeText(source.interaction),
    name: normalizeText(source.name),
    role: normalizeText(source.role),
    state: normalizeText(source.state) || "Active",
    type: normalizeText(source.type)
  };

  return {
    ...object,
    traits: traitsForObject(source, object)
  };
}

function readDraft() {
  return cloneObject({
    behavior: elements.behavior?.value,
    interaction: elements.interaction?.value,
    name: elements.name?.value,
    role: elements.role?.value,
    state: elements.state?.value,
    type: elements.type?.value
  });
}

function clearDraftForm() {
  if (elements.type) {
    elements.type.value = "";
  }
  if (elements.role) {
    elements.role.value = "";
  }
  if (elements.name) {
    elements.name.value = "";
  }
  if (elements.state) {
    elements.state.value = "Active";
  }
  if (elements.behavior) {
    elements.behavior.value = "";
  }
  if (elements.interaction) {
    elements.interaction.value = "";
  }
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
  if (issue.path.endsWith(".state")) {
    return "Initial State";
  }
  return "Object Definition";
}

function objectDefinitionFindings(object, labelPrefix) {
  return validateObjectDefinition(object).issues.map((issue) => ({
    action: issue.action,
    label: labelPrefix ? `${labelPrefix} ${issueLabel(issue)}` : issueLabel(issue)
  }));
}

function draftFindings(draft) {
  const findings = objectDefinitionFindings(draft, "");
  if (!draft.role) {
    findings.push({
      action: "Choose the MVP role this object serves.",
      label: "MVP Role"
    });
  }
  if (draft.role === "Paddle" && draft.type && draft.type !== "Dynamic") {
    findings.push({
      action: "Set the Paddle role to Dynamic for the paddle + ball MVP path.",
      label: "Paddle Type"
    });
  }
  if (draft.role === "Ball" && draft.type && draft.type !== "Dynamic") {
    findings.push({
      action: "Set the Ball role to Dynamic so it can move in the MVP path.",
      label: "Ball Type"
    });
  }
  if (draft.role === "Boundary" && draft.type && draft.type !== "Static") {
    findings.push({
      action: "Set the Boundary role to Static so it can define the fixed play area.",
      label: "Boundary Type"
    });
  }
  if (draft.name && draftedObjects.some((object) => objectId(object) === objectId(draft))) {
    findings.push({
      action: "Use a unique object name or remove the existing draft row first.",
      label: "Duplicate Object"
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
        action: `${label} needs an MVP role.`,
        label: `${label} Role`
      });
    }
    const id = objectId(object);
    if (!id) {
      findings.push({
        action: `Object ${index + 1} needs a name.`,
        label: `Object ${index + 1} Name`
      });
    } else if (seenIds.has(id)) {
      findings.push({
        action: `${label} duplicates another draft object name.`,
        label: `${label} Duplicate`
      });
    }
    seenIds.add(id);
  });

  MVP_REQUIREMENTS.forEach((requirement) => {
    if (!requirement.test(objects)) {
      findings.push({
        action: requirement.action,
        label: requirement.label
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
    elements.validationList.append(listItem("PASS: Paddle + ball MVP object setup is ready."));
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
  MVP_REQUIREMENTS.forEach((requirement) => {
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

function renderObjectList(objects) {
  if (!elements.list) {
    return;
  }

  elements.list.replaceChildren();
  if (objects.length === 0) {
    const row = document.createElement("tr");
    const empty = document.createElement("td");
    empty.colSpan = 6;
    empty.textContent = "No objects drafted yet.";
    row.append(empty);
    elements.list.append(row);
    return;
  }

  objects.forEach((object) => {
    const row = document.createElement("tr");
    const action = document.createElement("td");
    const remove = document.createElement("button");
    remove.className = "btn btn--compact";
    remove.type = "button";
    remove.dataset.objectsRemove = objectId(object);
    remove.textContent = "Remove";
    action.append(remove);
    row.append(
      tableCell(object.name),
      tableCell(object.type),
      tableCell(object.role),
      tableCell(object.state),
      tableCell(traitText(object.traits)),
      action
    );
    elements.list.append(row);
  });
}

function renderOutput(objects, findings) {
  const staticCount = objects.filter((object) => object.type === "Static").length;
  const dynamicCount = objects.filter((object) => object.type === "Dynamic").length;
  const readiness = readinessLabel(findings);

  setText(elements.count, String(objects.length));
  setText(elements.readiness, readiness);
  setText(elements.outputReadiness, readiness);
  setText(elements.outputStatic, String(staticCount));
  setText(elements.outputDynamic, String(dynamicCount));
  setText(
    elements.outputMvp,
    findings.length === 0
      ? "Paddle + ball setup has the required Dynamic paddle, Dynamic ball, and Static boundary."
      : "Paddle and ball setup needs validation actions."
  );
}

function renderObjectTypeOptions() {
  if (!elements.type) {
    return;
  }

  const selectedType = elements.type.value;
  elements.type.replaceChildren(optionElement("", "Select type"));
  sortedObjectTypes().forEach((objectType) => {
    elements.type.append(optionElement(objectType.id, objectType.label));
  });
  elements.type.value = getObjectModelType(selectedType) ? selectedType : "";
}

function renderRegistryBasics() {
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
}

function addDraftObject() {
  const draft = readDraft();
  const findings = draftFindings(draft);
  if (findings.length > 0) {
    renderValidation(findings);
    setText(elements.log, `Draft blocked: ${findings.length} validation action${findings.length === 1 ? "" : "s"}.`);
    return;
  }

  draftedObjects = [...draftedObjects, draft];
  clearDraftForm();
  setText(elements.log, `Added ${draft.name} as a ${draft.type} ${draft.role}.`);
  render();
}

function seedMvpObjects() {
  draftedObjects = SEEDED_OBJECTS.map(cloneObject);
  clearDraftForm();
  setText(elements.log, "Seeded paddle + ball MVP objects: Player Paddle, Game Ball, and Arena Boundary.");
  render();
}

function validateObjects() {
  const findings = objectListFindings(draftedObjects);
  renderValidation(findings);
  setText(
    elements.log,
    findings.length === 0
      ? "Validation PASS: Objects MVP setup is ready for authoring handoff."
      : `Validation found ${findings.length} action${findings.length === 1 ? "" : "s"} for Objects MVP setup.`
  );
  renderOutput(draftedObjects, findings);
}

function resetDraft() {
  draftedObjects = [];
  clearDraftForm();
  setText(elements.log, "Reset the in-memory Objects draft.");
  render();
}

function removeObject(objectKey) {
  const beforeCount = draftedObjects.length;
  draftedObjects = draftedObjects.filter((object) => objectId(object) !== objectKey);
  const removed = beforeCount !== draftedObjects.length;
  setText(elements.log, removed ? "Removed object from the in-memory draft." : "Remove skipped: object row was already absent.");
  render();
}

elements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  addDraftObject();
});

elements.seedMvp?.addEventListener("click", seedMvpObjects);
elements.validate?.addEventListener("click", validateObjects);
elements.resetDraft?.addEventListener("click", resetDraft);
elements.list?.addEventListener("click", (event) => {
  const button = event.target instanceof HTMLElement ? event.target.closest("[data-objects-remove]") : null;
  if (!button) {
    return;
  }
  removeObject(button.dataset.objectsRemove || "");
});

renderObjectTypeOptions();
renderRegistryBasics();
render();
