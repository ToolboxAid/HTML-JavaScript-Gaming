import { getSessionCurrent } from "../../../../../src/api/session-api-client.js";
import { createServerRepositoryClient } from "../../../../../src/api/server-api-client.js";
import {
  aabbContactState,
  normalizeBoundingBox,
  sweptAabb,
} from "../../../../../src/engine/collision/hitboxCollision.js";

const EMPTY_STATE = "Create an Object and assign a sprite or vector before editing hitboxes.";
const DEV_PENDING_RENDER = "DEV-safe visual placeholder tied to the Object record; asset rendering is pending.";
const ROLES = Object.freeze(["hitbox", "hurtbox", "trigger", "sensor", "physics"]);
const ROLE_COLORS = Object.freeze({
  hitbox: "#ef4444",
  hurtbox: "#3b82f6",
  physics: "#f59e0b",
  sensor: "#22c55e",
  trigger: "#a855f7",
});

const elements = {
  addRectangle: document.querySelector("[data-hitboxes-add-rectangle]"),
  canvas: document.querySelector("[data-hitboxes-canvas]"),
  collisionFields: [...document.querySelectorAll("[data-hitboxes-collision-field]")],
  collisionResult: document.querySelector("[data-hitboxes-collision-result]"),
  deleteButton: document.querySelector("[data-hitboxes-delete]"),
  filter: document.querySelector("[data-hitboxes-filter]"),
  hitboxFields: [...document.querySelectorAll("[data-hitboxes-field]")],
  hitboxList: document.querySelector("[data-hitboxes-list]"),
  metaBounds: document.querySelector("[data-hitboxes-meta-bounds]"),
  metaKey: document.querySelector("[data-hitboxes-meta-key]"),
  metaName: document.querySelector("[data-hitboxes-meta-name]"),
  metaOrigin: document.querySelector("[data-hitboxes-meta-origin]"),
  metaVisual: document.querySelector("[data-hitboxes-meta-visual]"),
  motionFields: [...document.querySelectorAll("[data-hitboxes-motion-field]")],
  motionOutput: document.querySelector("[data-hitboxes-motion-output]"),
  motionResult: document.querySelector("[data-hitboxes-motion-result]"),
  objectA: document.querySelector("[data-hitboxes-object-a]"),
  objectB: document.querySelector("[data-hitboxes-object-b]"),
  objectCount: document.querySelector("[data-hitboxes-object-count]"),
  objectSummary: document.querySelector("[data-hitboxes-object-summary]"),
  previewSummary: document.querySelector("[data-hitboxes-preview-summary]"),
  previewTitle: document.querySelector("[data-hitboxes-preview-title]"),
  runMotion: document.querySelector("[data-hitboxes-run-motion]"),
  runMotionAlt: document.querySelector("[data-hitboxes-run-motion-alt]"),
  runStatic: document.querySelector("[data-hitboxes-run-static]"),
  saveButton: document.querySelector("[data-hitboxes-save]"),
  saveStatus: document.querySelector("[data-hitboxes-save-status]"),
  sourceStatus: document.querySelector("[data-hitboxes-source-status]"),
  staticOutput: document.querySelector("[data-hitboxes-static-output]"),
  status: document.querySelector("[data-hitboxes-status]"),
  stepMotion: document.querySelector("[data-hitboxes-step-motion]"),
  resetMotion: document.querySelector("[data-hitboxes-reset-motion]"),
};

const repository = createServerRepositoryClient("hitboxes");
const context = elements.canvas?.getContext("2d") || null;

const state = {
  collision: {
    objectAX: 0,
    objectAY: 0,
    objectBX: 0,
    objectBY: 50,
  },
  drag: null,
  filter: "all",
  hitboxes: [],
  images: new Map(),
  motion: {
    frameRate: 60,
    speed: 100,
    startX: 0,
    startY: 0,
    stepCount: 1,
    targetX: 0,
    targetY: 50,
    velocityX: 0,
    velocityY: 1,
  },
  motionPreview: null,
  objects: [],
  saveStatus: "idle",
  selectedAKey: "",
  selectedBKey: "",
  selectedHitboxKey: "",
  sourceWarning: "",
  staticResult: "Not tested",
  unsaved: false,
  usingDevSamples: false,
};

