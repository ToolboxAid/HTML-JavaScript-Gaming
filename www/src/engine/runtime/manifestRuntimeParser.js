/*
Toolbox Aid
David Quesenberry
06/02/2026
manifestRuntimeParser.js
*/

export const MANIFEST_RUNTIME_SCHEMA = "html-js-gaming.game-manifest";

export const MANIFEST_RUNTIME_PARSER_ERRORS = Object.freeze({
  PAYLOAD_INVALID: "MANIFEST_RUNTIME_PAYLOAD_INVALID",
  SCHEMA_REQUIRED: "MANIFEST_RUNTIME_SCHEMA_REQUIRED",
  SCHEMA_INVALID: "MANIFEST_RUNTIME_SCHEMA_INVALID",
  VERSION_REQUIRED: "MANIFEST_RUNTIME_VERSION_REQUIRED",
  VERSION_INVALID: "MANIFEST_RUNTIME_VERSION_INVALID",
  GAME_REQUIRED: "MANIFEST_RUNTIME_GAME_REQUIRED",
  GAME_ID_REQUIRED: "MANIFEST_RUNTIME_GAME_ID_REQUIRED",
  GAME_NAME_REQUIRED: "MANIFEST_RUNTIME_GAME_NAME_REQUIRED",
  GAME_FOLDER_REQUIRED: "MANIFEST_RUNTIME_GAME_FOLDER_REQUIRED",
  LAUNCH_REQUIRED: "MANIFEST_RUNTIME_LAUNCH_REQUIRED",
  DIRECT_PATH_REQUIRED: "MANIFEST_RUNTIME_DIRECT_PATH_REQUIRED",
  WORKSPACE_MANAGER_PATH_INVALID: "MANIFEST_RUNTIME_WORKSPACE_MANAGER_PATH_INVALID",
  WORKSPACE_MANAGER_OPTIONAL_INVALID: "MANIFEST_RUNTIME_WORKSPACE_MANAGER_OPTIONAL_INVALID",
  SCREEN_INVALID: "MANIFEST_RUNTIME_SCREEN_INVALID",
  SCREEN_WIDTH_INVALID: "MANIFEST_RUNTIME_SCREEN_WIDTH_INVALID",
  SCREEN_HEIGHT_INVALID: "MANIFEST_RUNTIME_SCREEN_HEIGHT_INVALID",
  TOOLS_INVALID: "MANIFEST_RUNTIME_TOOLS_INVALID",
  OBJECTS_INVALID: "MANIFEST_RUNTIME_OBJECTS_INVALID",
  RULES_INVALID: "MANIFEST_RUNTIME_RULES_INVALID",
});

export function parseManifestRuntimePayload(payload, { sourcePath = "" } = {}) {
  const errors = [];

  if (!isRecord(payload)) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.PAYLOAD_INVALID,
      "Manifest runtime payload must be an object.",
      "manifest"
    ));

    return createParserResult({ manifest: null, errors });
  }

  validateSchema(payload, errors);
  validateVersion(payload, errors);
  validateGame(payload.game, errors);
  validateLaunch(payload.launch, errors);
  validateScreen(payload.screen, errors);
  validateRecordField(payload.tools, "tools", MANIFEST_RUNTIME_PARSER_ERRORS.TOOLS_INVALID, errors);
  validateRecordField(payload.objects, "objects", MANIFEST_RUNTIME_PARSER_ERRORS.OBJECTS_INVALID, errors);
  validateRecordField(payload.rules, "rules", MANIFEST_RUNTIME_PARSER_ERRORS.RULES_INVALID, errors);

  if (errors.length > 0) {
    return createParserResult({ manifest: null, errors });
  }

  const manifest = {
    sourcePath: normalizeString(sourcePath),
    schema: payload.schema,
    version: payload.version,
    game: cloneJson(payload.game),
    launch: cloneJson(payload.launch),
    screen: payload.screen === undefined ? null : cloneJson(payload.screen),
    tools: payload.tools === undefined ? Object.freeze({}) : freezeClone(payload.tools),
    objects: payload.objects === undefined ? Object.freeze({}) : freezeClone(payload.objects),
    rules: payload.rules === undefined ? Object.freeze({}) : freezeClone(payload.rules),
  };

  return createParserResult({ manifest: Object.freeze(manifest), errors });
}

