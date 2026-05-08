const HOST_CONTEXT_STORAGE_KEY = "workspace-manager-v2-active-host-context-id";
const GAME_MANIFEST_SCHEMA_PATH = "/tools/schemas/game.manifest.schema.json";
const WORKSPACE_MANIFEST_SCHEMA_PATH = "/tools/schemas/workspace.manifest.schema.json";
const WORKSPACE_SESSION_SCHEMA_REF = "tools/schemas/workspace.manifest.schema.json";
const WORKSPACE_REPO_REFERENCE_SESSION_KEY = "workspace.repo.reference";
const WORKSPACE_TOOL_SESSION_KEY_PREFIX = "workspace.tools.";
const ASSET_MANAGER_V2_TOOL_KEY = "asset-manager-v2";
const PALETTE_MANAGER_V2_TOOL_KEY = "palette-manager-v2";
const TEMPORARY_UAT_MANIFEST_PATH = "/games/_template/workspace-manager-v2-UAT.manifest.json";
const TOOL_PAYLOAD_SCHEMA_REFS = Object.freeze({
  [ASSET_MANAGER_V2_TOOL_KEY]: "tools/schemas/tools/asset-manager-v2.schema.json",
  [PALETTE_MANAGER_V2_TOOL_KEY]: "tools/schemas/tools/palette-manager-v2.schema.json"
});
const SELECTED_GAME_PURPOSE_TOOL_IDS = Object.freeze(new Set([
  "preview-generator-v2",
  "session-inspector-v2"
]));
const WORKSPACE_LAUNCHABLE_TOOLS = Object.freeze([
  Object.freeze({
    actionLabels: Object.freeze(["How To Use", "Read Me"]),
    group: "Viewers",
    id: "templates-v2",
    name: "Tool Starter V2",
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
  }),
  Object.freeze({
    actionLabels: Object.freeze(["How To Use", "Read Me"]),
    group: "Viewers",
    id: "session-inspector-v2",
    name: "Session Inspector V2",
    path: "../session-inspector-v2/index.html"
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

function repoRootNameMatches(selectedRepoName, expectedRepoRoot) {
  const expected = String(expectedRepoRoot || "").trim();
  if (!expected) {
    return true;
  }
  if (selectedRepoName === expected) {
    return true;
  }
  const expectedFolderName = expected
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .at(-1);
  return selectedRepoName === expectedFolderName;
}

function toolSessionKey(toolId) {
  return `${WORKSPACE_TOOL_SESSION_KEY_PREFIX}${toolId}`;
}

function dirtyStatusFromSession(session) {
  return typeof session?.dirty?.isDirty === "boolean"
    ? String(session.dirty.isDirty)
    : "unknown";
}

function toolPayloadForContext(tool, context) {
  return context?.tools?.[tool.id];
}

function hasToolPayload(tool, context) {
  return isPlainObject(toolPayloadForContext(tool, context));
}

function hydrationDecisionForTool(tool, context) {
  if (!tool?.id) {
    return { hydrate: false, reason: "tool is missing a registry id" };
  }
  if (hasToolPayload(tool, context)) {
    return { hydrate: true, reason: "tool data is present in selected game workspace config" };
  }
  if (SELECTED_GAME_PURPOSE_TOOL_IDS.has(tool.id)) {
    return { hydrate: true, reason: "tool has a selected-game workspace launch purpose" };
  }
  if (tool.id === "templates-v2") {
    return { hydrate: false, reason: "starter/dev-only tool is not enabled by the selected game workspace config" };
  }
  return { hydrate: false, reason: "tool has no game data and no selected-game purpose" };
}

function temporaryUatGameFromManifest(workspaceManifest) {
  if (workspaceManifest?.gameId !== "_template"
    || workspaceManifest?.gameRoot !== "games/_template/"
    || workspaceManifest?.assetsPath !== "games/_template/assets") {
    return null;
  }
  return {
    id: "_template",
    name: "Template UAT",
    manifestPath: TEMPORARY_UAT_MANIFEST_PATH
  };
}

function displayNameFromGameId(gameId) {
  return String(gameId || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function gameFromWorkspaceManifest(workspaceManifest, manifestPath = "") {
  if (!workspaceManifest?.gameId || !workspaceManifest?.gameRoot) {
    return null;
  }
  return {
    id: workspaceManifest.gameId,
    name: displayNameFromGameId(workspaceManifest.gameId) || workspaceManifest.name || workspaceManifest.gameId,
    manifest: clone(workspaceManifest),
    manifestPath: manifestPath || `/${String(workspaceManifest.gameRoot).replace(/^\/+/, "")}game.manifest.json`
  };
}

function gameFromGameManifest(gameManifest, manifestPath = "", repoRoot = "") {
  const gameInfo = gameManifest?.game;
  if (!gameInfo?.id || !gameInfo?.name || !gameInfo?.folder || !isPlainObject(gameInfo.workspace)) {
    return null;
  }
  return {
    folder: gameInfo.folder,
    gameData: clone(gameInfo.gameData || {}),
    id: gameInfo.id,
    manifest: clone(gameManifest),
    manifestKind: "game-manifest",
    manifestPath,
    name: gameInfo.name,
    repoRoot
  };
}

function isGameManifest(value) {
  return value?.schema === "html-js-gaming.game-manifest"
    && isPlainObject(value.game)
    && isPlainObject(value.game.gameData)
    && isPlainObject(value.game.workspace);
}

function gameManifestBoundaryContractMessage() {
  return "Boundary contract: game.gameData is runtime data; game.workspace is editor/tool state. Runtime ignores game.workspace; tools may read game.gameData, write game.workspace, and update game.gameData only through explicit validated apply/build/export actions.";
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
    this.discoveredGames = [];
  }

  games() {
    return this.discoveredGames.map((game) => ({ ...game, manifest: clone(game.manifest) }));
  }

  setDiscoveredGames(games) {
    this.discoveredGames = games.map((game) => ({ ...game, manifest: clone(game.manifest) }));
  }

  clearDiscoveredGames() {
    this.discoveredGames = [];
  }

  workspaceLaunchableTools() {
    return WORKSPACE_LAUNCHABLE_TOOLS.map((tool) => ({ ...tool }));
  }

  hasExplicitHostContextId() {
    const params = new URLSearchParams(this.location.search || "");
    return Boolean(params.get("hostContextId"));
  }

  isUatMode() {
    const params = new URLSearchParams(this.location.search || "");
    return String(params.get("workspace") || "").trim().toUpperCase() === "UAT";
  }

  storageKeys() {
    const keys = [];
    for (let index = 0; index < this.sessionStorage.length; index += 1) {
      const key = this.sessionStorage.key(index);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  clearToolSessionHydration() {
    this.storageKeys()
      .filter((key) => key.startsWith(WORKSPACE_TOOL_SESSION_KEY_PREFIX))
      .forEach((key) => {
        this.sessionStorage.removeItem(key);
      });
  }

  clearWorkspaceSessionHydration() {
    this.clearToolSessionHydration();
    this.sessionStorage.removeItem(WORKSPACE_REPO_REFERENCE_SESSION_KEY);
  }

  removeDisabledToolSessions(enabledTools) {
    const enabledToolIds = new Set(enabledTools.map((tool) => tool.id));
    this.storageKeys()
      .filter((key) => key.startsWith(WORKSPACE_TOOL_SESSION_KEY_PREFIX))
      .filter((key) => !enabledToolIds.has(key.slice(WORKSPACE_TOOL_SESSION_KEY_PREFIX.length)))
      .forEach((key) => {
        this.sessionStorage.removeItem(key);
      });
  }

  readSessionJson(key) {
    const rawValue = this.sessionStorage.getItem(key);
    if (!rawValue) {
      return { ok: false, message: `${key} was not found in sessionStorage.` };
    }
    try {
      const value = JSON.parse(rawValue);
      return isPlainObject(value)
        ? { ok: true, value }
        : { ok: false, message: `${key} must contain a JSON object.` };
    } catch (error) {
      return { ok: false, message: `${key} contains invalid JSON: ${error.message}` };
    }
  }

  readToolSession(toolId) {
    const key = toolSessionKey(toolId);
    const result = this.readSessionJson(key);
    return result.ok
      ? { ok: true, key, session: result.value }
      : { ok: false, key, message: result.message };
  }

  reusableToolSession(tool, context) {
    const result = this.readToolSession(tool.id);
    if (!result.ok) {
      return result;
    }
    const session = result.session;
    if (!isPlainObject(session.schema)
      || !isPlainObject(session.workspace)
      || !Object.prototype.hasOwnProperty.call(session, "data")
      || !isPlainObject(session.dirty)) {
      return { ok: false, key: result.key, message: `${result.key} must use the normalized schema/workspace/data/dirty object shape.` };
    }
    if (session.workspace.source !== "workspace-manager-v2") {
      return { ok: false, key: result.key, message: `${result.key}.workspace.source must be workspace-manager-v2.` };
    }
    if (session.workspace.toolId !== tool.id) {
      return { ok: false, key: result.key, message: `${result.key}.workspace.toolId must match ${tool.id}.` };
    }
    if (session.workspace.workspaceManifestId !== context.id) {
      return { ok: false, key: result.key, message: `${result.key}.workspace.workspaceManifestId must match ${context.id}.` };
    }
    if (session.workspace.gameId !== context.gameId) {
      return { ok: false, key: result.key, message: `${result.key}.workspace.gameId must match ${context.gameId}.` };
    }
    if (session.workspace.repoReferenceKey !== WORKSPACE_REPO_REFERENCE_SESSION_KEY) {
      return { ok: false, key: result.key, message: `${result.key}.workspace.repoReferenceKey must be ${WORKSPACE_REPO_REFERENCE_SESSION_KEY}.` };
    }
    return result;
  }

  readWorkspaceRepoReference({ expectedRepoRoot = "" } = {}) {
    const result = this.readSessionJson(WORKSPACE_REPO_REFERENCE_SESSION_KEY);
    if (!result.ok) {
      return result;
    }
    const reference = result.value;
    if (reference.source !== "workspace-manager-v2") {
      return { ok: false, message: `${WORKSPACE_REPO_REFERENCE_SESSION_KEY}.source must be workspace-manager-v2.` };
    }
    if (reference.kind !== "file-system-directory-handle-reference") {
      return { ok: false, message: `${WORKSPACE_REPO_REFERENCE_SESSION_KEY}.kind must be file-system-directory-handle-reference.` };
    }
    if (reference.storageKey && reference.storageKey !== WORKSPACE_REPO_REFERENCE_SESSION_KEY) {
      return { ok: false, message: `${WORKSPACE_REPO_REFERENCE_SESSION_KEY}.storageKey must be ${WORKSPACE_REPO_REFERENCE_SESSION_KEY}.` };
    }
    const displayName = String(reference.displayName || reference.handleName || "").trim();
    if (!displayName) {
      return { ok: false, message: `${WORKSPACE_REPO_REFERENCE_SESSION_KEY} must include displayName or handleName.` };
    }
    if (!repoRootNameMatches(displayName, expectedRepoRoot)) {
      return {
        ok: false,
        message: `${WORKSPACE_REPO_REFERENCE_SESSION_KEY}.displayName ${displayName} does not match manifest repoRoot ${expectedRepoRoot}.`
      };
    }
    return { ok: true, reference: { ...reference, displayName } };
  }

  hydrateRepoReference(repoHandle, displayName = "") {
    const repoName = String(displayName || repoHandle?.name || "selected").trim() || "selected";
    const reference = {
      source: "workspace-manager-v2",
      kind: "file-system-directory-handle-reference",
      storageKey: WORKSPACE_REPO_REFERENCE_SESSION_KEY,
      handleKind: repoHandle?.kind || "directory",
      handleName: String(repoHandle?.name || repoName),
      displayName: repoName,
      note: "Serializable repo reference only; live FileSystemDirectoryHandle access remains user-selected in the active page."
    };
    try {
      this.sessionStorage.setItem(WORKSPACE_REPO_REFERENCE_SESSION_KEY, JSON.stringify(reference));
      return { ok: true, key: WORKSPACE_REPO_REFERENCE_SESSION_KEY, reference };
    } catch (error) {
      return { ok: false, message: `Unable to store repo session reference: ${error.message}` };
    }
  }

  schemaSessionForTool(tool, context) {
    const toolPayload = toolPayloadForContext(tool, context);
    const payloadSchemaRef = typeof toolPayload?.$schema === "string" && toolPayload.$schema
      ? toolPayload.$schema
      : TOOL_PAYLOAD_SCHEMA_REFS[tool.id] || "";
    return {
      source: "workspace-manager-v2",
      toolId: tool.id,
      toolName: tool.name,
      schemaRole: payloadSchemaRef ? "workspace-tool-payload" : "workspace-launch-context",
      schemaRef: payloadSchemaRef || WORKSPACE_SESSION_SCHEMA_REF,
      workspaceSchemaRef: WORKSPACE_SESSION_SCHEMA_REF
    };
  }

  workspaceSessionForTool(tool, context, game) {
    return {
      source: "workspace-manager-v2",
      toolId: tool.id,
      toolName: tool.name,
      workspaceManifestId: context.id,
      workspaceDocumentKind: context.documentKind,
      gameId: context.gameId,
      gameRoot: context.gameRoot,
      assetsPath: context.assetsPath,
      gameManifestPath: game?.manifestPath || "",
      repoRoot: context.repoRoot || game?.repoRoot || "",
      repoReferenceKey: WORKSPACE_REPO_REFERENCE_SESSION_KEY
    };
  }

  dataSessionForTool(tool, context) {
    const toolPayload = toolPayloadForContext(tool, context);
    return isPlainObject(toolPayload) ? clone(toolPayload) : null;
  }

  dirtySessionForTool() {
    return {
      isDirty: false,
      reason: null,
      changedAt: null,
      changedKeys: []
    };
  }

  sessionForTool(tool, context, game) {
    return {
      schema: this.schemaSessionForTool(tool, context),
      workspace: this.workspaceSessionForTool(tool, context, game),
      data: this.dataSessionForTool(tool, context),
      dirty: this.dirtySessionForTool()
    };
  }

  summarizeToolSession(tool, session) {
    const data = session?.data;
    return {
      assetCount: tool.id === ASSET_MANAGER_V2_TOOL_KEY && isPlainObject(data?.assets)
        ? Object.keys(data.assets).length
        : null,
      dirty: isPlainObject(session?.dirty) ? clone(session.dirty) : null,
      dirtyStatus: dirtyStatusFromSession(session),
      paletteSwatchCount: tool.id === PALETTE_MANAGER_V2_TOOL_KEY && Array.isArray(data?.swatches)
        ? data.swatches.length
        : null,
      toolId: tool.id,
      toolName: tool.name
    };
  }

  refreshContextFromToolSessions({ context, tools = this.workspaceLaunchableTools() } = {}) {
    const refreshedContext = clone(context);
    const toolSummaries = {};
    if (!isPlainObject(refreshedContext.tools)) {
      refreshedContext.tools = {};
    }
    tools
      .filter((tool) => tool?.id)
      .forEach((tool) => {
        const sessionResult = this.reusableToolSession(tool, context);
        if (!sessionResult.ok) {
          return;
        }
        const session = sessionResult.session;
        if (isPlainObject(session.data)) {
          refreshedContext.tools[tool.id] = clone(session.data);
        }
        toolSummaries[tool.id] = this.summarizeToolSession(tool, session);
      });
    return { context: refreshedContext, toolSummaries };
  }

  hydrateEnabledToolSessions({ context, game, tools = this.workspaceLaunchableTools() } = {}) {
    if (!isPlainObject(context) || !context.gameId || !isPlainObject(context.tools)) {
      return { ok: false, message: "Cannot hydrate tool sessions without a schema-valid workspace context." };
    }
    const toolDecisions = tools
      .filter((tool) => tool?.id)
      .map((tool) => {
        const normalizedTool = { ...tool };
        return {
          decision: hydrationDecisionForTool(normalizedTool, context),
          tool: normalizedTool
        };
      });
    const enabledTools = toolDecisions
      .filter(({ decision }) => decision.hydrate)
      .map(({ tool }) => tool);
    const skippedTools = toolDecisions
      .filter(({ decision }) => !decision.hydrate)
      .map(({ decision, tool }) => ({
        reason: decision.reason,
        toolId: tool.id,
        toolName: tool.name
      }));
    try {
      this.removeDisabledToolSessions(enabledTools);
      enabledTools.forEach((tool) => {
        const existingSession = this.reusableToolSession(tool, context);
        const session = existingSession.ok
          ? existingSession.session
          : this.sessionForTool(tool, context, game);
        this.sessionStorage.setItem(toolSessionKey(tool.id), JSON.stringify(session));
      });
      return {
        ok: true,
        hydratedToolIds: enabledTools.map((tool) => tool.id),
        keys: enabledTools.map((tool) => toolSessionKey(tool.id)),
        report: {
          hydratedTools: enabledTools.map((tool) => ({
            reason: hydrationDecisionForTool(tool, context).reason,
            toolId: tool.id,
            toolName: tool.name
          })),
          skippedTools
        },
        skippedTools
      };
    } catch (error) {
      this.clearToolSessionHydration();
      return { ok: false, message: `Unable to hydrate tool sessions: ${error.message}` };
    }
  }

  async buildContextForGame(gameId) {
    const game = this.games().find((entry) => entry.id === gameId);
    if (!game) {
      return { ok: false, message: "Select a valid game workspace." };
    }
    if (game.manifestKind === "game-manifest") {
      return this.contextResultFromManifest(game, this.workspaceManifestFromGameManifest(game), game.manifestPath);
    }
    if (game.manifest) {
      return this.contextResultFromManifest(game, game.manifest, game.manifestPath);
    }
    const manifestResult = await this.fetchGameManifest(game);
    if (!manifestResult.ok) {
      return manifestResult;
    }
    return this.contextResultFromManifest(game, manifestResult.manifest, game.manifestPath);
  }

  async buildContextFromManifest(importedManifest, sourceLabel) {
    if (isGameManifest(importedManifest)) {
      const validation = await this.validateGameManifest(importedManifest);
      if (!validation.ok) {
        return { ok: false, message: `${sourceLabel} failed game manifest schema validation: ${validation.message}` };
      }
      const game = gameFromGameManifest(importedManifest, sourceLabel)
        || this.games().find((entry) => entry.id === importedManifest?.game?.id);
      if (!game) {
        return { ok: false, message: `${sourceLabel} does not match a known game workspace.` };
      }
      return this.contextResultFromManifest(game, this.workspaceManifestFromGameManifest(game), sourceLabel);
    }

    const workspaceManifest = importedManifest;
    const game = this.games().find((entry) => entry.id === workspaceManifest?.gameId)
      || (this.isUatMode() ? temporaryUatGameFromManifest(workspaceManifest) : null)
      || gameFromWorkspaceManifest(workspaceManifest, sourceLabel);
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
    const game = temporaryUatGameFromManifest(manifestResult.manifest);
    if (!game) {
      return { ok: false, message: `${TEMPORARY_UAT_MANIFEST_PATH} is not a valid Workspace Manager V2 UAT template manifest.` };
    }
    return this.contextResultFromManifest(game, manifestResult.manifest, TEMPORARY_UAT_MANIFEST_PATH);
  }

  async restorePersistedContext() {
    const params = new URLSearchParams(this.location.search || "");
    const hostContextId = params.get("hostContextId") || "";
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
    const game = this.games().find((entry) => entry.id === manifest?.gameId)
      || (this.isUatMode() ? temporaryUatGameFromManifest(manifest) : null)
      || gameFromWorkspaceManifest(manifest, `sessionStorage:${hostContextId}`);
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
        repoPath: workspaceManifest.repoPath || "",
        repoRoot: workspaceManifest.repoRoot || ""
      },
      assetCount,
      assetWarning,
      boundaryContract: game.manifestKind === "game-manifest" ? gameManifestBoundaryContractMessage() : "",
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

  async loadGameManifestSchema() {
    if (typeof this.fetchRef !== "function") {
      return { ok: false, message: "Fetch API is unavailable; Workspace Manager V2 cannot validate game manifests." };
    }
    try {
      const response = await this.fetchRef(GAME_MANIFEST_SCHEMA_PATH, { cache: "no-store" });
      if (!response.ok) {
        return { ok: false, message: `Unable to load ${GAME_MANIFEST_SCHEMA_PATH}: ${response.status}` };
      }
      const schema = await response.json();
      if (!isPlainObject(schema)) {
        return { ok: false, message: `${GAME_MANIFEST_SCHEMA_PATH} did not return a schema object.` };
      }
      return { ok: true, schema };
    } catch (error) {
      return { ok: false, message: `Unable to load ${GAME_MANIFEST_SCHEMA_PATH}: ${error.message}` };
    }
  }

  async validateGameManifest(manifest) {
    const schemaResult = await this.loadGameManifestSchema();
    if (!schemaResult.ok) {
      return schemaResult;
    }
    const errors = validateSchemaValue(manifest, schemaResult.schema, "root", schemaResult.schema);
    const gameInfo = manifest?.game || {};
    const gameData = gameInfo.gameData || {};
    const workspace = gameInfo.workspace || {};
    if (isPlainObject(gameData)) {
      if (Object.prototype.hasOwnProperty.call(gameData, "workspace")) {
        errors.push("root.game.gameData.workspace is not allowed; runtime data must not depend on editor/tool workspace state");
      }
      if (Object.prototype.hasOwnProperty.call(gameData, "tools")) {
        errors.push("root.game.gameData.tools is not allowed; tool/editor state belongs in root.game.workspace");
      }
    }
    if (isPlainObject(gameInfo) && isPlainObject(workspace)) {
      const expectedGameRoot = `games/${gameInfo.folder}/`;
      const expectedAssetsPath = `games/${gameInfo.folder}/assets`;
      if (workspace.gameId !== gameInfo.id) {
        errors.push("root.game.workspace.gameId must match root.game.id");
      }
      if (workspace.gameRoot !== expectedGameRoot) {
        errors.push(`root.game.workspace.gameRoot must be ${expectedGameRoot}`);
      }
      if (workspace.assetsPath !== expectedAssetsPath) {
        errors.push(`root.game.workspace.assetsPath must be ${expectedAssetsPath}`);
      }
    }
    return errors.length
      ? { ok: false, message: `Game manifest failed schema validation: ${errors.join(" | ")}` }
      : { ok: true };
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

  async discoverGameManifests(repoHandle) {
    if (!repoHandle || repoHandle.kind !== "directory") {
      return { ok: false, message: "Selected repo handle is not a directory." };
    }
    if (typeof repoHandle.getDirectoryHandle !== "function") {
      return { ok: false, message: "Selected repo does not support directory discovery." };
    }
    let gamesDir;
    try {
      gamesDir = await repoHandle.getDirectoryHandle("games", { create: false });
    } catch (error) {
      return { ok: false, message: `Selected repo is missing games/: ${error.message}` };
    }
    if (!gamesDir || gamesDir.kind !== "directory") {
      return { ok: false, message: "Selected repo games/ entry is not a directory." };
    }

    const discoveredGames = [];
    const repoRootName = String(repoHandle.name || "selected").trim() || "selected";
    const skips = [];
    const seenGameIds = new Set();
    await this.discoverGameManifestsInDirectory({
      depth: 0,
      discoveredGames,
      dirHandle: gamesDir,
      dirPath: "games",
      repoRootName,
      seenGameIds,
      skips
    });
    discoveredGames.sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));
    return { ok: true, games: discoveredGames, skips };
  }

  async discoverGameManifestsInDirectory({ depth, discoveredGames, dirHandle, dirPath, repoRootName, seenGameIds, skips }) {
    let manifestFound = false;
    if (typeof dirHandle.getFileHandle === "function") {
      try {
        const manifestFile = await dirHandle.getFileHandle("game.manifest.json", { create: false });
        manifestFound = true;
        const manifestPath = `${dirPath}/game.manifest.json`;
        const manifestResult = await this.readManifestFile(manifestFile, manifestPath);
        if (!manifestResult.ok) {
          skips.push({ path: manifestPath, reason: manifestResult.message });
        } else {
          const validation = await this.validateGameManifest(manifestResult.manifest);
          if (!validation.ok) {
            skips.push({ path: manifestPath, reason: validation.message });
          } else if (seenGameIds.has(manifestResult.manifest.game.id)) {
            skips.push({ path: manifestPath, reason: `duplicate game id ${manifestResult.manifest.game.id}` });
          } else {
            const game = gameFromGameManifest(manifestResult.manifest, `/${manifestPath}`, repoRootName);
            if (game) {
              seenGameIds.add(game.id);
              discoveredGames.push(game);
            } else {
              skips.push({ path: manifestPath, reason: "manifest is missing game.id, game.name, game.folder, or game.workspace" });
            }
          }
        }
      } catch {
        manifestFound = false;
      }
    }
    if (!manifestFound && depth === 1) {
      skips.push({ path: `${dirPath}/game.manifest.json`, reason: "game.manifest.json not found" });
    }
    if (typeof dirHandle.entries !== "function") {
      return;
    }
    const childEntries = [];
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle?.kind === "directory" && name !== "node_modules" && name !== ".git") {
        childEntries.push([name, handle]);
      }
    }
    childEntries.sort(([leftName], [rightName]) => leftName.localeCompare(rightName, undefined, { numeric: true }));
    for (const [name, childHandle] of childEntries) {
      await this.discoverGameManifestsInDirectory({
        depth: depth + 1,
        discoveredGames,
        dirHandle: childHandle,
        dirPath: `${dirPath}/${name}`,
        repoRootName,
        seenGameIds,
        skips
      });
    }
  }

  async readManifestFile(fileHandle, manifestPath) {
    if (!fileHandle || typeof fileHandle.getFile !== "function") {
      return { ok: false, message: "manifest file handle cannot be read" };
    }
    try {
      const file = await fileHandle.getFile();
      const text = await file.text();
      const manifest = JSON.parse(text);
      return isPlainObject(manifest)
        ? { ok: true, manifest }
        : { ok: false, message: "manifest JSON root is not an object" };
    } catch (error) {
      return { ok: false, message: `Unable to parse ${manifestPath}: ${error.message}` };
    }
  }

  workspaceManifestFromGameManifest(game) {
    const workspaceManifest = clone(game.manifest?.game?.workspace || {});
    if (!workspaceManifest.repoRoot && game.repoRoot) {
      workspaceManifest.repoRoot = game.repoRoot;
    }
    return workspaceManifest;
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
