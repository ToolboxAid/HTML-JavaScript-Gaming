import { deepClone } from '../../../src/shared/utils/jsonUtils.js';
import {
  downloadTextFile,
  readFileText
} from "../../../src/engine/persistence/index.js";
import { createAssetPreviewModel } from "./assetPreviewHelpers.js";
const LAUNCH_GUARD_MESSAGE = "Asset Manager V2 is only available through Workspace Manager with a game manifest and palette.";

function sortedAssets(assets) {
  return Object.fromEntries(Object.entries(assets).sort(([left], [right]) => left.localeCompare(right)));
}

function sortedAssetEntries(assets) {
  return Object.entries(assets).sort(([leftId, leftEntry], [rightId, rightEntry]) => (
    String(leftEntry.type || "").localeCompare(String(rightEntry.type || ""))
    || String(leftEntry.role || "").localeCompare(String(rightEntry.role || ""))
    || leftId.localeCompare(rightId)
  ));
}

export class AssetManagerV2App {
  constructor({
    accordions,
    actionNav,
    assetCatalog,
    assetForm,
    inspector,
    launchGuard,
    schemaValidator,
    shell,
    statusLog,
    windowRef = window,
    workspaceBridge
  }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.assetCatalog = assetCatalog;
    this.assetForm = assetForm;
    this.inspector = inspector;
    this.launchGuard = launchGuard;
    this.schemaValidator = schemaValidator;
    this.shell = shell;
    this.statusLog = statusLog;
    this.window = windowRef;
    this.workspaceBridge = workspaceBridge;
    this.assets = {};
    this.lastWorkspaceManifest = null;
    this.missingFileAssetIds = new Set();
    this.schemaReady = false;
    this.selectedAssetId = "";
    this.redoStack = [];
    this.undoStack = [];
  }

  async start() {
    const launchGuardResult = this.evaluateLaunchGuard();
    if (!launchGuardResult.ok) {
      this.showLaunchGuard(launchGuardResult.reason);
      return;
    }
    this.hideLaunchGuard();
    this.shell.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.statusLog.mount();
    this.actionNav.mount({
      onNavExportJson: () => this.exportJson(),
      onNavImportJson: (file) => {
        void this.importJson(file);
      },
      onReturnToWorkspace: () => this.returnToWorkspace()
    });
    this.assetForm.mount({
      onAdd: (value) => this.addAsset(value),
      onChange: () => this.refreshActions(),
      onColorSelected: (value, colorInfo) => this.validateSelectedColor(value, colorInfo),
      onFileSelected: (value, fileInfo) => this.validateSelectedFile(value, fileInfo),
      onRedo: () => this.redoAssetChange(),
      onStatus: (level, message) => this.writeStatus(level, message),
      onUndo: () => this.undoAssetChange(),
      onUpdate: (value) => this.updateAsset(value)
    });
    this.assetCatalog.mount({
      onDelete: (assetId) => this.deleteAsset(assetId),
      onPreviewStatus: (level, message) => this.writeStatus(level, message),
      onSelect: (assetId) => {
        this.selectedAssetId = assetId;
        const entry = this.assets[assetId];
        if (entry) {
          this.assetForm.loadAssetForEdit(assetId, entry);
        }
        this.render();
        this.refreshActions();
      }
    });
    this.assetCatalog.setPreviewOptions(this.previewOptions());

    this.render();
    await this.loadSchema();
  }

  evaluateLaunchGuard() {
    const params = new URLSearchParams(this.window.location.search || "");
    if (params.has("workspace")) {
      return { ok: false, reason: "Temporary workspace query launches are no longer supported; launch through Workspace Manager V2." };
    }

    if (!this.workspaceBridge.isWorkspaceMode()) {
      return { ok: false, reason: "Launch context is missing." };
    }

    const assetPayloadResult = this.workspaceBridge.readWorkspaceAssetPayload();
    if (!assetPayloadResult.ok) {
      return { ok: false, reason: assetPayloadResult.message };
    }

    const previewContext = this.workspaceBridge.readWorkspacePreviewContext();
    if (!previewContext.workspaceGameId || !previewContext.workspaceGameRoot || !previewContext.workspaceAssetsPath) {
      return { ok: false, reason: "Workspace Manager V2 gameRoot or assetsPath context is missing." };
    }

    const paletteResult = this.workspaceBridge.readWorkspacePaletteSwatches();
    if (!paletteResult.ok) {
      return { ok: false, reason: paletteResult.message };
    }
    if (!paletteResult.swatches.length) {
      return { ok: false, reason: "No active palette is present." };
    }

    return { ok: true };
  }

