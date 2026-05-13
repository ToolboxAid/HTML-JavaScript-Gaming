const SCHEMA_URL = new URL("../../../schemas/tools/object-vector-studio-v2.schema.json", import.meta.url);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isObjectIdentityId(value) {
  return /^object\.[a-z0-9-]+\.[a-z0-9][a-z0-9.-]*$/.test(String(value || ""));
}

function typeMatches(expectedType, value) {
  if (expectedType === "array") {
    return Array.isArray(value);
  }
  if (expectedType === "object") {
    return isPlainObject(value);
  }
  if (expectedType === "integer") {
    return Number.isInteger(value);
  }
  if (expectedType === "number") {
    return typeof value === "number" && Number.isFinite(value);
  }
  return typeof value === expectedType;
}

function typeDescription(expectedType) {
  if (expectedType === "boolean") {
    return "true or false";
  }
  return expectedType === "object" ? "an object" : `a ${expectedType}`;
}

function resolveSchemaRef(schemaRoot, ref) {
  if (typeof ref !== "string" || !ref.startsWith("#/")) {
    throw new Error(`unsupported schema reference ${ref || "unknown"}`);
  }
  return ref.slice(2).split("/").reduce((current, segment) => current?.[segment], schemaRoot);
}

export class ObjectVectorStudioV2SchemaService {
  constructor({ fetchRef = (...args) => fetch(...args), schemaUrl = SCHEMA_URL } = {}) {
    this.fetchRef = fetchRef;
    this.schema = null;
    this.schemaUrl = schemaUrl;
  }

  get schemaPath() {
    return this.schemaUrl.pathname || String(this.schemaUrl);
  }

