/*
Toolbox Aid
David Quesenberry
03/22/2026
EventBus.test.mjs
*/
import assert from 'node:assert/strict';
import EventBus from '/src/engine/events/EventBus.js';

export function run() {
  const bus = new EventBus();
  const seen = [];

  const unsubscribe = bus.on('ping', (payload) => {
    seen.push(`A:${payload.value}`);
  });

  bus.once('ping', (payload) => {
    seen.push(`B:${payload.value}`);
  });

  assert.equal(bus.emit('ping', { value: 1 }), 2);
  assert.equal(bus.emit('ping', { value: 2 }), 1);
  unsubscribe();
  assert.equal(bus.emit('ping', { value: 3 }), 0);
  assert.deepEqual(seen, ['A:1', 'B:1', 'A:2']);
}