  showLaunchGuard(reason) {
    const message = this.launchGuard.querySelector("#assetLaunchGuardMessage");
    const reasonNode = this.launchGuard.querySelector("#assetLaunchGuardReason");
    if (message) {
      message.textContent = LAUNCH_GUARD_MESSAGE;
    }
    if (reasonNode) {
      reasonNode.textContent = reason ? `Reason: ${reason}` : "";
    }
    const returnToToolsButton = this.launchGuard.querySelector("#assetLaunchGuardReturnToToolsButton");
    if (returnToToolsButton && !returnToToolsButton.dataset.assetManagerV2Bound) {
      returnToToolsButton.dataset.assetManagerV2Bound = "true";
      returnToToolsButton.addEventListener("click", () => {
        this.window.location.href = new URL("../index.html", this.window.location.href).href;
      });
    }
    this.launchGuard.hidden = false;
    this.window.document.body.classList.add("asset-manager-v2--launch-blocked");
  }

  hideLaunchGuard() {
    this.launchGuard.hidden = true;
    this.window.document.body.classList.remove("asset-manager-v2--launch-blocked");
  }

  async loadSchema() {
    const result = await this.schemaValidator.load();
    if (!result.ok) {
      this.statusLog.fail(result.message);
      this.refreshActions();
      return;
    }

    this.schemaReady = true;
    this.assetForm.setKinds(this.schemaValidator.allowedTypes);
    this.statusLog.info(`Loaded asset-manager-v2.schema.json. Types: ${this.schemaValidator.allowedTypes.join(", ")}. Kinds: ${this.schemaValidator.allowedKinds.join(", ")}. Roles: ${this.schemaValidator.allowedRoles.join(", ")}.`);
    this.loadPaletteIfPresent();
    await this.loadWorkspaceAssetsIfPresent();
    this.render();
    this.refreshActions();
  }

  async loadWorkspaceAssetsIfPresent() {
    if (!this.workspaceBridge.isWorkspaceMode()) {
      return;
    }
    const result = this.workspaceBridge.readWorkspaceAssetPayload();
    if (!result.ok) {
      this.statusLog.fail(result.message);
      return;
    }
    const validation = this.schemaValidator.validatePayload(result.payload);
    if (!validation.ok) {
      this.statusLog.fail(`Workspace assets failed schema validation: ${validation.errors.join(" | ")}`);
      return;
    }
    this.assets = sortedAssets(validation.payload.assets);
    this.selectedAssetId = Object.keys(this.assets)[0] || "";
    this.undoStack = [];
    this.redoStack = [];
    this.statusLog.ok(`Workspace Manager V2 loaded ${Object.keys(this.assets).length} validated assets from tools.asset-manager-v2.assets.`);
    this.missingFileAssetIds = await this.logMissingReferencedFiles(this.assets);
  }

  loadPaletteIfPresent() {
    if (!this.workspaceBridge.isWorkspaceMode()) {
      this.assetForm.setPaletteSwatches([]);
      return;
    }
    const result = this.workspaceBridge.readWorkspacePaletteSwatches();
    if (!result.ok) {
      this.assetForm.setPaletteSwatches([]);
      this.statusLog.fail(result.message);
      return;
    }
    this.assetForm.setPaletteSwatches(result.swatches);
    this.statusLog.ok(`Workspace Manager V2 loaded ${result.swatches.length} palette colors from active palette context.`);
  }

  previewOptions() {
    const workspacePreviewContext = this.workspaceBridge.readWorkspacePreviewContext();
    return {
      documentRef: this.window.document,
      ...workspacePreviewContext
    };
  }

  currentPayload() {
    return {
      assets: sortedAssets(this.assets)
    };
  }

