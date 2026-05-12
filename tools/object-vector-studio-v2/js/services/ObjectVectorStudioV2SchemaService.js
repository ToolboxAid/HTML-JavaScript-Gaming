const SCHEMA_URL = new URL("../../../schemas/tools/object-vector-studio-v2.schema.json", import.meta.url);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
    if (!Array.isArray(schema.required) || !schema.required.includes("palette") || !schema.required.includes("objects")) {
      errors.push("Object Vector Studio V2 schema root must require palette and objects.");
    }
    if (!isPlainObject(schema.$defs?.shape) || !Array.isArray(schema.$defs.shape.oneOf)) {
      errors.push("Object Vector Studio V2 schema must define shape variants.");
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
    if (errors.length) {
      return { errors, ok: false, payload: null };
    }

    return {
      errors: [],
      ok: true,
      payload: this.normalizePayload(payload)
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
    normalized.palette.id = normalized.palette.id.trim();
    if (typeof normalized.palette.name === "string") {
      normalized.palette.name = normalized.palette.name.trim();
    }
    normalized.palette.swatches = normalized.palette.swatches.map((swatch) => ({
      ...swatch,
      id: swatch.id.trim(),
      name: typeof swatch.name === "string" ? swatch.name.trim() : swatch.name
    }));
    normalized.objects = normalized.objects.map((object) => ({
      ...object,
      id: object.id.trim(),
      name: object.name.trim(),
      type: object.type.trim().toLowerCase(),
      shapes: object.shapes.map((shape) => ({
        ...shape,
        id: shape.id.trim(),
        type: shape.type.trim().toLowerCase()
      }))
    }));
    return normalized;
  }
}
