/*
Toolbox Aid
David Quesenberry
03/22/2026
ProductionReadiness.test.mjs
*/
import assert from 'node:assert/strict';
import ActionInputMap from '../../src/engine/input/ActionInputMap.js';
import ActionInputService from '../../src/engine/input/ActionInputService.js';
import ResolutionScaler from '../../src/engine/render/ResolutionScaler.js';
import AssetOptimizer from '../../src/engine/assets/AssetOptimizer.js';
import { ObjectPool } from '../../src/engine/memory/index.js';

export async function run() {
  const map = new ActionInputMap({ jump: ['Space'] });
  map.remapAction('jump', ['KeyJ']);
  assert.deepEqual(map.getKeys('jump'), ['KeyJ']);

  const input = new ActionInputService({ actionMap: new ActionInputMap({ fire: ['Pad0:Button0'] }) });
  input.gamepads.setSnapshot([{ index: 0, buttons: [{ pressed: false }], axes: [] }]);
  input.gamepads.setSnapshot([{ index: 0, buttons: [{ pressed: true }], axes: [] }]);
  input.update();
  assert.equal(input.isActionPressed('fire'), true);

  const scaler = new ResolutionScaler({ baseWidth: 320, baseHeight: 180, scale: 2 });
  assert.deepEqual(scaler.getScaledSize(), { width: 640, height: 360 });

  const optimizer = new AssetOptimizer();
  const first = await optimizer.getOrCreate('hero', { type: 'image', path: 'hero.png' }, () => ({ id: 1 }));
  const second = await optimizer.getOrCreate('hero', { type: 'image', path: 'hero.png' }, () => ({ id: 2 }));
  assert.equal(first, second);

  const pool = new ObjectPool(() => ({ active: true }), (item) => { item.active = false; });
  const item = pool.acquire();
  pool.release(item);
  assert.equal(pool.stats().pooled, 1);
  assert.equal(item.active, false);
}
