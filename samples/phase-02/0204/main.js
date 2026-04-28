/*
Toolbox Aid
David Quesenberry
03/21/2026
main.js
*/
import Engine from '/src/engine/core/Engine.js';
import { InputService } from '/src/engine/input/index.js';
import AssetRegistryScene from './AssetRegistryScene.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const input = new InputService();
const canvas = document.getElementById('game');

const engine = new Engine({
  canvas,
  width: 960,
  height: 540,
  fixedStepMs: 1000 / 60,
  input,
});

function normalizeAssetRegistryEntries(rawEntries) {
  if (!Array.isArray(rawEntries)) {
    return [];
  }
  return rawEntries
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => ({
      id: String(entry.id || '').trim(),
      type: String(entry.type || '').trim(),
      path: String(entry.path || '').trim(),
      status: String(entry.status || 'registered').trim() || 'registered',
    }))
    .filter((entry) => entry.id && entry.type && entry.path);
}

function resolveSamplePresetPath() {
  const params = new URLSearchParams(window.location.search);
  const queryPath = String(params.get('samplePresetPath') || '').trim();
  if (queryPath && !queryPath.includes('..')) {
    return queryPath;
  }
  return './sample.0204.asset-browser.json';
}

async function loadAssetRegistryFromJson() {
  const presetPath = resolveSamplePresetPath();
  try {
    const response = await fetch(presetPath, { cache: 'no-store' });
    if (!response.ok) {
      return {
        assets: [],
        sourceStatus: `Sample preset load failed (${response.status}) from ${presetPath}.`,
      };
    }
    const preset = await response.json();
    const entries = normalizeAssetRegistryEntries(preset?.config?.assetCatalog?.entries);
    if (entries.length <= 0) {
      return {
        assets: [],
        sourceStatus: `Sample preset loaded from ${presetPath}, but no assetCatalog.entries were declared.`,
      };
    }
    return {
      assets: entries,
      sourceStatus: `Loaded ${entries.length} asset registry entries from ${presetPath}.`,
    };
  } catch (error) {
    return {
      assets: [],
      sourceStatus: `Sample preset parse failed from ${presetPath}: ${error instanceof Error ? error.message : 'unknown error'}.`,
    };
  }
}

async function boot() {
  const registryData = await loadAssetRegistryFromJson();
  engine.setScene(new AssetRegistryScene(registryData));
  engine.start();
}

void boot();
