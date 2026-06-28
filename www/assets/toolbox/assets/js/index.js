import {
  ASSET_CATALOG_TYPES,
  ASSET_USAGE_OPTIONS,
  createAssetToolApiRepository
} from "../../../js/shared/assets-api-client.js";
import { getSessionCurrent } from "../../../../../src/api/session-api-client.js";

const repository = createAssetToolApiRepository();
const params = new URLSearchParams(window.location.search);

if (params.get("handoff") === "missing") {
  repository.makeMissingGameConfiguration();
} else if (params.get("handoff") === "invalid") {
  repository.makeInvalidGameConfiguration();
}
if (params.get("uploadWrite") === "unsupported") {
  repository.setUploadFileWriteSupport(false);
}
if (isBrowserValidationHost() && params.get("uploadPath") === "escape") {
  repository.setUnsafeUploadPathForTest(true);
}
if (isBrowserValidationHost() && params.get("deletePath") === "escape") {
  repository.setUnsafeDeletePathForTest(true);
}

const elements = {
  accordions: document.querySelector("[data-asset-type-accordions]"),
  count: document.querySelector("[data-asset-tool-count]"),
  libraryStatus: document.querySelector("[data-asset-tool-library-status]"),
  log: document.querySelector("[data-asset-tool-log]"),
  accountPrompt: document.querySelector("[data-asset-tool-account-prompt]"),
  batchLog: document.querySelector("[data-asset-tool-batch-log]"),
  clearStatusLog: document.querySelector("[data-asset-tool-clear-status-log]"),
  metadata: document.querySelector("[data-asset-tool-metadata]"),
  outputMissing: document.querySelector("[data-asset-tool-output-missing]"),
  outputSummary: document.querySelector("[data-asset-tool-output-summary]"),
  outputValidation: document.querySelector("[data-asset-tool-output-validation]"),
  projectPath: document.querySelector("[data-asset-tool-project-path]"),
  reset: document.querySelector("[data-asset-tool-reset]"),
  selected: document.querySelector("[data-asset-tool-selected]"),
  sharedTags: document.querySelector("[data-asset-tool-shared-tags]"),
  tableCounts: document.querySelector("[data-asset-tool-table-counts]"),
  tagCount: document.querySelector("[data-asset-tool-tag-count]"),
  tagOptions: document.querySelector("[data-asset-tool-tag-options]"),
  validationList: document.querySelector("[data-asset-tool-validation-list]"),
  validationOverlay: document.querySelector("[data-asset-tool-validation-overlay]"),
};

let editingAssetId = "";
let editingAssetType = "";
let selectedAssetId = "";
let activeUploadAssetType = "";
let activeUploadState = null;
const draftAssetValues = new Map();
const draftTagKeys = new Map();
const draftUploadPayloads = new Map();
const REFERENCE_ONLY_ASSET_TYPES = new Set(["Sprites", "Vectors", "Palette References"]);
const MVP_DEFERRED_ADD_ASSET_TYPES = new Set(["Data", "Vectors"]);
const ALWAYS_MIXED_SOURCE_ASSET_TYPES = new Set([]);
const UPLOAD_COLUMNS = Object.freeze(["Source", "File", "Usage", "Tags", "Preview", "Actions"]);
const REFERENCE_COLUMNS = Object.freeze(["Source", "Reference", "Usage", "Tags", "Preview", "Actions"]);
const UPLOAD_SOURCE = "Upload";
const REFERENCE_SOURCE = "Reference";
const UPLOAD_LOG_STATUSES = Object.freeze(["OK", "WARN", "FAIL", "SKIP"]);
const UPLOAD_ACCEPT_BY_ASSET_TYPE = Object.freeze({
  Audio: "audio/*,.mp3,.wav,.ogg,.m4a",
  Data: ".json,.csv,.txt,application/json,text/csv,text/plain",
  Fonts: ".ttf,.otf,.woff,.woff2",
  Images: "image/*,.png,.jpg,.jpeg,.webp,.gif,.svg"
});
const DEFAULT_UPLOAD_CHUNK_SIZE_BYTES = 64 * 1024;
const MAX_UPLOAD_CHUNK_SIZE_BYTES = 1024 * 1024;
const SERVER_RECEIVE_PROGRESS_INTERVAL_MS = 1000;
const UPLOAD_WORKER_URL = new URL("./assets-upload-worker.js", import.meta.url);

