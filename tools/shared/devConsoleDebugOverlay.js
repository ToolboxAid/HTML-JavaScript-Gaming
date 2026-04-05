/*
Toolbox Aid
David Quesenberry
04/05/2026
devConsoleDebugOverlay.js
*/

export const DEV_DIAGNOSTICS_CONTRACT_VERSION = "1.0.0";

export const DEV_CONSOLE_ENGINE_MAPPINGS = Object.freeze({
  runtime: "engine/lifecycle-runtime-adapter",
  frameTiming: "engine/renderer-frame-timing-adapter",
  scene: "engine/scene-lifecycle-adapter",
  camera: "engine/camera-adapter",
  tilemap: "engine/tilemap-adapter",
  input: "engine/input-adapter",
  entities: "engine/ecs-summary-adapter",
  validation: "engine/contract-validation-adapter",
  hotReload: "engine/runtime-scene-loader-hot-reload-adapter"
});

const REQUIRED_DIAGNOSTIC_FIELDS = Object.freeze([
  "contractVersion",
  "timestamp",
  "runtime",
  "render",
  "hotReload",
  "validation",
  "errors"
]);

const OPTIONAL_DIAGNOSTIC_FIELDS = Object.freeze([
  "camera",
  "entities",
  "tilemap",
  "input",
  "assets"
]);

const CANONICAL_WORLD_RENDER_ORDER = Object.freeze([
  "parallax",
  "tilemap",
  "entities",
  "sprite-effects",
  "vector-overlay"
]);

const DEBUG_SURFACE_RENDER_ORDER = Object.freeze([
  "debug-overlay",
  "dev-console-surface"
]);

const CORE_COMMAND_SPECS = Object.freeze([
  { name: "help", category: "core", description: "List available commands", usage: "help" },
  { name: "status", category: "core", description: "Show diagnostics shell status", usage: "status" },
  { name: "scene.info", category: "scene", description: "Show active scene summary", usage: "scene.info" },
  { name: "scene.reload", category: "scene", description: "Request scene reload", usage: "scene.reload", mutatesRuntime: true },
  { name: "camera.info", category: "camera", description: "Show camera state", usage: "camera.info" },
  { name: "render.info", category: "render", description: "Show render stage state", usage: "render.info" },
  { name: "entities.count", category: "entities", description: "Show entity count", usage: "entities.count" },
  { name: "tilemap.info", category: "tilemap", description: "Show tilemap summary", usage: "tilemap.info" },
  { name: "input.info", category: "input", description: "Show input summary", usage: "input.info" },
  { name: "assets.info", category: "assets", description: "Show asset summary", usage: "assets.info" },
  { name: "hotreload.info", category: "hotreload", description: "Show hot reload state", usage: "hotreload.info" },
  { name: "hotreload.enable", category: "hotreload", description: "Enable hot reload", usage: "hotreload.enable", mutatesRuntime: true },
  { name: "hotreload.disable", category: "hotreload", description: "Disable hot reload", usage: "hotreload.disable", mutatesRuntime: true },
  { name: "validation.info", category: "validation", description: "Show contract validation summary", usage: "validation.info" },
  { name: "overlay.show", category: "overlay", description: "Show debug overlay", usage: "overlay.show", mutatesRuntime: true },
  { name: "overlay.hide", category: "overlay", description: "Hide debug overlay", usage: "overlay.hide", mutatesRuntime: true },
  { name: "overlay.toggle", category: "overlay", description: "Toggle a debug overlay panel", usage: "overlay.toggle <panel>", mutatesRuntime: true }
]);