function normalizeText(value) {
  return String(value || "").trim();
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function selectedObjectA() {
  return state.objects.find((object) => object.key === state.selectedAKey) || null;
}

function selectedObjectB() {
  return state.objects.find((object) => object.key === state.selectedBKey) || null;
}

function selectedHitbox() {
  return state.hitboxes.find((hitbox) => hitbox.key === state.selectedHitboxKey) || null;
}

function objectLabel(object) {
  if (!object) {
    return "None";
  }
  const dev = object.devSample ? " (DEV review/test data)" : "";
  return `${object.name}${dev}`;
}

function visualLabel(visual = {}) {
  const label = normalizeText(visual.label || visual.assetKey) || "Assigned visual";
  const type = normalizeText(visual.type) || "Asset";
  return `${label} / ${type}`;
}

function boundsText(bounds = {}) {
  return `${finiteNumber(bounds.width, 0)}x${finiteNumber(bounds.height, 0)} at ${finiteNumber(bounds.x, 0)},${finiteNumber(bounds.y, 0)}`;
}

function originText(origin = {}) {
  return `${finiteNumber(origin.x, 0)},${finiteNumber(origin.y, 0)}`;
}

function canvasPoint(event) {
  const rect = elements.canvas.getBoundingClientRect();
  const scaleX = elements.canvas.width / Math.max(1, rect.width);
  const scaleY = elements.canvas.height / Math.max(1, rect.height);
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function previewImageUrl(visual = {}) {
  const path = normalizeText(visual.previewPath);
  if (!path) {
    return "";
  }
  if (/^(https?:|data:|blob:|\/)/i.test(path)) {
    return path;
  }
  return `/api/storage/project-assets/read?key=${encodeURIComponent(path)}`;
}

function loadObjectImage(object) {
  if (!object || state.images.has(object.key)) {
    return;
  }
  const url = previewImageUrl(object.visual);
  if (!url) {
    state.images.set(object.key, { image: null, loaded: false });
    return;
  }
  const image = new Image();
  state.images.set(object.key, { image, loaded: false });
  image.addEventListener("load", () => {
    state.images.set(object.key, { image, loaded: true });
    draw();
  });
  image.addEventListener("error", () => {
    state.images.set(object.key, { image: null, loaded: false });
    draw();
  });
  image.src = url;
}

function optionForObject(object) {
  const option = document.createElement("option");
  option.value = object.key;
  option.textContent = objectLabel(object);
  return option;
}

function renderObjectSelectors() {
  const options = state.objects.map(optionForObject);
  elements.objectA?.replaceChildren(...options.map((option) => option.cloneNode(true)));
  elements.objectB?.replaceChildren(...options.map((option) => option.cloneNode(true)));
  if (elements.objectA) {
    elements.objectA.value = state.selectedAKey;
  }
  if (elements.objectB) {
    elements.objectB.value = state.selectedBKey;
  }
}

function filteredHitboxes() {
  if (state.filter === "all") {
    return state.hitboxes;
  }
  if (state.filter === "disabled") {
    return state.hitboxes.filter((hitbox) => hitbox.enabled === false);
  }
  return state.hitboxes.filter((hitbox) => hitbox.role === state.filter);
}

function hitboxRow(hitbox) {
  const row = document.createElement("tr");
  row.dataset.hitboxesSelect = hitbox.key;
  const name = document.createElement("th");
  name.scope = "row";
  const button = document.createElement("button");
  button.className = hitbox.key === state.selectedHitboxKey ? "btn btn--compact primary" : "btn btn--compact";
  button.type = "button";
  button.dataset.hitboxesSelectButton = hitbox.key;
  button.textContent = hitbox.name;
  name.append(button);
  const role = document.createElement("td");
  role.textContent = hitbox.role;
  const status = document.createElement("td");
  status.textContent = `${hitbox.enabled ? "enabled" : "disabled"} / ${hitbox.visible ? "visible" : "hidden"}`;
  row.append(name, role, status);
  return row;
}

function tableMessage(message) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 3;
  cell.textContent = message;
  row.append(cell);
  return row;
}

function renderHitboxList() {
  if (!elements.hitboxList) {
    return;
  }
  const hitboxes = filteredHitboxes();
  if (!selectedObjectA()) {
    elements.hitboxList.replaceChildren(tableMessage("Select Object A."));
    return;
  }
  if (!hitboxes.length) {
    elements.hitboxList.replaceChildren(tableMessage("Add Rectangle to create the first hitbox."));
    return;
  }
  elements.hitboxList.replaceChildren(...hitboxes.map(hitboxRow));
}

function fieldByName(name) {
  return elements.hitboxFields.find((field) => field.dataset.hitboxesField === name) || null;
}

function collisionField(name) {
  return elements.collisionFields.find((field) => field.dataset.hitboxesCollisionField === name) || null;
}

function motionField(name) {
  return elements.motionFields.find((field) => field.dataset.hitboxesMotionField === name) || null;
}

function renderInspector() {
  const object = selectedObjectA();
  const hitbox = selectedHitbox();
  setText(elements.metaName, objectLabel(object));
  setText(elements.metaKey, object?.key || "None");
  setText(elements.metaVisual, object ? visualLabel(object.visual) : "None");
  setText(elements.metaBounds, object ? boundsText(object.bounds) : "None");
  setText(elements.metaOrigin, object ? originText(object.origin) : "None");

  elements.hitboxFields.forEach((field) => {
    const name = field.dataset.hitboxesField;
    if (!name) {
      return;
    }
    field.disabled = !hitbox;
    if (field.type === "checkbox") {
      field.checked = Boolean(hitbox?.[name]);
    } else {
      field.value = hitbox ? hitbox[name] : "";
    }
  });
  if (elements.deleteButton) {
    elements.deleteButton.disabled = !hitbox;
  }
}

function renderControls() {
  Object.entries(state.collision).forEach(([key, value]) => {
    const field = collisionField(key);
    if (field) {
      field.value = value;
    }
  });
  Object.entries(state.motion).forEach(([key, value]) => {
    const field = motionField(key);
    if (field) {
      field.value = value;
    }
  });
}

function renderStatus() {
  const source = state.usingDevSamples
    ? "DEV review/test data from Local API."
    : state.objects.length
      ? "Objects loaded from Local API."
      : EMPTY_STATE;
  setText(elements.sourceStatus, source);
  setText(elements.objectSummary, state.sourceWarning || (selectedObjectA() ? `${objectLabel(selectedObjectA())} is ready for hitbox editing.` : EMPTY_STATE));
  setText(elements.previewTitle, selectedObjectA() ? objectLabel(selectedObjectA()) : "No Object selected");
  setText(elements.previewSummary, selectedObjectA()
    ? `${visualLabel(selectedObjectA().visual)} with bounding box ${boundsText(selectedObjectA().bounds)} and origin ${originText(selectedObjectA().origin)}.`
    : EMPTY_STATE);
  setText(elements.objectCount, String(state.objects.length));
  setText(elements.staticOutput, state.staticResult);
  setText(elements.collisionResult, state.staticResult);
  setText(elements.motionResult, state.motionPreview?.message || "Not run");
  setText(elements.motionOutput, state.motionPreview?.details || "No collision on path.");
  setText(elements.saveStatus, `Unsaved changes: ${state.unsaved ? "yes" : "none"} | Save: ${state.saveStatus}`);
  setText(elements.status, `Object A: ${objectLabel(selectedObjectA())} | Object B: ${objectLabel(selectedObjectB())} | Hitbox: ${selectedHitbox()?.name || "None"} | Collision: ${state.staticResult} | Save: ${state.saveStatus}`);
}

function render() {
  renderObjectSelectors();
  renderHitboxList();
  renderInspector();
  renderControls();
  renderStatus();
  draw();
}

function objectBox(object, x, y) {
  if (!object) {
    return null;
  }
  return normalizeBoundingBox({
    height: object.bounds.height,
    width: object.bounds.width,
    x,
    y,
  });
}

function selectedHitboxBox() {
  const hitbox = selectedHitbox();
  if (!hitbox) {
    const object = selectedObjectA();
    return object ? objectBox(object, state.collision.objectAX, state.collision.objectAY) : null;
  }
  return normalizeBoundingBox({
    height: hitbox.height,
    width: hitbox.width,
    x: state.collision.objectAX + hitbox.x,
    y: state.collision.objectAY + hitbox.y,
  });
}

function objectBTargetBox(useMotion = false) {
  const object = selectedObjectB();
  const x = useMotion ? state.motion.targetX : state.collision.objectBX;
  const y = useMotion ? state.motion.targetY : state.collision.objectBY;
  return objectBox(object, x, y);
}

function drawBackground() {
  if (!context || !elements.canvas) {
    return;
  }
  context.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
  context.strokeStyle = "#d1d5db";
  context.lineWidth = 1;
  for (let x = 0; x <= elements.canvas.width; x += 20) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, elements.canvas.height);
    context.stroke();
  }
  for (let y = 0; y <= elements.canvas.height; y += 20) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(elements.canvas.width, y);
    context.stroke();
  }
}