function isBrowserValidationHost() {
  return ["", "localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

// Validation hook only; hosted pages get no simulated upload delay.
function validationUploadProgressStepMs() {
  if (!isBrowserValidationHost()) {
    return 0;
  }
  const requestedDelay = Number(params.get("uploadProgressDelayMs"));
  if (Number.isFinite(requestedDelay) && requestedDelay >= 0) {
    return Math.min(1000, requestedDelay);
  }
  return 60;
}

const UPLOAD_PROGRESS_STEP_MS = validationUploadProgressStepMs();
const UPLOAD_CHUNK_SIZE_BYTES = validationUploadChunkSizeBytes();
const SERVER_RECEIVE_CHUNK_SIZE_BYTES = validationServerReceiveChunkSizeBytes();
const SOURCE_HELP_BY_ASSET_TYPE = Object.freeze({
  Audio: "Upload music, voices, or sound effects for your game.",
  Data: "Upload .json, .csv, or .txt files for game features.",
  Fonts: "Upload fonts for menus, signs, and other text in your game.",
  Images: "Upload artwork for characters, enemies, worlds, icons, and menus.",
  "Palette References": "Connect this to a color palette swatch.",
  Sprites: "Connect sprites to artwork you already added.",
  Vectors: "Vector artwork is planned for a later update."
});

function validationUploadChunkSizeBytes() {
  if (!isBrowserValidationHost()) {
    return DEFAULT_UPLOAD_CHUNK_SIZE_BYTES;
  }
  const requestedChunkSize = Number(params.get("uploadChunkSizeBytes"));
  if (Number.isFinite(requestedChunkSize) && requestedChunkSize > 0) {
    return Math.min(MAX_UPLOAD_CHUNK_SIZE_BYTES, Math.floor(requestedChunkSize));
  }
  return DEFAULT_UPLOAD_CHUNK_SIZE_BYTES;
}

function validationServerReceiveChunkSizeBytes() {
  if (!isBrowserValidationHost()) {
    return DEFAULT_UPLOAD_CHUNK_SIZE_BYTES;
  }
  const requestedChunkSize = Number(params.get("serverReceiveChunkSizeBytes"));
  if (Number.isFinite(requestedChunkSize) && requestedChunkSize > 0) {
    return Math.min(MAX_UPLOAD_CHUNK_SIZE_BYTES, Math.floor(requestedChunkSize));
  }
  return DEFAULT_UPLOAD_CHUNK_SIZE_BYTES;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function setText(target, value) {
  if (target) {
    target.textContent = value;
  }
}

function currentSession() {
  try {
    return getSessionCurrent();
  } catch {
    return { authenticated: false };
  }
}

function isGuestSession() {
  return currentSession()?.authenticated !== true;
}

function showAccountPrompt() {
  if (elements.accountPrompt) {
    elements.accountPrompt.hidden = false;
  }
  setText(elements.log, "Uploads require a Game Foundry account.");
}

function hideAccountPrompt() {
  if (elements.accountPrompt) {
    elements.accountPrompt.hidden = true;
  }
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function createButton(label, datasetName, value) {
  const button = document.createElement("button");
  button.className = "btn btn--compact";
  button.type = "button";
  button.dataset[datasetName] = value;
  button.textContent = label;
  return button;
}

function addButtonLabelForType(assetType) {
  return assetType === "Vectors" ? "Add Vector" : `Add ${assetType}`;
}

function createInput(value, label, datasetName) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value || "";
  input.setAttribute("aria-label", label);
  input.dataset[datasetName] = "true";
  return input;
}

function createSelect(label, datasetName, options, selectedValue) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", label);
  select.dataset[datasetName] = "true";
  appendOptions(select, options, selectedValue || options[0]);
  return select;
}

function appendOptions(select, values, selectedValue) {
  select.replaceChildren();
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
  if (selectedValue && values.includes(selectedValue)) {
    select.value = selectedValue;
  }
}

function tagNameForKey(tags, tagKey) {
  return tags.find((tag) => tag.id === tagKey)?.name || tagKey;
}

function assetTags(asset) {
  return Array.isArray(asset?.tagKeys) ? asset.tagKeys : [];
}

function isReferenceAssetType(assetType) {
  return REFERENCE_ONLY_ASSET_TYPES.has(assetType);
}

function tableColumnsForType(assetType) {
  return isReferenceAssetType(assetType) ? REFERENCE_COLUMNS : UPLOAD_COLUMNS;
}

function isSourceMode(value) {
  return value === UPLOAD_SOURCE || value === REFERENCE_SOURCE;
}

function assetSource(asset) {
  const source = normalizeText(asset?.source);
  if (isSourceMode(source)) {
    return source;
  }
  return isReferenceAssetType(asset?.assetType || asset?.type) ? REFERENCE_SOURCE : UPLOAD_SOURCE;
}

function assetReference(asset) {
  return normalizeText(asset?.reference || asset?.name) || "Unnamed reference";
}

function assetFile(asset) {
  return normalizeText(asset?.fileName || asset?.originalName) || "No file";
}

function assetPreview(asset) {
  const fullPath = assetViewPath(asset);
  const projectId = normalizeText(asset?.projectId || "");
  const prefix = projectId ? `projects/${projectId}/` : "";
  if (fullPath && prefix && fullPath.startsWith(prefix)) {
    return fullPath.slice(prefix.length);
  }
  return fullPath || normalizeText(asset?.previewKind) || "Preview ready";
}

function assetViewPath(asset) {
  return normalizeText(asset?.viewPath || asset?.storedPath || asset?.path);
}

function projectPathForSnapshot(snapshot = {}) {
  const projectId = normalizeText(snapshot.handoff?.activeProject?.id || "");
  return projectId ? `projects/${projectId}/` : "No project path yet";
}

function uploadDiagnosticsText(diagnostics = {}) {
  const parts = [];
  if (diagnostics.projectId) parts.push(`Project ID: ${diagnostics.projectId}`);
  if (diagnostics.targetFolder) parts.push(`Target folder: ${diagnostics.targetFolder}`);
  if (diagnostics.targetDirectory) parts.push(`Target directory: ${diagnostics.targetDirectory}`);
  if (diagnostics.targetDirectoryResult) parts.push(`Directory result: ${diagnostics.targetDirectoryResult}`);
  if (diagnostics.directoryStatus) parts.push(`Directory status: ${diagnostics.directoryStatus}`);
  if (diagnostics.storageObjectKey) parts.push(`Storage object key: ${diagnostics.storageObjectKey}`);
  if (diagnostics.targetFilePath) parts.push(`Target file path: ${diagnostics.targetFilePath}`);
  if (diagnostics.writeResult) parts.push(`Write result: ${diagnostics.writeResult}`);
  if (diagnostics.viewPath) parts.push(`View path: ${diagnostics.viewPath}`);
  if (diagnostics.message) parts.push(diagnostics.message);
  return parts.join("; ");
}

function createAssetViewPreview(asset) {
  const viewPath = assetViewPath(asset);
  if (!viewPath || assetSource(asset) !== UPLOAD_SOURCE) {
    return null;
  }
  const assetType = asset.assetType || asset.type || "";
  if (assetType === "Images") {
    const image = document.createElement("img");
    image.alt = `${asset.name || asset.fileName || "Asset"} preview`;
    image.dataset.assetToolViewPreview = "true";
    image.src = viewPath;
    return image;
  }
  if (assetType === "Audio") {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.dataset.assetToolViewPreview = "true";
    audio.src = viewPath;
    return audio;
  }
  if (assetType === "Fonts" || assetType === "Data") {
    const link = document.createElement("a");
    link.dataset.assetToolViewPreview = "true";
    link.href = viewPath;
    link.rel = "noreferrer";
    link.target = "_blank";
    link.textContent = `Open ${assetType} asset`;
    return link;
  }
  return null;
}

function tagKeysForEditRow(row) {
  const key = row?.dataset.assetToolEditingRow || "";
  return draftTagKeys.get(key) || [];
}

function setTagKeysForEditRow(row, tagKeys) {
  const key = row?.dataset.assetToolEditingRow || "";
  if (key) {
    draftTagKeys.set(key, tagKeys);
  }
}

function createTagTokens(tagKeys, tags, editable = false) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-cluster";
  if (!tagKeys.length) {
    const empty = document.createElement("span");
    empty.textContent = "No tags";
    wrapper.append(empty);
    return wrapper;
  }

  tagKeys.forEach((tagKey) => {
    if (editable) {
      const token = createButton(tagNameForKey(tags, tagKey), "assetToolRemoveTag", tagKey);
      wrapper.append(token);
      return;
    }
    const token = document.createElement("span");
    token.className = "pill";
    token.textContent = tagNameForKey(tags, tagKey);
    wrapper.append(token);
  });

  return wrapper;
}

function createUsageSelect(value) {
  const select = document.createElement("select");
  select.dataset.assetToolUsageInput = "true";
  select.setAttribute("aria-label", "Usage");
  appendOptions(select, ASSET_USAGE_OPTIONS, value || ASSET_USAGE_OPTIONS[0]);
  return select;
}

function sourceModeForEdit(assetType, values = {}) {
  const existingSource = normalizeText(values.source);
  if (isSourceMode(existingSource)) {
    return existingSource;
  }
  return isReferenceAssetType(assetType) ? REFERENCE_SOURCE : UPLOAD_SOURCE;
}

function referenceOptionsForAssetType(assetType, snapshot = {}, currentAssetId = "") {
  if (assetType === "Palette References") {
    return (snapshot.palette?.swatches || []).map((swatch) => ({
      label: `${swatch.name || swatch.key} (${swatch.hex || "palette"})`,
      value: swatch.key
    }));
  }

  return (snapshot.assets || [])
    .filter((asset) => asset.id !== currentAssetId && (asset.assetType || asset.type) === assetType)
    .map((asset) => ({
      label: asset.name || asset.fileName || asset.id,
      value: asset.id
    }));
}

function sourceOptionsForAssetType(assetType, referenceOptions, selectedSource) {
  if (isReferenceAssetType(assetType)) {
    return [REFERENCE_SOURCE];
  }
  if (ALWAYS_MIXED_SOURCE_ASSET_TYPES.has(assetType)) {
    return [UPLOAD_SOURCE, REFERENCE_SOURCE];
  }
  if (referenceOptions.length > 0 || selectedSource === REFERENCE_SOURCE) {
    return [UPLOAD_SOURCE, REFERENCE_SOURCE];
  }
  return [UPLOAD_SOURCE];
}

function createSourceSelect(assetType, selectedSource, referenceOptions) {
  const options = sourceOptionsForAssetType(assetType, referenceOptions, selectedSource);
  return createSelect("Source", "assetToolSourceInput", options, selectedSource);
}

function createSourceControl(assetType, selectedSource, referenceOptions) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-stack content-stack--compact";
  const help = document.createElement("span");
  help.dataset.assetToolSourceHelp = "true";
  help.textContent = SOURCE_HELP_BY_ASSET_TYPE[assetType] || "Choose how this asset source is created.";
  wrapper.append(createSourceSelect(assetType, selectedSource, referenceOptions), help);
  return wrapper;
}