const CORE_PANEL_SPECS = Object.freeze([
  { id: "runtime-summary", title: "Runtime", source: "runtime", priority: 100, renderMode: "text-block", enabled: true },
  { id: "frame-timing", title: "Frame", source: "render", priority: 200, renderMode: "text-block", enabled: true },
  { id: "scene-identity", title: "Scene", source: "runtime", priority: 300, renderMode: "text-block", enabled: true },
  { id: "camera-state", title: "Camera", source: "camera", priority: 400, renderMode: "text-block", enabled: true },
  { id: "entity-counts", title: "Entities", source: "entities", priority: 500, renderMode: "text-block", enabled: true },
  { id: "render-stage", title: "Render", source: "render", priority: 600, renderMode: "text-block", enabled: true },
  { id: "tilemap-summary", title: "Tilemap", source: "tilemap", priority: 700, renderMode: "text-block", enabled: true },
  { id: "input-summary", title: "Input", source: "input", priority: 800, renderMode: "text-block", enabled: true },
  { id: "hotreload-status", title: "Hot Reload", source: "hotReload", priority: 900, renderMode: "text-block", enabled: true },
  { id: "validation-warnings", title: "Validation", source: "validation", priority: 1000, renderMode: "text-block", enabled: true }
]);

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cloneJson(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function createStructuredReport(level, stage, code, message, details = {}) {
  return {
    level: sanitizeText(level) || "info",
    stage: sanitizeText(stage) || "collect",
    code: sanitizeText(code) || "DEV_CONSOLE_DEBUG_OVERLAY_REPORT",
    message: sanitizeText(message) || "Dev console/debug overlay report.",
    details: isObject(details) ? cloneJson(details) : {}
  };
}

function normalizeRenderStageToken(value) {
  const token = sanitizeText(value).toLowerCase();
  if (!token) {
    return "";
  }

  if (token === "sprite" || token === "effects" || token === "sprite/effects") {
    return "sprite-effects";
  }

  if (token === "vector" || token === "vector overlay" || token === "vector-overlay/authored-overlays") {
    return "vector-overlay";
  }

  if (token === "debug overlay" || token === "debug") {
    return "debug-overlay";
  }

  if (token === "dev console" || token === "console") {
    return "dev-console-surface";
  }

  return token;
}

function createDiagnosticsEnvelope(nowProvider) {
  const now = typeof nowProvider === "function" ? nowProvider() : Date.now();
  return {
    contractVersion: DEV_DIAGNOSTICS_CONTRACT_VERSION,
    timestamp: Number.isFinite(now) ? now : Date.now(),
    runtime: {},
    camera: {},
    render: {},
    entities: {},
    tilemap: {},
    input: {},
    assets: {},
    hotReload: {},
    validation: {},
    errors: []
  };
}

function validateCommandDefinition(command) {
  if (!isObject(command)) {
    return "Command must be an object.";
  }

  const name = sanitizeText(command.name);
  if (!name) {
    return "Command name is required.";
  }

  if (!sanitizeText(command.category)) {
    return "Command category is required.";
  }

  if (!sanitizeText(command.description)) {
    return "Command description is required.";
  }

  if (!sanitizeText(command.usage)) {
    return "Command usage is required.";
  }

  if (typeof command.execute !== "function") {
    return "Command execute must be a function.";
  }

  if (command.mutatesRuntime !== undefined && typeof command.mutatesRuntime !== "boolean") {
    return "Command mutatesRuntime must be boolean when provided.";
  }

  return "";
}

function validatePanelDefinition(panel) {
  if (!isObject(panel)) {
    return "Panel must be an object.";
  }

  if (!sanitizeText(panel.id)) {
    return "Panel id is required.";
  }

  if (!sanitizeText(panel.title)) {
    return "Panel title is required.";
  }

  if (typeof panel.enabled !== "boolean") {
    return "Panel enabled must be boolean.";
  }

  if (!Number.isFinite(panel.priority)) {
    return "Panel priority must be numeric.";
  }

  if (!sanitizeText(panel.source)) {
    return "Panel source is required.";
  }

  if (!sanitizeText(panel.renderMode)) {
    return "Panel renderMode is required.";
  }

  if (panel.refreshMs !== undefined && (!Number.isFinite(panel.refreshMs) || panel.refreshMs < 0)) {
    return "Panel refreshMs must be numeric and >= 0 when provided.";
  }

  if (panel.render !== undefined && typeof panel.render !== "function") {
    return "Panel render must be a function when provided.";
  }

  return "";
}

function validateDiagnosticsEnvelope(snapshot) {
  const errors = [];

  if (!isObject(snapshot)) {
    errors.push(createStructuredReport("error", "validate", "INVALID_DIAGNOSTICS_ENVELOPE", "Diagnostics snapshot must be an object."));
    return errors;
  }

  if (sanitizeText(snapshot.contractVersion) !== DEV_DIAGNOSTICS_CONTRACT_VERSION) {
    errors.push(createStructuredReport("error", "validate", "INVALID_DIAGNOSTICS_VERSION", `Diagnostics contractVersion must be ${DEV_DIAGNOSTICS_CONTRACT_VERSION}.`));
  }

  if (!Number.isFinite(snapshot.timestamp)) {
    errors.push(createStructuredReport("error", "validate", "INVALID_DIAGNOSTICS_TIMESTAMP", "Diagnostics timestamp must be numeric."));
  }

  REQUIRED_DIAGNOSTIC_FIELDS.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(snapshot, field)) {
      errors.push(createStructuredReport("error", "validate", "MISSING_DIAGNOSTICS_FIELD", `Missing diagnostics field ${field}.`, { field }));
      return;
    }

    if (field === "errors") {
      if (!Array.isArray(snapshot.errors)) {
        errors.push(createStructuredReport("error", "validate", "INVALID_DIAGNOSTICS_ERRORS", "Diagnostics errors must be an array."));
      }
      return;
    }

    if (field !== "contractVersion" && field !== "timestamp" && !isObject(snapshot[field])) {
      errors.push(createStructuredReport("error", "validate", "INVALID_DIAGNOSTICS_FIELD_TYPE", `Diagnostics field ${field} must be an object.`, { field }));
    }
  });

  OPTIONAL_DIAGNOSTIC_FIELDS.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(snapshot, field)) {
      return;
    }
    if (!isObject(snapshot[field])) {
      errors.push(createStructuredReport("error", "validate", "INVALID_OPTIONAL_DIAGNOSTICS_FIELD_TYPE", `Diagnostics optional field ${field} must be an object.`, { field }));
    }
  });

  return errors;
}

