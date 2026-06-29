import { isPlainObject } from '../object/objects.js';
import { normalizeText } from "../string/strings.js";

const TOOL_SCHEMA_CACHE = new Map();

function resolveJsonPointer(root, pointer) {
  if (!pointer.startsWith("#/")) {
    return null;
  }
  const segments = pointer
    .slice(2)
    .split("/")
    .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"));
  let current = root;
  for (const segment of segments) {
    if (!isPlainObject(current) && !Array.isArray(current)) {
      return null;
    }
    current = current[segment];
  }
  return current;
}

function validateJsonValueAgainstSchema(value, schema, schemaRoot) {
  const errors = [];
  const seenPointers = new Set();
  const validateBranchSchema = (candidateValue, candidateSchema, candidatePointer, schemaContext) => {
    const beforeCount = errors.length;
    validateNode(candidateValue, candidateSchema, candidatePointer, schemaContext);
    const branchErrors = errors.slice(beforeCount);
    errors.splice(beforeCount, branchErrors.length);
    return branchErrors;
  };

  const keyMatchesPropertyNameSchema = (key, schemaNode) => {
    if (!isPlainObject(schemaNode)) {
      return true;
    }
    if (typeof schemaNode.pattern === "string") {
      try {
        return new RegExp(schemaNode.pattern).test(key);
      } catch {
        return false;
      }
    }
    if (Array.isArray(schemaNode.anyOf) && schemaNode.anyOf.length > 0) {
      return schemaNode.anyOf.some((branch) => keyMatchesPropertyNameSchema(key, branch));
    }
    if (Array.isArray(schemaNode.oneOf) && schemaNode.oneOf.length > 0) {
      return schemaNode.oneOf.some((branch) => keyMatchesPropertyNameSchema(key, branch));
    }
    if (typeof schemaNode.const === "string") {
      return key === schemaNode.const;
    }
    if (Array.isArray(schemaNode.enum) && schemaNode.enum.length > 0) {
      return schemaNode.enum.includes(key);
    }
    return true;
  };

  function validateNode(nodeValue, nodeSchema, pointer, schemaContext) {
    if (!isPlainObject(nodeSchema)) {
      return;
    }

    if (typeof nodeSchema.$ref === "string") {
      const ref = nodeSchema.$ref.trim();
      if (ref.startsWith("#/")) {
        const refPointer = `${ref}@${pointer}`;
        if (seenPointers.has(refPointer)) {
          return;
        }
        seenPointers.add(refPointer);
        const resolved = resolveJsonPointer(schemaContext, ref);
        if (!resolved) {
          errors.push(`${pointer}: unresolved schema ref ${ref}`);
          return;
        }
        validateNode(nodeValue, resolved, pointer, schemaContext);
        return;
      }
      return;
    }

    if (Array.isArray(nodeSchema.oneOf) && nodeSchema.oneOf.length > 0) {
      let branchPass = false;
      for (const branch of nodeSchema.oneOf) {
        const branchErrors = validateBranchSchema(nodeValue, branch, pointer, schemaContext);
        if (branchErrors.length === 0) {
          branchPass = true;
          break;
        }
      }
      if (!branchPass) {
        errors.push(`${pointer}: value does not satisfy any oneOf branch`);
      }
      return;
    }

    if (Array.isArray(nodeSchema.anyOf) && nodeSchema.anyOf.length > 0) {
      let branchPass = false;
      for (const branch of nodeSchema.anyOf) {
        const branchErrors = validateBranchSchema(nodeValue, branch, pointer, schemaContext);
        if (branchErrors.length === 0) {
          branchPass = true;
          break;
        }
      }
      if (!branchPass) {
        errors.push(`${pointer}: value does not satisfy any anyOf branch`);
      }
      return;
    }

    if (Array.isArray(nodeSchema.allOf) && nodeSchema.allOf.length > 0) {
      nodeSchema.allOf.forEach((branch) => {
        validateNode(nodeValue, branch, pointer, schemaContext);
      });
      return;
    }

    if (isPlainObject(nodeSchema.not)) {
      const branchErrors = validateBranchSchema(nodeValue, nodeSchema.not, pointer, schemaContext);
      if (branchErrors.length === 0) {
        errors.push(`${pointer}: value must not satisfy disallowed schema`);
      }
      return;
    }

    if (Object.prototype.hasOwnProperty.call(nodeSchema, "const")) {
      if (nodeValue !== nodeSchema.const) {
        errors.push(`${pointer}: expected const ${JSON.stringify(nodeSchema.const)}`);
        return;
      }
    }

    if (Array.isArray(nodeSchema.enum) && nodeSchema.enum.length > 0) {
      if (!nodeSchema.enum.includes(nodeValue)) {
        errors.push(`${pointer}: value is not in enum`);
        return;
      }
    }

    const schemaType = typeof nodeSchema.type === "string" ? nodeSchema.type : "";
    if (!schemaType) {
      return;
    }

    if (schemaType === "object") {
      if (!isPlainObject(nodeValue)) {
        errors.push(`${pointer}: expected object`);
        return;
      }
      const required = Array.isArray(nodeSchema.required) ? nodeSchema.required : [];
      required.forEach((requiredKey) => {
        if (!Object.prototype.hasOwnProperty.call(nodeValue, requiredKey)) {
          errors.push(`${pointer}: missing required key "${requiredKey}"`);
        }
      });
      const properties = isPlainObject(nodeSchema.properties) ? nodeSchema.properties : {};
      const patternProperties = isPlainObject(nodeSchema.patternProperties) ? nodeSchema.patternProperties : {};
      const propertyNamesSchema = isPlainObject(nodeSchema.propertyNames) ? nodeSchema.propertyNames : null;
      const propertyKeys = Object.keys(nodeValue);

      propertyKeys.forEach((propertyKey) => {
        const propertyPointer = `${pointer}.${propertyKey}`;
        if (propertyNamesSchema && !keyMatchesPropertyNameSchema(propertyKey, propertyNamesSchema)) {
          errors.push(`${pointer}: property name "${propertyKey}" is not allowed by propertyNames`);
          return;
        }
        if (Object.prototype.hasOwnProperty.call(properties, propertyKey)) {
          validateNode(nodeValue[propertyKey], properties[propertyKey], propertyPointer, schemaContext);
          return;
        }

        const matchingPattern = Object.keys(patternProperties).find((pattern) => {
          try {
            return new RegExp(pattern).test(propertyKey);
          } catch {
            return false;
          }
        });
        if (matchingPattern) {
          validateNode(nodeValue[propertyKey], patternProperties[matchingPattern], propertyPointer, schemaContext);
          return;
        }

        if (nodeSchema.additionalProperties === false) {
          errors.push(`${pointer}: unknown key "${propertyKey}"`);
          return;
        }

        if (isPlainObject(nodeSchema.additionalProperties)) {
          validateNode(nodeValue[propertyKey], nodeSchema.additionalProperties, propertyPointer, schemaContext);
        }
      });
      return;
    }

    if (schemaType === "array") {
      if (!Array.isArray(nodeValue)) {
        errors.push(`${pointer}: expected array`);
        return;
      }
      if (isPlainObject(nodeSchema.items)) {
        nodeValue.forEach((item, index) => {
          validateNode(item, nodeSchema.items, `${pointer}[${index}]`, schemaContext);
        });
      }
      return;
    }

    if (schemaType === "string") {
      if (typeof nodeValue !== "string") {
        errors.push(`${pointer}: expected string`);
        return;
      }
      if (Number.isInteger(nodeSchema.minLength) && nodeValue.length < nodeSchema.minLength) {
        errors.push(`${pointer}: string shorter than minLength=${nodeSchema.minLength}`);
      }
      return;
    }

    if (schemaType === "integer") {
      if (!Number.isInteger(nodeValue)) {
        errors.push(`${pointer}: expected integer`);
        return;
      }
      if (typeof nodeSchema.minimum === "number" && nodeValue < nodeSchema.minimum) {
        errors.push(`${pointer}: value below minimum=${nodeSchema.minimum}`);
      }
      return;
    }

    if (schemaType === "number") {
      if (typeof nodeValue !== "number" || Number.isNaN(nodeValue)) {
        errors.push(`${pointer}: expected number`);
        return;
      }
      if (typeof nodeSchema.minimum === "number" && nodeValue < nodeSchema.minimum) {
        errors.push(`${pointer}: value below minimum=${nodeSchema.minimum}`);
      }
      return;
    }

    if (schemaType === "boolean") {
      if (typeof nodeValue !== "boolean") {
        errors.push(`${pointer}: expected boolean`);
      }
      return;
    }

    if (schemaType === "null" && nodeValue !== null) {
      errors.push(`${pointer}: expected null`);
    }
  }

  validateNode(value, schema, "$", schemaRoot);
  return errors;
}

