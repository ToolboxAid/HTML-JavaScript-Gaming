import {
  acceptForKind,
  assetIdForFile,
  fileMatchesAccept,
  labelForKind,
  pathForFile,
  roleOptionsForKind
} from "../assetManagerMetadata.js";

export class AssetFormControl {
  constructor({
    addButton,
    assetIdInput,
    fileInputs,
    kindInputs,
    pathInput,
    roleSelect,
    selectedFileText,
    stretchOverrideInput,
    validationMessage
  }) {
    this.addButton = addButton;
    this.assetIdInput = assetIdInput;
    this.fileInputs = fileInputs;
    this.kindInputs = kindInputs;
    this.pathInput = pathInput;
    this.roleSelect = roleSelect;
    this.selectedFileText = selectedFileText;
    this.stretchOverrideInput = stretchOverrideInput;
    this.validationMessage = validationMessage;
    this.selectedFileInfo = null;
    this.selectedFileError = "";
  }

  mount({ onAdd, onChange, onFileSelected }) {
    this.fileInputs.forEach((input) => {
      const kind = input.dataset.assetFileKind;
      input.accept = acceptForKind(kind);
      input.addEventListener("change", () => {
        this.applyFileSelection(input);
        onFileSelected(this.readValue(), this.selectedFileInfo);
        onChange();
      });
    });
    this.updateRoleOptions();
    this.addButton.addEventListener("click", () => onAdd(this.readValue()));
    [...this.kindInputs, this.roleSelect].forEach((element) => {
      element.addEventListener("change", () => {
        this.updateRoleOptions();
        if (this.selectedFileInfo) {
          this.applyDerivedFileValues();
          onFileSelected(this.readValue(), this.selectedFileInfo);
        }
        onChange();
      });
    });
    [this.assetIdInput, this.pathInput, this.stretchOverrideInput].forEach((element) => {
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
    const stretchRawValue = this.stretchOverrideInput.value.trim();
    return {
      assetId: this.assetIdInput.value.trim(),
      kind: this.selectedKind(),
      path: this.pathInput.value.trim(),
      role: this.selectedRole(),
      stretchOverridePx: stretchRawValue === "" ? null : Number(stretchRawValue)
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
    const allowed = new Set(allowedKinds);
    this.kindInputs.forEach((input) => {
      input.disabled = !allowed.has(input.value);
    });
    this.fileInputs.forEach((input) => {
      input.disabled = !allowed.has(input.dataset.assetFileKind);
    });
    this.updateRoleOptions();
    this.showMessage(`Approved kinds: ${allowedKinds.join(", ")}.`, "ok");
  }

  clearEditableFields() {
    this.assetIdInput.value = "";
    this.pathInput.value = "";
    this.stretchOverrideInput.value = "";
    this.selectedFileInfo = null;
    this.selectedFileError = "";
    this.fileInputs.forEach((input) => {
      input.value = "";
    });
    this.selectedFileText.textContent = "No file selected.";
  }

  showMessage(message, tone = "info") {
    this.validationMessage.textContent = message;
    this.validationMessage.classList.toggle("is-error", tone === "error");
    this.validationMessage.classList.toggle("is-ok", tone === "ok");
  }

  applyFileSelection(input) {
    const kind = input.dataset.assetFileKind || "";
    this.kindInputs.forEach((kindInput) => {
      kindInput.checked = kindInput.value === kind;
    });
    this.updateRoleOptions();
    const file = input.files?.[0];
    if (!file) {
      this.selectedFileInfo = null;
      this.selectedFileError = "";
      this.selectedFileText.textContent = "No file selected.";
      return;
    }
    this.selectedFileInfo = {
      kind,
      name: file.name,
      type: file.type
    };
    this.selectedFileError = fileMatchesAccept(kind, this.selectedFileInfo)
      ? ""
      : `File ${file.name} is not accepted for ${labelForKind(kind)} assets.`;
    this.applyDerivedFileValues();
    this.selectedFileText.textContent = `${labelForKind(kind)}: ${file.name}`;
  }

  applyDerivedFileValues() {
    if (!this.selectedFileInfo) {
      return;
    }
    const { kind, name } = this.selectedFileInfo;
    this.pathInput.value = pathForFile(kind, name);
    this.assetIdInput.value = assetIdForFile(kind, name, this.selectedRole());
  }

  updateRoleOptions() {
    const kind = this.selectedKind();
    const roles = roleOptionsForKind(kind);
    const currentValue = this.roleSelect.value;
    this.roleSelect.innerHTML = roles.map((role) => `<option value="${role}">${role}</option>`).join("");
    this.roleSelect.value = roles.includes(currentValue) ? currentValue : roles[0] || "";
    this.roleSelect.disabled = roles.length === 0;
  }
}
