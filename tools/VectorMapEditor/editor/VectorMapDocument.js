/*
Toolbox Aid
David Quesenberry
03/25/2026
VectorMapDocument.js
*/
const DEFAULT_DOCUMENT = {
  version: 2,
  name: "untitled",
  mode: "2d",
  width: 1280,
  height: 720,
  background: "#000000",
  objects: []
};

function nextId(prefix = "obj") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class VectorMapDocument {
  constructor(data = null) {
    this.data = data ? this.normalizeDocument(data) : this.createDefault();
  }

  createDefault() {
    return clone(DEFAULT_DOCUMENT);
  }

  normalizeDocument(input) {
    const data = clone({ ...DEFAULT_DOCUMENT, ...(input || {}) });
    data.version = Number.isFinite(data.version) ? data.version : 2;
    data.name = String(data.name || "untitled");
    data.mode = data.mode === "3d" ? "3d" : "2d";
    data.width = Number.isFinite(Number(data.width)) ? Number(data.width) : DEFAULT_DOCUMENT.width;
    data.height = Number.isFinite(Number(data.height)) ? Number(data.height) : DEFAULT_DOCUMENT.height;
    data.background = typeof data.background === "string" ? data.background : "#000000";
    data.objects = Array.isArray(data.objects) ? data.objects.map((object) => this.normalizeObject(object)) : [];
    return data;
  }

  normalizeObject(object) {
    const kind = object?.kind || "polyline";
    const space = object?.space === "3d" ? "3d" : "2d";
    const closed = Boolean(object?.closed);
    return {
      id: object?.id || nextId("obj"),
      name: object?.name || kind,
      kind,
      space,
      closed,
      center: this.normalizePoint(object?.center || { x: 0, y: 0, z: 0 }, "#ff7ef4"),
      rotation: {
        x: Number(object?.rotation?.x || 0),
        y: Number(object?.rotation?.y || 0),
        z: Number(object?.rotation?.z || 0)
      },
      style: {
        stroke: object?.style?.stroke || "#ffffff",
        fill: object?.style?.fill ?? null,
        lineWidth: Number(object?.style?.lineWidth || 2)
      },
      points: Array.isArray(object?.points) ? object.points.map((point) => this.normalizePoint(point)) : []
    };
  }

  normalizePoint(point, fallbackColor = "#ffffff") {
    return {
      x: Number(point?.x || 0),
      y: Number(point?.y || 0),
      z: Number(point?.z || 0),
      color: typeof point?.color === "string" ? point.color : fallbackColor
    };
  }

  getData() {
    return this.data;
  }

  setData(nextData) {
    this.data = this.normalizeDocument(nextData);
  }

  setMode(mode) {
    this.data.mode = mode === "3d" ? "3d" : "2d";
  }

  setDocumentProperties({ name, width, height, background }) {
    if (typeof name === "string") {
      this.data.name = name;
    }
    if (Number.isFinite(Number(width))) {
      this.data.width = Number(width);
    }
    if (Number.isFinite(Number(height))) {
      this.data.height = Number(height);
    }
    if (typeof background === "string" && background.trim()) {
      this.data.background = background.trim();
    }
  }

  getObjects() {
    return this.data.objects;
  }

  getObjectById(objectId) {
    return this.data.objects.find((object) => object.id === objectId) || null;
  }

  addObject(partialObject = {}) {
    const object = this.normalizeObject({
      id: partialObject.id || nextId("obj"),
      name: partialObject.name,
      kind: partialObject.kind || "polyline",
      space: partialObject.space || this.data.mode,
      closed: partialObject.closed ?? false,
      center: partialObject.center || { x: 0, y: 0, z: 0 },
      rotation: partialObject.rotation || { x: 0, y: 0, z: 0 },
      style: partialObject.style || { stroke: "#ffffff", fill: null, lineWidth: 2 },
      points: partialObject.points || []
    });
    this.data.objects.push(object);
    return object;
  }

  duplicateObject(objectId) {
    const object = this.getObjectById(objectId);
    if (!object) {
      return null;
    }
    const copy = clone(object);
    copy.id = nextId("obj");
    copy.name = `${object.name || object.kind} Copy`;
    copy.points = copy.points.map((point) => ({ ...point, x: point.x + 16, y: point.y + 16 }));
    copy.center = { ...copy.center, x: copy.center.x + 16, y: copy.center.y + 16 };
    this.data.objects.push(copy);
    return copy;
  }

  removeObject(objectId) {
    const index = this.data.objects.findIndex((object) => object.id === objectId);
    if (index >= 0) {
      this.data.objects.splice(index, 1);
      return true;
    }
    return false;
  }

  renameObject(objectId, name) {
    const object = this.getObjectById(objectId);
    if (!object) {
      return;
    }
    object.name = String(name || object.name);
  }

  setObjectRotation(objectId, rotation) {
    const object = this.getObjectById(objectId);
    if (!object) {
      return;
    }
    object.rotation.x = Number(rotation?.x || 0);
    object.rotation.y = Number(rotation?.y || 0);
    object.rotation.z = Number(rotation?.z || 0);
  }

  setObjectCenter(objectId, center) {
    const object = this.getObjectById(objectId);
    if (!object) {
      return;
    }
    object.center = this.normalizePoint(center, "#ff7ef4");
  }

  addPointToObject(objectId, point) {
    const object = this.getObjectById(objectId);
    if (!object) {
      return null;
    }
    const normalizedPoint = this.normalizePoint(point);
    object.points.push(normalizedPoint);
    return normalizedPoint;
  }

  updatePoint(objectId, pointIndex, partialPoint) {
    const object = this.getObjectById(objectId);
    if (!object || !object.points[pointIndex]) {
      return;
    }
    object.points[pointIndex] = this.normalizePoint({
      ...object.points[pointIndex],
      ...partialPoint
    }, object.points[pointIndex].color);
  }

  removePoint(objectId, pointIndex) {
    const object = this.getObjectById(objectId);
    if (!object || pointIndex < 0 || pointIndex >= object.points.length) {
      return false;
    }
    object.points.splice(pointIndex, 1);
    return true;
  }

  replacePoints(objectId, points) {
    const object = this.getObjectById(objectId);
    if (!object) {
      return;
    }
    object.points = points.map((point) => this.normalizePoint(point));
  }

  toJSON() {
    return clone(this.data);
  }
}
