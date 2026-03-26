/*
Toolbox Aid
David Quesenberry
03/25/2026
VectorMapTransformController.js
*/
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function rotateAroundCenter(point, center, rotation) {
  let x = point.x - center.x;
  let y = point.y - center.y;
  let z = point.z - center.z;

  if (rotation.x) {
    const angle = toRadians(rotation.x);
    const ny = y * Math.cos(angle) - z * Math.sin(angle);
    const nz = y * Math.sin(angle) + z * Math.cos(angle);
    y = ny;
    z = nz;
  }

  if (rotation.y) {
    const angle = toRadians(rotation.y);
    const nx = x * Math.cos(angle) + z * Math.sin(angle);
    const nz = -x * Math.sin(angle) + z * Math.cos(angle);
    x = nx;
    z = nz;
  }

  if (rotation.z) {
    const angle = toRadians(rotation.z);
    const nx = x * Math.cos(angle) - y * Math.sin(angle);
    const ny = x * Math.sin(angle) + y * Math.cos(angle);
    x = nx;
    y = ny;
  }

  return {
    ...point,
    x: x + center.x,
    y: y + center.y,
    z: z + center.z
  };
}

export class VectorMapTransformController {
  constructor(documentModel, selectionModel) {
    this.documentModel = documentModel;
    this.selectionModel = selectionModel;
  }

  translateSelection(delta) {
    const { object, point, pointIndex } = this.selectionModel.getSelection(this.documentModel);
    if (!object) {
      return;
    }

    if (point && Number.isInteger(pointIndex)) {
      this.documentModel.updatePoint(object.id, pointIndex, {
        x: point.x + (delta.x || 0),
        y: point.y + (delta.y || 0),
        z: point.z + (delta.z || 0)
      });
      return;
    }

    object.points = object.points.map((value) => ({
      ...value,
      x: value.x + (delta.x || 0),
      y: value.y + (delta.y || 0),
      z: value.z + (delta.z || 0)
    }));

    object.center = {
      ...object.center,
      x: object.center.x + (delta.x || 0),
      y: object.center.y + (delta.y || 0),
      z: object.center.z + (delta.z || 0)
    };
  }

  applyRotation(rotation) {
    const { object } = this.selectionModel.getSelection(this.documentModel);
    if (!object) {
      return;
    }

    const deltaRotation = {
      x: Number(rotation?.x || 0),
      y: Number(rotation?.y || 0),
      z: Number(rotation?.z || 0)
    };

    object.points = object.points.map((point) => rotateAroundCenter(point, object.center, deltaRotation));
    object.rotation.x += deltaRotation.x;
    object.rotation.y += deltaRotation.y;
    object.rotation.z += deltaRotation.z;
  }

  resetRotation() {
    const { object } = this.selectionModel.getSelection(this.documentModel);
    if (!object) {
      return;
    }
    object.rotation = { x: 0, y: 0, z: 0 };
  }

  setCenter(center) {
    const { object } = this.selectionModel.getSelection(this.documentModel);
    if (!object) {
      return;
    }
    this.documentModel.setObjectCenter(object.id, center);
  }

  autoCenterByBounds() {
    const { object } = this.selectionModel.getSelection(this.documentModel);
    if (!object || !object.points.length) {
      return;
    }
    const xs = object.points.map((point) => point.x);
    const ys = object.points.map((point) => point.y);
    const zs = object.points.map((point) => point.z);
    this.setCenter({
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
      z: (Math.min(...zs) + Math.max(...zs)) / 2
    });
  }

  autoCenterByCentroid() {
    const { object } = this.selectionModel.getSelection(this.documentModel);
    if (!object || !object.points.length) {
      return;
    }
    const total = object.points.reduce((accumulator, point) => {
      accumulator.x += point.x;
      accumulator.y += point.y;
      accumulator.z += point.z;
      return accumulator;
    }, { x: 0, y: 0, z: 0 });

    const count = object.points.length;
    this.setCenter({
      x: total.x / count,
      y: total.y / count,
      z: total.z / count
    });
  }

  autoCenterByOrigin() {
    this.setCenter({ x: 0, y: 0, z: 0 });
  }

  autoCenterBySelection() {
    const center = this.selectionModel.getSelectionCenter(this.documentModel);
    this.setCenter(center);
  }
}
