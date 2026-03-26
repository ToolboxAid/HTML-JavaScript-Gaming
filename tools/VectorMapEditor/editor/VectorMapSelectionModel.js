/*
Toolbox Aid
David Quesenberry
03/25/2026
VectorMapSelectionModel.js
*/
export class VectorMapSelectionModel {
  constructor() {
    this.clear();
  }

  clear() {
    this.objectId = null;
    this.pointIndex = null;
  }

  selectObject(objectId) {
    this.objectId = objectId;
    this.pointIndex = null;
  }

  selectPoint(objectId, pointIndex) {
    this.objectId = objectId;
    this.pointIndex = pointIndex;
  }

  hasObject() {
    return Boolean(this.objectId);
  }

  hasPoint() {
    return this.hasObject() && Number.isInteger(this.pointIndex);
  }

  isSelectedObject(objectId) {
    return this.objectId === objectId;
  }

  getSelection(documentModel) {
    const object = this.objectId ? documentModel.getObjectById(this.objectId) : null;
    const point = object && Number.isInteger(this.pointIndex) ? object.points[this.pointIndex] || null : null;
    return { object, point, pointIndex: this.pointIndex };
  }

  getSelectionBounds(documentModel) {
    const { object } = this.getSelection(documentModel);
    if (!object || !object.points.length) {
      return null;
    }

    const xs = object.points.map((point) => point.x);
    const ys = object.points.map((point) => point.y);
    const zs = object.points.map((point) => point.z);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
      minZ: Math.min(...zs),
      maxZ: Math.max(...zs)
    };
  }

  getSelectionCenter(documentModel) {
    const selection = this.getSelection(documentModel);
    if (selection.point) {
      return { ...selection.point };
    }
    const bounds = this.getSelectionBounds(documentModel);
    if (!bounds) {
      return { x: 0, y: 0, z: 0 };
    }
    return {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
      z: (bounds.minZ + bounds.maxZ) / 2
    };
  }
}
