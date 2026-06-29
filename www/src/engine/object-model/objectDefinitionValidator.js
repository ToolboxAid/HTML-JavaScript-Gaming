/*
Toolbox Aid
David Quesenberry
06/10/2026
objectDefinitionValidator.js
*/

import { OBJECT_DEFINITION_SCHEMA } from "./objectDefinitionSchema.js";
import {
  OBJECT_MODEL_TRAIT_LIST,
  OBJECT_MODEL_TYPE_LIST,
  getObjectModelTrait,
  getObjectModelType,
} from "./objectModelRegistry.js";

export const OBJECT_DEFINITION_VALIDATION_CODES = Object.freeze({
  DEFINITION_INVALID: "OBJECT_DEFINITION_INVALID",
  FIELD_UNKNOWN: "OBJECT_DEFINITION_FIELD_UNKNOWN",
  NAME_REQUIRED: "OBJECT_DEFINITION_NAME_REQUIRED",
  NAME_INVALID: "OBJECT_DEFINITION_NAME_INVALID",
  TYPE_REQUIRED: "OBJECT_DEFINITION_TYPE_REQUIRED",
  TYPE_INVALID: "OBJECT_DEFINITION_TYPE_INVALID",
  TRAITS_REQUIRED: "OBJECT_DEFINITION_TRAITS_REQUIRED",
  TRAITS_INVALID: "OBJECT_DEFINITION_TRAITS_INVALID",
  TRAIT_DUPLICATE: "OBJECT_DEFINITION_TRAIT_DUPLICATE",
  TRAIT_INVALID: "OBJECT_DEFINITION_TRAIT_INVALID",
  RENDER_INVALID: "OBJECT_DEFINITION_RENDER_INVALID",
  RENDER_FIELD_UNKNOWN: "OBJECT_DEFINITION_RENDER_FIELD_UNKNOWN",
  RENDER_TYPE_REQUIRED: "OBJECT_DEFINITION_RENDER_TYPE_REQUIRED",
  RENDER_TYPE_INVALID: "OBJECT_DEFINITION_RENDER_TYPE_INVALID",
  RENDER_ASSET_KEY_REQUIRED: "OBJECT_DEFINITION_RENDER_ASSET_KEY_REQUIRED",
  STATE_INVALID: "OBJECT_DEFINITION_STATE_INVALID",
  FIELD_INVALID: "OBJECT_DEFINITION_FIELD_INVALID",
  DEFINITIONS_INVALID: "OBJECT_DEFINITIONS_INVALID",
});

const OBJECT_DEFINITION_FIELDS = Object.freeze(Object.keys(OBJECT_DEFINITION_SCHEMA.properties));
const OBJECT_DEFINITION_RENDER_FIELDS = Object.freeze(Object.keys(OBJECT_DEFINITION_SCHEMA.properties.render.properties));
const OBJECT_DEFINITION_RENDER_TYPES = Object.freeze(OBJECT_DEFINITION_SCHEMA.properties.render.properties.type.enum);
const OBJECT_DEFINITION_STATES = Object.freeze(OBJECT_DEFINITION_SCHEMA.properties.state.enum);

export function validateObjectDefinition(definition, options = {}) {
  const path = validationPath(options.path, "definition");
  const issues = [];

  if (!isRecord(definition)) {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.DEFINITION_INVALID,
      path,
      "Object definition must be an object.",
      "Provide one object definition with name, type, and traits fields."
    ));
    return createValidationResult({ definition: null, issues });
  }

  Object.keys(definition).forEach((fieldName) => {
    if (OBJECT_DEFINITION_FIELDS.includes(fieldName)) {
      return;
    }
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.FIELD_UNKNOWN,
      `${path}.${fieldName}`,
      `Object definition field ${fieldName} is not declared by the object definition schema.`,
      `Remove ${fieldName} or add it through a future declared object-model contract change.`
    ));
  });

  const name = readRequiredStringField(definition, "name", path, issues, {
    invalidCode: OBJECT_DEFINITION_VALIDATION_CODES.NAME_INVALID,
    invalidMessage: "Object definition name must be text.",
    missingCode: OBJECT_DEFINITION_VALIDATION_CODES.NAME_REQUIRED,
    missingMessage: "Object definition requires a name.",
    missingAction: "Name the object before adding it to the draft list.",
  });

  const type = readRequiredStringField(definition, "type", path, issues, {
    invalidCode: OBJECT_DEFINITION_VALIDATION_CODES.TYPE_INVALID,
    invalidMessage: "Object definition type must be text.",
    missingCode: OBJECT_DEFINITION_VALIDATION_CODES.TYPE_REQUIRED,
    missingMessage: "Object definition requires a type.",
    missingAction: `Choose ${choiceText(OBJECT_MODEL_TYPE_LIST.map((objectType) => objectType.id))}.`,
  });

  if (type && getObjectModelType(type) === null) {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.TYPE_INVALID,
      `${path}.type`,
      `Object definition type ${type} is not registered.`,
      `Choose ${choiceText(OBJECT_MODEL_TYPE_LIST.map((objectType) => objectType.id))}.`
    ));
  }

  const traits = readTraits(definition, path, issues);
  const objectDefinition = {
    name,
    traits,
    type,
  };

  copyOptionalStringField(definition, objectDefinition, "behavior", path, issues);
  copyOptionalStringField(definition, objectDefinition, "id", path, issues);
  copyOptionalStringField(definition, objectDefinition, "interaction", path, issues);
  copyRenderField(definition, objectDefinition, path, issues);
  copyOptionalStringField(definition, objectDefinition, "role", path, issues);
  copyStateField(definition, objectDefinition, path, issues);

  return createValidationResult({
    definition: issues.length === 0 ? Object.freeze(objectDefinition) : null,
    issues,
  });
}

