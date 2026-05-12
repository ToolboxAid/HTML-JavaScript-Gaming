const ROOT_KEYS = Object.freeze(["objects", "palette"]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
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
          name: object.name.trim()
        }))
      }
    };
  }
}
