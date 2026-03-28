function installSpriteEditorPaletteMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
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
      const palette = Array.isArray(this.document.palette) ? this.document.palette : [];
      const paletteLibrary = this.getPaletteLibrary();
      const presetEntries = (paletteLibrary && this.currentPalettePreset && Array.isArray(paletteLibrary[this.currentPalettePreset]))
        ? paletteLibrary[this.currentPalettePreset]
        : null;
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
      const currentHex = String(this.document.currentColor || "").toUpperCase();
      let name = "";
      const paletteLibrary = this.getPaletteLibrary();
      if (paletteLibrary && this.currentPalettePreset && Array.isArray(paletteLibrary[this.currentPalettePreset])) {
        const presetEntries = paletteLibrary[this.currentPalettePreset];
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
      this.showMessage(`Palette sort: ${mode[0].toUpperCase()}${mode.slice(1)}.`);
      this.renderAll();
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
      this.showMessage("Color cycled.");
      this.renderAll();
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
      this.showMessage(this.getPaletteScopeLabel());
      this.renderAll();
    },

    setPaletteReplaceScope(scope) {
      this.paletteWorkflow.scope = scope;
      this.showMessage(this.getPaletteScopeLabel());
      this.renderAll();
      return true;
    },

    setPaletteReplaceSource() {
      this.paletteWorkflow.source = this.document.currentColor;
      this.showMessage("Replace source set.");
      this.renderAll();
    },

    setPaletteReplaceTarget() {
      this.paletteWorkflow.target = this.document.currentColor;
      this.showMessage("Replace target set.");
      this.renderAll();
    },

    applyNamedPalette(paletteName) {
      return this.executeWithHistory(`Apply Palette: ${paletteName}`, () => {
        const paletteLibrary = this.getPaletteLibrary();
        if (!paletteLibrary || !Array.isArray(paletteLibrary[paletteName])) return false;
        const next = paletteLibrary[paletteName]
          .map((entry) => entry && entry.hex)
          .filter((hex) => typeof hex === "string" && /^#[0-9a-fA-F]{6,8}$/.test(hex));
        if (!next.length) return false;
        this.document.palette = next;
        this.paletteSidebarScroll = 0;
        if (this.document.palette.indexOf(this.document.currentColor) < 0) {
          this.document.currentColor = this.document.palette[0];
        }
        this.currentPalettePreset = paletteName;
        this.showMessage(`Palette applied: ${paletteName}`);
        return true;
      });
    },
  });
}

export { installSpriteEditorPaletteMethods };
