import { STORAGE_KEY } from "./constants.js";

function installSpriteEditorIOMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    requestDocumentReplacement(title, message, onReplace) {
      this.requestReplaceGuard(title, message, onReplace);
      this.renderAll();
      return true;
    },

    getStoredDocumentPayload(parsed) {
      if (parsed && parsed.doc) return parsed.doc;
      return parsed;
    },

    resetEditorSessionState() {
      this.activeTool = "brush";
      this.hoveredGridCell = null;
      this.selectionStart = null;
      this.selectionPasteOrigin = { x: 0, y: 0 };
      this.selectionMoveSession = null;
      this.timelineInteraction = null;
      this.timelineHoverIndex = null;
      this.frameRangeSelection = null;
      this.playbackRange = { enabled: false, startFrame: 0, endFrame: 0 };
      this.playback = { isPlaying: false, fps: 6, loop: true, previewFrameIndex: 0, sequenceCursor: 0, lastTick: 0 };
      this.strokeLastCell = null;
      this.shapePreview = null;
      this.currentPalettePreset = "";
      this.document.palettePresetName = "";
      this.document.paletteSelectionRequired = true;
      this.document.customPalettes = {};
      this.document.playbackOrderOverride = { enabled: false, order: [] };
      this.paletteWorkflow = { source: null, target: null, scope: "active_layer" };
      this.paletteSidebarScroll = 0;
      this.leftPanelOpenSection = "brush";
      this.pan = { x: 0, y: 0 };
      this.zoom = 1;
      this.referenceImageRuntime = { image: null, loaded: false, layout: null, sourceName: "" };
      this.referenceManualSplit = { width: "", height: "", frames: "" };
      this.uiAnimationLastTick = 0;
    },

    finalizeDocumentReplacement(message) {
      this.uiDensityEffectiveMode = "pro";
      this.clearHistoryStacks();
      this.normalizeEditorState();
      this.syncReferenceImageFromDocument();
      this.markCleanBaseline();
      this.showMessage(message);
    },

    importDocumentPayload(payload, successMessage) {
      this.document.importPayload(payload);
      this.finalizeDocumentReplacement(successMessage);
    },

    newDocument() {
      return this.requestDocumentReplacement("New Document", "Replace current document with a new blank sprite?", () => {
        this.document = new this.document.constructor();
        this.resetEditorSessionState();
        this.finalizeDocumentReplacement("New document.");
      });
    },

    saveLocal() {
      if (!this.isDirty) {
        this.showMessage("Nothing to save.");
        return;
      }
      const ok = this.storage.saveJson(STORAGE_KEY, {
        doc: this.document.buildExportPayload()
      });
      if (!ok) {
        this.showMessage("Save unavailable.");
        return false;
      }
      this.markCleanBaseline();
      this.showMessage("Saved locally.");
      return true;
    },

    loadLocal() {
      return this.requestDocumentReplacement("Load Local", "Replace current document with local save?", () => {
        const stored = this.storage.loadJson(STORAGE_KEY, null);
        if (!stored) {
          this.showMessage("No local save.");
          return;
        }
        try {
          this.importDocumentPayload(this.getStoredDocumentPayload(stored), "Loaded local save.");
        } catch (_e) {
          this.showMessage("Load failed.");
        }
      });
    },

    openImport() {
      this.fileInput.click();
    },

    syncReferenceImageFromDocument() {
      const src = this.document && this.document.referenceImage ? this.document.referenceImage.src : "";
      if (!src) {
        this.referenceImageRuntime = { image: null, loaded: false, layout: null, sourceName: "" };
        return;
      }
      const image = new Image();
      image.onload = () => {
        const layout = this.inferReferenceSheetLayout(image);
        this.referenceImageRuntime = { image, loaded: true, layout, sourceName: "" };
        this.syncReferenceManualSplitFromLayout(layout);
        this.renderAll();
      };
      image.onerror = () => {
        this.referenceImageRuntime = { image: null, loaded: false, layout: null, sourceName: "" };
        this.showAlertMessage("Reference image failed to load.");
        this.renderAll();
      };
      image.src = src;
    },

    autoAlignReferenceImage(showMessage = true) {
      if (!this.document || !this.document.referenceImage || !this.document.referenceImage.src) return false;
      this.document.referenceImage.xCells = 0;
      this.document.referenceImage.yCells = 0;
      this.document.referenceImage.widthCells = this.document.cols;
      this.document.referenceImage.heightCells = this.document.rows;
      this.document.referenceImage.alignmentLocked = true;
      if (showMessage) this.showMessage("Reference auto-align attempted.");
      this.renderAll();
      return true;
    },

    fitReferenceImageToGrid() {
      if (!this.document || !this.document.referenceImage || !this.document.referenceImage.src) {
        this.showMessage("Load reference image first.");
        return false;
      }
      this.document.referenceImage.xCells = 0;
      this.document.referenceImage.yCells = 0;
      this.document.referenceImage.widthCells = this.document.cols;
      this.document.referenceImage.heightCells = this.document.rows;
      this.document.referenceImage.alignmentLocked = true;
      this.showMessageAndRender("Reference fit to grid.");
      return true;
    },

    ensureReferenceManualSplitState() {
      if (!this.referenceManualSplit || typeof this.referenceManualSplit !== "object") {
        this.referenceManualSplit = { width: "", height: "", frames: "" };
      }
      this.referenceManualSplit.width = String(this.referenceManualSplit.width || "");
      this.referenceManualSplit.height = String(this.referenceManualSplit.height || "");
      this.referenceManualSplit.frames = String(this.referenceManualSplit.frames || "");
      return this.referenceManualSplit;
    },

    syncReferenceManualSplitFromLayout(layout) {
      const state = this.ensureReferenceManualSplitState();
      const next = layout || this.inferReferenceSheetLayout();
      if (!next) return state;
      state.width = String(Math.max(1, Number(next.frameCols) || this.document.cols || 1));
      state.height = String(Math.max(1, Number(next.frameRows) || this.document.rows || 1));
      state.frames = String(Math.max(1, Number(next.frameCount) || (this.document.frames ? this.document.frames.length : 1) || 1));
      return state;
    },

    promptReferenceManualSplitField(field, label, minValue = 1, maxValue = 512) {
      const state = this.ensureReferenceManualSplitState();
      const current = String(state[field] || "");
      const fallback = field === "frames"
        ? String(Math.max(1, (this.document.frames && this.document.frames.length) || 1))
        : String(field === "width" ? this.document.cols : this.document.rows);
      const raw = globalThis.prompt ? globalThis.prompt(`${label} (number ${minValue}-${maxValue}):`, current || fallback) : (current || fallback);
      if (raw === null || raw === undefined) return false;
      const parsed = Math.max(minValue, Math.min(maxValue, Math.floor(Number(raw) || 0)));
      if (!Number.isFinite(parsed) || parsed < minValue) {
        this.showMessageAndRender("Invalid numeric value.");
        return false;
      }
      state[field] = String(parsed);
      this.showMessageAndRender(`Reference ${label.toLowerCase()} set to ${parsed}.`);
      return true;
    },

    buildManualReferenceLayout(frameCols, frameRows, frameCount) {
      const cols = Math.max(1, Math.min(256, Math.floor(Number(frameCols) || 1)));
      const rows = Math.max(1, Math.min(256, Math.floor(Number(frameRows) || 1)));
      const count = Math.max(1, Math.min(512, Math.floor(Number(frameCount) || 1)));
      const image = this.referenceImageRuntime && this.referenceImageRuntime.image ? this.referenceImageRuntime.image : null;
      const rawW = image ? Math.max(1, Math.round(Number(image.naturalWidth || image.width) || 1)) : cols * count;
      const rawH = image ? Math.max(1, Math.round(Number(image.naturalHeight || image.height) || 1)) : rows;
      let sheetColumns = 1;
      let sheetRows = 1;
      if (count > 1) {
        if (cols * count === rawW && rows === rawH) {
          sheetColumns = count;
        } else if (rows * count === rawH && cols === rawW) {
          sheetRows = count;
        } else if (rawW % cols === 0 && rawH % rows === 0) {
          sheetColumns = Math.max(1, Math.floor(rawW / cols));
          sheetRows = Math.max(1, Math.floor(rawH / rows));
        } else {
          sheetColumns = count;
          sheetRows = 1;
        }
      }
      return {
        imageWidth: rawW,
        imageHeight: rawH,
        frameCols: cols,
        frameRows: rows,
        sheetColumns,
        sheetRows,
        frameCount: count,
        framePixelWidth: Math.max(1, Math.floor(rawW / Math.max(1, sheetColumns))),
        framePixelHeight: Math.max(1, Math.floor(rawH / Math.max(1, sheetRows)))
      };
    },

    applyManualReferenceSplit() {
      if (!this.document || !this.document.referenceImage || !this.document.referenceImage.src) {
        this.showMessage("Load reference image first.");
        return false;
      }
      const state = this.ensureReferenceManualSplitState();
      const cols = Math.max(1, Math.floor(Number(state.width) || 0));
      const rows = Math.max(1, Math.floor(Number(state.height) || 0));
      const frames = Math.max(1, Math.floor(Number(state.frames) || 0));
      if (!cols || !rows || !frames) {
        this.showMessageAndRender("Set width, height, and frames first.");
        return false;
      }
      const layout = this.buildManualReferenceLayout(cols, rows, frames);
      this.applyReferenceImageCellGrid(false, layout);
      this.fitReferenceImageToGrid();
      this.showMessageAndRender(`Manual split applied: ${layout.frameCols}x${layout.frameRows}, ${layout.frameCount} frames.`);
      return true;
    },

    inferReferenceSheetNameHint(fileName, rawW, rawH) {
      const name = String(fileName || "").toLowerCase();
      if (!name) return null;
      const patterns = [
        /(\d+)\s*w\D+(\d+)\s*h\D+(\d+)\s*f/,
        /(\d+)\s*x\s*(\d+)\D+(\d+)\s*f/
      ];
      for (let i = 0; i < patterns.length; i += 1) {
        const match = name.match(patterns[i]);
        if (!match) continue;
        const hintedCols = Math.max(1, Math.floor(Number(match[1]) || 1));
        const hintedRows = Math.max(1, Math.floor(Number(match[2]) || 1));
        const hintedFrames = Math.max(1, Math.floor(Number(match[3]) || 1));
        if (hintedFrames <= 1) continue;
        if (hintedCols * hintedFrames === rawW && hintedRows === rawH) {
          return {
            frameColsRaw: hintedCols,
            frameRowsRaw: hintedRows,
            sheetColumns: hintedFrames,
            sheetRows: 1
          };
        }
        if (hintedRows * hintedFrames === rawH && hintedCols === rawW) {
          return {
            frameColsRaw: hintedCols,
            frameRowsRaw: hintedRows,
            sheetColumns: 1,
            sheetRows: hintedFrames
          };
        }
      }
      const frameOnly = name.match(/(\d+)\s*f/);
      if (frameOnly) {
        const hintedFrames = Math.max(1, Math.floor(Number(frameOnly[1]) || 1));
        if (hintedFrames > 1) {
          if (rawW >= rawH && rawW % hintedFrames === 0) {
            return {
              frameColsRaw: Math.max(1, Math.floor(rawW / hintedFrames)),
              frameRowsRaw: rawH,
              sheetColumns: hintedFrames,
              sheetRows: 1
            };
          }
          if (rawH > rawW && rawH % hintedFrames === 0) {
            return {
              frameColsRaw: rawW,
              frameRowsRaw: Math.max(1, Math.floor(rawH / hintedFrames)),
              sheetColumns: 1,
              sheetRows: hintedFrames
            };
          }
        }
      }
      return null;
    },

    inferReferenceSheetLayout(imageOverride = null, fileNameOverride = "") {
      const image = imageOverride || (this.referenceImageRuntime && this.referenceImageRuntime.image ? this.referenceImageRuntime.image : null);
      if (!image) return null;
      const rawW = Math.max(1, Math.round(Number(image.naturalWidth || image.width) || 1));
      const rawH = Math.max(1, Math.round(Number(image.naturalHeight || image.height) || 1));
      let frameColsRaw = rawW;
      let frameRowsRaw = rawH;
      let sheetColumns = 1;
      let sheetRows = 1;
      const sourceName = String(fileNameOverride || (this.referenceImageRuntime && this.referenceImageRuntime.sourceName) || "");
      const nameHint = this.inferReferenceSheetNameHint(sourceName, rawW, rawH);
      if (nameHint) {
        frameColsRaw = nameHint.frameColsRaw;
        frameRowsRaw = nameHint.frameRowsRaw;
        sheetColumns = nameHint.sheetColumns;
        sheetRows = nameHint.sheetRows;
      } else if (rawW > rawH && rawW % rawH === 0) {
        frameColsRaw = rawH;
        frameRowsRaw = rawH;
        sheetColumns = Math.max(1, Math.floor(rawW / rawH));
      } else if (rawH > rawW && rawH % rawW === 0) {
        frameColsRaw = rawW;
        frameRowsRaw = rawW;
        sheetRows = Math.max(1, Math.floor(rawH / rawW));
      } else {
        const approxHorizontalFrames = rawW / rawH >= 1.9 ? Math.max(2, Math.round(rawW / rawH)) : 1;
        const approxVerticalFrames = rawH / rawW >= 1.9 ? Math.max(2, Math.round(rawH / rawW)) : 1;
        if (approxHorizontalFrames > 1 && rawW % approxHorizontalFrames === 0) {
          const candidateCols = Math.floor(rawW / approxHorizontalFrames);
          const aspect = candidateCols / rawH;
          if (aspect >= 0.5 && aspect <= 2.0) {
            frameColsRaw = candidateCols;
            frameRowsRaw = rawH;
            sheetColumns = approxHorizontalFrames;
            sheetRows = 1;
          }
        } else if (approxVerticalFrames > 1 && rawH % approxVerticalFrames === 0) {
          const candidateRows = Math.floor(rawH / approxVerticalFrames);
          const aspect = rawW / candidateRows;
          if (aspect >= 0.5 && aspect <= 2.0) {
            frameColsRaw = rawW;
            frameRowsRaw = candidateRows;
            sheetColumns = 1;
            sheetRows = approxVerticalFrames;
          }
        }
      }
      const frameCols = Math.max(1, Math.min(256, frameColsRaw));
      const frameRows = Math.max(1, Math.min(256, frameRowsRaw));
      return {
        imageWidth: rawW,
        imageHeight: rawH,
        frameCols,
        frameRows,
        sheetColumns,
        sheetRows,
        frameCount: Math.max(1, sheetColumns * sheetRows),
        framePixelWidth: Math.max(1, Math.floor(rawW / sheetColumns)),
        framePixelHeight: Math.max(1, Math.floor(rawH / sheetRows))
      };
    },

    ensureReferenceFrameCount(frameCount) {
      const target = Math.max(1, Math.floor(Number(frameCount) || 1));
      const current = Array.isArray(this.document.frames) ? this.document.frames.length : 0;
      if (current === target) return false;
      if (current < target) {
        for (let i = current; i < target; i += 1) {
          this.document.frames.push(this.document.makeFrame(`Frame ${i + 1}`));
        }
      } else {
        this.document.frames = this.document.frames.slice(0, target);
      }
      this.document.activeFrameIndex = Math.max(0, Math.min(this.document.activeFrameIndex, target - 1));
      this.playback.previewFrameIndex = this.document.activeFrameIndex;
      if (typeof this.clearFrameRangeSelection === "function") this.clearFrameRangeSelection(false);
      if (typeof this.sanitizePlaybackRange === "function") this.sanitizePlaybackRange();
      return true;
    },

    applyReferenceImageCellGrid(showMessage = true, layoutOverride = null) {
      const layout = layoutOverride || this.inferReferenceSheetLayout();
      if (!layout) return false;
      const resized = this.resizeDocumentGrid(layout.frameCols, layout.frameRows);
      const frameAdjusted = this.ensureReferenceFrameCount(layout.frameCount);
      if (this.document.referenceImage) {
        this.document.referenceImage.xCells = 0;
        this.document.referenceImage.yCells = 0;
        this.document.referenceImage.widthCells = this.document.cols;
        this.document.referenceImage.heightCells = this.document.rows;
      }
      if (this.referenceImageRuntime && this.referenceImageRuntime.loaded) {
        this.referenceImageRuntime.layout = layout;
      }
      this.syncReferenceManualSplitFromLayout(layout);
      if (showMessage) {
        const frameText = layout.frameCount > 1 ? ` ${layout.frameCount} frames detected.` : " Single frame detected.";
        this.showMessage(`Grid matched reference cells: ${layout.frameCols}x${layout.frameRows}.${frameText}`);
      }
      this.renderAll();
      return resized || frameAdjusted;
    },

    autoFitReferenceImage() {
      if (!this.document || !this.document.referenceImage || !this.document.referenceImage.src) {
        this.showMessage("Load reference image first.");
        return false;
      }
      this.applyReferenceImageCellGrid(false, this.inferReferenceSheetLayout());
      const ok = this.fitReferenceImageToGrid();
      if (ok) this.showMessageAndRender("Reference auto-fit complete (grid matched to image cells).");
      return ok;
    },

    scaleReferenceImage(deltaCells) {
      if (!this.document || !this.document.referenceImage || !this.document.referenceImage.src) {
        this.showMessage("Load reference image first.");
        return false;
      }
      const ref = this.document.referenceImage;
      const delta = Number(deltaCells) || 0;
      if (!delta) return false;
      const nextW = Math.max(1, Math.min(512, Math.round((Number(ref.widthCells) || this.document.cols) + delta)));
      const nextH = Math.max(1, Math.min(512, Math.round((Number(ref.heightCells) || this.document.rows) + delta)));
      if (nextW === ref.widthCells && nextH === ref.heightCells) return false;
      ref.widthCells = nextW;
      ref.heightCells = nextH;
      ref.alignmentLocked = false;
      this.showMessageAndRender(`Reference scale: ${nextW} x ${nextH}`);
      return true;
    },

    toggleReferenceOverlayVisibility() {
      if (!this.document || !this.document.referenceImage || !this.document.referenceImage.src) {
        this.showMessage("Load reference image first.");
        return false;
      }
      this.document.referenceImage.visible = this.document.referenceImage.visible !== true;
      this.showMessageAndRender(this.document.referenceImage.visible ? "Reference overlay shown." : "Reference overlay hidden.");
      return true;
    },

    nudgeReferenceImage(dx, dy) {
      if (!this.document || !this.document.referenceImage || !this.document.referenceImage.src) {
        this.showMessage("Load reference image first.");
        return false;
      }
      const ref = this.document.referenceImage;
      const stepX = Math.trunc(Number(dx) || 0);
      const stepY = Math.trunc(Number(dy) || 0);
      if (!stepX && !stepY) return false;
      ref.xCells = Math.round((Number(ref.xCells) || 0) + stepX);
      ref.yCells = Math.round((Number(ref.yCells) || 0) + stepY);
      ref.alignmentLocked = false;
      this.showMessageAndRender(`Reference moved to ${ref.xCells}, ${ref.yCells}.`);
      return true;
    },

    resetReferenceAlignment() {
      if (!this.document || !this.document.referenceImage || !this.document.referenceImage.src) {
        this.showMessage("No reference image.");
        return false;
      }
      this.document.referenceImage.xCells = 0;
      this.document.referenceImage.yCells = 0;
      this.document.referenceImage.widthCells = this.document.cols;
      this.document.referenceImage.heightCells = this.document.rows;
      this.document.referenceImage.alignmentLocked = false;
      this.showMessageAndRender("Reference alignment reset.");
      return true;
    },

    loadReferenceImage() {
      const picker = document.createElement("input");
      picker.type = "file";
      picker.accept = "image/*";
      picker.onchange = async (event) => {
        const file = event.target && event.target.files ? event.target.files[0] : null;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const src = typeof reader.result === "string" ? reader.result : "";
          if (!src) {
            this.showAlertMessage("Reference image load failed.");
            this.renderAll();
            return;
          }
          const image = new Image();
          image.onload = () => {
            const layout = this.inferReferenceSheetLayout(image, file.name || "");
            this.referenceImageRuntime = { image, loaded: true, layout, sourceName: file.name || "" };
            this.document.referenceImage.src = src;
            this.document.referenceImage.visible = true;
            this.document.referenceImage.opacity = Math.max(0.15, Math.min(0.85, this.document.referenceImage.opacity || 0.45));
            this.syncReferenceManualSplitFromLayout(layout);
            this.autoAlignReferenceImage(false);
            this.applyReferenceImageCellGrid(false, layout);
            this.showMessage("Reference image loaded. Grid matched to image cells.");
            this.renderAll();
          };
          image.onerror = () => {
            this.referenceImageRuntime = { image: null, loaded: false, layout: null, sourceName: file.name || "" };
            this.showAlertMessage("Reference image decode failed.");
            this.renderAll();
          };
          image.src = src;
        };
        reader.readAsDataURL(file);
      };
      picker.click();
      return true;
    },

    exportJson(pretty) {
      const ok = this.downloads.downloadText(
        "sprite-editor.json",
        JSON.stringify(this.document.buildExportPayload(), null, pretty ? 2 : 0),
        "application/json"
      );
      if (!ok) {
        this.showMessage("JSON export unavailable.");
        return false;
      }
      this.markCleanBaseline();
      this.showMessage("JSON exported.");
      return true;
    },

    tick(ts) {
      let didRender = false;
      if (this.playback.isPlaying) {
        const fd = 1000 / this.playback.fps;
        if (ts - this.playback.lastTick >= fd) {
          this.playback.lastTick = ts;
          const sequence = this.getEffectivePlaybackSequence();
          if (sequence.length) {
            let cursor = Number.isInteger(this.playback.sequenceCursor) ? this.playback.sequenceCursor : -1;
            if (cursor < 0 || cursor >= sequence.length || sequence[cursor] !== this.playback.previewFrameIndex) {
              cursor = sequence.indexOf(this.playback.previewFrameIndex);
              if (cursor < 0) cursor = 0;
            }
            if (cursor < sequence.length - 1) cursor += 1;
            else if (this.playback.loop) cursor = 0;
            else this.playback.isPlaying = false;
            this.playback.sequenceCursor = cursor;
            this.playback.previewFrameIndex = sequence[cursor] ?? sequence[0];
          }
          this.document.activeFrameIndex = this.playback.previewFrameIndex;
          this.renderAll();
          didRender = true;
        }
      }
      if (!didRender) {
        const marqueeStepMs = 66;
        if (ts - (this.uiAnimationLastTick || 0) >= marqueeStepMs) {
          this.uiAnimationLastTick = ts;
          this.renderAll();
        }
      }
      requestAnimationFrame((t) => this.tick(t));
    }
  });
}

export { installSpriteEditorIOMethods };
