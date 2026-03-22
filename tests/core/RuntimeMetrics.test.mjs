/*
Toolbox Aid
David Quesenberry
03/22/2026
RuntimeMetrics.test.mjs
*/
import assert from 'node:assert/strict';
import RuntimeMetrics from '../../engine/core/RuntimeMetrics.js';

export function run() {
  const metrics = new RuntimeMetrics({ sampleWindowSeconds: 0.25 });
  metrics.recordFrame({ dtSeconds: 0.1, frameMs: 16, updateMs: 4, renderMs: 3, fixedUpdates: 1 });
  metrics.recordFrame({ dtSeconds: 0.1, frameMs: 18, updateMs: 5, renderMs: 4, fixedUpdates: 1 });
  metrics.recordFrame({ dtSeconds: 0.1, frameMs: 20, updateMs: 6, renderMs: 5, fixedUpdates: 1 });

  const snapshot = metrics.getSnapshot();
  assert.equal(Math.round(snapshot.fps), 10);
  assert.equal(snapshot.fixedUpdates, 3);
  assert.equal(snapshot.frameMs > 17, true);
}