  currentOutputAssets() {
    return sortedAssetEntries(this.assets).map(([id, entry]) => ({
      id,
      type: entry.type,
      kind: entry.kind,
      role: entry.role,
      path: entry.path,
      ...(entry.color ? { color: entry.color } : {}),
      ...(entry.stretchOverride ? { stretchOverride: entry.stretchOverride } : {})
    }));
  }

  currentOutputSummary() {
    return {
      assets: this.currentOutputAssets(),
      count: Object.keys(this.assets).length
    };
  }

  addAsset(formValue) {
    if (!this.schemaReady) {
      this.statusLog.fail("Schema is not loaded; asset edits are blocked.");
      return;
    }
    if (Object.prototype.hasOwnProperty.call(this.assets, formValue.assetId)) {
      const message = `Duplicate id: ${formValue.assetId}`;
      this.statusLog.fail(message);
      return;
    }

    const entryResult = this.schemaValidator.createEntry(formValue);
    if (!entryResult.ok) {
      this.statusLog.fail(`Schema validation failed: ${entryResult.errors.join(" | ")}`);
      return;
    }

    const nextAssets = sortedAssets({
      ...this.assets,
      [formValue.assetId]: entryResult.entry
    });
    const payloadValidation = this.schemaValidator.validatePayload({ assets: nextAssets });
    if (!payloadValidation.ok) {
      this.statusLog.fail(`Schema validation failed: ${payloadValidation.errors.join(" | ")}`);
      return;
    }

    this.recordHistory();
    this.assets = payloadValidation.payload.assets;
    this.missingFileAssetIds.delete(formValue.assetId);
    this.selectedAssetId = formValue.assetId;
    this.assetForm.clearEditableFields();
    this.statusLog.ok(`Added ${formValue.assetId}.`);
    this.syncWorkspaceSessionManifest({
      changedKeys: [
        "data.assets",
        `data.assets["${formValue.assetId}"]`
      ]
    });
    this.render();
    this.refreshActions();
  }

  updateAsset(formValue) {
    if (!this.schemaReady) {
      this.statusLog.fail("Schema is not loaded; asset edits are blocked.");
      return;
    }
    if (!this.selectedAssetId || !Object.prototype.hasOwnProperty.call(this.assets, this.selectedAssetId)) {
      this.statusLog.fail("Select an asset before updating.");
      return;
    }
    if (formValue.assetId !== this.selectedAssetId && Object.prototype.hasOwnProperty.call(this.assets, formValue.assetId)) {
      const message = `Duplicate id: ${formValue.assetId}`;
      this.statusLog.fail(message);
      return;
    }

    const entryResult = this.schemaValidator.createEntry(formValue);
    if (!entryResult.ok) {
      this.statusLog.fail(`Schema validation failed: ${entryResult.errors.join(" | ")}`);
      return;
    }

    const nextAssets = { ...this.assets };
    delete nextAssets[this.selectedAssetId];
    nextAssets[formValue.assetId] = entryResult.entry;
    const payloadValidation = this.schemaValidator.validatePayload({ assets: sortedAssets(nextAssets) });
    if (!payloadValidation.ok) {
      this.statusLog.fail(`Schema validation failed: ${payloadValidation.errors.join(" | ")}`);
      return;
    }

    this.recordHistory();
    this.assets = payloadValidation.payload.assets;
    this.missingFileAssetIds.delete(this.selectedAssetId);
    this.missingFileAssetIds.delete(formValue.assetId);
    this.selectedAssetId = formValue.assetId;
    this.assetForm.loadAssetForEdit(formValue.assetId, entryResult.entry);
    this.statusLog.ok(`Updated ${formValue.assetId}.`);
    this.syncWorkspaceSessionManifest({
      changedKeys: [
        "data.assets",
        `data.assets["${this.selectedAssetId}"]`
      ]
    });
    this.render();
    this.refreshActions();
  }