function defaultPanelRenderer(panel, snapshot) {
  const source = sanitizeText(panel.source);
  const sourceData = isObject(snapshot?.[source]) ? snapshot[source] : {};
  const lines = Object.keys(sourceData)
    .sort((left, right) => left.localeCompare(right))
    .slice(0, 8)
    .map((key) => `${key}: ${String(sourceData[key])}`);

  return {
    id: panel.id,
    title: panel.title,
    lines: lines.length > 0 ? lines : ["No data"]
  };
}

function buildCoreCommandDefinition(spec) {
  return {
    name: spec.name,
    category: spec.category,
    description: spec.description,
    usage: spec.usage,
    mutatesRuntime: spec.mutatesRuntime === true,
    execute(context, args) {
      const runtime = isObject(context?.runtime) ? context.runtime : {};
      const overlay = isObject(context?.overlay) ? context.overlay : {};
      const lines = [];

      switch (spec.name) {
        case "help": {
          const names = typeof context?.listCommandNames === "function" ? context.listCommandNames() : [];
          return { lines: names.length > 0 ? names : ["No commands registered."] };
        }
        case "status":
          lines.push(`consoleVisible=${Boolean(context?.consoleVisible)}`);
          lines.push(`overlayVisible=${Boolean(context?.overlayVisible)}`);
          lines.push(`reloadGeneration=${Number.isFinite(context?.reloadGeneration) ? context.reloadGeneration : 0}`);
          return { lines };
        case "scene.info":
          lines.push(`sceneId=${sanitizeText(runtime.sceneId) || "unknown"}`);
          lines.push(`sceneStatus=${sanitizeText(runtime.status) || "unknown"}`);
          return { lines };
        case "scene.reload":
          return { lines: ["scene.reload requested"], action: "scene.reload" };
        case "camera.info":
          return { lines: [JSON.stringify(isObject(context?.camera) ? context.camera : {})] };
        case "render.info":
          return { lines: [JSON.stringify(isObject(context?.render) ? context.render : {})] };
        case "entities.count":
          lines.push(`count=${Number.isFinite(context?.entities?.count) ? context.entities.count : 0}`);
          return { lines };
        case "tilemap.info":
          return { lines: [JSON.stringify(isObject(context?.tilemap) ? context.tilemap : {})] };
        case "input.info":
          return { lines: [JSON.stringify(isObject(context?.input) ? context.input : {})] };
        case "assets.info":
          return { lines: [JSON.stringify(isObject(context?.assets) ? context.assets : {})] };
        case "hotreload.info":
          return { lines: [JSON.stringify(isObject(context?.hotReload) ? context.hotReload : {})] };
        case "hotreload.enable":
          return { lines: ["hotreload enabled"], action: "hotreload.enable" };
        case "hotreload.disable":
          return { lines: ["hotreload disabled"], action: "hotreload.disable" };
        case "validation.info":
          return { lines: [JSON.stringify(isObject(context?.validation) ? context.validation : {})] };
        case "overlay.show":
          return { lines: ["overlay shown"], action: "overlay.show" };
        case "overlay.hide":
          return { lines: ["overlay hidden"], action: "overlay.hide" };
        case "overlay.toggle": {
          const panelId = sanitizeText(args?.[0]);
          return { lines: [panelId ? `overlay.toggle ${panelId}` : "overlay.toggle requires panel id"], action: "overlay.toggle", panelId };
        }
        default:
          return { lines: [`Unknown command ${spec.name}`] };
      }
    }
  };
}

