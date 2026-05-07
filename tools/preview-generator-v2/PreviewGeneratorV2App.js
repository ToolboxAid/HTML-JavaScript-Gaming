import { PreviewGeneratorV2Logger } from './PreviewGeneratorV2Logger.js';
import { PreviewGeneratorV2Ui } from './PreviewGeneratorV2Ui.js';
import { PreviewGeneratorV2RepoAccess } from './PreviewGeneratorV2RepoAccess.js';
import { PreviewGeneratorV2Capture } from './PreviewGeneratorV2Capture.js';

const OUTPUT_NAME = "preview.svg";
const CAPTURE_TIMEOUT_MARKER = PreviewGeneratorV2Capture.CAPTURE_TIMEOUT_MARKER;
const ASSET_MANAGER_V2_TOOL_KEY = "asset-manager-v2";
const PALETTE_MANAGER_V2_TOOL_KEY = "palette-manager-v2";
const BACKGROUND_ROLE = "background";
const PREVIEW_ROLE = "preview";

const runtimeParams = new URLSearchParams(window.location.search);
const isRuntimeMode = runtimeParams.get("mode") === "runtime";

let repoDirHandle = null;
let stopRequested = false;
let repoDisplayName = "";
let isGenerating = false;
let workspacePreviewAssetFolder = "";
let workspacePreviewFileValid = false;
let workspacePreviewGameId = "";
let workspaceLaunchHydrated = false;
let workspaceRepoPathHydrated = false;
let workspaceRepoRootName = "";
let workspaceResolvedRepoPath = "";
let workspaceManifestPreviewPath = "";
let workspaceGeneratedPreviewPath = "";
let workspaceAbsolutePreviewOutputPath = "";
const ui = new PreviewGeneratorV2Ui();
const logger = new PreviewGeneratorV2Logger({
  statusEl: ui.statusLog.getStatusElement(),
  logEl: ui.statusLog.getLogElement()
});
const capture = new PreviewGeneratorV2Capture({
  ui,
  frame: ui.previewFrame.getFrame()
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeSlashes(value) {
  return String(value || "")
    .replaceAll("/", "\\")
    .replace(/\\{2,}/g, "\\");
}

function getAssetFolderRelativePath() {
  const raw = ui.assetFolder.getRawValue();
  if (!raw) return "assets";

  return raw
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map(x => x.trim())
    .filter(Boolean)
    .join("/");
}

function getAssetFolderDisplayPath() {
  return getAssetFolderRelativePath().replaceAll("/", "\\");
}

function normalizeWorkspacePath(value) {
  return String(value || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

function isAbsoluteFilesystemPath(value) {
  const pathValue = String(value || "").trim();
  return /^[A-Za-z]:[\\/]/.test(pathValue)
    || pathValue.startsWith("/")
    || pathValue.startsWith("\\\\");
}

function useWindowsPathSeparator(pathValue) {
  return String(pathValue || "").includes("\\");
}

function trimFilesystemTrailingSeparators(pathValue) {
  const value = String(pathValue || "").trim();
  if (/^[A-Za-z]:[\\/]?$/.test(value)) {
    return value.endsWith("\\") || value.endsWith("/")
      ? value
      : `${value}\\`;
  }
  return value.replace(/[\\/]+$/g, "");
}

function normalizeFilesystemPathForCompare(pathValue) {
  return String(pathValue || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/\/+/g, "/")
    .replace(/\/$/g, "")
    .toLowerCase();
}

function combineFilesystemPath(repoRoot, relativePath) {
  const root = trimFilesystemTrailingSeparators(repoRoot);
  const separator = useWindowsPathSeparator(root) ? "\\" : "/";
  const normalizedRelativePath = normalizeWorkspacePath(relativePath).replaceAll("/", separator);
  return `${root}${root.endsWith("\\") || root.endsWith("/") ? "" : separator}${normalizedRelativePath}`;
}

function resolveWorkspaceAbsolutePreviewOutputPath(repoPath, targetPath) {
  const resolvedRepoPath = String(repoPath || "").trim();
  if (!isAbsoluteFilesystemPath(resolvedRepoPath)) {
    throw new Error(`repoPath must be an absolute filesystem path, received ${resolvedRepoPath || "(empty)"}.`);
  }
  const absolutePath = combineFilesystemPath(resolvedRepoPath, targetPath);
  const comparableRepoRoot = normalizeFilesystemPathForCompare(resolvedRepoPath);
  const comparableAbsolutePath = normalizeFilesystemPathForCompare(absolutePath);
  if (comparableAbsolutePath !== comparableRepoRoot
    && !comparableAbsolutePath.startsWith(`${comparableRepoRoot}/`)) {
    throw new Error(`preview output path ${absolutePath} is outside repoPath ${resolvedRepoPath}.`);
  }
  return absolutePath;
}

function repoRootNameMatches(selectedRepoName, expectedRepoRoot) {
  const expected = String(expectedRepoRoot || "").trim();
  if (!expected) {
    return true;
  }
  if (selectedRepoName === expected) {
    return true;
  }
  const expectedFolderName = expected
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .at(-1);
  return selectedRepoName === expectedFolderName;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isWorkspaceManifest(value) {
  return isPlainObject(value) && value.documentKind === "workspace-manifest";
}

function workspaceManifestFromLaunchContext(launchContext) {
  if (isWorkspaceManifest(launchContext)) {
    return launchContext;
  }
  if (isWorkspaceManifest(launchContext?.manifest)) {
    return launchContext.manifest;
  }
  return null;
}

function displayRawLaunchFieldValue(value) {
  const text = String(value || "").trim();
  return text || "(missing)";
}

function launchPathFields(launchContext, manifest) {
  return [
    { label: "launchContext.repoPath", value: launchContext?.repoPath },
    { label: "launchContext.manifest.repoPath", value: launchContext?.manifest?.repoPath },
    { label: "launchContext.repoRoot", value: launchContext?.repoRoot },
    { label: "manifest.repoPath", value: manifest?.repoPath },
    { label: "manifest.repoRoot", value: manifest?.repoRoot }
  ].map((field) => ({
    ...field,
    text: String(field.value || "").trim()
  }));
}

function resolveRepoPathDecision(pathFields) {
  const repoPathFields = pathFields.filter((field) => field.label.endsWith(".repoPath"));
  const firstAbsolute = repoPathFields.find((field) => field.text && isAbsoluteFilesystemPath(field.text));
  const firstAvailable = repoPathFields.find((field) => field.text);
  const selected = firstAbsolute || firstAvailable || null;
  return {
    checkedMissingFields: repoPathFields
      .filter((field) => !field.text)
      .map((field) => field.label),
    isAbsolute: Boolean(selected?.text && isAbsoluteFilesystemPath(selected.text)),
    sourceField: selected?.label || "(none)",
    value: selected?.text || ""
  };
}

function isWorkspaceManagerLaunch() {
  return runtimeParams.get("launch") === "workspace"
    && runtimeParams.get("fromTool") === "workspace-manager-v2";
}

function readWorkspaceLaunchContext() {
  if (!isWorkspaceManagerLaunch()) {
    return { ok: false, skipped: true };
  }
  const hostContextId = runtimeParams.get("hostContextId") || "";
  if (!hostContextId) {
    return { ok: false, message: "Workspace Manager V2 launch did not include hostContextId." };
  }
  const rawValue = window.sessionStorage.getItem(hostContextId);
  if (!rawValue) {
    return { ok: false, message: "Workspace Manager V2 manifest was not found in sessionStorage." };
  }
  try {
    const launchContext = JSON.parse(rawValue);
    const manifest = workspaceManifestFromLaunchContext(launchContext);
    if (!manifest) {
      return { ok: false, message: "Workspace Manager V2 context is not a workspace manifest or manifest launch payload." };
    }
    if (!manifest.gameId || !manifest.gameRoot || !manifest.assetsPath) {
      return { ok: false, message: "Workspace Manager V2 manifest is missing gameId, gameRoot, or assetsPath." };
    }
    const pathFields = launchPathFields(launchContext, manifest);
    const repoPathDecision = resolveRepoPathDecision(pathFields);
    const repoRootText = pathFields
      .filter((field) => field.label.endsWith(".repoRoot"))
      .find((field) => field.text)?.text || "";
    if (!repoRootText && !String(repoPathDecision.value || "").trim()) {
      return { ok: false, message: "Workspace Manager V2 manifest is missing repoRoot display label and repoPath." };
    }
    return { ok: true, launchContext, manifest, pathFields, repoPathDecision };
  } catch (error) {
    return { ok: false, message: `Workspace Manager V2 manifest JSON is invalid: ${error.message}` };
  }
}

function workspaceAssetFolder(manifest) {
  const gameRoot = normalizeWorkspacePath(manifest.gameRoot);
  const assetsPath = normalizeWorkspacePath(manifest.assetsPath);
  if (!gameRoot || !assetsPath || !assetsPath.startsWith(`${gameRoot}/`)) {
    return "";
  }
  return assetsPath.slice(gameRoot.length + 1);
}

function workspaceImageAssetByRole(manifest, role) {
  const assets = manifest.tools?.[ASSET_MANAGER_V2_TOOL_KEY]?.assets;
  if (!assets || typeof assets !== "object" || Array.isArray(assets)) {
    return null;
  }
  const matchingAssets = Object.entries(assets)
    .filter(([, entry]) => (
      entry?.type === "image"
      && entry?.role === role
      && String(entry.path || "").trim()
    ))
    .sort(([leftId], [rightId]) => leftId.localeCompare(rightId));
  const selectedAsset = matchingAssets.at(-1);
  if (!selectedAsset) {
    return null;
  }
  const [id, entry] = selectedAsset;
  return {
    id,
    kind: String(entry.kind || "").trim(),
    path: normalizeWorkspacePath(entry.path),
    role: String(entry.role || "").trim(),
    type: String(entry.type || "").trim()
  };
}

function workspacePreviewAsset(manifest) {
  return workspaceImageAssetByRole(manifest, PREVIEW_ROLE);
}

function normalizeHexColor(value) {
  const color = String(value || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color.toUpperCase();
  }
  return "";
}

function workspacePaletteSwatches(manifest) {
  const swatches = manifest.tools?.[PALETTE_MANAGER_V2_TOOL_KEY]?.swatches;
  return Array.isArray(swatches) ? swatches : [];
}

function workspacePaletteBackgroundColor(manifest) {
  const paletteColors = workspacePaletteSwatches(manifest)
    .map((swatch) => {
      const hex = normalizeHexColor(swatch?.hex);
      const name = String(swatch?.name || "").trim();
      const tags = Array.isArray(swatch?.tags)
        ? swatch.tags.map(tag => String(tag || "").trim().toLowerCase()).filter(Boolean)
        : [];
      return hex && name ? { hex, name, tags } : null;
    })
    .filter(Boolean);

  const taggedBackground = paletteColors.find(color => (
    color.name.toLowerCase().includes("background")
    || color.tags.includes("background")
  ));
  if (taggedBackground) {
    return taggedBackground;
  }
  return paletteColors.find(color => (
    color.name.toLowerCase().includes("black")
    || color.tags.includes("black")
  )) || null;
}

function workspaceGameAssetPath(manifest, assetPath) {
  const gameRoot = normalizeWorkspacePath(manifest.gameRoot);
  const normalizedAssetPath = normalizeWorkspacePath(assetPath);
  const pathFromGameRoot = normalizedAssetPath.startsWith(`${gameRoot}/`)
    ? normalizedAssetPath.slice(gameRoot.length + 1)
    : normalizedAssetPath;
  return {
    gameRoot,
    pathFromGameRoot,
    absolutePath: `${gameRoot}/${pathFromGameRoot}`
  };
}

function workspaceBackgroundContext(manifest) {
  const backgroundAsset = workspaceImageAssetByRole(manifest, BACKGROUND_ROLE);
  const color = workspacePaletteBackgroundColor(manifest);
  if (!backgroundAsset) {
    return {
      ok: true,
      backgroundAssetMissing: true,
      colorHex: color?.hex || "",
      colorName: color?.name || ""
    };
  }
  const assetFolder = workspaceAssetFolder(manifest);
  if (!assetFolder) {
    return { ok: false, message: "assetsPath must be inside gameRoot before hydrating the preview background." };
  }
  const backgroundPath = workspaceGameAssetPath(manifest, backgroundAsset.path);
  if (!backgroundPath.pathFromGameRoot.startsWith(`${assetFolder}/`)) {
    return { ok: false, message: `${backgroundAsset.path || "(empty)"} must resolve under ${assetFolder}.` };
  }
  return {
    ok: true,
    backgroundAssetId: backgroundAsset.id,
    backgroundPath: backgroundPath.absolutePath,
    colorHex: color?.hex || "",
    colorName: color?.name || ""
  };
}

function workspacePreviewTarget(manifest) {
  const gameRoot = normalizeWorkspacePath(manifest.gameRoot);
  const assetFolder = workspaceAssetFolder(manifest);
  if (!assetFolder) {
    return { ok: false, message: "assetsPath must be inside gameRoot." };
  }
  const previewAsset = workspacePreviewAsset(manifest);
  if (!previewAsset) {
    return { ok: false, message: "manifest must include an Asset Manager V2 image asset with role preview." };
  }
  const imagePath = workspaceGameAssetPath(manifest, previewAsset.path);
  const imagePathFromGameRoot = imagePath.pathFromGameRoot;
  if (!imagePathFromGameRoot.startsWith(`${assetFolder}/`)) {
    return { ok: false, message: `${previewAsset.path || "(empty)"} must resolve under ${assetFolder}.` };
  }
  const previewAssetFolder = imagePathFromGameRoot.split("/").slice(0, -1).join("/");
  if (!previewAssetFolder) {
    return { ok: false, message: `${previewAsset.path} does not include an asset folder.` };
  }
  return {
    ok: true,
    previewAssetId: previewAsset.id,
    previewAssetKind: previewAsset.kind,
    previewAssetType: previewAsset.type,
    previewAssetFolder,
    manifestPreviewPath: imagePath.absolutePath,
    generatedPreviewPath: `${gameRoot}/${previewAssetFolder}/${OUTPUT_NAME}`
  };
}

async function validateWorkspaceImagePath(imagePath, label = "Workspace image") {
  if (!imagePath) {
    return { ok: false, message: `${label} path is empty.` };
  }
  try {
    const response = await fetch(`/${imagePath}`, { cache: "no-store" });
    if (!response.ok) {
      return { ok: false, message: `${imagePath} returned ${response.status}.` };
    }
    const contentType = String(response.headers.get("content-type") || "");
    const hasImageExtension = /\.(png|jpe?g|gif|webp|svg)$/i.test(imagePath);
    if (contentType && !contentType.startsWith("image/") && !hasImageExtension) {
      return { ok: false, message: `${imagePath} is not an image response.` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Unable to read ${imagePath}: ${error.message}` };
  }
}

async function validateRepoRootHandle(handle) {
  try {
    await PreviewGeneratorV2RepoAccess.getDirectoryHandle(handle, "games");
    await PreviewGeneratorV2RepoAccess.getDirectoryHandle(handle, "tools");
    const selectedRepoName = PreviewGeneratorV2RepoAccess.getRepoDestinationDisplayName(handle);
    if (!repoRootNameMatches(selectedRepoName, workspaceRepoRootName)) {
      return { ok: false, message: `Selected repo root ${selectedRepoName} does not match manifest repoRoot ${workspaceRepoRootName}.` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Selected folder is not the repo root: ${error.message}` };
  }
}

function getWriteFolderRelativePath(entry) {
  if (entry.targetType === "samples") {
    return `samples/phase-${entry.phase}/${entry.id}/${getAssetFolderRelativePath()}`;
  }
  if (entry.targetType === "games") {
    return `games/${entry.name}/${getAssetFolderRelativePath()}`;
  }
  if (entry.targetType === "tools") {
    return `tools/${entry.name}/${getAssetFolderRelativePath()}`;
  }
  throw new Error(`Unsupported target type: ${entry.targetType}`);
}

function getWriteFolderDisplayPath(entry) {
  return normalizeSlashes(getWriteFolderRelativePath(entry));
}

function getFullOutputPath(entry) {
  return `${getWriteFolderDisplayPath(entry)}\\${OUTPUT_NAME}`;
}

function updateWriteFolderSampleLabel() {
  const assetFolder = getAssetFolderDisplayPath() || "assets/images";
  const targetType = ui.getSelectedTargetType();

  if (targetType === "samples") {
    ui.outputSummary.setWriteFolderSample(`samples\\phaseXX\\XXXX\\${assetFolder}`);
    return;
  }
  if (targetType === "games") {
    ui.outputSummary.setWriteFolderSample(`games\\<gamename>\\${assetFolder}`);
    return;
  }
  if (targetType === "tools") {
    ui.outputSummary.setWriteFolderSample(`tools\\<toolname>\\${assetFolder}`);
  }
}

function getWorkspacePreviewTargetDisplayPath() {
  if (isWorkspaceManagerLaunch() && workspaceLaunchHydrated && workspaceGeneratedPreviewPath) {
    return workspaceGeneratedPreviewPath;
  }
  return workspaceManifestPreviewPath;
}

function updatePreviewTargetLabel() {
  ui.outputSummary.setPreviewTarget(getWorkspacePreviewTargetDisplayPath() || "not available yet");
}

async function updateWriteFolderActualLabelFromInput() {
  const lines = parseInputList(ui.pathsOrIds.getValue());
  if (!lines.length) {
    ui.outputSummary.setWriteFolderActual("not available yet");
    return;
  }

  try {
    const entries = await resolveEntries(lines[0]);
    if (entries.length > 1 && entries[0].targetType === "samples") {
      ui.outputSummary.setWriteFolderActual(normalizeSlashes(`samples/phase-${entries[0].phase}/*/${getAssetFolderRelativePath()}`));
      return;
    }

    ui.outputSummary.setWriteFolderActual(entries.length ? getWriteFolderDisplayPath(entries[0]) : "not available yet");
  } catch {
    ui.outputSummary.setWriteFolderActual("not available yet");
  }
}

async function updatePathPreviewLabels() {
  updateWriteFolderSampleLabel();
  updatePreviewTargetLabel();
  await updateWriteFolderActualLabelFromInput();
}

function getSamplePhaseFolderMatch(inputLine) {
  return String(inputLine || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .match(/^samples\/phase-?(\d{2})$/i);
}

async function resolveSamplePhase(phase) {
  if (!repoDirHandle) {
    throw new Error("Pick the repo folder before using a phase folder input.");
  }

  const samplesDir = await PreviewGeneratorV2RepoAccess.getDirectoryHandle(repoDirHandle, "samples");
  const phaseDir = await PreviewGeneratorV2RepoAccess.getDirectoryHandle(samplesDir, `phase-${phase}`);
  if (typeof phaseDir.entries !== "function") {
    throw new Error(`Cannot list samples/phase-${phase}.`);
  }

  const sampleEntries = [];
  for await (const [name, handle] of phaseDir.entries()) {
    if (!handle || handle.kind !== "directory" || !/^\d{4}$/.test(name)) continue;
    if (!(await PreviewGeneratorV2RepoAccess.hasIndexHtml(handle))) continue;
    sampleEntries.push({
      targetType: "samples",
      id: name,
      phase,
      samplePath: `samples/phase-${phase}/${name}/index.html`
    });
  }

  sampleEntries.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  if (!sampleEntries.length) {
    throw new Error(`No sample index.html entries found in samples/phase-${phase}.`);
  }

  return sampleEntries;
}

async function resolveSample(inputLine) {
  const raw = inputLine.trim();
  if (!raw) return null;
  const normalized = raw.replaceAll("\\", "/");

  const idOnlyMatch = normalized.match(/^(\d{4})$/);
  if (idOnlyMatch) {
    const id = idOnlyMatch[1];
    const phase = id.substring(0, 2);
    return {
      targetType: "samples",
      id,
      phase,
      samplePath: `samples/phase-${phase}/${id}/index.html`
    };
  }

  const pathMatch = normalized.match(/samples\/phase-?(\d{2})\/(\d{4})\/index\.html$/i);
  if (pathMatch) {
    return {
      targetType: "samples",
      id: pathMatch[2],
      phase: pathMatch[1],
      samplePath: `samples/phase-${pathMatch[1]}/${pathMatch[2]}/index.html`
    };
  }

  throw new Error(`Unrecognized sample input: ${raw}`);
}

async function resolveGame(inputLine) {
  const raw = inputLine.trim();
  if (!raw) return null;
  const normalized = raw.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");

  const pathMatch = normalized.match(/^games\/(.+)\/index\.html$/i);
  if (pathMatch) {
    return {
      targetType: "games",
      name: pathMatch[1],
      samplePath: `games/${pathMatch[1]}/index.html`
    };
  }

  return {
    targetType: "games",
    name: normalized,
    samplePath: `games/${normalized}/index.html`
  };
}

async function resolveTool(inputLine) {
  const raw = inputLine.trim();
  if (!raw) return null;
  const normalized = raw.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");

  const pathMatch = normalized.match(/^tools\/(.+)\/index\.html$/i);
  if (pathMatch) {
    return {
      targetType: "tools",
      name: pathMatch[1],
      samplePath: `tools/${pathMatch[1]}/index.html`
    };
  }

  return {
    targetType: "tools",
    name: normalized,
    samplePath: `tools/${normalized}/index.html`
  };
}

async function resolveEntry(inputLine) {
  const raw = String(inputLine || "").trim();
  if (!raw) return null;

  const normalized = raw.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");

  if (/^samples\//i.test(normalized)) {
    return await resolveSample(normalized);
  }
  if (/^games\//i.test(normalized)) {
    return await resolveGame(normalized);
  }
  if (/^tools\//i.test(normalized)) {
    return await resolveTool(normalized);
  }

  const targetType = ui.getSelectedTargetType();
  if (targetType === "samples") return await resolveSample(raw);
  if (targetType === "games") return await resolveGame(raw);
  if (targetType === "tools") return await resolveTool(raw);

  throw new Error(`Unsupported target type: ${targetType}`);
}

async function resolveEntries(inputLine) {
  const phaseMatch = getSamplePhaseFolderMatch(inputLine);
  if (phaseMatch) {
    return await resolveSamplePhase(phaseMatch[1]);
  }

  const entry = await resolveEntry(inputLine);
  return entry ? [entry] : [];
}

async function getTargetDirHandle(repoHandle, entry) {
  if (entry.targetType === "samples") {
    const samplesDir = await PreviewGeneratorV2RepoAccess.getDirectoryHandle(repoHandle, "samples");
    const phaseDir = await PreviewGeneratorV2RepoAccess.getDirectoryHandle(samplesDir, `phase-${entry.phase}`);
    return await PreviewGeneratorV2RepoAccess.getDirectoryHandle(phaseDir, entry.id);
  }

  if (entry.targetType === "games") {
    const gamesDir = await PreviewGeneratorV2RepoAccess.getDirectoryHandle(repoHandle, "games");
    return await getExistingDirectoryPath(gamesDir, entry.name);
  }

  if (entry.targetType === "tools") {
    const toolsDir = await PreviewGeneratorV2RepoAccess.getDirectoryHandle(repoHandle, "tools");
    return await getExistingDirectoryPath(toolsDir, entry.name);
  }

  throw new Error(`Unsupported target type: ${entry.targetType}`);
}

async function ensureDirectoryPath(parentHandle, relativePath) {
  const parts = String(relativePath || "")
    .replaceAll("\\", "/")
    .split("/")
    .map(x => x.trim())
    .filter(Boolean);

  let current = parentHandle;
  for (const part of parts) {
    current = await current.getDirectoryHandle(part, { create: true });
  }
  return current;
}

async function getExistingDirectoryPath(parentHandle, relativePath) {
  const parts = String(relativePath || "")
    .replaceAll("\\", "/")
    .split("/")
    .map(x => x.trim())
    .filter(Boolean);

  let current = parentHandle;
  for (const part of parts) {
    current = await current.getDirectoryHandle(part);
  }
  return current;
}

async function readExistingPreview(targetDirHandle) {
  const relativeOutputFolder = getAssetFolderRelativePath();
  try {
    const targetDir = relativeOutputFolder
      ? await getExistingDirectoryPath(targetDirHandle, relativeOutputFolder)
      : targetDirHandle;

    const fileHandle = await PreviewGeneratorV2RepoAccess.getFileHandle(targetDir, OUTPUT_NAME, false);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

async function shouldRewrite(targetDirHandle) {
  if (ui.renderControls.isForceRewrite()) {
    return { rewrite: true, reason: "force-rewrite" };
  }

  const existing = await readExistingPreview(targetDirHandle);
  if (existing == null) {
    return { rewrite: true, reason: "missing-preview" };
  }

  if (existing.includes(CAPTURE_TIMEOUT_MARKER)) {
    return { rewrite: true, reason: "literal-capture-timeout-found" };
  }

  return { rewrite: false, reason: "existing-preview-without-capture-timeout" };
}

function previewWriteError(message) {
  const error = new Error(message);
  error.previewWriteFailed = true;
  return error;
}

function isPreviewWriteError(error) {
  return Boolean(error?.previewWriteFailed);
}

function validateWorkspacePreviewWritePath(entry) {
  if (!isWorkspaceManagerLaunch() || !workspaceRepoPathHydrated || !workspacePreviewFileValid) {
    throw previewWriteError("Workspace direct preview write is unavailable until manifest repoPath is an absolute filesystem path.");
  }
  const targetPath = normalizeWorkspacePath(getWorkspacePreviewTargetDisplayPath());
  if (!targetPath) {
    throw previewWriteError("Workspace preview write path is empty.");
  }
  const targetParts = targetPath.split("/");
  if (targetParts.includes("..") || targetPath.startsWith(".")) {
    throw previewWriteError(`Workspace preview write path is invalid: ${targetPath}.`);
  }
  const expectedPrefix = `games/${entry.name}/`;
  if (entry.targetType !== "games" || entry.name !== workspacePreviewGameId || !targetPath.startsWith(expectedPrefix)) {
    throw previewWriteError(`Workspace preview write path ${targetPath} does not match the hydrated ${workspacePreviewGameId} game context.`);
  }
  try {
    const absolutePath = resolveWorkspaceAbsolutePreviewOutputPath(workspaceResolvedRepoPath, targetPath);
    return { absolutePath, targetPath };
  } catch (error) {
    throw previewWriteError(error.message);
  }
}

async function writeWorkspacePreview(svgContent, entry) {
  const { absolutePath, targetPath } = validateWorkspacePreviewWritePath(entry);
  const targetUrl = new URL("/__workspace-manager-v2/write-preview", window.location.href);
  let response;
  try {
    response = await fetch(targetUrl.href, {
      method: "PUT",
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "X-Workspace-Preview-Absolute-Path": absolutePath,
        "X-Workspace-Preview-Relative-Path": targetPath
      },
      body: svgContent
    });
  } catch (error) {
    throw previewWriteError(`${absolutePath} request failed: ${error.message}`);
  }
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw previewWriteError(`${absolutePath} returned ${response.status}${details ? `: ${details}` : ""}.`);
  }
  logger.log(`Direct preview write target: ${targetPath}`);
  logger.log(`Direct preview absolute path: ${absolutePath}`);
  logger.log(`OK Direct preview write completed: ${absolutePath}`);
}

async function writePreview(targetDirHandle, svgContent, entry) {
  if (!targetDirHandle && isWorkspaceManagerLaunch() && workspaceRepoPathHydrated) {
    await writeWorkspacePreview(svgContent, entry);
    return;
  }

  const relativeOutputFolder = getAssetFolderRelativePath();

  const targetDir = relativeOutputFolder
    ? await ensureDirectoryPath(targetDirHandle, relativeOutputFolder)
    : targetDirHandle;

  const fileHandle = await PreviewGeneratorV2RepoAccess.getFileHandle(targetDir, OUTPUT_NAME, true);
  const writable = await fileHandle.createWritable();
  await writable.write(svgContent);
  await writable.close();
}

async function processOne(entry, baseUrl, waitMs) {
  const targetDirHandle = repoDirHandle
    ? await getTargetDirHandle(repoDirHandle, entry)
    : null;
  const decision = targetDirHandle
    ? await shouldRewrite(targetDirHandle)
    : { rewrite: true, reason: "workspace-launch-absolute-repo-root" };

  ui.outputSummary.setWriteFolderActual(getWriteFolderDisplayPath(entry));
  const label = entry.targetType === "samples" ? entry.id : entry.name;

  if (!decision.rewrite) {
    logger.log(`SKIP ${label}  (${decision.reason})`);
    if (decision.reason === "existing-preview-without-capture-timeout") {
      logger.log(`Existing ${OUTPUT_NAME} does not contain ${CAPTURE_TIMEOUT_MARKER}; skipping rewrite.`);
    }
    logger.log(`CHK  ${getFullOutputPath(entry)}`);
    return { id: label, status: "skipped", reason: decision.reason };
  }
  if (decision.reason === "literal-capture-timeout-found") {
    logger.log(`Existing ${OUTPUT_NAME} contains ${CAPTURE_TIMEOUT_MARKER}; rewriting.`);
  }

  const url = `${baseUrl}/${entry.samplePath}`;
  logger.log(`RUN  ${label}`);
  logger.log(`OUT  ${getFullOutputPath(entry)}`);
  logger.log(`URL  ${url}`);

  try {
    await capture.loadFrame(url, 20000);
    if (entry.targetType === "games") {
      await capture.triggerGameStart();
      await sleep(3000);
    } else {
      await sleep(waitMs);
    }

    const svgContent = await capture.extractSvgFromFrame();
    await writePreview(targetDirHandle, svgContent, entry);
    ui.setLastGeneratedImage(svgContent, label);

    const stillHasTimeout = svgContent.includes(CAPTURE_TIMEOUT_MARKER);
    if (stillHasTimeout) {
      logger.log(`WARN ${label}  (saved but still contains Capture timeout)`);
      logger.log("");
      return { id: label, status: "warning", reason: "still-has-capture-timeout" };
    }

    logger.log(`OK   ${label}`);
    logger.log("");
    return { id: label, status: "written", reason: decision.reason };
  } catch (error) {
    if (isPreviewWriteError(error)) {
      logger.log(`FAIL Direct preview write failed: ${error.message}`);
      logger.log("");
      return { id: label, status: "failed", reason: error.message };
    }
    const fallback = capture.buildFallbackSvg(`${CAPTURE_TIMEOUT_MARKER}: ${error.message}`);
    try {
      await writePreview(targetDirHandle, fallback, entry);
    } catch (writeError) {
      const reason = isPreviewWriteError(writeError)
        ? writeError.message
        : `${error.message}; fallback write failed: ${writeError.message}`;
      if (isPreviewWriteError(writeError)) {
        logger.log(`FAIL Direct preview write failed: ${writeError.message}`);
      } else {
        logger.log(`FAIL ${label}  (${reason})`);
      }
      logger.log("");
      return { id: label, status: "failed", reason };
    }
    ui.setLastGeneratedImage(fallback, label);
    logger.log(`FAIL ${label}  (${error.message})`);
    logger.log("");
    return { id: label, status: "failed", reason: error.message };
  }
}

function parseInputList(text) {
  const lines = text
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(Boolean);

  const unique = [];
  const seen = new Set();

  for (const line of lines) {
    const key = line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(line);
    }
  }

  return unique;
}

function printSummary(results) {
  const skipped = results.filter(x => x.status === "skipped");
  const written = results.filter(x => x.status === "written");
  const warnings = results.filter(x => x.status === "warning");
  const failed = results.filter(x => x.status === "failed");

  logger.log("===== SUMMARY =====");
  logger.log(`Written: ${written.length}`);
  if (written.length) {
    logger.log(written.map(x => x.id).join(","));
  }

  logger.log(`Warnings: ${warnings.length}`);
  if (warnings.length) {
    logger.log(warnings.map(x => `${x.id}(${x.reason})`).join(","));
  }

  logger.log(`Failed: ${failed.length}`);
  if (failed.length) {
    logger.log(failed.map(x => `${x.id}(${x.reason})`).join(","));
  }

  const groupedSkips = {};
  for (const item of skipped) {
    groupedSkips[item.reason] = groupedSkips[item.reason] || [];
    groupedSkips[item.reason].push(item.id);
  }

  const reasons = Object.keys(groupedSkips);
  logger.log(`Skipped: ${skipped.length}`);
  for (const reason of reasons) {
    logger.log(`Skipped (${reason}):`);
    logger.log(groupedSkips[reason].join(","));
  }

  logger.log("===================");
}

function hasRepoDestinationContext() {
  return Boolean(repoDirHandle || (isWorkspaceManagerLaunch() && workspaceRepoPathHydrated));
}

class PreviewGeneratorV2App {
  hasValidWorkspacePreviewTarget() {
    if (!isWorkspaceManagerLaunch()) {
      return true;
    }
    return workspacePreviewFileValid
      && ui.getSelectedTargetType() === "games"
      && getAssetFolderRelativePath() === workspacePreviewAssetFolder
      && parseInputList(ui.pathsOrIds.getValue()).includes(workspacePreviewGameId);
  }

  hasRequiredGenerateFields() {
    return hasRepoDestinationContext()
      && parseInputList(ui.pathsOrIds.getValue()).length > 0
      && ui.targetSource.hasBaseUrl()
      && ui.assetFolder.hasValue()
      && ui.targetSource.hasSelection()
      && ui.captureMode.hasSelection()
      && this.hasValidWorkspacePreviewTarget();
  }

  syncGeneratePreviewButton() {
    ui.syncGeneratePreviewButton(isGenerating, this.hasRequiredGenerateFields());
  }

  async handlePickRepo() {
    try {
      const selectedRepoHandle = await window.showDirectoryPicker({ mode: "readwrite" });
      const repoValidation = await validateRepoRootHandle(selectedRepoHandle);
      if (!repoValidation.ok) {
        repoDirHandle = null;
        repoDisplayName = workspaceRepoRootName || "";
        ui.setRepoDestinationDisplayName(workspaceRepoRootName || "not selected");
        this.syncGeneratePreviewButton();
        logger.log(`FAIL ${repoValidation.message}`);
        return;
      }
      repoDirHandle = selectedRepoHandle;
      repoDisplayName = PreviewGeneratorV2RepoAccess.getRepoDestinationDisplayName(selectedRepoHandle);

      ui.setRepoDestinationDisplayName(repoDisplayName);
      logger.clearStatus();

      await updatePathPreviewLabels();
      this.syncGeneratePreviewButton();
      logger.log(`Repo selected: ${repoDisplayName}`);
      if (isWorkspaceManagerLaunch() && workspaceGeneratedPreviewPath) {
        logger.log(`Preview target updated: ${workspaceGeneratedPreviewPath}`);
      }
    } catch (error) {
      this.syncGeneratePreviewButton();
      logger.log(`Repo folder selection canceled or failed: ${error.message}`);
    }
  }

  async handleExecute() {
    if (!this.hasRequiredGenerateFields()) {
      this.syncGeneratePreviewButton();
      logger.log("Provide repo destination, base URL, asset folder, preview target, and at least one path or ID before generating.");
      return;
    }

    if (!hasRepoDestinationContext()) {
      logger.log("Pick the actual repo root folder or launch from Workspace Manager V2 before writing preview output.");
      return;
    }

    const lines = parseInputList(ui.pathsOrIds.getValue());
    if (!lines.length) {
      logger.log("Paste at least one path or ID.");
      return;
    }

    const baseUrl = ui.targetSource.getBaseUrl();
    const waitMs = ui.renderControls.getWaitMs();
    const targetType = ui.getSelectedTargetType();

    stopRequested = false;
    isGenerating = true;
    this.syncGeneratePreviewButton();
    ui.setStopDisabled(false);
    logger.log("");
    logger.log("Starting execution...");
    logger.log(`Target type: ${targetType}`);
    logger.log(`Base URL: ${baseUrl}`);
    logger.log(`Wait: ${waitMs}ms`);
    logger.log(`Repo selected: ${repoDisplayName || "not selected"}`);
    logger.log(`Asset folder: ${getAssetFolderDisplayPath()}`);
    logger.log(`Capture mode: ${ui.getCaptureModeLabel()}`);
    logger.log(`Force rewrite: ${ui.renderControls.isForceRewrite()}`);
    if (!repoDirHandle && isWorkspaceManagerLaunch()) {
      logger.log(`Workspace launch direct preview write target: ${getWorkspacePreviewTargetDisplayPath() || "unavailable"}.`);
      logger.log(`Workspace launch absolute preview output path: ${workspaceAbsolutePreviewOutputPath || "unavailable"}.`);
    }
    logger.log("");

    const results = [];

    try {
      for (const line of lines) {
        if (stopRequested) {
          logger.log("Stop requested. Ending run.");
          break;
        }

        try {
          const entries = await resolveEntries(line);
          if (entries.length > 1) {
            logger.log(`Resolved ${entries.length} samples from ${line}.`);
          }

          for (const entry of entries) {
            if (stopRequested) {
              logger.log("Stop requested. Ending run.");
              break;
            }

            const result = await processOne(entry, baseUrl, waitMs);
            results.push(result);
          }
        } catch (error) {
          logger.log(`FAIL INPUT  ${line}  (${error.message})`);
          logger.log("");
          results.push({ id: line, status: "failed", reason: error.message });
        }
      }

      printSummary(results);
    } catch (error) {
      logger.log(`Unexpected error: ${error.message}`);
    } finally {
      isGenerating = false;
      this.syncGeneratePreviewButton();
      ui.setStopDisabled(true);
      logger.log("Done.");
    }
  }

  handleClearLog() {
    logger.clear();
  }

  handleStop() {
    stopRequested = true;
    logger.log("Stop requested. Will stop after current item.");
  }

  async hydrateWorkspaceLaunchContext() {
    const contextResult = readWorkspaceLaunchContext();
    if (contextResult.skipped) {
      return;
    }
    logger.log("Workspace launch context hydration started.");
    workspacePreviewFileValid = false;
    workspaceLaunchHydrated = false;
    workspaceRepoPathHydrated = false;
    workspaceResolvedRepoPath = "";
    workspaceManifestPreviewPath = "";
    workspaceGeneratedPreviewPath = "";
    workspaceAbsolutePreviewOutputPath = "";
    capture.setCaptureBackgroundColor("");
    if (!contextResult.ok) {
      logger.log(`FAIL Workspace launch context hydration: ${contextResult.message}`);
      this.syncGeneratePreviewButton();
      return;
    }

    const manifest = contextResult.manifest;
    contextResult.pathFields.forEach((field) => {
      logger.log(`Raw workspace launch path field ${field.label}: ${displayRawLaunchFieldValue(field.text)}`);
    });
    logger.log(`Resolved repoPath decision source field used: ${contextResult.repoPathDecision.sourceField}`);
    logger.log(`Resolved repoPath decision value: ${displayRawLaunchFieldValue(contextResult.repoPathDecision.value)}`);
    logger.log(`Resolved repoPath decision absolute: ${contextResult.repoPathDecision.isAbsolute ? "true" : "false"}`);
    if (!contextResult.repoPathDecision.value) {
      logger.log(`Missing repoPath fields checked: ${contextResult.repoPathDecision.checkedMissingFields.join(", ")}`);
    }

    const previewTarget = workspacePreviewTarget(manifest);
    if (!previewTarget.ok) {
      logger.log(`FAIL Workspace launch context hydration: ${previewTarget.message}`);
      this.syncGeneratePreviewButton();
      return;
    }

    const manifestRepoRoot = String(manifest.repoRoot || "").trim();
    const resolvedRepoPath = contextResult.repoPathDecision.value;
    repoDisplayName = resolvedRepoPath || manifestRepoRoot;
    repoDirHandle = null;
    workspaceLaunchHydrated = true;
    workspaceRepoRootName = manifestRepoRoot;
    workspacePreviewAssetFolder = previewTarget.previewAssetFolder;
    workspacePreviewGameId = manifest.gameId;
    workspaceManifestPreviewPath = previewTarget.manifestPreviewPath;
    workspaceGeneratedPreviewPath = previewTarget.generatedPreviewPath;
    if (resolvedRepoPath) {
      try {
        workspaceAbsolutePreviewOutputPath = resolveWorkspaceAbsolutePreviewOutputPath(resolvedRepoPath, previewTarget.generatedPreviewPath);
        workspaceRepoPathHydrated = true;
        workspaceResolvedRepoPath = resolvedRepoPath;
      } catch (error) {
        logger.log(`WARN Workspace direct preview write unavailable: ${error.message}`);
      }
    }
    ui.setRepoDestinationDisplayName(repoDisplayName);
    ui.targetSource.setSelectedTargetType("games");
    ui.targetSource.showWorkspaceGamesOnly();
    ui.assetFolder.setValue(workspacePreviewAssetFolder);
    ui.pathsOrIds.setValue(manifest.gameId);
    await updatePathPreviewLabels();
    logger.log(`OK Workspace launch context hydrated for ${manifest.gameId}.`);
    logger.log(`Workspace repoRoot display label available: ${manifestRepoRoot || "(empty)"}.`);
    logger.log(`Workspace repoPath ${resolvedRepoPath ? `available: ${resolvedRepoPath}` : "missing"}.`);
    if (workspaceRepoPathHydrated) {
      logger.log(`Resolved repoPath: ${workspaceResolvedRepoPath}`);
      logger.log(`Resolved absolute preview output path: ${workspaceAbsolutePreviewOutputPath}`);
    } else {
      logger.log(`WARN Manifest repoPath is missing or invalid for workspace launch; repoRoot is display-only: ${manifestRepoRoot || "(empty)"}.`);
      logger.log("Direct preview write unavailable until manifest repoPath is an absolute filesystem path.");
    }
    logger.log("Target source: games");
    logger.log(`Asset folder: ${getAssetFolderDisplayPath()}`);
    logger.log(`Manifest preview asset: ${previewTarget.previewAssetId} (${previewTarget.previewAssetType}/${previewTarget.previewAssetKind})`);
    logger.log(`Manifest preview source: ${workspaceManifestPreviewPath}`);
    logger.log(`Generated preview target: ${workspaceGeneratedPreviewPath}`);
    logger.log(`Preview target: ${getWorkspacePreviewTargetDisplayPath()}`);

    const backgroundContext = workspaceBackgroundContext(manifest);
    if (backgroundContext.ok) {
      if (backgroundContext.backgroundAssetMissing) {
        if (backgroundContext.colorHex) {
          capture.setCaptureBackgroundColor(backgroundContext.colorHex);
          logger.log(`WARN Workspace background image role is missing; using manifest palette background color ${backgroundContext.colorName} ${backgroundContext.colorHex}.`);
        } else {
          logger.log("WARN Workspace background image role is missing and no manifest palette background or black swatch is available; preview generation remains enabled without an explicit workspace background color.");
        }
      } else {
        const backgroundValidation = await validateWorkspaceImagePath(backgroundContext.backgroundPath, "Workspace background source");
        if (backgroundValidation.ok) {
          logger.log(`Workspace background source: ${backgroundContext.backgroundAssetId} -> ${backgroundContext.backgroundPath}`);
        } else {
          logger.log(`WARN Workspace background source unavailable: ${backgroundValidation.message}`);
        }
        if (backgroundContext.colorHex) {
          capture.setCaptureBackgroundColor(backgroundContext.colorHex);
          logger.log(`Workspace background color: ${backgroundContext.colorName} ${backgroundContext.colorHex} from palette-manager-v2 swatch.`);
        } else {
          logger.log("WARN Workspace background color is not available from a manifest palette background or black swatch; preview generation remains enabled without an explicit workspace background color.");
        }
      }
    } else {
      logger.log(`WARN Workspace background hydration: ${backgroundContext.message}`);
    }

    const previewResult = await validateWorkspaceImagePath(workspaceManifestPreviewPath, "Workspace manifest preview source");
    if (previewResult.ok) {
      workspacePreviewFileValid = true;
      ui.setPreviewTargetImage(workspaceManifestPreviewPath);
      logger.log(`OK Workspace manifest preview source is valid at ${workspaceManifestPreviewPath}.`);
    } else {
      workspacePreviewFileValid = false;
      logger.log(`FAIL Workspace preview source validation: ${previewResult.message}`);
    }
    this.syncGeneratePreviewButton();
  }

  bindEvents() {
    ui.repoDestination.onPickRepo(() => {
      void this.handlePickRepo();
    });

    ui.generatePreview.onGeneratePreview(() => {
      void this.handleExecute();
    });

    ui.statusLog.onClear(() => {
      this.handleClearLog();
    });

    ui.generatePreview.onStop(() => {
      this.handleStop();
    });

    ui.captureMode.onChange(() => {
      logger.log(`Capture mode: ${ui.getCaptureModeLabel()}`);
      this.syncGeneratePreviewButton();
    });

    ui.targetSource.onBaseUrlInput(() => {
      this.syncGeneratePreviewButton();
    });

    ui.renderControls.onWaitInput(() => {
      this.syncGeneratePreviewButton();
    });

    ui.assetFolder.onInput(() => {
      updatePathPreviewLabels();
      this.syncGeneratePreviewButton();
    });

    ui.pathsOrIds.onInput(() => {
      updatePathPreviewLabels();
      this.syncGeneratePreviewButton();
    });

    ui.targetSource.onTargetChange(() => {
      updatePathPreviewLabels();
      this.syncGeneratePreviewButton();
    });
  }

  init() {
    if (isRuntimeMode) {
      capture.initializeRuntimeCaptureMode(runtimeParams);
      return;
    }

    this.bindEvents();
    if (isWorkspaceManagerLaunch()) {
      ui.setPickRepoVisible(false);
    }
    updatePathPreviewLabels();
    this.syncGeneratePreviewButton();
    void this.hydrateWorkspaceLaunchContext();
  }
}

export { PreviewGeneratorV2App };
