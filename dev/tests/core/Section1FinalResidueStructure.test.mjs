/*
Toolbox Aid
David Quesenberry
04/14/2026
Section1FinalResidueStructure.test.mjs
*/
import assert from 'node:assert/strict';
import CanvasRenderer from '../../../www/src/engine/rendering/CanvasRenderer.js';
import ResolutionScaler from '../../../www/src/engine/rendering/ResolutionScaler.js';
import { renderByLayers } from '../../../www/src/engine/rendering/LayeredRenderSystem.js';
import { renderSpriteReadyEntities } from '../../../www/src/engine/rendering/SpriteRenderSystem.js';
import Scene from '../../../www/src/engine/scene/Scene.js';
import SceneManager from '../../../www/src/engine/scene/SceneManager.js';
import SceneTransition from '../../../www/src/engine/scene/SceneTransition.js';
import TransitionScene from '../../../www/src/engine/scene/TransitionScene.js';
import SceneTransitionController from '../../../www/src/engine/scene/SceneTransitionController.js';
import AttractModeController from '../../../www/src/engine/scene/AttractModeController.js';
import { DEFAULT_ATTRACT_CONFIG } from '../../../www/src/engine/scene/AttractModeController.js';
import { isColliding } from '../../../www/src/engine/collision/aabb.js';
import { applyDrag } from '../../../www/src/engine/physics/drag.js';
import { stepArcadeBody } from '../../../www/src/engine/physics/arcadeBody.js';
import { integrateVelocity2D } from '../../../www/src/engine/physics/integration.js';

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
assert.equal(typeof applyDrag, 'function');
assert.equal(typeof stepArcadeBody, 'function');
assert.equal(typeof integrateVelocity2D, 'function');

{
  const body = {
    x: 10,
    y: 20,
    velocityX: 100,
    velocityY: 50,
    accelerationX: 0,
    accelerationY: 0,
    dragX: 50,
    dragY: 25,
    maxSpeedX: 200,
    maxSpeedY: 200,
  };

  stepArcadeBody(body, 1);
  assert.equal(body.velocityX, 50);
  assert.equal(body.velocityY, 25);
  integrateVelocity2D(body, 0.5);
  assert.equal(body.x, 35);
  assert.equal(body.y, 32.5);
  assert.equal(applyDrag(10, 100, 1), 0);
}

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