export function getDeterministicRenderOrder(worldStages = []) {
  const normalizedStages = Array.isArray(worldStages)
    ? worldStages.map((stage) => normalizeRenderStageToken(stage)).filter(Boolean)
    : [];

  const uniqueWorldStages = new Set(normalizedStages.filter((stage) => !DEBUG_SURFACE_RENDER_ORDER.includes(stage)));
  const ordered = [];

  CANONICAL_WORLD_RENDER_ORDER.forEach((stage) => {
    if (uniqueWorldStages.has(stage) || uniqueWorldStages.size === 0) {
      ordered.push(stage);
      uniqueWorldStages.delete(stage);
    }
  });

  Array.from(uniqueWorldStages.values())
    .sort((left, right) => left.localeCompare(right))
    .forEach((stage) => {
      ordered.push(stage);
    });

  DEBUG_SURFACE_RENDER_ORDER.forEach((stage) => {
    ordered.push(stage);
  });

  return ordered;
}

export function summarizeDevConsoleDebugOverlay(result) {
  if (!isObject(result)) {
    return "Dev console/debug overlay unavailable.";
  }

  const status = sanitizeText(result.status);
  if (status !== "ready") {
    const code = sanitizeText(result?.reports?.[0]?.code) || "UNKNOWN";
    return `Dev console/debug overlay failed at ${code}.`;
  }

  const panelCount = Number.isFinite(result?.overlay?.panelCount) ? result.overlay.panelCount : 0;
  const commandCount = Number.isFinite(result?.console?.commandCount) ? result.console.commandCount : 0;
  return `Dev console/debug overlay ready with ${commandCount} commands and ${panelCount} panels.`;
}

export function createDiagnosticsCollector(options = {}) {
  const adapters = isObject(options.adapters) ? options.adapters : {};
  const nowProvider = typeof options.nowProvider === "function" ? options.nowProvider : () => Date.now();

  return {
    collect(context = {}) {
      const snapshot = createDiagnosticsEnvelope(nowProvider);
      const reports = [];

      const collectSections = [
        ...OPTIONAL_DIAGNOSTIC_FIELDS,
        "runtime",
        "render",
        "hotReload",
        "validation"
      ];

      collectSections.forEach((section) => {
        const adapter = adapters[section];
        if (typeof adapter !== "function") {
          return;
        }

        try {
          const result = adapter(context, snapshot);
          snapshot[section] = isObject(result) ? result : {};
        } catch (error) {
          const report = createStructuredReport(
            "error",
            "collect",
            "DIAGNOSTICS_ADAPTER_UNAVAILABLE",
            `Diagnostics adapter ${section} failed.`,
            {
              section,
              error: error instanceof Error ? error.message : String(error)
            }
          );
          snapshot.errors.push({
            level: report.level,
            code: report.code,
            stage: report.stage,
            message: report.message,
            details: report.details
          });
          reports.push(report);
          snapshot[section] = {};
        }
      });

      const validationErrors = validateDiagnosticsEnvelope(snapshot);
      validationErrors.forEach((error) => {
        snapshot.errors.push({
          level: error.level,
          code: error.code,
          stage: error.stage,
          message: error.message,
          details: error.details
        });
      });
      reports.push(...validationErrors);

      return {
        status: validationErrors.length > 0 ? "failed" : "ready",
        diagnostics: snapshot,
        reports
      };
    }
  };
}

