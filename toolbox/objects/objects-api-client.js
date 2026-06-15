import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../src/engine/api/server-api-client.js";

const constants = readServerToolConstants("objects");

function freezeTemplate(template = {}) {
  return Object.freeze({
    ...template,
    capabilities: Object.freeze(Array.isArray(template.capabilities) ? [...template.capabilities] : []),
  });
}

function freezeStarterObject(object = {}) {
  return Object.freeze({
    ...object,
    render: Object.freeze({ ...(object.render || {}) }),
  });
}

export const CAPABILITY_LABELS = Object.freeze(
  { ...requireServerConstant(constants, "CAPABILITY_LABELS", "objects") },
);

export const OBJECT_TYPE_TEMPLATES = Object.freeze(
  requireServerConstant(constants, "OBJECT_TYPE_TEMPLATES", "objects").map(freezeTemplate),
);

export const OBJECTS_TOOL_TABLES = Object.freeze(requireServerConstant(constants, "OBJECTS_TOOL_TABLES", "objects"));

export const STARTER_OBJECTS = Object.freeze(
  requireServerConstant(constants, "STARTER_OBJECTS", "objects").map(freezeStarterObject),
);

export function createObjectsToolApiRepository(options = {}) {
  return createServerRepositoryClient("objects", options);
}