function drawObject(object, x, y, label) {
  if (!context || !object) {
    return;
  }
  loadObjectImage(object);
  const bounds = objectBox(object, x, y);
  const imageRecord = state.images.get(object.key);
  if (imageRecord?.loaded && imageRecord.image) {
    context.drawImage(imageRecord.image, bounds.x, bounds.y, bounds.width, bounds.height);
  } else {
    context.fillStyle = object.devSample ? "#fef3c7" : "#e0f2fe";
    context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    context.fillStyle = "#111827";
    context.font = "12px sans-serif";
    context.fillText(object.devSample ? "DEV sample" : "Visual metadata", bounds.x + 4, bounds.y + 14);
    context.fillText(DEV_PENDING_RENDER, bounds.x + 4, bounds.y + 30);
  }
  context.strokeStyle = "#111827";
  context.lineWidth = 2;
  context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  context.fillStyle = "#111827";
  context.font = "12px sans-serif";
  context.fillText(label, bounds.x, Math.max(12, bounds.y - 6));
  const originX = bounds.x + finiteNumber(object.origin?.x, 0);
  const originY = bounds.y + finiteNumber(object.origin?.y, 0);
  context.strokeStyle = "#0f766e";
  context.beginPath();
  context.moveTo(originX - 6, originY);
  context.lineTo(originX + 6, originY);
  context.moveTo(originX, originY - 6);
  context.lineTo(originX, originY + 6);
  context.stroke();
}