export function createCommandRegistry(options = {}) {
  const commands = new Map();
  const reports = [];

  function registerCommand(command, source = "extension") {
    const normalizedSource = sanitizeText(source) || "extension";
    const validationError = validateCommandDefinition(command);
    if (validationError) {
      const report = createStructuredReport("error", "validate", "INVALID_COMMAND_DEFINITION", validationError, {
        source: normalizedSource,
        commandName: sanitizeText(command?.name)
      });
      reports.push(report);
      return { status: "rejected", report };
    }

    const key = sanitizeText(command.name);
    if (commands.has(key)) {
      const existing = commands.get(key);
      const rejectCode = normalizedSource === "extension" ? "COMMAND_EXTENSION_CONFLICT" : "COMMAND_DUPLICATE";
      const report = createStructuredReport("warning", "register", rejectCode, `Command ${key} already registered from ${existing.source}.`, {
        existingSource: existing.source,
        incomingSource: normalizedSource,
        command: key
      });
      reports.push(report);
      return { status: "rejected", report };
    }

    commands.set(key, {
      source: normalizedSource,
      command: {
        name: key,
        category: sanitizeText(command.category),
        description: sanitizeText(command.description),
        usage: sanitizeText(command.usage),
        mutatesRuntime: command.mutatesRuntime === true,
        execute: command.execute
      }
    });

    return {
      status: "registered",
      report: createStructuredReport("info", "register", "COMMAND_REGISTERED", `Registered command ${key}.`, {
        source: normalizedSource,
        command: key
      })
    };
  }

  function parseInput(input) {
    const line = sanitizeText(input);
    if (!line) {
      return { name: "", args: [] };
    }
    const parts = line.split(/\s+/).filter(Boolean);
    return {
      name: sanitizeText(parts[0]),
      args: parts.slice(1).map((part) => sanitizeText(part)).filter(Boolean)
    };
  }

  function execute(input, context = {}) {
    const parsed = parseInput(input);
    if (!parsed.name) {
      const report = createStructuredReport("warning", "execute", "EMPTY_COMMAND", "No command entered.");
      return { status: "failed", reports: [report], output: { lines: [] } };
    }

    const entry = commands.get(parsed.name);
    if (!entry) {
      const report = createStructuredReport("error", "execute", "COMMAND_NOT_FOUND", `Unknown command ${parsed.name}.`, {
        command: parsed.name
      });
      return { status: "failed", reports: [report], output: { lines: [] } };
    }

    try {
      const output = entry.command.execute(context, parsed.args);
      const normalizedOutput = isObject(output) ? output : { lines: [String(output)] };
      if (!Array.isArray(normalizedOutput.lines)) {
        normalizedOutput.lines = [];
      }
      normalizedOutput.lines = normalizedOutput.lines.map((line) => sanitizeText(line)).filter(Boolean);
      return {
        status: "ready",
        reports: [createStructuredReport("info", "execute", "COMMAND_EXECUTED", `Executed command ${parsed.name}.`, { command: parsed.name })],
        output: normalizedOutput,
        command: parsed.name,
        args: parsed.args
      };
    } catch (error) {
      const report = createStructuredReport("error", "execute", "COMMAND_EXECUTION_FAILED", `Command ${parsed.name} failed.`, {
        command: parsed.name,
        error: error instanceof Error ? error.message : String(error)
      });
      return { status: "failed", reports: [report], output: { lines: [] }, command: parsed.name, args: parsed.args };
    }
  }

  function listCommands() {
    return Array.from(commands.values())
      .map((entry) => entry.command)
      .sort((left, right) => {
        const byCategory = left.category.localeCompare(right.category);
        if (byCategory !== 0) {
          return byCategory;
        }
        return left.name.localeCompare(right.name);
      });
  }

  const includeCore = options.includeCoreCommands !== false;
  if (includeCore) {
    CORE_COMMAND_SPECS.forEach((spec) => {
      registerCommand(buildCoreCommandDefinition(spec), "core");
    });
  }

  (Array.isArray(options.commands) ? options.commands : []).forEach((command) => {
    registerCommand(command, "extension");
  });

  return {
    registerCommand,
    execute,
    listCommands,
    getCount() {
      return commands.size;
    },
    getReports() {
      return reports.slice();
    }
  };
}

