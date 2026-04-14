/*
Toolbox Aid
David Quesenberry
04/14/2026
Section1FinalResidueStructure.test.mjs
*/
import assert from 'node:assert/strict';
import {
  CanvasRenderer,
  ResolutionScaler,
  renderByLayers,
  renderSpriteReadyEntities,
} from '../../src/engine/rendering/index.js';
import {
  Scene,
  SceneManager,
  SceneTransition,
  TransitionScene,
  SceneTransitionController,
  AttractModeController,
  DEFAULT_ATTRACT_CONFIG,
} from '../../src/engine/scene/index.js';
import { isColliding } from '../../src/engine/physics/index.js';

assert.equal(typeof CanvasRenderer, 'function');
assert.equal(typeof ResolutionScaler, 'function');
assert.equal(typeof renderByLayers, 'function');
assert.equal(typeof renderSpriteReadyEntities, 'function');

assert.equal(typeof Scene, 'function');
assert.equal(typeof SceneManager, 'function');
assert.equal(typeof SceneTransition, 'function');
assert.equal(typeof TransitionScene, 'function');
assert.equal(typeof SceneTransitionController, 'function');
assert.equal(typeof AttractModeController, 'function');
assert.equal(typeof DEFAULT_ATTRACT_CONFIG, 'object');

assert.equal(
  isColliding(
    { x: 0, y: 0, width: 10, height: 10 },
    { x: 5, y: 5, width: 10, height: 10 }
  ),
  true
);
assert.equal(
  isColliding(
    { x: 0, y: 0, width: 2, height: 2 },
    { x: 10, y: 10, width: 2, height: 2 }
  ),
  false
);

console.log('Section1FinalResidueStructure.test.mjs passed');

