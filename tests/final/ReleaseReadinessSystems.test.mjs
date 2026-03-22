/*
Toolbox Aid
David Quesenberry
03/22/2026
ReleaseReadinessSystems.test.mjs
*/
import assert from 'node:assert/strict';
import {
  AccessibilityOptions,
  CrashRecoveryManager,
  DeploymentProfiles,
  DistributionPackager,
  ReleaseValidationChecklist,
  SettingsSystem,
} from '../../engine/release/index.js';
import { Logger } from '../../engine/logging/index.js';
import { StorageService } from '../../engine/persistence/index.js';

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  setItem(key, value) {
    this.values.set(key, value);
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }
}

export async function run() {
  const storage = new StorageService(new MemoryStorage());
  const settings = new SettingsSystem({
    namespace: 'test:settings',
    storage,
    defaults: {
      audio: { musicVolume: 0.6 },
      video: { fullscreenPreferred: false },
    },
  });
  settings.set('audio.musicVolume', 0.4, { autosave: true });
  const reloaded = new SettingsSystem({
    namespace: 'test:settings',
    storage,
    defaults: {
      audio: { musicVolume: 0.6 },
      video: { fullscreenPreferred: false },
    },
  });
  reloaded.load();
  assert.equal(reloaded.get('audio.musicVolume'), 0.4);

  const accessibility = new AccessibilityOptions({ settings });
  accessibility.setOption('highContrast', true);
  accessibility.setOption('reducedMotion', true);
  assert.equal(accessibility.getPresentationProfile().palette.accent, '#facc15');
  assert.equal(accessibility.getPresentationProfile().motionScale < 1, true);

  const profiles = new DeploymentProfiles({
    debug: { diagnostics: true, optimizeAssets: false },
    production: { analytics: true, optimizeAssets: true },
  });
  assert.equal(profiles.resolve('debug').flags.includes('diagnostics'), true);
  assert.equal(profiles.resolve('production').flags.includes('optimized-assets'), true);

  const packager = new DistributionPackager();
  const pkg = packager.createPackage({
    id: 'release-demo',
    version: '1.2.3',
    profile: profiles.resolve('production'),
    samples: ['sample141-settings-system'],
    assets: ['samples/shared/theme.css', 'samples/shared/theme.css'],
  });
  assert.equal(pkg.fileCount, 2);

  const logger = new Logger({ channel: 'release-test' });
  const recovery = new CrashRecoveryManager({
    namespace: 'test:crash',
    storage,
    logger,
    fallbackFactory: (crash) => ({ screen: 'fallback', reason: crash.label }),
  });
  const safeResult = recovery.run('Scene Tick', () => 42, { sampleId: 'sample145' });
  assert.equal(safeResult.ok, true);
  const failed = recovery.run('Scene Tick', () => {
    throw new Error('boom');
  }, { sampleId: 'sample145' });
  assert.equal(failed.ok, false);
  assert.equal(failed.fallback.screen, 'fallback');
  assert.equal(recovery.restoreLastCrash().context.sampleId, 'sample145');

  const checklist = new ReleaseValidationChecklist([
    { id: 'manifest', run: () => ({ passed: true, detail: 'Manifest updated.' }) },
    { id: 'tests', run: () => ({ passed: false, detail: 'One suite still failing.' }) },
    { id: 'notes', required: false, run: () => false },
  ]);
  const report = checklist.run();
  assert.equal(report.passed, false);
  assert.equal(report.failedCount, 2);
}
