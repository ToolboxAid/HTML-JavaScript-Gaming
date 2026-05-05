const ASSET_BROWSER_SCHEMA_PATH = "/tools/schemas/tools/asset-browser.schema.json";
const BEZEL_ASSET_KEY_PATTERN = /^image\.[a-z0-9-]+\.[a-z0-9-]+(?:\.[a-z0-9-]+)*\.bezel$/;
const ASSET_KEY_PATTERN = /^(?!image\.[a-z0-9-]+\.[a-z0-9-]+(?:\.[a-z0-9-]+)*\.bezel$)(image|audio|font|svg|data|other)\.[a-z0-9-]+\.[a-z0-9-]+(?:\.[a-z0-9-]+)*$/;
const ASSET_KINDS = Object.freeze(["image", "audio", "font", "svg", "data", "other"]);
const ASSET_SOURCES = Object.freeze(["workspace-manager", "asset-browser", "manifest"]);

const refs = Object.freeze({
  generateButton: document.getElementById("generatePreviewButton"),
  applyButton: document.getElementById("applyToGameButton"),
  exportButton: document.getElementById("exportImageButton"),
  targetRadios: Array.from(document.querySelectorAll('input[name="previewTarget"]')),
  targetInput: document.getElementById("previewTargetInput"),
  sourceUrlInput: document.getElementById("previewSourceUrlInput"),
  previewModeRadios: Array.from(document.querySelectorAll('input[name="previewMode"]')),
  outputNameInput: document.getElementById("previewOutputNameInput"),
  loadDestinationButton: document.getElementById("loadDestinationDataButton"),
  destinationInput: document.getElementById("destinationDataInput"),
  destinationStatus: document.getElementById("destinationDataStatus"),
  status: document.getElementById("previewStatus"),
  errorList: document.getElementById("previewErrorList"),
  canvas: document.getElementById("previewCanvas"),
  emptyState: document.getElementById("previewEmptyState"),
  lastGeneratedImage: document.getElementById("lastGeneratedPreviewImage"),
  lastGeneratedMeta: document.getElementById("lastGeneratedPreviewMeta"),
  summaryMode: document.getElementById("previewSummaryMode"),
  summaryDestination: document.getElementById("previewSummaryDestination"),
  summaryImage: document.getElementById("previewSummaryImage")
});

const state = {
  targetMode: null,
  targetText: "",
  sourceUrl: "",
  previewMode: "canvas",
  outputName: "preview.svg",
  destinationData: null,
  destinationValid: false,
  destinationErrors: [],
  schemaAvailable: false,
  generated: null,
  applied: false
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function setStatus(message, mode = "neutral") {
  refs.status.textContent = message;
  refs.status.classList.toggle("is-valid", mode === "valid");
  refs.status.classList.toggle("is-invalid", mode === "invalid");
}

function setDestinationStatus(message, mode = "neutral") {
  refs.destinationStatus.textContent = message;
  refs.destinationStatus.classList.toggle("is-valid", mode === "valid");
  refs.destinationStatus.classList.toggle("is-invalid", mode === "invalid");
}

function setErrors(errors) {
  refs.errorList.replaceChildren();
  errors.forEach((error) => {
    const item = document.createElement("li");
    item.textContent = error;
    refs.errorList.append(item);
  });
}

function getSelectedRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected instanceof HTMLInputElement ? selected.value : null;
}

function getPreviewMode() {
  return getSelectedRadioValue("previewMode") || "canvas";
}

