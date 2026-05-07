const HOST_CONTEXT_STORAGE_KEY = "workspace-manager-v2-active-host-context-id";
const WORKSPACE_MANIFEST_SCHEMA_PATH = "/tools/schemas/workspace.manifest.schema.json";
const ASSET_MANAGER_V2_TOOL_KEY = "asset-manager-v2";
const PALETTE_MANAGER_V2_TOOL_KEY = "palette-manager-v2";
const TEMPORARY_UAT_MANIFEST_PATH = "/games/_template/workspace-manager-v2-UAT.manifest.json";
const WORKSPACE_LAUNCHABLE_TOOLS = Object.freeze([
  Object.freeze({
    actionLabels: Object.freeze(["How To Use", "Read Me"]),
    group: "Utilities",
    id: "templates-v2",
    name: "First-Class Tool Starter V2",
    path: "../templates-v2/index.html"
  }),
  Object.freeze({
    actionLabels: Object.freeze(["How To Use", "Read Me"]),
    group: "Editors",
    id: "asset-manager-v2",
    name: "Asset Manager V2",
    path: "../asset-manager-v2/index.html"
  }),
  Object.freeze({
    actionLabels: Object.freeze(["How To Use", "Read Me"]),
    group: "Editors",
    id: "palette-manager-v2",
    name: "Palette Manager V2",
    path: "../palette-manager-v2/index.html"
  }),
  Object.freeze({
    actionLabels: Object.freeze(["How To Use", "Read Me"]),
    group: "Utilities",
    id: "preview-generator-v2",
    name: "Preview Generator V2",
    path: "../preview-generator-v2/index.html"
  })
]);

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

