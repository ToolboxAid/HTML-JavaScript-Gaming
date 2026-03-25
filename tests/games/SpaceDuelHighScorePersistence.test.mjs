/*
Toolbox Aid
David Quesenberry
03/25/2026
SpaceDuelHighScorePersistence.test.mjs
*/
import assert from 'node:assert/strict';
import SpaceDuelHighScoreService from '../../games/SpaceDuel/game/SpaceDuelHighScoreService.js';
import SpaceDuelInitialsEntry from '../../games/SpaceDuel/game/SpaceDuelInitialsEntry.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    setItem(key, value) {
      map.set(key, String(value));
    },
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
  };
}

function createInput(pressedCodes = []) {
  const set = new Set(pressedCodes);
  return {
    isPressed(code) {
      return set.has(code);
    },
  };
}

function testDefaultTableLoads() {
  const service = new SpaceDuelHighScoreService({ storage: { loadJson: () => null, saveJson: () => true } });
  const rows = service.loadTable();
  assert.equal(rows.length, 5);
  assert.equal(rows[0].initials, 'ACE');
  assert.equal(rows[0].score, 1800);
}

function testQualifyingInsertPersists() {
  const memory = createMemoryStorage();
  const service = new SpaceDuelHighScoreService({
    storage: {
      loadJson: (key, fallback) => {
        const raw = memory.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      },
      saveJson: (key, value) => {
        memory.setItem(key, JSON.stringify(value));
        return true;
      },
    },
  });

  const rows = service.loadTable();
  const index = service.getQualifyingIndex(2000, rows);
  assert.equal(index, 0);
  const next = service.insertScore({ initials: 'QAZ', score: 2000 }, rows);
  assert.equal(next[0].initials, 'QAZ');
  assert.equal(next[0].score, 2000);

  const reloaded = service.loadTable();
  assert.equal(reloaded[0].initials, 'QAZ');
  assert.equal(reloaded[0].score, 2000);
}

function testInitialsEntryFlow() {
  const entry = new SpaceDuelInitialsEntry();
  entry.begin({ playerId: 1, score: 1234 });

  entry.update(createInput(['KeyD']));
  entry.update(createInput(['KeyQ']));
  entry.update(createInput(['KeyZ']));

  assert.equal(entry.getInitials(), 'DQZ');

  const confirmed = entry.update(createInput(['Enter']));
  assert.equal(confirmed.confirmed, true);
  assert.equal(confirmed.initials, 'DQZ');
  assert.equal(confirmed.score, 1234);
}

export function run() {
  testDefaultTableLoads();
  testQualifyingInsertPersists();
  testInitialsEntryFlow();
}
