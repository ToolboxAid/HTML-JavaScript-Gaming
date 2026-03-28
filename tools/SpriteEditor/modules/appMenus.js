function installSpriteEditorMenuMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    handleCloseSurfaceAction() {
      if (this.helpDetailPopup.open) {
        this.closeHelpDetailPopup();
        this.showMessage("Help closed.");
        return true;
      }
      if (this.aboutPopup.open) {
        this.closeAboutPopup();
        this.showMessage("About closed.");
        return true;
      }
      if (this.palettePresetPopup.open) {
        this.closePalettePresetPopup();
        this.showMessage("Palette presets closed.");
        return true;
      }
      if (this.replaceGuard.open) {
        this.closeReplaceGuard();
        this.showMessage("Replace canceled.");
        return true;
      }
      if (this.isLayerRenameOpen()) {
        this.closeLayerRenamePrompt();
        this.showMessage("Layer rename canceled.");
        return true;
      }
      if (this.controlSurface.overflowPanelOpen) {
        this.controlSurface.closeOverflowPanel();
        this.showMessage("Menu closed.");
        return true;
      }
      if (this.controlSurface.commandPaletteOpen) {
        this.controlSurface.closeCommandPalette();
        this.showMessage("Command palette closed.");
        return true;
      }
      return false;
    },

    openHelpMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.closeAboutPopup();
      this.closeHelpDetailPopup();
      this.controlSurface.closeCommandPalette();
      const items = [
        { id: "help-menu-files", text: "Files", action: () => this.openHelpDetailPopup("file") },
        { id: "help-menu-edit", text: "Edit", action: () => this.openHelpDetailPopup("edit") },
        { id: "help-menu-tools", text: "Tools", action: () => this.openHelpDetailPopup("tools") },
        { id: "help-menu-frame", text: "Frame", action: () => this.openHelpDetailPopup("frame") },
        { id: "help-menu-layer", text: "Layer", action: () => this.openHelpDetailPopup("layer") },
        { id: "help-menu-palette", text: "Palette", action: () => this.openHelpDetailPopup("palette") }
      ];
      this.controlSurface.toggleTopMenu("help", items);
      this.renderAll();
      return true;
    },

    openFileMenu(itemsOverride = null) {
      if (!this.canOpenTransientSurface()) return false;
      this.closeHelpDetailPopup();
      this.closeAboutPopup();
      this.controlSurface.closeCommandPalette();
      const items = Array.isArray(itemsOverride) ? itemsOverride : [
        { id: "file-new", text: "New", action: () => this.newDocument() },
        { id: "file-open", text: "Open", action: () => this.loadLocal() },
        { id: "file-save", text: "Save", action: () => this.saveLocal() },
        { id: "file-import-editor", text: "Import Editor JSON", action: () => this.openImport() },
        { id: "file-export-editor", text: "Export Editor JSON", action: () => this.exportJson(true) },
        { id: "file-export-menu", text: "Export", action: () => this.openExportMenu() }
      ];
      this.controlSurface.toggleTopMenu("file", items);
      this.renderAll();
      return true;
    },

    openPlaybackRangeMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.closeHelpDetailPopup();
      this.closeAboutPopup();
      this.controlSurface.closeCommandPalette();
      const range = this.getPlaybackRange();
      const items = [
        { id: "playback-range-set", text: "Set From Selection", action: () => this.setPlaybackRangeFromSelection(), shortcut: "Ctrl+Shift+P" },
        { id: "playback-range-clear", text: "Clear Range", action: () => this.clearPlaybackRange(true) },
        { id: "playback-range-loop", text: range.enabled ? `Loop Range ${range.startFrame + 1}-${range.endFrame + 1}` : "Loop Current Range (Disabled)", action: () => this.togglePlaybackLoop() },
        { id: "playback-range-jump-start", text: "Jump To Range Start", action: () => this.jumpToPlaybackRangeEdge(false) },
        { id: "playback-range-jump-end", text: "Jump To Range End", action: () => this.jumpToPlaybackRangeEdge(true) }
      ];
      this.controlSurface.toggleTopMenu("playback-range-menu", items);
      this.renderAll();
      return true;
    },

    openToolsMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.closeHelpDetailPopup();
      this.closeAboutPopup();
      this.controlSurface.closeCommandPalette();
      const active = this.activeTool;
      const items = [
        { id: "tools-brush", text: `${active === "brush" ? "• " : ""}Brush`, action: () => this.setTool("brush"), shortcut: "B" },
        { id: "tools-erase", text: `${active === "erase" ? "• " : ""}Erase`, action: () => this.setTool("erase"), shortcut: "E" },
        { id: "tools-fill", text: `${active === "fill" ? "• " : ""}Fill`, action: () => this.setTool("fill"), shortcut: "G" },
        { id: "tools-line", text: `${active === "line" ? "• " : ""}Line`, action: () => this.setTool("line"), shortcut: "L" },
        { id: "tools-rect", text: `${active === "rect" ? "• " : ""}Rectangle`, action: () => this.setTool("rect"), shortcut: "R" },
        { id: "tools-fillrect", text: `${active === "fillrect" ? "• " : ""}Filled Rectangle`, action: () => this.setTool("fillrect"), shortcut: "Shift+R" },
        { id: "tools-eyedropper", text: `${active === "eyedropper" ? "• " : ""}Eyedropper`, action: () => this.setTool("eyedropper"), shortcut: "I" },
        { id: "tools-select", text: `${active === "select" ? "• " : ""}Select`, action: () => this.setTool("select"), shortcut: "S" }
      ];
      this.controlSurface.toggleTopMenu("tools", items);
      this.renderAll();
      return true;
    },

    openEditMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.closeHelpDetailPopup();
      this.closeAboutPopup();
      this.controlSurface.closeCommandPalette();
      const items = [
        { id: "edit-menu-undo", text: "Undo", action: () => this.undoHistory(), shortcut: "Ctrl+Z" },
        { id: "edit-menu-redo", text: "Redo", action: () => this.redoHistory(), shortcut: "Ctrl+Y" },
        { id: "edit-menu-copy", text: "Copy", action: () => this.handleSelectionAction("sel-copy"), shortcut: "Ctrl+C" },
        { id: "edit-menu-cut", text: "Cut", action: () => this.handleSelectionAction("sel-cut"), shortcut: "Ctrl+X" },
        { id: "edit-menu-paste", text: "Paste", action: () => this.handleSelectionAction("sel-paste"), shortcut: "Ctrl+V" },
        { id: "edit-menu-clear-selection", text: "Clear Selection", action: () => this.clearSelection(), shortcut: "Esc" },
        { id: "edit-menu-dup-frame", text: "Duplicate Frame", action: () => this.duplicateFrame(), shortcut: "Ctrl+D" },
        { id: "edit-menu-delete-frame", text: "Delete Frame", action: () => this.deleteFrame(), shortcut: "Delete" }
      ];
      this.controlSurface.toggleTopMenu("edit", items);
      this.renderAll();
      return true;
    },

    openFrameMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.closeHelpDetailPopup();
      this.closeAboutPopup();
      this.controlSurface.closeCommandPalette();
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
        { id: "frame-menu-playback", text: "Playback Range...", action: () => this.openPlaybackRangeMenu() }
      ];
      this.controlSurface.toggleTopMenu("frame", items);
      this.renderAll();
      return true;
    },

    openLayerMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.closeHelpDetailPopup();
      this.closeAboutPopup();
      this.controlSurface.closeCommandPalette();
      const layer = this.document.activeLayer;
      const layerName = layer && layer.name ? layer.name : `Layer ${this.document.activeFrame.activeLayerIndex + 1}`;
      const items = [
        { id: "layer-menu-add", text: "Add Layer", action: () => this.addLayer() },
        { id: "layer-menu-dup", text: "Duplicate Layer", action: () => this.duplicateLayer() },
        { id: "layer-menu-delete", text: "Delete Layer", action: () => this.deleteLayer() },
        { id: "layer-menu-rename", text: `Rename ${layerName}`, action: () => this.openLayerRenamePrompt(), shortcut: "Ctrl+Shift+R" },
        { id: "layer-menu-up", text: "Move Up", action: () => this.moveLayerUp() },
        { id: "layer-menu-down", text: "Move Down", action: () => this.moveLayerDown() },
        { id: "layer-menu-visible", text: layer && layer.visible !== false ? "Hide Layer" : "Show Layer", action: () => this.toggleLayerVisibility() },
        { id: "layer-menu-lock", text: layer && layer.locked ? "Unlock Layer" : "Lock Layer", action: () => this.toggleLayerLock() },
        { id: "layer-menu-merge", text: "Merge Down", action: () => this.mergeLayerDown() },
        { id: "layer-menu-flatten", text: "Flatten Frame", action: () => this.requestFlattenFrame() }
      ];
      this.controlSurface.toggleTopMenu("layer", items);
      this.renderAll();
      return true;
    },

    openLayerActionsMenu() {
      this.openLayerMenu();
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
      if (!this.canOpenTransientSurface()) return false;
      this.closeMenuLikeSurfaces();
      this.palettePresetPopup.open = true;
      this.palettePresetPopup.rowRects = [];
      this.showMessage("Palette presets: choose a preset to apply.");
      this.renderAll();
      return true;
    },

    openPaletteWorkflowMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.closeHelpDetailPopup();
      this.closeAboutPopup();
      this.controlSurface.closeCommandPalette();
      const items = [
        { id: "palette-menu-presets", text: "Palettes...", action: () => this.openPalettePresetsMenu() },
        { id: "palette-menu-sort-name", text: "Sort By Name", action: () => this.setPaletteSortMode("name") },
        { id: "palette-menu-sort-hue", text: "Sort By Hue", action: () => this.setPaletteSortMode("hue") },
        { id: "palette-menu-sort-saturation", text: "Sort By Saturation", action: () => this.setPaletteSortMode("saturation") },
        { id: "palette-menu-sort-lightness", text: "Sort By Lightness", action: () => this.setPaletteSortMode("lightness") },
        { id: "palette-menu-src", text: "Set Src From Current", action: () => this.setPaletteReplaceSource() },
        { id: "palette-menu-dst", text: "Set Dst From Current", action: () => this.setPaletteReplaceTarget() },
        { id: "palette-menu-scope-layer", text: "Scope Active Layer", action: () => this.setPaletteReplaceScope("active_layer") },
        { id: "palette-menu-scope-frame", text: "Scope Current Frame", action: () => this.setPaletteReplaceScope("current_frame") },
        { id: "palette-menu-scope-range", text: "Scope Selected Range", action: () => this.setPaletteReplaceScope("selected_range") }
      ];
      this.controlSurface.toggleTopMenu("palette", items);
      this.renderAll();
      return true;
    },

    openExportMenu() {
      if (!this.canOpenTransientSurface()) return false;
      this.closeHelpDetailPopup();
      this.closeAboutPopup();
      this.controlSurface.closeCommandPalette();
      const items = [
        { id: "export-menu-sheet-png", text: "Sprite Sheet PNG", action: () => this.downloadSpriteSheetPng(this.exportMode) },
        { id: "export-menu-animation-json", text: "Animation JSON", action: () => this.exportAnimationJson(this.exportMode) },
        { id: "export-menu-package-json", text: "Export Package", action: () => this.exportPackageJson(this.exportMode) },
        { id: "export-menu-current", text: `Mode: ${this.exportMode === "current_frame" ? "• " : ""}Current Frame`, action: () => this.setExportMode("current_frame") },
        { id: "export-menu-all", text: `Mode: ${this.exportMode === "all_frames" ? "• " : ""}All Frames`, action: () => this.setExportMode("all_frames") },
        { id: "export-menu-range", text: `Mode: ${this.exportMode === "selected_range" ? "• " : ""}Selected Range`, action: () => this.setExportMode("selected_range") }
      ];
      this.controlSurface.toggleTopMenu("file-export", items);
      this.renderAll();
      return true;
    }
  });
}

export { installSpriteEditorMenuMethods };