function makeHostContextId() {
  return `workspace-manager-v2-${Date.now().toString(36)}`;
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

  workspaceLaunchableTools() {
    return WORKSPACE_LAUNCHABLE_TOOLS.map((tool) => ({ ...tool }));
  }

  isUatMode() {
    const params = new URLSearchParams(this.location.search || "");
    return String(params.get("workspace") || "").trim().toUpperCase() === "UAT";
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
    return this.contextResultFromManifest(game, manifestResult.manifest, game.manifestPath);
  }

  async buildContextFromManifest(workspaceManifest, sourceLabel) {
    const game = this.games().find((entry) => entry.id === workspaceManifest?.gameId);
    if (!game) {
      return { ok: false, message: `${sourceLabel} does not match a known game workspace.` };
    }
    return this.contextResultFromManifest(game, workspaceManifest, sourceLabel);
  }

  async buildTemporaryUatContext() {
    const manifestResult = await this.fetchWorkspaceManifest(TEMPORARY_UAT_MANIFEST_PATH);
    if (!manifestResult.ok) {
      return manifestResult;
    }
    return this.buildContextFromManifest(manifestResult.manifest, TEMPORARY_UAT_MANIFEST_PATH);
  }

  async restorePersistedContext() {
    const params = new URLSearchParams(this.location.search || "");
    const hostContextId = params.get("hostContextId") || this.sessionStorage.getItem(HOST_CONTEXT_STORAGE_KEY) || "";
    return this.restorePersistedContextById(hostContextId);
  }

  async restorePersistedContextById(hostContextId) {
    if (!hostContextId) {
      return { ok: false, hasContext: false };
    }
    const rawValue = this.sessionStorage.getItem(hostContextId);
    if (!rawValue) {
      return { ok: false, hasContext: true, message: "Stored Workspace Manager V2 session context was not found." };
    }
    let manifest;
    try {
      manifest = JSON.parse(rawValue);
    } catch (error) {
      return { ok: false, hasContext: true, message: `Stored Workspace Manager V2 session context is invalid JSON: ${error.message}` };
    }
    const game = this.games().find((entry) => entry.id === manifest?.gameId);
    if (!game) {
      return { ok: false, hasContext: true, message: "Stored Workspace Manager V2 session context does not match a known game workspace." };
    }
    const result = await this.contextResultFromManifest(game, manifest, `sessionStorage:${hostContextId}`);
    return result.ok
      ? { ...result, hasContext: true, hostContextId }
      : { ...result, hasContext: true };
  }

  async contextResultFromManifest(game, workspaceManifest, sourceLabel) {
    const validation = await this.validateGeneratedManifest(workspaceManifest);
    if (!validation.ok) {
      return { ok: false, message: `${sourceLabel} failed workspace manifest schema validation: ${validation.message}` };
    }
    if (workspaceManifest.gameId !== game.id) {
      return { ok: false, message: `${sourceLabel} gameId ${workspaceManifest.gameId || "(empty)"} does not match ${game.id}.` };
    }
    const palettePayload = workspaceManifest.tools?.[PALETTE_MANAGER_V2_TOOL_KEY];
    const assetPayload = workspaceManifest.tools?.[ASSET_MANAGER_V2_TOOL_KEY];
    const paletteSwatches = Array.isArray(palettePayload?.swatches) ? clone(palettePayload.swatches) : [];
    const assetCount = Object.keys(assetPayload.assets || {}).length;
    const assetWarning = game.id === "Asteroids" && assetCount === 0
      ? `${sourceLabel} has no Asteroids Asset Manager V2 assets; Workspace Manager V2 did not inject hardcoded assets.`
      : "";
    if (!paletteSwatches.length) {
      return { ok: false, message: `${sourceLabel} does not expose active Palette Manager V2 swatches.` };
    }
    return {
      ok: true,
      context: clone(workspaceManifest),
      game: {
        ...game,
        assetsPath: workspaceManifest.assetsPath,
        gameRoot: workspaceManifest.gameRoot,
        manifestId: workspaceManifest.id,
        paletteName: palettePayload.name || "Workspace Palette",
        repoRoot: workspaceManifest.repoRoot || ""
      },
      assetCount,
      assetWarning,
      paletteSwatches
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
    const manifestResult = await this.fetchWorkspaceManifest(game.manifestPath);
    return manifestResult.ok
      ? { ...manifestResult, manifestPath: game.manifestPath }
      : manifestResult;
  }

  async fetchWorkspaceManifest(manifestPath) {
    if (typeof this.fetchRef !== "function") {
      return { ok: false, message: "Fetch API is unavailable; Workspace Manager V2 cannot load workspace manifests." };
    }
    try {
      const response = await this.fetchRef(manifestPath, { cache: "no-store" });
      if (!response.ok) {
        return { ok: false, message: `Unable to load ${manifestPath}: ${response.status}` };
      }
      const manifest = await response.json();
      if (!isPlainObject(manifest)) {
        return { ok: false, message: `${manifestPath} did not return a manifest object.` };
      }
      return { ok: true, manifest };
    } catch (error) {
      return { ok: false, message: `Unable to load ${manifestPath}: ${error.message}` };
    }
  }

  persistContext(context) {
    const hostContextId = makeHostContextId();
    this.sessionStorage.setItem(hostContextId, JSON.stringify(context));
    this.sessionStorage.setItem(HOST_CONTEXT_STORAGE_KEY, hostContextId);
    return hostContextId;
  }

  writePersistedContext(hostContextId, context) {
    if (!hostContextId) {
      return this.persistContext(context);
    }
    this.sessionStorage.setItem(hostContextId, JSON.stringify(context));
    this.sessionStorage.setItem(HOST_CONTEXT_STORAGE_KEY, hostContextId);
    return hostContextId;
  }

  toolLaunchUrl(toolId, hostContextId, { workspaceMode = "" } = {}) {
    const tool = WORKSPACE_LAUNCHABLE_TOOLS.find((entry) => entry.id === toolId);
    if (!tool) {
      return "";
    }
    const url = new URL(tool.path, this.location.href);
    url.searchParams.set("launch", "workspace");
    url.searchParams.set("fromTool", "workspace-manager-v2");
    url.searchParams.set("hostContextId", hostContextId);
    if (workspaceMode === "uat") {
      url.searchParams.set("workspaceMode", "uat");
    }
    return url.href;
  }

  workspaceManagerUrl() {
    const url = new URL("../workspace-manager-v2/index.html", this.location.href);
    const hostContextId = this.sessionStorage.getItem(HOST_CONTEXT_STORAGE_KEY);
    if (hostContextId) {
      url.searchParams.set("hostContextId", hostContextId);
    }
    if (this.isUatMode()) {
      url.searchParams.set("workspace", "uat");
    }
    return url.href;
  }

  launchTool(toolId, hostContextId, options = {}) {
    const url = this.toolLaunchUrl(toolId, hostContextId, options);
    if (url) {
      this.window.location.href = url;
    }
  }
}
