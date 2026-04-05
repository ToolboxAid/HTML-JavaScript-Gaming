/*
Toolbox Aid
David Quesenberry
04/05/2026
runtimeSceneLoaderHotReload.js
*/
import { normalizeProjectRelativePath } from "./projectAssetRegistry.js";
import { runRenderContractRuntimePath } from "./renderPipelineContract.js";

const DOMAIN_ORDER = Object.freeze(["parallax", "tilemap", "sprite", "vector", "overlay"]);

const KIND_TO_DOMAIN = Object.freeze({
  parallax: "parallax",
  tilemap: "tilemap",
  collision: "tilemap",
  sprite: "sprite",
  vector: "vector",
  overlay: "overlay",
  guide: "overlay"
});

const REFERENCE_ROLE_TO_DOMAIN = Object.freeze({
  parallax: "parallax",
  tilemap: "tilemap",
  sprite: "sprite",
  vector: "vector",
  overlay: "overlay"
});

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cloneJson(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function createStructuredReport(level, stage, code, message, details = {}) {
  return {
    level: sanitizeText(level) || "info",
    stage: sanitizeText(stage) || "load",
    code: sanitizeText(code) || "RUNTIME_SCENE_MESSAGE",
    message: sanitizeText(message) || "Runtime scene loader message.",
    details: isObject(details) ? cloneJson(details) : {}
  };
}

function toMap(value) {
  if (value instanceof Map) {
    return new Map(value);
  }
  const output = new Map();
  if (isObject(value)) {
    Object.keys(value).forEach((key) => {
      const normalized = normalizeProjectRelativePath(key);
      if (normalized) {
        output.set(normalized, value[key]);
      }
    });
  }
  return output;
}

function normalizeChangeEvent(change, index, now) {
  const rawPath = normalizeProjectRelativePath(change?.path);
  if (!rawPath) {
    return null;
  }
  return {
    path: rawPath,
    eventType: sanitizeText(change?.eventType) || "change",
    hash: sanitizeText(change?.hash),
    timestamp: Number.isFinite(change?.timestamp) ? change.timestamp : now + index
  };
}

function classifyDomainsFromOutput(output, includeDebugLayers) {
  const orderLookup = new Map(DOMAIN_ORDER.map((domain, index) => [domain, index]));
  const domainMap = new Map(DOMAIN_ORDER.map((domain) => [domain, []]));

  (Array.isArray(output?.layers) ? output.layers : []).forEach((layer) => {
    const domain = KIND_TO_DOMAIN[sanitizeText(layer?.kind)] || "overlay";
    const inclusion = sanitizeText(layer?.runtimeInclusion);
    if (inclusion === "editor-only") {
      return;
    }
    if (inclusion === "debug" && includeDebugLayers !== true) {
      return;
    }
    if (!domainMap.has(domain)) {
      domainMap.set(domain, []);
    }
    domainMap.get(domain).push(layer);
  });

  const domains = Array.from(domainMap.entries())
    .filter(([, layers]) => layers.length > 0)
    .map(([domain, layers]) => ({
      domain,
      layers
    }))
    .sort((left, right) => (orderLookup.get(left.domain) ?? Number.MAX_SAFE_INTEGER) - (orderLookup.get(right.domain) ?? Number.MAX_SAFE_INTEGER));

  return domains;
}

function summarizeContractFailure(contractResult) {
  const first = contractResult?.errors?.[0];
  const code = sanitizeText(first?.code) || "RENDER_CONTRACT_FAILED";
  return createStructuredReport(
    "error",
    sanitizeText(first?.stage) || "validate",
    code,
    sanitizeText(first?.message) || "Render contract validation failed.",
    {
      path: sanitizeText(first?.path),
      contractErrors: Array.isArray(contractResult?.errors) ? cloneJson(contractResult.errors) : []
    }
  );
}

function collectReferenceDomainLookup(entryDocument) {
  const lookup = new Map();
  const documentType = sanitizeText(entryDocument?.documentType);
  if (documentType !== "toolbox.render.composition-document") {
    return lookup;
  }

  const references = Array.isArray(entryDocument?.payload?.references) ? entryDocument.payload.references : [];
  references.forEach((reference) => {
    const path = normalizeProjectRelativePath(reference?.documentPath);
    const role = sanitizeText(reference?.role);
    const domain = REFERENCE_ROLE_TO_DOMAIN[role] || "overlay";
    if (path) {
      lookup.set(path, domain);
    }
  });
  return lookup;
}

function classifyReloadPlan(changes, context) {
  const normalizedCompositionPath = normalizeProjectRelativePath(context?.entryDocumentPath);
  const referenceDomainByPath = collectReferenceDomainLookup(context?.entryDocument);

  if (!Array.isArray(changes) || changes.length === 0) {
    return {
      mode: "no-op",
      domains: [],
      reasons: ["no-change-events"]
    };
  }

  const domains = new Set();
  const reasons = [];
  let requiresFullReload = false;

  changes.forEach((change) => {
    const path = normalizeProjectRelativePath(change?.path);
    if (!path) {
      return;
    }

    if (normalizedCompositionPath && path === normalizedCompositionPath) {
      requiresFullReload = true;
      reasons.push("composition-document-changed");
      return;
    }

    const mappedDomain = referenceDomainByPath.get(path);
    if (mappedDomain) {
      domains.add(mappedDomain);
      reasons.push(`domain-change:${mappedDomain}`);
      return;
    }

    requiresFullReload = true;
    reasons.push(`unknown-path:${path}`);
  });

  if (requiresFullReload) {
    return {
      mode: "full",
      domains: DOMAIN_ORDER.slice(),
      reasons
    };
  }

  const orderedDomains = DOMAIN_ORDER.filter((domain) => domains.has(domain));
  return {
    mode: "targeted",
    domains: orderedDomains,
    reasons
  };
}

async function disposeDomainHandle(options) {
  const disposer = typeof options?.disposer === "function" ? options.disposer : null;
  const domain = sanitizeText(options?.domain);
  const handle = options?.handle;
  const reason = sanitizeText(options?.reason) || "replace";

  if (!handle) {
    return { status: "skipped" };
  }

  try {
    if (disposer) {
      await disposer({ domain, handle, reason });
      return { status: "disposed" };
    }

    if (typeof handle.dispose === "function") {
      await handle.dispose({ domain, reason });
      return { status: "disposed" };
    }

    return { status: "noop" };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function createDefaultDomainLoader() {
  return async ({ domain, layers }) => ({
    domain,
    layerIds: layers.map((layer) => sanitizeText(layer.id)),
    loadedAt: Date.now()
  });
}

async function buildRuntimeScene(options = {}) {
  const renderOutput = options.renderOutput;
  const previousRuntime = options.previousRuntime || null;
  const targetDomains = new Set(Array.isArray(options.targetDomains) ? options.targetDomains : DOMAIN_ORDER);
  const includeDebugLayers = options.includeDebugLayers === true;
  const domainLoaders = isObject(options.domainLoaders) ? options.domainLoaders : {};
  const defaultLoader = createDefaultDomainLoader();
  const reports = [];
  const pendingDisposals = [];
  const stagedHandles = [];

  const domainEntries = classifyDomainsFromOutput(renderOutput, includeDebugLayers).filter((entry) => targetDomains.has(entry.domain));

  const nextDomains = new Map();
  if (previousRuntime?.domains instanceof Map) {
    previousRuntime.domains.forEach((value, key) => {
      if (!targetDomains.has(key)) {
        nextDomains.set(key, value);
      }
    });
  }

  for (let index = 0; index < domainEntries.length; index += 1) {
    const entry = domainEntries[index];
    const domain = entry.domain;
    const loader = typeof domainLoaders[domain] === "function" ? domainLoaders[domain] : defaultLoader;

    try {
      const previousDomain = previousRuntime?.domains?.get(domain) || null;
      const handle = await loader({
        domain,
        domainOrder: index,
        scene: renderOutput.scene,
        assets: renderOutput.assets,
        layers: entry.layers,
        entities: renderOutput.entities,
        mappings: renderOutput.mappings,
        previousHandle: previousDomain?.handle || null
      });

      const domainState = {
        domain,
        layers: cloneJson(entry.layers),
        handle,
        loadedAt: Date.now()
      };
      nextDomains.set(domain, domainState);
      stagedHandles.push({ domain, handle });

      if (previousDomain?.handle) {
        pendingDisposals.push({ domain, handle: previousDomain.handle, reason: "replace" });
      }

      reports.push(createStructuredReport("info", "reload", "DOMAIN_READY", `Domain ${domain} ready.`, {
        domain,
        layerCount: entry.layers.length
      }));
    } catch (error) {
      for (let stagedIndex = 0; stagedIndex < stagedHandles.length; stagedIndex += 1) {
        const staged = stagedHandles[stagedIndex];
        await disposeDomainHandle({
          domain: staged.domain,
          handle: staged.handle,
          reason: "rollback"
        });
      }

      reports.push(createStructuredReport("error", "reload", "DOMAIN_LOAD_FAILED", `Domain ${domain} failed to load.`, {
        domain,
        error: error instanceof Error ? error.message : String(error)
      }));

      return {
        status: "failed",
        reports,
        runtime: previousRuntime
      };
    }
  }

  for (let index = 0; index < pendingDisposals.length; index += 1) {
    const result = await disposeDomainHandle({
      domain: pendingDisposals[index].domain,
      handle: pendingDisposals[index].handle,
      reason: pendingDisposals[index].reason,
      disposer: options.domainDisposer
    });

    if (result.status === "failed") {
      reports.push(createStructuredReport("warning", "dispose", "DOMAIN_DISPOSE_FAILED", `Failed to dispose previous domain ${pendingDisposals[index].domain}.`, {
        domain: pendingDisposals[index].domain,
        error: result.error || "unknown"
      }));
    }
  }

  const domainLoadOrder = DOMAIN_ORDER.filter((domain) => nextDomains.has(domain));

  return {
    status: "ready",
    reports,
    runtime: {
      scene: cloneJson(renderOutput.scene),
      assets: cloneJson(renderOutput.assets),
      layers: cloneJson(renderOutput.layers),
      entities: cloneJson(renderOutput.entities),
      mappings: cloneJson(renderOutput.mappings),
      domainLoadOrder,
      domains: nextDomains
    }
  };
}

async function runRuntimeLoad(options = {}) {
  const contractResult = runRenderContractRuntimePath({
    entryDocument: options.entryDocument,
    documentsByPath: options.documentsByPath,
    includeDebugLayers: options.includeDebugLayers === true
  });

  if (contractResult.status !== "ready") {
    return {
      status: "failed",
      reloadMode: "validation-failed",
      reports: [summarizeContractFailure(contractResult)],
      contractResult,
      runtime: options.previousRuntime || null
    };
  }

  const runtimeResult = await buildRuntimeScene({
    renderOutput: contractResult.output,
    previousRuntime: options.previousRuntime || null,
    targetDomains: options.targetDomains,
    includeDebugLayers: options.includeDebugLayers === true,
    domainLoaders: options.domainLoaders,
    domainDisposer: options.domainDisposer
  });

  return {
    ...runtimeResult,
    contractResult,
    reloadMode: sanitizeText(options.reloadMode) || "full"
  };
}

export function createSceneCompositionLoader(options = {}) {
  const includeDebugLayers = options.includeDebugLayers === true;

  return {
    load(input = {}) {
      return runRenderContractRuntimePath({
        entryDocument: input.entryDocument,
        documentsByPath: input.documentsByPath,
        includeDebugLayers
      });
    }
  };
}

export function createRuntimeSceneLoader(options = {}) {
  const includeDebugLayers = options.includeDebugLayers === true;
  const domainLoaders = isObject(options.domainLoaders) ? options.domainLoaders : {};
  const domainDisposer = typeof options.domainDisposer === "function" ? options.domainDisposer : null;

  return {
    async load(input = {}) {
      return runRuntimeLoad({
        entryDocument: input.entryDocument,
        documentsByPath: input.documentsByPath,
        includeDebugLayers,
        domainLoaders,
        domainDisposer,
        reloadMode: "initial"
      });
    }
  };
}

export function createHotReloadCoordinator(options = {}) {
  let entryDocument = cloneJson(options.entryDocument || null);
  let entryDocumentPath = normalizeProjectRelativePath(options.entryDocumentPath);
  let documentsByPath = toMap(options.documentsByPath || {});
  const includeDebugLayers = options.includeDebugLayers === true;
  const domainLoaders = isObject(options.domainLoaders) ? options.domainLoaders : {};
  const domainDisposer = typeof options.domainDisposer === "function" ? options.domainDisposer : null;
  const nowProvider = typeof options.nowProvider === "function" ? options.nowProvider : () => Date.now();

  let activeRuntime = null;
  let reloadCount = 0;

  async function load(overrides = {}) {
    if (overrides.entryDocument) {
      entryDocument = cloneJson(overrides.entryDocument);
    }
    if (overrides.entryDocumentPath !== undefined) {
      entryDocumentPath = normalizeProjectRelativePath(overrides.entryDocumentPath);
    }
    if (overrides.documentsByPath) {
      documentsByPath = toMap(overrides.documentsByPath);
    }

    const result = await runRuntimeLoad({
      entryDocument,
      documentsByPath,
      includeDebugLayers,
      domainLoaders,
      domainDisposer,
      previousRuntime: null,
      reloadMode: "initial"
    });

    if (result.status === "ready") {
      activeRuntime = result.runtime;
      reloadCount = 0;
    }

    return {
      ...result,
      activeRuntime
    };
  }

  async function reload(input = {}) {
    const normalizedChanges = [];
    const now = nowProvider();
    const rawChanges = Array.isArray(input.changes) ? input.changes : [];

    for (let index = 0; index < rawChanges.length; index += 1) {
      const normalized = normalizeChangeEvent(rawChanges[index], index, now);
      if (normalized) {
        normalizedChanges.push(normalized);
      }
    }

    const nextEntryDocument = input.entryDocument ? cloneJson(input.entryDocument) : entryDocument;
    const nextEntryPath = input.entryDocumentPath !== undefined
      ? normalizeProjectRelativePath(input.entryDocumentPath)
      : entryDocumentPath;
    const nextDocuments = input.documentsByPath ? toMap(input.documentsByPath) : documentsByPath;

    const plan = classifyReloadPlan(normalizedChanges, {
      entryDocument: nextEntryDocument,
      entryDocumentPath: nextEntryPath
    });

    if (plan.mode === "no-op") {
      return {
        status: "ready",
        reloadMode: "no-op",
        affectedDomains: [],
        reports: [createStructuredReport("info", "reload", "NO_CHANGES", "No hot reload changes detected.")],
        runtime: activeRuntime,
        contractResult: null,
        plan
      };
    }

    const result = await runRuntimeLoad({
      entryDocument: nextEntryDocument,
      documentsByPath: nextDocuments,
      includeDebugLayers,
      domainLoaders,
      domainDisposer,
      previousRuntime: activeRuntime,
      targetDomains: plan.mode === "full" ? DOMAIN_ORDER.slice() : plan.domains,
      reloadMode: plan.mode
    });

    if (result.status !== "ready") {
      return {
        ...result,
        affectedDomains: plan.mode === "full" ? DOMAIN_ORDER.slice() : plan.domains,
        plan,
        activeRuntime,
        reports: [
          ...result.reports,
          createStructuredReport("error", "reload", "RELOAD_REJECTED_KEEP_LAST_GOOD", "Hot reload rejected; preserving last known good scene.", {
            reasons: plan.reasons
          })
        ]
      };
    }

    entryDocument = nextEntryDocument;
    entryDocumentPath = nextEntryPath;
    documentsByPath = nextDocuments;
    activeRuntime = result.runtime;
    reloadCount += 1;

    return {
      ...result,
      affectedDomains: plan.mode === "full" ? DOMAIN_ORDER.slice() : plan.domains,
      plan,
      activeRuntime,
      reloadCount,
      reports: [
        ...result.reports,
        createStructuredReport("info", "reload", "RELOAD_READY", "Hot reload completed successfully.", {
          mode: plan.mode,
          reasons: plan.reasons
        })
      ]
    };
  }

  async function disposeActiveScene(reason = "shutdown") {
    if (!activeRuntime?.domains) {
      return {
        status: "ready",
        reports: [createStructuredReport("info", "dispose", "NO_ACTIVE_SCENE", "No active runtime scene to dispose.")]
      };
    }

    const reports = [];
    for (const domain of DOMAIN_ORDER) {
      const domainState = activeRuntime.domains.get(domain);
      if (!domainState?.handle) {
        continue;
      }
      const disposal = await disposeDomainHandle({
        domain,
        handle: domainState.handle,
        reason,
        disposer: domainDisposer
      });
      if (disposal.status === "failed") {
        reports.push(createStructuredReport("warning", "dispose", "DOMAIN_DISPOSE_FAILED", `Failed to dispose domain ${domain}.`, {
          domain,
          error: disposal.error || "unknown"
        }));
      } else {
        reports.push(createStructuredReport("info", "dispose", "DOMAIN_DISPOSED", `Disposed domain ${domain}.`, { domain }));
      }
    }

    activeRuntime = null;
    reloadCount = 0;
    return {
      status: "ready",
      reports
    };
  }

  function getState() {
    return {
      hasActiveRuntime: Boolean(activeRuntime),
      reloadCount,
      entryDocumentPath,
      activeDomainOrder: activeRuntime?.domainLoadOrder ? activeRuntime.domainLoadOrder.slice() : []
    };
  }

  return {
    load,
    reload,
    disposeActiveScene,
    getState
  };
}

export function createWatcherBridge(options = {}) {
  const nowProvider = typeof options.nowProvider === "function" ? options.nowProvider : () => Date.now();
  let enabled = options.enabled !== false;
  const byPath = new Map();

  function publish(change = {}) {
    if (!enabled) {
      return {
        status: "ignored",
        report: createStructuredReport("info", "watch", "WATCHER_DISABLED", "Watcher bridge is disabled.")
      };
    }

    const normalized = normalizeChangeEvent(change, 0, nowProvider());
    if (!normalized) {
      return {
        status: "rejected",
        report: createStructuredReport("warning", "watch", "INVALID_CHANGE_PATH", "Watcher event rejected due to invalid path.")
      };
    }

    const previous = byPath.get(normalized.path);
    if (!previous || previous.timestamp <= normalized.timestamp) {
      byPath.set(normalized.path, normalized);
    }

    return {
      status: "accepted",
      report: createStructuredReport("info", "watch", "WATCHER_CHANGE_ACCEPTED", `Accepted watcher event for ${normalized.path}.`, {
        path: normalized.path,
        eventType: normalized.eventType
      })
    };
  }

  function flush() {
    const changes = Array.from(byPath.values()).sort((left, right) => {
      if (left.timestamp !== right.timestamp) {
        return left.timestamp - right.timestamp;
      }
      return left.path.localeCompare(right.path);
    });
    byPath.clear();
    return changes;
  }

  function setEnabled(nextEnabled) {
    enabled = nextEnabled === true;
  }

  return {
    publish,
    flush,
    setEnabled,
    getState() {
      return {
        enabled,
        pendingCount: byPath.size
      };
    }
  };
}

export function summarizeRuntimeSceneHotReload(result) {
  if (!result || typeof result !== "object") {
    return "Runtime scene loader unavailable.";
  }

  if (result.status !== "ready") {
    const code = sanitizeText(result?.reports?.[0]?.code) || "RUNTIME_SCENE_FAILED";
    return `Runtime scene loader failed at ${code}.`;
  }

  const domainCount = Array.isArray(result.runtime?.domainLoadOrder) ? result.runtime.domainLoadOrder.length : 0;
  const mode = sanitizeText(result.reloadMode) || "initial";
  return `Runtime scene loader ready with ${domainCount} domains (${mode}).`;
}
