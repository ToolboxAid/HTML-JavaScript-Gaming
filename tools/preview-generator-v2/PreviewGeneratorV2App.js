import { isPlainObject } from '../../src/shared/utils/objectUtils.js';
import { readFileHandleText, writeFileHandleText } from '../../src/engine/persistence/index.js';
import { PreviewGeneratorV2Logger } from './PreviewGeneratorV2Logger.js';
import { PreviewGeneratorV2Ui } from './PreviewGeneratorV2Ui.js';
import { PreviewGeneratorV2RepoAccess } from './PreviewGeneratorV2RepoAccess.js';
import { PreviewGeneratorV2Capture } from './PreviewGeneratorV2Capture.js';

const OUTPUT_NAME = "preview.svg";
const CAPTURE_TIMEOUT_MARKER = PreviewGeneratorV2Capture.CAPTURE_TIMEOUT_MARKER;
const ASSET_MANAGER_V2_TOOL_KEY = "asset-manager-v2";
const PALETTE_MANAGER_V2_TOOL_KEY = "palette-manager-v2";
const PREVIEW_GENERATOR_V2_TOOL_KEY = "preview-generator-v2";
const WORKSPACE_REPO_REFERENCE_SESSION_KEY = "workspace.repo.reference";
const WORKSPACE_PREVIEW_GENERATOR_SESSION_KEY = `workspace.tools.${PREVIEW_GENERATOR_V2_TOOL_KEY}`;
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
let workspaceRepoRootPath = "";
let workspaceRepoRootName = "";
let workspaceManifestPreviewPath = "";
let workspaceGeneratedPreviewPath = "";
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

function normalizeOutputPath(value) {
  return normalizeWorkspacePath(value);
}

function normalizeAbsoluteRepoPath(value) {
  const path = normalizeOutputPath(value);
  if (/^[a-z]:\//i.test(path) || path.startsWith("/") || path.startsWith("//")) {
    return path;
  }
  return "";
}

function displayAbsolutePath(value) {
  const path = normalizeOutputPath(value);
  if (/^[a-z]:\//i.test(path)) {
    return path.replaceAll("/", "\\");
  }
  if (path.startsWith("//")) {
    return `\\\\${path.slice(2).replaceAll("/", "\\")}`;
  }
  return path;
}

