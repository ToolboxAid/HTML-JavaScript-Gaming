import {
  acceptForKind,
  assetIdForFile,
  fileMatchesAccept,
  kindForFile,
  labelForKind,
  pathForFile,
  pickerTypesForKind,
  roleOptionsForKind
} from "../assetManagerMetadata.js";

export class AssetFormControl {
  constructor({
    addButton,
    assetIdInput,
    fileInput,
    kindInputs,
    pathInput,
    pickFileButton,
    roleSelect,
    selectedFileText,
    validationMessage,
    windowRef = window
  }) {
    this.addButton = addButton;
    this.assetIdInput = assetIdInput;
    this.fileInput = fileInput;
    this.kindInputs = kindInputs;
    this.pathInput = pathInput;
    this.pickFileButton = pickFileButton;
    this.roleSelect = roleSelect;
    this.selectedFileText = selectedFileText;
    this.validationMessage = validationMessage;
    this.window = windowRef;
    this.allowedKinds = [];
    this.selectedFileInfo = null;
    this.selectedFileError = "";
  }

  mount({ onAdd, onChange, onFileSelected }) {
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
    this.kindInputs.forEach((input) => {
      input.addEventListener("change", () => {
        this.updateFileAccept();
        this.updateRoleOptions({ preserveCurrentRole: false });
        if (this.selectedFileInfo) {
          this.selectedFileInfo.kind = this.selectedKind();
          this.applyDerivedFileValues();
          onFileSelected(this.readValue(), this.selectedFileInfo);
        }
        onChange();
      });
    });
    this.roleSelect.addEventListener("change", () => {
      if (this.selectedFileInfo) {
        this.applyDerivedFileValues();
        onFileSelected(this.readValue(), this.selectedFileInfo);
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
    return {
      assetId: this.assetIdInput.value.trim(),
      kind: this.selectedKind(),
      path: this.pathInput.value.trim(),
      role: this.selectedRole()
    };
  }

  isComplete() {
    const value = this.readValue();
    return Boolean(value.assetId && value.kind && value.path && value.role && !this.selectedFileError);
  }

  setAddEnabled(isEnabled) {
    this.addButton.disabled = !isEnabled;
  }

  setApprovedKinds(allowedKinds) {
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
    this.showMessage(`Approved kinds: ${allowedKinds.join(", ")}.`, "ok");
  }

  clearEditableFields() {
    this.assetIdInput.value = "";
    this.pathInput.value = "";
    this.selectedFileInfo = null;
    this.selectedFileError = "";
    this.fileInput.value = "";
    this.selectedFileText.textContent = "No file selected.";
    this.updateRoleOptions({ preserveCurrentRole: true });
  }

  showMessage(message, tone = "info") {
    this.validationMessage.textContent = message;
    this.validationMessage.classList.toggle("is-error", tone === "error");
    this.validationMessage.classList.toggle("is-ok", tone === "ok");
  }

  async pickAssetFile({ onChange, onFileSelected }) {
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
      this.showMessage(this.selectedFileError, "error");
      onChange();
    }
  }

  applyFileSelection({ file, sourcePath }) {
    if (!file) {
      this.selectedFileInfo = null;
      this.selectedFileError = "";
      this.selectedFileText.textContent = "No file selected.";
      this.updateRoleOptions();
      return;
    }
    const kind = this.selectedKind();
    const derivedKind = kindForFile(file);
    this.selectedFileInfo = {
      derivedKind,
      kind,
      name: file.name,
      sourcePath,
      type: file.type
    };
    if (!kind) {
      this.selectedFileError = `File ${file.name} is not an approved asset type.`;
    } else if (this.allowedKinds.length && !this.allowedKinds.includes(kind)) {
      this.selectedFileError = `File ${file.name} resolved to unsupported asset kind "${kind}".`;
    } else {
      this.selectedFileError = fileMatchesAccept(kind, this.selectedFileInfo)
        ? ""
        : `File ${file.name} is not accepted for ${labelForKind(kind)} assets.`;
    }
    this.updateRoleOptions();
    this.applyDerivedFileValues();
    this.selectedFileText.textContent = kind ? `${labelForKind(kind)}: ${file.name}` : `Unapproved: ${file.name}`;
  }

  applyDerivedFileValues() {
    if (!this.selectedFileInfo) {
      return;
    }
    const { kind, name, sourcePath } = this.selectedFileInfo;
    this.pathInput.value = kind ? pathForFile(kind, name, sourcePath) : "";
    this.assetIdInput.value = assetIdForFile(kind, name, this.selectedRole());
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
  }
}
