const ROOT_KEYS = Object.freeze(["objects", "palette"]);
const SHAPE_TYPES = Object.freeze(["rectangle", "circle", "ellipse", "line", "polygon", "arc", "text"]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export class ObjectVectorStudioV2SchemaService {
  validatePayload(payload) {
    const errors = [];
    if (!isPlainObject(payload)) {
      return {
        errors: ["root payload must be an object."],
        ok: false,
        payload: null
      };
    }

    Object.keys(payload).forEach((key) => {
      if (!ROOT_KEYS.includes(key)) {
        errors.push(`root.${key} is not allowed.`);
      }
    });

    const palette = payload.palette;
    if (!isPlainObject(palette)) {
      errors.push("root.palette is required.");
    } else {
      if (!hasText(palette.id)) {
        errors.push("root.palette.id is required.");
      }
      if (!Array.isArray(palette.swatches) || palette.swatches.length === 0) {
        errors.push("root.palette.swatches must contain at least one swatch.");
      }
    }

    const objects = payload.objects;
    if (!Array.isArray(objects)) {
      errors.push("root.objects must be an array.");
    } else {
      objects.forEach((object, index) => {
        if (!isPlainObject(object)) {
          errors.push(`root.objects[${index}] must be an object.`);
          return;
        }
        if (!hasText(object.id)) {
          errors.push(`root.objects[${index}].id is required.`);
        }
        if (!hasText(object.name)) {
          errors.push(`root.objects[${index}].name is required.`);
        }
        this.validateShapes(object, index, errors);
      });
    }

    if (errors.length) {
      return { errors, ok: false, payload: null };
    }

    return {
      errors: [],
      ok: true,
      payload: {
        palette: {
          ...palette,
          id: palette.id.trim()
        },
        objects: objects.map((object) => ({
          ...object,
          id: object.id.trim(),
          name: object.name.trim(),
          shapes: object.shapes.map((shape) => ({
            ...shape,
            id: shape.id.trim(),
            type: shape.type.trim().toLowerCase()
          }))
        }))
      }
    };
  }

  validateShapes(object, objectIndex, errors) {
    if (!Array.isArray(object.shapes)) {
      errors.push(`root.objects[${objectIndex}].shapes must be an array.`);
      return;
    }

    object.shapes.forEach((shape, shapeIndex) => {
      const shapePath = `root.objects[${objectIndex}].shapes[${shapeIndex}]`;
      if (!isPlainObject(shape)) {
        errors.push(`${shapePath} must be an object.`);
        return;
      }
      if (!hasText(shape.id)) {
        errors.push(`${shapePath}.id is required.`);
      }
      if (!hasText(shape.type) || !SHAPE_TYPES.includes(shape.type.trim().toLowerCase())) {
        errors.push(`${shapePath}.type must be one of ${SHAPE_TYPES.join(", ")}.`);
      }
      if (!isFiniteNumber(shape.order)) {
        errors.push(`${shapePath}.order must be a number.`);
      }
      if (typeof shape.visible !== "boolean") {
        errors.push(`${shapePath}.visible must be true or false.`);
      }
      if (typeof shape.locked !== "boolean") {
        errors.push(`${shapePath}.locked must be true or false.`);
      }
      if (!isPlainObject(shape.geometry)) {
        errors.push(`${shapePath}.geometry is required.`);
      } else {
        this.validateShapeGeometry(shape, shapePath, errors);
      }
      if (!isPlainObject(shape.style)) {
        errors.push(`${shapePath}.style is required.`);
      } else {
        if (!hasText(shape.style.fill)) {
          errors.push(`${shapePath}.style.fill is required.`);
        }
        if (!hasText(shape.style.stroke)) {
          errors.push(`${shapePath}.style.stroke is required.`);
        }
        if (!isFiniteNumber(shape.style.strokeWidth)) {
          errors.push(`${shapePath}.style.strokeWidth must be a number.`);
        }
      }
    });
  }

  validateShapeGeometry(shape, shapePath, errors) {
    const type = typeof shape.type === "string" ? shape.type.trim().toLowerCase() : "";
    const geometry = shape.geometry;
    if (type === "rectangle") {
      this.requireNumbers(geometry, ["x", "y", "width", "height"], `${shapePath}.geometry`, errors);
      return;
    }
    if (type === "circle") {
      this.requireNumbers(geometry, ["cx", "cy", "r"], `${shapePath}.geometry`, errors);
      return;
    }
    if (type === "ellipse") {
      this.requireNumbers(geometry, ["cx", "cy", "rx", "ry"], `${shapePath}.geometry`, errors);
      return;
    }
    if (type === "line") {
      this.requireNumbers(geometry, ["x1", "y1", "x2", "y2"], `${shapePath}.geometry`, errors);
      return;
    }
    if (type === "arc") {
      this.requireNumbers(geometry, ["cx", "cy", "r", "startAngle", "endAngle"], `${shapePath}.geometry`, errors);
      return;
    }
    if (type === "text") {
      this.requireNumbers(geometry, ["x", "y", "fontSize"], `${shapePath}.geometry`, errors);
      if (!hasText(geometry.text)) {
        errors.push(`${shapePath}.geometry.text is required.`);
      }
      return;
    }
    if (type === "polygon") {
      if (!Array.isArray(geometry.points) || geometry.points.length < 3) {
        errors.push(`${shapePath}.geometry.points must contain at least three points.`);
        return;
      }
      geometry.points.forEach((point, pointIndex) => {
        const pointPath = `${shapePath}.geometry.points[${pointIndex}]`;
        if (!isPlainObject(point)) {
          errors.push(`${pointPath} must be an object.`);
          return;
        }
        this.requireNumbers(point, ["x", "y"], pointPath, errors);
      });
    }
  }

  requireNumbers(target, keys, path, errors) {
    keys.forEach((key) => {
      if (!isFiniteNumber(target[key])) {
        errors.push(`${path}.${key} must be a number.`);
      }
    });
  }
}