function hitboxColor(hitbox) {
  return ROLE_COLORS[hitbox.role] || ROLE_COLORS.hitbox;
}

function drawHitboxes() {
  if (!context || !selectedObjectA()) {
    return;
  }
  state.hitboxes.forEach((hitbox) => {
    if (hitbox.visible === false) {
      return;
    }
    const x = state.collision.objectAX + hitbox.x;
    const y = state.collision.objectAY + hitbox.y;
    context.globalAlpha = hitbox.enabled === false ? 0.35 : 1;
    context.strokeStyle = hitboxColor(hitbox);
    context.lineWidth = hitbox.key === state.selectedHitboxKey ? 4 : 2;
    context.strokeRect(x, y, hitbox.width, hitbox.height);
    context.fillStyle = hitboxColor(hitbox);
    context.globalAlpha = hitbox.key === state.selectedHitboxKey ? 0.18 : 0.08;
    context.fillRect(x, y, hitbox.width, hitbox.height);
    context.globalAlpha = 1;
    if (hitbox.key === state.selectedHitboxKey) {
      context.fillStyle = hitboxColor(hitbox);
      context.fillRect(x + hitbox.width - 8, y + hitbox.height - 8, 8, 8);
    }
  });
}

function drawMotionPreview() {
  if (!context || !state.motionPreview) {
    return;
  }
  const preview = state.motionPreview;
  context.strokeStyle = preview.collided ? "#dc2626" : "#2563eb";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(preview.startPosition.x, preview.startPosition.y);
  context.lineTo(preview.endPosition.x, preview.endPosition.y);
  context.stroke();
  preview.framePositions.forEach((position, index) => {
    context.fillStyle = index === preview.impactFrame ? "#dc2626" : "#2563eb";
    context.beginPath();
    context.arc(position.x, position.y, 4, 0, Math.PI * 2);
    context.fill();
  });
  if (preview.impactPosition) {
    context.strokeStyle = "#dc2626";
    context.lineWidth = 2;
    context.strokeRect(preview.impactPosition.x, preview.impactPosition.y, preview.boxSize.width, preview.boxSize.height);
  }
}

