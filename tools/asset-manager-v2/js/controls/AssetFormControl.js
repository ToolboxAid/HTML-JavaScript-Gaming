import {
  acceptForKind,
  assetIdForFile,
  fileMatchesAccept,
  kindForFile,
  labelForKind,
  pathForFile,
  pickerTypesForKind,
  roleOptionsForKind,
  suggestedRoleForFile,
  typeForFile
} from "../assetManagerMetadata.js";

const DEFAULT_BEZEL_STRETCH_PX = 10;

function basenameFromPath(value) {
  return String(value || "").split(/[\\/]/).filter(Boolean).at(-1) || "";
}

export class AssetFormControl {
  constructor({
    addButton,
    assetIdInput,
    fileInput,
    kindInputs,
    pathInput,
    pickFileButton,
    roleSelect,
    redoButton,
    stretchField,
    stretchInput,
    undoButton,
    updateButton,
    windowRef = window
  }) {
    this.addButton = addButton;
    this.assetIdInput = assetIdInput;
    this.fileInput = fileInput;
    this.kindInputs = kindInputs;
    this.pathInput = pathInput;
    this.pickFileButton = pickFileButton;
    this.redoButton = redoButton;
    this.roleSelect = roleSelect;
    this.undoButton = undoButton;
    this.updateButton = updateButton;
    this.stretchField = stretchField;
    this.stretchInput = stretchInput;
    this.window = windowRef;
    this.allowedKinds = [];
    this.kindValue = "";
    this.selectedFileInfo = null;
    this.selectedFileError = "";
  }

  mount({ onAdd, onChange, onFileSelected, onRedo, onStatus, onUndo, onUpdate }) {
    this.onStatus = onStatus;
    this.updateFileAccept();
    this.pickFileButton.addEventListener("click", () => {
      void this.pickAssetFile({ onChange, onFileSelected });
    });
    this.fileInput.addEventListener("change", () => {
      const file = this.fileInput.files?.[0];
      this.applyFileSelection({ file, sourcePath: this.fileInput.value });
      this.fileInput.value = "";
      onFileSelected(this.readValue(), this.selectedFileInfo);
      onChange();
    });
    this.updateRoleOptions();
    this.addButton.addEventListener("click", () => onAdd(this.readValue()));
    this.updateButton.addEventListener("click", () => onUpdate(this.readValue()));
    this.undoButton.addEventListener("click", onUndo);
    this.redoButton.addEventListener("click", onRedo);
    this.stretchInput.addEventListener("change", onChange);
    this.stretchInput.addEventListener("input", onChange);
    this.kindInputs.forEach((input) => {
      input.addEventListener("change", () => {
        this.updateFileAccept();
        this.updateRoleOptions({ preserveCurrentRole: false });
        if (this.selectedFileInfo) {
          this.selectedFileInfo.type = this.selectedKind();
          this.applyDerivedFileValues();
          onFileSelected(this.readValue(), this.selectedFileInfo);
        } else {
          this.applyDerivedAssetId();
        }
        onChange();
      });
    });
    this.roleSelect.addEventListener("change", () => {
      this.updateStretchControl();
      if (this.selectedFileInfo) {
        this.applyDerivedFileValues();
        onFileSelected(this.readValue(), this.selectedFileInfo);
      } else {
        this.applyDerivedAssetId();
      }
      onChange();
    });
    [this.assetIdInput, this.pathInput].forEach((element) => {
      element.addEventListener("input", onChange);
      element.addEventListener("change", onChange);
    });
  }

  selectedKind() {
    return this.kindInputs.find((input) => input.checked)?.value || "";
  }

  selectedRole() {
    return this.roleSelect.value || "";
  }

  readValue() {
    const value = {
      assetId: this.assetIdInput.value.trim(),
      type: this.selectedKind(),
      kind: this.kindValue,
      path: this.pathInput.value.trim(),
      role: this.selectedRole()
    };
    if (value.role === "bezel") {
      value.stretchOverride = {
        uniformEdgeStretchPx: Number(this.stretchInput.value) || DEFAULT_BEZEL_STRETCH_PX
      };
    }
    return value;
  }

  isComplete() {
    const value = this.readValue();
    return Boolean(value.assetId && value.kind && value.path && value.role && !this.selectedFileError);
  }

  setAddEnabled(isEnabled) {
    this.addButton.disabled = !isEnabled;
  }

  setUpdateEnabled(isEnabled) {
    this.updateButton.disabled = !isEnabled;
  }

  setHistoryEnabled({ canRedo, canUndo }) {
    this.redoButton.disabled = !canRedo;
    this.undoButton.disabled = !canUndo;
  }

  setKinds(allowedKinds) {
    this.allowedKinds = [...allowedKinds];
    const allowed = new Set(this.allowedKinds);
    this.kindInputs.forEach((input) => {
      input.disabled = !allowed.has(input.value);
    });
    if (!allowed.has(this.selectedKind())) {
      const firstAllowedInput = this.kindInputs.find((input) => allowed.has(input.value));
      if (firstAllowedInput) {
        firstAllowedInput.checked = true;
      }
    }
    this.updateFileAccept();
    this.updateRoleOptions({ preserveCurrentRole: false });
  }