  async loadSchema() {
    const response = await this.fetchRef(this.schemaUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`${this.schemaPath} returned ${response.status}`);
    }
    const schema = await response.json();
    const schemaErrors = [];
    this.validateSchemaShape(schema, schemaErrors);
    if (schemaErrors.length) {
      throw new Error(schemaErrors.join(" "));
    }
    this.schema = schema;
    return schema;
  }

  validateSchemaShape(schema, errors) {
    if (!isPlainObject(schema)) {
      errors.push("Object Vector Studio V2 schema root must be an object.");
      return;
    }
    if (schema.$id !== "object-vector-studio-v2.schema.json") {
      errors.push("Object Vector Studio V2 schema id must be object-vector-studio-v2.schema.json.");
    }
    if (schema.additionalProperties !== false) {
      errors.push("Object Vector Studio V2 schema root must reject unknown properties.");
    }
    const requiredRootFields = ["version", "toolId", "name", "objects"];
    if (!Array.isArray(schema.required) || requiredRootFields.some((key) => !schema.required.includes(key))) {
      errors.push("Object Vector Studio V2 schema root must require version, toolId, name, and objects.");
    }
    ["palette", "selection", "viewport", "export"].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(schema.properties || {}, key)) {
        errors.push(`Object Vector Studio V2 schema root must not define ${key}.`);
      }
      if (Object.prototype.hasOwnProperty.call(schema.$defs || {}, key === "export" ? "exportPayload" : key)) {
        errors.push(`Object Vector Studio V2 schema definitions must not define ${key}.`);
      }
    });
    if (schema.properties?.toolId?.const !== "object-vector-studio-v2") {
      errors.push("Object Vector Studio V2 schema toolId must be object-vector-studio-v2.");
    }
    if (!isPlainObject(schema.$defs?.shape) || !Array.isArray(schema.$defs.shape.oneOf)) {
      errors.push("Object Vector Studio V2 schema must define shape variants.");
    }
    if (Object.prototype.hasOwnProperty.call(schema.$defs?.object?.properties || {}, "type")) {
      errors.push("Object Vector Studio V2 object schema must not define object type.");
    }
  }

  validatePayload(payload) {
    if (!this.schema) {
      return {
        errors: ["Object Vector Studio V2 schema is not loaded."],
        ok: false,
        payload: null
      };
    }

    const errors = [];
    this.validateValue(this.schema, payload, "root", errors);
    if (!errors.length) {
      this.validatePayloadReferences(payload, errors);
    }
    if (errors.length) {
      return { errors, ok: false, payload: null };
    }

    return {
      errors: [],
      ok: true,
      payload: this.normalizePayload(payload)
    };
  }

  validatePayloadReferences(payload, errors) {
    const objects = Array.isArray(payload?.objects) ? payload.objects : [];
    const objectsById = new Map();
    objects.forEach((object, index) => {
      if (!isObjectIdentityId(object.id)) {
        errors.push(`root.objects[${index}].id ${object.id} must follow object.game.name.`);
      }
      if (objectsById.has(object.id)) {
        errors.push(`root.objects[${index}].id ${object.id} duplicates an existing object id.`);
        return;
      }
      objectsById.set(object.id, object);
    });

    objects.forEach((object, index) => {
      this.validateInheritanceChain(object, objectsById, `root.objects[${index}]`, errors);
    });

    objects.forEach((object, index) => {
      const shapeIds = this.collectInheritedShapeIds(object, objectsById, new Set(), errors, `root.objects[${index}]`);
      (object.states || []).forEach((state, stateIndex) => {
        state.frames.forEach((frame, frameIndex) => {
          frame.shapeOverrides.forEach((override, overrideIndex) => {
            if (!shapeIds.has(override.shapeId)) {
              errors.push(`root.objects[${index}].states[${stateIndex}].frames[${frameIndex}].shapeOverrides[${overrideIndex}].shapeId ${override.shapeId} must reference a local or inherited shape.`);
            }
          });
        });
      });
    });

    const libraryAssets = Array.isArray(payload?.assetLibrary?.assets) ? payload.assetLibrary.assets : [];
    const assetIds = new Set();
    libraryAssets.forEach((asset, index) => {
      if (assetIds.has(asset.id)) {
        errors.push(`root.assetLibrary.assets[${index}].id ${asset.id} duplicates an existing library asset id.`);
      }
      assetIds.add(asset.id);
      if (!objectsById.has(asset.objectId)) {
        errors.push(`root.assetLibrary.assets[${index}].objectId ${asset.objectId} must reference an existing object.`);
      }
    });
  }

  validateInheritanceChain(object, objectsById, path, errors) {
    const seen = new Set([object.id]);
    let current = object;
    while (current?.baseObjectId) {
      const baseId = current.baseObjectId;
      if (seen.has(baseId)) {
        errors.push(`${path}.baseObjectId creates a circular inheritance chain at ${baseId}.`);
        return;
      }
      const baseObject = objectsById.get(baseId);
      if (!baseObject) {
        errors.push(`${path}.baseObjectId ${baseId} must reference an existing base object.`);
        return;
      }
      seen.add(baseId);
      current = baseObject;
    }
  }

  collectInheritedShapeIds(object, objectsById, seen, errors, path) {
    const shapeIds = new Set();
    if (!object || seen.has(object.id)) {
      if (object) {
        errors.push(`${path}.baseObjectId creates a circular shape inheritance chain at ${object.id}.`);
      }
      return shapeIds;
    }
    seen.add(object.id);
    if (object.baseObjectId) {
      const baseObject = objectsById.get(object.baseObjectId);
      if (baseObject) {
        this.collectInheritedShapeIds(baseObject, objectsById, seen, errors, path).forEach((shapeId) => shapeIds.add(shapeId));
      }
    }
    object.shapes.forEach((shape) => shapeIds.add(shape.id));
    return shapeIds;
  }

  validateRuntimePalette(palette, sourceLabel = "runtime palette") {
    const errors = [];
    if (!isPlainObject(palette)) {
      errors.push(`${sourceLabel} must be a palette object.`);
      return { errors, ok: false, palette: null };
    }
    if (!Array.isArray(palette.swatches) || !palette.swatches.length) {
      errors.push(`${sourceLabel}.swatches must contain at least one swatch.`);
      return { errors, ok: false, palette: null };
    }

    palette.swatches.forEach((swatch, index) => {
      if (!isPlainObject(swatch)) {
        errors.push(`${sourceLabel}.swatches[${index}] must be an object.`);
        return;
      }
      const label = swatch.id || swatch.name || swatch.symbol;
      if (typeof label !== "string" || !label.trim()) {
        errors.push(`${sourceLabel}.swatches[${index}] must provide id, name, or symbol.`);
      }
      const color = swatch.value || swatch.hex || swatch.color;
      if (typeof color !== "string" || !color.trim()) {
        errors.push(`${sourceLabel}.swatches[${index}] must provide value, hex, or color.`);
      }
    });

    if (errors.length) {
      return { errors, ok: false, palette: null };
    }
    return {
      errors: [],
      ok: true,
      palette: clone(palette)
    };
  }

  validateValue(schemaNode, value, path, errors) {
    const schema = schemaNode?.$ref ? resolveSchemaRef(this.schema, schemaNode.$ref) : schemaNode;
    if (!schema) {
      errors.push(`${path} references an unavailable Object Vector Studio V2 schema definition.`);
      return;
    }

    if (Array.isArray(schema.allOf)) {
      schema.allOf.forEach((entry) => this.validateValue(entry, value, path, errors));
      return;
    }

    if (Array.isArray(schema.anyOf)) {
      const matched = schema.anyOf.some((entry) => {
        const optionErrors = [];
        this.validateValue(entry, value, path, optionErrors);
        return optionErrors.length === 0;
      });
      if (!matched) {
        errors.push(`${path} must match at least one allowed schema option.`);
      }
      return;
    }

    if (Array.isArray(schema.oneOf)) {
      const matchedCount = schema.oneOf.reduce((count, entry) => {
        const optionErrors = [];
        this.validateValue(entry, value, path, optionErrors);
        return optionErrors.length === 0 ? count + 1 : count;
      }, 0);
      if (matchedCount !== 1) {
        errors.push(`${path} must match exactly one Object Vector Studio V2 shape schema.`);
      }
      return;
    }

    this.validateConst(schema, value, path, errors);
    this.validateEnum(schema, value, path, errors);
    if (schema.type && !this.validateType(schema, value, path, errors)) {
      return;
    }
    this.validateString(schema, value, path, errors);
    this.validateNumber(schema, value, path, errors);
    this.validateArray(schema, value, path, errors);
    this.validateObject(schema, value, path, errors);
  }

  validateConst(schema, value, path, errors) {
    if (!Object.prototype.hasOwnProperty.call(schema, "const")) {
      return;
    }
    if (value !== schema.const) {
      errors.push(`${path} must be ${schema.const}.`);
    }
  }

  validateEnum(schema, value, path, errors) {
    if (!Array.isArray(schema.enum)) {
      return;
    }
    if (!schema.enum.includes(value)) {
      errors.push(`${path} must be one of ${schema.enum.join(", ")}.`);
    }
  }

  validateType(schema, value, path, errors) {
    if (Array.isArray(schema.type)) {
      const matched = schema.type.some((expectedType) => typeMatches(expectedType, value));
      if (!matched) {
        errors.push(`${path} must be one of ${schema.type.join(", ")}.`);
      }
      return matched;
    }
    const matched = typeMatches(schema.type, value);
    if (!matched) {
      errors.push(`${path} must be ${typeDescription(schema.type)}.`);
    }
    return matched;
  }

  validateString(schema, value, path, errors) {
    if (typeof value !== "string") {
      return;
    }
    if (Number.isInteger(schema.minLength) && value.trim().length < schema.minLength) {
      errors.push(`${path} must contain at least ${schema.minLength} characters.`);
    }
  }

  validateNumber(schema, value, path, errors) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return;
    }
    if (typeof schema.minimum === "number" && value < schema.minimum) {
      errors.push(`${path} must be at least ${schema.minimum}.`);
    }
    if (typeof schema.exclusiveMinimum === "number" && value <= schema.exclusiveMinimum) {
      errors.push(`${path} must be greater than ${schema.exclusiveMinimum}.`);
    }
    if (typeof schema.maximum === "number" && value > schema.maximum) {
      errors.push(`${path} must be at most ${schema.maximum}.`);
    }
  }

  validateArray(schema, value, path, errors) {
    if (!Array.isArray(value)) {
      return;
    }
    if (Number.isInteger(schema.minItems) && value.length < schema.minItems) {
      errors.push(`${path} must contain at least ${schema.minItems} items.`);
    }
    if (schema.items) {
      value.forEach((item, index) => this.validateValue(schema.items, item, `${path}[${index}]`, errors));
    }
  }

  validateObject(schema, value, path, errors) {
    if (!isPlainObject(value)) {
      return;
    }
    if (Array.isArray(schema.required)) {
      schema.required.forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
          errors.push(`${path}.${key} is required.`);
        }
      });
    }
    const properties = isPlainObject(schema.properties) ? schema.properties : {};
    Object.entries(properties).forEach(([key, childSchema]) => {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        this.validateValue(childSchema, value[key], `${path}.${key}`, errors);
      }
    });
    if (schema.additionalProperties === false) {
      Object.keys(value).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) {
          errors.push(`${path}.${key} is not allowed.`);
        }
      });
    }
  }

  normalizePayload(payload) {
    const normalized = clone(payload);
    normalized.name = normalized.name.trim();
    normalized.objects = normalized.objects.map((object) => ({
      ...object,
      baseObjectId: typeof object.baseObjectId === "string" ? object.baseObjectId.trim() : undefined,
      id: object.id.trim(),
      name: object.name.trim(),
      tags: Array.isArray(object.tags) ? object.tags.map((tag) => tag.trim()).filter(Boolean) : undefined,
      states: Array.isArray(object.states)
        ? object.states.map((state) => ({
          ...state,
          id: state.id.trim().toLowerCase(),
          name: state.name.trim(),
          frames: state.frames.map((frame) => ({
            ...frame,
            id: frame.id.trim(),
            shapeOverrides: frame.shapeOverrides.map((override) => ({
              ...override,
              shapeId: override.shapeId.trim()
            }))
          }))
        }))
        : undefined,
      shapes: object.shapes.map((shape) => ({
        ...shape,
        id: shape.id.trim(),
        type: shape.type.trim().toLowerCase()
      }))
    }));
    normalized.objects = normalized.objects.map((object) => {
      if (object.states === undefined) {
        delete object.states;
      }
      if (object.baseObjectId === undefined) {
        delete object.baseObjectId;
      }
      if (object.tags === undefined) {
        delete object.tags;
      }
      return object;
    });
    if (normalized.assetLibrary) {
      normalized.assetLibrary = {
        assets: normalized.assetLibrary.assets.map((asset) => ({
          id: asset.id.trim(),
          name: asset.name.trim(),
          objectId: asset.objectId.trim(),
          tags: asset.tags.map((tag) => tag.trim()).filter(Boolean)
        }))
      };
    }
    return normalized;
  }
}