function createFileUploadControl(assetType, selectedFileName) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-stack content-stack--compact";

  const input = document.createElement("input");
  input.type = "file";
  input.setAttribute("aria-label", "Upload File");
  input.dataset.assetToolFileInput = "true";
  input.multiple = true;
  const accept = UPLOAD_ACCEPT_BY_ASSET_TYPE[assetType] || "";
  if (accept) {
    input.accept = accept;
  }

  const filename = document.createElement("span");
  filename.dataset.assetToolSelectedFile = "true";
  filename.textContent = normalizeText(selectedFileName) || "No file chosen";
  wrapper.append(input, filename);
  return wrapper;
}

function createReferenceSelect(referenceOptions, selectedReference) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-stack content-stack--compact";
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Reference");
  select.dataset.assetToolReferenceInput = "true";

  if (referenceOptions.length) {
    appendOptions(select, referenceOptions.map((option) => option.value), selectedReference);
    Array.from(select.options).forEach((option) => {
      const referenceOption = referenceOptions.find((candidate) => candidate.value === option.value);
      if (referenceOption) {
        option.textContent = referenceOption.label;
      }
    });
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No matching assets yet";
    select.append(option);
    select.value = "";
  }

  wrapper.append(select);
  if (!referenceOptions.length) {
    const message = document.createElement("span");
    message.textContent = "Add an asset first, then connect it here.";
    wrapper.append(message);
  }
  return wrapper;
}

function selectedUploadFiles(row) {
  const fileInput = row?.querySelector("[data-asset-tool-file-input]");
  return Array.from(fileInput?.files || []);
}

function selectedUploadFileNames(row) {
  const files = selectedUploadFiles(row);
  if (files.length) {
    return files.map((file) => file.name).filter(Boolean);
  }
  return uploadPayloadsForEditRow(row).map((payload) => payload.name).filter(Boolean);
}

function fileSelectionLabel(files) {
  if (!files.length) {
    return "No file chosen";
  }
  if (files.length > 3) {
    return `${files.length} files selected`;
  }
  return files.map((file) => file.name).join(", ");
}

function base64FromArrayBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return window.btoa(binary);
}

async function uploadPayloadForFile(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Upload file read failed: browser file data is unavailable.");
  }
  const buffer = await file.arrayBuffer();
  return {
    fileContentBase64: base64FromArrayBuffer(buffer),
    hasFileBytes: true,
    mimeType: file.type || "",
    size: Number(file.size) || 0
  };
}

async function uploadPayloadForUploadItem(item) {
  if (item?.hasFileBytes === true && typeof item.fileContentBase64 === "string") {
    return {
      fileContentBase64: item.fileContentBase64,
      hasFileBytes: true,
      mimeType: item.mimeType || item.type || "",
      size: Number(item.size) || 0
    };
  }
  return uploadPayloadForFile(item);
}

function uploadPayloadsForEditRow(row) {
  const rowId = row?.dataset.assetToolEditingRow || "";
  return rowId ? (draftUploadPayloads.get(rowId) || []) : [];
}

function setUploadPayloadsForEditRow(row, payloads) {
  const rowId = row?.dataset.assetToolEditingRow || "";
  if (rowId) {
    draftUploadPayloads.set(rowId, payloads);
  }
}

function formatBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes < 1024) {
    return `${Math.max(0, Math.round(bytes))} B`;
  }
  const units = ["KB", "MB", "GB"];
  let scaled = bytes / 1024;
  let unitIndex = 0;
  while (scaled >= 1024 && unitIndex < units.length - 1) {
    scaled /= 1024;
    unitIndex += 1;
  }
  return `${scaled.toFixed(1)} ${units[unitIndex]}`;
}

function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    return "N/A";
  }
  return `${(milliseconds / 1000).toFixed(1)}s`;
}

function uploadDelay() {
  if (UPLOAD_PROGRESS_STEP_MS <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    window.setTimeout(resolve, UPLOAD_PROGRESS_STEP_MS);
  });
}

function serverReceiveDelay() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, SERVER_RECEIVE_PROGRESS_INTERVAL_MS);
  });
}

function totalUploadBytes(files) {
  return files.reduce((total, file) => {
    const size = Number(file.size);
    return Number.isFinite(size) && size > 0 ? total + size : total;
  }, 0);
}

function createUploadState(files) {
  return {
    clientBytesSent: 0,
    currentFile: "None",
    entries: [],
    fileCount: files.length,
    fileIndex: 0,
    phase: "Preparing",
    serverBytesReceived: 0,
    serverReceiveUpdateCount: 0,
    startedAt: performance.now(),
    totalBytes: totalUploadBytes(files),
    workerStatus: "Idle"
  };
}

function batchWrittenCount(summary) {
  return summary.ok + summary.warn;
}

function uploadProgressMetrics(state) {
  const elapsedMilliseconds = Math.max(0, performance.now() - state.startedAt);
  const elapsedSeconds = elapsedMilliseconds / 1000;
  const bytesReceived = Math.max(0, Number(state.serverBytesReceived) || 0);
  const bps = elapsedSeconds > 0 ? Math.round(bytesReceived / elapsedSeconds) : 0;
  const remainingBytes = Math.max(0, state.totalBytes - bytesReceived);
  const etaMilliseconds = bps > 0 ? (remainingBytes / bps) * 1000 : NaN;
  const progressValue = state.totalBytes > 0
    ? Math.min(100, Math.floor((bytesReceived / state.totalBytes) * 100))
    : 0;
  return {
    bps,
    elapsedMilliseconds,
    etaMilliseconds,
    progressValue
  };
}

function uploadIsComplete(state) {
  return state?.phase === "Complete";
}

function compactUploadStatusText(summary) {
  const written = batchWrittenCount(summary);
  return `Upload summary: ${written} written, ${summary.fail} failed, ${summary.skip} skipped, ${summary.warn} warnings.`;
}

function uploadCompletedSuccessfully(summary) {
  return summary.fail === 0 && summary.skip === 0 && summary.warn === 0;
}

function conciseUploadIssueMessage(entry) {
  const message = normalizeText(entry?.message);
  if (!message) {
    return `${entry.status}: ${entry.fileName}`;
  }
  if (/already exists/i.test(message)) {
    return "File already exists. Rename the file or remove the existing asset before uploading.";
  }
  if (/greater than zero bytes/i.test(message)) {
    return "Uploaded files must be greater than zero bytes.";
  }
  if (/browser file writes are not supported/i.test(message)) {
    return "This runtime cannot write upload files. Use server storage for upload validation.";
  }
  if (/target path must stay under/i.test(message)) {
    return "Upload target path is outside the project asset folder.";
  }
  if (/open an active game|active game first|project upload target is unavailable/i.test(message)) {
    return "Open an active game with a valid project upload target before uploading.";
  }
  if (/duplicate file name in this batch/i.test(message)) {
    return "Duplicate file name in this batch.";
  }
  if (/approved|mime|file type|extension/i.test(message)) {
    return "Choose a file type supported by this asset table.";
  }
  const firstSentence = message.split(".")[0] || message;
  return firstSentence.replace(/projects\/[A-Z0-9/._-]+/g, "project path").slice(0, 140);
}

function renderUploadIssuesForTarget(target, entries) {
  if (!target) {
    return;
  }
  const problemEntries = entries.filter((entry) => entry.status !== "OK");
  target.replaceChildren();
  target.hidden = problemEntries.length === 0;
  problemEntries.forEach((entry) => {
    const item = document.createElement("li");
    item.dataset.assetToolUploadIssue = entry.status;
    item.textContent = `${entry.status}: ${entry.fileName} - ${conciseUploadIssueMessage(entry)}`;
    target.append(item);
  });
}

