import { safeString } from "../projectSystemValueUtils.js";

export const GAME_ASSET_MANIFEST_SCHEMA = "html-js-gaming.game-asset-manifest";
export const GAME_ASSET_MANIFEST_VERSION = 1;

const ACTIVE_DOMAINS = Object.freeze(["sprites", "tilemaps", "parallax", "vectors"]);

function toSlug(value, fallback = "game") {
  const text = safeString(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return text || fallback;
}

function asObject(value) {
  return value && typeof value === "object" ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeRecord(rawRecord, domain) {
  const source = asObject(rawRecord);
  return {
    assetId: toSlug(source.assetId || source.id || `${domain}-asset`, `${domain}-asset`),
    runtimePath: safeString(source.runtimePath, ""),
    toolDataPath: safeString(source.toolDataPath, ""),
    sourceToolId: safeString(source.sourceToolId, ""),
    metadata: source.metadata && typeof source.metadata === "object" ? { ...source.metadata } : {}
  };
}

function sortDomainEntries(entries) {
  return entries.slice().sort((left, right) => left.assetId.localeCompare(right.assetId));
}

function buildEmptyDomains() {
  const domains = {};
  ACTIVE_DOMAINS.forEach((domain) => {
    domains[domain] = [];
  });
  return domains;
}

function normalizeExistingManifest(existingManifest, gameId) {
  const source = asObject(existingManifest);
  const sourceDomains = asObject(source.domains);
  const domains = buildEmptyDomains();

  ACTIVE_DOMAINS.forEach((domain) => {
    domains[domain] = sortDomainEntries(
      asArray(sourceDomains[domain]).map((entry) => normalizeRecord(entry, domain))
    );
  });

  return {
    schema: GAME_ASSET_MANIFEST_SCHEMA,
    version: GAME_ASSET_MANIFEST_VERSION,
    gameId: toSlug(source.gameId || gameId, "game"),
    domains
  };
}

function mergeDomains(baseDomains, incomingRecords) {
  const merged = buildEmptyDomains();
  ACTIVE_DOMAINS.forEach((domain) => {
    const byId = new Map();
    asArray(baseDomains[domain]).forEach((entry) => {
      const normalized = normalizeRecord(entry, domain);
      byId.set(normalized.assetId, normalized);
    });
    incomingRecords
      .filter((record) => record.domain === domain)
      .forEach((record) => {
        const normalized = normalizeRecord(record, domain);
        byId.set(normalized.assetId, normalized);
      });
    merged[domain] = sortDomainEntries(Array.from(byId.values()));
  });
  return merged;
}

export function coordinateGameAssetManifest(options = {}) {
  const gameId = toSlug(options.gameId, "game");
  const records = asArray(options.records).map((entry) => ({
    ...asObject(entry),
    domain: ACTIVE_DOMAINS.includes(safeString(entry?.domain, "").toLowerCase())
      ? safeString(entry.domain, "").toLowerCase()
      : ""
  })).filter((entry) => Boolean(entry.domain));
  const coordinatorPath = safeString(
    options.coordinatorPath,
    `games/${gameId}/assets/tools.manifest.json`
  );

  const normalizedExisting = normalizeExistingManifest(options.existingManifest, gameId);
  const mergedDomains = mergeDomains(normalizedExisting.domains, records);
  const mergedManifest = {
    schema: GAME_ASSET_MANIFEST_SCHEMA,
    version: GAME_ASSET_MANIFEST_VERSION,
    gameId,
    domains: mergedDomains
  };

  const domainCounts = {};
  let totalAssets = 0;
  ACTIVE_DOMAINS.forEach((domain) => {
    const count = mergedDomains[domain].length;
    domainCounts[domain] = count;
    totalAssets += count;
  });

  return {
    status: "ready",
    filePath: coordinatorPath,
    manifest: mergedManifest,
    serialized: `${JSON.stringify(mergedManifest, null, 2)}\n`,
    summary: {
      totalAssets,
      domainCounts
    }
  };
}
