import { readTemporaryUatSamplePalette } from "./services/TemporaryUatSamplePalette.js";
import { createAssetPreviewModel } from "./assetPreviewHelpers.js";

const ASSET_MANAGER_TOOL_ID = "asset-manager-v2";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

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
    this.schemaValidator = schemaValidator;
    this.shell = shell;
    this.statusLog = statusLog;
    this.window = windowRef;
    this.workspaceBridge = workspaceBridge;
    this.assets = {};
    this.lastWorkspaceManifest = null;
    this.schemaReady = false;
    this.selectedAssetId = "";
    this.redoStack = [];
    this.temporaryUatGameRoot = "";
    this.undoStack = [];
  }

  async start() {
    this.shell.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.statusLog.mount();
    this.actionNav.mount({
      onNavExportJson: () => this.exportJson(),
      onNavImportJson: (file) => {
        void this.importJson(file);
      },
      onWorkspaceCopyManifest: () => {
        void this.copyWorkspaceManifest();
      },
      onWorkspaceInsertAssets: () => this.insertAssetsIntoWorkspace()
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

  async loadSchema() {
    const result = await this.schemaValidator.load();
    if (!result.ok) {
      this.statusLog.fail(result.message);
      this.refreshActions();
      return;
    }

    this.schemaReady = true;
    this.assetForm.setKinds(this.schemaValidator.allowedTypes);
    this.statusLog.info(`Loaded asset-browser.schema.json. Types: ${this.schemaValidator.allowedTypes.join(", ")}. Kinds: ${this.schemaValidator.allowedKinds.join(", ")}. Roles: ${this.schemaValidator.allowedRoles.join(", ")}.`);
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
    this.statusLog.ok(`Workspace mode loaded ${Object.keys(this.assets).length} validated assets from tools.asset-browser.assets.`);
    await this.logMissingReferencedFiles(this.assets);
  }

  loadPaletteIfPresent() {
    const samplePalette = readTemporaryUatSamplePalette(this.window.location);
    if (samplePalette.ok) {
      this.assetForm.setPaletteSwatches(samplePalette.palette.swatches);
      this.temporaryUatGameRoot = samplePalette.gameRoot || "";
      this.statusLog.ok(`Loaded temporary UAT-only sample palette from ?palette=sample (${samplePalette.palette.swatches.length} colors).`);
      this.statusLog.ok(`Temporary UAT-only Asset Manager V2 game root set to ${this.temporaryUatGameRoot} for preview/path testing.`);
      return;
    }
    this.temporaryUatGameRoot = "";
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
    this.statusLog.ok(`Workspace mode loaded ${result.swatches.length} palette colors from tools.palette-browser.swatches.`);
  }

  previewOptions() {
    const workspacePreviewContext = this.workspaceBridge.readWorkspacePreviewContext();
    return {
      documentRef: this.window.document,
      ...workspacePreviewContext,
      ...(this.temporaryUatGameRoot
        ? {
          workspaceMode: true,
          workspaceGameRoot: this.temporaryUatGameRoot
        }
        : {})
    };
  }

  currentPayload() {
    return {
      assets: sortedAssets(this.assets)
    };
  }

  currentToolState() {
    return {
      version: "v2",
      toolId: ASSET_MANAGER_TOOL_ID,
      assets: this.currentOutputAssets(),
      payloadJson: this.currentPayload()
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
    this.selectedAssetId = formValue.assetId;
    this.assetForm.clearEditableFields();
    this.statusLog.ok(`Added ${formValue.assetId}.`);
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
    this.selectedAssetId = formValue.assetId;
    this.assetForm.loadAssetForEdit(formValue.assetId, entryResult.entry);
    this.statusLog.ok(`Updated ${formValue.assetId}.`);
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
    this.selectedAssetId = Object.keys(this.assets)[0] || "";
    if (this.selectedAssetId) {
      this.assetForm.loadAssetForEdit(this.selectedAssetId, this.assets[this.selectedAssetId]);
    } else {
      this.assetForm.clearEditableFields();
    }
    this.statusLog.ok(`Deleted ${assetId}.`);
    this.render();
    this.refreshActions();
  }

  captureState() {
    return {
      assets: clone(this.assets),
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
    this.selectedAssetId = Object.prototype.hasOwnProperty.call(this.assets, snapshot.selectedAssetId)
      ? snapshot.selectedAssetId
      : Object.keys(this.assets)[0] || "";
    if (this.selectedAssetId) {
      this.assetForm.loadAssetForEdit(this.selectedAssetId, this.assets[this.selectedAssetId]);
    } else {
      this.assetForm.clearEditableFields();
    }
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

  exportAssets() {
    const validation = this.validateCurrentPayload();
    if (!validation.ok) {
      return;
    }
    this.inspector.showObject(validation.payload);
    this.statusLog.ok("Asset payload preview written to Output Summary.");
  }

  exportToolState() {
    const validation = this.validateCurrentPayload();
    if (!validation.ok) {
      return;
    }
    const toolState = this.currentToolState();
    this.inspector.showObject(toolState);
    this.statusLog.ok("toolState preview written to Output Summary.");
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
      const payload = JSON.parse(await file.text());
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
      await this.logMissingReferencedFiles(this.assets);
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
    const BlobCtor = this.window.Blob;
    const urlApi = this.window.URL || this.window.webkitURL;
    if (typeof BlobCtor !== "function" || !urlApi?.createObjectURL) {
      this.statusLog.fail("Export JSON failed: browser download APIs are unavailable.");
      return;
    }
    const blob = new BlobCtor([json], { type: "application/json" });
    const url = urlApi.createObjectURL(blob);
    const link = this.window.document.createElement("a");
    link.href = url;
    link.download = "asset-manager-v2-assets.json";
    link.rel = "noopener";
    this.window.document.body.append(link);
    link.click();
    link.remove();
    urlApi.revokeObjectURL(url);
    this.statusLog.ok(`Exported JSON with ${Object.keys(validation.payload.assets).length} validated assets.`);
  }

  async copyAssetsJson() {
    const validation = this.validateCurrentPayload();
    if (!validation.ok) {
      return;
    }
    await this.copyText(JSON.stringify(validation.payload, null, 2), "Asset payload JSON copied.");
  }

  async copyWorkspaceManifest() {
    if (!this.lastWorkspaceManifest) {
      this.statusLog.fail("No Workspace V2 manifest has been inserted in this session.");
      return;
    }
    await this.copyText(JSON.stringify(this.lastWorkspaceManifest, null, 2), "Workspace V2 manifest JSON copied.");
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
    this.statusLog.ok(`Inserted ${Object.keys(validation.payload.assets).length} validated assets into Workspace V2 tools.asset-browser.assets.`);
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
    const fetchRef = this.window.fetch?.bind(this.window);
    if (typeof fetchRef !== "function") {
      return;
    }
    for (const [assetId, entry] of sortedAssetEntries(assets)) {
      const path = String(entry?.path || "").trim();
      if (!path || entry?.type === "color" || /^[a-z][a-z0-9+.-]*:/i.test(path)) {
        continue;
      }
      const previewModel = createAssetPreviewModel(assetId, entry, this.previewOptions());
      if (previewModel.previewError || !previewModel.url) {
        this.statusLog.info(`File availability warning: Missing referenced file for ${assetId}: ${path}.`);
        continue;
      }
      try {
        const response = await fetchRef(previewModel.url, { cache: "no-store", method: "HEAD" });
        if (!response.ok) {
          this.statusLog.info(`File availability warning: Missing referenced file for ${assetId}: ${path}.`);
        }
      } catch {
        this.statusLog.info(`File availability warning: Missing referenced file for ${assetId}: ${path}.`);
      }
    }
  }

  render() {
    this.assetCatalog.setPreviewOptions(this.previewOptions());
    this.assetCatalog.render(this.currentPayload().assets, this.selectedAssetId);
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
    this.actionNav.setWorkspaceActionsEnabled(this.schemaReady && payloadValidation.ok, Boolean(this.lastWorkspaceManifest));
  }
}