function renderUploadStatusRowsForTarget(target, entries) {
  if (!target) {
    return;
  }
  target.replaceChildren();
  if (!entries.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 2;
    cell.textContent = "No upload files processed yet.";
    row.append(cell);
    target.append(row);
    return;
  }
  entries.forEach((entry) => {
    const row = document.createElement("tr");
    row.dataset.assetToolUploadStatus = entry.status;
    row.append(
      createCell(entry.fileName),
      createCell(entry.status)
    );
    target.append(row);
  });
}

function isUploadProgressAssetType(assetType) {
  return !isReferenceAssetType(assetType) && !MVP_DEFERRED_ADD_ASSET_TYPES.has(assetType);
}

function updateInlineUploadProgress(state) {
  if (!state?.assetType) {
    return;
  }
  const container = Array.from(document.querySelectorAll("[data-asset-tool-inline-upload-progress]"))
    .find((node) => node.dataset.assetToolInlineUploadProgress === state.assetType);
  if (!container) {
    return;
  }
  populateInlineUploadProgress(container, state);
}

function updateUploadProgress(state) {
  updateInlineUploadProgress(state);
}

function createInlineUploadMetric(labelText, datasetName) {
  const item = document.createElement("div");
  item.className = "content-stack content-stack--compact";
  const label = document.createElement("span");
  label.textContent = labelText;
  const value = document.createElement("strong");
  value.dataset[datasetName] = "true";
  value.textContent = "N/A";
  item.append(label, value);
  return item;
}

function createInlineUploadProgress(assetType) {
  const section = document.createElement("section");
  section.className = "content-stack content-stack--compact";
  section.dataset.assetToolInlineUploadProgress = assetType;
  section.setAttribute("aria-live", "polite");
  section.hidden = !(activeUploadAssetType === assetType && activeUploadState);

  const heading = document.createElement("h4");
  heading.textContent = "Upload Progress";

  const compactStatus = document.createElement("p");
  compactStatus.className = "status";
  compactStatus.setAttribute("role", "status");
  compactStatus.dataset.assetToolInlineUploadCompactStatus = "true";
  compactStatus.textContent = "No upload run yet.";

  const details = document.createElement("div");
  details.className = "content-stack content-stack--compact";
  details.dataset.assetToolInlineUploadProgressDetails = "true";

  const metrics = document.createElement("div");
  metrics.className = "content-cluster";
  metrics.append(
    createInlineUploadMetric("Phase", "assetToolInlineUploadPhase"),
    createInlineUploadMetric("Current file", "assetToolInlineUploadCurrentFile"),
    createInlineUploadMetric("Files", "assetToolInlineUploadFileProgress"),
    createInlineUploadMetric("Bytes received", "assetToolInlineUploadBytesUploaded"),
    createInlineUploadMetric("Total bytes", "assetToolInlineUploadTotalBytes"),
    createInlineUploadMetric("BPS", "assetToolInlineUploadBps"),
    createInlineUploadMetric("Speed", "assetToolInlineUploadSpeed"),
    createInlineUploadMetric("ETA", "assetToolInlineUploadEta"),
    createInlineUploadMetric("Elapsed", "assetToolInlineUploadElapsed"),
    createInlineUploadMetric("Worker", "assetToolInlineUploadWorker")
  );

  const progress = document.createElement("progress");
  progress.max = 100;
  progress.value = 0;
  progress.dataset.assetToolInlineUploadProgressBar = "true";

  const summary = document.createElement("div");
  summary.className = "content-cluster";
  summary.append(
    createInlineUploadMetric("Written", "assetToolInlineUploadSummaryWritten"),
    createInlineUploadMetric("Failed", "assetToolInlineUploadSummaryFailed"),
    createInlineUploadMetric("Skipped", "assetToolInlineUploadSummarySkipped"),
    createInlineUploadMetric("Warnings", "assetToolInlineUploadSummaryWarnings")
  );

  const issues = document.createElement("ul");
  issues.dataset.assetToolInlineUploadIssues = "true";
  issues.hidden = true;

  const statusTable = document.createElement("table");
  statusTable.className = "data-table";
  statusTable.setAttribute("aria-label", `${assetType} upload progress`);
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["File", "Status"].forEach((label) => {
    const headingCell = document.createElement("th");
    headingCell.scope = "col";
    headingCell.textContent = label;
    headRow.append(headingCell);
  });
  head.append(headRow);
  const body = document.createElement("tbody");
  body.dataset.assetToolInlineUploadStatusBody = "true";
  statusTable.append(head, body);

  details.append(metrics, progress, summary, issues, statusTable);
  section.append(heading, compactStatus, details);
  if (activeUploadAssetType === assetType && activeUploadState) {
    populateInlineUploadProgress(section, activeUploadState);
  }
  return section;
}

function populateInlineUploadProgress(container, state) {
  if (!container || !state) {
    return;
  }
  const complete = uploadIsComplete(state);
  const { bps, elapsedMilliseconds, etaMilliseconds, progressValue } = uploadProgressMetrics(state);
  const summary = batchSummaryForEntries(state.entries);
  const successfulComplete = complete && uploadCompletedSuccessfully(summary);
  container.hidden = false;
  container.dataset.assetToolUploadWorker = state.workerStatus || "Idle";
  container.dataset.assetToolServerReceiveUpdates = String(state.serverReceiveUpdateCount || 0);
  setText(container.querySelector("[data-asset-tool-inline-upload-compact-status]"), compactUploadStatusText(summary));
  setText(container.querySelector("[data-asset-tool-inline-upload-phase]"), state.phase);
  setText(container.querySelector("[data-asset-tool-inline-upload-current-file]"), state.currentFile);
  setText(container.querySelector("[data-asset-tool-inline-upload-file-progress]"), `${state.fileIndex} / ${state.fileCount}`);
  setText(container.querySelector("[data-asset-tool-inline-upload-bytes-uploaded]"), formatBytes(state.serverBytesReceived));
  setText(container.querySelector("[data-asset-tool-inline-upload-total-bytes]"), formatBytes(state.totalBytes));
  setText(container.querySelector("[data-asset-tool-inline-upload-bps]"), String(bps));
  setText(container.querySelector("[data-asset-tool-inline-upload-speed]"), `${formatBytes(bps)}/s`);
  setText(container.querySelector("[data-asset-tool-inline-upload-eta]"), formatDuration(etaMilliseconds));
  setText(container.querySelector("[data-asset-tool-inline-upload-elapsed]"), formatDuration(elapsedMilliseconds));
  setText(container.querySelector("[data-asset-tool-inline-upload-worker]"), state.workerStatus || "Idle");
  setText(container.querySelector("[data-asset-tool-inline-upload-summary-written]"), String(batchWrittenCount(summary)));
  setText(container.querySelector("[data-asset-tool-inline-upload-summary-failed]"), String(summary.fail));
  setText(container.querySelector("[data-asset-tool-inline-upload-summary-skipped]"), String(summary.skip));
  setText(container.querySelector("[data-asset-tool-inline-upload-summary-warnings]"), String(summary.warn));
  const progress = container.querySelector("[data-asset-tool-inline-upload-progress-bar]");
  if (progress) {
    progress.value = progressValue;
  }
  renderUploadStatusRowsForTarget(
    container.querySelector("[data-asset-tool-inline-upload-status-body]"),
    state.entries
  );
  renderUploadIssuesForTarget(
    container.querySelector("[data-asset-tool-inline-upload-issues]"),
    state.entries
  );
  const details = container.querySelector("[data-asset-tool-inline-upload-progress-details]");
  if (details) {
    details.hidden = successfulComplete;
  }
}

