import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  discoverRuntimeAssetSourcesFromManifest,
  validateGameAssetManifestStructure
} from "./gameAssetManifestDiscovery.js";

const MODULE_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(MODULE_DIRECTORY, "../../../");

function toManifestPath(gameId, options = {}) {
  if (typeof options.manifestPath === "string" && options.manifestPath.trim()) {
    return path.resolve(options.manifestPath);
  }
  return path.resolve(REPO_ROOT, getAssetManifestRelativePath(gameId));
}

function toGameId(gameId) {
  return String(gameId || "").trim();
}

async function readManifestJson(manifestPath) {
  const raw = await fs.readFile(manifestPath, "utf8");
  return {
    raw,
    manifest: JSON.parse(raw)
  };
}

export function getAssetManifestRelativePath(gameId) {
  const normalizedGameId = toGameId(gameId);
  if (!normalizedGameId) {
    throw new Error("gameId is required to resolve asset manifest path.");
  }
  return `games/${normalizedGameId}/assets/tools.manifest.json`;
}

export async function loadAssetManifest(gameId, options = {}) {
  const normalizedGameId = toGameId(gameId);
  if (!normalizedGameId) {
    return {
      status: "invalid",
      manifestPath: "",
      manifest: null,
      discovery: null,
      issues: ["gameId is required."]
    };
  }

  const manifestPath = toManifestPath(normalizedGameId, options);
  let payload;
  try {
    payload = await readManifestJson(manifestPath);
  } catch (error) {
    return {
      status: "invalid",
      manifestPath,
      manifest: null,
      discovery: null,
      issues: [error instanceof Error ? error.message : "Failed to read game asset manifest."]
    };
  }

  const validation = validateGameAssetManifestStructure(payload.manifest, {
    gameId: normalizedGameId.toLowerCase()
  });
  if (!validation.valid) {
    return {
      status: "invalid",
      manifestPath,
      manifest: payload.manifest,
      discovery: null,
      issues: validation.issues
    };
  }

  const discovery = discoverRuntimeAssetSourcesFromManifest(payload.manifest, {
    gameId: normalizedGameId.toLowerCase()
  });
  return {
    status: discovery.status,
    manifestPath,
    manifest: payload.manifest,
    discovery,
    issues: discovery.issues || []
  };
}

export async function discoverRuntimeAssets(gameId, options = {}) {
  const loaded = await loadAssetManifest(gameId, options);
  if (loaded.status !== "ready") {
    return {
      status: "invalid",
      manifestPath: loaded.manifestPath,
      runtimeAssetSources: {},
      records: [],
      issues: loaded.issues || []
    };
  }

  return {
    status: "ready",
    manifestPath: loaded.manifestPath,
    runtimeAssetSources: loaded.discovery.runtimeAssetSources,
    records: loaded.discovery.records,
    issues: []
  };
}
