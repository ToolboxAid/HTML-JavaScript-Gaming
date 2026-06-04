import { openCanvasTransientSurface } from "/src/engine/ui/index.js";

function installSpriteEditorMenuMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    prepareTopMenu(menuId, items) {
      this.closeHelpDetailPopup();
      this.closeAboutPopup();
      this.controlSurface.closeCommandPalette();
      this.controlSurface.toggleTopMenu(menuId, items);
      this.renderAll();
      return true;
    },

    closeSurfaceWithMessage(closeFn, message) {
      closeFn.call(this);
      this.showMessage(message);
      return true;
    },

    handleCloseSurfaceAction() {
      if (this.helpDetailPopup.open) {
        return this.closeSurfaceWithMessage(this.closeHelpDetailPopup, "Help closed.");
      }
      if (this.aboutPopup.open) {
        return this.closeSurfaceWithMessage(this.closeAboutPopup, "About closed.");
      }
      if (this.palettePresetPopup.open) {
        return this.closeSurfaceWithMessage(this.closePalettePresetPopup, "Palette presets closed.");
      }
      if (this.paletteLockPopup && this.paletteLockPopup.open) {
        return this.closeSurfaceWithMessage(this.closePaletteLockPopup, "Palette lock message closed.");
      }
      if (this.replaceGuard.open) {
        return this.closeSurfaceWithMessage(this.closeReplaceGuard, "Replace canceled.");
      }
      if (this.isLayerRenameOpen()) {
        return this.closeSurfaceWithMessage(this.closeLayerRenamePrompt, "Layer rename canceled.");
      }
      if (this.controlSurface.overflowPanelOpen) {
        return this.closeSurfaceWithMessage(this.controlSurface.closeOverflowPanel, "Menu closed.");
      }
      if (this.controlSurface.commandPaletteOpen) {
        return this.closeSurfaceWithMessage(this.controlSurface.closeCommandPalette, "Command palette closed.");
      }
      return false;
    },

    openHelpMenu() {
      if (!this.canOpenTransientSurface()) return false;
      const items = [
        { id: "help-menu-files", text: "Files", action: () => this.openHelpDetailPopup("file") },
        { id: "help-menu-edit", text: "Edit", action: () => this.openHelpDetailPopup("edit") },
        { id: "help-menu-tools", text: "Tools", action: () => this.openHelpDetailPopup("tools") },
        { id: "help-menu-frame", text: "Frame", action: () => this.openHelpDetailPopup("frame") },
        { id: "help-menu-layer", text: "Layer", action: () => this.openHelpDetailPopup("layer") },
        { id: "help-menu-palette", text: "Palette", action: () => this.openHelpDetailPopup("palette") }
      ];
      return this.prepareTopMenu("help", items);
    },

    openFileMenu(itemsOverride = null) {
      if (!this.canOpenTransientSurface()) return false;
      const items = Array.isArray(itemsOverride) ? itemsOverride : [
        { id: "file-new", text: "New Project", action: () => this.newDocument() },
        { id: "file-open", text: "Open Project (Local)", action: () => this.loadLocal() },
        { id: "file-save", text: "Save Project (Local)", action: () => this.saveLocal() },
        { id: "file-import-editor", text: "Import Project JSON", action: () => this.openImport() },
        { id: "file-export-editor", text: "Export Project JSON", action: () => this.exportJson(true) },
        { id: "file-export-sprite", text: "Export Sprite", action: () => this.downloadSpriteSheetPng("all_frames") },
        { id: "file-export-gif", text: "Export GIF", action: () => this.exportGif("all_frames") }
      ];
      return this.prepareTopMenu("file", items);
    },

    openPlaybackRangeMenu() {
      if (!this.canOpenTransientSurface()) return false;
      const range = this.getPlaybackRange();
      const items = [
        { id: "playback-range-set", text: "Set From Selection", action: () => this.setPlaybackRangeFromSelection(), shortcut: "Ctrl+Shift+P" },
        { id: "playback-range-clear", text: "Clear Range", action: () => this.clearPlaybackRange(true) },
        { id: "playback-range-loop", text: range.enabled ? `Loop Range ${range.startFrame + 1}-${range.endFrame + 1}` : "Loop Current Range (Disabled)", action: () => this.togglePlaybackLoop() },
        { id: "playback-range-jump-start", text: "Jump To Range Start", action: () => this.jumpToPlaybackRangeEdge(false) },
        { id: "playback-range-jump-end", text: "Jump To Range End", action: () => this.jumpToPlaybackRangeEdge(true) }
      ];
      return this.prepareTopMenu("playback-range-menu", items);
    },

    openToolsMenu() {
      if (!this.canOpenTransientSurface()) return false;
      const active = this.activeTool;
      const items = [
        { id: "tools-brush", text: `${active === "brush" ? "â€¢ " : ""}Brush`, action: () => this.setTool("brush"), shortcut: "B" },
        { id: "tools-erase", text: `${active === "erase" ? "â€¢ " : ""}Erase`, action: () => this.setTool("erase"), shortcut: "E" },
        { id: "tools-fill", text: `${active === "fill" ? "â€¢ " : ""}Fill`, action: () => this.setTool("fill"), shortcut: "G" },
        { id: "tools-line", text: `${active === "line" ? "â€¢ " : ""}Line`, action: () => this.setTool("line"), shortcut: "L" },
        { id: "tools-rect", text: `${active === "rect" ? "â€¢ " : ""}Rectangle`, action: () => this.setTool("rect"), shortcut: "R" },
        { id: "tools-fillrect", text: `${active === "fillrect" ? "â€¢ " : ""}Filled Rectangle`, action: () => this.setTool("fillrect"), shortcut: "Shift+R" },
        { id: "tools-eyedropper", text: `${active === "eyedropper" ? "â€¢ " : ""}Eyedropper`, action: () => this.setTool("eyedropper"), shortcut: "I" },
        { id: "tools-select", text: `${active === "select" ? "â€¢ " : ""}Select`, action: () => this.setTool("select"), shortcut: "S" },
        { id: "tools-reference", text: `${active === "reference" ? "â€¢ " : ""}Reference Image`, action: () => this.setTool("reference") }
      ];
      return this.prepareTopMenu("tools", items);
    },

    openEditMenu() {
      if (!this.canOpenTransientSurface()) return false;
      const items = [
        { id: "edit-menu-undo", text: "Undo", action: () => this.undoHistory(), shortcut: "Ctrl+Z" },
        { id: "edit-menu-redo", text: "Redo", action: () => this.redoHistory(), shortcut: "Ctrl+Y" },
        { id: "edit-menu-copy", text: "Copy", action: () => this.handleSelectionAction("sel-copy"), shortcut: "Ctrl+C" },
        { id: "edit-menu-cut", text: "Cut", action: () => this.handleSelectionAction("sel-cut"), shortcut: "Ctrl+X" },
        { id: "edit-menu-paste", text: "Paste", action: () => this.handleSelectionAction("sel-paste"), shortcut: "Ctrl+V" }
      ];
      return this.prepareTopMenu("edit", items);
    },

    openFrameMenu() {
      if (!this.canOpenTransientSurface()) return false;
      const range = this.getFrameRangeSelection();
      const items = [
        { id: "frame-menu-add", text: "Add Frame", action: () => this.addFrame(), shortcut: "N" },
        { id: "frame-menu-dup", text: "Duplicate Frame", action: () => this.duplicateFrame(), shortcut: "Ctrl+D" },
        { id: "frame-menu-delete", text: "Delete Frame", action: () => this.deleteFrame(), shortcut: "Delete" },
        { id: "frame-menu-copy", text: "Copy Frame", action: () => this.copyFrame() },
        { id: "frame-menu-paste", text: "Paste Frame", action: () => this.pasteFrame() },
        { id: "frame-menu-range-dup", text: `Duplicate Range${range.explicit ? ` (${range.start + 1}-${range.end + 1})` : ""}`, action: () => this.duplicateSelectedFrameRange(), shortcut: "Ctrl+D" },
        { id: "frame-menu-range-delete", text: `Delete Range${range.explicit ? ` (${range.start + 1}-${range.end + 1})` : ""}`, action: () => this.deleteSelectedFrameRange() },
        { id: "frame-menu-range-shift-left", text: "Shift Range Left", action: () => this.shiftSelectedFrameRange(-1) },
        { id: "frame-menu-range-shift-right", text: "Shift Range Right", action: () => this.shiftSelectedFrameRange(1) },
        { id: "frame-menu-range-clear", text: "Clear Range Selection", action: () => this.clearFrameRangeSelection(true) },
        { id: "frame-menu-playback-order", text: "Edit Playback Order", action: () => this.openPlaybackOrderEditor() },
        { id: "frame-menu-playback", text: "Playback Range...", action: () => this.openPlaybackRangeMenu() }
      ];
      return this.prepareTopMenu("frame", items);
    },

    openLayerMenu() {
      if (!this.canOpenTransientSurface()) return false;
      const layer = this.document.activeLayer;
      const layerName = layer && layer.name ? layer.name : `Layer ${this.document.activeFrame.activeLayerIndex + 1}`;
      const items = [
        { id: "layer-menu-add", text: "Add Layer", action: () => this.addLayer() },
        { id: "layer-menu-dup", text: "Duplicate Layer", action: () => this.duplicateLayer() },
        { id: "layer-menu-delete", text: "Delete Layer", action: () => this.deleteLayer() },
        { id: "layer-menu-rename", text: `Rename ${layerName}`, action: () => this.openLayerRenamePrompt(), shortcut: "Ctrl+Shift+R" },
        { id: "layer-menu-up", text: "Move Up", action: () => this.moveLayerUp(), shortcut: "Alt+ArrowUp" },
        { id: "layer-menu-down", text: "Move Down", action: () => this.moveLayerDown(), shortcut: "Alt+ArrowDown" },
        { id: "layer-menu-visible", text: layer && layer.visible !== false ? "Hide Layer" : "Show Layer", action: () => this.toggleLayerVisibility() },
        { id: "layer-menu-lock", text: layer && layer.locked ? "Unlock Layer" : "Lock Layer", action: () => this.toggleLayerLock() },
        { id: "layer-menu-merge", text: "Merge Down", action: () => this.mergeLayerDown() },
        { id: "layer-menu-flatten", text: "Flatten Frame", action: () => this.requestFlattenFrame() }
      ];
      return this.prepareTopMenu("layer", items);
    },

    openCommandPalette() {
      if (!this.canOpenTransientSurface()) return false;
      this.closeHelpDetailPopup();
      this.closeAboutPopup();
      this.controlSurface.closeOverflowPanel();
      this.commandPaletteCommands = this.createCommandPaletteCommands();
      this.controlSurface.openCommandPalette(this.commandPaletteCommands);
      this.showMessage("Command palette opened.");
      return true;
    },

    openPalettePresetsMenu() {
      if (typeof this.isPalettePresetLocked === "function" && this.isPalettePresetLocked()) {
        if (typeof this.openPaletteLockPopup === "function") this.openPaletteLockPopup("Palette is locked for this sprite/project");
        if (typeof this.showAlertMessage === "function") this.showAlertMessage("Palette cannot be changed after grid edits start.");
        else this.showMessage("Palette cannot be changed after  edits start.");
        return true;
      }
      return openCanvasTransientSurface({
        canOpen: () => this.canOpenTransientSurface(),
        closeOthers: () => this.closeMenuLikeSurfaces(),
        open: () => {
          this.palettePresetPopup.open = true;
          this.palettePresetPopup.rowRects = [];
        },
        showMessage: (message) => this.showMessage(message),
        render: () => this.renderAll(),
        message: "Palette presets: choose a preset to apply."
      });
    },

    openPaletteWorkflowMenu() {
      if (!this.canOpenTransientSurface()) return false;
      const canClone = !!(this.currentPalettePreset || this.document.palettePresetName);
      const rawScope = String(this.paletteWorkflow && this.paletteWorkflow.scope ? this.paletteWorkflow.scope : "active_layer")
        .toLowerCase()
        .replace(/\s+/g, "_");
      const currentScope = ["active_layer", "current_frame", "selected_range"].includes(rawScope) ? rawScope : "active_layer";
      const sourceColor = this.paletteWorkflow && this.paletteWorkflow.source ? String(this.paletteWorkflow.source) : "";
      const targetColor = this.paletteWorkflow && this.paletteWorkflow.target ? String(this.paletteWorkflow.target) : "";
      const scopeLabel = (scopeId, label) => `Set Scope ${label}${currentScope === scopeId ? " âœ“" : ""}`;
      const items = [
        { id: "palette-menu-presets", text: "Palettes...", action: () => this.openPalettePresetsMenu() },
        { id: "palette-menu-clone", text: canClone ? "Clone" : "Clone (select preset first)", action: () => this.createCustomPaletteClone() },
        { id: "palette-menu-clones", text: "Choose Clone...", action: () => this.openPaletteCloneMenu() },
        { id: "palette-menu-divider-workflow", divider: true },
        { id: "palette-menu-src", text: "Set Src From Current", action: () => this.setPaletteReplaceSource(), menuSwatchColor: sourceColor },
        { id: "palette-menu-dst", text: "Set Dst From Current", action: () => this.setPaletteReplaceTarget(), menuSwatchColor: targetColor },
        { id: "palette-menu-scope-layer", text: scopeLabel("active_layer", "Active Layer"), action: () => this.setPaletteReplaceScope("active_layer") },
        { id: "palette-menu-scope-frame", text: scopeLabel("current_frame", "Current Frame"), action: () => this.setPaletteReplaceScope("current_frame") },
        { id: "palette-menu-scope-range", text: scopeLabel("selected_range", "Selected Range"), action: () => this.setPaletteReplaceScope("selected_range") },
        { id: "palette-menu-replace", text: "Replace Colors", action: () => this.replacePaletteColor() }
      ];
      return this.prepareTopMenu("palette", items);
    },

    openPaletteCloneMenu() {
      if (!this.canOpenTransientSurface()) return false;
      const clones = this.getCustomPaletteNames();
      if (!clones.length) {
        this.showMessageAndRender("No custom palette clones yet.");
        return false;
      }
      const items = clones.map((name) => ({
        id: `palette-clone-${name}`,
        text: `${this.currentPalettePreset === name ? "â€¢ " : ""}${name}`,
        action: () => this.selectCustomPaletteClone(name)
      }));
      return this.prepareTopMenu("palette", items);
    },

    openExportMenu() {
      if (!this.canOpenTransientSurface()) return false;
      const items = [
        { id: "export-menu-sheet-png", text: "Export Sprite Sheet", action: () => this.downloadSpriteSheetPng(this.exportMode) },
        { id: "export-menu-animation-json", text: "Export Animation JSON", action: () => this.exportAnimationJson(this.exportMode) },
        { id: "export-menu-gif", text: "Export GIF", action: () => this.exportGif(this.exportMode) },
        { id: "export-menu-package-json", text: "Export Package", action: () => this.exportPackageJson(this.exportMode) },
        { id: "export-menu-current", text: `Mode: ${this.exportMode === "current_frame" ? "â€¢ " : ""}Current Frame`, action: () => this.setExportMode("current_frame") },
        { id: "export-menu-all", text: `Mode: ${this.exportMode === "all_frames" ? "â€¢ " : ""}All Frames`, action: () => this.setExportMode("all_frames") },
        { id: "export-menu-range", text: `Mode: ${this.exportMode === "selected_range" ? "â€¢ " : ""}Selected Range`, action: () => this.setExportMode("selected_range") }
      ];
      return this.prepareTopMenu("file-export", items);
    }
  });
}

export { installSpriteEditorMenuMethods };
