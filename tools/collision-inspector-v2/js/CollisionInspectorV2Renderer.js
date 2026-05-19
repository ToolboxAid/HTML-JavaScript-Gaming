import { numberValue } from "./constants.js";

export class CollisionInspectorV2Renderer {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.zoom = 1;
  }

  setViewportSize(width, height) {
    this.canvas.width = Math.max(1, Math.floor(numberValue(width, 1)));
    this.canvas.height = Math.max(1, Math.floor(numberValue(height, 1)));
    this.canvas.style.setProperty("--collision-inspector-aspect-ratio", `${this.canvas.width} / ${this.canvas.height}`);
  }

  setZoom(zoom) {
    this.zoom = Math.max(0.5, Math.min(2, numberValue(zoom, 1)));
  }

  clear() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#070b0c";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  canvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    const logical = {
      x: ((event.clientX - rect.left) / rect.width) * this.canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * this.canvas.height
    };
    const center = this.canvasCenter();
    return {
      x: (logical.x - center.x) / this.zoom + center.x,
      y: (logical.y - center.y) / this.zoom + center.y
    };
  }

  setDragging(isDragging) {
    this.canvas.classList.toggle("is-dragging", isDragging);
  }

  capturePointer(pointerId) {
    this.canvas.setPointerCapture?.(pointerId);
  }

  hitObjectAt(point, result) {
    const candidates = [
      { geometry: result?.geometryB, key: "b" },
      { geometry: result?.geometryA, key: "a" }
    ];
    return candidates.find(({ geometry }) => {
      const bounds = geometry?.bounds || {};
      return point.x >= bounds.x
        && point.x <= bounds.x + bounds.width
        && point.y >= bounds.y
        && point.y <= bounds.y + bounds.height;
    })?.key || "";
  }

  render(result) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#070b0c";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    this.applyZoomTransform(ctx);
    this.drawGrid(ctx);
    this.drawGeometry(ctx, result.geometryA, {
      fill: "rgba(13, 148, 136, 0.18)",
      label: "A",
      stroke: "#2dd4bf"
    });
    this.drawGeometry(ctx, result.geometryB, {
      fill: "rgba(180, 83, 9, 0.18)",
      label: "B",
      stroke: "#f59e0b"
    });
    this.drawOrigin(ctx, result.geometryA, "#2dd4bf");
    this.drawOrigin(ctx, result.geometryB, "#f59e0b");
    if (result.overlapBounds) {
      this.drawOverlap(ctx, result.overlapBounds);
    }
    ctx.restore();
  }

  canvasCenter() {
    return {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    };
  }

  applyZoomTransform(ctx) {
    const center = this.canvasCenter();
    ctx.translate(center.x, center.y);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-center.x, -center.y);
  }

  drawGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(226, 232, 240, 0.08)";
    ctx.lineWidth = 1 / this.zoom;
    for (let x = 0; x <= this.canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawOrigin(ctx, geometry, color) {
    if (!geometry?.object) {
      return;
    }
    const origin = geometry.originWorld || { x: 0, y: 0 };
    const rotationRadians = (numberValue(geometry.instance?.rotation) * Math.PI) / 180;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2 / this.zoom;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5 / this.zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + Math.cos(rotationRadians) * 34, origin.y + Math.sin(rotationRadians) * 34);
    ctx.stroke();
    ctx.restore();
  }

  drawGeometry(ctx, geometry, style) {
    if (!geometry) {
      return;
    }
    ctx.save();
    (geometry.polygons || []).forEach((polygon) => {
      if (!polygon.length) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(polygon[0].x, polygon[0].y);
      polygon.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = style.fill;
      ctx.fill();
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 2 / this.zoom;
      ctx.stroke();
    });
    const bounds = geometry.bounds || { x: 0, y: 0, width: 1, height: 1 };
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = 2 / this.zoom;
    ctx.setLineDash([6 / this.zoom, 5 / this.zoom]);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.setLineDash([]);
    ctx.fillStyle = style.stroke;
    ctx.font = `${Math.max(10, 16 / this.zoom)}px ui-monospace, monospace`;
    ctx.fillText(style.label, bounds.x + 6 / this.zoom, bounds.y - 8 / this.zoom);
    ctx.restore();
  }

  drawOverlap(ctx, overlap) {
    ctx.save();
    ctx.fillStyle = "rgba(220, 38, 38, 0.24)";
    ctx.fillRect(overlap.x, overlap.y, overlap.width, overlap.height);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2 / this.zoom;
    ctx.strokeRect(overlap.x, overlap.y, overlap.width, overlap.height);
    ctx.restore();
  }
}
