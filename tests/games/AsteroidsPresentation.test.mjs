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
} from './asteroidsManifestObjectGeometry.mjs';

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

function objectHasTags(object, tags = []) {
  const objectTags = new Set((object?.tags || []).map((tag) => String(tag).toLowerCase()));
  return tags.every((tag) => objectTags.has(String(tag).toLowerCase()));
}

function roundedAngle(value) {
  return Number(value.toFixed(6));
}

function createObjectVectorRuntime(calls) {
  return {
    getDiagnostics() {
      return {};
    },
    log() {},
    renderObject(renderer, assetSet, options) {
      const object = options.objectId
        ? assetSet.objectsById.get(options.objectId)
        : [...assetSet.objectsById.values()].find((candidate) => objectHasTags(candidate, options.tags || []));
      const shape = object?.shapes?.[0];
      calls.push({
        objectId: object?.id || options.objectId,
        requireManifestBinding: options.requireManifestBinding === true,
        renderKey: options.runtimeRole,
        rotation: options.rotation,
        stroke: shape?.style?.stroke || '',
        stateId: options.stateId,
        tags: options.tags,
      });
      const points = shape?.geometry?.points;
      if (typeof renderer.drawPolygon === 'function' && Array.isArray(points)) {
        renderer.drawPolygon(points, shape.style);
      }
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
  const scene = new AsteroidsGameScene(createAsteroidsTestSceneOptions({
    objectVectorAssets: createObjectVectorAssetSet(),
    objectVectorRuntime: createObjectVectorRuntime([]),
  }));
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

function testAsteroidsAttractAsteroidsUseManifestObjectsAndStyles() {
  const renderCalls = [];
  const payload = loadAsteroidsObjectVectorPayload();
  const styleByObjectId = new Map(payload.objects.map((object) => [
    object.id,
    object.shapes[0]?.style?.stroke || '',
  ]));
  const scene = new AsteroidsGameScene(createAsteroidsTestSceneOptions({
    objectVectorAssets: createObjectVectorAssetSet(),
    objectVectorRuntime: createObjectVectorRuntime(renderCalls),
  }));
  scene.session.mode = 'menu';
  scene.attractController.active = true;
  scene.attractAdapter.enter();

  const renderer = {
    drawRect() {},
    drawPolygon() {},
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
  assert.equal(objectIds.includes('object.asteroids.medium-asteroid'), true);
  assert.equal(objectIds.includes('object.asteroids.small-asteroid'), true);
  assert.equal(objectIds.includes('object.asteroids.large-ufo'), true);
  [
    'object.asteroids.ship',
    'object.asteroids.large-asteroid',
    'object.asteroids.medium-asteroid',
    'object.asteroids.small-asteroid',
    'object.asteroids.large-ufo',
  ].forEach((objectId) => {
    const calls = renderCalls.filter((call) => call.objectId === objectId);
    assert.equal(calls.length > 0, true);
    assert.equal(calls.every((call) => call.requireManifestBinding), true);
    assert.equal(calls.every((call) => call.stroke === styleByObjectId.get(objectId)), true);
  });
  assert.equal(scene.objectVectorRenderCounts.attractAsteroid, undefined);
  assert.equal(scene.objectVectorRenderCounts.attractShip, undefined);
  assert.equal(scene.objectVectorRenderCounts.attractUfo, undefined);
  assert.equal(scene.objectVectorRenderCounts.asteroids > 0, true);
  assert.equal(scene.objectVectorRenderCounts.ship > 0, true);
  assert.equal(scene.objectVectorRenderCounts.ufo > 0, true);
}

function testAsteroidsGameplayObjectsUseSharedManifestBindings() {
  const renderCalls = [];
  const scene = new AsteroidsGameScene(createAsteroidsTestSceneOptions({
    objectVectorAssets: createObjectVectorAssetSet(),
    objectVectorRuntime: createObjectVectorRuntime(renderCalls),
  }));
  scene.session.start(1);
  scene.attractController.active = false;
  scene.world.asteroids = [
    scene.world.createAsteroidFromState({ angle: 0.12, size: 3, x: 120, y: 160 }),
    scene.world.createAsteroidFromState({ angle: -0.28, size: 2, x: 240, y: 260 }),
    scene.world.createAsteroidFromState({ angle: 0.47, size: 1, x: 360, y: 320 }),
  ];
  scene.world.bullets = [];
  scene.world.ufoBullets = [];
  scene.world.ufo = scene.world.createUfoEntity('large', scene.world.wave);
  scene.world.ufo.x = 520;
  scene.world.ufo.y = 180;

  const renderer = {
    drawRect() {},
    strokeRect() {},
    drawPolygon() {},
    drawLine() {},
    drawCircle() {},
    drawText() {},
  };

  scene.render(renderer);
  [
    'object.asteroids.ship',
    'object.asteroids.large-asteroid',
    'object.asteroids.medium-asteroid',
    'object.asteroids.small-asteroid',
    'object.asteroids.large-ufo',
  ].forEach((objectId) => {
    const calls = renderCalls.filter((call) => call.objectId === objectId);
    assert.equal(calls.length > 0, true, `${objectId} should render from the manifest`);
    assert.equal(calls.every((call) => call.requireManifestBinding), true, `${objectId} should require manifest binding`);
  });
  assert.equal(renderCalls.some((call) => call.objectId === 'object.asteroids.ship' && call.stateId === 'idle'), true);

  scene.world.ufo = scene.world.createUfoEntity('small', scene.world.wave);
  scene.world.ufo.x = 580;
  scene.world.ufo.y = 220;
  scene.render(renderer);
  const smallUfoCalls = renderCalls.filter((call) => call.objectId === 'object.asteroids.small-ufo');
  assert.equal(smallUfoCalls.length > 0, true);
  assert.equal(smallUfoCalls.every((call) => call.requireManifestBinding), true);
}

function testAsteroidsGameplayBulletsUseManifestObjectGeometry() {
  const renderCalls = [];
  const payload = loadAsteroidsObjectVectorPayload();
  const bulletObject = payload.objects.find((object) => object.id === 'object.asteroids.bullet');
  const bulletShapesBeforeRender = JSON.stringify(bulletObject.shapes);
  const scene = new AsteroidsGameScene(createAsteroidsTestSceneOptions({
    objectVectorAssets: createObjectVectorAssetSet(),
    objectVectorRuntime: createObjectVectorRuntime(renderCalls),
  }));
  scene.session.mode = 'playing';
  scene.attractController.active = false;
  scene.world.asteroids = [];
  scene.world.bullets = [];
  scene.world.ufoBullets = [];
  scene.world.ship.x = 220;
  scene.world.ship.y = 240;
  scene.world.ship.vx = 0;
  scene.world.ship.vy = 0;
  const fireAngles = [-Math.PI / 2, 0, Math.PI / 3];
  fireAngles.forEach((angle) => {
    scene.world.ship.angle = angle;
    assert.equal(scene.world.fire(), true);
  });
  assert.deepEqual(
    scene.world.bullets.map((bullet) => roundedAngle(bullet.angle)),
    fireAngles.map(roundedAngle),
  );

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
  const bulletCalls = renderCalls.filter((call) => call.objectId === 'object.asteroids.bullet');
  assert.equal(scene.objectVectorRenderCounts.bullet, fireAngles.length);
  assert.equal(bulletCalls.length, fireAngles.length);
  assert.deepEqual(
    bulletCalls.map((call) => roundedAngle(call.rotation)),
    fireAngles.map(roundedAngle),
  );
  assert.equal(bulletCalls.every((call) => call.requireManifestBinding), true);
  assert.equal(bulletCalls.every((call) => call.stroke === bulletObject.shapes[0].style.stroke), true);
  assert.equal(JSON.stringify(bulletObject.shapes), bulletShapesBeforeRender);
  assert.equal(polygonCalls.length >= fireAngles.length, true);
}

function testAsteroidsGameplayRenderDoesNotCoverBackgroundLayer() {
  const scene = new AsteroidsGameScene(createAsteroidsTestSceneOptions({
    objectVectorAssets: createObjectVectorAssetSet(),
    objectVectorRuntime: createObjectVectorRuntime([]),
  }));
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
  testAsteroidsAttractAsteroidsUseManifestObjectsAndStyles();
  testAsteroidsGameplayObjectsUseSharedManifestBindings();
  testAsteroidsGameplayBulletsUseManifestObjectGeometry();
  testAsteroidsGameplayRenderDoesNotCoverBackgroundLayer();
}