  deleteAsset(assetId) {
    if (!Object.prototype.hasOwnProperty.call(this.assets, assetId)) {
      return;
    }
    const nextAssets = { ...this.assets };
    delete nextAssets[assetId];
    const validation = this.schemaValidator.validatePayload({ assets: nextAssets });
    if (!validation.ok) {
      this.statusLog.fail(`Delete blocked by schema validation: ${validation.errors.join(" | ")}`);
      return;
    }
    this.recordHistory();
    this.assets = sortedAssets(validation.payload.assets);
    this.missingFileAssetIds.delete(assetId);
    this.selectedAssetId = Object.keys(this.assets)[0] || "";
    if (this.selectedAssetId) {
      this.assetForm.loadAssetForEdit(this.selectedAssetId, this.assets[this.selectedAssetId]);
    } else {
      this.assetForm.clearEditableFields();
    }
    this.statusLog.ok(`Deleted ${assetId}.`);
    this.syncWorkspaceSessionManifest({
      changedKeys: [
        "data.assets",
        `data.assets["${assetId}"]`
      ]
    });
    this.render();
    this.refreshActions();
  }

  captureState() {
    return {
      assets: deepClone(this.assets),
      missingFileAssetIds: [...this.missingFileAssetIds],
      selectedAssetId: this.selectedAssetId
    };
  }