function joinOutputPath(rootPath, relativePath) {
  return `${normalizeOutputPath(rootPath).replace(/\/+$/, "")}/${normalizeOutputPath(relativePath)}`;
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

function readSessionJson(key) {
  const rawValue = window.sessionStorage.getItem(key);
  if (!rawValue) {
    return { ok: false, message: `${key} was not found in sessionStorage.` };
  }
  try {
    const value = JSON.parse(rawValue);
    return isPlainObject(value)
      ? { ok: true, value }
      : { ok: false, message: `${key} must contain a JSON object.` };
  } catch (error) {
    return { ok: false, message: `${key} contains invalid JSON: ${error.message}` };
  }
}

function readWorkspaceRepoReference() {
  const result = readSessionJson(WORKSPACE_REPO_REFERENCE_SESSION_KEY);
  if (!result.ok) {
    return result;
  }
  const reference = result.value;
  if (reference.source !== "workspace-manager-v2") {
    return { ok: false, message: `${WORKSPACE_REPO_REFERENCE_SESSION_KEY}.source must be workspace-manager-v2.` };
  }
  if (reference.kind !== "file-system-directory-handle-reference") {
    return { ok: false, message: `${WORKSPACE_REPO_REFERENCE_SESSION_KEY}.kind must be file-system-directory-handle-reference.` };
  }
  const displayName = String(reference.displayName || reference.handleName || "").trim();
  if (!displayName) {
    return { ok: false, message: `${WORKSPACE_REPO_REFERENCE_SESSION_KEY} must include displayName or handleName.` };
  }
  return { ok: true, reference: { ...reference, displayName } };
}

function readWorkspacePreviewGeneratorWorkspace(manifest) {
  const result = readSessionJson(WORKSPACE_PREVIEW_GENERATOR_SESSION_KEY);
  if (!result.ok) {
    return result;
  }
  if (!isPlainObject(result.value.workspace)) {
    return { ok: false, message: `${WORKSPACE_PREVIEW_GENERATOR_SESSION_KEY}.workspace must contain a JSON object.` };
  }
  const workspace = result.value.workspace;
  if (workspace.source !== "workspace-manager-v2") {
    return { ok: false, message: `${WORKSPACE_PREVIEW_GENERATOR_SESSION_KEY}.workspace.source must be workspace-manager-v2.` };
  }
  if (workspace.toolId !== PREVIEW_GENERATOR_V2_TOOL_KEY) {
    return { ok: false, message: `${WORKSPACE_PREVIEW_GENERATOR_SESSION_KEY}.workspace.toolId must be ${PREVIEW_GENERATOR_V2_TOOL_KEY}.` };
  }
  if (workspace.repoReferenceKey !== WORKSPACE_REPO_REFERENCE_SESSION_KEY) {
    return { ok: false, message: `${WORKSPACE_PREVIEW_GENERATOR_SESSION_KEY}.workspace.repoReferenceKey must be ${WORKSPACE_REPO_REFERENCE_SESSION_KEY}.` };
  }
  if (workspace.gameId !== manifest.gameId) {
    return { ok: false, message: `${WORKSPACE_PREVIEW_GENERATOR_SESSION_KEY}.workspace.gameId must match manifest.gameId ${manifest.gameId}.` };
  }
  if (workspace.gameRoot !== manifest.gameRoot || workspace.assetsPath !== manifest.assetsPath) {
    return { ok: false, message: `${WORKSPACE_PREVIEW_GENERATOR_SESSION_KEY}.workspace gameRoot/assetsPath must match the workspace manifest.` };
  }
  return { ok: true, workspace };
}

function isProjectManifestContext(value) {
  return isPlainObject(value) && value.schema === "html-js-gaming.project";
}

function workspaceManifestFromLaunchContext(launchContext) {
  if (isProjectManifestContext(launchContext)) {
    return launchContext;
  }
  if (isProjectManifestContext(launchContext?.manifest)) {
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
    { label: "launchContext.repoRoot", value: launchContext?.repoRoot },
    { label: "manifest.repoRoot", value: manifest?.repoRoot }
  ].map((field) => ({
    ...field,
    text: String(field.value || "").trim()
  }));
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
    const repoRootText = pathFields
      .filter((field) => field.label.endsWith(".repoRoot"))
      .find((field) => field.text)?.text || "";
    if (!repoRootText) {
      return { ok: false, message: "Workspace Manager V2 manifest is missing repoRoot display label." };
    }
    return { ok: true, launchContext, manifest, pathFields };
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

function workspaceBackgroundColorAsset(manifest) {
  const assets = manifest.tools?.[ASSET_MANAGER_V2_TOOL_KEY]?.assets;
  if (!assets || typeof assets !== "object" || Array.isArray(assets)) {
    return null;
  }
  const entry = assets["assets.color.background.game"];
  const hex = normalizeHexColor(entry?.color?.hex);
  const name = String(entry?.color?.name || "").trim();
  if (!entry || entry.type !== "color" || entry.role !== BACKGROUND_ROLE || !hex || !name) {
    return null;
  }
  return {
    assetId: "assets.color.background.game",
    hex,
    name
  };
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
  const colorAsset = workspaceBackgroundColorAsset(manifest);
  const color = colorAsset || workspacePaletteBackgroundColor(manifest);
  if (!backgroundAsset) {
    return {
      ok: true,
      backgroundAssetMissing: true,
      colorAssetId: colorAsset?.assetId || "",
      colorHex: color?.hex || "",
      colorName: color?.name || "",
      colorSource: colorAsset ? "asset-manager-v2" : "palette-manager-v2"
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
    colorAssetId: colorAsset?.assetId || "",
    colorHex: color?.hex || "",
    colorName: color?.name || "",
    colorSource: colorAsset ? "asset-manager-v2" : "palette-manager-v2"
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
    const fallbackPreviewAssetFolder = normalizeWorkspacePath(`${assetFolder}/images`);
    return {
      ok: true,
      generatedPreviewPath: `${gameRoot}/${fallbackPreviewAssetFolder}/${OUTPUT_NAME}`,
      manifestPreviewPath: "",
      previewAssetFolder: fallbackPreviewAssetFolder,
      previewAssetId: "",
      previewAssetKind: "",
      previewAssetMissing: true,
      previewAssetType: ""
    };
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

function getFullOutputRelativePath(entry) {
  return normalizeOutputPath(`${getWriteFolderRelativePath(entry)}/${OUTPUT_NAME}`);
}

function selectedRepoRootPath() {
  return normalizeAbsoluteRepoPath(workspaceRepoRootPath)
    || normalizeAbsoluteRepoPath(repoDirHandle?.absolutePath)
    || normalizeAbsoluteRepoPath(repoDirHandle?.repoRootPath)
    || normalizeAbsoluteRepoPath(repoDirHandle?.path);
}

function selectedRepoRootPathState() {
  const repoRootPath = selectedRepoRootPath();
  if (!repoRootPath) {
    const handleName = repoHandleRootName();
    const displayLabel = workspaceRepoRootName || repoDisplayName || handleName || "(unavailable)";
    return {
      ok: false,
      message: `Repo root path is unavailable; cannot resolve a full absolute output path. Selected repo label: ${displayLabel}; handle root name: ${handleName || "(unavailable)"}; session key checked: ${WORKSPACE_REPO_REFERENCE_SESSION_KEY}. Required action: select the repo root folder again in Workspace Manager V2 or Pick Repo before generating previews.`,
      repoRootDisplayPath: "",
      repoRootPath: ""
    };
  }
  return {
    ok: true,
    repoRootDisplayPath: displayAbsolutePath(repoRootPath),
    repoRootPath
  };
}

function repoHandleRootName() {
  return String(repoDirHandle?.name || "").trim();
}

function hasRepoFileSystemDirectoryHandle() {
  return hasRepoDirectoryHandle();
}

function hasRepoDirectoryHandle() {
  return Boolean(repoDirHandle
    && repoDirHandle.kind === "directory"
    && typeof repoDirHandle.getDirectoryHandle === "function");
}

function previewOutputFolderRelativePath(entry) {
  return normalizeOutputPath(getWriteFolderRelativePath(entry));
}

async function verifyRepoHandleFolder(relativeFolder) {
  const requestedRelativeFolder = normalizeOutputPath(relativeFolder);
  const handleRootName = repoHandleRootName();
  if (!hasRepoDirectoryHandle()) {
    return {
      handleRootName,
      ok: false,
      requestedRelativeFolder,
      sessionKey: WORKSPACE_REPO_REFERENCE_SESSION_KEY,
      message: "repo FileSystemDirectoryHandle is unavailable or does not support directory resolution"
    };
  }
  try {
    await getExistingDirectoryPath(repoDirHandle, requestedRelativeFolder);
    return {
      handleRootName,
      ok: true,
      requestedRelativeFolder,
      sessionKey: WORKSPACE_REPO_REFERENCE_SESSION_KEY
    };
  } catch (error) {
    return {
      handleRootName,
      ok: false,
      requestedRelativeFolder,
      sessionKey: WORKSPACE_REPO_REFERENCE_SESSION_KEY,
      message: error.message
    };
  }
}

function logRepoHandleFolderFailure(result) {
  logger.log(`FAIL Repo handle folder resolution: requested relative folder: ${result.requestedRelativeFolder || "(unavailable)"}; handle root name: ${result.handleRootName || "(unavailable)"}; display repoRoot string: ${workspaceRepoRootName || repoDisplayName || "(unavailable)"}; session key used: ${result.sessionKey}; ${result.message}`);
}

async function logWorkspaceRepoHandleState(manifest) {
  const relativeFolder = normalizeOutputPath(`${manifest.gameRoot || ""}${workspacePreviewAssetFolder || ""}`);
  const repoRoot = selectedRepoRootPathState();
  logger.log(`Repo display label: ${repoDisplayName || "(unavailable)"}`);
  logger.log(`Repo root path string: ${repoRoot.ok ? repoRoot.repoRootDisplayPath : "unavailable"}`);
  logger.log(`Repo FileSystemDirectoryHandle present: ${hasRepoFileSystemDirectoryHandle() ? "true" : "false"}`);
  logger.log(`Verified handle root name: ${repoHandleRootName() || "(unavailable)"}`);
  const folderCheck = await verifyRepoHandleFolder(relativeFolder);
  if (folderCheck.ok) {
    logger.log(`OK Repo handle resolved folder ${folderCheck.requestedRelativeFolder}.`);
  } else {
    logRepoHandleFolderFailure(folderCheck);
  }
}

function outputSourceContext(entry) {
  const selectedGame = entry.targetType === "games"
    ? String(entry.name || workspacePreviewGameId || "").trim()
    : String(workspacePreviewGameId || "").trim();
  return [
    isWorkspaceManagerLaunch() ? `${WORKSPACE_PREVIEW_GENERATOR_SESSION_KEY}.data` : "preview-generator-v2 form controls",
    `selected game: ${selectedGame || "(not a game target)"}`,
    `resolved assets/images target: ${getAssetFolderRelativePath() || "(empty)"}`,
    `target type: ${entry.targetType || "(unknown)"}`
  ].join("; ");
}

function resolveOutputPathState(entry) {
  const repoRoot = selectedRepoRootPathState();
  const relativeOutputPath = (() => {
    try {
      return getFullOutputRelativePath(entry);
    } catch {
      return "";
    }
  })();
  try {
    if (!repoRoot.ok) {
      return {
        ok: false,
        absoluteOutputPath: "",
        fullAbsoluteOutputPath: "",
        fullAbsoluteOutputPathDisplay: "",
        message: repoRoot.message,
        relativeOutputPath,
        repoRootDisplayPath: repoRoot.repoRootDisplayPath,
        repoRootPath: "",
        sourceContext: outputSourceContext(entry)
      };
    }
    if (!relativeOutputPath) {
      return {
        ok: false,
        absoluteOutputPath: "",
        fullAbsoluteOutputPath: "",
        fullAbsoluteOutputPathDisplay: "",
        message: "Relative output path is unavailable.",
        relativeOutputPath,
        repoRootDisplayPath: repoRoot.repoRootDisplayPath,
        repoRootPath: repoRoot.repoRootPath,
        sourceContext: outputSourceContext(entry)
      };
    }
    const fullAbsoluteOutputPath = joinOutputPath(repoRoot.repoRootPath, relativeOutputPath);
    return {
      ok: true,
      absoluteOutputPath: fullAbsoluteOutputPath,
      fullAbsoluteOutputPath,
      fullAbsoluteOutputPathDisplay: displayAbsolutePath(fullAbsoluteOutputPath),
      relativeOutputPath,
      repoRootDisplayPath: repoRoot.repoRootDisplayPath,
      repoRootPath: repoRoot.repoRootPath,
      sourceContext: outputSourceContext(entry)
    };
  } catch (error) {
    return {
      ok: false,
      absoluteOutputPath: "",
      fullAbsoluteOutputPath: "",
      fullAbsoluteOutputPathDisplay: "",
      message: error.message,
      relativeOutputPath,
      repoRootDisplayPath: repoRoot.repoRootDisplayPath,
      repoRootPath: repoRoot.repoRootPath,
      sourceContext: outputSourceContext(entry)
    };
  }
}

function absoluteOutputPathFromWrite(pathState) {
  return pathState.fullAbsoluteOutputPath
    || pathState.absoluteOutputPath
    || "";
}

function handleOutputPathFromWrite(fileHandle, pathState) {
  const relativeOutputPath = normalizeOutputPath(pathState?.relativeOutputPath);
  const handlePath = normalizeOutputPath(fileHandle?.path);
  const handleRoot = normalizeOutputPath(repoHandleRootName());

  if (handlePath && handleRoot && handlePath.startsWith(`${handleRoot}/`)) {
    return handlePath.slice(handleRoot.length + 1);
  }
  if (handlePath && relativeOutputPath && handlePath.endsWith(relativeOutputPath)) {
    return relativeOutputPath;
  }
  return relativeOutputPath || handlePath;
}

async function verifyWrittenPreview(fileHandle, expectedContents, pathState) {
  const outputPath = pathState.fullAbsoluteOutputPathDisplay || displayAbsolutePath(pathState.fullAbsoluteOutputPath);
  const handleRelativeOutputPath = handleOutputPathFromWrite(fileHandle, pathState);
  if (!fileHandle || typeof fileHandle.getFile !== "function") {
    return {
      checked: false,
      message: "file read-back is unavailable from this repo handle",
      ok: false
    };
  }
  try {
    const { file, text: actualContents } = await readFileHandleText(fileHandle, {
      textErrorMessage: "file text read-back is unavailable from this repo handle"
    });
    const fileSize = Number.isFinite(file.size) ? file.size : String(actualContents).length;
    const modifiedTimestamp = Number.isFinite(file.lastModified) && file.lastModified > 0
      ? file.lastModified
      : "";
    const contentStartsAsSvg = String(actualContents).trimStart().startsWith("<svg");
    const details = {
      checked: true,
      contentStartsAsSvg,
      fileExists: true,
      fileSize,
      handleRelativeOutputPath,
      modifiedTimestamp,
      outputPath
    };
    if (!contentStartsAsSvg) {
      return {
        ...details,
        message: `Write verification failed for ${outputPath}: read-back content did not start as SVG.`,
        ok: false
      };
    }
    if (String(actualContents) !== String(expectedContents)) {
      return {
        ...details,
        message: `Write verification failed for ${outputPath}: read-back contents did not match generated preview.svg.`,
        ok: false
      };
    }
    return {
      ...details,
      ok: true
    };
  } catch (error) {
    if (error.message === "file text read-back is unavailable from this repo handle") {
      return { checked: false, message: error.message, ok: false };
    }
    return {
      checked: true,
      fileExists: false,
      handleRelativeOutputPath,
      message: `Write verification failed for ${outputPath}: ${error.message}`,
      outputPath,
      ok: false
    };
  }
}

function logWritePath(label, pathState, writeResult) {
  const absoluteDisplayPath = displayAbsolutePath(writeResult.absoluteOutputPath || pathState.fullAbsoluteOutputPath);
  const handleRelativeOutputPath = writeResult.handleRelativeOutputPath || writeResult.handleOutputPath || pathState.relativeOutputPath;
  if (writeResult.verified) {
    logger.log(`Write verification passed: file exists at ${absoluteDisplayPath}.`);
    logger.log(`Write verification file exists: ${writeResult.fileExists ? "true" : "false"}.`);
    logger.log(`Write verification file size: ${Number.isFinite(writeResult.fileSize) ? writeResult.fileSize : "unavailable"} bytes.`);
    logger.log(`Write verification modified timestamp: ${writeResult.modifiedTimestamp || "unavailable"}.`);
    logger.log(`Write verification content starts as SVG: ${writeResult.contentStartsAsSvg ? "true" : "false"}.`);
    logger.log(`Write verification output path: ${absoluteDisplayPath}.`);
    logger.log(`Write verification handle-relative path: ${handleRelativeOutputPath}.`);
  }
  logger.log(`OK WRITE ${label}`);
  logger.log(`Repo display label: ${repoDisplayName || "(unavailable)"}`);
  logger.log(`Repo root path string: ${pathState.repoRootDisplayPath || "(unavailable)"}`);
  logger.log(`Handle root name: ${repoHandleRootName() || "(unavailable)"}`);
  logger.log(`Handle-relative output path: ${handleRelativeOutputPath}`);
  logger.log(`Absolute display path: ${absoluteDisplayPath}`);
  logger.log(`Source resolution context: ${pathState.sourceContext}`);
  if (ui.renderControls.isForceRewrite()) {
    logger.log(`Force rewrite verification passed for ${absoluteDisplayPath}.`);
  }
}

function logOutputPathFailure(label, pathState, reason) {
  logger.log(`FAIL PATH ${label}  (${reason}; relative output path: ${pathState.relativeOutputPath || "(unresolved)"}; repo root: ${pathState.repoRootDisplayPath || "(unavailable)"}; full absolute output path: ${pathState.fullAbsoluteOutputPathDisplay || "(unavailable)"}; source resolution context: ${pathState.sourceContext})`);
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
  let targetDir;
  try {
    targetDir = relativeOutputFolder
      ? await getExistingDirectoryPath(targetDirHandle, relativeOutputFolder)
      : targetDirHandle;
  } catch (error) {
    return {
      contents: "",
      exists: false,
      message: `output folder is missing: ${error.message}`,
      verified: false
    };
  }

  try {
    const fileHandle = await PreviewGeneratorV2RepoAccess.getFileHandle(targetDir, OUTPUT_NAME, false);
    if (!fileHandle || typeof fileHandle.getFile !== "function") {
      return {
        contents: "",
        exists: true,
        message: `${OUTPUT_NAME} exists but cannot be read back from the repo handle.`,
        verified: false
      };
    }
    const { text } = await readFileHandleText(fileHandle, {
      textErrorMessage: `${OUTPUT_NAME} exists but text read-back is unavailable.`
    });
    return {
      contents: text,
      exists: true,
      message: "",
      verified: true
    };
  } catch (error) {
    if (error.message === `${OUTPUT_NAME} exists but text read-back is unavailable.`) {
      return {
        contents: "",
        exists: true,
        message: error.message,
        verified: false
      };
    }
    return {
      contents: "",
      exists: false,
      message: `${OUTPUT_NAME} was not found: ${error.message}`,
      verified: false
    };
  }
}

async function shouldRewrite(targetDirHandle, pathState) {
  if (ui.renderControls.isForceRewrite()) {
    return { checkedPath: pathState.fullAbsoluteOutputPathDisplay, rewrite: true, reason: "force-rewrite" };
  }

  const existing = await readExistingPreview(targetDirHandle);
  const checkedPath = pathState.fullAbsoluteOutputPathDisplay || displayAbsolutePath(pathState.fullAbsoluteOutputPath);
  if (!existing.exists) {
    return { checkedPath, check: existing, rewrite: true, reason: "missing-preview" };
  }

  if (!existing.verified) {
    return { checkedPath, check: existing, rewrite: true, reason: "unverified-preview" };
  }

  if (existing.contents.includes(CAPTURE_TIMEOUT_MARKER)) {
    return { checkedPath, check: existing, rewrite: true, reason: "literal-capture-timeout-found" };
  }

  return { checkedPath, check: existing, rewrite: false, reason: "existing-preview-without-capture-timeout" };
}

function logPreviewCheck(decision) {
  if (!decision.checkedPath) {
    return;
  }
  logger.log(`CHK  ${decision.checkedPath}`);
  if (decision.check && !decision.check.exists) {
    logger.log(`MISSING ${decision.checkedPath} (${decision.check.message})`);
  } else if (decision.check && !decision.check.verified) {
    logger.log(`WARN CHK ${decision.checkedPath} could not be verified (${decision.check.message}); generating new ${OUTPUT_NAME}.`);
  }
}

async function writePreview(targetDirHandle, svgContent, pathState) {
  const relativeOutputFolder = getAssetFolderRelativePath();

  const targetDir = relativeOutputFolder
    ? await ensureDirectoryPath(targetDirHandle, relativeOutputFolder)
    : targetDirHandle;

  const fileHandle = await PreviewGeneratorV2RepoAccess.getFileHandle(targetDir, OUTPUT_NAME, true);
  await writeFileHandleText(fileHandle, svgContent);
  const verification = await verifyWrittenPreview(fileHandle, svgContent, pathState);
  if (!verification.ok) {
    return {
      absoluteOutputPath: pathState.fullAbsoluteOutputPath,
      contentStartsAsSvg: verification.contentStartsAsSvg,
      fileExists: verification.fileExists,
      fileSize: verification.fileSize,
      handleOutputPath: handleOutputPathFromWrite(fileHandle, pathState),
      handleRelativeOutputPath: verification.handleRelativeOutputPath || handleOutputPathFromWrite(fileHandle, pathState),
      message: verification.message,
      modifiedTimestamp: verification.modifiedTimestamp,
      ok: false,
      outputPath: verification.outputPath,
      relativeOutputPath: pathState.relativeOutputPath,
      verified: verification.checked
    };
  }
  return {
    absoluteOutputPath: absoluteOutputPathFromWrite(pathState),
    contentStartsAsSvg: verification.contentStartsAsSvg,
    fileExists: verification.fileExists,
    fileSize: verification.fileSize,
    handleOutputPath: handleOutputPathFromWrite(fileHandle, pathState),
    handleRelativeOutputPath: verification.handleRelativeOutputPath || handleOutputPathFromWrite(fileHandle, pathState),
    modifiedTimestamp: verification.modifiedTimestamp,
    ok: true,
    outputPath: verification.outputPath,
    relativeOutputPath: pathState.relativeOutputPath,
    verified: verification.checked
  };
}

async function processOne(entry, baseUrl, waitMs) {
  const label = entry.targetType === "samples" ? entry.id : entry.name;
  const pathState = resolveOutputPathState(entry);
  if (!pathState.ok) {
    logOutputPathFailure(label, pathState, pathState.message);
    logger.log("");
    return { id: label, status: "failed", reason: `output-path-resolution-failed: ${pathState.message}` };
  }

  let targetDirHandle;
  try {
    targetDirHandle = await getTargetDirHandle(repoDirHandle, entry);
  } catch (error) {
    logRepoHandleFolderFailure({
      handleRootName: repoHandleRootName(),
      message: error.message,
      requestedRelativeFolder: previewOutputFolderRelativePath(entry),
      sessionKey: WORKSPACE_REPO_REFERENCE_SESSION_KEY
    });
    logOutputPathFailure(label, pathState, `Unable to resolve target directory: ${error.message}`);
    logger.log("");
    return { id: label, status: "failed", reason: `output-path-resolution-failed: ${error.message}` };
  }
  const decision = await shouldRewrite(targetDirHandle, pathState);
  logPreviewCheck(decision);

  ui.outputSummary.setWriteFolderActual(getWriteFolderDisplayPath(entry));

  if (!decision.rewrite) {
    logger.log(`SKIP ${label}  (${decision.reason})`);
    if (decision.reason === "existing-preview-without-capture-timeout") {
      logger.log(`Existing ${OUTPUT_NAME} does not contain ${CAPTURE_TIMEOUT_MARKER}; skipping rewrite.`);
    }
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
    const writeResult = await writePreview(targetDirHandle, svgContent, pathState);
    if (!writeResult.ok) {
      logger.log(`FAIL ${label}  (${writeResult.message}; expected full absolute path: ${pathState.fullAbsoluteOutputPathDisplay})`);
      logger.log("");
      return { id: label, status: "failed", reason: writeResult.message };
    }
    logWritePath(label, pathState, writeResult);
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
    const fallback = capture.buildFallbackSvg(`${CAPTURE_TIMEOUT_MARKER}: ${error.message}`);
    try {
      const fallbackWrite = await writePreview(targetDirHandle, fallback, pathState);
      if (!fallbackWrite.ok) {
        const reason = `${error.message}; fallback write failed: ${fallbackWrite.message}`;
        logger.log(`FAIL ${label}  (${reason}; expected full absolute path: ${pathState.fullAbsoluteOutputPathDisplay})`);
        logger.log("");
        return { id: label, status: "failed", reason };
      }
    } catch (writeError) {
      const reason = `${error.message}; fallback write failed: ${writeError.message}`;
      logger.log(`FAIL ${label}  (${reason})`);
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
  return Boolean(repoDirHandle);
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

  async hydrateWorkspaceRepoSession(manifest) {
    const repoReferenceResult = readWorkspaceRepoReference();
    if (!repoReferenceResult.ok) {
      return { ok: false, message: repoReferenceResult.message };
    }
    const workspaceResult = readWorkspacePreviewGeneratorWorkspace(manifest);
    if (!workspaceResult.ok) {
      return { ok: false, message: workspaceResult.message };
    }
    const repoReference = repoReferenceResult.reference;
    if (!repoRootNameMatches(repoReference.displayName, manifest.repoRoot)) {
      return {
        ok: false,
        message: `${WORKSPACE_REPO_REFERENCE_SESSION_KEY}.displayName ${repoReference.displayName} does not match manifest repoRoot ${manifest.repoRoot}.`
      };
    }
    const handleResult = await PreviewGeneratorV2RepoAccess.restoreWorkspaceManagerRepoHandle(repoReference);
    if (!handleResult.ok) {
      return {
        ok: false,
        message: `${handleResult.message} Required action: return to Workspace Manager V2, pick the repo folder, and reopen Preview Generator V2.`
      };
    }

    const repoValidation = await validateRepoRootHandle(handleResult.repoHandle);
    if (!repoValidation.ok) {
      return repoValidation;
    }
    return {
      ok: true,
      handle: handleResult.repoHandle,
      handleSource: handleResult.source,
      repoReference,
      workspace: workspaceResult.workspace
    };
  }

  async handleExecute() {
    if (!this.hasRequiredGenerateFields()) {
      this.syncGeneratePreviewButton();
      logger.log("Provide repo destination, base URL, asset folder, preview target, and at least one path or ID before generating.");
      return;
    }

    if (!hasRepoDestinationContext()) {
      logger.log("Pick the actual repo root folder before writing preview output.");
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
    const repoRoot = selectedRepoRootPathState();

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
    logger.log(`Repo root: ${repoRoot.ok ? repoRoot.repoRootDisplayPath : "unavailable"}`);
    if (!repoRoot.ok) {
      logger.log(`FAIL Repo root path resolution: ${repoRoot.message}`);
    }
    logger.log(`Asset folder: ${getAssetFolderDisplayPath()}`);
    logger.log(`Capture mode: ${ui.getCaptureModeLabel()}`);
    logger.log(`Force rewrite: ${ui.renderControls.isForceRewrite()}`);
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

  async handleCopyLog() {
    const logText = ui.statusLog.getLogText();
    if (!logText.trim()) {
      logger.log("WARN Copy status log skipped: Preview Generator V2 status log is empty.");
      return;
    }
    if (typeof navigator?.clipboard?.writeText !== "function") {
      logger.log("FAIL Copy status log failed: Clipboard API is unavailable.");
      return;
    }
    try {
      await navigator.clipboard.writeText(logText);
      logger.log(`OK Copied Preview Generator V2 status log to clipboard (${logText.length} characters).`);
    } catch (error) {
      logger.log(`FAIL Copy status log failed: ${error.message}`);
    }
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
    workspaceManifestPreviewPath = "";
    workspaceGeneratedPreviewPath = "";
    workspaceRepoRootPath = "";
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

    const previewTarget = workspacePreviewTarget(manifest);
    if (!previewTarget.ok) {
      logger.log(`FAIL Workspace launch context hydration: ${previewTarget.message}`);
      this.syncGeneratePreviewButton();
      return;
    }

    const manifestRepoRoot = String(manifest.repoRoot || "").trim();
    workspaceRepoRootPath = normalizeAbsoluteRepoPath(manifest.repoPath);
    repoDisplayName = manifestRepoRoot;
    repoDirHandle = null;
    workspaceRepoRootName = manifestRepoRoot;
    workspacePreviewAssetFolder = previewTarget.previewAssetFolder;
    workspacePreviewGameId = manifest.gameId;
    workspaceManifestPreviewPath = previewTarget.manifestPreviewPath;
    workspaceGeneratedPreviewPath = previewTarget.generatedPreviewPath;
    workspaceLaunchHydrated = true;
    ui.setRepoDestinationDisplayName(repoDisplayName);
    ui.targetSource.setSelectedTargetType("games");
    ui.targetSource.showWorkspaceGamesOnly();
    ui.targetSource.setBaseUrl(window.location.origin);
    ui.assetFolder.setValue(workspacePreviewAssetFolder);
    ui.pathsOrIds.setValue(manifest.gameId);
    ui.setWorkspaceToolStateControlsLocked(true);
    await updatePathPreviewLabels();
    logger.log(`OK Workspace launch context hydrated for ${manifest.gameId}.`);
    logger.log(`Workspace repoRoot display label available: ${manifestRepoRoot || "(empty)"}.`);
    logger.log("Target source: games");
    logger.log(`Asset folder: ${getAssetFolderDisplayPath()}`);
    if (previewTarget.previewAssetMissing) {
      logger.log(`WARN Workspace manifest preview asset is missing from Asset Manager V2 data; generated preview output will target ${workspaceGeneratedPreviewPath}.`);
    } else {
      logger.log(`Manifest preview asset: ${previewTarget.previewAssetId} (${previewTarget.previewAssetType}/${previewTarget.previewAssetKind})`);
      logger.log(`Manifest preview source: ${workspaceManifestPreviewPath}`);
    }
    logger.log(`Generated preview target: ${workspaceGeneratedPreviewPath}`);
    logger.log(`Preview target: ${getWorkspacePreviewTargetDisplayPath()}`);

    const backgroundContext = workspaceBackgroundContext(manifest);
    if (backgroundContext.ok) {
      if (backgroundContext.backgroundAssetMissing) {
        if (backgroundContext.colorHex) {
          capture.setCaptureBackgroundColor(backgroundContext.colorHex);
          logger.log(`WARN Workspace background image role is missing; using ${backgroundContext.colorAssetId || "manifest palette background color"} ${backgroundContext.colorName} ${backgroundContext.colorHex}.`);
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
          const colorSourceLabel = backgroundContext.colorAssetId
            ? `${backgroundContext.colorAssetId} asset`
            : `${backgroundContext.colorSource || "palette-manager-v2"} swatch`;
          logger.log(`Workspace background color: ${backgroundContext.colorName} ${backgroundContext.colorHex} from ${colorSourceLabel}.`);
        } else {
          logger.log("WARN Workspace background color is not available from a manifest palette background or black swatch; preview generation remains enabled without an explicit workspace background color.");
        }
      }
    } else {
      logger.log(`WARN Workspace background hydration: ${backgroundContext.message}`);
    }

    if (!workspaceManifestPreviewPath) {
      workspacePreviewFileValid = true;
      logger.log(`WARN Workspace manifest preview source is not present; ${OUTPUT_NAME} generation remains enabled for ${workspaceGeneratedPreviewPath}.`);
    } else {
      const previewResult = await validateWorkspaceImagePath(workspaceManifestPreviewPath, "Workspace manifest preview source");
      if (previewResult.ok) {
        workspacePreviewFileValid = true;
        ui.setPreviewTargetImage(workspaceManifestPreviewPath);
        logger.log(`OK Workspace manifest preview source is valid at ${workspaceManifestPreviewPath}.`);
      } else {
        workspacePreviewFileValid = true;
        logger.log(`WARN Workspace preview source validation: ${previewResult.message}; ${OUTPUT_NAME} generation remains enabled.`);
      }
    }

    const repoSessionResult = await this.hydrateWorkspaceRepoSession(manifest);
    if (!repoSessionResult.ok) {
      repoDirHandle = null;
      logger.log(`FAIL Workspace repo session hydration: ${repoSessionResult.message}`);
      logger.log("Preview Generator V2 requires Workspace Manager V2 repo session storage before image generation.");
      this.syncGeneratePreviewButton();
      return;
    }

    repoDirHandle = repoSessionResult.handle;
    repoDisplayName = PreviewGeneratorV2RepoAccess.getRepoDestinationDisplayName(repoDirHandle);
    ui.setRepoDestinationDisplayName(repoDisplayName);
    workspaceLaunchHydrated = true;
    logger.log(`OK Workspace repo session reference loaded from ${WORKSPACE_REPO_REFERENCE_SESSION_KEY} for ${repoDisplayName}.`);
    logger.log(`OK Workspace tool session workspace context loaded from ${WORKSPACE_PREVIEW_GENERATOR_SESSION_KEY}.`);
    logger.log(`Workspace launch repo handle restored from ${repoSessionResult.handleSource} using ${WORKSPACE_REPO_REFERENCE_SESSION_KEY}; independent repo selection is not required.`);
    logger.log("Workspace Manager V2 live repo handle was restored from runtime handle cache; no handle object was read from toolState JSON.");
    await logWorkspaceRepoHandleState(manifest);
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

    ui.statusLog.onCopy(() => {
      void this.handleCopyLog();
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
      ui.setRepoDestinationVisible(false);
      ui.setPickRepoVisible(false);
    }
    updatePathPreviewLabels();
    this.syncGeneratePreviewButton();
    void this.hydrateWorkspaceLaunchContext();
  }
}

export { PreviewGeneratorV2App };
