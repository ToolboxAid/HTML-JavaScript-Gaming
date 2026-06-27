import { bootLateSample } from '../../shared/lateSampleBootstrap.js';
import AssetImportPipelineScene from './AssetImportPipelineScene.js';

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveSamplePresetPath() {
  const params = new URLSearchParams(window.location.search);
  const queryPath = normalizeText(params.get('samplePresetPath'));
  if (queryPath && !queryPath.includes('..')) {
    return queryPath;
  }
  return './sample.1413.asset-pipeline.json';
}

function deriveImportInputFromPipelinePayload(pipelinePayload) {
  const payload = pipelinePayload && typeof pipelinePayload === 'object' ? pipelinePayload : {};
  const domainInputs = payload.domainInputs && typeof payload.domainInputs === 'object' ? payload.domainInputs : {};
  const spriteEntries = Array.isArray(domainInputs.sprites) ? domainInputs.sprites : [];
  const firstSprite = spriteEntries.find((entry) => entry && typeof entry === 'object') || null;
  if (!firstSprite) {
    return null;
  }
  const assetId = normalizeText(firstSprite.assetId);
  const sourceToolId = normalizeText(firstSprite.sourceToolId);
  if (!assetId || !sourceToolId) {
    return null;
  }
  return {
    id: assetId,
    source: sourceToolId,
  };
}

async function loadSceneInput() {
  const presetPath = resolveSamplePresetPath();
  try {
    const response = await fetch(presetPath, { cache: 'no-store' });
    if (!response.ok) {
      return {
        importInput: { id: '', source: '' },
        sourceStatus: `Sample preset load failed (${response.status}) from ${presetPath}.`,
      };
    }
    const preset = await response.json();
    const explicitInput = preset?.config?.sampleImportInput && typeof preset.config.sampleImportInput === 'object'
      ? preset.config.sampleImportInput
      : null;
    const pipelineInput = deriveImportInputFromPipelinePayload(preset?.config?.pipelinePayload);
    const nextInput = explicitInput || pipelineInput;
    const assetId = normalizeText(nextInput?.id);
    const source = normalizeText(nextInput?.source);
    if (!assetId || !source) {
      return {
        importInput: { id: '', source: '' },
        sourceStatus: `Sample preset loaded from ${presetPath}, but no explicit import input was declared.`,
      };
    }
    return {
      importInput: { id: assetId, source },
      sourceStatus: `Loaded import input from ${presetPath}: ${assetId} via ${source}.`,
    };
  } catch (error) {
    return {
      importInput: { id: '', source: '' },
      sourceStatus: `Sample preset parse failed from ${presetPath}: ${error instanceof Error ? error.message : 'unknown error'}.`,
    };
  }
}

async function boot() {
  const sceneInput = await loadSceneInput();
  bootLateSample({
    sceneFactory: () => new AssetImportPipelineScene(sceneInput),
    controls: [
      { id: 'import-run', action: ({ scene }) => scene.runImport() },
    ],
  });
}

void boot();