  recordHistory() {
    this.undoStack.push(this.captureState());
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  restoreState(snapshot) {
    this.assets = sortedAssets(snapshot.assets || {});
    this.missingFileAssetIds = new Set(snapshot.missingFileAssetIds || []);
    this.selectedAssetId = Object.prototype.hasOwnProperty.call(this.assets, snapshot.selectedAssetId)
      ? snapshot.selectedAssetId
      : Object.keys(this.assets)[0] || "";
    if (this.selectedAssetId) {
      this.assetForm.loadAssetForEdit(this.selectedAssetId, this.assets[this.selectedAssetId]);
    } else {
      this.assetForm.clearEditableFields();
    }
    this.syncWorkspaceSessionManifest({ changedKeys: ["data.assets"] });
    this.render();
    this.refreshActions();
  }

  undoAssetChange() {
    const previous = this.undoStack.pop();
    if (!previous) {
      this.statusLog.info("Undo unavailable.");
      this.refreshActions();
      return;
    }
    this.redoStack.push(this.captureState());
    this.restoreState(previous);
    this.statusLog.ok("Undo restored asset state.");
  }

  redoAssetChange() {
    const next = this.redoStack.pop();
    if (!next) {
      this.statusLog.info("Redo unavailable.");
      this.refreshActions();
      return;
    }
    this.undoStack.push(this.captureState());
    this.restoreState(next);
    this.statusLog.ok("Redo restored asset state.");
  }

  validateSelectedFile(formValue, fileInfo) {
    if (!fileInfo) {
      return;
    }
    if (!this.schemaReady) {
      this.statusLog.fail("Schema is not loaded; selected file validation is blocked.");
      return;
    }
    if (!fileInfo.type) {
      const message = `File ${fileInfo.name} is not a recognized asset type.`;
      this.statusLog.fail(`Selected file validation failed: ${message}`);
      this.refreshActions();
      return;
    }
    if (fileInfo.type && !formValue.role) {
      this.statusLog.info(`Select a role for type ${formValue.type}.`);
      this.refreshActions();
      return;
    }
    const fileValidation = this.schemaValidator.validateFileSelection(formValue, fileInfo);
    if (!fileValidation.ok) {
      this.statusLog.fail(`Selected file validation failed: ${fileValidation.errors.join(" | ")}`);
      return;
    }
    const payloadValidation = this.schemaValidator.validatePayload({
      assets: {
        [formValue.assetId]: fileValidation.entry
      }
    });
    if (!payloadValidation.ok) {
      this.statusLog.fail(`Selected file validation failed: ${payloadValidation.errors.join(" | ")}`);
      return;
    }
    this.statusLog.ok(`Selected file ${fileInfo.name} validated as type ${formValue.type}, kind ${formValue.kind}, role ${formValue.role}.`);
  }

  validateSelectedColor(formValue, colorInfo) {
    if (!this.schemaReady) {
      this.statusLog.fail("Schema is not loaded; selected color validation is blocked.");
      return;
    }
    const colorValidation = this.schemaValidator.validateColorSelection(formValue, colorInfo);
    if (!colorValidation.ok) {
      this.statusLog.fail(`Selected color validation failed: ${colorValidation.errors.join(" | ")}`);
      this.refreshActions();
      return;
    }
    const payloadValidation = this.schemaValidator.validatePayload({
      assets: {
        [formValue.assetId]: colorValidation.entry
      }
    });
    if (!payloadValidation.ok) {
      this.statusLog.fail(`Selected color validation failed: ${payloadValidation.errors.join(" | ")}`);
      this.refreshActions();
      return;
    }
    this.statusLog.ok(`Selected color ${colorInfo.name} validated as type color, kind hex, role ${formValue.role}.`);
  }

  writeStatus(level, message) {
    if (level === "fail") {
      this.statusLog.fail(message);
      return;
    }
    if (level === "ok") {
      this.statusLog.ok(message);
      return;
    }
    this.statusLog.info(message);
  }

  async importJson(file) {
    if (!this.schemaReady) {
      this.statusLog.fail("Schema is not loaded; JSON import is blocked.");
      return;
    }
    if (!file) {
      this.statusLog.fail("Import JSON failed: no JSON file was selected.");
      return;
    }
    try {
      const payload = JSON.parse(await readFileText(file));
      const validation = this.schemaValidator.validatePayload(payload);
      if (!validation.ok) {
        this.statusLog.fail(`Import JSON failed schema validation: ${validation.errors.join(" | ")}`);
        return;
      }
      this.recordHistory();
      this.assets = sortedAssets(validation.payload.assets);
      this.selectedAssetId = Object.keys(this.assets)[0] || "";
      if (this.selectedAssetId) {
        this.assetForm.loadAssetForEdit(this.selectedAssetId, this.assets[this.selectedAssetId]);
      } else {
        this.assetForm.clearEditableFields();
      }
      this.redoStack = [];
      this.statusLog.ok(`Imported JSON with ${Object.keys(this.assets).length} validated assets.`);
      this.missingFileAssetIds = await this.logMissingReferencedFiles(this.assets);
      this.syncWorkspaceSessionManifest({ changedKeys: ["data.assets"] });
      this.render();
      this.refreshActions();
    } catch (error) {
      this.statusLog.fail(`Import JSON failed: ${error.message}`);
    }
  }

  exportJson() {
    const validation = this.validateCurrentPayload({ showInspector: false });
    if (!validation.ok) {
      return;
    }
    const json = JSON.stringify(validation.payload, null, 2);
    const downloaded = downloadTextFile(json, "asset-manager-v2-assets.json", {
      appendToBody: true,
      documentRef: this.window.document,
      windowRef: this.window
    });
    if (!downloaded) {
      this.statusLog.fail("Export JSON failed: browser download APIs are unavailable.");
      return;
    }
    this.statusLog.ok(`Exported JSON with ${Object.keys(validation.payload.assets).length} validated assets.`);
  }

  async copyWorkspaceManifest() {
    if (!this.lastWorkspaceManifest) {
      this.statusLog.fail("No Workspace Manager V2 manifest has been inserted in this session.");
      return;
    }
    await this.copyText(JSON.stringify(this.lastWorkspaceManifest, null, 2), "Workspace Manager V2 manifest JSON copied.");
  }

  async copyText(value, successMessage) {
    this.inspector.showObject(JSON.parse(value));
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      this.statusLog.info(`${successMessage} Clipboard API is unavailable, so the JSON is visible in Output Summary.`);
      return;
    }

    try {
      await this.window.navigator.clipboard.writeText(value);
      this.statusLog.ok(successMessage);
    } catch (error) {
      this.statusLog.fail(`Copy failed: ${error.message}`);
    }
  }

  returnToWorkspace() {
    const syncResult = this.syncWorkspaceSessionManifest({ quiet: true });
    if (!syncResult.ok) {
      return;
    }
    this.workspaceBridge.returnToWorkspace();
  }

  syncWorkspaceSessionManifest({ changedKeys = ["data.assets"], quiet = false } = {}) {
    if (!this.workspaceBridge.isWorkspaceMode()) {
      return { ok: true, skipped: true };
    }
    const validation = this.validateCurrentPayload({ showInspector: false });
    if (!validation.ok) {
      return validation;
    }
    const result = this.workspaceBridge.writeAssetsPayload(validation.payload, changedKeys);
    if (!result.ok) {
      this.statusLog.fail(`Workspace tool session update failed: ${result.message}`);
      return result;
    }
    this.lastWorkspaceManifest = result.workspaceManifest;
    if (!quiet) {
      this.statusLog.ok(`workspace.tools.asset-manager-v2 now has ${Object.keys(validation.payload.assets).length} validated assets.`);
    }
    return result;
  }