function draw() {
  drawBackground();
  drawObject(selectedObjectB(), state.collision.objectBX, state.collision.objectBY, "Object B");
  drawObject(selectedObjectA(), state.collision.objectAX, state.collision.objectAY, "Object A");
  drawHitboxes();
  drawMotionPreview();
}

function setDefaultPositions() {
  const objectA = selectedObjectA();
  const objectB = selectedObjectB();
  state.collision.objectAX = finiteNumber(objectA?.bounds?.x, 0);
  state.collision.objectAY = finiteNumber(objectA?.bounds?.y, 0);
  state.collision.objectBX = finiteNumber(objectB?.bounds?.x, 0);
  state.collision.objectBY = finiteNumber(objectB?.bounds?.y, 50);
  state.motion.startX = state.collision.objectAX;
  state.motion.startY = state.collision.objectAY;
  state.motion.targetX = state.collision.objectBX;
  state.motion.targetY = state.collision.objectBY;
}

function loadHitboxes() {
  if (!state.selectedAKey) {
    state.hitboxes = [];
    state.selectedHitboxKey = "";
    render();
    return;
  }
  const result = repository.listHitboxes(state.selectedAKey);
  state.hitboxes = Array.isArray(result) ? result : [];
  state.selectedHitboxKey = state.hitboxes[0]?.key || "";
  state.unsaved = false;
  state.saveStatus = "loaded";
  setDefaultPositions();
  render();
}

function selectObjectA(key) {
  state.selectedAKey = key;
  state.motionPreview = null;
  state.staticResult = "Not tested";
  loadHitboxes();
}

function selectObjectB(key) {
  state.selectedBKey = key;
  setDefaultPositions();
  state.motionPreview = null;
  state.staticResult = "Not tested";
  render();
}

