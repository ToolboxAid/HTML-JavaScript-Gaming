function installSpriteEditorRenderMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    renderAll() {
      this.normalizeEditorState();
      if (!this.validatePaletteConfiguration()) this.syncCurrentPalettePreset();
      this.updateDirtyState();
      this.controlSurface.rebuildLayout();
      this.gridRect = this.computeGridRect();
      this.timelineStripRect = this.computeTimelineLayout();
      this.controlSurface.draw(this.ctx);
      this.drawMainGrid();
      this.controlSurface.drawTimelinePanel(this.ctx);
      this.controlSurface.drawPreviewPanel(this.ctx);
      this.controlSurface.drawSheetPanel(this.ctx);
      this.controlSurface.drawOverflowPanel(this.ctx);
      this.controlSurface.drawCommandPalette(this.ctx);
      this.drawHelpDetailPopup();
      this.drawAboutPopup();
      this.drawPalettePresetPopup();
      this.drawPaletteLockPopup();
      this.drawReplaceGuard();
      this.drawLayerRenamePrompt();
      this.drawPaletteConfigurationBlocker();
    },

    drawMainGrid() {
      const r = this.gridRect;
      const ctx = this.ctx;
      const pixels = this.document.getCompositedPixels(this.document.activeFrame);
      const viewport = this.controlSurface.layout.gridArea;
      const prevFrame = this.document.frames[this.document.activeFrameIndex - 1];
      const nextFrame = this.document.frames[this.document.activeFrameIndex + 1];
      const prevPixels = prevFrame ? this.document.getCompositedPixels(prevFrame) : null;
      const nextPixels = nextFrame ? this.document.getCompositedPixels(nextFrame) : null;
      ctx.save();
      ctx.beginPath();
      ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
      ctx.clip();
      ctx.fillStyle = "#fff";
      ctx.fillRect(r.x, r.y, r.width, r.height);
      for (let y = 0; y < this.document.rows; y += 1) {
        for (let x = 0; x < this.document.cols; x += 1) {
          ctx.fillStyle = ((x + y) % 2 === 0) ? "#f8fafc" : "#e2e8f0";
          ctx.fillRect(r.x + x * r.pixelSize, r.y + y * r.pixelSize, r.pixelSize, r.pixelSize);
        }
      }
      if (this.document.referenceImage && this.document.referenceImage.visible && this.referenceImageRuntime && this.referenceImageRuntime.loaded && this.referenceImageRuntime.image) {
        const ref = this.document.referenceImage;
        const drawX = r.x + ref.xCells * r.pixelSize;
        const drawY = r.y + ref.yCells * r.pixelSize;
        const drawW = ref.widthCells * r.pixelSize;
        const drawH = ref.heightCells * r.pixelSize;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, Number(ref.opacity) || 0.45));
        ctx.drawImage(this.referenceImageRuntime.image, drawX, drawY, drawW, drawH);
        ctx.restore();
      }
      if (this.onionSkin.prev && prevPixels) {
        ctx.fillStyle = "rgba(80, 180, 255, 0.20)";
        for (let y = 0; y < this.document.rows; y += 1) {
          for (let x = 0; x < this.document.cols; x += 1) {
            if (!prevPixels[y][x]) continue;
            ctx.fillRect(r.x + x * r.pixelSize, r.y + y * r.pixelSize, r.pixelSize, r.pixelSize);
          }
        }
      }
      if (this.onionSkin.next && nextPixels) {
        ctx.fillStyle = "rgba(255, 170, 80, 0.18)";
        for (let y = 0; y < this.document.rows; y += 1) {
          for (let x = 0; x < this.document.cols; x += 1) {
            if (!nextPixels[y][x]) continue;
            ctx.fillRect(r.x + x * r.pixelSize, r.y + y * r.pixelSize, r.pixelSize, r.pixelSize);
          }
        }
      }
      for (let y = 0; y < this.document.rows; y += 1) {
        for (let x = 0; x < this.document.cols; x += 1) {
          const v = pixels[y][x];
          if (!v) continue;
          ctx.fillStyle = v;
          ctx.fillRect(r.x + x * r.pixelSize, r.y + y * r.pixelSize, r.pixelSize, r.pixelSize);
        }
      }
      if (this.selectionMoveSession && this.selectionMoveSession.block && this.selectionMoveSession.sourceRect) {
        const previewX = this.selectionMoveSession.sourceRect.x + (this.selectionMoveSession.offsetX || 0);
        const previewY = this.selectionMoveSession.sourceRect.y + (this.selectionMoveSession.offsetY || 0);
        for (let y = 0; y < this.selectionMoveSession.block.height; y += 1) {
          for (let x = 0; x < this.selectionMoveSession.block.width; x += 1) {
            const v = this.selectionMoveSession.block.pixels[y][x];
            if (!v) continue;
            ctx.fillStyle = v;
            ctx.fillRect(r.x + (previewX + x) * r.pixelSize, r.y + (previewY + y) * r.pixelSize, r.pixelSize, r.pixelSize);
          }
        }
      }
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      for (let x = 0; x <= this.document.cols; x += 1) {
        ctx.beginPath();
        ctx.moveTo(r.x + x * r.pixelSize + 0.5, r.y);
        ctx.lineTo(r.x + x * r.pixelSize + 0.5, r.y + r.height);
        ctx.stroke();
      }
      for (let y = 0; y <= this.document.rows; y += 1) {
        ctx.beginPath();
        ctx.moveTo(r.x, r.y + y * r.pixelSize + 0.5);
        ctx.lineTo(r.x + r.width, r.y + y * r.pixelSize + 0.5);
        ctx.stroke();
      }
      if (this.hoveredGridCell) {
        ctx.strokeStyle = "#4cc9f0";
        ctx.lineWidth = 2;
        ctx.strokeRect(r.x + this.hoveredGridCell.x * r.pixelSize + 1, r.y + this.hoveredGridCell.y * r.pixelSize + 1, r.pixelSize - 2, r.pixelSize - 2);
      }
      if (this.document.selection) {
        const selectionRect = this.selectionMoveSession && this.selectionMoveSession.sourceRect
          ? {
              x: this.selectionMoveSession.sourceRect.x + (this.selectionMoveSession.offsetX || 0),
              y: this.selectionMoveSession.sourceRect.y + (this.selectionMoveSession.offsetY || 0),
              width: this.selectionMoveSession.sourceRect.width,
              height: this.selectionMoveSession.sourceRect.height
            }
          : this.document.selection;
        ctx.strokeStyle = "#ff9800";
        ctx.lineWidth = 3;
        ctx.strokeRect(r.x + selectionRect.x * r.pixelSize + 1, r.y + selectionRect.y * r.pixelSize + 1, selectionRect.width * r.pixelSize - 2, selectionRect.height * r.pixelSize - 2);
      }
      if (this.shapePreview && this.shapePreview.start && this.shapePreview.current) {
        const previewCells = this.getShapeCells(this.shapePreview.start, this.shapePreview.current, this.shapePreview.tool);
        ctx.fillStyle = this.shapePreview.erase ? "rgba(239,68,68,0.35)" : "rgba(76,201,240,0.35)";
        previewCells.forEach((cell) => {
          if (cell.x < 0 || cell.y < 0 || cell.x >= this.document.cols || cell.y >= this.document.rows) return;
          ctx.fillRect(r.x + cell.x * r.pixelSize, r.y + cell.y * r.pixelSize, r.pixelSize, r.pixelSize);
        });
      }
      ctx.restore();
    },

  });
}

export { installSpriteEditorRenderMethods };