  insertAssetsIntoWorkspace() {
    const validation = this.validateCurrentPayload();
    if (!validation.ok) {
      return;
    }
    const result = this.workspaceBridge.writeAssetsPayload(validation.payload);
    if (!result.ok) {
      this.statusLog.fail(result.message);
      return;
    }
    this.lastWorkspaceManifest = result.workspaceManifest;
    this.inspector.showObject(result.workspaceManifest);
    this.statusLog.ok(`Inserted ${Object.keys(validation.payload.assets).length} validated assets into Workspace Manager V2 tools.asset-manager-v2.assets.`);
    this.refreshActions();
  }

  validateCurrentPayload({ showInspector = true } = {}) {
    if (!this.schemaReady) {
      const message = "Schema is not loaded; export is blocked.";
      this.statusLog.fail(message);
      return { ok: false, errors: [message] };
    }
    const validation = this.schemaValidator.validatePayload(this.currentPayload());
    if (!validation.ok) {
      this.statusLog.fail(`Schema validation failed: ${validation.errors.join(" | ")}`);
      if (showInspector) {
        this.inspector.showObject({ ok: false, errors: validation.errors });
      }
      return validation;
    }
    return validation;
  }

  async logMissingReferencedFiles(assets) {
    const missingFileAssetIds = new Set();
    const fetchRef = this.window.fetch?.bind(this.window);
    if (typeof fetchRef !== "function") {
      return missingFileAssetIds;
    }
    for (const [assetId, entry] of sortedAssetEntries(assets)) {
      const path = String(entry?.path || "").trim();
      if (!path || entry?.type === "color" || /^[a-z][a-z0-9+.-]*:/i.test(path)) {
        continue;
      }
      const previewModel = createAssetPreviewModel(assetId, entry, this.previewOptions());
      if (previewModel.previewError || !previewModel.url) {
        missingFileAssetIds.add(assetId);
        this.statusLog.info(`File availability warning: Missing referenced file for ${assetId}: ${path}.`);
        continue;
      }
      try {
        const response = await fetchRef(previewModel.url, { cache: "no-store", method: "HEAD" });
        if (!response.ok) {
          missingFileAssetIds.add(assetId);
          this.statusLog.info(`File availability warning: Missing referenced file for ${assetId}: ${path}.`);
        }
      } catch {
        missingFileAssetIds.add(assetId);
        this.statusLog.info(`File availability warning: Missing referenced file for ${assetId}: ${path}.`);
      }
    }
    return missingFileAssetIds;
  }

  render() {
    this.assetCatalog.setPreviewOptions(this.previewOptions());
    this.assetCatalog.render(this.currentPayload().assets, this.selectedAssetId, this.missingFileAssetIds);
    this.inspector.showObject(this.currentOutputSummary());
  }

  refreshActions() {
    const payloadValidation = this.schemaReady
      ? this.schemaValidator.validatePayload(this.currentPayload())
      : { ok: false };
    const formValue = this.assetForm.readValue();
    const canAdd = this.schemaReady
      && this.assetForm.isComplete()
      && !Object.prototype.hasOwnProperty.call(this.assets, formValue.assetId);
    const canUpdate = this.schemaReady
      && this.assetForm.isComplete()
      && Boolean(this.selectedAssetId)
      && Object.prototype.hasOwnProperty.call(this.assets, this.selectedAssetId);
    this.assetForm.setAddEnabled(canAdd);
    this.assetForm.setUpdateEnabled(canUpdate);
    this.assetForm.setHistoryEnabled({
      canRedo: this.redoStack.length > 0,
      canUndo: this.undoStack.length > 0
    });
    this.actionNav.setToolActionsEnabled(this.schemaReady && payloadValidation.ok);
    this.actionNav.setWorkspaceActionsEnabled(this.workspaceBridge.isWorkspaceMode());
  }
}
