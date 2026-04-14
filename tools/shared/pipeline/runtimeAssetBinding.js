import { safeString } from "../projectSystemValueUtils.js";
import { GAME_ASSET_MANIFEST_SCHEMA, GAME_ASSET_MANIFEST_VERSION } from "./gameAssetManifestCoordinator.js";

export const RUNTIME_ASSET_BINDING_SCHEMA = "html-js-gaming.runtime-asset-binding";
export const RUNTIME_ASSET_BINDING_VERSION = 1;

export const RUNTIME_ACTIVE_DOMAINS = Object.freeze(["sprites", "tilemaps", "parallax", "vectors"]);

function asObject(value) {
  return value && typeof value === "object" ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toSlug(value, fallback = "asset") {
  const text = safeString(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return text || fallback;
}

function normalizeDomain(value) {
  const domain = safeString(value, "").toLowerCase();
  return RUNTIME_ACTIVE_DOMAINS.includes(domain) ? domain : "";
}

function isRuntimePath(pathValue, domain) {
  const path = safeString(pathValue, "");
  if (!path) {
    return false;
  }
  if (path.includes("/data/")) {
    return false;
  }
  return path.includes(`/assets/${domain}/`);
}

function normalizeManifestRecord(rawRecord, domain) {
  const source = asObject(rawRecord);
  return {
    assetId: toSlug(source.assetId || source.id || `${domain}-asset`, `${domain}-asset`),
    runtimePath: safeString(source.runtimePath, ""),
    sourceToolId: safeString(source.sourceToolId, ""),
    metadata: source.metadata && typeof source.metadata === "object" ? { ...source.metadata } : {}
  };
}

function buildDomainBindingEntries(rawEntries, domain) {
  const runtimeEntries = [];
  const rejectedEntries = [];
  const byAssetId = new Map();

  asArray(rawEntries).forEach((entry) => {
    const normalized = normalizeManifestRecord(entry, domain);
    if (!isRuntimePath(normalized.runtimePath, domain)) {
      rejectedEntries.push({
        assetId: normalized.assetId,
        reason: "non-runtime-path"
      });
      return;
    }
    byAssetId.set(normalized.assetId, normalized);
  });

  Array.from(byAssetId.values())
    .sort((left, right) => left.assetId.localeCompare(right.assetId))
    .forEach((entry) => runtimeEntries.push(entry));

  return {
    runtimeEntries,
    rejectedEntries
  };
}

export function createRuntimeAssetBinding(manifestInput) {
  const manifest = asObject(manifestInput);
  const domains = asObject(manifest.domains);
  const bindingDomains = {};
  const rejected = [];
  const issues = [];

  if (safeString(manifest.schema, "") !== GAME_ASSET_MANIFEST_SCHEMA) {
    issues.push(`Expected manifest schema ${GAME_ASSET_MANIFEST_SCHEMA}.`);
  }
  if (Number(manifest.version) !== GAME_ASSET_MANIFEST_VERSION) {
    issues.push(`Expected manifest version ${GAME_ASSET_MANIFEST_VERSION}.`);
  }

  RUNTIME_ACTIVE_DOMAINS.forEach((domain) => {
    const result = buildDomainBindingEntries(domains[domain], domain);
    bindingDomains[domain] = result.runtimeEntries;
    result.rejectedEntries.forEach((entry) => {
      rejected.push({
        domain,
        assetId: entry.assetId,
        reason: entry.reason
      });
    });
  });

  return {
    schema: RUNTIME_ASSET_BINDING_SCHEMA,
    version: RUNTIME_ASSET_BINDING_VERSION,
    status: issues.length === 0 ? "ready" : "invalid",
    gameId: toSlug(manifest.gameId, "game"),
    issues,
    rejected,
    domains: bindingDomains
  };
}

export function resolveRuntimeAsset(bindingInput, options = {}) {
  const binding = asObject(bindingInput);
  const domain = normalizeDomain(options.domain);
  const assetId = toSlug(options.assetId, "");
  if (!domain || !assetId) {
    return null;
  }
  const entries = asArray(asObject(binding.domains)[domain]);
  return entries.find((entry) => toSlug(entry.assetId, "") === assetId) || null;
}
