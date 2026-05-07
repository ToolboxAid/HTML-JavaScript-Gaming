const HOST_CONTEXT_STORAGE_KEY = "workspace-manager-v2-active-host-context-id";
const WORKSPACE_MANIFEST_SCHEMA_PATH = "/tools/schemas/workspace.manifest.schema.json";
const ASSET_MANAGER_V2_TOOL_KEY = "asset-manager-v2";
const PALETTE_MANAGER_V2_TOOL_KEY = "palette-manager-v2";
const LEGACY_PALETTE_TOOL_KEY = "palette-browser";

const GAME_OPTIONS = Object.freeze([
  Object.freeze({
    id: "Asteroids",
    name: "Asteroids",
    manifestPath: "/games/Asteroids/game.manifest.json"
  }),
  Object.freeze({
    id: "GravityWell",
    name: "Gravity Well",
    manifestPath: "/games/GravityWell/game.manifest.json"
  }),
  Object.freeze({
    id: "Pong",
    name: "Pong",
    manifestPath: "/games/Pong/game.manifest.json"
  })
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeGameRoot(gameId) {
  const safeGameId = String(gameId || "").trim().replace(/[\\/]+/g, "-");
  return safeGameId ? `games/${safeGameId}/` : "";
}

function makeHostContextId() {
  return `workspace-manager-v2-${Date.now().toString(36)}`;
}

function readPaletteFromManifest(manifest) {
  const palettePayload = manifest?.tools?.[PALETTE_MANAGER_V2_TOOL_KEY] || manifest?.tools?.[LEGACY_PALETTE_TOOL_KEY];
  const palette = isPlainObject(palettePayload?.palette) ? palettePayload.palette : palettePayload;
  const swatches = Array.isArray(palette?.swatches) ? palette.swatches : [];
  return {
    name: String(palette?.name || palettePayload?.name || "Workspace Palette").trim(),
    swatches: clone(swatches)
  };
}

function schemaProperties(schema) {
  return isPlainObject(schema?.properties) ? schema.properties : {};
}

function missingRequiredFields(value, schema) {
  return (Array.isArray(schema?.required) ? schema.required : [])
    .filter((key) => !Object.prototype.hasOwnProperty.call(value, key));
}

function unsupportedFields(value, schema) {
  const properties = schemaProperties(schema);
  return Object.keys(value)
    .filter((key) => !Object.prototype.hasOwnProperty.call(properties, key));
}

function resolvePointer(schema, pointer) {
  if (!pointer || pointer === "#") {
    return schema;
  }
  if (!pointer.startsWith("#/")) {
    return null;
  }
  return pointer
    .slice(2)
    .split("/")
    .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"))
    .reduce((node, key) => (node && typeof node === "object" ? node[key] : undefined), schema) || null;
}

function typeMatches(value, expectedType) {
  if (expectedType === "object") {
    return isPlainObject(value);
  }
  if (expectedType === "array") {
    return Array.isArray(value);
  }
  if (expectedType === "integer") {
    return Number.isInteger(value);
  }
  if (expectedType === "number") {
    return typeof value === "number" && Number.isFinite(value);
  }
  if (expectedType === "string") {
    return typeof value === "string";
  }
  if (expectedType === "boolean") {
    return typeof value === "boolean";
  }
  if (expectedType === "null") {
    return value === null;
  }
  return true;
}

function validateSchemaValue(value, schema, pointer, rootSchema = schema) {
  if (!isPlainObject(schema)) {
    return [];
  }
  if (typeof schema.$ref === "string") {
    const referencedSchema = resolvePointer(rootSchema, schema.$ref);
    return referencedSchema
      ? validateSchemaValue(value, referencedSchema, pointer, rootSchema)
      : [`${pointer}: unresolved schema reference ${schema.$ref}`];
  }

  const errors = [];
  if (Array.isArray(schema.allOf)) {
    schema.allOf.forEach((childSchema) => {
      errors.push(...validateSchemaValue(value, childSchema, pointer, rootSchema));
    });
  }
  if (isPlainObject(schema.not) && validateSchemaValue(value, schema.not, pointer, rootSchema).length === 0) {
    errors.push(`${pointer}: value matches a forbidden schema branch`);
  }
  const expectedTypes = Array.isArray(schema.type) ? schema.type : (schema.type ? [schema.type] : []);
  if (expectedTypes.length && !expectedTypes.some((type) => typeMatches(value, type))) {
    errors.push(`${pointer}: expected ${expectedTypes.join(" or ")}`);
    return errors;
  }
  if (Object.prototype.hasOwnProperty.call(schema, "const") && value !== schema.const) {
    errors.push(`${pointer}: expected ${JSON.stringify(schema.const)}`);
  }
  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    errors.push(`${pointer}: expected one of ${schema.enum.map((entry) => JSON.stringify(entry)).join(", ")}`);
  }
  if (typeof value === "string") {
    if (Number.isFinite(schema.minLength) && value.length < schema.minLength) {
      errors.push(`${pointer}: must be at least ${schema.minLength} characters`);
    }
    if (Number.isFinite(schema.maxLength) && value.length > schema.maxLength) {
      errors.push(`${pointer}: must be no more than ${schema.maxLength} characters`);
    }
    if (typeof schema.pattern === "string" && !(new RegExp(schema.pattern).test(value))) {
      errors.push(`${pointer}: must match ${schema.pattern}`);
    }
  }
  if ((typeof value === "number" || Number.isInteger(value)) && Number.isFinite(schema.minimum) && value < schema.minimum) {
    errors.push(`${pointer}: must be greater than or equal to ${schema.minimum}`);
  }
  if (Array.isArray(value)) {
    if (isPlainObject(schema.items)) {
      value.forEach((item, index) => {
        errors.push(...validateSchemaValue(item, schema.items, `${pointer}[${index}]`, rootSchema));
      });
    }
    if (schema.uniqueItems) {
      const seen = new Set();
      value.forEach((item, index) => {
        const key = JSON.stringify(item);
        if (seen.has(key)) {
          errors.push(`${pointer}[${index}]: duplicate array item`);
        }
        seen.add(key);
      });
    }
  }
  if (isPlainObject(value)) {
    const properties = schemaProperties(schema);
    const patternProperties = isPlainObject(schema.patternProperties) ? schema.patternProperties : {};
    missingRequiredFields(value, schema).forEach((key) => {
      errors.push(`${pointer}.${key} is required`);
    });
    Object.entries(value).forEach(([key, childValue]) => {
      if (isPlainObject(properties[key])) {
        errors.push(...validateSchemaValue(childValue, properties[key], `${pointer}.${key}`, rootSchema));
      }
      const matchedPatternSchemas = Object.entries(patternProperties)
        .filter(([pattern]) => new RegExp(pattern).test(key))
        .map(([, childSchema]) => childSchema);
      matchedPatternSchemas.forEach((childSchema) => {
        errors.push(...validateSchemaValue(childValue, childSchema, `${pointer}.${key}`, rootSchema));
      });
      if (schema.additionalProperties === false && !Object.prototype.hasOwnProperty.call(properties, key) && matchedPatternSchemas.length === 0) {
        errors.push(`${pointer}.${key} is not allowed`);
      }
    });
    if (isPlainObject(schema.propertyNames) && Array.isArray(schema.propertyNames.anyOf)) {
      Object.keys(value).forEach((key) => {
        const matchesNameRule = schema.propertyNames.anyOf.some((rule) => (
          typeof rule?.pattern === "string" && new RegExp(rule.pattern).test(key)
        ));
        if (!matchesNameRule) {
          errors.push(`${pointer}.${key}: property name is not allowed`);
        }
      });
    }
  }
  return errors;
}

export class WorkspaceManagerV2ContextService {
  constructor({
    fetchRef = window.fetch?.bind(window),
    locationRef = window.location,
    sessionStorageRef = window.sessionStorage,
    windowRef = window
  } = {}) {
    this.fetchRef = fetchRef;
    this.location = locationRef;
    this.sessionStorage = sessionStorageRef;
    this.window = windowRef;
  }

  games() {
    return GAME_OPTIONS.map((game) => ({ ...game }));
  }

  async buildContextForGame(gameId) {
    const game = this.games().find((entry) => entry.id === gameId);
    if (!game) {
      return { ok: false, message: "Select a valid game workspace." };
    }
    const manifestResult = await this.fetchGameManifest(game);
    if (!manifestResult.ok) {
      return manifestResult;
    }
    const palette = readPaletteFromManifest(manifestResult.manifest);
    if (!palette.swatches.length) {
      return { ok: false, message: `${game.name} does not expose an active palette in its game manifest.` };
    }
    const gameRoot = normalizeGameRoot(game.id);
    const assetsPath = `${gameRoot}assets`;
    const workspaceManifest = this.buildWorkspaceManifest({
      assetsPath,
      game,
      gameRoot,
      palette
    });
    const validation = await this.validateGeneratedManifest(workspaceManifest);
    if (!validation.ok) {
      return validation;
    }
    return {
      ok: true,
      context: workspaceManifest,
      game: {
        ...game,
        assetsPath,
        gameRoot,
        paletteName: palette.name
      },
      paletteSwatches: clone(palette.swatches)
    };
  }

  async loadWorkspaceManifestSchema() {
    if (typeof this.fetchRef !== "function") {
      return { ok: false, message: "Fetch API is unavailable; Workspace Manager V2 cannot validate workspace manifests." };
    }
    try {
      const response = await this.fetchRef(WORKSPACE_MANIFEST_SCHEMA_PATH, { cache: "no-store" });
      if (!response.ok) {
        return { ok: false, message: `Unable to load ${WORKSPACE_MANIFEST_SCHEMA_PATH}: ${response.status}` };
      }
      const schema = await response.json();
      if (!isPlainObject(schema)) {
        return { ok: false, message: `${WORKSPACE_MANIFEST_SCHEMA_PATH} did not return a schema object.` };
      }
      return { ok: true, schema };
    } catch (error) {
      return { ok: false, message: `Unable to load ${WORKSPACE_MANIFEST_SCHEMA_PATH}: ${error.message}` };
    }
  }

  async validateGeneratedManifest(manifest) {
    const schemaResult = await this.loadWorkspaceManifestSchema();
    if (!schemaResult.ok) {
      return schemaResult;
    }
    const errors = this.validateManifestAgainstSchema(manifest, schemaResult.schema);
    if (!errors.length) {
      const toolValidation = await this.validateToolPayloads(manifest, schemaResult.schema);
      errors.push(...toolValidation.errors);
    }
    return errors.length
      ? { ok: false, message: `Generated Workspace Manager V2 manifest failed schema validation: ${errors.join(" | ")}` }
      : { ok: true };
  }

  validateManifestAgainstSchema(manifest, schema) {
    const errors = [];
    if (!isPlainObject(manifest)) {
      return ["root must be an object"];
    }
    missingRequiredFields(manifest, schema).forEach((key) => {
      errors.push(`root.${key} is required`);
    });
    unsupportedFields(manifest, schema).forEach((key) => {
      errors.push(`root.${key} is not allowed`);
    });

    if (!isPlainObject(manifest.tools)) {
      errors.push("root.tools must be an object");
      return errors;
    }
    const toolsSchema = schemaProperties(schema).tools || {};
    const toolProperties = schemaProperties(toolsSchema);
    missingRequiredFields(manifest.tools, toolsSchema).forEach((key) => {
      errors.push(`root.tools.${key} is required`);
    });
    Object.keys(manifest.tools).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(toolProperties, key)) {
        errors.push(`root.tools.${key} is not allowed`);
      }
    });
    return errors;
  }

  async loadToolPayloadSchema(ref) {
    if (typeof ref !== "string" || !ref.startsWith("./tools/")) {
      return { ok: false, message: `Unsupported workspace manifest schema reference ${ref || "(empty)"}.` };
    }
    const schemaPath = `/tools/schemas/${ref.slice(2)}`;
    try {
      const response = await this.fetchRef(schemaPath, { cache: "no-store" });
      if (!response.ok) {
        return { ok: false, message: `Unable to load ${schemaPath}: ${response.status}` };
      }
      const schema = await response.json();
      return isPlainObject(schema)
        ? { ok: true, schema }
        : { ok: false, message: `${schemaPath} did not return a schema object.` };
    } catch (error) {
      return { ok: false, message: `Unable to load ${schemaPath}: ${error.message}` };
    }
  }

  async validateToolPayloads(manifest, workspaceSchema) {
    const errors = [];
    const toolsSchema = schemaProperties(workspaceSchema).tools || {};
    const toolProperties = schemaProperties(toolsSchema);
    for (const [toolKey, payload] of Object.entries(manifest.tools || {})) {
      const toolSchemaRef = toolProperties[toolKey]?.$ref;
      if (!toolSchemaRef) {
        continue;
      }
      const toolSchemaResult = await this.loadToolPayloadSchema(toolSchemaRef);
      if (!toolSchemaResult.ok) {
        errors.push(toolSchemaResult.message);
        continue;
      }
      errors.push(...validateSchemaValue(payload, toolSchemaResult.schema, `root.tools.${toolKey}`, toolSchemaResult.schema));
    }
    return { ok: errors.length === 0, errors };
  }

  async fetchGameManifest(game) {
    if (typeof this.fetchRef !== "function") {
      return { ok: false, message: "Fetch API is unavailable; Workspace Manager V2 cannot load game manifests." };
    }
    try {
      const response = await this.fetchRef(game.manifestPath, { cache: "no-store" });
      if (!response.ok) {
        return { ok: false, message: `Unable to load ${game.manifestPath}: ${response.status}` };
      }
      const manifest = await response.json();
      if (!isPlainObject(manifest)) {
        return { ok: false, message: `${game.manifestPath} did not return a manifest object.` };
      }
      return { ok: true, manifest };
    } catch (error) {
      return { ok: false, message: `Unable to load ${game.manifestPath}: ${error.message}` };
    }
  }

  buildWorkspaceManifest({ assetsPath, game, gameRoot, palette }) {
    return {
      documentKind: "workspace-manifest",
      schema: "html-js-gaming.project",
      version: 1,
      id: `workspace-manager-v2-${game.id}`,
      name: `${game.name} Workspace Manager V2 Context`,
      gameId: game.id,
      gameRoot,
      assetsPath,
      tools: {
        [PALETTE_MANAGER_V2_TOOL_KEY]: {
          "$schema": "tools/schemas/tools/palette-manager-v2.schema.json",
          schema: "html-js-gaming.palette",
          version: 1,
          name: palette.name,
          source: "workspace-manager-v2",
          swatches: clone(palette.swatches)
        },
        [ASSET_MANAGER_V2_TOOL_KEY]: {
          assets: {}
        }
      }
    };
  }

  persistContext(context) {
    const hostContextId = makeHostContextId();
    this.sessionStorage.setItem(hostContextId, JSON.stringify(context));
    this.sessionStorage.setItem(HOST_CONTEXT_STORAGE_KEY, hostContextId);
    return hostContextId;
  }

  assetManagerLaunchUrl(hostContextId) {
    const url = new URL("../asset-manager-v2/index.html", this.location.href);
    url.searchParams.set("launch", "workspace");
    url.searchParams.set("fromTool", "workspace-manager-v2");
    url.searchParams.set("hostContextId", hostContextId);
    return url.href;
  }

  workspaceManagerUrl() {
    return new URL("../workspace-manager-v2/index.html", this.location.href).href;
  }

  launchAssetManager(hostContextId) {
    this.window.location.href = this.assetManagerLaunchUrl(hostContextId);
  }
}
