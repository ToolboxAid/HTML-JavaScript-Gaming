/*
Toolbox Aid
David Quesenberry
03/25/2026
AsteroidsPresentation.test.mjs
*/
import assert from 'node:assert/strict';
import AsteroidsGameScene from '../../games/Asteroids/game/AsteroidsGameScene.js';
import AsteroidsHighScoreService from '../../games/Asteroids/systems/AsteroidsHighScoreService.js';
import AsteroidsInitialsEntry from '../../games/Asteroids/systems/AsteroidsInitialsEntry.js';

function createInput({ down = [], pressed = [] } = {}) {
  const downSet = new Set(down);
  const pressedSet = new Set(pressed);
  return {
    isDown(code) {
      return downSet.has(code);
    },
    isPressed(code) {
      return pressedSet.has(code);
    },
  };
}

function createStorage() {
  const map = new Map();
  return {
    loadJson(key, fallback) {
      const raw = map.get(key);
      return raw ? JSON.parse(raw) : fallback;
    },
    saveJson(key, value) {
      map.set(key, JSON.stringify(value));
      return true;
    },
  };
}

function testAsteroidsHighScoreService() {
  const storage = createStorage();
  const service = new AsteroidsHighScoreService({ storage });
  const rows = service.loadTable();
  assert.equal(rows.length, 5);
  assert.equal(rows[0].initials, 'ACE');

  const q = service.getQualifyingIndex(2500, rows);
  assert.equal(q, 0);

  const updated = service.insertScore({ initials: 'QAZ', score: 2500 }, rows);
  assert.equal(updated[0].initials, 'QAZ');
  assert.equal(updated[0].score, 2500);

  const reloaded = service.loadTable();
  assert.equal(reloaded[0].initials, 'QAZ');
}

function testAsteroidsInitialsEntry() {
  const entry = new AsteroidsInitialsEntry();
  entry.begin({ playerId: 1, score: 1234 });
  entry.update(createInput({ pressed: ['KeyD'] }));
  entry.update(createInput({ pressed: ['KeyQ'] }));
  entry.update(createInput({ pressed: ['KeyZ'] }));
  assert.equal(entry.getInitials(), 'DQZ');

  const result = entry.update(createInput({ pressed: ['Enter'] }));
  assert.equal(result.confirmed, true);
  assert.equal(result.initials, 'DQZ');
}

function testAsteroidsAttractMenuFlow() {
  const scene = new AsteroidsGameScene();
  const engine = {
    input: createInput(),
    canvas: { style: {} },
  };

  scene.update(6.1, engine);
  assert.equal(scene.attractController.active, false);
  scene.update(6.1, engine);
  assert.equal(scene.attractController.active, true);

  engine.input = createInput({ down: ['ArrowLeft'] });
  scene.update(0.016, engine);
  assert.equal(scene.attractController.active, false);
}

export function run() {
  testAsteroidsHighScoreService();
  testAsteroidsInitialsEntry();
  testAsteroidsAttractMenuFlow();
}
