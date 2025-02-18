// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// ufo.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';

import AngleUtils from '../scripts/math/angleUtils.js';
import CanvasUtils from '../scripts/canvas.js';
import CollisionUtils from '../scripts/physics/collisionUtils.js';
import RandomUtils from '../scripts/math/randomUtils.js';

class UFO extends ObjectVector {

  // Play your game normally: game.html
  // Enable debug mode: game.html?ufo
  static DEBUG = new URLSearchParams(window.location.search).has('ufo');

  static vectorMap = [
    [-14, 3], [14, 3], [9, 9], [-9, 9], [-14, 3], [-9, -3],
    [-5, -3], [-5, -6], [-2, -9], [2, -9], [5, -6], [5, -3], [-5, -3],
    [9, -3], [14, 3]
  ];

  static speed = 100;
  static offset = 50;

  constructor() {
    let x = canvasConfig.width + UFO.offset;
    let y = RandomUtils.randomRange((UFO.offset * 2), canvasConfig.height - (UFO.offset * 2), true);

    let angle = 180;// left
    const dir = RandomUtils.randomBoolean();
    if (dir) {// 0 is left , 1 is right.
      angle = 0;//right
      x = -UFO.offset;
    }

    const velocity = AngleUtils.angleToVector(angle);

    let velocityX = velocity.x * UFO.speed;
    let velocityY = velocity.y * UFO.speed;

    // Initialize the parent class with the ufo vector map and velocity
    super(x, y, UFO.vectorMap, velocityX, velocityY);

    this.direction = 0;
    this.directionCnt = 0;
    this.directionDelay = this.getDelay();
  }

  update(deltaTime) {
    if (this.directionCnt++ > this.directionDelay) {
      this.changeDirections();
    }

    // Update super position based on velocity
    super.update(deltaTime);

    // If the ufo exceeds bounds, mark it for removal

    // *** left/right***
    if (!this.isDead()) {
      const boundariesHit = CollisionUtils.checkGameBoundsSides(this, UFO.offset);

      if (boundariesHit.includes('left') || boundariesHit.includes('right')) {
        this.setIsDead();
      }

      // *** top/bottom ***
      if (boundariesHit.includes('top')) {
        this.y = CanvasUtils.getConfigHeight() + (UFO.offset / 2);
      }
      if (boundariesHit.includes('bottom')) {
        this.y = -(UFO.offset / 2);
      }
    }
  }

  changeDirections() {
    this.directionCnt = 0;
    this.getDelay();

    if (this.velocityX) {
      this.velocityY = this.velocityX;
    } else {
      this.velocityY = this.velocityX;
    }
  }

  getDelay() {
    this.directionDelay = RandomUtils.randomRange(100, 200);
    if (UFO.DEBUG) {
      console.log("directionDelay:", this.directionDelay);
    }
    return this.directionDelay;
  }

}

export default UFO;