function newDraftKey() {
  return `draft-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function addRectangle() {
  const object = selectedObjectA();
  if (!object) {
    state.saveStatus = "Select Object A before adding a hitbox.";
    renderStatus();
    return;
  }
  const width = Math.max(10, Math.min(48, object.bounds.width));
  const height = Math.max(10, Math.min(32, object.bounds.height));
  const hitbox = {
    enabled: true,
    height,
    key: newDraftKey(),
    name: `Hitbox ${state.hitboxes.length + 1}`,
    role: "hitbox",
    visible: true,
    width,
    x: Math.max(0, Math.round((object.bounds.width - width) / 2)),
    y: Math.max(0, Math.round((object.bounds.height - height) / 2)),
  };
  state.hitboxes = [...state.hitboxes, hitbox];
  state.selectedHitboxKey = hitbox.key;
  state.unsaved = true;
  state.saveStatus = "draft";
  render();
}

function updateSelectedHitbox(patch) {
  const hitbox = selectedHitbox();
  if (!hitbox) {
    return;
  }
  state.hitboxes = state.hitboxes.map((candidate) => (
    candidate.key === hitbox.key
      ? {
          ...candidate,
          ...patch,
          height: Math.max(1, finiteNumber(patch.height ?? candidate.height, candidate.height)),
          role: ROLES.includes(patch.role) ? patch.role : candidate.role,
          width: Math.max(1, finiteNumber(patch.width ?? candidate.width, candidate.width)),
          x: finiteNumber(patch.x ?? candidate.x, candidate.x),
          y: finiteNumber(patch.y ?? candidate.y, candidate.y),
        }
      : candidate
  ));
  state.unsaved = true;
  state.saveStatus = "draft";
  render();
}

function deleteSelectedHitbox() {
  const hitbox = selectedHitbox();
  if (!hitbox) {
    return;
  }
  state.hitboxes = state.hitboxes.filter((candidate) => candidate.key !== hitbox.key);
  state.selectedHitboxKey = state.hitboxes[0]?.key || "";
  state.unsaved = true;
  state.saveStatus = "draft";
  render();
}

function validateHitboxes() {
  const invalid = state.hitboxes.find((hitbox) => hitbox.width <= 0 || hitbox.height <= 0);
  if (invalid) {
    return `${invalid.name} must have positive width and height.`;
  }
  return "";
}

function redirectGuestToSignIn() {
  window.location.href = "/account/sign-in.html";
}

function saveHitboxes() {
  const object = selectedObjectA();
  if (!object) {
    state.saveStatus = "Select Object A before saving.";
    renderStatus();
    return;
  }
  const validationMessage = validateHitboxes();
  if (validationMessage) {
    state.saveStatus = validationMessage;
    renderStatus();
    return;
  }
  const session = getSessionCurrent();
  if (!session?.authenticated || new URLSearchParams(window.location.search).get("guest") === "1") {
    redirectGuestToSignIn();
    return;
  }
  const payload = state.hitboxes.map((hitbox) => ({
    enabled: hitbox.enabled,
    height: hitbox.height,
    key: hitbox.key.startsWith("draft-") ? "" : hitbox.key,
    name: hitbox.name,
    role: hitbox.role,
    visible: hitbox.visible,
    width: hitbox.width,
    x: hitbox.x,
    y: hitbox.y,
  }));
  const result = repository.saveHitboxes(object.key, payload);
  if (!result?.saved || !Array.isArray(result.hitboxes)) {
    state.saveStatus = result?.message || "Save failed through Local API.";
    renderStatus();
    return;
  }
  state.hitboxes = result.hitboxes;
  state.selectedHitboxKey = state.hitboxes[0]?.key || "";
  state.unsaved = false;
  state.saveStatus = "saved";
  render();
}

function runStaticCollision() {
  const left = selectedHitboxBox();
  const right = objectBTargetBox(false);
  if (!left || !right) {
    state.staticResult = "Select Object A and Object B.";
    render();
    return;
  }
  state.staticResult = aabbContactState(left, right).state;
  render();
}

function motionBox() {
  const hitbox = selectedHitbox();
  const object = selectedObjectA();
  const width = hitbox?.width || object?.bounds?.width || 10;
  const height = hitbox?.height || object?.bounds?.height || 10;
  return {
    height,
    width,
    x: state.motion.startX,
    y: state.motion.startY,
  };
}

function runMotionPreview() {
  const movingBox = motionBox();
  const target = selectedObjectB();
  if (!selectedObjectA() || !target) {
    state.motionPreview = {
      details: "Select Object A and Object B before running motion preview.",
      message: "No collision on path.",
    };
    render();
    return;
  }
  const direction = {
    x: finiteNumber(state.motion.velocityX, 0),
    y: finiteNumber(state.motion.velocityY, 0),
  };
  const velocity = {
    x: direction.x * finiteNumber(state.motion.speed, 0),
    y: direction.y * finiteNumber(state.motion.speed, 0),
  };
  const result = sweptAabb({
    movingBox,
    targetBox: {
      height: target.bounds.height,
      width: target.bounds.width,
      x: state.motion.targetX,
      y: state.motion.targetY,
    },
    velocity,
  });
  const stepCount = Math.max(1, Math.floor(finiteNumber(state.motion.stepCount, 1)));
  const framePositions = Array.from({ length: stepCount + 1 }, (_, index) => ({
    x: movingBox.x + (velocity.x * index) / stepCount,
    y: movingBox.y + (velocity.y * index) / stepCount,
  }));
  const impactFrame = result.collided
    ? Math.max(0, Math.ceil(result.collisionTime * stepCount))
    : -1;
  const message = result.collided ? "Collision detected before the next frame" : "No collision on path.";
  state.motionPreview = {
    afterPosition: result.afterPosition,
    beforePosition: result.beforePosition,
    boxSize: { height: movingBox.height, width: movingBox.width },
    collided: result.collided,
    details: result.collided
      ? `${message}. Impact frame ${impactFrame}, time ${result.collisionTime}, point ${result.impactPoint.x},${result.impactPoint.y}, normal ${result.impactNormal.x},${result.impactNormal.y}, before ${result.beforePosition.x},${result.beforePosition.y}, after ${result.afterPosition.x},${result.afterPosition.y}.`
      : `${message} Before ${result.beforePosition.x},${result.beforePosition.y}; after ${result.afterPosition.x},${result.afterPosition.y}.`,
    endPosition: result.endPosition,
    framePositions,
    impactFrame,
    impactPosition: result.impactPosition,
    message,
    startPosition: result.startPosition,
  };
  render();
}

function resetMotionPreview() {
  state.motion = {
    frameRate: 60,
    speed: 100,
    startX: 0,
    startY: 0,
    stepCount: 1,
    targetX: 0,
    targetY: 50,
    velocityX: 0,
    velocityY: 1,
  };
  state.motionPreview = null;
  render();
}

function stepMotionPreview() {
  state.motion.startX += finiteNumber(state.motion.velocityX, 0) * finiteNumber(state.motion.speed, 0);
  state.motion.startY += finiteNumber(state.motion.velocityY, 0) * finiteNumber(state.motion.speed, 0);
  runMotionPreview();
}

function hitboxAtPoint(point) {
  for (let index = state.hitboxes.length - 1; index >= 0; index -= 1) {
    const hitbox = state.hitboxes[index];
    const x = state.collision.objectAX + hitbox.x;
    const y = state.collision.objectAY + hitbox.y;
    if (point.x >= x && point.x <= x + hitbox.width && point.y >= y && point.y <= y + hitbox.height) {
      return hitbox;
    }
  }
  return null;
}

function hitboxResizeHandle(point, hitbox) {
  if (!hitbox) {
    return false;
  }
  const x = state.collision.objectAX + hitbox.x + hitbox.width;
  const y = state.collision.objectAY + hitbox.y + hitbox.height;
  return Math.abs(point.x - x) <= 10 && Math.abs(point.y - y) <= 10;
}

function onPointerDown(event) {
  const point = canvasPoint(event);
  const hitbox = hitboxAtPoint(point);
  if (!hitbox) {
    return;
  }
  state.selectedHitboxKey = hitbox.key;
  const mode = hitboxResizeHandle(point, hitbox) ? "resize" : "move";
  state.drag = {
    mode,
    pointer: point,
    start: { ...hitbox },
  };
  elements.canvas.setPointerCapture?.(event.pointerId);
  render();
}

function onPointerMove(event) {
  if (!state.drag) {
    return;
  }
  const point = canvasPoint(event);
  const dx = Math.round(point.x - state.drag.pointer.x);
  const dy = Math.round(point.y - state.drag.pointer.y);
  if (state.drag.mode === "resize") {
    updateSelectedHitbox({
      height: Math.max(1, state.drag.start.height + dy),
      width: Math.max(1, state.drag.start.width + dx),
    });
  } else {
    updateSelectedHitbox({
      x: state.drag.start.x + dx,
      y: state.drag.start.y + dy,
    });
  }
}

function onPointerUp(event) {
  if (!state.drag) {
    return;
  }
  state.drag = null;
  elements.canvas.releasePointerCapture?.(event.pointerId);
}

function handleHitboxField(event) {
  const field = event.target;
  const name = field.dataset.hitboxesField;
  if (!name) {
    return;
  }
  if (field.type === "checkbox") {
    updateSelectedHitbox({ [name]: field.checked });
    return;
  }
  if (["x", "y", "width", "height"].includes(name)) {
    updateSelectedHitbox({ [name]: finiteNumber(field.value, 0) });
    return;
  }
  updateSelectedHitbox({ [name]: field.value });
}

function handleCollisionField(event) {
  const name = event.target.dataset.hitboxesCollisionField;
  if (!name) {
    return;
  }
  state.collision[name] = finiteNumber(event.target.value, 0);
  state.staticResult = "Not tested";
  render();
}

function handleMotionField(event) {
  const name = event.target.dataset.hitboxesMotionField;
  if (!name) {
    return;
  }
  state.motion[name] = finiteNumber(event.target.value, 0);
  state.motionPreview = null;
  render();
}

function bindEvents() {
  elements.objectA?.addEventListener("change", () => selectObjectA(elements.objectA.value));
  elements.objectB?.addEventListener("change", () => selectObjectB(elements.objectB.value));
  elements.addRectangle?.addEventListener("click", addRectangle);
  elements.deleteButton?.addEventListener("click", deleteSelectedHitbox);
  elements.filter?.addEventListener("change", () => {
    state.filter = elements.filter.value;
    renderHitboxList();
  });
  elements.hitboxList?.addEventListener("click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-hitboxes-select-button]") : null;
    if (!button) {
      return;
    }
    state.selectedHitboxKey = button.dataset.hitboxesSelectButton || "";
    render();
  });
  elements.hitboxFields.forEach((field) => field.addEventListener("input", handleHitboxField));
  elements.collisionFields.forEach((field) => field.addEventListener("input", handleCollisionField));
  elements.motionFields.forEach((field) => field.addEventListener("input", handleMotionField));
  elements.saveButton?.addEventListener("click", saveHitboxes);
  elements.runStatic?.addEventListener("click", runStaticCollision);
  elements.runMotion?.addEventListener("click", runMotionPreview);
  elements.runMotionAlt?.addEventListener("click", runMotionPreview);
  elements.stepMotion?.addEventListener("click", stepMotionPreview);
  elements.resetMotion?.addEventListener("click", resetMotionPreview);
  elements.canvas?.addEventListener("pointerdown", onPointerDown);
  elements.canvas?.addEventListener("pointermove", onPointerMove);
  elements.canvas?.addEventListener("pointerup", onPointerUp);
  elements.canvas?.addEventListener("pointercancel", onPointerUp);
}

function loadSourceObjects() {
  const result = repository.listSourceObjects();
  if (!result || !Array.isArray(result.objects)) {
    state.objects = [];
    state.sourceWarning = result?.message || "Hitboxes Local API source objects are unavailable.";
    render();
    return;
  }
  state.objects = result.objects;
  state.usingDevSamples = Boolean(result.usingDevSamples);
  state.sourceWarning = result.warning || "";
  state.selectedAKey = state.objects[0]?.key || "";
  state.selectedBKey = state.objects[1]?.key || state.objects[0]?.key || "";
  setDefaultPositions();
  loadHitboxes();
}

bindEvents();
loadSourceObjects();
