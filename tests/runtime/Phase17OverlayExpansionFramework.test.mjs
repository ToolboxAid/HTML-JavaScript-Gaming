/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17OverlayExpansionFramework.test.mjs
*/
import assert from 'node:assert/strict';
import { LEVEL17_OVERLAY_CYCLE_KEY } from '../../samples/phase-17/shared/overlayCycleInput.js';
import {
  defineOverlayExtensionContract,
  getOverlayControllerConfigFromContract,
} from '../../samples/phase-17/shared/overlayExpansionContracts.js';
import {
  getLevel17OverlayExtensionContract,
  getLevel17OverlayStackConfig,
  listLevel17OverlayExtensionContracts,
} from '../../samples/phase-17/shared/overlayStackBySampleConfig.js';

function assertLevel17ContractsMatchControllerConfigs() {
  const contracts = listLevel17OverlayExtensionContracts();
  assert.equal(contracts.length, 6, 'Level 17 overlay extension contracts should be defined for samples 1708-1713.');

  for (let sampleId = 1708; sampleId <= 1713; sampleId += 1) {
    const key = String(sampleId);
    const contract = getLevel17OverlayExtensionContract(key);
    const config = getLevel17OverlayStackConfig(key);
    assert.equal(Boolean(contract), true, `Overlay extension contract should exist for sample ${key}.`);
    assert.equal(Boolean(config), true, `Overlay controller config should exist for sample ${key}.`);

    const resolved = getOverlayControllerConfigFromContract(contract);
    assert.deepEqual(resolved, config, `Overlay controller config for sample ${key} should be derived from extension contract.`);
    assert.equal(contract.cycleKey, LEVEL17_OVERLAY_CYCLE_KEY, `Overlay contract for sample ${key} should use shared cycle key.`);
    assert.equal(Array.isArray(contract.runtimeExtensions), true, `Overlay contract for sample ${key} should expose runtime extension hooks.`);
    assert.equal(Array.isArray(config.runtimeExtensions), true, `Overlay config for sample ${key} should expose runtime extension hooks.`);
  }
}

function assertContractNormalizationForExpansionPath() {
  const contract = defineOverlayExtensionContract({
    id: 'future-sample',
    overlays: [
      { id: 'runtime', label: 'Runtime' },
      { id: 'runtime', label: 'Duplicate Runtime' },
      { id: 'hud', label: 'HUD' },
    ],
    initialOverlayId: 'missing-id',
    cycleKey: 'KeyG',
    persistenceKey: 'phaseX:future:overlay-index',
    channel: 'gameplay',
    runtimeExtensions: [
      {
        overlayId: 'runtime',
        onStep() {},
      },
      {
        overlayId: 'runtime',
      },
    ],
    metadata: { family: 'future-track' },
  });

  assert.equal(contract.id, 'future-sample', 'Contract id should be preserved.');
  assert.equal(contract.channel, 'gameplay', 'Contract channel should be preserved.');
  assert.equal(contract.overlays.length, 2, 'Contract normalization should dedupe duplicate overlay ids.');
  assert.equal(contract.initialOverlayId, 'runtime', 'Missing initial overlay id should fall back to first normalized overlay.');
  assert.equal(contract.runtimeExtensions.length, 1, 'Runtime extension hooks should normalize invalid entries.');
  assert.equal(contract.metadata.family, 'future-track', 'Contract metadata should be retained.');
}

export function run() {
  assertLevel17ContractsMatchControllerConfigs();
  assertContractNormalizationForExpansionPath();
}
