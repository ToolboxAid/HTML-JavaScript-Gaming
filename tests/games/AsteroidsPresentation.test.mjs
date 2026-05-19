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
import {
  createAsteroidsTestSceneOptions,
  loadAsteroidsObjectVectorPayload
} from './asteroidsManifestObjectVectors.mjs';

const ASTEROIDS_TEST_SCENE_OPTIONS = createAsteroidsTestSceneOptions();

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

function createObjectVectorAssetSet() {
  const payload = loadAsteroidsObjectVectorPayload();
  return {
    objectsById: new Map(payload.objects.map((object) => [object.id, object])),
    payload,
  };
}

function createAttractObjectVectorRuntime(calls) {
  return {
    getDiagnostics() {
      return {};
    },
    log() {},
    renderObject(renderer, assetSet, options) {
      calls.push({
        objectId: options.objectId,
        renderKey: options.runtimeRole,
        stateId: options.stateId,
        tags: options.tags,
      });
      return { ok: true, renderedShapes: 1 };
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
  const scene = new AsteroidsGameScene(ASTEROIDS_TEST_SCENE_OPTIONS);
  const engine = {
    input: createInput(),
    canvas: { style: {} },
  };
  const idleTimeoutSeconds = scene.attractController.idleTimeoutMs / 1000;

  scene.update(Math.max(0, idleTimeoutSeconds - 0.001), engine);
  assert.equal(scene.attractController.active, false);
  scene.update(0.001, engine);
  assert.equal(scene.attractController.active, true);

  engine.input = createInput({ down: ['ArrowLeft'] });
  scene.update(0.016, engine);
  assert.equal(scene.attractController.active, false);
}

function testAsteroidsGameOverQualifyingScoreInitialsFlow() {
  const scene = new AsteroidsGameScene(ASTEROIDS_TEST_SCENE_OPTIONS);
  const storage = createStorage();
  scene.highScoreService = new AsteroidsHighScoreService({ storage, tableSize: 5 });
  scene.highScoreRows = [
    { initials: 'ACE', score: 1800 },
    { initials: 'VTR', score: 1400 },
    { initials: 'ION', score: 1000 },
    { initials: 'CPU', score: 700 },
    { initials: 'BOT', score: 500 },
  ];
  scene.session.players = [
    { id: 1, score: 1900, lives: 0, nextExtraLifeScore: 10000, worldState: null },
  ];
  scene.session.activePlayerIndex = 0;
  scene.session.mode = 'game-over';
  scene.initialsEntry.cancel();

  const engine = {
    input: createInput(),
    canvas: { style: {} },
  };

  scene.update(0.016, engine);
  assert.equal(scene.initialsEntry.active, true);
  assert.equal(scene.initialsEntry.score, 1900);
  assert.equal(scene.isGameOverScreenVisible(), false);

  engine.input = createInput({ pressed: ['Enter'] });
  scene.update(0.016, engine);

  assert.equal(scene.initialsEntry.active, false);
  assert.equal(scene.session.mode, 'menu');
  assert.equal(scene.highScoreRows.length, 5);
  assert.equal(scene.highScoreRows[0].initials, 'AAA');
  assert.equal(scene.highScoreRows[0].score, 1900);
  for (let index = 1; index < scene.highScoreRows.length; index += 1) {
    assert.equal(scene.highScoreRows[index - 1].score >= scene.highScoreRows[index].score, true);
  }
}

function testAsteroidsMenuHighScoreUsesLeaderboardTop() {
  const scene = new AsteroidsGameScene(ASTEROIDS_TEST_SCENE_OPTIONS);
  scene.highScoreRows = [
    { initials: 'ACE', score: 1800 },
    { initials: 'VTR', score: 1400 },
    { initials: 'ION', score: 1000 },
    { initials: 'CPU', score: 700 },
    { initials: 'BOT', score: 500 },
  ];
  scene.session.highScore = 2500;
  scene.session.mode = 'menu';
  scene.attractController.active = false;

  const textCalls = [];
  const renderer = {
    drawRect() {},
    strokeRect() {},
    drawPolygon() {},
    drawLine() {},
    drawCircle() {},
    drawText(text, ...rest) {
      textCalls.push([text, ...rest]);
    },
  };

  scene.render(renderer);
  assert.equal(textCalls.some(([text]) => text === 'HIGH SCORE 1800'), true);
  assert.equal(textCalls.some(([text]) => text === 'HIGH SCORE 2500'), false);
}

function testAsteroidsAttractObjectsLoadFromManifestRoles() {
  const renderCalls = [];
  const scene = new AsteroidsGameScene(createAsteroidsTestSceneOptions({
    objectVectorAssets: createObjectVectorAssetSet(),
    objectVectorRuntime: createAttractObjectVectorRuntime(renderCalls),
  }));
  scene.session.mode = 'menu';
  scene.attractController.active = true;
  scene.attractAdapter.enter();

  const renderer = {
    drawRect() {},
    drawText() {},
  };

  scene.attractAdapter.setPhase('title');
  scene.render(renderer);
  scene.attractAdapter.setPhase('demo');
  scene.attractAdapter.startDemo();
  scene.render(renderer);

  const objectIds = renderCalls.map((call) => call.objectId);
  assert.equal(objectIds.includes('object.asteroids.ship'), true);
  assert.equal(objectIds.includes('object.asteroids.large-asteroid'), true);
  assert.equal(objectIds.includes('object.asteroids.large-ufo'), true);
}

function testAsteroidsGameplayBulletsUseManifestVectorMap() {
  const scene = new AsteroidsGameScene(ASTEROIDS_TEST_SCENE_OPTIONS);
  scene.session.mode = 'playing';
  scene.attractController.active = false;
  scene.world.asteroids = [];
  scene.world.bullets = [scene.world.createBulletFromState({
    x: 100,
    y: 110,
    vx: 0,
    vy: 0,
    life: 1,
  })];
  scene.world.ufoBullets = [scene.world.createBulletFromState({
    x: 120,
    y: 130,
    vx: 0,
    vy: 0,
    life: 1,
  })];

  const polygonCalls = [];
  const renderer = {
    drawRect() {},
    strokeRect() {},
    drawPolygon(points) {
      polygonCalls.push(points);
    },
    drawLine() {},
    drawCircle() {},
    drawText() {},
  };

  scene.render(renderer);
  assert.equal(scene.vectorMapRenderCounts['vector.asteroids.bullet'], 2);
  assert.equal(polygonCalls.length >= 2, true);
}

function testAsteroidsGameplayRenderDoesNotCoverBackgroundLayer() {
  const scene = new AsteroidsGameScene(ASTEROIDS_TEST_SCENE_OPTIONS);
  scene.session.mode = 'playing';
  scene.attractController.active = false;

  const drawRectCalls = [];
  const renderer = {
    drawRect(...args) {
      drawRectCalls.push(args);
    },
    strokeRect() {},
    drawPolygon() {},
    drawLine() {},
    drawCircle() {},
    drawText() {},
  };

  scene.render(renderer);
  const gameplayOpaqueCover = drawRectCalls.some(([x, y, width, height, color]) => (
    x === 0
    && y === 0
    && width === scene.world.bounds.width
    && height === scene.world.bounds.height
    && color === '#020617'
  ));
  assert.equal(gameplayOpaqueCover, false);

  scene.session.mode = 'menu';
  drawRectCalls.length = 0;
  scene.render(renderer);
  const menuCover = drawRectCalls.some(([x, y, width, height, color]) => (
    x === 0
    && y === 0
    && width === scene.world.bounds.width
    && height === scene.world.bounds.height
    && color === '#020617'
  ));
  assert.equal(menuCover, false);
}

export function run() {
  testAsteroidsHighScoreService();
  testAsteroidsInitialsEntry();
  testAsteroidsAttractMenuFlow();
  testAsteroidsGameOverQualifyingScoreInitialsFlow();
  testAsteroidsMenuHighScoreUsesLeaderboardTop();
  testAsteroidsAttractObjectsLoadFromManifestRoles();
  testAsteroidsGameplayBulletsUseManifestVectorMap();
  testAsteroidsGameplayRenderDoesNotCoverBackgroundLayer();
}
