import { cloneSwatch, normalizeHex } from "../modules/paletteUtils.js";

export class PaletteHarmonyControl {
  constructor({ documentRef, refs, app }) {
    this.document = documentRef;
    this.refs = refs;
    this.app = app;
  }

  bind() {
    this.renderOptions();
    this.refs.harmonyMatchSourceSelect.addEventListener("change", () => {
      this.app.setHarmonyMatchSource(this.refs.harmonyMatchSourceSelect.value);
    });
    this.refs.harmonySchemeSelect.addEventListener("change", () => {
      this.app.setHarmonyScheme(this.refs.harmonySchemeSelect.value);
    });
    this.refs.addSelectedHarmonyButton.addEventListener("click", () => {
      this.app.addSelectedHarmonyColor();
    });
    this.refs.addAllHarmonyButton.addEventListener("click", () => {
      this.app.addAllHarmonyColors();
    });
  }

  renderOptions() {
    this.refs.harmonyMatchSourceSelect.replaceChildren();
    this.app.getHarmonyMatchSourceOptions().forEach((option) => {
      const element = this.document.createElement("option");
      element.value = option.value;
      element.textContent = option.label;
      this.refs.harmonyMatchSourceSelect.appendChild(element);
    });

    this.refs.harmonySchemeSelect.replaceChildren();
    this.app.getHarmonySchemeOptions().forEach((option) => {
      const element = this.document.createElement("option");
      element.value = option.value;
      element.textContent = option.label;
      this.refs.harmonySchemeSelect.appendChild(element);
    });
  }

  render() {
    this.refs.harmonyMatchSourceSelect.value = this.app.getHarmonyMatchSource();
    this.refs.harmonySchemeSelect.value = this.app.getHarmonyScheme();
    this.renderParameterControls();
    this.renderHarmonyColors();
  }

  renderParameterControls() {
    this.refs.harmonyParameterControls.replaceChildren();
    const parameter = this.app.getHarmonySchemeParameter();
    if (!parameter) {
      return;
    }
    const label = this.document.createElement("label");
    label.className = "palette-manager-v2__field palette-manager-v2__field--compact";
    label.textContent = parameter.label;

    const input = this.document.createElement("input");
    input.id = "harmonyParameterInput";
    input.type = "number";
    input.min = String(parameter.min);
    input.max = String(parameter.max);
    input.step = String(parameter.step);
    input.value = String(this.app.getHarmonyParameterValue());
    input.addEventListener("input", () => {
      this.app.setHarmonyParameterValue(input.value);
    });

    label.appendChild(input);
    this.refs.harmonyParameterControls.appendChild(label);
  }

  renderHarmonyColors() {
    this.refs.harmonyColorList.replaceChildren();
    const colors = this.app.getHarmonyColors();
    this.refs.addSelectedHarmonyButton.disabled = colors.length === 0;
    this.refs.addAllHarmonyButton.disabled = colors.length === 0;

    if (!this.app.getSelectedSwatch()) {
      const empty = this.document.createElement("p");
      empty.className = "palette-manager-v2__meta";
      empty.textContent = "Select a user or source swatch.";
      this.refs.harmonyColorList.appendChild(empty);
      return;
    }

    if (colors.length === 0) {
      const empty = this.document.createElement("p");
      empty.className = "palette-manager-v2__meta";
      empty.textContent = "No harmony colors could be generated.";
      this.refs.harmonyColorList.appendChild(empty);
      return;
    }

    colors.forEach((color, index) => {
      this.refs.harmonyColorList.appendChild(this.createHarmonyColorButton(color, index));
    });
  }

  createHarmonyColorButton(color, index) {
    const cleanSwatch = cloneSwatch(color.swatch || {});
    const button = this.document.createElement("button");
    button.type = "button";
    button.className = "palette-manager-v2__harmony-color";
    button.classList.toggle("is-selected", index === this.app.getSelectedHarmonyColorIndex());
    button.setAttribute("aria-pressed", String(index === this.app.getSelectedHarmonyColorIndex()));
    button.dataset.harmonyIndex = String(index);
    button.dataset.harmonyHex = normalizeHex(color.hex);
    button.dataset.harmonyLabel = color.displayName || color.name || "";
    button.dataset.harmonyPalette = color.paletteName || "";
    button.dataset.harmonySwatchName = color.swatchName || "";
    button.title = `${color.displayName || color.name}: ${normalizeHex(color.hex)}`;
    button.addEventListener("click", () => {
      this.app.setSelectedHarmonyColorIndex(index);
    });

    const chip = this.document.createElement("span");
    chip.className = "palette-manager-v2__harmony-chip";
    chip.style.background = normalizeHex(color.hex);
    chip.setAttribute("aria-hidden", "true");

    const text = this.document.createElement("span");
    text.className = "palette-manager-v2__harmony-text";
    text.textContent = color.displayName || cleanSwatch.name || color.name || normalizeHex(color.hex);

    const meta = this.document.createElement("span");
    meta.className = "palette-manager-v2__harmony-meta";
    meta.textContent = normalizeHex(color.hex);

    button.append(chip, text, meta);
    return button;
  }
}
