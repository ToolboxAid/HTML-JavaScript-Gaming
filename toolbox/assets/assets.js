import {
  ASSET_CATALOG_TYPES,
  ASSET_USAGE_OPTIONS,
  createAssetToolApiRepository
} from "./assets-api-client.js";
import { getSessionCurrent } from "../../src/engine/api/session-api-client.js";

const repository = createAssetToolApiRepository();
const params = new URLSearchParams(window.location.search);

if (params.get("handoff") === "missing") {
  repository.makeMissingGameConfiguration();
} else if (params.get("handoff") === "invalid") {
  repository.makeInvalidGameConfiguration();
} else {
  repository.makeReadyGameConfiguration();
}
if (params.get("uploadWrite") === "unsupported") {
  repository.setUploadFileWriteSupport(false);
}

const elements = {
  accordions: document.querySelector("[data-asset-type-accordions]"),
  count: document.querySelector("[data-asset-tool-count]"),
  libraryStatus: document.querySelector("[data-asset-tool-library-status]"),
  log: document.querySelector("[data-asset-tool-log]"),
  accountPrompt: document.querySelector("[data-asset-tool-account-prompt]"),
  batchLog: document.querySelector("[data-asset-tool-batch-log]"),
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
  uploadBps: document.querySelector("[data-asset-tool-upload-bps]"),
  uploadBytesUploaded: document.querySelector("[data-asset-tool-upload-bytes-uploaded]"),
  uploadClose: document.querySelector("[data-asset-tool-upload-close]"),
  uploadCurrentFile: document.querySelector("[data-asset-tool-upload-current-file]"),
  uploadDialog: document.querySelector("[data-asset-tool-upload-dialog]"),
  uploadElapsed: document.querySelector("[data-asset-tool-upload-elapsed]"),
  uploadEta: document.querySelector("[data-asset-tool-upload-eta]"),
  uploadFileProgress: document.querySelector("[data-asset-tool-upload-file-progress]"),
  uploadPhase: document.querySelector("[data-asset-tool-upload-phase]"),
  uploadProgress: document.querySelector("[data-asset-tool-upload-progress]"),
  uploadSpeed: document.querySelector("[data-asset-tool-upload-speed]"),
  uploadStatusBody: document.querySelector("[data-asset-tool-upload-status-body]"),
  uploadSummaryFailed: document.querySelector("[data-asset-tool-upload-summary-failed]"),
  uploadSummarySkipped: document.querySelector("[data-asset-tool-upload-summary-skipped]"),
  uploadSummaryWarnings: document.querySelector("[data-asset-tool-upload-summary-warnings]"),
  uploadSummaryWritten: document.querySelector("[data-asset-tool-upload-summary-written]"),
  uploadTotalBytes: document.querySelector("[data-asset-tool-upload-total-bytes]"),
};

let editingAssetId = "";
let editingAssetType = "";
let selectedAssetId = "";
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