export function validateObjectDefinitionList(definitions, options = {}) {
  const path = validationPath(options.path, "definitions");
  if (!Array.isArray(definitions)) {
    return createListValidationResult({
      definitions: [],
      issues: [
        createIssue(
          OBJECT_DEFINITION_VALIDATION_CODES.DEFINITIONS_INVALID,
          path,
          "Object definitions must be an array.",
          "Provide an array of object definitions before validating a batch."
        ),
      ],
    });
  }

  const objectDefinitions = [];
  const issues = [];

  definitions.forEach((definition, index) => {
    const validation = validateObjectDefinition(definition, { path: `${path}[${index}]` });
    if (validation.valid) {
      objectDefinitions.push(validation.definition);
      return;
    }
    validation.issues.forEach((issue) => {
      issues.push(issue);
    });
  });

  return createListValidationResult({
    definitions: issues.length === 0 ? objectDefinitions : [],
    issues,
  });
}

function readRequiredStringField(definition, fieldName, path, issues, messages) {
  if (!Object.hasOwn(definition, fieldName) || definition[fieldName] === null || definition[fieldName] === undefined) {
    issues.push(createIssue(messages.missingCode, `${path}.${fieldName}`, messages.missingMessage, messages.missingAction));
    return "";
  }

  if (typeof definition[fieldName] !== "string") {
    issues.push(createIssue(
      messages.invalidCode,
      `${path}.${fieldName}`,
      messages.invalidMessage,
      `Set ${fieldName} to a non-empty text value.`
    ));
    return "";
  }

  const value = definition[fieldName].trim();
  if (!value) {
    issues.push(createIssue(messages.missingCode, `${path}.${fieldName}`, messages.missingMessage, messages.missingAction));
  }
  return value;
}

function readTraits(definition, path, issues) {
  if (!Object.hasOwn(definition, "traits")) {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.TRAITS_REQUIRED,
      `${path}.traits`,
      "Object definition requires an explicit traits array.",
      `Declare traits from ${choiceText(OBJECT_MODEL_TRAIT_LIST.map((trait) => trait.id))}.`
    ));
    return Object.freeze([]);
  }

  if (!Array.isArray(definition.traits)) {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.TRAITS_INVALID,
      `${path}.traits`,
      "Object definition traits must be an array.",
      "Use an array of registered trait ids for traits."
    ));
    return Object.freeze([]);
  }

  const traits = [];
  const seenTraits = new Set();
  definition.traits.forEach((traitId, index) => {
    if (typeof traitId !== "string" || !traitId.trim()) {
      issues.push(createIssue(
        OBJECT_DEFINITION_VALIDATION_CODES.TRAIT_INVALID,
        `${path}.traits[${index}]`,
        "Object definition trait ids must be non-empty text.",
        `Use one of ${choiceText(OBJECT_MODEL_TRAIT_LIST.map((trait) => trait.id))}.`
      ));
      return;
    }

    const normalizedTraitId = traitId.trim();
    if (seenTraits.has(normalizedTraitId)) {
      issues.push(createIssue(
        OBJECT_DEFINITION_VALIDATION_CODES.TRAIT_DUPLICATE,
        `${path}.traits[${index}]`,
        `Object definition repeats trait ${normalizedTraitId}.`,
        `Remove the duplicate ${normalizedTraitId} trait.`
      ));
      return;
    }
    seenTraits.add(normalizedTraitId);

    if (getObjectModelTrait(normalizedTraitId) === null) {
      issues.push(createIssue(
        OBJECT_DEFINITION_VALIDATION_CODES.TRAIT_INVALID,
        `${path}.traits[${index}]`,
        `Object definition trait ${normalizedTraitId} is not registered.`,
        `Use one of ${choiceText(OBJECT_MODEL_TRAIT_LIST.map((trait) => trait.id))}.`
      ));
    }
    traits.push(normalizedTraitId);
  });

  return Object.freeze(traits);
}

