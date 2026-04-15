/*
Toolbox Aid
David Quesenberry
04/14/2026
ReplayTimeline.test.mjs
*/
import assert from 'node:assert/strict';
import { ReplayTimeline } from '../../src/engine/replay/index.js';

export function run() {
  const timeline = new ReplayTimeline({ maxFrames: 3 });
  timeline.pushSnapshot(0, { x: 10 });
  timeline.pushSnapshot(1, { x: 20 });
  timeline.pushSnapshot(2, { x: 30 });
  timeline.pushSnapshot(3, { x: 40 });

  const snapshots = timeline.toArray();
  assert.equal(snapshots.length, 3);
  assert.equal(snapshots[0].frameId, 1);
  assert.equal(snapshots[2].snapshot.x, 40);

  assert.equal(timeline.getSnapshot(0), null);
  assert.equal(timeline.getSnapshot(2).snapshot.x, 30);
  assert.equal(timeline.getNearestSnapshot(999).frameId, 3);
  assert.equal(timeline.getNearestSnapshot(2).frameId, 2);

  timeline.replaceFromFrame(2, [{ x: 200 }, { x: 300 }]);
  const replaced = timeline.toArray();
  assert.deepEqual(
    replaced.map((entry) => ({ frameId: entry.frameId, x: entry.snapshot.x })),
    [
      { frameId: 1, x: 20 },
      { frameId: 2, x: 200 },
      { frameId: 3, x: 300 },
    ]
  );

  timeline.clear();
  assert.equal(timeline.toArray().length, 0);
}