function normalizeGameId(value) {
  return String(value || "")
    .trim()
    .replace(/^games[\\/]/i, "")
    .replace(/[\\/](index\.html?)?$/i, "")
    .split(/[\\/]/)[0]
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveGameFolder(value) {
  const rawValue = String(value || "").trim();
  const withoutPrefix = rawValue.replace(/^games[\\/]/i, "");
  const firstSegment = withoutPrefix.split(/[\\/]/)[0] || withoutPrefix;
  return firstSegment.trim();
}

function getAssetEntryKeyForGame(gameName) {
  const normalized = normalizeGameId(gameName);
  return normalized ? `image.${normalized}.preview` : "";
}

function getPreviewPathForGame(gameName) {
  const folder = resolveGameFolder(gameName);
  return folder ? `games/${folder}/assets/images/preview.svg` : "";
}

function validateAssetEntry(key, value) {
  const errors = [];
  const isBezel = BEZEL_ASSET_KEY_PATTERN.test(key);
  const isAsset = ASSET_KEY_PATTERN.test(key);
  if (!isBezel && !isAsset) {
    errors.push(`Invalid asset key: ${key}`);
  }
  if (!isPlainObject(value)) {
    errors.push(`Asset ${key} must be an object.`);
    return errors;
  }

  const requiredFields = ["path", "kind", "source"];
  requiredFields.forEach((field) => {
    if (!(field in value)) {
      errors.push(`Asset ${key} is missing ${field}.`);
    }
  });

  const allowedFields = new Set(["path", "kind", "source", "stretchOverride"]);
  Object.keys(value).forEach((field) => {
    if (!allowedFields.has(field)) {
      errors.push(`Asset ${key} has unsupported field ${field}.`);
    }
  });

  if (typeof value.path !== "string" || value.path.trim() === "") {
    errors.push(`Asset ${key} path must be a non-empty string.`);
  }
  if (!ASSET_KINDS.includes(value.kind)) {
    errors.push(`Asset ${key} kind is not allowed.`);
  }
  if (!ASSET_SOURCES.includes(value.source)) {
    errors.push(`Asset ${key} source is not allowed.`);
  }
  if (!isBezel && Object.hasOwn(value, "stretchOverride")) {
    errors.push(`Asset ${key} cannot use stretchOverride.`);
  }
  if (Object.hasOwn(value, "stretchOverride")) {
    const stretch = value.stretchOverride;
    if (!isPlainObject(stretch) || typeof stretch.uniformEdgeStretchPx !== "number" || stretch.uniformEdgeStretchPx < 0) {
      errors.push(`Asset ${key} stretchOverride is invalid.`);
    }
    if (isPlainObject(stretch)) {
      Object.keys(stretch).forEach((field) => {
        if (field !== "uniformEdgeStretchPx") {
          errors.push(`Asset ${key} stretchOverride has unsupported field ${field}.`);
        }
      });
    }
  }
  return errors;
}

function validateAssetBrowserPayload(payload) {
  const errors = [];
  if (!isPlainObject(payload)) {
    return { valid: false, errors: ["Destination data must be an object."] };
  }

  const allowedTopLevel = new Set(["assets", "assetBrowserPreset", "approvedAssets", "importHubPreset"]);
  Object.keys(payload).forEach((field) => {
    if (!allowedTopLevel.has(field)) {
      errors.push(`Unsupported top-level field: ${field}`);
    }
  });

  if (!isPlainObject(payload.assets)) {
    errors.push("Destination data must include an assets object.");
  } else {
    Object.entries(payload.assets).forEach(([key, value]) => {
      errors.push(...validateAssetEntry(key, value));
    });
  }

  return { valid: errors.length === 0, errors };
}

function validateForGenerate() {
  const errors = [];
  if (!state.targetMode) {
    errors.push("Select a target mode.");
  }
  if (!state.targetText) {
    errors.push("Enter a target name or path.");
  }
  if (state.outputName !== "preview.svg") {
    errors.push("Output file must be preview.svg for this pass.");
  }
  if (state.targetMode === "game") {
    if (!state.schemaAvailable) {
      errors.push("Destination schema is not available.");
    }
    if (!state.destinationValid) {
      errors.push("Load valid destination data before generating a game preview.");
    }
    if (!getAssetEntryKeyForGame(state.targetText)) {
      errors.push("Game target cannot produce a valid asset key.");
    }
  }
  return errors;
}

function updateStateFromControls() {
  state.targetMode = getSelectedRadioValue("previewTarget");
  state.targetText = refs.targetInput.value.trim();
  state.sourceUrl = refs.sourceUrlInput.value.trim();
  state.previewMode = getPreviewMode();
  state.outputName = refs.outputNameInput.value.trim();
}

function updateSummary() {
  refs.summaryMode.textContent = state.targetMode
    ? `${state.targetMode} / ${state.previewMode}`
    : "Not selected";
  refs.summaryDestination.textContent = state.targetMode === "game"
    ? (state.destinationValid ? "Ready for Game" : "Not ready")
    : "No destination update";
  refs.summaryImage.textContent = state.generated
    ? `${state.generated.width}x${state.generated.height}`
    : "Not generated";
}

function updateButtons() {
  updateStateFromControls();
  const generateErrors = validateForGenerate();
  refs.generateButton.disabled = generateErrors.length > 0;
  refs.applyButton.disabled = !(state.targetMode === "game" && state.generated && state.destinationValid);
  refs.exportButton.disabled = !state.generated;
  updateSummary();
}

function clearGeneratedPreview() {
  state.generated = null;
  state.applied = false;
  refs.lastGeneratedImage.removeAttribute("src");
  refs.lastGeneratedMeta.textContent = "No generated preview.";
  refs.emptyState.classList.remove("is-hidden");
}

function drawGeneratedPreview() {
  const context = refs.canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering context unavailable.");
  }

  const width = refs.canvas.width;
  const height = refs.canvas.height;
  const targetLabel = state.targetText;
  const targetModeLabel = state.targetMode ? state.targetMode.toUpperCase() : "UNKNOWN";
  const sourceLabel = state.sourceUrl || "No source URL provided";
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#111827");
  gradient.addColorStop(0.46, "#263859");
  gradient.addColorStop(1, "#7f1d1d");

  context.clearRect(0, 0, width, height);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(255,255,255,0.36)";
  context.lineWidth = 8;
  context.strokeRect(24, 24, width - 48, height - 48);

  context.fillStyle = "#ffffff";
  context.font = "700 54px system-ui, sans-serif";
  context.fillText("Preview Generator V2", 56, 116);
  context.font = "700 42px system-ui, sans-serif";
  context.fillText(targetLabel.slice(0, 34), 56, 224);
  context.font = "600 26px system-ui, sans-serif";
  context.fillStyle = "#ddd6fe";
  context.fillText(`Target: ${targetModeLabel}`, 56, 286);
  context.fillText(`Mode: ${state.previewMode}`, 56, 326);
  context.fillText(sourceLabel.slice(0, 62), 56, 366);

  const dataUrl = refs.canvas.toDataURL("image/png");
  const generatedAt = new Date().toISOString();
  state.generated = {
    dataUrl,
    generatedAt,
    width,
    height,
    targetMode: state.targetMode,
    targetText: state.targetText
  };
  state.applied = false;

  refs.lastGeneratedImage.src = dataUrl;
  refs.lastGeneratedMeta.textContent = `${targetModeLabel} | ${targetLabel} | ${generatedAt}`;
  refs.emptyState.classList.add("is-hidden");
}