  clearEditableFields() {
    this.assetIdInput.value = "";
    this.pathInput.value = "";
    this.kindValue = "";
    this.selectedFileInfo = null;
    this.selectedFileError = "";
    this.fileInput.value = "";
    this.updateRoleOptions({ preserveCurrentRole: true });
    this.updateStretchControl();
  }

  loadAssetForEdit(assetId, entry) {
    const matchingKindInput = this.kindInputs.find((input) => input.value === entry.type);
    if (matchingKindInput) {
      matchingKindInput.checked = true;
    }
    this.updateFileAccept();
    this.updateRoleOptions({ preserveCurrentRole: false });
    if ([...this.roleSelect.options].some((option) => option.value === entry.role)) {
      this.roleSelect.value = entry.role;
    }
    this.assetIdInput.value = assetId;
    this.pathInput.value = entry.path || "";
    this.kindValue = entry.kind || "";
    this.stretchInput.value = String(entry.stretchOverride?.uniformEdgeStretchPx ?? DEFAULT_BEZEL_STRETCH_PX);
    this.selectedFileInfo = null;
    this.selectedFileError = "";
    this.fileInput.value = "";
    this.updateStretchControl();
  }

  async pickAssetFile({ onChange, onFileSelected }) {
    this.updateRoleOptions({ preserveCurrentRole: false });
    this.applyDerivedFileValues();
    onChange();
    if (typeof this.window.showOpenFilePicker !== "function") {
      this.fileInput.click();
      return;
    }
    try {
      const [fileHandle] = await this.window.showOpenFilePicker({
        multiple: false,
        excludeAcceptAllOption: false,
        types: pickerTypesForKind(this.selectedKind())
      });
      if (!fileHandle) {
        return;
      }
      const file = await fileHandle.getFile();
      const sourcePath = fileHandle.path || fileHandle.fullPath || file.path || file.webkitRelativePath || file.name;
      this.applyFileSelection({ file, sourcePath });
      onFileSelected(this.readValue(), this.selectedFileInfo);
      onChange();
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
      this.selectedFileError = `Asset file picker failed: ${error.message}`;
      this.onStatus?.("fail", this.selectedFileError);
      onChange();
    }
  }

  applyFileSelection({ file, sourcePath }) {
    if (!file) {
      this.selectedFileInfo = null;
      this.selectedFileError = "";
      this.updateRoleOptions();
      return;
    }
    const type = this.selectedKind();
    const derivedType = typeForFile(file);
    const kind = kindForFile(file);
    this.selectedFileInfo = {
      derivedType,
      kind,
      mimeType: file.type,
      name: file.name,
      sourcePath,
      type
    };
    if (!type) {
      this.selectedFileError = `File ${file.name} is not a recognized asset type.`;
    } else if (this.allowedKinds.length && !this.allowedKinds.includes(type)) {
      this.selectedFileError = `File ${file.name} resolved to unsupported asset type "${type}".`;
    } else {
      this.selectedFileError = fileMatchesAccept(type, {
        name: file.name,
        type: file.type
      })
        ? ""
        : `File ${file.name} is not accepted for ${labelForKind(type)} assets.`;
    }
    this.kindValue = kind;
    this.updateRoleOptions({ preserveCurrentRole: false });
    const suggestedRole = suggestedRoleForFile(type, file.name);
    if (suggestedRole && [...this.roleSelect.options].some((option) => option.value === suggestedRole)) {
      this.roleSelect.value = suggestedRole;
    }
    this.updateStretchControl();
    this.applyDerivedFileValues();
  }

  applyDerivedFileValues() {
    if (!this.selectedFileInfo) {
      return;
    }
    const { name, sourcePath, type } = this.selectedFileInfo;
    this.pathInput.value = type ? pathForFile(type, name, sourcePath) : "";
    this.applyDerivedAssetId(name);
  }

  applyDerivedAssetId(fileName = "") {
    const fallbackFromPath = basenameFromPath(this.pathInput.value);
    const fallbackFromId = this.assetIdInput.value.split(".").slice(3).join(".");
    const name = fileName || fallbackFromPath || fallbackFromId;
    this.assetIdInput.value = assetIdForFile(this.selectedKind(), name, this.selectedRole());
  }

  updateStretchControl() {
    const isBezel = this.selectedRole() === "bezel";
    this.stretchField.hidden = !isBezel;
    this.stretchInput.disabled = !isBezel;
    if (isBezel && !this.stretchInput.value) {
      this.stretchInput.value = String(DEFAULT_BEZEL_STRETCH_PX);
    }
  }

  updateFileAccept() {
    this.fileInput.accept = acceptForKind(this.selectedKind());
  }

  updateRoleOptions({ preserveCurrentRole = true } = {}) {
    const kind = this.selectedKind();
    const roles = roleOptionsForKind(kind);
    const currentValue = this.roleSelect.value;
    this.roleSelect.innerHTML = roles.map((role) => `<option value="${role}">${role}</option>`).join("");
    this.roleSelect.value = preserveCurrentRole && roles.includes(currentValue) ? currentValue : roles[0] || "";
    this.roleSelect.disabled = roles.length === 0;
    this.roleSelect.title = roles.length
      ? `Allowed roles for ${kind}: ${roles.join(", ")}`
      : "No roles available for the selected type.";
    this.updateStretchControl();
  }
}
