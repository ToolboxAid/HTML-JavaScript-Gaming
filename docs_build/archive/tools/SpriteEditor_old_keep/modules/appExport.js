function installSpriteEditorExportMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    getExportModeLabel() {
      if (this.exportMode === "current_frame") return "Current Frame";
      if (this.exportMode === "selected_range") return "Selected Range";
      return "All Frames";
    },

    setExportMode(mode) {
      if (!["all_frames", "current_frame", "selected_range"].includes(mode)) {
        this.showMessage("Export mode unavailable.");
        return false;
      }
      this.exportMode = mode;
      this.showMessage(`Export mode: ${this.getExportModeLabel()}`);
      this.renderAll();
      return true;
    },

    getExportFrameIndices(mode = this.exportMode) {
      this.normalizeEditorState();
      if (mode === "current_frame") return [this.document.activeFrameIndex];
      if (mode === "selected_range") {
        const range = this.getFrameRangeSelection();
        if (!range.explicit) return null;
        const indices = [];
        for (let i = range.start; i <= range.end; i += 1) indices.push(i);
        return indices;
      }
      return this.document.frames.map((_f, i) => i);
    },

    buildExportContext(mode = this.exportMode) {
      const indices = this.getExportFrameIndices(mode);
      if (!indices || !indices.length) return null;
      const range = this.getPlaybackRange();
      const validIndices = indices.filter((index) => Number.isInteger(index) && index >= 0 && index < this.document.frames.length);
      if (!validIndices.length) return null;
      const frames = validIndices.map((index, order) => {
        const frame = this.document.ensureFrameLayers(this.document.frames[index]);
        return {
          exportIndex: order,
          frameIndex: index,
          id: frame.id,
          name: frame.name || `Frame ${index + 1}`,
          pixels: this.document.getCompositedPixels(frame, { respectSolo: false, blendMode: "normal" })
        };
      });
      return {
        mode,
        modeLabel: this.getExportModeLabel(),
        indices: validIndices,
        frames,
        frameWidth: this.document.cols,
        frameHeight: this.document.rows,
        frameCount: frames.length,
        fps: this.playback.fps,
        loop: this.playback.loop,
        playbackRange: range.enabled ? { startFrame: range.startFrame, endFrame: range.endFrame } : null,
        palettePreset: this.currentPalettePreset || this.document.palettePresetName || "default",
        palette: (this.document.palette || []).slice(),
        customPalettes: this.document.customPalettes || {},
        paletteSelectionRequired: this.document.paletteSelectionRequired === true,
        playbackOrderOverride: this.getPlaybackOrderOverride ? this.getPlaybackOrderOverride() : { enabled: false, order: [] },
        layerExport: "composited_visible_only",
        soloIgnored: true
      };
    },

    dataUrlToBlob(dataUrl) {
      const parts = String(dataUrl || "").split(",");
      if (parts.length < 2) return null;
      const mimeMatch = parts[0].match(/data:([^;]+);base64/i);
      const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
      const binary = atob(parts[1]);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    },

    buildAnimationExportData(mode = this.exportMode) {
      const context = this.buildExportContext(mode);
      if (!context) return null;
      return {
        version: 1,
        kind: "sprite-animation-export",
        exportMode: context.mode,
        frameWidth: context.frameWidth,
        frameHeight: context.frameHeight,
        frameCount: context.frameCount,
        fps: context.fps,
        loop: context.loop,
        playbackRange: context.playbackRange,
        playbackOrderOverride: context.playbackOrderOverride,
        palettePreset: context.palettePreset,
        palette: context.palette,
        customPalettes: context.customPalettes,
        paletteSelectionRequired: context.paletteSelectionRequired,
        layerExport: context.layerExport,
        soloIgnored: context.soloIgnored,
        frames: context.frames.map((frame) => ({
          exportIndex: frame.exportIndex,
          frameIndex: frame.frameIndex,
          id: frame.id,
          name: frame.name
        }))
      };
    },

    buildExportPackageData(mode = this.exportMode) {
      const context = this.buildExportContext(mode);
      if (!context) return null;
      return {
        version: 1,
        kind: "sprite-export-package",
        exportMode: context.mode,
        frameWidth: context.frameWidth,
        frameHeight: context.frameHeight,
        frameCount: context.frameCount,
        frameOrder: context.frames.map((frame) => frame.frameIndex),
        frameNames: context.frames.map((frame) => frame.name),
        fps: context.fps,
        loop: context.loop,
        playbackRange: context.playbackRange,
        playbackOrderOverride: context.playbackOrderOverride,
        palettePreset: context.palettePreset,
        palette: context.palette,
        customPalettes: context.customPalettes,
        paletteSelectionRequired: context.paletteSelectionRequired,
        layerExport: context.layerExport,
        soloIgnored: context.soloIgnored,
        outputs: {
          spriteSheetPng: `sprite-sheet-${context.mode}.png`,
          animationJson: `animation-${context.mode}.json`,
          packageJson: `export-package-${context.mode}.json`
        }
      };
    },

    downloadSpriteSheetPng(mode = this.exportMode) {
      const context = this.buildExportContext(mode);
      if (!context) {
        this.showMessage(mode === "selected_range" ? "Select a frame range first." : "Export unavailable.");
        return false;
      }
      const plc = this.document.computeSheetPlacementForCount(context.frameCount);
      const temp = document.createElement("canvas");
      temp.width = plc.width;
      temp.height = plc.height;
      const ctx = temp.getContext("2d");
      if (!this.document.sheet.transparent) {
        ctx.fillStyle = this.document.sheet.backgroundColor;
        ctx.fillRect(0, 0, plc.width, plc.height);
      } else {
        ctx.clearRect(0, 0, plc.width, plc.height);
      }
      context.frames.forEach((frame, i) => {
        const entry = plc.entries[i];
        for (let y = 0; y < this.document.rows; y += 1) {
          for (let x = 0; x < this.document.cols; x += 1) {
            const value = frame.pixels[y][x];
            if (!value) continue;
            ctx.fillStyle = value;
            ctx.fillRect(entry.x + x, entry.y + y, 1, 1);
          }
        }
      });
      this.downloadLink.download = `sprite-sheet-${mode}.png`;
      this.downloadLink.href = temp.toDataURL("image/png");
      this.downloadLink.click();
      this.showMessage(`Sprite sheet exported (${context.modeLabel}).`);
      return true;
    },

    exportAnimationJson(mode = this.exportMode) {
      const data = this.buildAnimationExportData(mode);
      if (!data) {
        this.showMessage(mode === "selected_range" ? "Select a frame range first." : "Animation export unavailable.");
        return false;
      }
      const ok = this.downloads.downloadText(`animation-${mode}.json`, JSON.stringify(data, null, 2), "application/json");
      if (!ok) {
        this.showMessage("Animation export unavailable.");
        return false;
      }
      this.showMessage(`Animation JSON exported (${data.frameCount} frames).`);
      return true;
    },

    exportPackageJson(mode = this.exportMode) {
      const data = this.buildExportPackageData(mode);
      if (!data) {
        this.showMessage(mode === "selected_range" ? "Select a frame range first." : "Export package unavailable.");
        return false;
      }
      const ok = this.downloads.downloadText(`export-package-${mode}.json`, JSON.stringify(data, null, 2), "application/json");
      if (!ok) {
        this.showMessage("Export package unavailable.");
        return false;
      }
      this.showMessage(`Export package saved (${data.exportMode}).`);
      return true;
    },

    normalizeHexColor(value) {
      const text = String(value || "").trim().toUpperCase();
      if (!text) return null;
      if (/^#[0-9A-F]{6}$/.test(text)) return text;
      if (/^#[0-9A-F]{3}$/.test(text)) {
        return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`;
      }
      return null;
    },

    parseHexColorToRgb(value) {
      const hex = this.normalizeHexColor(value);
      if (!hex) return [0, 0, 0];
      return [
        Number.parseInt(hex.slice(1, 3), 16),
        Number.parseInt(hex.slice(3, 5), 16),
        Number.parseInt(hex.slice(5, 7), 16)
      ];
    },

    parseCssColorToRgbInt(value) {
      const text = String(value || "").trim();
      if (!text) return null;
      const hex = this.normalizeHexColor(text);
      if (hex) {
        const [r, g, b] = this.parseHexColorToRgb(hex);
        return (r << 16) | (g << 8) | b;
      }
      const rgba = text.match(/^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:\s*,\s*([0-9]*\.?[0-9]+))?\s*\)$/i);
      if (!rgba) return null;
      const r = Math.max(0, Math.min(255, Number(rgba[1])));
      const g = Math.max(0, Math.min(255, Number(rgba[2])));
      const b = Math.max(0, Math.min(255, Number(rgba[3])));
      const a = rgba[4] !== undefined ? Math.max(0, Math.min(1, Number(rgba[4]))) : 1;
      if (a <= 0.001) return null;
      if (a >= 0.999) return (r << 16) | (g << 8) | b;
      const br = Math.round(r * a + 255 * (1 - a));
      const bg = Math.round(g * a + 255 * (1 - a));
      const bb = Math.round(b * a + 255 * (1 - a));
      return (br << 16) | (bg << 8) | bb;
    },

    gifPackSubBlocks(bytes) {
      const out = [];
      let offset = 0;
      while (offset < bytes.length) {
        const size = Math.min(255, bytes.length - offset);
        out.push(size);
        for (let i = 0; i < size; i += 1) out.push(bytes[offset + i]);
        offset += size;
      }
      out.push(0);
      return out;
    },

    gifLzwEncode(indices, minCodeSize) {
      const clearCode = 1 << minCodeSize;
      const endCode = clearCode + 1;
      let codeSize = minCodeSize + 1;
      let nextCode = endCode + 1;
      const maxCode = 4095;
      const bytes = [];
      let bitBuffer = 0;
      let bitCount = 0;

      const writeCode = (code) => {
        bitBuffer |= (code & ((1 << codeSize) - 1)) << bitCount;
        bitCount += codeSize;
        while (bitCount >= 8) {
          bytes.push(bitBuffer & 0xFF);
          bitBuffer >>= 8;
          bitCount -= 8;
        }
      };

      const resetDictionary = () => {
        codeSize = minCodeSize + 1;
        nextCode = endCode + 1;
      };

      resetDictionary();
      writeCode(clearCode);
      if (!indices.length) {
        writeCode(endCode);
        if (bitCount > 0) bytes.push(bitBuffer & 0xFF);
        return new Uint8Array(bytes);
      }

      let hasPrevious = false;
      for (let i = 0; i < indices.length; i += 1) {
        writeCode(indices[i]);
        if (!hasPrevious) {
          hasPrevious = true;
          continue;
        }
        if (nextCode < maxCode) {
          nextCode += 1;
          if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
          continue;
        }
        writeCode(clearCode);
        resetDictionary();
        hasPrevious = false;
      }
      writeCode(endCode);
      if (bitCount > 0) bytes.push(bitBuffer & 0xFF);
      return new Uint8Array(bytes);
    },

    buildAnimatedGifBlob({ width, height, frameIndices, delayCs, loop, paletteRgb, backgroundRgbInt, transparentIndex = null }) {
      const colors = Array.isArray(paletteRgb) ? paletteRgb.slice(0, 255) : [];
      const colorCount = colors.length + 1;
      let tableSize = 2;
      while (tableSize < colorCount && tableSize < 256) tableSize <<= 1;
      const tableSizeBits = Math.max(0, Math.log2(tableSize) - 1);
      const packedLsd = 0x80 | (7 << 4) | tableSizeBits;
      const tableBytes = [];
      const bg = Number.isInteger(backgroundRgbInt) ? backgroundRgbInt : 0xFFFFFF;
      if (transparentIndex === 0) tableBytes.push(0x00, 0x00, 0x00);
      else tableBytes.push((bg >> 16) & 0xFF, (bg >> 8) & 0xFF, bg & 0xFF);
      colors.forEach((rgbInt) => {
        tableBytes.push((rgbInt >> 16) & 0xFF, (rgbInt >> 8) & 0xFF, rgbInt & 0xFF);
      });
      while (tableBytes.length < tableSize * 3) tableBytes.push(0, 0, 0);

      const out = [];
      const pushWord = (value) => {
        out.push(value & 0xFF, (value >> 8) & 0xFF);
      };

      out.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);
      pushWord(width);
      pushWord(height);
      out.push(packedLsd, 0, 0);
      out.push(...tableBytes);

      if (loop) {
        out.push(
          0x21, 0xFF, 0x0B,
          0x4E, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2E, 0x30,
          0x03, 0x01, 0x00, 0x00, 0x00
        );
      }

      const minCodeSize = Math.max(2, Math.ceil(Math.log2(tableSize)));
      frameIndices.forEach((indices) => {
        const hasTransparency = transparentIndex === 0;
        const gcePacked = hasTransparency ? 0x05 : 0x04;
        const transparentColorIndex = hasTransparency ? 0x00 : 0x00;
        out.push(0x21, 0xF9, 0x04, gcePacked);
        pushWord(delayCs);
        out.push(transparentColorIndex, 0x00);

        out.push(0x2C);
        pushWord(0);
        pushWord(0);
        pushWord(width);
        pushWord(height);
        out.push(0x00);

        out.push(minCodeSize);
        const compressed = this.gifLzwEncode(indices, minCodeSize);
        out.push(...this.gifPackSubBlocks(compressed));
      });

      out.push(0x3B);
      return new Blob([new Uint8Array(out)], { type: "image/gif" });
    },

    exportGif(mode = this.exportMode) {
      const context = this.buildExportContext(mode);
      if (!context) {
        this.showMessage(mode === "selected_range" ? "Select a frame range first." : "GIF export unavailable.");
        return false;
      }
      const orderedIndices = this.getEffectivePlaybackSequence
        ? this.getEffectivePlaybackSequence(context.indices)
        : context.indices.slice();
      if (!orderedIndices.length) {
        this.showMessage("GIF export unavailable.");
        return false;
      }
      const colorToIndex = new Map();
      const palette = [];
      const transparentSheet = !!(this.document.sheet && this.document.sheet.transparent);
      const backgroundRgbInt = this.parseCssColorToRgbInt(this.document.sheet && this.document.sheet.backgroundColor) ?? 0xFFFFFF;
      if (!transparentSheet) colorToIndex.set(backgroundRgbInt, 0);
      const frameCanvas = document.createElement("canvas");
      frameCanvas.width = this.document.cols;
      frameCanvas.height = this.document.rows;
      const frameCtx = frameCanvas.getContext("2d", { willReadFrequently: true });
      if (!frameCtx) {
        this.showMessage("GIF export unavailable.");
        return false;
      }
      const frameIndices = [];
      orderedIndices.forEach((frameIndex) => {
        const frame = this.document.frames[frameIndex];
        const pixels = this.document.getCompositedPixels(frame, { respectSolo: false, blendMode: "normal" });
        if (!transparentSheet) {
          frameCtx.fillStyle = this.document.sheet && this.document.sheet.backgroundColor ? this.document.sheet.backgroundColor : "#ffffff";
          frameCtx.fillRect(0, 0, this.document.cols, this.document.rows);
        } else {
          frameCtx.clearRect(0, 0, this.document.cols, this.document.rows);
        }
        for (let y = 0; y < this.document.rows; y += 1) {
          for (let x = 0; x < this.document.cols; x += 1) {
            const value = pixels[y][x];
            if (!value) continue;
            frameCtx.fillStyle = value;
            frameCtx.fillRect(x, y, 1, 1);
          }
        }
        const data = frameCtx.getImageData(0, 0, this.document.cols, this.document.rows).data;
        const indices = new Uint8Array(this.document.cols * this.document.rows);
        for (let i = 0; i < indices.length; i += 1) {
          const di = i * 4;
          const a = data[di + 3];
          if (a <= 0) {
            indices[i] = 0;
            continue;
          }
          const rgbInt = (data[di] << 16) | (data[di + 1] << 8) | data[di + 2];
          let entry = colorToIndex.get(rgbInt);
          if (entry === undefined) {
            if (palette.length >= 255) {
              this.showMessage("GIF export unavailable (too many colors).");
              return false;
            }
            entry = palette.length + 1;
            palette.push(rgbInt);
            colorToIndex.set(rgbInt, entry);
          }
          indices[i] = entry;
        }
        frameIndices.push(indices);
      });
      if (!frameIndices.length) {
        this.showMessage("GIF export unavailable.");
        return false;
      }
      const fps = Math.max(1, Number(this.playback.fps) || 1);
      const delayCs = Math.max(1, Math.round(100 / fps));
      const blob = this.buildAnimatedGifBlob({
        width: this.document.cols,
        height: this.document.rows,
        frameIndices,
        delayCs,
        loop: this.playback.loop,
        paletteRgb: palette,
        backgroundRgbInt,
        transparentIndex: transparentSheet ? 0 : null
      });
      if (!blob) {
        this.showMessage("GIF export unavailable.");
        return false;
      }
      const ok = this.downloads.downloadBlob(`animation-${mode}.gif`, blob);
      if (!ok) {
        this.showMessage("GIF export unavailable.");
        return false;
      }
      const override = this.getPlaybackOrderOverride ? this.getPlaybackOrderOverride() : { enabled: false };
      this.showMessage(override.enabled ? "GIF exported (custom playback order)." : "GIF exported.");
      return true;
    }
  });
}

export { installSpriteEditorExportMethods };