function renderBatchLog(entries, summary = null) {
  if (!elements.batchLog) {
    return;
  }
  elements.batchLog.replaceChildren();
  if (summary) {
    const summaryItem = document.createElement("li");
    summaryItem.dataset.assetToolBatchSummary = "true";
    summaryItem.textContent = `Batch summary: ${summary.ok} OK, ${summary.warn} WARN, ${summary.fail} FAIL, ${summary.skip} SKIP.`;
    elements.batchLog.append(summaryItem);
  }
  if (!entries.length) {
    const item = document.createElement("li");
    item.textContent = "No batch uploads run yet.";
    elements.batchLog.append(item);
    return;
  }
  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.dataset.assetToolBatchLogRow = "true";
    item.dataset.assetToolBatchStatus = entry.status;
    const issueText = entry.status === "OK" ? "Uploaded" : conciseUploadIssueMessage(entry);
    item.textContent = `${entry.status}: ${entry.fileName} - ${issueText}`;
    elements.batchLog.append(item);
  });
}

function batchSummaryForEntries(entries) {
  return entries.reduce((summary, entry) => {
    const status = UPLOAD_LOG_STATUSES.includes(entry.status) ? entry.status.toLowerCase() : "fail";
    summary[status] += 1;
    return summary;
  }, {
    fail: 0,
    ok: 0,
    skip: 0,
    warn: 0
  });
}

function isGlobalUploadFailure(result) {
  return !result?.added && /active game|projectid|project id|browser file writes|file writes are not supported/i.test(result?.message || "");
}

let uploadWorkerRequestId = 0;

function createUploadWorker() {
  return new Worker(UPLOAD_WORKER_URL, { type: "module" });
}

function processUploadFileInWorker(file, uploadState) {
  return new Promise((resolve, reject) => {
    let worker = null;
    const requestId = `asset-upload-${Date.now()}-${uploadWorkerRequestId += 1}`;
    const fileName = file?.name || "upload";

    function cleanup() {
      if (worker) {
        worker.terminate();
      }
    }

    function failUpload(message) {
      cleanup();
      reject(new Error(message || "Upload worker failed."));
    }

    try {
      worker = createUploadWorker();
    } catch (error) {
      failUpload(error instanceof Error ? error.message : "Upload worker could not start.");
      return;
    }

    worker.addEventListener("message", (event) => {
      const message = event.data || {};
      if (message.requestId !== requestId) {
        return;
      }
      if (message.type === "started") {
        uploadState.workerStatus = "Active";
        uploadState.currentFile = message.fileName || fileName;
        uploadState.phase = "Uploading";
        updateUploadProgress(uploadState);
        return;
      }
      if (message.type === "progress") {
        uploadState.workerStatus = "Active";
        uploadState.currentFile = message.fileName || fileName;
        uploadState.phase = "Uploading";
        uploadState.clientBytesSent = Math.max(0, Number(message.bytesUploaded) || 0);
        return;
      }
      if (message.type === "complete") {
        uploadState.clientBytesSent = Number(message.totalBytes) || uploadState.clientBytesSent;
        uploadState.workerStatus = "Server Receiving";
        uploadState.currentFile = message.fileName || fileName;
        uploadState.phase = "Receiving";
        updateUploadProgress(uploadState);
        cleanup();
        resolve(message.payload || {});
        return;
      }
      if (message.type === "error") {
        uploadState.workerStatus = "Failed";
        uploadState.currentFile = message.fileName || fileName;
        uploadState.phase = "Failed";
        updateUploadProgress(uploadState);
        failUpload(message.message || "Upload worker failed.");
      }
    });

    worker.addEventListener("error", (error) => {
      uploadState.workerStatus = "Failed";
      uploadState.currentFile = fileName;
      uploadState.phase = "Failed";
      updateUploadProgress(uploadState);
      failUpload(error.message || "Upload worker failed.");
    });

    worker.postMessage({
      chunkSizeBytes: UPLOAD_CHUNK_SIZE_BYTES,
      file,
      requestId,
      throttleMs: UPLOAD_PROGRESS_STEP_MS,
      type: "process-file"
    });
  });
}

function batchInputForFile(row, assetType, file, payload) {
  return {
    ...assetRowValues(row, assetType),
    ...payload,
    fileName: file.name,
    name: file.name,
    source: UPLOAD_SOURCE
  };
}

async function receiveFileBytesFromServer(uploadState, startingBytes, fileSize) {
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return false;
  }

  const receiveTargetBeforeWrite = Math.max(0, fileSize - 1);
  let fileBytesReceived = 0;
  uploadState.phase = "Receiving";
  uploadState.workerStatus = "Server Receiving";
  updateUploadProgress(uploadState);

  while (fileBytesReceived < receiveTargetBeforeWrite) {
    await serverReceiveDelay();
    fileBytesReceived = Math.min(receiveTargetBeforeWrite, fileBytesReceived + SERVER_RECEIVE_CHUNK_SIZE_BYTES);
    uploadState.serverBytesReceived = Math.min(uploadState.totalBytes, startingBytes + fileBytesReceived);
    uploadState.serverReceiveUpdateCount += 1;
    updateUploadProgress(uploadState);
  }

  return true;
}

function completeServerReceive(uploadState, startingBytes, fileSize) {
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return;
  }
  uploadState.serverBytesReceived = Math.min(uploadState.totalBytes, startingBytes + fileSize);
}

function addBatchLogEntry(entries, entry, uploadState = null) {
  entries.push(entry);
  renderBatchLog(entries, batchSummaryForEntries(entries));
  if (uploadState) {
    updateUploadProgress(uploadState);
  }
}

async function saveUploadBatch(row, assetType) {
  if (isGuestSession()) {
    showAccountPrompt();
    return false;
  }
  hideAccountPrompt();
  const files = selectedUploadFiles(row).length ? selectedUploadFiles(row) : uploadPayloadsForEditRow(row);
  const projectResult = repository.ensureUploadProject();
  if (!projectResult?.projectId) {
    setText(elements.log, projectResult?.message || "Upload blocked: no project storage path is available.");
    render();
    return false;
  }
  setText(elements.log, projectResult.created ? `Created project path projects/${projectResult.projectId}/.` : `Using project path projects/${projectResult.projectId}/.`);
  setText(elements.projectPath, `Path: ${projectPathForSnapshot(projectResult.snapshot)}`);
  const uploadState = createUploadState(files);
  uploadState.assetType = assetType;
  activeUploadAssetType = assetType;
  activeUploadState = uploadState;
  const seenNames = new Set();
  let globalFailure = false;

  updateUploadProgress(uploadState);
  await uploadDelay();

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const fileName = file.name;
    uploadState.currentFile = fileName;
    uploadState.fileIndex = index + 1;
    uploadState.phase = "Uploading";
    updateUploadProgress(uploadState);
    await uploadDelay();

    if (globalFailure) {
      uploadState.phase = "Skipped";
      addBatchLogEntry(uploadState.entries, {
        fileName,
        message: "Skipped because the project upload target is unavailable.",
        status: "SKIP"
      }, uploadState);
      await uploadDelay();
      continue;
    }
    if (seenNames.has(fileName.toLowerCase())) {
      uploadState.phase = "Skipped";
      addBatchLogEntry(uploadState.entries, {
        fileName,
        message: "Skipped duplicate file name in this batch.",
        status: "SKIP"
      }, uploadState);
      await uploadDelay();
      continue;
    }
    seenNames.add(fileName.toLowerCase());

    const fileSize = Number(file.size);
    const progressCalculable = Number.isFinite(fileSize) && fileSize > 0;
    const startingBytes = uploadState.serverBytesReceived;

    let batchInput = null;
    try {
      const payload = await processUploadFileInWorker(file, uploadState);
      batchInput = batchInputForFile(row, assetType, file, payload);
    } catch (error) {
      uploadState.phase = "Failed";
      uploadState.workerStatus = "Failed";
      addBatchLogEntry(uploadState.entries, {
        fileName,
        message: error instanceof Error ? error.message : "Upload file read failed.",
        status: "FAIL"
      }, uploadState);
      globalFailure = true;
      await uploadDelay();
      continue;
    }

    await receiveFileBytesFromServer(uploadState, startingBytes, fileSize);
    uploadState.phase = "Writing";
    uploadState.workerStatus = "Writing";
    updateUploadProgress(uploadState);

    const result = repository.addAssetRecord(batchInput);
    if (!result.added) {
      uploadState.phase = "Failed";
      uploadState.workerStatus = "Failed";
      addBatchLogEntry(uploadState.entries, {
        fileName,
        message: uploadDiagnosticsText(result.writeDiagnostics) || result.message,
        path: result.writeDiagnostics?.targetFilePath || "",
        status: "FAIL"
      }, uploadState);
      globalFailure = isGlobalUploadFailure(result);
      await uploadDelay();
      continue;
    }

    if (progressCalculable) {
      completeServerReceive(uploadState, startingBytes, fileSize);
    }
    const status = progressCalculable ? "OK" : "WARN";
    uploadState.phase = status === "WARN" ? "Warning" : "Uploaded";
    uploadState.workerStatus = "Complete";
    addBatchLogEntry(uploadState.entries, {
      fileName,
      message: status === "WARN"
        ? `Progress could not be calculated for this file; uploaded with a warning. ${uploadDiagnosticsText(result.asset.writeDiagnostics)}`
        : uploadDiagnosticsText(result.asset.writeDiagnostics) || result.message,
      path: result.asset.targetFilePath || result.asset.storedPath,
      status
    }, uploadState);
    selectedAssetId = result.asset.id;
    await uploadDelay();
  }

  const summary = batchSummaryForEntries(uploadState.entries);
  uploadState.phase = "Complete";
  uploadState.workerStatus = summary.fail > 0 ? "Failed" : "Complete";
  updateUploadProgress(uploadState);
  if (summary.ok + summary.warn > 0) {
    clearEditState();
  }
  const totalSaved = batchWrittenCount(summary);
  setText(elements.log, `Batch upload complete: ${totalSaved} written, ${summary.fail} failed, ${summary.skip} skipped, ${summary.warn} warnings.`);
  render();
  return summary.fail === 0 && summary.skip === 0;
}