function buildUpdatedDestinationData() {
  if (state.targetMode !== "game" || !state.generated || !state.destinationValid) {
    return { valid: false, errors: ["Game preview and valid destination data are required."] };
  }

  const nextData = cloneJson(state.destinationData);
  nextData.assets = isPlainObject(nextData.assets) ? nextData.assets : {};
  const assetKey = getAssetEntryKeyForGame(state.targetText);
  const path = getPreviewPathForGame(state.targetText);
  nextData.assets[assetKey] = {
    path,
    kind: "image",
    source: "asset-browser"
  };

  const validation = validateAssetBrowserPayload(nextData);
  return {
    valid: validation.valid,
    errors: validation.errors,
    data: nextData,
    assetKey,
    path
  };
}

function handleGeneratePreview() {
  updateStateFromControls();
  const errors = validateForGenerate();
  if (errors.length > 0) {
    setErrors(errors);
    setStatus("Preview generation blocked.", "invalid");
    return;
  }

  setErrors([]);
  drawGeneratedPreview();
  setStatus("Preview generated.", "valid");
  updateButtons();
}

function handleApplyToGame() {
  updateStateFromControls();
  const result = buildUpdatedDestinationData();
  if (!result.valid) {
    setErrors(result.errors);
    setStatus("Apply to Game blocked.", "invalid");
    return;
  }

  state.destinationData = result.data;
  state.destinationValid = true;
  state.destinationErrors = [];
  state.applied = true;
  setErrors([]);
  setStatus(`Applied preview asset ${result.assetKey}.`, "valid");
  setDestinationStatus(`Destination data updated: ${result.assetKey}`, "valid");
  updateButtons();
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function handleExportImage() {
  if (!state.generated) {
    setErrors(["Generate a preview before exporting."]);
    setStatus("Export blocked.", "invalid");
    return;
  }

  const svgText = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${state.generated.width}" height="${state.generated.height}" viewBox="0 0 ${state.generated.width} ${state.generated.height}">`,
    `  <image href="${state.generated.dataUrl}" width="100%" height="100%" />`,
    "</svg>"
  ].join("\n");
  downloadBlob(new Blob([svgText], { type: "image/svg+xml" }), "preview.svg");
  setStatus("Image export started.", "valid");
}

