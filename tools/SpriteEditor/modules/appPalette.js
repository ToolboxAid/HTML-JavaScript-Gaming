function installSpriteEditorPaletteMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    getPaletteLibrary() {
      return (typeof globalThis.palettesList === "object" && globalThis.palettesList) ? globalThis.palettesList : null;
    },

    getProjectPaletteLibrary() {
      const globalPalettes = this.getPaletteLibrary() || {};
      const customPalettes = this.document && this.document.customPalettes && typeof this.document.customPalettes === "object"
        ? this.document.customPalettes
        : {};
      return { ...globalPalettes, ...customPalettes };
    },

    getCustomPaletteNames() {
      const customPalettes = this.document && this.document.customPalettes && typeof this.document.customPalettes === "object"
        ? this.document.customPalettes
        : {};
      return Object.keys(customPalettes).sort((a, b) => a.localeCompare(b));
    },

    isPaletteSelectionRequired() {
      return !!(this.document && this.document.paletteSelectionRequired === true);
    },

    getPaletteStatusLabel() {
      if (this.isPaletteSelectionRequired()) return "MUST BE SELECTED FIRST";
      return String(this.currentPalettePreset || this.document.palettePresetName || "CUSTOM").toUpperCase();
    },

    ensurePaletteSelectedForEdit(showFeedback = true) {
      if (!this.isPaletteSelectionRequired()) return true;
      if (showFeedback) {
        if (typeof this.openPaletteLockPopup === "function") {
          this.openPaletteLockPopup("Select a palette preset before editing pixels.");
        }
        this.showMessage("Palette must be selected first.");
      }
      return false;
    },

    isPalettePresetLocked() {
      return !this.isPaletteSelectionRequired();
    },

    getPaletteSignature(palette) {
      return JSON.stringify(Array.isArray(palette) ? palette : []);
    },

    findMatchingPalettePresetName(paletteLibrary = this.getProjectPaletteLibrary()) {
      if (!paletteLibrary) return "";
      const paletteSig = this.getPaletteSignature(this.document.palette || []);
      const names = Object.keys(paletteLibrary);
      for (let i = 0; i < names.length; i += 1) {
        const entries = paletteLibrary[names[i]];
        if (!Array.isArray(entries)) continue;
        const hexes = entries.map((entry) => entry && entry.hex).filter((hex) => typeof hex === "string");
        if (this.getPaletteSignature(hexes) === paletteSig) return names[i];
      }
      return "";
    },

    validatePaletteConfiguration() {
      const paletteLibrary = this.getProjectPaletteLibrary();
      const currentPaletteSig = this.getPaletteSignature(this.document.palette || []);
      const defaultPaletteSig = this.getPaletteSignature(
        typeof this.document.getDefaultPalette === "function" ? this.document.getDefaultPalette() : []
      );
      if (currentPaletteSig === defaultPaletteSig) {
        this.currentPalettePreset = this.document && this.document.palettePresetName ? this.document.palettePresetName : "default";
        this.paletteConfigBlockMessage = "";
        return true;
      }
      if (!paletteLibrary) {
        this.paletteConfigBlockMessage = "Palette library missing: window.palettesList was not found.";
        return false;
      }
      const matchedPreset = this.findMatchingPalettePresetName(paletteLibrary);
      if (!matchedPreset) {
        this.paletteConfigBlockMessage = "Current non-default document palette was not found in palette library.";
        return false;
      }
      this.currentPalettePreset = matchedPreset;
      this.document.palettePresetName = matchedPreset;
      this.paletteConfigBlockMessage = "";
      return true;
    },

    isPaletteConfigurationBlocked() {
      return !!this.paletteConfigBlockMessage;
    },

    getActivePresetEntries() {
      const paletteLibrary = this.getProjectPaletteLibrary();
      if (paletteLibrary && this.currentPalettePreset && Array.isArray(paletteLibrary[this.currentPalettePreset])) {
        return paletteLibrary[this.currentPalettePreset];
      }
      if (this.currentPalettePreset === "default" && typeof this.document.getDefaultPaletteNamedEntries === "function") {
        return this.document.getDefaultPaletteNamedEntries();
      }
      return null;
    },

    colorHexToHsl(hex) {
      const value = String(hex || "").replace("#", "");
      if (value.length < 6) return { h: 0, s: 0, l: 0 };
      const r = parseInt(value.slice(0, 2), 16) / 255;
      const g = parseInt(value.slice(2, 4), 16) / 255;
      const b = parseInt(value.slice(4, 6), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d) + (g < b ? 6 : 0); break;
          case g: h = ((b - r) / d) + 2; break;
          default: h = ((r - g) / d) + 4; break;
        }
        h /= 6;
      }
      return { h, s, l };
    },

    getPaletteDisplayEntries() {
      if (this.isPaletteSelectionRequired()) return [];
      const palette = Array.isArray(this.document.palette) ? this.document.palette : [];
      const presetEntries = this.getActivePresetEntries();
      const entries = palette.map((hex, index) => {
        const presetEntry = presetEntries && presetEntries[index] ? presetEntries[index] : null;
        const name = presetEntry && typeof presetEntry.name === "string" && presetEntry.name.trim() ? presetEntry.name.trim() : hex;
        const hsl = this.colorHexToHsl(hex);
        return { hex, index, name, h: hsl.h, s: hsl.s, l: hsl.l };
      });
      const mode = this.paletteSortMode || "name";
      const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
      entries.sort((a, b) => {
        if (mode === "name") {
          const cmp = collator.compare(a.name, b.name);
          if (cmp !== 0) return cmp;
        } else if (mode === "hue") {
          if (a.h !== b.h) return a.h - b.h;
          if (a.s !== b.s) return a.s - b.s;
          if (a.l !== b.l) return a.l - b.l;
        } else if (mode === "saturation") {
          if (a.s !== b.s) return a.s - b.s;
          if (a.h !== b.h) return a.h - b.h;
          if (a.l !== b.l) return a.l - b.l;
        } else if (mode === "lightness") {
          if (a.l !== b.l) return a.l - b.l;
          if (a.h !== b.h) return a.h - b.h;
          if (a.s !== b.s) return a.s - b.s;
        }
        return a.index - b.index;
      });
      return entries;
    },

    getCurrentColorDisplayText() {
      if (this.isPaletteSelectionRequired()) {
        return "Current: NONE   Named: Select palette first";
      }
      const currentHex = String(this.document.currentColor || "").toUpperCase();
      let name = "";
      const presetEntries = this.getActivePresetEntries();
      if (Array.isArray(presetEntries)) {
        const match = presetEntries.find((entry) => entry && String(entry.hex || "").toUpperCase() === currentHex && typeof entry.name === "string" && entry.name.trim());
        if (match) name = match.name.trim();
      }
      return `Current: ${currentHex}  ■   Named: ${name || "Unnamed"}`;
    },

    setCurrentColor(color) {
      this.document.currentColor = color;
      this.showMessage("Color selected.");
    },

    setPaletteSortMode(mode) {
      if (!["name", "hue", "saturation", "lightness"].includes(mode)) return false;
      if (this.paletteSortMode === mode) return false;
      this.paletteSortMode = mode;
      this.paletteSidebarScroll = 0;
      this.showMessageAndRender(`Palette sort: ${mode[0].toUpperCase()}${mode.slice(1)}.`);
      return true;
    },

    cycleCurrentColor(step) {
      const palette = Array.isArray(this.document.palette) ? this.document.palette : [];
      if (!palette.length) return false;
      const index = palette.indexOf(this.document.currentColor);
      const nextIndex = index >= 0
        ? (index + step + palette.length) % palette.length
        : 0;
      this.document.currentColor = palette[nextIndex];
      this.showMessageAndRender("Color cycled.");
      return true;
    },

    prevColor() {
      return this.cycleCurrentColor(-1);
    },

    nextColor() {
      return this.cycleCurrentColor(1);
    },

    getPaletteScopeLabel() {
      if (this.paletteWorkflow.scope === "active_layer") return "Scope: Layer";
      if (this.paletteWorkflow.scope === "current_frame") return "Scope: Frame";
      return "Scope: Range";
    },

    cyclePaletteReplaceScope() {
      const order = ["active_layer", "current_frame", "selected_range"];
      const current = order.indexOf(this.paletteWorkflow.scope);
      this.paletteWorkflow.scope = order[(current + 1) % order.length];
      this.showMessageAndRender(this.getPaletteScopeLabel());
    },

    setPaletteReplaceScope(scope) {
      this.paletteWorkflow.scope = scope;
      this.showMessageAndRender(this.getPaletteScopeLabel());
      return true;
    },

    setPaletteReplaceSource() {
      this.paletteWorkflow.source = this.document.currentColor;
      this.showMessageAndRender("Replace source set.");
    },

    setPaletteReplaceTarget() {
      this.paletteWorkflow.target = this.document.currentColor;
      this.showMessageAndRender("Replace target set.");
    },

    selectCustomPaletteClone(name) {
      if (!name) return false;
      const customPalettes = this.document && this.document.customPalettes && typeof this.document.customPalettes === "object"
        ? this.document.customPalettes
        : {};
      if (!Array.isArray(customPalettes[name])) {
        this.showMessageAndRender("Clone not found.");
        return false;
      }
      const ok = this.applyNamedPalette(name);
      if (ok) this.showMessageAndRender(`Clone selected: ${name}`);
      return ok;
    },

    applyNamedPalette(paletteName) {
      if (this.isPalettePresetLocked()) {
        if (typeof this.closePalettePresetPopup === "function") this.closePalettePresetPopup();
        if (typeof this.openPaletteLockPopup === "function") this.openPaletteLockPopup("Palette is locked for this sprite/project");
        if (typeof this.showAlertMessage === "function") this.showAlertMessage("Palette cannot be changed after grid edits start.");
        else this.showMessage("Palette cannot be changed after grid edits start.");
        this.renderAll();
        return false;
      }
      return this.executeWithHistory(`Apply Palette: ${paletteName}`, () => {
        const paletteLibrary = this.getProjectPaletteLibrary();
        let paletteEntries = paletteLibrary && Array.isArray(paletteLibrary[paletteName]) ? paletteLibrary[paletteName] : null;
        if (!paletteEntries && paletteName === "default" && typeof this.document.getDefaultPaletteNamedEntries === "function") {
          paletteEntries = this.document.getDefaultPaletteNamedEntries();
        }
        if (!Array.isArray(paletteEntries)) return false;
        const next = paletteEntries.map((entry) => entry && entry.hex).filter((hex) => typeof hex === "string" && /^#[0-9a-fA-F]{6,8}$/.test(hex));
        if (!next.length) return false;
        this.document.palette = next;
        this.paletteSidebarScroll = 0;
        if (this.document.palette.indexOf(this.document.currentColor) < 0) {
          this.document.currentColor = this.document.palette[0];
        }
        this.document.paletteSelectionRequired = false;
        this.document.palettePresetName = paletteName;
        this.currentPalettePreset = paletteName;
        this.showMessage(`Palette applied: ${paletteName}`);
        return true;
      });
    },

    createCustomPaletteClone() {
      if (!this.currentPalettePreset && !this.document.palettePresetName) {
        this.showMessageAndRender("Select a palette before cloning.");
        return false;
      }
      const baseName = this.currentPalettePreset || this.document.palettePresetName || "Palette";
      const suggested = `Custom ${baseName}`.slice(0, 40);
      const raw = globalThis.prompt ? globalThis.prompt("Custom palette name:", suggested) : suggested;
      const cloneName = String(raw || "").trim();
      if (!cloneName) {
        this.showMessage("Clone canceled.");
        return false;
      }
      const entries = this.getPaletteDisplayEntries().map((entry, index) => ({
        hex: entry.hex,
        name: entry.name && entry.name !== entry.hex ? entry.name : `Color ${index + 1}`
      }));
      if (!entries.length) {
        this.showMessage("Clone unavailable.");
        return false;
      }
      if (!this.document.customPalettes || typeof this.document.customPalettes !== "object") {
        this.document.customPalettes = {};
      }
      this.document.customPalettes[cloneName] = entries;
      this.document.palettePresetName = cloneName;
      this.document.paletteSelectionRequired = false;
      this.currentPalettePreset = cloneName;
      this.showMessage(`Palette clone created: ${cloneName}`);
      this.renderAll();
      return true;
    },

    syncCurrentPalettePreset() {
      const currentPaletteSig = this.getPaletteSignature(this.document.palette || []);
      const defaultPaletteSig = this.getPaletteSignature(
        typeof this.document.getDefaultPalette === "function" ? this.document.getDefaultPalette() : []
      );
      if (currentPaletteSig === defaultPaletteSig) {
        this.currentPalettePreset = this.document && this.document.palettePresetName ? this.document.palettePresetName : "default";
        this.document.palettePresetName = this.currentPalettePreset;
        return;
      }
      const matchedPreset = this.findMatchingPalettePresetName();
      this.currentPalettePreset = matchedPreset || "";
      if (matchedPreset) this.document.palettePresetName = matchedPreset;
    },
  });
}

export { installSpriteEditorPaletteMethods };