function editedRowForControl(control) {
  return control?.closest("[data-asset-tool-editing-row]");
}

function updateDraftValues(row, values) {
  const rowId = row?.dataset.assetToolEditingRow || "";
  if (!rowId) {
    return;
  }
  const currentValues = draftAssetValues.get(rowId) || {};
  draftAssetValues.set(rowId, {
    ...currentValues,
    ...values
  });
}

function createTagEditor(tagKeys, tags) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-stack content-stack--compact";

  const tokens = createTagTokens(tagKeys, tags, true);

  const controls = document.createElement("div");
  controls.className = "action-group action-group--tight";
  const input = document.createElement("input");
  input.type = "text";
  input.setAttribute("aria-label", "Asset Tags");
  input.setAttribute("list", "assetToolTagOptions");
  input.dataset.assetToolTagInput = "true";
  const add = createButton("Add Tag", "assetToolAddTagToken", "true");
  controls.append(input, add);

  wrapper.append(tokens, controls);
  return wrapper;
}

function assetRowValues(row, assetType) {
  const rowId = row?.dataset.assetToolEditingRow || "";
  const draftValues = draftAssetValues.get(rowId) || {};
  const source = row.querySelector("[data-asset-tool-source-input]")?.value
    || row.dataset.assetToolExistingSource
    || sourceModeForEdit(assetType, draftValues);
  const reference = source === REFERENCE_SOURCE
    ? row.querySelector("[data-asset-tool-reference-input]")?.value
      || draftValues.reference
      || row.dataset.assetToolExistingReference
      || ""
    : "";
  const fileInput = row.querySelector("[data-asset-tool-file-input]");
  const fileName = source === UPLOAD_SOURCE
    ? selectedUploadFileNames(row)[0] || draftValues.fileName || row.dataset.assetToolExistingFileName || ""
    : "";
  const name = source === REFERENCE_SOURCE ? reference : fileName;
  return {
    assetType,
    fileName,
    name,
    reference,
    source,
    tagKeys: tagKeysForEditRow(row),
    usage: row.querySelector("[data-asset-tool-usage-input]")?.value || "",
  };
}

async function assetRowValuesForSave(row, assetType) {
  const values = assetRowValues(row, assetType);
  if (values.source !== UPLOAD_SOURCE) {
    return values;
  }
  const file = selectedUploadFiles(row)[0] || null;
  if (!file) {
    const payload = uploadPayloadsForEditRow(row)[0] || null;
    return payload
      ? {
          ...values,
          ...payload,
          fileName: payload.name,
          name: payload.name,
          source: UPLOAD_SOURCE
        }
      : values;
  }
  return {
    ...values,
    ...(await uploadPayloadForUploadItem(file)),
    fileName: file.name,
    name: file.name,
    source: UPLOAD_SOURCE
  };
}

function captureDraftAssetValues(row) {
  const rowId = row?.dataset.assetToolEditingRow || "";
  const assetType = row?.dataset.assetToolAssetType || editingAssetType;
  if (!rowId) {
    return;
  }
  draftAssetValues.set(rowId, assetRowValues(row, assetType));
}

function createEditRow(assetType, asset = null, snapshot = {}) {
  const row = document.createElement("tr");
  const rowId = asset?.id || `__new__:${assetType}`;
  const draftValues = draftAssetValues.get(rowId) || {};
  const referenceOptions = referenceOptionsForAssetType(assetType, snapshot, asset?.id || "");
  const selectedSource = sourceModeForEdit(assetType, {
    source: draftValues.source ?? asset?.source
  });
  const selectedReference = draftValues.reference ?? asset?.reference ?? "";
  const selectedFileName = draftValues.fileName ?? asset?.fileName ?? "";
  const savedAsset = Boolean(asset);
  row.dataset.assetToolEditingRow = rowId;
  row.dataset.assetToolAssetType = assetType;
  row.dataset.assetToolExistingSource = selectedSource;
  row.dataset.assetToolExistingFileName = selectedFileName;
  row.dataset.assetToolExistingReference = selectedReference;
  if (!draftTagKeys.has(rowId)) {
    draftTagKeys.set(rowId, assetTags(asset));
  }

  const sourceCell = document.createElement("td");
  if (savedAsset) {
    sourceCell.textContent = selectedSource;
  } else {
    sourceCell.append(createSourceControl(assetType, selectedSource, referenceOptions));
  }

  const detailCell = document.createElement("td");
  if (savedAsset) {
    detailCell.textContent = selectedSource === REFERENCE_SOURCE ? assetReference(asset) : assetFile(asset);
  } else if (selectedSource === REFERENCE_SOURCE) {
    detailCell.append(createReferenceSelect(referenceOptions, selectedReference));
  } else {
    detailCell.append(createFileUploadControl(assetType, selectedFileName));
  }

  const usageCell = document.createElement("td");
  usageCell.append(createUsageSelect(draftValues.usage ?? asset?.usage));

  const tagsCell = document.createElement("td");
  tagsCell.append(createTagEditor(tagKeysForEditRow(row), snapshot.tags || []));

  const previewCell = createCell(asset ? assetPreview(asset) : "Preview after save");

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "action-group action-group--tight";
  actions.append(
    createButton("Save", "assetToolSave", asset?.id || "__new__"),
    createButton("Cancel", "assetToolCancel", asset?.id || "__new__")
  );
  actionsCell.append(actions);

  row.append(sourceCell, detailCell, usageCell, tagsCell, previewCell, actionsCell);
  return row;
}