function getSchemaPathForToolId(toolId) {
  const normalizedToolId = normalizeText(toolId).toLowerCase();
  return normalizedToolId ? `/src/shared/schemas/tools/${normalizedToolId}.schema.json` : "";
}

async function readSchemaForTool(toolId) {
  const schemaPath = getSchemaPathForToolId(toolId);
  if (!schemaPath) {
    throw new Error("schema path is unavailable.");
  }
  if (TOOL_SCHEMA_CACHE.has(schemaPath)) {
    return {
      schemaPath,
      schema: TOOL_SCHEMA_CACHE.get(schemaPath)
    };
  }
  const response = await fetch(schemaPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`schema fetch failed (${response.status}).`);
  }
  const schema = await response.json();
  TOOL_SCHEMA_CACHE.set(schemaPath, schema);
  return {
    schemaPath,
    schema
  };
}

function readFailedField(errors = []) {
  const first = normalizeText(errors[0] || "");
  if (!first) {
    return "";
  }
  const splitAt = first.indexOf(":");
  if (splitAt <= 0) {
    return "";
  }
  return normalizeText(first.slice(0, splitAt));
}

export function buildSchemaValidationScreenErrorMessage(options = {}) {
  const toolId = normalizeText(options.toolId);
  const toolName = normalizeText(options.toolName) || toolId || "tool";
  const sourcePath = normalizeText(options.sourcePath) || "unknown";
  const schemaPath = normalizeText(options.schemaPath) || "unknown";
  const failedField = normalizeText(options.failedField) || "unknown";
  const summary = normalizeText(options.summary) || "schema validation failed";
  return `Input validation failed. tool=${toolId || "unknown"} (${toolName}); source=${sourcePath}; schema=${schemaPath}; failed=${failedField}; summary=${summary}`;
}

export async function enforceToolPresetSchemaOnlyContract(options = {}) {
  const toolId = normalizeText(options.toolId).toLowerCase();
  const sourcePath = normalizeText(options.sourcePath);
  const toolName = normalizeText(options.toolName) || toolId;
  const value = options.value;

  if (!toolId) {
    return {
      valid: true,
      schemaPath: "",
      errors: []
    };
  }

  const { schemaPath, schema } = await readSchemaForTool(toolId);
  const errors = validateJsonValueAgainstSchema(value, schema, schema);
  if (errors.length === 0) {
    return {
      valid: true,
      schemaPath,
      errors: []
    };
  }

  const failedField = readFailedField(errors);
  const summary = errors.slice(0, 3).join(" | ");
  throw new Error(buildSchemaValidationScreenErrorMessage({
    toolId,
    toolName,
    sourcePath,
    schemaPath,
    failedField,
    summary
  }));
}