function setDestinationData(payload) {
  const cloned = cloneJson(payload);
  const validation = validateAssetBrowserPayload(cloned);
  state.destinationData = validation.valid ? cloned : null;
  state.destinationValid = validation.valid;
  state.destinationErrors = validation.errors.slice();
  state.generated = null;
  state.applied = false;
  if (validation.valid) {
    setDestinationStatus("Destination data is valid.", "valid");
    setErrors([]);
  } else {
    setDestinationStatus("Destination data failed validation.", "invalid");
    setErrors(validation.errors);
  }
  clearGeneratedPreview();
  updateButtons();
  return validation;
}

async function handleDestinationFileSelected() {
  const file = refs.destinationInput.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    setDestinationData(parsed);
  } catch (error) {
    state.destinationData = null;
    state.destinationValid = false;
    state.destinationErrors = [error instanceof Error ? error.message : String(error)];
    setDestinationStatus("Destination data could not be loaded.", "invalid");
    setErrors(state.destinationErrors);
    clearGeneratedPreview();
    updateButtons();
  } finally {
    refs.destinationInput.value = "";
  }
}

async function loadDestinationSchema() {
  try {
    const response = await fetch(ASSET_BROWSER_SCHEMA_PATH, { cache: "no-store" });
    state.schemaAvailable = response.ok;
  } catch {
    state.schemaAvailable = false;
  }
  updateButtons();
}

function handleInputChanged() {
  updateStateFromControls();
  clearGeneratedPreview();
  setErrors([]);
  if (!state.targetMode) {
    setStatus("Select a target mode to begin.");
  } else if (state.targetMode === "game" && !state.destinationValid) {
    setStatus("Game mode requires valid destination data before rendering.");
  } else if (!state.targetText) {
    setStatus("Enter a target name or path.");
  } else {
    setStatus("Ready to generate preview.", "valid");
  }
  updateButtons();
}

function bindEvents() {
  refs.targetRadios.forEach((radio) => {
    radio.addEventListener("change", handleInputChanged);
  });
  refs.previewModeRadios.forEach((radio) => {
    radio.addEventListener("change", handleInputChanged);
  });
  refs.targetInput.addEventListener("input", handleInputChanged);
  refs.sourceUrlInput.addEventListener("input", handleInputChanged);
  refs.outputNameInput.addEventListener("input", handleInputChanged);
  refs.generateButton.addEventListener("click", handleGeneratePreview);
  refs.applyButton.addEventListener("click", handleApplyToGame);
  refs.exportButton.addEventListener("click", handleExportImage);
  refs.loadDestinationButton.addEventListener("click", () => refs.destinationInput.click());
  refs.destinationInput.addEventListener("change", () => {
    void handleDestinationFileSelected();
  });
}

function initPreviewGeneratorV2() {
  bindEvents();
  clearGeneratedPreview();
  setErrors([]);
  setStatus("Select a target mode to begin.");
  setDestinationStatus("No destination data loaded.");
  updateButtons();
  void loadDestinationSchema();

  globalThis.previewGeneratorV2App = Object.freeze({
    getState: () => cloneJson(state),
    getDestinationData: () => (state.destinationData ? cloneJson(state.destinationData) : null),
    setDestinationData,
    validateAssetBrowserPayload
  });
}

initPreviewGeneratorV2();
