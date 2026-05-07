import {
  acceptForKind,
  assetIdForColor,
  assetIdForFile,
  colorAssetPath,
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
const COLOR_SORT_OPTIONS = Object.freeze([
  ["hue", "Hue"],
  ["saturation", "Sat"],
  ["brightness", "Bri"],
  ["name", "Nam"],
  ["tag", "Tag"]
]);

function basenameFromPath(value) {
  return String(value || "").split(/[\\/]/).filter(Boolean).at(-1) || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeHex(value) {
  const hex = String(value || "").trim();
  return /^#([a-f0-9]{6}|[a-f0-9]{8})$/i.test(hex) ? hex.toUpperCase() : "";
}

function normalizeTags(tags) {
  return Array.isArray(tags)
    ? tags.map((tag) => String(tag || "").trim()).filter(Boolean)
    : [];
}

function normalizeSwatch(rawSwatch) {
  const hex = normalizeHex(rawSwatch?.hex);
  const name = String(rawSwatch?.name || "").trim();
  if (!hex || !name) {
    return null;
  }
  return {
    hex,
    name,
    source: String(rawSwatch?.source || "").trim(),
    symbol: String(rawSwatch?.symbol || "").trim(),
    tags: normalizeTags(rawSwatch?.tags)
  };
}

function hexToHsb(hexValue) {
  const hex = normalizeHex(hexValue).slice(1, 7);
  const r = Number.parseInt(hex.slice(0, 2), 16) / 255;
  const g = Number.parseInt(hex.slice(2, 4), 16) / 255;
  const b = Number.parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta && max === r) {
    hue = 60 * (((g - b) / delta) % 6);
  } else if (delta && max === g) {
    hue = 60 * (((b - r) / delta) + 2);
  } else if (delta && max === b) {
    hue = 60 * (((r - g) / delta) + 4);
  }
  return {
    brightness: max,
    hue: (hue + 360) % 360,
    saturation: max === 0 ? 0 : delta / max
  };
}

function swatchSortValue(swatch, sortKey) {
  if (sortKey === "name") {
    return swatch.name.toLowerCase();
  }
  if (sortKey === "tag") {
    return (swatch.tags[0] || "").toLowerCase();
  }
  return hexToHsb(swatch.hex)[sortKey] ?? 0;
}

export class AssetFormControl {
  constructor({
    addButton,
    assetIdInput,
    colorPickerPanel,
    colorSortControls,
    colorSwatchList,
    filePickerPanel,
    fileInput,
    kindInputs,
    pathInput,
    pickFileButton,
    roleSelect,
    redoButton,
    stretchField,
    stretchInput,
    undoButton,
    usageField,
    usageInput,
    updateButton,
    windowRef = window
  }) {
    this.addButton = addButton;
    this.assetIdInput = assetIdInput;
    this.colorPickerPanel = colorPickerPanel;
    this.colorSortControls = colorSortControls;
    this.colorSwatchList = colorSwatchList;
    this.filePickerPanel = filePickerPanel;
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
    this.usageField = usageField;
    this.usageInput = usageInput;
    this.window = windowRef;
    this.allowedKinds = [];
    this.colorSortKey = "name";
    this.paletteSwatches = [];
    this.emptyPaletteStatusWritten = false;
    this.selectedColorInfo = null;
    this.kindValue = "";
    this.selectedFileInfo = null;
    this.selectedFileError = "";
  }

  mount({ onAdd, onChange, onColorSelected, onFileSelected, onRedo, onStatus, onUndo, onUpdate }) {
    this.onStatus = onStatus;
    this.onColorSelected = onColorSelected;
    this.renderColorSortControls();
    this.updateFileAccept();
    this.updatePickerMode();
    this.pickFileButton.addEventListener("click", () => {
      if (this.selectedKind() === "color") {
        this.openColorPicker();
        onChange();
        return;
      }
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
    this.usageInput.addEventListener("input", () => {
      this.applyDerivedAssetId(this.selectedColorInfo?.name || "");
      if (this.selectedColorInfo) {
        this.onColorSelected?.(this.readValue(), this.selectedColorInfo);
      }
      onChange();
    });
    this.usageInput.addEventListener("change", () => {
      this.applyDerivedAssetId(this.selectedColorInfo?.name || "");
      if (this.selectedColorInfo) {
        this.onColorSelected?.(this.readValue(), this.selectedColorInfo);
      }
      onChange();
    });
    this.kindInputs.forEach((input) => {
      input.addEventListener("change", () => {
        this.updateFileAccept();
        this.updateRoleOptions({ preserveCurrentRole: false });
        this.clearSelectionFields();
        this.updatePickerMode();
        onChange();
      });
    });
    this.roleSelect.addEventListener("change", () => {
      this.updateStretchControl();
      if (this.selectedFileInfo) {
        this.applyDerivedFileValues();
        onFileSelected(this.readValue(), this.selectedFileInfo);
      } else if (this.selectedColorInfo) {
        this.applyDerivedAssetId(this.selectedColorInfo.name);
        this.onColorSelected?.(this.readValue(), this.selectedColorInfo);
      } else {
        this.applyDerivedAssetId();
      }
      onChange();
    });
    this.colorSwatchList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-color-swatch-index]");
      if (!button) {
        return;
      }
      const swatch = this.sortedPaletteSwatches()[Number(button.dataset.colorSwatchIndex)];
      if (!swatch) {
        return;
      }
      this.applyColorSelection(swatch);
      this.onColorSelected(this.readValue(), this.selectedColorInfo);
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
      role: this.selectedRole(),
      usage: this.selectedKind() === "color" ? this.usageInput.value.trim() : ""
    };
    if (value.type === "color" && this.selectedColorInfo) {
      value.color = {
        hex: this.selectedColorInfo.hex,
        name: this.selectedColorInfo.name,
        ...(this.selectedColorInfo.symbol ? { symbol: this.selectedColorInfo.symbol } : {}),
        ...(this.selectedColorInfo.source ? { source: this.selectedColorInfo.source } : {}),
        ...(this.selectedColorInfo.tags.length ? { tags: [...this.selectedColorInfo.tags] } : {})
      };
    }
    if (value.role === "bezel") {
      value.stretchOverride = {
        uniformEdgeStretchPx: Number(this.stretchInput.value) || DEFAULT_BEZEL_STRETCH_PX
      };
    }
    return value;
  }

  isComplete() {
    const value = this.readValue();
    return Boolean(value.assetId
      && value.kind
      && value.path
      && value.role
      && (value.type !== "color" || value.usage)
      && !this.selectedFileError);
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

  setPaletteSwatches(swatches) {
    this.paletteSwatches = Array.isArray(swatches)
      ? swatches.map(normalizeSwatch).filter(Boolean)
      : [];
    this.emptyPaletteStatusWritten = false;
    this.renderColorSwatches();
  }

  clearEditableFields() {
    this.clearSelectionFields();
    this.updateRoleOptions({ preserveCurrentRole: true });
    this.updateStretchControl();
  }

  clearSelectionFields() {
    this.assetIdInput.value = "";
    this.pathInput.value = "";
    this.usageInput.value = "";
    this.kindValue = "";
    this.selectedColorInfo = null;
    this.selectedFileInfo = null;
    this.selectedFileError = "";
    this.fileInput.value = "";
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
    this.usageInput.value = entry.type === "color" ? this.usageFromAssetId(assetId) : "";
    this.kindValue = entry.kind || "";
    this.stretchInput.value = String(entry.stretchOverride?.uniformEdgeStretchPx ?? DEFAULT_BEZEL_STRETCH_PX);
    this.selectedColorInfo = entry.color ? normalizeSwatch(entry.color) : null;
    this.selectedFileInfo = null;
    this.selectedFileError = "";
    this.fileInput.value = "";
    this.updatePickerMode();
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
      this.selectedColorInfo = null;
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

  applyColorSelection(swatch) {
    this.selectedColorInfo = normalizeSwatch(swatch);
    this.selectedFileInfo = null;
    this.selectedFileError = "";
    this.kindValue = "hex";
    this.pathInput.value = colorAssetPath(this.selectedColorInfo.name);
    this.applyDerivedAssetId(this.selectedColorInfo.name);
    this.renderColorSwatches();
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
    this.assetIdInput.value = this.selectedKind() === "color"
      ? assetIdForColor(this.selectedKind(), this.selectedRole(), this.usageInput.value, name)
      : assetIdForFile(this.selectedKind(), name, this.selectedRole());
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

  updatePickerMode() {
    const isColor = this.selectedKind() === "color";
    this.filePickerPanel.hidden = isColor;
    this.colorPickerPanel.hidden = !isColor;
    this.usageField.hidden = !isColor;
    this.usageInput.disabled = !isColor;
    this.fileInput.disabled = isColor;
    this.fileInput.accept = isColor ? "" : acceptForKind(this.selectedKind());
    if (!isColor) {
      return;
    }
    this.renderColorSwatches();
    if (!this.paletteSwatches.length && !this.emptyPaletteStatusWritten) {
      this.emptyPaletteStatusWritten = true;
      this.onStatus?.("fail", "No active Workspace Manager V2 palette colors.");
    }
  }

  openColorPicker() {
    if (this.selectedKind() !== "color") {
      return;
    }
    this.colorPickerPanel.hidden = false;
    this.renderColorSwatches();
    if (!this.paletteSwatches.length) {
      this.onStatus?.("fail", "No active Workspace Manager V2 palette colors.");
    }
  }

  sortedPaletteSwatches() {
    const sortKey = this.colorSortKey;
    return [...this.paletteSwatches].sort((left, right) => {
      const leftValue = swatchSortValue(left, sortKey);
      const rightValue = swatchSortValue(right, sortKey);
      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return leftValue - rightValue || left.name.localeCompare(right.name);
      }
      return String(leftValue).localeCompare(String(rightValue)) || left.name.localeCompare(right.name);
    });
  }

  renderColorSortControls() {
    this.colorSortControls.innerHTML = COLOR_SORT_OPTIONS.map(([value, label]) => `
      <button type="button" data-color-sort-key="${value}" role="radio" aria-checked="${value === this.colorSortKey}">${label}</button>
    `).join("");
    this.colorSortControls.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-color-sort-key]");
      if (!button) {
        return;
      }
      this.colorSortKey = button.dataset.colorSortKey;
      this.renderColorSortControls();
      this.renderColorSwatches();
    }, { once: true });
  }

  renderColorSwatches() {
    this.colorSortControls.querySelectorAll("button[data-color-sort-key]").forEach((button) => {
      button.setAttribute("aria-checked", String(button.dataset.colorSortKey === this.colorSortKey));
    });
    const swatches = this.sortedPaletteSwatches();
    if (!swatches.length) {
      this.colorSwatchList.innerHTML = "";
      return;
    }
    this.colorSwatchList.innerHTML = swatches.map((swatch, index) => {
      const isSelected = this.selectedColorInfo?.hex === swatch.hex && this.selectedColorInfo?.name === swatch.name;
      const label = [
        `name: ${swatch.name}`,
        `hex: ${swatch.hex}`,
        ...(swatch.symbol ? [`symbol: ${swatch.symbol}`] : []),
        ...(swatch.source ? [`source: ${swatch.source}`] : []),
        ...(swatch.tags.length ? [`tags: ${swatch.tags.join(", ")}`] : [])
      ].join("\n");
      return `
        <button type="button" class="${isSelected ? "is-selected" : ""}" data-color-swatch-index="${index}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}" aria-pressed="${isSelected}">
          <span class="asset-manager-v2__color-swatch" style="background:${escapeHtml(swatch.hex)}"></span>
        </button>
      `;
    }).join("");
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

  usageFromAssetId(assetId) {
    const parts = String(assetId || "").split(".");
    return parts[0] === "assets" && parts[1] === "color" && parts.length >= 5
      ? parts[3]
      : "";
  }
}
