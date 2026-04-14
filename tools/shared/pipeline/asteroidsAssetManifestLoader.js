import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  discoverRuntimeAssetSourcesFromManifest,
  validateGameAssetManifestStructure
} from "./gameAssetManifestDiscovery.js";

export const ASTEROIDS_ASSET_MANIFEST_RELATIVE_PATH = "games/Asteroids/assets/asteroids.asset.manifest.json";

const MODULE_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(MODULE_DIRECTORY, "../../../");

function toManifestPath(options = {}) {
  if (typeof options.manifestPath === "string" && options.manifestPath.trim()) {
    return path.resolve(options.manifestPath);
  }
  return path.resolve(REPO_ROOT, ASTEROIDS_ASSET_MANIFEST_RELATIVE_PATH);
}

async function readManifestJson(manifestPath) {
  const raw = await fs.readFile(manifestPath, "utf8");
  return {
    raw,
    manifest: JSON.parse(raw)
  };
}

export async function loadAsteroidsAssetManifest(options = {}) {
  const manifestPath = toManifestPath(options);
  let payload;
  try {
    payload = await readManifestJson(manifestPath);
  } catch (error) {
    return {
      status: "invalid",
      manifestPath,
      manifest: null,
      discovery: null,
      issues: [error instanceof Error ? error.message : "Failed to read Asteroids asset manifest."]
    };
  }

  const validation = validateGameAssetManifestStructure(payload.manifest, { gameId: "asteroids" });
  if (!validation.valid) {
    return {
      status: "invalid",
      manifestPath,
      manifest: payload.manifest,
      discovery: null,
      issues: validation.issues
    };
  }

  const discovery = discoverRuntimeAssetSourcesFromManifest(payload.manifest, { gameId: "asteroids" });
  return {
    status: discovery.status,
    manifestPath,
    manifest: payload.manifest,
    discovery,
    issues: discovery.issues || []
  };
}

export async function discoverAsteroidsRuntimeAssets(options = {}) {
  const loaded = await loadAsteroidsAssetManifest(options);
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