function copyOptionalStringField(source, target, fieldName, path, issues) {
  if (!Object.hasOwn(source, fieldName) || source[fieldName] === null || source[fieldName] === undefined) {
    return;
  }

  if (typeof source[fieldName] !== "string") {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.FIELD_INVALID,
      `${path}.${fieldName}`,
      `Object definition ${fieldName} must be text when provided.`,
      `Set ${fieldName} to text or remove the field.`
    ));
    return;
  }

  const value = source[fieldName].trim();
  if (value) {
    target[fieldName] = value;
  }
}

function copyRenderField(source, target, path, issues) {
  if (!Object.hasOwn(source, "render") || source.render === null || source.render === undefined) {
    return;
  }

  if (!isRecord(source.render)) {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.RENDER_INVALID,
      `${path}.render`,
      "Object definition render config must be an object when provided.",
      "Use render.type None or Sprite, with assetKey when Sprite is selected."
    ));
    return;
  }

  Object.keys(source.render).forEach((fieldName) => {
    if (OBJECT_DEFINITION_RENDER_FIELDS.includes(fieldName)) {
      return;
    }
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.RENDER_FIELD_UNKNOWN,
      `${path}.render.${fieldName}`,
      `Object definition render field ${fieldName} is not declared by the object definition schema.`,
      `Remove render.${fieldName} or add it through a future declared render contract change.`
    ));
  });

  if (!Object.hasOwn(source.render, "type") || source.render.type === null || source.render.type === undefined) {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.RENDER_TYPE_REQUIRED,
      `${path}.render.type`,
      "Object definition render config requires a render type.",
      `Choose ${choiceText(OBJECT_DEFINITION_RENDER_TYPES)}.`
    ));
    return;
  }

  if (typeof source.render.type !== "string") {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.RENDER_TYPE_INVALID,
      `${path}.render.type`,
      "Object definition render type must be text.",
      `Choose ${choiceText(OBJECT_DEFINITION_RENDER_TYPES)}.`
    ));
    return;
  }

  const renderType = source.render.type.trim();
  if (!OBJECT_DEFINITION_RENDER_TYPES.includes(renderType)) {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.RENDER_TYPE_INVALID,
      `${path}.render.type`,
      `Object definition render type ${renderType} is not supported.`,
      `Choose ${choiceText(OBJECT_DEFINITION_RENDER_TYPES)}.`
    ));
    return;
  }

  const render = { type: renderType };
  copyOptionalRenderStringField(source.render, render, "assetKey", path, issues);
  copyOptionalRenderStringField(source.render, render, "previewPath", path, issues);

  if (renderType === "Sprite" && !render.assetKey) {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.RENDER_ASSET_KEY_REQUIRED,
      `${path}.render.assetKey`,
      "Sprite render config requires a linked sprite asset key.",
      "Create or resolve the sprite asset record before validating the object definition."
    ));
  }

  target.render = Object.freeze(render);
}

function copyOptionalRenderStringField(source, target, fieldName, path, issues) {
  if (!Object.hasOwn(source, fieldName) || source[fieldName] === null || source[fieldName] === undefined) {
    return;
  }

  if (typeof source[fieldName] !== "string") {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.FIELD_INVALID,
      `${path}.render.${fieldName}`,
      `Object definition render ${fieldName} must be text when provided.`,
      `Set render.${fieldName} to text or remove the field.`
    ));
    return;
  }

  const value = source[fieldName].trim();
  if (value) {
    target[fieldName] = value;
  }
}

function copyStateField(source, target, path, issues) {
  if (!Object.hasOwn(source, "state") || source.state === null || source.state === undefined || source.state === "") {
    return;
  }

  if (typeof source.state !== "string") {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.STATE_INVALID,
      `${path}.state`,
      "Object definition state must be text when provided.",
      `Use ${choiceText(OBJECT_DEFINITION_STATES)}.`
    ));
    return;
  }

  const state = source.state.trim();
  if (!OBJECT_DEFINITION_STATES.includes(state)) {
    issues.push(createIssue(
      OBJECT_DEFINITION_VALIDATION_CODES.STATE_INVALID,
      `${path}.state`,
      `Object definition state ${state} is not supported.`,
      `Use ${choiceText(OBJECT_DEFINITION_STATES)}.`
    ));
    return;
  }
  target.state = state;
}

function createValidationResult({ definition, issues }) {
  return Object.freeze({
    definition,
    issues: Object.freeze(issues),
    valid: issues.length === 0,
  });
}

function createListValidationResult({ definitions, issues }) {
  return Object.freeze({
    definitions: Object.freeze(definitions),
    issues: Object.freeze(issues),
    valid: issues.length === 0,
  });
}

function createIssue(code, path, message, action) {
  return Object.freeze({ action, code, message, path });
}

function choiceText(values) {
  if (values.length < 2) {
    return values.join("");
  }
  return `${values.slice(0, -1).join(", ")}, or ${values[values.length - 1]}`;
}

function validationPath(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