function createAssetRow(asset, snapshot) {
  if (editingAssetId === asset.id) {
    return createEditRow(asset.assetType || asset.type || "Images", asset, snapshot);
  }

  const row = document.createElement("tr");
  row.dataset.assetToolRow = asset.id;
  row.dataset.assetToolAssetType = asset.assetType || asset.type || "Images";

  if (selectedAssetId === asset.id) {
    row.dataset.assetToolSelectedRow = "true";
  }

  const tagsCell = document.createElement("td");
  tagsCell.append(createTagTokens(assetTags(asset), snapshot.tags || []));

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "action-group action-group--tight";
  actions.append(
    createButton("View", "assetToolView", asset.id),
    createButton("Edit", "assetToolEdit", asset.id),
    createButton("Trash", "assetToolDelete", asset.id)
  );
  actionsCell.append(actions);

  if (isReferenceAssetType(row.dataset.assetToolAssetType)) {
    row.append(
      createCell(assetSource(asset)),
      createCell(assetReference(asset)),
      createCell(asset.usage),
      tagsCell,
      createCell(assetPreview(asset)),
      actionsCell
    );
    return row;
  }

  row.append(
    createCell(assetSource(asset)),
    createCell(assetFile(asset)),
    createCell(asset.usage),
    tagsCell,
    createCell(assetPreview(asset)),
    actionsCell
  );
  return row;
}

function createAssetTypeTable(assetType, assets, snapshot) {
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";

  const table = document.createElement("table");
  table.className = "data-table";
  table.setAttribute("aria-label", `${assetType} assets`);
  table.dataset.assetTypeTable = assetType;

  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  tableColumnsForType(assetType).forEach((label) => {
    const heading = document.createElement("th");
    heading.scope = "col";
    heading.textContent = label;
    headRow.append(heading);
  });
  head.append(headRow);

  const body = document.createElement("tbody");
  body.dataset.assetTypeBody = assetType;

  if (editingAssetId === `__new__:${assetType}`) {
    body.append(createEditRow(assetType, null, snapshot));
  }

  if (!assets.length && editingAssetId !== `__new__:${assetType}`) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = tableColumnsForType(assetType).length;
    emptyCell.textContent = `No ${assetType} assets added yet.`;
    emptyRow.append(emptyCell);
    body.append(emptyRow);
  }

  assets.forEach((asset) => body.append(createAssetRow(asset, snapshot)));

  table.append(head, body);
  wrapper.append(table);
  return wrapper;
}

function createAssetTypeAccordion(assetType, assets, snapshot) {
  const details = document.createElement("details");
  details.className = "vertical-accordion";
  details.dataset.assetTypeAccordion = assetType;
  details.open = true;

  const summary = document.createElement("summary");
  summary.textContent = assetType;

  const body = document.createElement("div");
  body.className = "accordion-body content-stack";

  const actions = document.createElement("div");
  actions.className = "action-group";
  const addButton = createButton(addButtonLabelForType(assetType), "assetToolAddType", assetType);
  if (MVP_DEFERRED_ADD_ASSET_TYPES.has(assetType)) {
    addButton.disabled = true;
    addButton.title = "Planned";
    addButton.dataset.assetToolPlanned = "true";
  } else {
    addButton.disabled = editingAssetId === `__new__:${assetType}`;
  }
  actions.append(addButton);

  body.append(actions, createAssetTypeTable(assetType, assets, snapshot));
  if (isUploadProgressAssetType(assetType)) {
    body.append(createInlineUploadProgress(assetType));
  }
  details.append(summary, body);
  return details;
}

function renderTagOptions(tags) {
  elements.tagOptions?.replaceChildren(...tags.map((tag) => {
    const option = document.createElement("option");
    option.value = tag.name;
    option.dataset.tagKey = tag.id;
    return option;
  }));

  if (!elements.sharedTags) {
    return;
  }
  elements.sharedTags.replaceChildren();
  if (!tags.length) {
    const item = document.createElement("li");
    item.textContent = "No game tags added yet.";
    elements.sharedTags.append(item);
    return;
  }
  tags.forEach((tag) => {
    const item = document.createElement("li");
    item.textContent = `${tag.name}: ${tag.description || "No description"}`;
    elements.sharedTags.append(item);
  });
}

function renderValidation(snapshot) {
  if (!elements.validationList || !elements.validationOverlay) {
    return;
  }

  elements.validationList.replaceChildren();
  snapshot.validation.findings.forEach((finding) => {
    const item = document.createElement("li");
    item.textContent = `${finding.label}: ${finding.action}`;
    elements.validationList.append(item);
  });
  elements.validationOverlay.hidden = snapshot.validation.findings.length === 0;
}

function renderAccordions(snapshot) {
  if (!elements.accordions) {
    return;
  }

  elements.accordions.replaceChildren(...ASSET_CATALOG_TYPES.map((assetType) =>
    createAssetTypeAccordion(assetType, snapshot.assetsByType?.[assetType] || [], snapshot)
  ));
}

function renderTables(snapshot) {
  if (!elements.tableCounts) {
    return;
  }

  elements.tableCounts.replaceChildren();
  snapshot.tableCounts.forEach((count) => {
    const row = document.createElement("tr");
    const area = count.table === "asset_library_items" ? "Assets" : String(count.table || "Assets").replaceAll("_", " ");
    row.append(createCell(area), createCell(String(count.rows)));
    elements.tableCounts.append(row);
  });
}

function renderMetadata(snapshot) {
  if (!elements.metadata) {
    return;
  }

  elements.metadata.replaceChildren();
  const asset = snapshot.assets.find((candidate) => candidate.id === selectedAssetId)
    || snapshot.selectedAsset
    || null;
  if (!asset) {
    const item = document.createElement("li");
    item.textContent = "No selected asset details.";
    elements.metadata.append(item);
    setText(elements.selected, "None");
    return;
  }

  setText(elements.selected, asset.name);
  const metadataLines = [
    `Type: ${asset.assetType || asset.type}`,
    `Usage: ${asset.usage}`,
    `Tags: ${assetTags(asset).map((tagKey) => tagNameForKey(snapshot.tags || [], tagKey)).join(", ") || "No tags"}`,
    `Stored path: ${asset.storedPath || asset.path}`,
  ];
  if (asset.projectId) metadataLines.push(`Project ID: ${asset.projectId}`);
  if (asset.targetFolder) metadataLines.push(`Target folder: ${asset.targetFolder}`);
  if (asset.targetDirectory) metadataLines.push(`Target directory: ${asset.targetDirectory}`);
  if (asset.targetDirectoryResult) metadataLines.push(`Directory result: ${asset.targetDirectoryResult}`);
  if (asset.directoryStatus) metadataLines.push(`Directory status: ${asset.directoryStatus}`);
  if (asset.storageObjectKey) metadataLines.push(`Storage object key: ${asset.storageObjectKey}`);
  if (asset.targetFilePath) metadataLines.push(`Target file path: ${asset.targetFilePath}`);
  if (asset.writeResult) metadataLines.push(`Write result: ${asset.writeResult}`);
  if (assetViewPath(asset)) metadataLines.push(`View path: ${assetViewPath(asset)}`);
  if (assetSource(asset) === REFERENCE_SOURCE) {
    metadataLines.splice(1, 0, `Source: ${REFERENCE_SOURCE}`, `Reference: ${assetReference(asset)}`);
  } else {
    metadataLines.splice(1, 0, `Source: ${assetSource(asset)}`, `File: ${assetFile(asset)}`);
  }
  metadataLines.forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    elements.metadata.append(item);
  });
  const preview = createAssetViewPreview(asset);
  if (preview) {
    const item = document.createElement("li");
    item.append(preview);
    elements.metadata.append(item);
  }
}

function renderOutput(snapshot) {
  const assetCount = snapshot.assets.length;
  const missing = snapshot.validation.findings.map((finding) => finding.label).join(", ");
  setText(elements.projectPath, `Path: ${projectPathForSnapshot(snapshot)}`);
  setText(elements.count, String(assetCount));
  setText(elements.tagCount, String(snapshot.tags.length));
  setText(elements.libraryStatus, assetCount > 0 ? "Ready" : "Needs Input");
  setText(
    elements.outputSummary,
    assetCount === 1 ? "1 asset ready for your game." : `${assetCount} assets ready for your game.`
  );
  setText(elements.outputValidation, snapshot.validation.status);
  setText(elements.outputMissing, missing || (assetCount > 0 ? "None" : "Add at least one asset."));
}