export function createOverlayPanelRegistry(options = {}) {
  const panels = new Map();
  const reports = [];

  function registerPanel(panel, source = "extension") {
    const normalizedSource = sanitizeText(source) || "extension";
    const validationError = validatePanelDefinition(panel);
    if (validationError) {
      const report = createStructuredReport("error", "validate", "INVALID_PANEL_DEFINITION", validationError, {
        source: normalizedSource,
        panelId: sanitizeText(panel?.id)
      });
      reports.push(report);
      return { status: "rejected", report };
    }

    const id = sanitizeText(panel.id);
    if (panels.has(id)) {
      const existing = panels.get(id);
      const rejectCode = normalizedSource === "extension" ? "PANEL_EXTENSION_CONFLICT" : "PANEL_DUPLICATE";
      const report = createStructuredReport("warning", "register", rejectCode, `Panel ${id} already registered from ${existing.source}.`, {
        panelId: id,
        existingSource: existing.source,
        incomingSource: normalizedSource
      });
      reports.push(report);
      return { status: "rejected", report };
    }

    panels.set(id, {
      source: normalizedSource,
      panel: {
        id,
        title: sanitizeText(panel.title),
        enabled: panel.enabled === true,
        priority: Number(panel.priority),
        source: sanitizeText(panel.source),
        renderMode: sanitizeText(panel.renderMode),
        refreshMs: Number.isFinite(panel.refreshMs) ? Number(panel.refreshMs) : 250,
        render: typeof panel.render === "function" ? panel.render : null
      }
    });

    return {
      status: "registered",
      report: createStructuredReport("info", "register", "PANEL_REGISTERED", `Registered panel ${id}.`, {
        panelId: id,
        source: normalizedSource
      })
    };
  }

  function getOrderedPanels(includeDisabled = false) {
    return Array.from(panels.values())
      .map((entry) => entry.panel)
      .filter((panel) => includeDisabled || panel.enabled === true)
      .sort((left, right) => {
        if (left.priority !== right.priority) {
          return left.priority - right.priority;
        }
        return left.id.localeCompare(right.id);
      });
  }

  function setPanelEnabled(panelId, enabled) {
    const id = sanitizeText(panelId);
    if (!panels.has(id)) {
      return {
        status: "missing",
        report: createStructuredReport("warning", "update", "PANEL_NOT_FOUND", `Panel ${id} not found.`, { panelId: id })
      };
    }

    const entry = panels.get(id);
    entry.panel.enabled = enabled === true;
    return {
      status: "ready",
      report: createStructuredReport("info", "update", "PANEL_TOGGLE", `Panel ${id} enabled=${entry.panel.enabled}.`, {
        panelId: id,
        enabled: entry.panel.enabled
      })
    };
  }

  function render(snapshot = {}) {
    const sections = [];
    const renderReports = [];
    const ordered = getOrderedPanels(false);

    ordered.forEach((panel) => {
      try {
        const renderer = typeof panel.render === "function" ? panel.render : defaultPanelRenderer;
        const section = renderer(panel, snapshot);
        const lines = Array.isArray(section?.lines)
          ? section.lines.map((line) => sanitizeText(line)).filter(Boolean)
          : ["No data"];

        sections.push({
          id: panel.id,
          title: panel.title,
          lines
        });
      } catch (error) {
        renderReports.push(createStructuredReport("warning", "render", "PANEL_RENDER_FAILED", `Panel ${panel.id} render failed.`, {
          panelId: panel.id,
          error: error instanceof Error ? error.message : String(error)
        }));
      }
    });

    return {
      status: "ready",
      sections,
      reports: renderReports
    };
  }

  const includeCore = options.includeCorePanels !== false;
  if (includeCore) {
    CORE_PANEL_SPECS.forEach((panel) => {
      registerPanel(panel, "core");
    });
  }

  (Array.isArray(options.panels) ? options.panels : []).forEach((panel) => {
    registerPanel(panel, "extension");
  });

  return {
    registerPanel,
    getOrderedPanels,
    setPanelEnabled,
    render,
    getCount() {
      return panels.size;
    },
    getReports() {
      return reports.slice();
    }
  };
}

