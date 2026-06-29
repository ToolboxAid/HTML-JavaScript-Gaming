/*
Toolbox Aid
David Quesenberry
03/22/2026
EditorAutomationSecurityPipeline.test.mjs
*/
import assert from 'node:assert/strict';
import LevelEditor from '../../../www/src/shared/toolbox/editor/LevelEditor.js';
import TileMapEditor from '../../../www/src/shared/toolbox/editor/TileMapEditor.js';
import EntityPlacementEditor from '../../../www/src/shared/toolbox/editor/EntityPlacementEditor.js';
import TimelineEditor from '../../../www/src/shared/toolbox/editor/TimelineEditor.js';
import AutomatedTestRunner from '../../../www/src/engine/automation/AutomatedTestRunner.js';
import RegressionPlaybackHarness from '../../../www/src/engine/automation/RegressionPlaybackHarness.js';
import BenchmarkRunner from '../../../www/src/engine/automation/BenchmarkRunner.js';
import CIValidationFlow from '../../../www/src/engine/automation/CIValidationFlow.js';
import PacketValidator from '../../../www/src/engine/security/PacketValidator.js';
import DataIntegrityService from '../../../www/src/engine/security/DataIntegrityService.js';
import PermissionGate from '../../../www/src/engine/security/PermissionGate.js';
import SessionTrustValidator from '../../../www/src/engine/security/SessionTrustValidator.js';
import AssetImportPipeline from '../../../www/src/shared/toolbox/pipeline/AssetImportPipeline.js';
import TexturePreprocessPipeline from '../../../www/src/shared/toolbox/pipeline/TexturePreprocessPipeline.js';
import AudioPreprocessPipeline from '../../../www/src/shared/toolbox/pipeline/AudioPreprocessPipeline.js';
import ContentMigrationSystem from '../../../www/src/shared/toolbox/pipeline/ContentMigrationSystem.js';
import BuildAssetManifestSystem from '../../../www/src/shared/toolbox/pipeline/BuildAssetManifestSystem.js';
import ContentValidationPipeline from '../../../www/src/shared/toolbox/pipeline/ContentValidationPipeline.js';

export async function run() {
  const level = new LevelEditor({ width: 4, height: 3 });
  level.setCell(1, 1, 7);
  assert.equal(level.getCell(1, 1), 7);

  const tiles = new TileMapEditor({ width: 3, height: 3 });
  tiles.setActiveTile(2);
  tiles.paint(0, 0);
  assert.equal(tiles.getCell(0, 0), 2);

  const placement = new EntityPlacementEditor();
  placement.addEntity({ id: 'npc', x: 1, y: 2 });
  placement.moveEntity('npc', 4, 5);
  assert.equal(placement.exportEntities()[0].x, 4);

  const timeline = new TimelineEditor();
  timeline.addClip({ id: 'clip-b', start: 8, duration: 2 });
  timeline.addClip({ id: 'clip-a', start: 2, duration: 1 });
  assert.equal(timeline.exportTimeline()[0].id, 'clip-a');

  const runner = new AutomatedTestRunner();
  runner.register('pass', async () => 'ok');
  runner.register('fail', async () => { throw new Error('bad'); });
  const testResults = await runner.runAll();
  assert.equal(testResults.length, 2);

  const playback = new RegressionPlaybackHarness();
  playback.register('route', [{ x: 1 }, { x: 2 }]);
  assert.equal(playback.play('route').length, 2);

  const benchmark = new BenchmarkRunner();
  benchmark.register('loop', () => 1000);
  assert.equal(benchmark.runAll()[0].iterations, 1000);

  const ci = new CIValidationFlow([
    { id: 'tests', run: () => ({ passed: true, detail: 'ok' }) },
    { id: 'manifest', run: () => ({ passed: false, detail: 'missing' }) },
  ]);
  assert.equal(ci.run().passed, false);

  const packets = new PacketValidator({ allowedTypes: ['move'] });
  assert.equal(packets.validate({ from: 'a', type: 'move', payload: { x: 1 } }).passed, true);
  assert.equal(packets.validate({ from: '', type: 'hack', payload: { x: 1 } }).passed, false);

  const integrity = new DataIntegrityService();
  const sealed = integrity.seal({ hp: 5 });
  assert.equal(integrity.verify(sealed).passed, true);
  assert.equal(integrity.verify({ ...sealed, payload: '{"hp":4}' }).passed, false);

  const gate = new PermissionGate({ admin: ['edit'], guest: [] });
  assert.equal(gate.can('admin', 'edit'), true);
  assert.equal(gate.can('guest', 'edit'), false);

  const trust = new SessionTrustValidator();
  assert.equal(trust.validate({ issuedAt: 0, maxAgeMs: 10, nonce: 'a', playerId: 'p' }, { now: 5 }).passed, true);
  assert.equal(trust.validate({ issuedAt: 0, maxAgeMs: 10, nonce: '', playerId: 'p' }, { now: 20 }).passed, false);

  const importer = new AssetImportPipeline([
    (asset) => ({ ...asset, imported: true }),
    (asset) => ({ ...asset, normalized: true }),
  ]);
  assert.equal(importer.run({ id: 'asset' }).normalized, true);

  assert.equal(new TexturePreprocessPipeline().run({ width: 16, height: 16 }).atlasReady, true);
  assert.equal(new AudioPreprocessPipeline().run({}).normalized, true);

  const migration = new ContentMigrationSystem();
  migration.register(1, (content) => ({ ...content, version: 2, renamed: true }));
  assert.equal(migration.migrate({ version: 1 }, 2).version, 2);

  const manifest = new BuildAssetManifestSystem().createManifest({
    buildId: 'build-1',
    assets: [{ id: 'hero', path: 'assets/hero.png' }],
  });
  assert.equal(manifest.assetCount, 1);

  const validation = new ContentValidationPipeline([
    (content) => ({ passed: Boolean(content.id), detail: 'id required' }),
  ]);
  assert.equal(validation.run({ id: 'hero' }).passed, true);
}