function render() {
  const snapshot = repository.getSnapshot();
  if (selectedAssetId && !snapshot.assets.some((asset) => asset.id === selectedAssetId)) {
    selectedAssetId = "";
  }
  renderTagOptions(snapshot.tags || []);
  renderValidation(snapshot);
  renderAccordions(snapshot);
  renderTables(snapshot);
  renderMetadata(snapshot);
  renderOutput(snapshot);
}

function tagKeyFromInputValue(value, tags) {
  const normalized = normalizeText(value).toLowerCase();
  return tags.find((tag) => tag.name.toLowerCase() === normalized || tag.id.toLowerCase() === normalized)?.id || "";
}

function clearEditState() {
  editingAssetId = "";
  editingAssetType = "";
  draftAssetValues.clear();
  draftTagKeys.clear();
  draftUploadPayloads.clear();
}

async function saveSingleAssetRow(row, assetType, saveTarget) {
  if (isGuestSession()) {
    showAccountPrompt();
    return null;
  }
  hideAccountPrompt();
  let values = null;
  try {
    values = await assetRowValuesForSave(row, assetType);
  } catch (error) {
    setText(elements.log, error instanceof Error ? error.message : "Upload file read failed.");
    render();
    return null;
  }
  const result = saveTarget === "__new__"
    ? repository.addAssetRecord(values)
    : repository.updateAssetRecord(saveTarget, values);
  if (result.added || result.updated) {
    selectedAssetId = result.asset.id;
    clearEditState();
  }
  setText(
    elements.log,
    result.writeDiagnostics && !(result.added || result.updated)
      ? `${result.message} ${uploadDiagnosticsText(result.writeDiagnostics)}`
      : result.message
  );
  render();
  return result;
}

elements.accordions?.addEventListener("click", async (event) => {
  const addType = event.target.closest("[data-asset-tool-add-type]");
  const view = event.target.closest("[data-asset-tool-view]");
  const edit = event.target.closest("[data-asset-tool-edit]");
  const deleteButton = event.target.closest("[data-asset-tool-delete]");
  const save = event.target.closest("[data-asset-tool-save]");
  const cancel = event.target.closest("[data-asset-tool-cancel]");
  const addTagToken = event.target.closest("[data-asset-tool-add-tag-token]");
  const removeTag = event.target.closest("[data-asset-tool-remove-tag]");

  if (addType) {
    editingAssetId = `__new__:${addType.dataset.assetToolAddType}`;
    editingAssetType = addType.dataset.assetToolAddType;
    selectedAssetId = "";
    setText(elements.log, `Adding ${editingAssetType} asset.`);
    render();
    return;
  }

  if (view) {
    selectedAssetId = view.dataset.assetToolView;
    repository.selectAsset(selectedAssetId);
    setText(elements.log, "Viewing asset.");
    render();
    return;
  }

  if (edit) {
    editingAssetId = edit.dataset.assetToolEdit;
    const row = edit.closest("[data-asset-tool-row]");
    editingAssetType = row?.dataset.assetToolAssetType || "";
    selectedAssetId = editingAssetId;
    repository.selectAsset(editingAssetId);
    setText(elements.log, "Editing asset.");
    render();
    return;
  }

  if (cancel) {
    clearEditState();
    setText(elements.log, "Asset edit canceled.");
    render();
    return;
  }

  if (addTagToken || removeTag) {
    const row = event.target.closest("[data-asset-tool-editing-row]");
    captureDraftAssetValues(row);
    const snapshot = repository.getSnapshot();
    const tagKeys = tagKeysForEditRow(row);
    if (addTagToken) {
      const input = row.querySelector("[data-asset-tool-tag-input]");
      const tagKey = tagKeyFromInputValue(input?.value, snapshot.tags || []);
      if (tagKey && !tagKeys.includes(tagKey)) {
        setTagKeysForEditRow(row, [...tagKeys, tagKey]);
        if (input) {
          input.value = "";
        }
        setText(elements.log, "Added shared tag reference.");
      } else {
        setText(elements.log, "Choose an existing tag from the shared Tags tool list.");
      }
    } else {
      setTagKeysForEditRow(row, tagKeys.filter((tagKey) => tagKey !== removeTag.dataset.assetToolRemoveTag));
      setText(elements.log, "Removed shared tag reference.");
    }
    render();
    return;
  }

  if (save) {
    const row = save.closest("[data-asset-tool-editing-row]");
    const assetType = row?.dataset.assetToolAssetType || editingAssetType;
    const source = row?.querySelector("[data-asset-tool-source-input]")?.value || sourceModeForEdit(assetType);
    const uploadFiles = selectedUploadFiles(row);
    if (save.dataset.assetToolSave === "__new__" && source === UPLOAD_SOURCE && uploadFiles.length) {
      await saveUploadBatch(row, assetType);
      return;
    }
    await saveSingleAssetRow(row, assetType, save.dataset.assetToolSave);
    return;
  }

  if (deleteButton) {
    const result = repository.deleteAssetRecord(deleteButton.dataset.assetToolDelete);
    if (result.deleted) {
      clearEditState();
      selectedAssetId = "";
    }
    setText(elements.log, result.message);
    render();
  }
});

elements.accordions?.addEventListener("change", async (event) => {
  const sourceInput = event.target.closest("[data-asset-tool-source-input]");
  const fileInput = event.target.closest("[data-asset-tool-file-input]");
  const referenceInput = event.target.closest("[data-asset-tool-reference-input]");

  if (sourceInput) {
    const row = editedRowForControl(sourceInput);
    captureDraftAssetValues(row);
    setUploadPayloadsForEditRow(row, []);
    updateDraftValues(row, {
      fileName: "",
      reference: "",
      source: sourceInput.value
    });
    setText(elements.log, `Source set to ${sourceInput.value}.`);
    render();
    return;
  }

  if (fileInput) {
    const row = editedRowForControl(fileInput);
    const files = selectedUploadFiles(row);
    const fileName = files[0]?.name || "";
    const display = row?.querySelector("[data-asset-tool-selected-file]");
    if (display) {
      display.textContent = fileSelectionLabel(files);
    }
    updateDraftValues(row, {
      fileName,
      reference: "",
      source: UPLOAD_SOURCE
    });
    if (!files.length) {
      setUploadPayloadsForEditRow(row, []);
      setText(elements.log, "No upload file selected.");
      return;
    }
    if (isGuestSession()) {
      showAccountPrompt();
      return;
    }
    setUploadPayloadsForEditRow(row, []);
    setText(elements.log, files.length > 1 ? `Selected ${files.length} upload files.` : `Selected upload file ${fileName}.`);
    const assetType = row?.dataset.assetToolAssetType || editingAssetType;
    await saveUploadBatch(row, assetType);
    return;
  }

  if (referenceInput) {
    const row = editedRowForControl(referenceInput);
    setUploadPayloadsForEditRow(row, []);
    updateDraftValues(row, {
      fileName: "",
      reference: referenceInput.value,
      source: REFERENCE_SOURCE
    });
    setText(elements.log, referenceInput.value ? "Reference source selected." : "Choose a valid reference source.");
  }
});

elements.reset?.addEventListener("click", () => {
  const result = repository.resetAssetLibrary();
  clearEditState();
  selectedAssetId = "";
  setText(elements.log, result.message);
  render();
});

elements.clearStatusLog?.addEventListener("click", () => {
  setText(elements.log, "");
  elements.batchLog?.replaceChildren();
});

render();
