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
  constructor({ documentModel, selectionModel, transformController, onStatus }) {
    this.documentModel = documentModel;
    this.selectionModel = selectionModel;
    this.transformController = transformController;
    this.onStatus = onStatus;
    this.toolMode = "select";
    this.view = { zoom: 1, offsetX: 240, offsetY: 160 };
    this.drag = null;
    this.hoverPoint = null;
    this.pendingObjectId = null;
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

  screenToWorld(position, mode = "2d") {
    if (mode === "3d") {
      const x = (position.x - this.view.offsetX) / this.view.zoom;
      const y = (position.y - this.view.offsetY) / this.view.zoom;
      return { x, y, z: 0 };
    }
    return {
      x: (position.x - this.view.offsetX) / this.view.zoom,
      y: (position.y - this.view.offsetY) / this.view.zoom,
      z: 0
    };
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
    let pointHit = null;
    const threshold = 10 / this.view.zoom;

    for (const object of [...objects].reverse()) {
      if (object.space !== documentMode) {
        continue;
      }

      for (let index = 0; index < object.points.length; index += 1) {
        if (distanceSquared(object.points[index], worldPoint) <= threshold * threshold) {
          pointHit = { type: "point", objectId: object.id, pointIndex: index };
          break;
        }
      }

      if (pointHit) {
        return pointHit;
      }

      if (object.points.length) {
        const xs = object.points.map((point) => point.x);
        const ys = object.points.map((point) => point.y);
        const bounds = {
          minX: Math.min(...xs) - threshold,
          maxX: Math.max(...xs) + threshold,
          minY: Math.min(...ys) - threshold,
          maxY: Math.max(...ys) + threshold
        };
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
      this.drag = {
        type: "pan",
        startX: position.x,
        startY: position.y,
        offsetX: this.view.offsetX,
        offsetY: this.view.offsetY
      };
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
        this.drag = {
          type: "move-point",
          startWorld: worldPoint,
          originalPoint: { ...selection.point }
        };
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
      this.drag = {
        type: "rotate",
        startX: position.x
      };
      return;
    }

    if (this.toolMode === "setCenter" && this.selectionModel.hasObject()) {
      this.transformController.setCenter(worldPoint);
      this.onStatus?.(`Center set to ${worldPoint.x}, ${worldPoint.y}, ${worldPoint.z}.`);
      return;
    }

    if (this.toolMode === "point") {
      const object = this.documentModel.addObject({
        name: "Point",
        kind: "point",
        space: documentMode,
        closed: false,
        center: worldPoint,
        points: [worldPoint]
      });
      this.selectionModel.selectPoint(object.id, 0);
      return;
    }

    if (this.toolMode === "line") {
      if (!this.pendingObjectId) {
        const object = this.documentModel.addObject({
          name: "Line",
          kind: "line",
          space: documentMode,
          closed: false,
          center: worldPoint,
          points: [worldPoint]
        });
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

  pointerMove(position, { documentMode, snapSize, spaceKey = false }) {
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
      if (!selection.object || !selection.point) {
        return;
      }
      this.documentModel.updatePoint(selection.object.id, selection.pointIndex, worldPoint);
      return;
    }

    if (this.drag.type === "move-object") {
      const selection = this.selectionModel.getSelection(this.documentModel);
      if (!selection.object) {
        return;
      }

      const delta = {
        x: worldPoint.x - this.drag.startWorld.x,
        y: worldPoint.y - this.drag.startWorld.y,
        z: worldPoint.z - this.drag.startWorld.z
      };

      selection.object.points = this.drag.originalPoints.map((point) => ({
        ...point,
        x: point.x + delta.x,
        y: point.y + delta.y,
        z: point.z + delta.z
      }));

      selection.object.center = {
        ...this.drag.originalCenter,
        x: this.drag.originalCenter.x + delta.x,
        y: this.drag.originalCenter.y + delta.y,
        z: this.drag.originalCenter.z + delta.z
      };
      return;
    }

    if (this.drag.type === "rotate") {
      const deltaX = position.x - this.drag.startX;
      this.transformController.applyRotation({ z: deltaX * 0.25 });
      this.drag.startX = position.x;
    }
  }

  pointerUp() {
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
