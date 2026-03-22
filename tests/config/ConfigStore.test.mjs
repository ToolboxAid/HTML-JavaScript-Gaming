/*
Toolbox Aid
David Quesenberry
03/22/2026
ConfigStore.test.mjs
*/
import assert from 'node:assert/strict';
import ConfigStore from '../../engine/config/ConfigStore.js';

export function run() {
  const store = new ConfigStore();
  store.loadJson('{"player":{"speed":240},"ui":{"title":"Demo"}}', { requiredKeys: ['player', 'ui'] });

  assert.equal(store.get('player.speed'), 240);
  assert.equal(store.get('ui.title'), 'Demo');
  assert.equal(store.get('missing.value', 'fallback'), 'fallback');
  assert.throws(() => store.loadJson('{"player":{}}', { requiredKeys: ['ui'] }));
}
