const ASSET_MANAGER_TOOL_ID = "asset-manager-v2";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sortedAssets(assets) {
  return Object.fromEntries(Object.entries(assets).sort(([left], [right]) => left.localeCompare(right)));
}

export class AssetManagerV2App {
  constructor({
    accordions,
    actionNav,
    assetCatalog,
    assetForm,
    inspector,
    jsonInput,
    loadJsonButton,
    schemaValidator,
    shell,
    statusLog,
    validateJsonButton,
    windowRef = window,
    workspaceBridge
  }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.assetCatalog = assetCatalog;
    this.assetForm = assetForm;
    this.inspector = inspector;
    this.jsonInput = jsonInput;
    this.loadJsonButton = loadJsonButton;
    this.schemaValidator = schemaValidator;
    this.shell = shell;
    this.statusLog = statusLog;
    this.validateJsonButton = validateJsonButton;
    this.window = windowRef;
    this.workspaceBridge = workspaceBridge;
    this.assets = {};
    this.lastWorkspaceManifest = null;
    this.schemaReady = false;
    this.selectedAssetId = "";
  }

  async start() {
    this.shell.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.statusLog.mount();
    this.actionNav.mount({
      onToolCopyJson: () => {
        void this.copyAssetsJson();
      },
      onToolExport: () => this.exportAssets(),
      onToolExportToolState: () => this.exportToolState(),
      onWorkspaceCopyManifest: () => {
        void this.copyWorkspaceManifest();
      },
      onWorkspaceInsertAssets: () => this.insertAssetsIntoWorkspace()
    });
    this.assetForm.mount({
      onAdd: (value) => this.addAsset(value),
      onChange: () => this.refreshActions(),
      onFileSelected: (value, fileInfo) => this.validateSelectedFile(value, fileInfo)
    });
    this.assetCatalog.mount({
      onSelect: (assetId) => {
        this.selectedAssetId = assetId;
        this.render();
      }
    });
    this.validateJsonButton.addEventListener("click", () => this.validateJsonInput(false));
    this.loadJsonButton.addEventListener("click", () => this.validateJsonInput(true));

    this.render();
    await this.loadSchema();
  }

  async loadSchema() {
    const result = await this.schemaValidator.load();
    if (!result.ok) {
      this.statusLog.fail(result.message);
      this.assetForm.showMessage(result.message, "error");
      this.refreshActions();
      return;
    }

    this.schemaReady = true;
    this.assetForm.setApprovedKinds(this.schemaValidator.allowedKinds);
    this.statusLog.info(`Loaded asset-browser.schema.json. Approved kinds: ${this.schemaValidator.allowedKinds.join(", ")}. Approved roles: ${this.schemaValidator.allowedRoles.join(", ")}.`);
    this.loadWorkspaceAssetsIfPresent();
    this.render();
    this.refreshActions();
  }

