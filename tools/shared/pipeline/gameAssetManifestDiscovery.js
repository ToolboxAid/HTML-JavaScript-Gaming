import { safeString } from "../projectSystemValueUtils.js";
import {
  GAME_ASSET_MANIFEST_SCHEMA,
  GAME_ASSET_MANIFEST_VERSION
} from "./gameAssetManifestCoordinator.js";

const SUPPORTED_DOMAINS = Object.freeze(["sprites", "tilemaps", "parallax", "vectors"]);

function asObject(value) {
  return value && typeof value === "object" ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function pushIssue(issues, message) {
  issues.push(safeString(message, "Invalid manifest structure."));
}

function inferRuntimeKind(domain, metadata) {
  const runtimeType = safeString(asObject(metadata).runtimeType, "").toLowerCase();
  if (runtimeType) {
    return runtimeType;
  }
  if (domain === "tilemaps") {
    return "tilemap";
  }
  if (domain === "sprites") {
    return "sprite";
  }
  if (domain === "vectors") {
    return "vector";
  }
  if (domain === "parallax") {
    return "parallax";
  }
  return "data";
}

export function validateGameAssetManifestStructure(manifestInput, options = {}) {
  const manifest = asObject(manifestInput);
  const issues = [];
  const expectedGameId = safeString(options.gameId, "").toLowerCase();

  if (safeString(manifest.schema, "") !== GAME_ASSET_MANIFEST_SCHEMA) {
    pushIssue(issues, `manifest.schema must equal ${GAME_ASSET_MANIFEST_SCHEMA}.`);
  }
  if (manifest.version !== GAME_ASSET_MANIFEST_VERSION) {
    pushIssue(issues, `manifest.version must equal ${GAME_ASSET_MANIFEST_VERSION}.`);
  }

  const gameId = safeString(manifest.gameId, "").toLowerCase();
  if (!gameId) {
    pushIssue(issues, "manifest.gameId is required.");
  }
  if (expectedGameId && gameId && gameId !== expectedGameId) {
    pushIssue(issues, `manifest.gameId must match expected gameId ${expectedGameId}.`);
  }

  const domains = asObject(manifest.domains);
  SUPPORTED_DOMAINS.forEach((domain) => {
    const domainEntries = domains[domain];
    if (!Array.isArray(domainEntries)) {
      pushIssue(issues, `manifest.domains.${domain} must be an array.`);
      return;
    }
    domainEntries.forEach((entry, index) => {
      const assetId = safeString(entry?.assetId, "");
      const runtimePath = safeString(entry?.runtimePath, "");
      const toolDataPath = safeString(entry?.toolDataPath, "");
      if (!assetId) {
        pushIssue(issues, `manifest.domains.${domain}[${index}].assetId is required.`);
      }
      if (!runtimePath) {
        pushIssue(issues, `manifest.domains.${domain}[${index}].runtimePath is required.`);
      }
      if (!toolDataPath) {
        pushIssue(issues, `manifest.domains.${domain}[${index}].toolDataPath is required.`);
      }
      if (runtimePath.includes("/data/")) {
        pushIssue(issues, `manifest.domains.${domain}[${index}] runtimePath cannot point into /data/.`);
      }
    });
  });

  return {
    valid: issues.length === 0,
    issues,
    manifest
  };
}

export function discoverRuntimeAssetSourcesFromManifest(manifestInput, options = {}) {
  const validation = validateGameAssetManifestStructure(manifestInput, options);
  if (!validation.valid) {
    return {
      status: "invalid",
      runtimeAssetSources: {},
      records: [],
      issues: validation.issues,
      gameId: safeString(asObject(manifestInput).gameId, "")
    };
  }

  const manifest = validation.manifest;
  const sources = {};
  const records = [];

  SUPPORTED_DOMAINS.forEach((domain) => {
    asArray(manifest.domains[domain]).forEach((entry) => {
      const assetId = safeString(entry?.assetId, "");
      const runtimePath = safeString(entry?.runtimePath, "");
      const toolDataPath = safeString(entry?.toolDataPath, "");
      if (!assetId || !runtimePath) {
        return;
      }
      const metadata = asObject(entry?.metadata);
      sources[assetId] = {
        file: runtimePath,
        path: runtimePath,
        kind: inferRuntimeKind(domain, metadata),
        domain,
        sourceToolId: safeString(entry?.sourceToolId, "")
      };
      records.push({
        domain,
        assetId,
        runtimePath,
        toolDataPath,
        sourceToolId: safeString(entry?.sourceToolId, ""),
        metadata
      });
    });
  });

  return {
    status: "ready",
    runtimeAssetSources: sources,
    records,
    issues: [],
    gameId: safeString(manifest.gameId, "")
  };
}