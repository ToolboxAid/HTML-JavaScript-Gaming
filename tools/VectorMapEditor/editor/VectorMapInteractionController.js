/*
Toolbox Aid
David Quesenberry
03/25/2026
VectorMapInteractionController.js
*/
function distanceSquared(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function pointInBounds(point, bounds) {
  return point.x >= bounds.minX && point.x <= bounds.maxX && point.y >= bounds.minY && point.y <= bounds.maxY;
}

export class VectorMapInteractionController {
  constructor({ documentModel, selectionModel, transformController, collisionTester = null, onStatus, onCollisionResult }) {
    this.documentModel = documentModel;
    this.selectionModel = selectionModel;
    this.transformController = transformController;
    this.collisionTester = collisionTester;
    this.onStatus = onStatus;
    this.onCollisionResult = onCollisionResult;
    this.toolMode = "select";
    this.defaultView = { zoom: 1, offsetX: 240, offsetY: 160 };
    this.view = { ...this.defaultView };
    this.drag = null;
    this.hoverPoint = null;
    this.pendingObjectId = null;
    this.collisionVector = { start: null, end: null };
    this.collisionHit = null;
  }

  setToolMode(toolMode) {
    this.toolMode = toolMode;
  }

  getView() {
    return this.view;
  }

  setView(nextView) {
    this.view = { ...this.view, ...nextView };
  }

  zoomAtPosition(position, factor) {
    const nextZoom = Math.min(8, Math.max(0.2, this.view.zoom * factor));
    if (Math.abs(nextZoom - this.view.zoom) < 0.0001) {
      return this.view.zoom;
    }
    const projectedX = (position.x - this.view.offsetX) / this.view.zoom;
    const projectedY = (position.y - this.view.offsetY) / this.view.zoom;
    this.view.zoom = nextZoom;
    this.view.offsetX = position.x - projectedX * nextZoom;
    this.view.offsetY = position.y - projectedY * nextZoom;
    return this.view.zoom;
  }

  stepZoom(direction, anchor = null) {
    const referencePoint = anchor || { x: this.view.offsetX, y: this.view.offsetY };
    const factor = direction > 0 ? 1.2 : 1 / 1.2;
    return this.zoomAtPosition(referencePoint, factor);
  }

  resetView() {
    this.view = { ...this.defaultView };
    return this.view.zoom;
  }

  getCollisionVector() {
    return this.collisionVector;
  }

  getCollisionHit() {
    return this.collisionHit;
  }

  clearCollisionResult() {
    this.collisionVector = { start: null, end: null };
    this.collisionHit = null;
    this.onCollisionResult?.(null, this.collisionVector);
  }

  screenToWorld(position, mode = "2d") {
    const x = (position.x - this.view.offsetX) / this.view.zoom;
    const y = (position.y - this.view.offsetY) / this.view.zoom;
    return { x, y, z: mode === "3d" ? 0 : 0 };
  }

  snap(worldPoint, snapSize) {
    if (!snapSize || snapSize <= 1) {
      return worldPoint;
    }
    return {
      ...worldPoint,
      x: Math.round(worldPoint.x / snapSize) * snapSize,
      y: Math.round(worldPoint.y / snapSize) * snapSize,
      z: Math.round(worldPoint.z / snapSize) * snapSize
    };
  }

  getHitTarget(worldPoint, documentMode) {
    const objects = this.documentModel.getObjects();
    const threshold = 10 / this.view.zoom;

    for (const object of [...objects].reverse()) {
      if (object.space !== documentMode) {
        continue;
      }
      for (let index = 0; index < object.points.length; index += 1) {
        if (distanceSquared(object.points[index], worldPoint) <= threshold * threshold) {
          return { type: "point", objectId: object.id, pointIndex: index };
        }
      }
      if (object.points.length) {
        const xs = object.points.map((point) => point.x);
        const ys = object.points.map((point) => point.y);
        const bounds = { minX: Math.min(...xs) - threshold, maxX: Math.max(...xs) + threshold, minY: Math.min(...ys) - threshold, maxY: Math.max(...ys) + threshold };
        if (pointInBounds(worldPoint, bounds)) {
          return { type: "object", objectId: object.id };
        }
      }
    }
    return null;
  }

  pointerDown(position, { documentMode, snapSize, shiftKey = false, spaceKey = false }) {
    const worldPoint = this.snap(this.screenToWorld(position, documentMode), snapSize);
    const hit = this.getHitTarget(worldPoint, documentMode);

    if (spaceKey || this.toolMode === "pan") {
      this.drag = { type: "pan", startX: position.x, startY: position.y, offsetX: this.view.offsetX, offsetY: this.view.offsetY };
      return;
    }

    if (this.toolMode === "collisionVector") {
      this.collisionVector = { start: worldPoint, end: worldPoint };
      this.collisionHit = null;
      this.drag = { type: "collision-vector", documentMode, snapSize };
      this.onCollisionResult?.(null, this.collisionVector);
      this.onStatus?.("Collision vector started.");
      return;
    }

    if (this.toolMode === "delete" && hit) {
      if (hit.type === "point") {
        this.documentModel.removePoint(hit.objectId, hit.pointIndex);
        this.selectionModel.selectObject(hit.objectId);
      } else if (hit.type === "object") {
        this.documentModel.removeObject(hit.objectId);
        this.selectionModel.clear();
      }
      return;
    }

    if (this.toolMode === "select" || this.toolMode === "move") {
      if (hit?.type === "point") {
        this.selectionModel.selectPoint(hit.objectId, hit.pointIndex);
        const selection = this.selectionModel.getSelection(this.documentModel);
        this.drag = { type: "move-point", startWorld: worldPoint, originalPoint: { ...selection.point } };
        return;
      }
      if (hit?.type === "object") {
        this.selectionModel.selectObject(hit.objectId);
        const selection = this.selectionModel.getSelection(this.documentModel);
        this.drag = {
          type: "move-object",
          startWorld: worldPoint,
          originalPoints: selection.object.points.map((point) => ({ ...point })),
          originalCenter: { ...selection.object.center }
        };
        return;
      }
      if (!shiftKey) {
        this.selectionModel.clear();
      }
      return;
    }

    if (this.toolMode === "rotate" && this.selectionModel.hasObject()) {
      this.drag = { type: "rotate", startX: position.x };
      return;
    }

    if (this.toolMode === "setCenter" && this.selectionModel.hasObject()) {
      this.transformController.setCenter(worldPoint);
      this.onStatus?.(`Center set to ${worldPoint.x}, ${worldPoint.y}, ${worldPoint.z}.`);
      return;
    }

    if (this.toolMode === "point") {
      const object = this.documentModel.addObject({ name: "Point", kind: "point", space: documentMode, closed: false, center: worldPoint, points: [worldPoint] });
      this.selectionModel.selectPoint(object.id, 0);
      return;
    }

    if (this.toolMode === "line") {
      if (!this.pendingObjectId) {
        const object = this.documentModel.addObject({ name: "Line", kind: "line", space: documentMode, closed: false, center: worldPoint, points: [worldPoint] });
        this.pendingObjectId = object.id;
        this.selectionModel.selectObject(object.id);
        this.onStatus?.("Line started. Click again to finish.");
      } else {
        this.documentModel.addPointToObject(this.pendingObjectId, worldPoint);
        this.pendingObjectId = null;
      }
      return;
    }

    if (this.toolMode === "polyline" || this.toolMode === "polygon") {
      if (!this.pendingObjectId) {
        const object = this.documentModel.addObject({
          name: this.toolMode === "polygon" ? "Polygon" : "Polyline",
          kind: this.toolMode,
          space: documentMode,
          closed: this.toolMode === "polygon",
          center: worldPoint,
          points: [worldPoint]
        });
        this.pendingObjectId = object.id;
        this.selectionModel.selectObject(object.id);
        this.onStatus?.(`${this.toolMode} started. Double-click to finish.`);
      } else {
        this.documentModel.addPointToObject(this.pendingObjectId, worldPoint);
      }
    }
  }

  pointerMove(position, { documentMode, snapSize }) {
    const worldPoint = this.snap(this.screenToWorld(position, documentMode), snapSize);
    this.hoverPoint = worldPoint;
    if (!this.drag) {
      return;
    }

    if (this.drag.type === "pan") {
      this.view.offsetX = this.drag.offsetX + (position.x - this.drag.startX);
      this.view.offsetY = this.drag.offsetY + (position.y - this.drag.startY);
      return;
    }

    if (this.drag.type === "move-point") {
      const selection = this.selectionModel.getSelection(this.documentModel);
      if (selection.object && selection.point) {
        this.documentModel.updatePoint(selection.object.id, selection.pointIndex, worldPoint);
      }
      return;
    }

    if (this.drag.type === "move-object") {
      const selection = this.selectionModel.getSelection(this.documentModel);
      if (!selection.object) {
        return;
      }
      const delta = { x: worldPoint.x - this.drag.startWorld.x, y: worldPoint.y - this.drag.startWorld.y, z: worldPoint.z - this.drag.startWorld.z };
      selection.object.points = this.drag.originalPoints.map((point) => ({ ...point, x: point.x + delta.x, y: point.y + delta.y, z: point.z + delta.z }));
      selection.object.center = { ...this.drag.originalCenter, x: this.drag.originalCenter.x + delta.x, y: this.drag.originalCenter.y + delta.y, z: this.drag.originalCenter.z + delta.z };
      return;
    }

    if (this.drag.type === "rotate") {
      const deltaX = position.x - this.drag.startX;
      this.transformController.applyRotation({ z: deltaX * 0.25 });
      this.drag.startX = position.x;
      return;
    }

    if (this.drag.type === "collision-vector") {
      this.collisionVector = { ...this.collisionVector, end: worldPoint };
      this.collisionHit = this.collisionTester?.test(this.documentModel, this.collisionVector, documentMode) || null;
      this.onCollisionResult?.(this.collisionHit, this.collisionVector);
    }
  }

  pointerUp(position, meta) {
    if (this.drag?.type === "collision-vector") {
      const worldPoint = this.snap(this.screenToWorld(position, meta.documentMode), meta.snapSize);
      this.collisionVector = { ...this.collisionVector, end: worldPoint };
      this.collisionHit = this.collisionTester?.test(this.documentModel, this.collisionVector, meta.documentMode) || null;
      this.onCollisionResult?.(this.collisionHit, this.collisionVector);
      this.onStatus?.(this.collisionHit ? `Hit ${this.collisionHit.objectName}.` : "No collision hit.");
    }
    this.drag = null;
  }

  doubleClick(position, { documentMode, snapSize }) {
    if (!this.pendingObjectId) {
      return;
    }
    const worldPoint = this.snap(this.screenToWorld(position, documentMode), snapSize);
    const object = this.documentModel.getObjectById(this.pendingObjectId);
    if (!object) {
      this.pendingObjectId = null;
      return;
    }
    const lastPoint = object.points[object.points.length - 1];
    if (!lastPoint || distanceSquared(lastPoint, worldPoint) > 0.5) {
      this.documentModel.addPointToObject(this.pendingObjectId, worldPoint);
    }
    this.pendingObjectId = null;
    this.onStatus?.("Shape finished.");
  }

  deleteSelection() {
    const selection = this.selectionModel.getSelection(this.documentModel);
    if (selection.point && Number.isInteger(selection.pointIndex)) {
      this.documentModel.removePoint(selection.object.id, selection.pointIndex);
      this.selectionModel.selectObject(selection.object.id);
      return;
    }
    if (selection.object) {
      this.documentModel.removeObject(selection.object.id);
      this.selectionModel.clear();
    }
  }

  getHoverPoint() {
    return this.hoverPoint;
  }

  cancelPendingShape() {
    this.pendingObjectId = null;
  }
}
