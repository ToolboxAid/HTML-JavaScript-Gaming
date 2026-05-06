export class AssetFormControl {
  constructor({
    addButton,
    assetIdInput,
    kindInputs,
    pathInput,
    stretchOverrideInput,
    validationMessage
  }) {
    this.addButton = addButton;
    this.assetIdInput = assetIdInput;
    this.kindInputs = kindInputs;
    this.pathInput = pathInput;
    this.stretchOverrideInput = stretchOverrideInput;
    this.validationMessage = validationMessage;
  }

  mount({ onAdd, onChange }) {
    this.addButton.addEventListener("click", () => onAdd(this.readValue()));
    [this.assetIdInput, this.pathInput, this.stretchOverrideInput, ...this.kindInputs].forEach((element) => {
      element.addEventListener("input", onChange);
      element.addEventListener("change", onChange);
    });
  }

  selectedKind() {
    return this.kindInputs.find((input) => input.checked)?.value || "";
  }

  readValue() {
    const stretchRawValue = this.stretchOverrideInput.value.trim();
    return {
      assetId: this.assetIdInput.value.trim(),
      kind: this.selectedKind(),
      path: this.pathInput.value.trim(),
      stretchOverridePx: stretchRawValue === "" ? null : Number(stretchRawValue)
    };
  }

  isComplete() {
    const value = this.readValue();
    return Boolean(value.assetId && value.kind && value.path);
  }

  setAddEnabled(isEnabled) {
    this.addButton.disabled = !isEnabled;
  }

  setApprovedKinds(allowedKinds) {
    const allowed = new Set(allowedKinds);
    this.kindInputs.forEach((input) => {
      input.disabled = !allowed.has(input.value);
    });
    this.showMessage(`Approved kinds: ${allowedKinds.join(", ")}.`, "ok");
  }

  clearEditableFields() {
    this.assetIdInput.value = "";
    this.pathInput.value = "";
    this.stretchOverrideInput.value = "";
  }

  showMessage(message, tone = "info") {
    this.validationMessage.textContent = message;
    this.validationMessage.classList.toggle("is-error", tone === "error");
    this.validationMessage.classList.toggle("is-ok", tone === "ok");
  }
}