function validateSchema(payload, errors) {
  if (!hasNonEmptyString(payload.schema)) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.SCHEMA_REQUIRED,
      "Manifest runtime payload requires schema.",
      "schema"
    ));
    return;
  }

  if (payload.schema !== MANIFEST_RUNTIME_SCHEMA) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.SCHEMA_INVALID,
      `Manifest runtime schema must be ${MANIFEST_RUNTIME_SCHEMA}.`,
      "schema"
    ));
  }
}

function validateVersion(payload, errors) {
  if (payload.version === undefined || payload.version === null) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.VERSION_REQUIRED,
      "Manifest runtime payload requires version.",
      "version"
    ));
    return;
  }

  if (!Number.isInteger(payload.version) || payload.version < 1) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.VERSION_INVALID,
      "Manifest runtime version must be a positive integer.",
      "version"
    ));
  }
}

function validateGame(game, errors) {
  if (!isRecord(game)) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.GAME_REQUIRED,
      "Manifest runtime payload requires game.",
      "game"
    ));
    return;
  }

  if (!hasNonEmptyString(game.id)) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.GAME_ID_REQUIRED,
      "Manifest runtime game requires id.",
      "game.id"
    ));
  }

  if (!hasNonEmptyString(game.name)) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.GAME_NAME_REQUIRED,
      "Manifest runtime game requires name.",
      "game.name"
    ));
  }

  if (!hasNonEmptyString(game.folder)) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.GAME_FOLDER_REQUIRED,
      "Manifest runtime game requires folder.",
      "game.folder"
    ));
  }
}

function validateLaunch(launch, errors) {
  if (!isRecord(launch)) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.LAUNCH_REQUIRED,
      "Manifest runtime payload requires launch.",
      "launch"
    ));
    return;
  }

  if (!hasNonEmptyString(launch.directPath)) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.DIRECT_PATH_REQUIRED,
      "Manifest runtime launch requires directPath.",
      "launch.directPath"
    ));
  }

  if (launch.workspaceManagerPath !== undefined && !hasNonEmptyString(launch.workspaceManagerPath)) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.WORKSPACE_MANAGER_PATH_INVALID,
      "Manifest runtime workspaceManagerPath must be a non-empty string when provided.",
      "launch.workspaceManagerPath"
    ));
  }

  if (launch.workspaceManagerOptional !== undefined && typeof launch.workspaceManagerOptional !== "boolean") {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.WORKSPACE_MANAGER_OPTIONAL_INVALID,
      "Manifest runtime workspaceManagerOptional must be boolean when provided.",
      "launch.workspaceManagerOptional"
    ));
  }
}

function validateScreen(screen, errors) {
  if (screen === undefined || screen === null) {
    return;
  }

  if (!isRecord(screen)) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.SCREEN_INVALID,
      "Manifest runtime screen must be an object when provided.",
      "screen"
    ));
    return;
  }

  if (!Number.isInteger(screen.width) || screen.width < 1) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.SCREEN_WIDTH_INVALID,
      "Manifest runtime screen.width must be a positive integer.",
      "screen.width"
    ));
  }

  if (!Number.isInteger(screen.height) || screen.height < 1) {
    errors.push(createRuntimeManifestError(
      MANIFEST_RUNTIME_PARSER_ERRORS.SCREEN_HEIGHT_INVALID,
      "Manifest runtime screen.height must be a positive integer.",
      "screen.height"
    ));
  }
}

function validateRecordField(value, path, errorCode, errors) {
  if (value === undefined || value === null) {
    return;
  }

  if (!isRecord(value)) {
    errors.push(createRuntimeManifestError(
      errorCode,
      `Manifest runtime ${path} must be an object when provided.`,
      path
    ));
  }
}

function createParserResult({ manifest, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    manifest,
    errors: Object.freeze(errors),
  });
}

function createRuntimeManifestError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function freezeClone(value) {
  return Object.freeze(cloneJson(value));
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}