export function createDevConsoleDebugOverlayRuntime(options = {}) {
  const diagnosticsCollector = options.diagnosticsCollector || createDiagnosticsCollector({ adapters: options.adapters });
  const commandRegistry = options.commandRegistry || createCommandRegistry({ includeCoreCommands: true });
  const panelRegistry = options.panelRegistry || createOverlayPanelRegistry({ includeCorePanels: true });

  let consoleVisible = false;
  let overlayVisible = true;
  let reloadGeneration = 0;
  let disposed = false;
  let lastKnownGoodRuntime = null;
  const commandHistory = [];

  function executeConsoleInput(input, context = {}) {
    const line = sanitizeText(input);
    if (line) {
      commandHistory.push(line);
    }

    const execution = commandRegistry.execute(line, {
      ...context,
      consoleVisible,
      overlayVisible,
      reloadGeneration,
      listCommandNames: () => commandRegistry.listCommands().map((command) => command.name)
    });

    if (execution.status === "ready") {
      const action = sanitizeText(execution.output?.action);
      if (action === "overlay.show") {
        overlayVisible = true;
      } else if (action === "overlay.hide") {
        overlayVisible = false;
      } else if (action === "overlay.toggle") {
        const panelId = sanitizeText(execution.output?.panelId);
        if (panelId) {
          const ordered = panelRegistry.getOrderedPanels(true);
          const panel = ordered.find((entry) => entry.id === panelId);
          if (panel) {
            panelRegistry.setPanelEnabled(panelId, !panel.enabled);
          }
        }
      }
    }

    return execution;
  }

  function collectDiagnostics(context = {}) {
    return diagnosticsCollector.collect(context);
  }

  function renderOverlay(snapshot = {}) {
    if (!overlayVisible) {
      return {
        status: "hidden",
        sections: [],
        reports: []
      };
    }

    return panelRegistry.render(snapshot);
  }

  function applyHotReload(event = {}) {
    const status = sanitizeText(event.status);
    const mode = sanitizeText(event.mode) || "targeted";

    if (status !== "ready") {
      return {
        status: "failed",
        reloadMode: mode,
        lastKnownGoodRuntime,
        reports: [
          createStructuredReport("error", "reload", "RELOAD_REJECTED_KEEP_LAST_GOOD", "Hot reload rejected; preserving last known-good runtime.", {
            mode,
            reason: sanitizeText(event.reason) || "reload-failed"
          })
        ]
      };
    }

    reloadGeneration += 1;
    if (event.runtimeState !== undefined) {
      lastKnownGoodRuntime = cloneJson(event.runtimeState);
    }

    return {
      status: "ready",
      reloadMode: mode,
      reloadGeneration,
      lastKnownGoodRuntime,
      reports: [
        createStructuredReport("info", "reload", "RELOAD_APPLIED", "Hot reload applied without duplicating diagnostics shell state.", {
          mode,
          reloadGeneration
        })
      ]
    };
  }

  function dispose() {
    disposed = true;
    consoleVisible = false;
    overlayVisible = false;
    return {
      status: "ready",
      reports: [createStructuredReport("info", "dispose", "DIAGNOSTICS_DISPOSED", "Dev console/debug overlay runtime disposed.")]
    };
  }

  return {
    executeConsoleInput,
    collectDiagnostics,
    renderOverlay,
    applyHotReload,
    dispose,
    getDeterministicRenderOrder,
    getState() {
      return {
        disposed,
        consoleVisible,
        overlayVisible,
        reloadGeneration,
        commandHistory: commandHistory.slice(),
        commandCount: commandRegistry.getCount(),
        panelCount: panelRegistry.getCount(),
        lastKnownGoodRuntime: lastKnownGoodRuntime ? cloneJson(lastKnownGoodRuntime) : null
      };
    },
    showConsole() {
      consoleVisible = true;
    },
    hideConsole() {
      consoleVisible = false;
    },
    showOverlay() {
      overlayVisible = true;
    },
    hideOverlay() {
      overlayVisible = false;
    },
    commandRegistry,
    panelRegistry,
    diagnosticsCollector
  };
}
