import { sectionTone, sectionToneRgba } from "../sectionColors.js";

const AXIS_WIDTH = 84;
const HEADER_ROW_HEIGHT = 22;
const HEADER_HEIGHT = HEADER_ROW_HEIGHT * 2;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function keyKind(row) {
  if (row.octave === "percussion") {
    return "percussion";
  }
  return /#|b/.test(row.value) ? "black" : "white";
}

export class OctaveTimelineCanvasRenderer {
  constructor({ canvas, windowRef = window }) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.pendingFrame = 0;
    this.renderFrame = 0;
    this.state = this.emptyState();
    this.window = windowRef;
  }

  emptyState() {
    return {
      activePreviewLanes: [],
      cellSize: 22,
      loopBounds: null,
      notes: [],
      paintPreviewKeys: [],
      paintPreviewMode: "paint",
      hoverCell: null,
      playheadStep: 0,
      referenceCells: [],
      rows: [],
      scrollLeft: 0,
      scrollTop: 0,
      selectedCell: null,
      selectedLane: "",
      selectedSection: null,
      sections: [],
      totalSteps: 0,
      viewportHeight: 0,
      viewportWidth: 0
    };
  }

  setState(state = {}) {
    this.state = {
      ...this.emptyState(),
      ...state,
      activePreviewLanes: Array.isArray(state.activePreviewLanes) ? state.activePreviewLanes : [],
      notes: Array.isArray(state.notes) ? state.notes : [],
      paintPreviewKeys: Array.isArray(state.paintPreviewKeys) ? state.paintPreviewKeys : [],
      paintPreviewMode: state.paintPreviewMode === "erase" ? "erase" : "paint",
      referenceCells: Array.isArray(state.referenceCells) ? state.referenceCells : [],
      rows: Array.isArray(state.rows) ? state.rows : [],
      sections: Array.isArray(state.sections) ? state.sections : []
    };
    this.resizeCanvas();
    this.updateDataset();
    this.requestRender();
  }

  setPlayheadStep(stepIndex) {
    const nextStep = Number(stepIndex) || 0;
    if (this.state.playheadStep === nextStep && this.canvas.dataset.playheadStep === String(nextStep)) {
      return;
    }
    this.state.playheadStep = nextStep;
    this.updateDataset();
    this.requestRender();
  }

  setActivePreviewLanes(lanes = []) {
    this.state.activePreviewLanes = Array.from(new Set(lanes));
    this.updateDataset();
    this.requestRender();
  }

  setSelectedCell(selectedCell) {
    this.state.selectedCell = selectedCell || null;
    this.updateDataset();
    this.requestRender();
  }

  setHoverCell(hoverCell) {
    this.state.hoverCell = hoverCell || null;
    this.updateDataset();
    this.requestRender();
  }

  setPaintPreview(paintPreviewKeys = []) {
    this.state.paintPreviewKeys = paintPreviewKeys;
    this.requestRender();
  }

  setPaintPreviewMode(mode) {
    this.state.paintPreviewMode = mode === "erase" ? "erase" : "paint";
    this.requestRender();
  }

  metrics() {
    return {
      axisWidth: AXIS_WIDTH,
      cellSize: this.state.cellSize,
      headerHeight: HEADER_HEIGHT,
      headerRowHeight: HEADER_ROW_HEIGHT,
      height: HEADER_HEIGHT + this.state.rows.length * this.state.cellSize,
      width: AXIS_WIDTH + this.state.totalSteps * this.state.cellSize
    };
  }

  resizeCanvas() {
    const metrics = this.metrics();
    const ratio = Math.max(1, Number(this.window.devicePixelRatio || 1));
    const width = Math.max(1, Math.ceil(metrics.width));
    const height = Math.max(1, Math.ceil(metrics.height));
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = Math.ceil(width * ratio);
    this.canvas.height = Math.ceil(height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.canvas.dataset.logicalWidth = String(width);
    this.canvas.dataset.logicalHeight = String(height);
  }

  updateDataset() {
    const metrics = this.metrics();
    const playheadCell = this.state.referenceCells[this.state.playheadStep] || null;
    const playheadSection = this.sectionForStep(this.state.playheadStep);
    const playheadSectionIndex = playheadSection ? this.state.sections.indexOf(playheadSection) : -1;
    const frozenHeaderVisible = Number(this.state.scrollTop || 0) > 0;
    const sourceCounts = this.noteSourceCounts();
    this.canvas.dataset.canvasBacked = "true";
    this.canvas.dataset.cellSize = String(metrics.cellSize);
    this.canvas.dataset.frozenHeader = String(frozenHeaderVisible);
    this.canvas.dataset.frozenHeaderScrollLeft = String(Math.round(Number(this.state.scrollLeft || 0)));
    this.canvas.dataset.frozenHeaderScrollTop = String(Math.round(Number(this.state.scrollTop || 0)));
    this.canvas.dataset.playheadStep = String(this.state.playheadStep);
    this.canvas.dataset.playheadRenderLoop = "raf";
    this.canvas.dataset.timelineRows = String(this.state.rows.length);
    this.canvas.dataset.timelineSteps = String(this.state.totalSteps);
    this.canvas.dataset.selectedLane = this.state.selectedLane || "";
    this.canvas.dataset.selectedActive = String(Boolean(this.state.selectedCell));
    this.canvas.dataset.selectedRowToken = this.state.selectedCell?.rowToken || "";
    this.canvas.dataset.selectedStepIndex = Number.isInteger(this.state.selectedCell?.stepIndex) ? String(this.state.selectedCell.stepIndex) : "";
    this.canvas.dataset.hoverActive = String(Boolean(this.state.hoverCell));
    this.canvas.dataset.hoverRowToken = this.state.hoverCell?.rowToken || "";
    this.canvas.dataset.hoverStepIndex = Number.isInteger(this.state.hoverCell?.stepIndex) ? String(this.state.hoverCell.stepIndex) : "";
    this.canvas.dataset.playheadBar = playheadCell ? String(playheadCell.bar) : "";
    this.canvas.dataset.playheadBeat = playheadCell ? String(playheadCell.beat) : "";
    this.canvas.dataset.playheadSection = playheadCell?.section || "";
    this.canvas.dataset.playbackSection = playheadSection?.label || "";
    this.canvas.dataset.playbackSectionColor = playheadSection ? sectionTone(playheadSection.colorIndex) : "";
    this.canvas.dataset.playbackSectionIndex = playheadSectionIndex >= 0 ? String(playheadSectionIndex) : "";
    this.canvas.dataset.generatedNoteCount = String(sourceCounts.generated);
    this.canvas.dataset.manualNoteCount = String(sourceCounts.manual);
    this.canvas.dataset.sectionHeaderLabels = this.state.sections.map((section) => section.label).join("|");
  }

  noteSourceCounts() {
    return this.state.notes.reduce((counts, note) => {
      if (note.source === "generated") {
        counts.generated += 1;
      } else if (note.source === "manual") {
        counts.manual += 1;
      }
      return counts;
    }, { generated: 0, manual: 0 });
  }

  requestRender() {
    if (this.pendingFrame) {
      return;
    }
    const schedule = this.window.requestAnimationFrame || ((callback) => this.window.setTimeout(callback, 0));
    this.pendingFrame = schedule(() => {
      this.pendingFrame = 0;
      this.draw();
    });
  }

  draw() {
    const metrics = this.metrics();
    const context = this.context;
    context.clearRect(0, 0, metrics.width, metrics.height);
    this.drawBase(metrics);
    this.drawRegions(metrics);
    this.drawHeaders(metrics);
    this.drawKeyboardAxis(metrics);
    this.drawGridLines(metrics);
    this.drawNotes(metrics);
    this.drawHoverCell(metrics);
    this.drawPaintPreview(metrics);
    this.drawSelectedCell(metrics);
    this.drawPlayhead(metrics);
    this.drawFrozenHeaders(metrics);
    this.renderFrame += 1;
    this.canvas.dataset.renderFrame = String(this.renderFrame);
  }

  drawBase(metrics) {
    this.context.fillStyle = "#111827";
    this.context.fillRect(0, 0, metrics.width, metrics.height);
    this.state.rows.forEach((row, index) => {
      const y = metrics.headerHeight + index * metrics.cellSize;
      this.context.fillStyle = index % 2 ? "#172033" : "#111827";
      this.context.fillRect(metrics.axisWidth, y, metrics.width - metrics.axisWidth, metrics.cellSize);
      if (keyKind(row) === "black") {
        this.context.fillStyle = "rgba(15, 23, 42, 0.42)";
        this.context.fillRect(metrics.axisWidth, y, metrics.width - metrics.axisWidth, metrics.cellSize);
      }
    });
  }

  drawRegions(metrics) {
    const drawStepRegion = (startStep, endStep, color, { strokeColor = "" } = {}) => {
      const start = clamp(startStep, 0, Math.max(0, this.state.totalSteps - 1));
      const end = clamp(endStep, start, Math.max(start, this.state.totalSteps - 1));
      const x = metrics.axisWidth + start * metrics.cellSize;
      const width = (end - start + 1) * metrics.cellSize;
      this.context.fillStyle = color;
      this.context.fillRect(x, metrics.headerHeight, width, metrics.height - metrics.headerHeight);
      if (strokeColor) {
        this.context.strokeStyle = strokeColor;
        this.context.lineWidth = 2;
        this.context.strokeRect(x + 1, metrics.headerHeight + 1, Math.max(0, width - 2), metrics.height - metrics.headerHeight - 2);
      }
    };
    this.state.sections.forEach((section) => {
      drawStepRegion(section.startStep, section.endStep, sectionToneRgba(section.colorIndex, 0.13));
      const startX = metrics.axisWidth + section.startStep * metrics.cellSize + 0.5;
      this.context.strokeStyle = sectionToneRgba(section.colorIndex, 0.72);
      this.context.lineWidth = 2;
      this.context.beginPath();
      this.context.moveTo(startX, metrics.headerHeight);
      this.context.lineTo(startX, metrics.height);
      this.context.stroke();
    });
    if (this.state.selectedSection) {
      drawStepRegion(
        this.state.selectedSection.startStep,
        this.state.selectedSection.endStep,
        sectionToneRgba(this.state.selectedSection.colorIndex, 0.22),
        { strokeColor: sectionToneRgba(this.state.selectedSection.colorIndex, 0.9) }
      );
    }
    if (this.state.loopBounds?.ok) {
      drawStepRegion(
        this.state.loopBounds.startSection.startStep,
        this.state.loopBounds.endSection.endStep,
        "rgba(56, 189, 248, 0.1)",
        { strokeColor: "rgba(125, 211, 252, 0.86)" }
      );
    }
    const playheadSection = this.sectionForStep(this.state.playheadStep);
    if (playheadSection) {
      drawStepRegion(
        playheadSection.startStep,
        playheadSection.endStep,
        sectionToneRgba(playheadSection.colorIndex, 0.16),
        { strokeColor: sectionToneRgba(playheadSection.colorIndex, 0.82) }
      );
    }
  }

  drawHeaders(metrics) {
    this.context.fillStyle = "#3600af";
    this.context.fillRect(0, 0, metrics.width, metrics.headerHeight);
    this.drawHeaderText("Bar", metrics.axisWidth / 2, metrics.headerRowHeight / 2);
    this.drawHeaderText("Beat", metrics.axisWidth / 2, metrics.headerRowHeight + metrics.headerRowHeight / 2);
    this.state.referenceCells.forEach((cell, stepIndex) => {
      const x = metrics.axisWidth + stepIndex * metrics.cellSize;
      const section = this.sectionForStep(stepIndex);
      if (section) {
        this.context.fillStyle = sectionTone(section.colorIndex);
        this.context.globalAlpha = section.startStep === stepIndex ? 0.74 : 0.42;
        this.context.fillRect(x, 0, metrics.cellSize, metrics.headerRowHeight);
        this.context.globalAlpha = 1;
      }
      if (cell.beat === 1 && cell.subdivisionStep === 1) {
        this.context.fillStyle = "rgba(14, 165, 233, 0.44)";
        this.context.fillRect(x, 0, metrics.cellSize, metrics.headerRowHeight);
      }
      const sectionLabel = section && section.startStep === stepIndex ? section.label : "";
      this.drawHeaderText(sectionLabel || String(cell.bar), x + metrics.cellSize / 2, metrics.headerRowHeight / 2, metrics.cellSize - 3);
      this.drawHeaderText(String(cell.beat), x + metrics.cellSize / 2, metrics.headerRowHeight + metrics.headerRowHeight / 2);
    });
    this.drawSectionHeaderLabels(metrics);
  }

  drawSectionHeaderLabels(metrics, offsetY = 0, left = 0, right = metrics.width) {
    this.state.sections.forEach((section) => {
      const x = metrics.axisWidth + section.startStep * metrics.cellSize;
      const width = (section.endStep - section.startStep + 1) * metrics.cellSize;
      if (x + width < left || x > right) {
        return;
      }
      this.context.fillStyle = sectionTone(section.colorIndex);
      this.context.globalAlpha = 0.18;
      this.context.fillRect(x, offsetY, width, metrics.headerRowHeight);
      this.context.globalAlpha = 1;
      this.drawHeaderText(section.label, x + width / 2, offsetY + metrics.headerRowHeight / 2, Math.max(12, width - 6));
    });
  }

  drawHeaderText(text, x, y, maxWidth = null) {
    this.context.fillStyle = "#ffffff";
    this.context.font = "700 10px system-ui, sans-serif";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    if (Number.isFinite(maxWidth) && maxWidth > 0) {
      this.context.fillText(text, x, y, maxWidth);
      return;
    }
    this.context.fillText(text, x, y);
  }

  drawFrozenHeaders(metrics) {
    const scrollTop = clamp(Number(this.state.scrollTop || 0), 0, Math.max(0, metrics.height - metrics.headerHeight));
    if (scrollTop <= 0) {
      return;
    }
    const scrollLeft = clamp(Number(this.state.scrollLeft || 0), 0, Math.max(0, metrics.width - 1));
    const viewportWidth = Math.max(metrics.axisWidth + metrics.cellSize, Number(this.state.viewportWidth || metrics.width));
    const left = scrollLeft;
    const right = Math.min(metrics.width, scrollLeft + viewportWidth);
    const firstStep = Math.max(0, Math.floor((left - metrics.axisWidth) / metrics.cellSize));
    const lastStep = Math.min(this.state.totalSteps - 1, Math.ceil((right - metrics.axisWidth) / metrics.cellSize));
    this.context.save();
    this.context.fillStyle = "#3600af";
    this.context.fillRect(left, scrollTop, Math.max(0, right - left), metrics.headerHeight);
    this.drawHeaderText("Bar", left + metrics.axisWidth / 2, scrollTop + metrics.headerRowHeight / 2);
    this.drawHeaderText("Beat", left + metrics.axisWidth / 2, scrollTop + metrics.headerRowHeight + metrics.headerRowHeight / 2);
    for (let stepIndex = firstStep; stepIndex <= lastStep; stepIndex += 1) {
      const cell = this.state.referenceCells[stepIndex] || null;
      if (!cell) {
        continue;
      }
      const x = metrics.axisWidth + stepIndex * metrics.cellSize;
      if (x + metrics.cellSize < left || x > right) {
        continue;
      }
      const section = this.sectionForStep(stepIndex);
      if (section) {
        this.context.fillStyle = sectionTone(section.colorIndex);
        this.context.globalAlpha = section.startStep === stepIndex ? 0.74 : 0.42;
        this.context.fillRect(x, scrollTop, metrics.cellSize, metrics.headerRowHeight);
        this.context.globalAlpha = 1;
      }
      if (cell.beat === 1 && cell.subdivisionStep === 1) {
        this.context.fillStyle = "rgba(14, 165, 233, 0.44)";
        this.context.fillRect(x, scrollTop, metrics.cellSize, metrics.headerRowHeight);
      }
      const sectionLabel = section && section.startStep === stepIndex ? section.label : "";
      this.drawHeaderText(sectionLabel || String(cell.bar), x + metrics.cellSize / 2, scrollTop + metrics.headerRowHeight / 2, metrics.cellSize - 3);
      this.drawHeaderText(String(cell.beat), x + metrics.cellSize / 2, scrollTop + metrics.headerRowHeight + metrics.headerRowHeight / 2);
    }
    this.drawSectionHeaderLabels(metrics, scrollTop, left, right);
    const step = clamp(this.state.playheadStep, 0, Math.max(0, this.state.totalSteps - 1));
    const playheadX = metrics.axisWidth + step * metrics.cellSize;
    const playheadCell = this.state.referenceCells[step] || null;
    if (playheadCell && playheadX + metrics.cellSize >= left && playheadX <= right) {
      this.context.fillStyle = "rgba(249, 115, 22, 0.9)";
      this.context.fillRect(playheadX, scrollTop, metrics.cellSize, metrics.headerHeight);
      this.drawHeaderText(String(playheadCell.bar), playheadX + metrics.cellSize / 2, scrollTop + metrics.headerRowHeight / 2);
      this.drawHeaderText(String(playheadCell.beat), playheadX + metrics.cellSize / 2, scrollTop + metrics.headerRowHeight + metrics.headerRowHeight / 2);
    }
    this.context.strokeStyle = "rgba(203, 213, 225, 0.7)";
    this.context.lineWidth = 1;
    this.context.beginPath();
    this.context.moveTo(left, scrollTop + metrics.headerHeight + 0.5);
    this.context.lineTo(right, scrollTop + metrics.headerHeight + 0.5);
    this.context.stroke();
    this.context.restore();
  }

  drawKeyboardAxis(metrics) {
    this.state.rows.forEach((row, index) => {
      const y = metrics.headerHeight + index * metrics.cellSize;
      const kind = keyKind(row);
      if (kind === "black") {
        this.context.fillStyle = "#f8fafc";
        this.context.fillRect(0, y, metrics.axisWidth, metrics.cellSize);
        this.context.fillStyle = "#020617";
        this.context.fillRect(metrics.axisWidth * 0.36, y - metrics.cellSize * 0.12, metrics.axisWidth * 0.64, metrics.cellSize * 1.24);
        this.context.fillStyle = "#f8fafc";
        this.context.textAlign = "right";
      } else if (kind === "percussion") {
        this.context.fillStyle = "#6b4b17";
        this.context.fillRect(0, y, metrics.axisWidth, metrics.cellSize);
        this.context.fillStyle = "#ffffff";
        this.context.textAlign = "left";
      } else {
        this.context.fillStyle = "#f8fafc";
        this.context.fillRect(0, y, metrics.axisWidth, metrics.cellSize);
        this.context.fillStyle = "#0f172a";
        this.context.textAlign = "left";
      }
      this.context.font = "800 11px ui-monospace, SFMono-Regular, Consolas, monospace";
      this.context.textBaseline = "middle";
      const x = kind === "black" ? metrics.axisWidth - 8 : 8;
      this.context.fillText(row.label, x, y + metrics.cellSize / 2);
    });
  }

  drawGridLines(metrics) {
    this.context.strokeStyle = "rgba(148, 163, 184, 0.26)";
    this.context.lineWidth = 1;
    for (let step = 0; step <= this.state.totalSteps; step += 1) {
      const x = metrics.axisWidth + step * metrics.cellSize + 0.5;
      const cell = this.state.referenceCells[step] || null;
      this.context.strokeStyle = cell?.beat === 1 && cell?.subdivisionStep === 1 ? "rgba(125, 211, 252, 0.58)" : "rgba(148, 163, 184, 0.26)";
      this.context.beginPath();
      this.context.moveTo(x, 0);
      this.context.lineTo(x, metrics.height);
      this.context.stroke();
    }
    this.context.strokeStyle = "rgba(148, 163, 184, 0.26)";
    for (let row = 0; row <= this.state.rows.length; row += 1) {
      const y = metrics.headerHeight + row * metrics.cellSize + 0.5;
      this.context.beginPath();
      this.context.moveTo(0, y);
      this.context.lineTo(metrics.width, y);
      this.context.stroke();
    }
    this.context.strokeStyle = "rgba(203, 213, 225, 0.62)";
    this.context.beginPath();
    this.context.moveTo(metrics.axisWidth + 0.5, 0);
    this.context.lineTo(metrics.axisWidth + 0.5, metrics.height);
    this.context.stroke();
  }

  drawNotes(metrics) {
    const rowIndexByToken = new Map(this.state.rows.map((row, index) => [row.value, index]));
    const activeLanes = new Set(this.state.activePreviewLanes);
    const selectedLane = this.state.selectedLane;
    this.state.notes
      .slice()
      .sort((left, right) => Number(left.lane === selectedLane) - Number(right.lane === selectedLane))
      .forEach((note) => {
        const rowIndex = rowIndexByToken.get(note.rowToken);
        if (!Number.isInteger(rowIndex)) {
          return;
        }
        const selected = note.lane === selectedLane;
        const x = metrics.axisWidth + note.stepIndex * metrics.cellSize;
        const y = metrics.headerHeight + rowIndex * metrics.cellSize;
        const inset = Math.max(2, Math.round(metrics.cellSize * 0.16));
        const height = Math.max(5, metrics.cellSize - inset * 2);
        const sourceFill = note.source === "manual" ? "#fbbf24" : note.source === "generated" ? "#22c55e" : "#94a3b8";
        this.context.fillStyle = selected ? "#38bdf8" : sourceFill;
        if (activeLanes.has(note.lane)) {
          this.context.fillStyle = selected ? "#facc15" : "#cbd5e1";
        }
        this.context.globalAlpha = selected ? 0.95 : 0.58;
        this.context.fillRect(x + inset, y + inset, Math.max(4, metrics.cellSize - inset * 2), height);
        if (note.source === "manual" || note.source === "generated") {
          this.context.globalAlpha = 1;
          this.context.fillStyle = note.source === "manual" ? "#92400e" : "#064e3b";
          this.context.fillRect(x + inset, y + inset, Math.max(2, metrics.cellSize * 0.16), height);
        }
        this.context.globalAlpha = 1;
        if (metrics.cellSize >= 24) {
          this.context.fillStyle = selected ? "#04111f" : "#111827";
          this.context.font = "800 9px ui-monospace, SFMono-Regular, Consolas, monospace";
          this.context.textAlign = "center";
          this.context.textBaseline = "middle";
          this.context.fillText(String(note.value || ""), x + metrics.cellSize / 2, y + metrics.cellSize / 2, metrics.cellSize - 4);
        }
      });
  }

  drawPaintPreview(metrics) {
    if (!this.state.paintPreviewKeys.length) {
      return;
    }
    const rowIndexByToken = new Map(this.state.rows.map((row, index) => [row.value, index]));
    this.context.fillStyle = this.state.paintPreviewMode === "erase" ? "rgba(248, 113, 113, 0.26)" : "rgba(34, 197, 94, 0.22)";
    this.context.strokeStyle = this.state.paintPreviewMode === "erase" ? "rgba(254, 202, 202, 0.88)" : "rgba(134, 239, 172, 0.8)";
    this.context.lineWidth = 1.5;
    this.state.paintPreviewKeys.forEach((key) => {
      const [rowToken, rawStep] = String(key).split(":");
      const rowIndex = rowIndexByToken.get(rowToken);
      const stepIndex = Number(rawStep);
      if (!Number.isInteger(rowIndex) || !Number.isInteger(stepIndex)) {
        return;
      }
      const x = metrics.axisWidth + stepIndex * metrics.cellSize;
      const y = metrics.headerHeight + rowIndex * metrics.cellSize;
      this.context.fillRect(x, y, metrics.cellSize, metrics.cellSize);
      this.context.strokeRect(x + 1, y + 1, metrics.cellSize - 2, metrics.cellSize - 2);
    });
  }

  drawHoverCell(metrics) {
    const hover = this.state.hoverCell;
    if (!hover) {
      return;
    }
    const rowIndex = this.state.rows.findIndex((row) => row.value === hover.rowToken);
    if (rowIndex < 0 || hover.stepIndex < 0 || hover.stepIndex >= this.state.totalSteps) {
      return;
    }
    const x = metrics.axisWidth + hover.stepIndex * metrics.cellSize;
    const y = metrics.headerHeight + rowIndex * metrics.cellSize;
    this.context.fillStyle = "rgba(125, 211, 252, 0.24)";
    this.context.fillRect(x, y, metrics.cellSize, metrics.cellSize);
    this.context.strokeStyle = "rgba(186, 230, 253, 0.9)";
    this.context.lineWidth = 2;
    this.context.strokeRect(x + 1.5, y + 1.5, metrics.cellSize - 3, metrics.cellSize - 3);
  }

  drawSelectedCell(metrics) {
    const selected = this.state.selectedCell;
    if (!selected) {
      return;
    }
    const rowIndex = this.state.rows.findIndex((row) => row.value === selected.rowToken);
    if (rowIndex < 0) {
      return;
    }
    const x = metrics.axisWidth + selected.stepIndex * metrics.cellSize;
    const y = metrics.headerHeight + rowIndex * metrics.cellSize;
    this.context.fillStyle = "rgba(250, 204, 21, 0.2)";
    this.context.fillRect(x, y, metrics.cellSize, metrics.cellSize);
    this.context.strokeStyle = "#facc15";
    this.context.lineWidth = 2;
    this.context.strokeRect(
      x + 1,
      y + 1,
      metrics.cellSize - 2,
      metrics.cellSize - 2
    );
  }

  drawPlayhead(metrics) {
    if (!this.state.totalSteps) {
      return;
    }
    const step = clamp(this.state.playheadStep, 0, this.state.totalSteps - 1);
    const x = metrics.axisWidth + step * metrics.cellSize;
    this.context.fillStyle = "rgba(249, 115, 22, 0.9)";
    this.context.fillRect(x, 0, metrics.cellSize, metrics.headerHeight);
    this.context.fillStyle = "rgba(249, 115, 22, 0.26)";
    this.context.fillRect(x, metrics.headerHeight, metrics.cellSize, metrics.height - metrics.headerHeight);
    this.context.strokeStyle = "#fb923c";
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(x + 1, 0);
    this.context.lineTo(x + 1, metrics.height);
    this.context.stroke();
    const cell = this.state.referenceCells[step] || null;
    if (cell) {
      this.drawHeaderText(String(cell.bar), x + metrics.cellSize / 2, metrics.headerRowHeight / 2);
      this.drawHeaderText(String(cell.beat), x + metrics.cellSize / 2, metrics.headerRowHeight + metrics.headerRowHeight / 2);
    }
  }

  sectionForStep(stepIndex) {
    return (this.state.sections || []).find((section) => stepIndex >= section.startStep && stepIndex <= section.endStep) || null;
  }

  cellFromPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const metrics = this.metrics();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < metrics.axisWidth || y < metrics.headerHeight) {
      return null;
    }
    const stepIndex = Math.floor((x - metrics.axisWidth) / metrics.cellSize);
    const rowIndex = Math.floor((y - metrics.headerHeight) / metrics.cellSize);
    const row = this.state.rows[rowIndex] || null;
    if (!row || stepIndex < 0 || stepIndex >= this.state.totalSteps) {
      return null;
    }
    return {
      rowIndex,
      rowToken: row.value,
      stepIndex
    };
  }

  sectionHeaderFromPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const metrics = this.metrics();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const scrollTop = Number(this.state.scrollTop || 0);
    const inBaseHeader = y >= 0 && y <= metrics.headerRowHeight;
    const inFrozenHeader = y >= scrollTop && y <= scrollTop + metrics.headerRowHeight;
    if (x < metrics.axisWidth || (!inBaseHeader && !inFrozenHeader)) {
      return null;
    }
    const stepIndex = Math.floor((x - metrics.axisWidth) / metrics.cellSize);
    if (stepIndex < 0 || stepIndex >= this.state.totalSteps) {
      return null;
    }
    const section = this.sectionForStep(stepIndex);
    const sectionIndex = section ? this.state.sections.indexOf(section) : -1;
    if (!section || sectionIndex < 0) {
      return null;
    }
    return {
      label: section.label,
      section,
      sectionIndex,
      stepIndex
    };
  }

  keyboardKeyFromPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const metrics = this.metrics();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || x > metrics.axisWidth || y < metrics.headerHeight || y > metrics.height) {
      return null;
    }
    const rowIndex = Math.floor((y - metrics.headerHeight) / metrics.cellSize);
    const row = this.state.rows[rowIndex] || null;
    if (!row) {
      return null;
    }
    return {
      keyKind: keyKind(row),
      rowIndex,
      rowLabel: row.label,
      rowToken: row.value
    };
  }

  cellCenter(rowToken, stepIndex) {
    const rowIndex = this.state.rows.findIndex((row) => row.value === rowToken);
    if (rowIndex < 0 || stepIndex < 0 || stepIndex >= this.state.totalSteps) {
      return null;
    }
    const rect = this.canvas.getBoundingClientRect();
    const metrics = this.metrics();
    return {
      x: rect.left + metrics.axisWidth + stepIndex * metrics.cellSize + metrics.cellSize / 2,
      y: rect.top + metrics.headerHeight + rowIndex * metrics.cellSize + metrics.cellSize / 2
    };
  }

  sectionHeaderCenter(label, occurrenceIndex = 0) {
    const normalized = String(label || "").trim().toLowerCase();
    const entries = this.state.sections
      .map((section, sectionIndex) => ({ section, sectionIndex }))
      .filter((entry) => entry.section.label.toLowerCase() === normalized);
    const byAbsoluteIndex = Number.isInteger(occurrenceIndex)
      ? entries.find((entry) => entry.sectionIndex === occurrenceIndex)
      : null;
    const entry = byAbsoluteIndex || entries[Math.max(0, Number(occurrenceIndex) || 0)] || entries[0] || null;
    if (!entry) {
      return null;
    }
    const rect = this.canvas.getBoundingClientRect();
    const metrics = this.metrics();
    const width = (entry.section.endStep - entry.section.startStep + 1) * metrics.cellSize;
    return {
      sectionIndex: entry.sectionIndex,
      x: rect.left + metrics.axisWidth + entry.section.startStep * metrics.cellSize + width / 2,
      y: rect.top + Number(this.state.scrollTop || 0) + metrics.headerRowHeight / 2
    };
  }

  snapshot() {
    const metrics = this.metrics();
    return {
      activePreviewLanes: this.state.activePreviewLanes.slice(),
      axisWidth: metrics.axisWidth,
      cellSize: metrics.cellSize,
      frozenHeaderScrollLeft: Number(this.state.scrollLeft || 0),
      frozenHeaderScrollTop: Number(this.state.scrollTop || 0),
      frozenHeaderVisible: Number(this.state.scrollTop || 0) > 0,
      headerHeight: metrics.headerHeight,
      height: metrics.height,
      loopBounds: this.state.loopBounds?.ok ? {
        endLabel: this.state.loopBounds.endSection.label,
        endStep: this.state.loopBounds.endSection.endStep,
        startLabel: this.state.loopBounds.startSection.label,
        startStep: this.state.loopBounds.startSection.startStep
      } : null,
      noteCount: this.state.notes.length,
      sourceCounts: this.noteSourceCounts(),
      hoverCell: this.state.hoverCell,
      playbackSection: this.sectionForStep(this.state.playheadStep) ? {
        color: sectionTone(this.sectionForStep(this.state.playheadStep).colorIndex),
        colorIndex: this.sectionForStep(this.state.playheadStep).colorIndex,
        index: this.state.sections.indexOf(this.sectionForStep(this.state.playheadStep)),
        label: this.sectionForStep(this.state.playheadStep).label
      } : null,
      playheadStep: this.state.playheadStep,
      playheadRenderLoop: "raf",
      renderFrame: this.renderFrame,
      rows: this.state.rows.map((row) => ({ keyKind: keyKind(row), label: row.label, value: row.value })),
      selectedCell: this.state.selectedCell,
      selectedLane: this.state.selectedLane,
      selectedSection: this.state.selectedSection ? {
        color: sectionTone(this.state.selectedSection.colorIndex),
        colorIndex: this.state.selectedSection.colorIndex,
        endStep: this.state.selectedSection.endStep,
        label: this.state.selectedSection.label,
        startStep: this.state.selectedSection.startStep
      } : null,
      sectionHeaderLabels: this.state.sections.map((section) => section.label),
      sections: this.state.sections.map((section) => ({
        color: sectionTone(section.colorIndex),
        colorIndex: section.colorIndex,
        endStep: section.endStep,
        label: section.label,
        startStep: section.startStep
      })),
      totalSteps: this.state.totalSteps,
      width: metrics.width
    };
  }
}
