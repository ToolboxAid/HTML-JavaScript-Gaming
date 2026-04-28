/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import AssetBrowserScene from './AssetBrowserScene.js';

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveSamplePresetPath() {
  const params = new URLSearchParams(window.location.search);
  const queryPath = normalizeText(params.get('samplePresetPath'));
  if (queryPath && !queryPath.includes('..')) {
    return queryPath;
  }
  return './sample.1505.asset-browser.json';
}

function normalizeAssetEntries(rawEntries) {
  if (!Array.isArray(rawEntries)) {
    return [];
  }
  return rawEntries
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => ({
      id: normalizeText(entry.id),
      category: normalizeText(entry.category) || normalizeText(entry.type) || 'Workflow JSON',
      path: normalizeText(entry.path),
    }))
    .filter((entry) => entry.id && entry.path);
}

function applyControlLabel(buttonId, text) {
  const button = document.getElementById(buttonId);
  if (button && text) {
    button.textContent = text;
  }
}

async function loadSceneAssets() {
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
    const entries = normalizeAssetEntries(preset?.config?.assetCatalog?.entries);
    if (entries.length <= 0) {
      return {
        assets: [],
        sourceStatus: `Sample preset loaded from ${presetPath}, but no assetCatalog.entries were declared.`,
      };
    }
    return {
      assets: entries,
      sourceStatus: `Loaded ${entries.length} asset entries from ${presetPath}.`,
    };
  } catch (error) {
    return {
      assets: [],
      sourceStatus: `Sample preset parse failed from ${presetPath}: ${error instanceof Error ? error.message : 'unknown error'}.`,
    };
  }
}

async function boot() {
  const sceneData = await loadSceneAssets();
  const primaryAsset = sceneData.assets[0] || null;
  const secondaryAsset = sceneData.assets[1] || null;

  if (primaryAsset) {
    applyControlLabel('asset-texture', `Select ${primaryAsset.id}`);
  }
  if (secondaryAsset) {
    applyControlLabel('asset-audio', `Select ${secondaryAsset.id}`);
  }

  bootLateSample({
    sceneFactory: () => new AssetBrowserScene(sceneData),
    controls: [
      { id: 'asset-texture', action: ({ scene }) => scene.select(primaryAsset?.id || '') },
      { id: 'asset-audio', action: ({ scene }) => scene.select(secondaryAsset?.id || '') },
    ],
  });
}

void boot();
