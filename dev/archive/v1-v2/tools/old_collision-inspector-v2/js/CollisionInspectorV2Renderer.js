import { createWorldScreenTransform } from '../../../src/engine/rendering/WorldScreenTransform.js';
import { headingPointFromRotation } from '../../../src/engine/rendering/OrientationTransform.js';
import {
  clampCollisionZoom,
  COLLISION_ZOOM_DEFAULT
} from "./constants.js";

export class CollisionInspectorV2Renderer {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.transform = createWorldScreenTransform();
    this.zoom = COLLISION_ZOOM_DEFAULT;
    this.viewportPan = { x: 0, y: 0 };
  }

  setViewportSize(width, height) {
    this.transform = createWorldScreenTransform({
      screenHeight: height,
      screenWidth: width,
      userZoom: this.zoom
    });
    this.canvas.width = this.transform.screenWidth;
    this.canvas.height = this.transform.screenHeight;
    this.canvas.style.setProperty("--collision-inspector-aspect-ratio", this.transform.cssAspectRatio);
    this.canvas.style.setProperty("--collision-inspector-screen-width", `${this.transform.cssWidth}px`);
    this.canvas.style.setProperty("--collision-inspector-screen-height", `${this.transform.cssHeight}px`);
  }

  setZoom(zoom) {
    this.zoom = clampCollisionZoom(zoom);
    this.transform = createWorldScreenTransform({
      screenHeight: this.canvas.height,
      screenWidth: this.canvas.width,
      userZoom: this.zoom
    });
  }

  setZoomAtClientPoint(zoom, event) {
    const before = this.canvasPoint(event);
    this.setZoom(zoom);
    const after = this.canvasPoint(event);
    this.viewportPan = {
      x: Number((this.viewportPan.x + before.x - after.x).toFixed(6)),
      y: Number((this.viewportPan.y + before.y - after.y).toFixed(6))
    };
    return { ...this.viewportPan };
  }

  clear() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#070b0c";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  canvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    const screenPoint = this.transform.clientPointToScreenPoint(event, rect);
    const worldPoint = this.transform.screenPointToWorldWithUserZoom(screenPoint);
    return {
      x: worldPoint.x + this.viewportPan.x,
      y: worldPoint.y + this.viewportPan.y
    };
  }

  panViewportByClientDelta(deltaX, deltaY) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return { ...this.viewportPan };
    }
    const screenDeltaX = (Number(deltaX) / rect.width) * this.canvas.width;
    const screenDeltaY = (Number(deltaY) / rect.height) * this.canvas.height;
    this.viewportPan = {
      x: Number((this.viewportPan.x - screenDeltaX / this.zoom).toFixed(3)),
      y: Number((this.viewportPan.y - screenDeltaY / this.zoom).toFixed(3))
    };
    return { ...this.viewportPan };
  }

  resetViewportPan() {
    this.viewportPan = { x: 0, y: 0 };
  }

  setDragging(isDragging) {
    this.canvas.classList.toggle("is-dragging", isDragging);
  }

  capturePointer(pointerId) {
    try {
      this.canvas.setPointerCapture?.(pointerId);
    } catch {
      // Pointer capture is best-effort for synthetic validation events.
    }
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
    this.transform.applyViewportTransform(ctx);
    ctx.translate(-this.viewportPan.x, -this.viewportPan.y);
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
    return this.transform.center;
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
    const rotationOptions = {
      rotationUnit: geometry.instance?.rotationUnit || "degrees"
    };
    const headingEnd = headingPointFromRotation(origin, geometry.instance?.rotation, {
      ...rotationOptions,
      length: 34
    });
    const headingLabel = headingPointFromRotation(origin, geometry.instance?.rotation, {
      ...rotationOptions,
      length: 40
    });
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2 / this.zoom;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5 / this.zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(headingEnd.x, headingEnd.y);
    ctx.stroke();
    ctx.font = `${Math.max(9, 11 / this.zoom)}px ui-monospace, monospace`;
    ctx.fillText("heading", headingLabel.x, headingLabel.y);
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
