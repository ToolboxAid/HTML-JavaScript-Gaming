import { safeString } from "../projectSystemValueUtils.js";
import { validateToolStateContract } from "../projectToolIntegration.js";
import { coordinateGameAssetManifest } from "./gameAssetManifestCoordinator.js";
import { appendAssetErrors } from "./assetErrorHandling.js";

export const ASSET_PIPELINE_TOOLING_SCHEMA = "html-js-gaming.asset-pipeline-tooling";
export const ASSET_PIPELINE_TOOLING_VERSION = 1;

export const ASSET_PIPELINE_TOOLING_STAGES = Object.freeze({
  LOAD: "load",
  VALIDATE: "validate",
  NORMALIZE: "normalize",
  EMIT: "emit"
});

export const ASSET_PIPELINE_ACTIVE_DOMAINS = Object.freeze([
  "sprites",
  "tilemaps",
  "parallax",
  "vectors"
]);

function toSlug(value, fallback = "asset") {
  const text = safeString(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return text || fallback;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeGameId(value) {
  return toSlug(value, "game");
}

function normalizeDomain(domain) {
  const normalized = safeString(domain, "").toLowerCase();
  return ASSET_PIPELINE_ACTIVE_DOMAINS.includes(normalized) ? normalized : "";
}

function normalizeDomainRecord(rawRecord, domain) {
  const source = rawRecord && typeof rawRecord === "object" ? rawRecord : {};
  const assetId = toSlug(source.assetId || source.id || source.name || `${domain}-asset`, `${domain}-asset`);
  return {
    assetId,
    domain,
    sourceToolId: safeString(source.sourceToolId, ""),
    runtimeFileName: safeString(source.runtimeFileName, `${assetId}.runtime.json`),
    toolDataFileName: safeString(source.toolDataFileName, `${assetId}.tool.json`),
    metadata: source.metadata && typeof source.metadata === "object" ? { ...source.metadata } : {}
  };
}

function sortByDomainAndAssetId(entries) {
  return entries.slice().sort((left, right) => {
    if (left.domain !== right.domain) {
      return left.domain.localeCompare(right.domain);
    }
    return left.assetId.localeCompare(right.assetId);
  });
}

function createDomainPaths(gameId, domain, runtimeFileName, toolDataFileName) {
  const normalizedGameId = normalizeGameId(gameId);
  const normalizedDomain = normalizeDomain(domain);
  const runtimeName = toSlug(runtimeFileName.replace(/\.json$/i, ""), `${normalizedDomain}-asset`) + ".json";
  const toolName = toSlug(toolDataFileName.replace(/\.json$/i, ""), `${normalizedDomain}-asset-tool`) + ".json";
  return {
    runtimePath: `games/${normalizedGameId}/assets/${normalizedDomain}/${runtimeName}`,
    toolDataPath: `games/${normalizedGameId}/assets/${normalizedDomain}/data/${toolName}`
  };
}

function collectRecords(domainInputs) {
  const source = domainInputs && typeof domainInputs === "object" ? domainInputs : {};
  const rows = [];
  ASSET_PIPELINE_ACTIVE_DOMAINS.forEach((domain) => {
    toArray(source[domain]).forEach((record) => {
      rows.push(normalizeDomainRecord(record, domain));
    });
  });
  return sortByDomainAndAssetId(rows);
}

function validateToolContracts(toolStates) {
  const source = toolStates && typeof toolStates === "object" ? toolStates : {};
  const validations = {};
  const issues = [];

  Object.entries(source).forEach(([toolId, state]) => {
    const validation = validateToolStateContract(toolId, state);
    validations[toolId] = {
      valid: validation.valid,
      issues: validation.issues.slice(),
      warnings: validation.warnings.slice(),
      contractId: validation.contractId
    };
    if (!validation.valid) {
      issues.push(...validation.issues.map((message) => `${toolId}: ${message}`));
    }
  });

  return {
    validations,
    valid: issues.length === 0,
    issues
  };
}

function buildCoordinator(gameId, records) {
  const domains = {};
  ASSET_PIPELINE_ACTIVE_DOMAINS.forEach((domain) => {
    domains[domain] = [];
  });
  records.forEach((record) => {
    domains[record.domain].push({
      assetId: record.assetId,
      runtimePath: record.runtimePath,
      toolDataPath: record.toolDataPath,
      sourceToolId: record.sourceToolId,
      metadata: { ...record.metadata }
    });
  });

  return {
    schema: `${ASSET_PIPELINE_TOOLING_SCHEMA}.coordinator`,
    version: ASSET_PIPELINE_TOOLING_VERSION,
    gameId: normalizeGameId(gameId),
    domains
  };
}

export function runAssetPipelineTooling(options = {}) {
  const gameId = normalizeGameId(options.gameId);
  const loadedRecords = collectRecords(options.domainInputs);
  const contractValidation = validateToolContracts(options.toolStates);
  const errors = [];

  const loadStage = {
    stage: ASSET_PIPELINE_TOOLING_STAGES.LOAD,
    gameId,
    domainCount: ASSET_PIPELINE_ACTIVE_DOMAINS.length,
    loadedRecordCount: loadedRecords.length
  };

  const validateStage = {
    stage: ASSET_PIPELINE_TOOLING_STAGES.VALIDATE,
    valid: contractValidation.valid,
    issues: contractValidation.issues.slice(),
    toolContracts: contractValidation.validations
  };

  if (!validateStage.valid) {
    appendAssetErrors(
      errors,
      validateStage.issues.map((message) => ({
        code: "PIPELINE_TOOL_CONTRACT_INVALID",
        stage: "validate",
        message,
        domain: "",
        assetId: ""
      }))
    );
    return {
      schema: ASSET_PIPELINE_TOOLING_SCHEMA,
      version: ASSET_PIPELINE_TOOLING_VERSION,
      status: "invalid",
      errors,
      stages: {
        load: loadStage,
        validate: validateStage,
        normalize: {
          stage: ASSET_PIPELINE_TOOLING_STAGES.NORMALIZE,
          normalizedRecordCount: 0
        },
        emit: {
          stage: ASSET_PIPELINE_TOOLING_STAGES.EMIT,
          emittedRecordCount: 0
        }
      },
      records: [],
      coordinator: null
    };
  }

  const normalizedRecords = loadedRecords.map((record) => {
    const paths = createDomainPaths(gameId, record.domain, record.runtimeFileName, record.toolDataFileName);
    return {
      ...record,
      ...paths
    };
  });

  const normalizeStage = {
    stage: ASSET_PIPELINE_TOOLING_STAGES.NORMALIZE,
    normalizedRecordCount: normalizedRecords.length
  };
  const coordinator = buildCoordinator(gameId, normalizedRecords);
  const gameAssetManifest = coordinateGameAssetManifest({
    gameId,
    coordinatorPath: `games/${gameId}/assets/${gameId}.assets.json`,
    records: normalizedRecords,
    existingManifest: options.existingManifest
  });
  const emitStage = {
    stage: ASSET_PIPELINE_TOOLING_STAGES.EMIT,
    coordinatorPath: gameAssetManifest.filePath,
    gameAssetManifestPath: gameAssetManifest.filePath,
    emittedRecordCount: normalizedRecords.length
  };

  return {
    schema: ASSET_PIPELINE_TOOLING_SCHEMA,
    version: ASSET_PIPELINE_TOOLING_VERSION,
    status: "ready",
    errors,
    stages: {
      load: loadStage,
      validate: validateStage,
      normalize: normalizeStage,
      emit: emitStage
    },
    records: normalizedRecords,
    coordinator,
    gameAssetManifest
  };
}