function isLocalDevRuntime() {
  return ["", "localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

// Local/dev validation hook only; production hosts get no simulated upload delay.
function devUploadProgressStepMs() {
  if (!isLocalDevRuntime()) {
    return 0;
  }
  const requestedDelay = Number(params.get("uploadProgressDelayMs"));
  if (Number.isFinite(requestedDelay) && requestedDelay >= 0) {
    return Math.min(1000, requestedDelay);
  }
  return 60;
}

const UPLOAD_PROGRESS_STEP_MS = devUploadProgressStepMs();
const SOURCE_HELP_BY_ASSET_TYPE = Object.freeze({
  Audio: "Audio can upload a sound file or reference an existing audio source.",
  Data: "Data can upload .json, .csv, or .txt files, or reference an existing data source.",
  Fonts: "Fonts upload font files; Reference appears when a font source exists.",
  Images: "Images can upload an image file or reference an existing image source.",
  "Palette References": "Palette References must reference a palette swatch.",
  Sprites: "Sprites are Reference-only for MVP.",
  Vectors: "Vectors are Reference-only for MVP."
});

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
  return projectId ? `projects/${projectId}/` : "projects/";
}

function uploadDiagnosticsText(diagnostics = {}) {
  const parts = [];
  if (diagnostics.projectId) parts.push(`Project ID: ${diagnostics.projectId}`);
  if (diagnostics.targetFolder) parts.push(`Target folder: ${diagnostics.targetFolder}`);
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
    option.textContent = "No reference sources available";
    select.append(option);
    select.value = "";
  }

  wrapper.append(select);
  if (!referenceOptions.length) {
    const message = document.createElement("span");
    message.textContent = "No valid reference source exists.";
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

function totalUploadBytes(files) {
  return files.reduce((total, file) => {
    const size = Number(file.size);
    return Number.isFinite(size) && size > 0 ? total + size : total;
  }, 0);
}

function createUploadState(files) {
  return {
    bytesUploaded: 0,
    currentFile: "None",
    entries: [],
    fileCount: files.length,
    fileIndex: 0,
    phase: "Preparing",
    startedAt: performance.now(),
    totalBytes: totalUploadBytes(files)
  };
}

function batchWrittenCount(summary) {
  return summary.ok + summary.warn;
}

function updateUploadSummary(summary) {
  setText(elements.uploadSummaryWritten, String(batchWrittenCount(summary)));
  setText(elements.uploadSummaryFailed, String(summary.fail));
  setText(elements.uploadSummarySkipped, String(summary.skip));
  setText(elements.uploadSummaryWarnings, String(summary.warn));
}

function renderUploadStatusRows(entries) {
  if (!elements.uploadStatusBody) {
    return;
  }
  elements.uploadStatusBody.replaceChildren();
  if (!entries.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.textContent = "No upload files processed yet.";
    row.append(cell);
    elements.uploadStatusBody.append(row);
    return;
  }
  entries.forEach((entry) => {
    const row = document.createElement("tr");
    row.dataset.assetToolUploadStatus = entry.status;
    row.append(
      createCell(entry.fileName),
      createCell(entry.status),
      createCell(`${entry.path ? `${entry.path} - ` : ""}${entry.message || ""}`)
    );
    elements.uploadStatusBody.append(row);
  });
}

function updateUploadDialog(state) {
  if (!elements.uploadDialog) {
    return;
  }
  elements.uploadDialog.hidden = false;
  const elapsedMilliseconds = Math.max(0, performance.now() - state.startedAt);
  const elapsedSeconds = elapsedMilliseconds / 1000;
  const bps = elapsedSeconds > 0 ? Math.round(state.bytesUploaded / elapsedSeconds) : 0;
  const remainingBytes = Math.max(0, state.totalBytes - state.bytesUploaded);
  const etaMilliseconds = bps > 0 ? (remainingBytes / bps) * 1000 : NaN;
  const progressValue = state.totalBytes > 0
    ? Math.min(100, Math.round((state.bytesUploaded / state.totalBytes) * 100))
    : 0;

  setText(elements.uploadCurrentFile, state.currentFile);
  setText(elements.uploadFileProgress, `${state.fileIndex} / ${state.fileCount}`);
  setText(elements.uploadBytesUploaded, formatBytes(state.bytesUploaded));
  setText(elements.uploadTotalBytes, formatBytes(state.totalBytes));
  setText(elements.uploadBps, String(bps));
  setText(elements.uploadSpeed, `${formatBytes(bps)}/s`);
  setText(elements.uploadEta, formatDuration(etaMilliseconds));
  setText(elements.uploadElapsed, formatDuration(elapsedMilliseconds));
  setText(elements.uploadPhase, state.phase);
  if (elements.uploadProgress) {
    elements.uploadProgress.value = progressValue;
  }
  renderUploadStatusRows(state.entries);
  updateUploadSummary(batchSummaryForEntries(state.entries));
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
    item.textContent = `${entry.status}: ${entry.fileName}${entry.path ? ` -> ${entry.path}` : ""}${entry.message ? ` - ${entry.message}` : ""}`;
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

async function batchInputForFile(row, assetType, file) {
  const payload = await uploadPayloadForUploadItem(file);
  return {
    ...assetRowValues(row, assetType),
    ...payload,
    fileName: file.name,
    name: file.name,
    source: UPLOAD_SOURCE
  };
}

function addBatchLogEntry(entries, entry, uploadState = null) {
  entries.push(entry);
  renderBatchLog(entries, batchSummaryForEntries(entries));
  if (uploadState) {
    updateUploadDialog(uploadState);
  } else {
    renderUploadStatusRows(entries);
    updateUploadSummary(batchSummaryForEntries(entries));
  }
}

async function saveUploadBatch(row, assetType) {
  if (isGuestSession()) {
    showAccountPrompt();
    return false;
  }
  hideAccountPrompt();
  const files = selectedUploadFiles(row).length ? selectedUploadFiles(row) : uploadPayloadsForEditRow(row);
  const uploadState = createUploadState(files);
  const seenNames = new Set();
  let globalFailure = false;

  updateUploadDialog(uploadState);
  await uploadDelay();

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const fileName = file.name;
    uploadState.currentFile = fileName;
    uploadState.fileIndex = index + 1;
    uploadState.phase = "Uploading";
    updateUploadDialog(uploadState);
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
    const startingBytes = uploadState.bytesUploaded;
    if (progressCalculable) {
      uploadState.bytesUploaded = Math.min(uploadState.totalBytes, startingBytes + Math.max(1, Math.ceil(fileSize / 2)));
      updateUploadDialog(uploadState);
      await uploadDelay();
    } else {
      uploadState.phase = "Progress WARN";
      updateUploadDialog(uploadState);
      await uploadDelay();
    }

    let batchInput = null;
    try {
      batchInput = await batchInputForFile(row, assetType, file);
    } catch (error) {
      uploadState.phase = "Failed";
      addBatchLogEntry(uploadState.entries, {
        fileName,
        message: error instanceof Error ? error.message : "Upload file read failed.",
        status: "FAIL"
      }, uploadState);
      globalFailure = true;
      await uploadDelay();
      continue;
    }

    const result = repository.addAssetRecord(batchInput);
    if (!result.added) {
      uploadState.phase = "Failed";
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
      uploadState.bytesUploaded = Math.min(uploadState.totalBytes, startingBytes + fileSize);
    }
    const status = progressCalculable ? "OK" : "WARN";
    uploadState.phase = status === "WARN" ? "Warning" : "Uploaded";
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

  uploadState.phase = "Complete";
  updateUploadDialog(uploadState);
  const summary = batchSummaryForEntries(uploadState.entries);
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
    item.textContent = "No workspace tags added yet.";
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
    row.append(createCell(count.table), createCell(String(count.rows)));
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
    item.textContent = "No selected asset metadata.";
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
    assetCount === 1 ? "1 user asset catalog record ready." : `${assetCount} user asset catalog records ready.`
  );
  setText(elements.outputValidation, snapshot.validation.status);
  setText(elements.outputMissing, missing || (assetCount > 0 ? "None" : "Add at least one user asset."));
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
    setText(elements.log, "Viewing asset catalog record.");
    render();
    return;
  }

  if (edit) {
    editingAssetId = edit.dataset.assetToolEdit;
    const row = edit.closest("[data-asset-tool-row]");
    editingAssetType = row?.dataset.assetToolAssetType || "";
    selectedAssetId = editingAssetId;
    repository.selectAsset(editingAssetId);
    setText(elements.log, "Editing asset catalog record.");
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
    if (save.dataset.assetToolSave === "__new__" && source === UPLOAD_SOURCE && uploadFiles.length > 1) {
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
    try {
      const payloads = await Promise.all(files.map(async (file) => ({
        ...(await uploadPayloadForFile(file)),
        name: file.name,
        type: file.type || ""
      })));
      setUploadPayloadsForEditRow(row, payloads);
    } catch (error) {
      setUploadPayloadsForEditRow(row, []);
      setText(elements.log, error instanceof Error ? error.message : "Upload file read failed.");
      return;
    }
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

elements.uploadClose?.addEventListener("click", () => {
  if (elements.uploadDialog) {
    elements.uploadDialog.hidden = true;
  }
});

render();