  loadWorkspaceAssetsIfPresent() {
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
    this.statusLog.ok(`Workspace mode loaded ${Object.keys(this.assets).length} validated assets from tools.asset-browser.assets.`);
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
      payloadJson: this.currentPayload()
    };
  }

  addAsset(formValue) {
    if (!this.schemaReady) {
      this.statusLog.fail("Schema is not loaded; asset edits are blocked.");
      return;
    }
    if (Object.prototype.hasOwnProperty.call(this.assets, formValue.assetId)) {
      const message = `Duplicate asset id: ${formValue.assetId}`;
      this.statusLog.fail(message);
      this.assetForm.showMessage(message, "error");
      return;
    }

    const entryResult = this.schemaValidator.createEntry(formValue);
    if (!entryResult.ok) {
      this.statusLog.fail(`Schema validation failed: ${entryResult.errors.join(" | ")}`);
      this.assetForm.showMessage(entryResult.errors[0], "error");
      return;
    }

    const nextAssets = sortedAssets({
      ...this.assets,
      [formValue.assetId]: entryResult.entry
    });
    const payloadValidation = this.schemaValidator.validatePayload({ assets: nextAssets });
    if (!payloadValidation.ok) {
      this.statusLog.fail(`Schema validation failed: ${payloadValidation.errors.join(" | ")}`);
      this.assetForm.showMessage(payloadValidation.errors[0], "error");
      return;
    }

    this.assets = payloadValidation.payload.assets;
    this.selectedAssetId = formValue.assetId;
    this.assetForm.clearEditableFields();
    this.assetForm.showMessage(`Added ${formValue.assetId}.`, "ok");
    this.statusLog.ok(`Added ${formValue.assetId}.`);
    this.render();
    this.refreshActions();
  }

  validateSelectedFile(formValue, fileInfo) {
    if (!fileInfo) {
      return;
    }
    if (!this.schemaReady) {
      this.statusLog.fail("Schema is not loaded; selected file validation is blocked.");
      return;
    }
    const fileValidation = this.schemaValidator.validateFileSelection(formValue, fileInfo);
    if (!fileValidation.ok) {
      this.statusLog.fail(`Selected file validation failed: ${fileValidation.errors.join(" | ")}`);
      this.assetForm.showMessage(fileValidation.errors[0], "error");
      return;
    }
    const payloadValidation = this.schemaValidator.validatePayload({
      assets: {
        [formValue.assetId]: fileValidation.entry
      }
    });
    if (!payloadValidation.ok) {
      this.statusLog.fail(`Selected file validation failed: ${payloadValidation.errors.join(" | ")}`);
      this.assetForm.showMessage(payloadValidation.errors[0], "error");
      return;
    }
    this.assetForm.showMessage(`Selected file validated as ${formValue.kind} ${formValue.role}.`, "ok");
    this.statusLog.ok(`Selected file ${fileInfo.name} validated as ${formValue.kind} ${formValue.role}.`);
  }

  validateJsonInput(loadPayload) {
    if (!this.schemaReady) {
      this.statusLog.fail("Schema is not loaded; JSON validation is blocked.");
      return;
    }
    const rawValue = this.jsonInput.value.trim();
    if (!rawValue) {
      this.statusLog.fail("JSON validation requires an asset payload.");
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(rawValue);
    } catch (error) {
      this.statusLog.fail(`Schema validation failed: JSON parse error: ${error.message}`);
      return;
    }

    const validation = this.schemaValidator.validatePayload(parsed);
    if (!validation.ok) {
      this.statusLog.fail(`Schema validation failed: ${validation.errors.join(" | ")}`);
      this.inspector.showObject({ ok: false, errors: validation.errors });
      return;
    }

    this.inspector.showObject(validation.payload);
    this.statusLog.ok(`Schema validation passed for ${Object.keys(validation.payload.assets).length} assets.`);
    if (loadPayload) {
      this.assets = sortedAssets(validation.payload.assets);
      this.selectedAssetId = Object.keys(this.assets)[0] || "";
      this.statusLog.ok("Loaded validated asset payload.");
      this.render();
      this.refreshActions();
    }
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

  validateCurrentPayload() {
    if (!this.schemaReady) {
      const message = "Schema is not loaded; export is blocked.";
      this.statusLog.fail(message);
      return { ok: false, errors: [message] };
    }
    const validation = this.schemaValidator.validatePayload(this.currentPayload());
    if (!validation.ok) {
      this.statusLog.fail(`Schema validation failed: ${validation.errors.join(" | ")}`);
      this.inspector.showObject({ ok: false, errors: validation.errors });
      return validation;
    }
    return validation;
  }

  render() {
    const payload = this.currentPayload();
    this.assetCatalog.render(payload.assets, this.selectedAssetId);
    this.inspector.showObject(this.currentToolState());
    this.jsonInput.value = JSON.stringify(payload, null, 2);
  }

  refreshActions() {
    const payloadValidation = this.schemaReady
      ? this.schemaValidator.validatePayload(this.currentPayload())
      : { ok: false };
    this.assetForm.setAddEnabled(this.schemaReady && this.assetForm.isComplete());
    this.validateJsonButton.disabled = !this.schemaReady;
    this.loadJsonButton.disabled = !this.schemaReady;
    this.actionNav.setToolActionsEnabled(this.schemaReady && payloadValidation.ok);
    this.actionNav.setWorkspaceActionsEnabled(this.schemaReady && payloadValidation.ok, Boolean(this.lastWorkspaceManifest));
  }
}
