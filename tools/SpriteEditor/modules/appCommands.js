function installSpriteEditorCommandMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    createKeybindingMap() {
      return {
        "b": "tool.brush",
        "e": "tool.erase",
        "f": "tool.fill",
        "l": "tool.line",
        "r": "tool.rect",
        "g": "tool.fillrect",
        "i": "tool.eyedropper",
        "s": "tool.select",
        "1": "brush.size_1",
        "2": "brush.size_2",
        "3": "brush.size_3",
        "4": "brush.size_4",
        "5": "brush.size_5",
        "6": "brush.size_6",
        "7": "brush.size_7",
        "8": "brush.size_8",
        "9": "brush.size_9",
        "p": "system.playback",
        " ": "system.playback",
        "=": "view.zoomIn",
        "+": "view.zoomIn",
        "-": "view.zoomOut",
        "0": "view.zoomReset",
        "x": "view.pixelToggle",
        "o": "view.onionPrevToggle",
        "shift+o": "view.onionNextToggle",
        "[": "frame.prev",
        "]": "frame.next",
        "ctrl+d": "frame.duplicate",
        "ctrl+c": "selection.copy",
        "ctrl+x": "selection.cut",
        "ctrl+v": "selection.paste",
        "ctrl+z": "system.undo",
        "ctrl+y": "system.redo",
        "ctrl+shift+z": "system.redo",
        "ctrl+p": "system.commandPalette",
        "ctrl+shift+r": "layer.rename",
        "alt+arrowup": "layer.moveUp",
        "alt+arrowdown": "layer.moveDown",
        "q": "brush.toggleShape",
        ",": "brush.sizeDown",
        ".": "brush.sizeUp",
        "arrowup": "selection.nudge_up",
        "arrowdown": "selection.nudge_down",
        "arrowleft": "selection.nudge_left",
        "arrowright": "selection.nudge_right",
        "shift+arrowup": "selection.nudge_up_big",
        "shift+arrowdown": "selection.nudge_down_big",
        "shift+arrowleft": "selection.nudge_left_big",
        "shift+arrowright": "selection.nudge_right_big",
        "tab": "layer.next",
        "shift+tab": "layer.prev",
        "v": "layer.toggleVisibility",
        "k": "layer.toggleLock",
        "m": "view.blendPreviewToggle",
        "shift+m": "system.fullscreen",
        "shift+[": "palette.prevColor",
        "shift+]": "palette.nextColor",
        "shift+p": "playback.setRangeFromSelection",
        "escape": "system.closeSurface",
        "delete": "system.delete",
        "backspace": "system.delete"
      };
    },

    getShortcutHintForAction(action) {
      const keys = Object.keys(this.keybindings);
      for (let i = 0; i < keys.length; i += 1) {
        if (this.keybindings[keys[i]] === action) return keys[i].replace(/arrow/g, "Arrow ").replace(/\bctrl\b/g, "Ctrl").replace(/\bshift\b/g, "Shift").replace(/\balt\b/g, "Alt");
      }
      return "";
    },

    normalizeCommandText(input) {
      const raw = String(input || "").toLowerCase().trim();
      const noPunct = raw.replace(/[^\w\s]/g, " ");
      const collapsed = noPunct.replace(/\s+/g, " ").trim();
      const filler = new Set(["to", "the", "tool"]);
      const tokens = collapsed.split(" ").filter((t) => t && !filler.has(t));
      return tokens.join(" ");
    },

    fuzzyMatchScore(text, query) {
      const t = text.toLowerCase();
      const q = query.toLowerCase();
      if (!q) return 0;
      const prefix = t.indexOf(q) === 0;
      const substringIndex = t.indexOf(q);
      let qi = 0;
      let lastMatch = -1;
      let gaps = 0;
      for (let i = 0; i < t.length && qi < q.length; i += 1) {
        if (t[i] === q[qi]) {
          if (lastMatch >= 0 && i !== lastMatch + 1) gaps += (i - lastMatch - 1);
          lastMatch = i;
          qi += 1;
        }
      }
      const fuzzyMatched = qi === q.length;
      if (!fuzzyMatched && substringIndex < 0) return -1;
      let score = 0;
      if (prefix) score += 1200;
      if (substringIndex >= 0) score += Math.max(0, 600 - substringIndex * 8);
      if (fuzzyMatched) score += Math.max(0, 420 - gaps * 7);
      score += Math.max(0, 120 - (t.length - q.length));
      return score;
    },

    scoreCommandItem(item, normalizedQuery) {
      if (!normalizedQuery) return 0;
      const label = this.normalizeCommandText(item.label || "");
      const aliases = Array.isArray(item.aliases) ? item.aliases.map((a) => this.normalizeCommandText(a)) : [];
      const keywords = Array.isArray(item.keywords) ? item.keywords.map((k) => this.normalizeCommandText(k)) : [];
      const shortcut = this.normalizeCommandText(item.shortcut || "");
      if (label.indexOf(normalizedQuery) === 0) return 2400;
      for (let i = 0; i < aliases.length; i += 1) {
        if (aliases[i] === normalizedQuery) return 2200;
        if (aliases[i].indexOf(normalizedQuery) === 0) return 2000;
      }
      if (label.indexOf(normalizedQuery) >= 0) return 1600 - label.indexOf(normalizedQuery) * 5;
      for (let i = 0; i < aliases.length; i += 1) {
        const pos = aliases[i].indexOf(normalizedQuery);
        if (pos >= 0) return 1450 - pos * 4;
      }
      for (let i = 0; i < keywords.length; i += 1) {
        if (keywords[i].indexOf(normalizedQuery) >= 0) return 1200;
      }
      const hay = `${label} ${aliases.join(" ")} ${keywords.join(" ")} ${shortcut}`;
      return this.fuzzyMatchScore(hay, normalizedQuery);
    },

    getRankedCommandPaletteItems(items, query) {
      const q = this.normalizeCommandText(query);
      const recentIndex = new Map();
      this.recentActions.forEach((id, i) => recentIndex.set(id, i));
      const ranked = items.map((item) => {
        const score = q ? this.scoreCommandItem(item, q) : 0;
        const recency = recentIndex.has(item.id) ? Math.max(0, 500 - recentIndex.get(item.id) * 20) : 0;
        const favoriteBias = this.favoriteActions.indexOf(item.id) >= 0 ? (q ? 280 : 600) : 0;
        const total = (q ? score : 200) + recency + favoriteBias;
        return { ...item, favorite: this.favoriteActions.indexOf(item.id) >= 0, score: total, _match: q ? score >= 0 : true, _recent: recency };
      }).filter((item) => item._match);
      ranked.sort((a, b) => (b.score - a.score) || String(a.label).localeCompare(String(b.label)));
      return ranked;
    },

    dispatchCommandAction(actionId) {
      if (actionId.indexOf("macro:") === 0) {
        const ok = this.executeMacroCommand(actionId, new Set());
        if (ok) this.trackRecentAction(actionId);
        return ok;
      }
      if (actionId.indexOf("palette.apply:") === 0) {
        const ok = this.applyNamedPalette(actionId.slice("palette.apply:".length));
        if (ok) this.trackRecentAction(actionId);
        return ok;
      }
      const ok = this.dispatchKeybinding(actionId);
      if (ok) this.trackRecentAction(actionId);
      return ok;
    },

    dispatchKeybinding(action) {
      if (action === "system.commandPalette") {
        if (this.controlSurface.commandPaletteOpen) {
          this.controlSurface.closeCommandPalette();
          this.showMessage("Command palette closed.");
        } else {
          this.openCommandPalette();
        }
        return true;
      }
      if (action === "system.closeSurface") {
        return this.handleCloseSurfaceAction();
      }
      if (action === "system.saveLocal") { this.saveLocal(); return true; }
      if (action === "system.loadLocal") { this.loadLocal(); return true; }
      if (action === "system.importJson") { this.openImport(); return true; }
      if (action === "system.undo") return this.undoHistory();
      if (action === "system.redo") return this.redoHistory();
      if (action === "system.cancelInteraction") {
        const canceled = this.cancelActiveInteraction();
        if (canceled) {
          this.showMessage(canceled);
          return true;
        }
        return false;
      }
      if (action === "tool.brush") { this.setTool("brush"); return true; }
      if (action === "tool.erase") { this.setTool("erase"); return true; }
      if (action === "tool.fill") { this.setTool("fill"); return true; }
      if (action === "tool.line") { this.setTool("line"); return true; }
      if (action === "tool.rect") { this.setTool("rect"); return true; }
      if (action === "tool.fillrect") { this.setTool("fillrect"); return true; }
      if (action === "tool.eyedropper") { this.setTool("eyedropper"); return true; }
      if (action === "tool.select") { this.setTool("select"); return true; }
      if (action === "brush.sizeUp") { this.adjustBrushSize(1); return true; }
      if (action === "brush.sizeDown") { this.adjustBrushSize(-1); return true; }
      if (action === "brush.toggleShape") { this.toggleBrushShape(); return true; }
      if (action === "palette.prevColor") return this.prevColor();
      if (action === "palette.nextColor") return this.nextColor();
      if (action === "palette.replaceColor") return this.replacePaletteColor();
      if (action === "palette.scopeActiveLayer") return this.setPaletteReplaceScope("active_layer");
      if (action === "palette.scopeCurrentFrame") return this.setPaletteReplaceScope("current_frame");
      if (action === "palette.scopeSelectedRange") return this.setPaletteReplaceScope("selected_range");
      if (action.indexOf("brush.size_") === 0) {
        const next = Number(action.slice("brush.size_".length));
        if (!Number.isFinite(next)) return false;
        this.setBrushSize(next);
        return true;
      }
      if (action === "view.zoomIn") { this.adjustZoom(0.25); return true; }
      if (action === "view.zoomOut") { this.adjustZoom(-0.25); return true; }
      if (action === "view.zoomReset") { this.resetZoom(); return true; }
      if (action === "view.pixelToggle") { this.togglePixelPerfect(); return true; }
      if (action === "view.onionPrevToggle") { this.toggleOnionPrevious(); return true; }
      if (action === "view.onionNextToggle") { this.toggleOnionNext(); return true; }
      if (action === "frame.prev") { this.selectFrame(this.document.activeFrameIndex - 1); return true; }
      if (action === "frame.next") { this.selectFrame(this.document.activeFrameIndex + 1); return true; }
      if (action === "frame.duplicate") { this.duplicateFrame(); return true; }
      if (action === "frame.duplicateRange") { this.duplicateSelectedFrameRange(); return true; }
      if (action === "frame.deleteRange") { this.deleteSelectedFrameRange(); return true; }
      if (action === "frame.shiftRangeLeft") { this.shiftSelectedFrameRange(-1); return true; }
      if (action === "frame.shiftRangeRight") { this.shiftSelectedFrameRange(1); return true; }
      if (action === "frame.clearRangeSelection") { this.clearFrameRangeSelection(true); return true; }
      if (action === "selection.copy") {
        if (this.document.selection) { this.handleSelectionAction("sel-copy"); return true; }
        return false;
      }
      if (action === "selection.cut") {
        if (this.document.selection) { this.handleSelectionAction("sel-cut"); return true; }
        return false;
      }
      if (action === "selection.paste") {
        if (this.document.selectionClipboard) { this.handleSelectionAction("sel-paste"); return true; }
        return false;
      }
      if (action === "selection.nudge_up") return this.nudgeSelection(0, -1, "Up");
      if (action === "selection.nudge_down") return this.nudgeSelection(0, 1, "Down");
      if (action === "selection.nudge_left") return this.nudgeSelection(-1, 0, "Left");
      if (action === "selection.nudge_right") return this.nudgeSelection(1, 0, "Right");
      if (action === "selection.nudge_up_big") return this.nudgeSelection(0, -8, "Up x8");
      if (action === "selection.nudge_down_big") return this.nudgeSelection(0, 8, "Down x8");
      if (action === "selection.nudge_left_big") return this.nudgeSelection(-8, 0, "Left x8");
      if (action === "selection.nudge_right_big") return this.nudgeSelection(8, 0, "Right x8");
      if (action === "layer.add") { this.addLayer(); return true; }
      if (action === "layer.duplicate") { this.duplicateLayer(); return true; }
      if (action === "layer.delete") { this.deleteLayer(); return true; }
      if (action === "layer.toggleVisibility") { this.toggleLayerVisibility(); return true; }
      if (action === "layer.next") { this.selectNextLayer(); return true; }
      if (action === "layer.prev") { this.selectPrevLayer(); return true; }
      if (action === "layer.moveUp") { this.moveLayerUp(); return true; }
      if (action === "layer.moveDown") { this.moveLayerDown(); return true; }
      if (action === "layer.rename") { this.openLayerRenamePrompt(); return true; }
      if (action === "layer.toggleLock") { this.toggleLayerLock(); return true; }
      if (action === "layer.opacityUp") { this.adjustLayerOpacity(0.1); return true; }
      if (action === "layer.opacityDown") { this.adjustLayerOpacity(-0.1); return true; }
      if (action === "layer.opacityReset") { this.resetLayerOpacity(); return true; }
      if (action === "layer.mergeDown") { this.mergeLayerDown(); return true; }
      if (action === "layer.flattenFrame") { this.requestFlattenFrame(); return true; }
      if (action === "view.blendPreviewToggle") { this.toggleBlendPreview(); return true; }
      if (action === "system.fullscreen") { this.toggleFullscreen(); return true; }
      if (action === "system.playback") { this.togglePlayback(); return true; }
      if (action === "system.playbackPlay") { this.togglePlayback(true); return true; }
      if (action === "system.playbackPause") { this.togglePlayback(false); return true; }
      if (action === "system.playbackStop") { this.stopPlayback(); return true; }
      if (action === "system.playbackLoopToggle") { this.togglePlaybackLoop(); return true; }
      if (action === "system.playbackFpsUp") { this.adjustPlaybackFps(1); return true; }
      if (action === "system.playbackFpsDown") { this.adjustPlaybackFps(-1); return true; }
      if (action === "playback.setRangeFromSelection") return this.setPlaybackRangeFromSelection();
      if (action === "playback.clearRange") {
        const hadRange = this.getPlaybackRange().enabled;
        if (!hadRange) {
          this.showMessage("Playback range already clear.");
          return false;
        }
        this.clearPlaybackRange(true);
        this.renderAll();
        return true;
      }
      if (action === "playback.toggleRangeLoop") {
        const range = this.getPlaybackRange();
        if (range.enabled) {
          this.clearPlaybackRange(true);
        } else {
          if (!this.setPlaybackRangeFromSelection()) return false;
        }
        this.renderAll();
        return true;
      }
      if (action === "playback.jumpRangeStart") return this.jumpToPlaybackRangeEdge(false);
      if (action === "playback.jumpRangeEnd") return this.jumpToPlaybackRangeEdge(true);
      if (action === "export.spriteSheetPng") return this.downloadSpriteSheetPng();
      if (action === "export.animationJson") return this.exportAnimationJson();
      if (action === "export.package") return this.exportPackageJson();
      if (action === "export.modeCurrentFrame") return this.setExportMode("current_frame");
      if (action === "export.modeAllFrames") return this.setExportMode("all_frames");
      if (action === "export.modeSelectedRange") return this.setExportMode("selected_range");
      if (action === "system.delete") {
        if (this.document.selection) { this.handleSelectionAction("sel-cut"); return true; }
        if (!this.canEditActiveLayer(true)) return false;
        return this.executeWithHistory("Clear Frame", () => {
          this.document.clearFrame();
          this.showMessage("Frame cleared.");
          return true;
        });
      }
      return false;
    },

    executeMacroCommand(macroId, activeSet) {
      const macro = this.macroDefinitions.find((m) => m.id === macroId);
      if (!macro) {
        this.showMessage("Macro missing.");
        return false;
      }
      if (activeSet.has(macroId)) {
        this.showMessage("Macro loop blocked.");
        return false;
      }
      const macroBefore = this.captureHistoryState();
      activeSet.add(macroId);
      this.historySuppressedDepth += 1;
      let successCount = 0;
      for (let i = 0; i < macro.actions.length; i += 1) {
        const actionId = macro.actions[i];
        let ok = false;
        if (typeof actionId !== "string" || !actionId) {
          this.showMessage(`Macro step invalid (${i + 1}).`);
          break;
        }
        if (actionId.indexOf("macro:") === 0) {
          ok = this.executeMacroCommand(actionId, activeSet);
        } else if (actionId.indexOf("palette.apply:") === 0) {
          ok = this.applyNamedPalette(actionId.slice("palette.apply:".length));
        } else {
          ok = this.dispatchKeybinding(actionId);
        }
        if (!ok) {
          this.showMessage(`Macro stopped at step ${i + 1}.`);
          break;
        }
        successCount += 1;
      }
      this.historySuppressedDepth = Math.max(0, this.historySuppressedDepth - 1);
      activeSet.delete(macroId);
      const macroAfter = this.captureHistoryState();
      if (this.historySignature(macroBefore) !== this.historySignature(macroAfter)) {
        this.pushHistoryEntry({ label: `Macro: ${macro.label}`, before: macroBefore, after: macroAfter });
      }
      if (successCount === macro.actions.length) {
        this.showMessage(`Macro ran: ${macro.label}`);
        return true;
      }
      return false;
    },

    createCommandPaletteCommands() {
      const commands = this.commandDefinitions;
      return commands.map((cmd) => ({
        ...cmd,
        shortcut: this.getShortcutHintForAction(cmd.id),
        favorite: this.favoriteActions.indexOf(cmd.id) >= 0,
        action: () => this.dispatchCommandAction(cmd.id)
      }));
    },

    getCommandDefinitions() {
      const commands = [
        { id: "tool.brush", label: "Tool: Brush", category: "Tool", keywords: ["paint", "brush"], aliases: ["brush"] },
        { id: "tool.erase", label: "Tool: Erase", category: "Tool", keywords: ["erase"], aliases: ["eraser", "erase"] },
        { id: "tool.fill", label: "Tool: Fill", category: "Tool", keywords: ["bucket", "fill"], aliases: ["paint bucket", "fill"] },
        { id: "tool.line", label: "Tool: Line", category: "Tool", keywords: ["line"], aliases: ["draw line"] },
        { id: "tool.rect", label: "Tool: Rectangle", category: "Tool", keywords: ["rect", "rectangle"], aliases: ["rectangle"] },
        { id: "tool.fillrect", label: "Tool: Fill Rectangle", category: "Tool", keywords: ["filled rectangle", "fill rect"], aliases: ["filled rectangle", "fill rectangle"] },
        { id: "tool.eyedropper", label: "Tool: Eyedropper", category: "Tool", keywords: ["picker", "eyedropper"], aliases: ["color picker", "eyedropper"] },
        { id: "tool.select", label: "Tool: Select", category: "Tool", keywords: ["selection", "select"], aliases: ["selection tool", "select"] },
        { id: "brush.sizeUp", label: "Brush: Increase Size", category: "Brush", keywords: ["brush", "size", "increase"], aliases: ["brush bigger", "increase brush"] },
        { id: "brush.sizeDown", label: "Brush: Decrease Size", category: "Brush", keywords: ["brush", "size", "decrease"], aliases: ["brush smaller", "decrease brush"] },
        { id: "brush.toggleShape", label: "Brush: Toggle Shape", category: "Brush", keywords: ["brush", "shape", "circle", "square"], aliases: ["toggle brush shape", "brush shape"] },
        { id: "frame.prev", label: "Frame: Previous", category: "Frame", keywords: ["previous", "frame"], aliases: ["prev frame", "previous frame"] },
        { id: "frame.next", label: "Frame: Next", category: "Frame", keywords: ["next", "frame"], aliases: ["next frame"] },
        { id: "frame.duplicate", label: "Frame: Duplicate", category: "Frame", keywords: ["copy frame"], aliases: ["dup frame", "duplicate frame"] },
        { id: "frame.duplicateRange", label: "Frame: Duplicate Range", category: "Frame", keywords: ["frame", "range", "duplicate", "batch"], aliases: ["duplicate range", "duplicate selected frames"] },
        { id: "frame.deleteRange", label: "Frame: Delete Range", category: "Frame", keywords: ["frame", "range", "delete"], aliases: ["delete range", "delete selected frames"] },
        { id: "frame.shiftRangeLeft", label: "Frame: Shift Range Left", category: "Frame", keywords: ["frame", "range", "shift", "left"], aliases: ["shift range left"] },
        { id: "frame.shiftRangeRight", label: "Frame: Shift Range Right", category: "Frame", keywords: ["frame", "range", "shift", "right"], aliases: ["shift range right"] },
        { id: "frame.clearRangeSelection", label: "Frame: Clear Range Selection", category: "Frame", keywords: ["frame", "range", "clear"], aliases: ["clear frame range", "clear range selection"] },
        { id: "selection.copy", label: "Selection: Copy", category: "Selection", keywords: ["copy"], aliases: ["copy selection"] },
        { id: "selection.cut", label: "Selection: Cut", category: "Selection", keywords: ["cut"], aliases: ["cut selection"] },
        { id: "selection.paste", label: "Selection: Paste", category: "Selection", keywords: ["paste"], aliases: ["paste selection"] },
        { id: "layer.add", label: "Layer: Add", category: "Layer", keywords: ["layer", "add"], aliases: ["add layer"] },
        { id: "layer.duplicate", label: "Layer: Duplicate", category: "Layer", keywords: ["layer", "duplicate"], aliases: ["dup layer", "duplicate layer"] },
        { id: "layer.delete", label: "Layer: Delete", category: "Layer", keywords: ["layer", "delete"], aliases: ["delete layer"] },
        { id: "layer.toggleVisibility", label: "Layer: Toggle Visibility", category: "Layer", keywords: ["layer", "visible", "visibility"], aliases: ["hide layer", "show layer"] },
        { id: "layer.next", label: "Layer: Next", category: "Layer", keywords: ["layer", "next"], aliases: ["next layer"] },
        { id: "layer.prev", label: "Layer: Previous", category: "Layer", keywords: ["layer", "previous"], aliases: ["prev layer", "previous layer"] },
        { id: "layer.moveUp", label: "Layer: Move Up", category: "Layer", keywords: ["layer", "move", "up"], aliases: ["move layer up"] },
        { id: "layer.moveDown", label: "Layer: Move Down", category: "Layer", keywords: ["layer", "move", "down"], aliases: ["move layer down"] },
        { id: "layer.rename", label: "Layer: Rename", category: "Layer", keywords: ["layer", "rename"], aliases: ["rename layer"] },
        { id: "layer.toggleLock", label: "Layer: Toggle Lock", category: "Layer", keywords: ["layer", "lock"], aliases: ["lock layer", "unlock layer"] },
        { id: "layer.opacityUp", label: "Layer: Increase Opacity", category: "Layer", keywords: ["layer", "opacity", "up"], aliases: ["increase opacity"] },
        { id: "layer.opacityDown", label: "Layer: Decrease Opacity", category: "Layer", keywords: ["layer", "opacity", "down"], aliases: ["decrease opacity"] },
        { id: "layer.opacityReset", label: "Layer: Reset Opacity", category: "Layer", keywords: ["layer", "opacity", "reset"], aliases: ["reset opacity"] },
        { id: "layer.mergeDown", label: "Layer: Merge Down", category: "Layer", keywords: ["layer", "merge"], aliases: ["merge down"] },
        { id: "layer.flattenFrame", label: "Layer: Flatten Frame", category: "Layer", keywords: ["layer", "flatten", "frame"], aliases: ["flatten frame"] },
        { id: "view.zoomIn", label: "View: Zoom In", category: "View", keywords: ["view", "zoom", "in"], aliases: ["zoom in"] },
        { id: "view.zoomOut", label: "View: Zoom Out", category: "View", keywords: ["view", "zoom", "out"], aliases: ["zoom out"] },
        { id: "view.zoomReset", label: "View: Reset Zoom", category: "View", keywords: ["view", "zoom", "reset"], aliases: ["reset zoom"] },
        { id: "view.pixelToggle", label: "View: Toggle Pixel Perfect", category: "View", keywords: ["pixel", "perfect"], aliases: ["pixel perfect", "toggle pixel"] },
        { id: "view.onionPrevToggle", label: "View: Toggle Onion Previous", category: "View", keywords: ["onion", "previous"], aliases: ["toggle onion previous"] },
        { id: "view.onionNextToggle", label: "View: Toggle Onion Next", category: "View", keywords: ["onion", "next"], aliases: ["toggle onion next"] },
        { id: "view.blendPreviewToggle", label: "View: Toggle Blend Preview", category: "View", keywords: ["blend", "preview"], aliases: ["toggle blend preview"] },
        { id: "system.fullscreen", label: "System: Toggle Fullscreen", category: "System", keywords: ["fullscreen"], aliases: ["toggle fullscreen"] },
        { id: "system.playback", label: "System: Playback Play/Pause", category: "System", keywords: ["playback", "play", "pause"], aliases: ["playback", "toggle playback"] },
        { id: "system.playbackPlay", label: "System: Playback Play", category: "System", keywords: ["playback", "play"], aliases: ["play playback"] },
        { id: "system.playbackPause", label: "System: Playback Pause", category: "System", keywords: ["playback", "pause"], aliases: ["pause playback"] },
        { id: "system.playbackStop", label: "System: Playback Stop/Reset", category: "System", keywords: ["stop", "reset", "transport"], aliases: ["stop playback", "reset playback"] },
        { id: "system.playbackLoopToggle", label: "System: Toggle Playback Loop", category: "System", keywords: ["loop", "playback"], aliases: ["toggle loop", "loop"] },
        { id: "system.playbackFpsUp", label: "System: Increase Playback FPS", category: "System", keywords: ["fps", "speed", "increase"], aliases: ["fps up", "increase fps"] },
        { id: "system.playbackFpsDown", label: "System: Decrease Playback FPS", category: "System", keywords: ["fps", "speed", "decrease"], aliases: ["fps down", "decrease fps"] },
        { id: "playback.setRangeFromSelection", label: "Playback: Set Range From Selection", category: "Playback", keywords: ["playback", "range", "selection", "loop"], aliases: ["set playback range", "range from selection"] },
        { id: "playback.clearRange", label: "Playback: Clear Range", category: "Playback", keywords: ["playback", "range", "clear"], aliases: ["clear playback range", "clear range"] },
        { id: "playback.toggleRangeLoop", label: "Playback: Toggle Range Loop", category: "Playback", keywords: ["playback", "range", "loop"], aliases: ["toggle range loop", "range loop"] },
        { id: "playback.jumpRangeStart", label: "Playback: Jump To Range Start", category: "Playback", keywords: ["playback", "range", "start", "jump"], aliases: ["jump to range start", "range start"] },
        { id: "playback.jumpRangeEnd", label: "Playback: Jump To Range End", category: "Playback", keywords: ["playback", "range", "end", "jump"], aliases: ["jump to range end", "range end"] },
        { id: "export.spriteSheetPng", label: "Export: Sprite Sheet PNG", category: "Export", keywords: ["export", "sprite", "sheet", "png"], aliases: ["export sprite sheet", "sheet png"] },
        { id: "export.animationJson", label: "Export: Animation JSON", category: "Export", keywords: ["export", "animation", "json"], aliases: ["export animation json", "animation json"] },
        { id: "export.package", label: "Export: Export Package", category: "Export", keywords: ["export", "package", "metadata"], aliases: ["export package", "package json"] },
        { id: "export.modeCurrentFrame", label: "Export: Current Frame", category: "Export", keywords: ["export", "current", "frame"], aliases: ["export current frame"] },
        { id: "export.modeAllFrames", label: "Export: All Frames", category: "Export", keywords: ["export", "all", "frames"], aliases: ["export all frames"] },
        { id: "export.modeSelectedRange", label: "Export: Selected Range", category: "Export", keywords: ["export", "selected", "range"], aliases: ["export selected range"] },
        { id: "system.delete", label: "System: Delete/Clear", category: "System", keywords: ["delete", "clear"], aliases: ["clear", "delete"] },
        { id: "system.saveLocal", label: "System: Save Local", category: "System", keywords: ["save", "local"], aliases: ["save"] },
        { id: "system.loadLocal", label: "System: Load Local", category: "System", keywords: ["load", "local"], aliases: ["load"] },
        { id: "system.importJson", label: "System: Import JSON", category: "System", keywords: ["import", "json"], aliases: ["import json"] },
        { id: "system.undo", label: "System: Undo", category: "System", keywords: ["undo", "history"], aliases: ["undo action"] },
        { id: "system.redo", label: "System: Redo", category: "System", keywords: ["redo", "history"], aliases: ["redo action"] },
        { id: "system.commandPalette", label: "System: Toggle Command Palette", category: "System", keywords: ["command", "search"], aliases: ["command palette"] },
        { id: "system.closeSurface", label: "System: Close Surface", category: "System", keywords: ["close", "menu", "palette", "overlay"], aliases: ["close menu", "close overlay"] },
        { id: "system.cancelInteraction", label: "System: Cancel Interaction", category: "System", keywords: ["cancel", "interaction"], aliases: ["cancel interaction"] }
      ];
      const list = this.getPaletteLibrary();
      if (list) {
        Object.keys(list).forEach((name) => {
          commands.push({ id: `palette.apply:${name}`, label: `Palette: Apply ${name}`, category: "Palette", keywords: ["palette", "color", name], aliases: [`use ${name}`, `set palette ${name}`] });
        });
      }
      this.macroDefinitions.forEach((macro) => {
        commands.push({
          id: macro.id,
          label: macro.label,
          category: "Macro",
          keywords: (macro.keywords || []).concat(["macro"]),
          aliases: macro.aliases || [],
          actions: macro.actions || []
        });
      });
      return commands;
    }
  });
}

export { installSpriteEditorCommandMethods };
