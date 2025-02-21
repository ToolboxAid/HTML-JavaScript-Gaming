// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// ufo.js

import ObjectVector from '../scripts/objectVector.js';

import AngleUtils from '../scripts/math/angleUtils.js';
import CanvasUtils from '../scripts/canvas.js';
import CollisionUtils from '../scripts/physics/collisionUtils.js';
import RandomUtils from '../scripts/math/randomUtils.js';

class UFO extends ObjectVector {

  // Play your game normally: game.html
  // Enable debug mode: game.html?ufo
  static DEBUG = new URLSearchParams(window.location.search).has('ufo');

  static getVectorMapSmall() {
    return [
      [-14, 3], [14, 3], [9, 9], [-9, 9], [-14, 3], [-9, -3],
      [-5, -3], [-5, -6], [-2, -9], [2, -9], [5, -6], [5, -3], [-5, -3],
      [9, -3], [14, 3]
    ];
  }
  static getVectorMapLarge() {
    return [
      [-21, 4.5], [21, 4.5], [13.5, 13.5], [-13.5, 13.5], [-21, 4.5], [-13.5, -4.5],
      [-7.5, -4.5], [-7.5, -9], [-3, -13.5], [3, -13.5], [7.5, -9], [7.5, -4.5], [-7.5, -4.5],
      [13.5, -4.5], [21, 4.5]
    ];
  }
  static speed = 80;
  static offset = 20;

  constructor() {
    let x = CanvasUtils.getConfigWidth();
    let y = RandomUtils.randomRange(UFO.offset, CanvasUtils.getConfigHeight() - UFO.offset, true);

    let angle = 180; // left
    const dir = RandomUtils.randomBoolean();
    if (dir) { // 0 is left , 1 is right.
      angle = 0; //right
      x = -UFO.offset;
    }

    const velocity = AngleUtils.angleToVector(angle);

    let velocityX = velocity.x * UFO.speed;
    let velocityY = velocity.y * UFO.speed;

    // Initialize the parent class with the ufo vector map and velocity

    const isSmall = RandomUtils.randomBoolean()
    if (isSmall) {
      super(x, y, UFO.getVectorMapSmall(), velocityX, velocityY);
    } else {
      super(x, y, UFO.getVectorMapLarge(), velocityX, velocityY);
    }
    this.isSmall = isSmall;
    if (this.isSmall) {
      this.setVelocity(velocity.x * UFO.speed * 1.3, velocity.y * UFO.speed * 1.3);
    }

    this.directionCnt = 0;
    this.directionDelay = this.getDelay();

    if (this.DEBUG) {
      console.log(`UFO - string: ${JSON.stringify(this)} dir: ${dir} conf width ${CanvasUtils.getConfigWidth()}, conf height ${CanvasUtils.getConfigHeight()}`);
    }
  }

  update(deltaTime) {
    if (this.isAlive()) {
      if (this.directionCnt++ > this.directionDelay) {
        this.changeDirections();
      }

      // Update super position based on velocity
      super.update(deltaTime);

      // get bounds sides hit
      const boundariesHit = CollisionUtils.getCompletelyOffScreenBoundaries(this, this.margin);
      // *** top/bottom ***
      if (boundariesHit.includes('top')) {
        this.y = CanvasUtils.getConfigHeight();
        if (this.DEBUG) {
          console.log("top:", this.y);
        }

      }
      if (boundariesHit.includes('bottom')) {
        this.y = this.height * -1;
        if (this.DEBUG) {
          console.log("bottom:", this.y);
        }
      }

      // If the ufo exceeds left/right bounds, mark it for removal
      if (boundariesHit.includes('left') || boundariesHit.includes('right')) {
        this.setIsDead();
        if (this.DEBUG) {
          console.log("l/r:", this.x);
        }
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

  destroy() {
    if (UFO.DEBUG) {
      console.log(`UFO destroy start:, ${JSON.stringify(this)}`);
    }

    super.destroy();

    this.directionCnt = null;
    this.directionDelay = null;
    this.isSmall = null;

    if (UFO.DEBUG) {
      console.log(`UFO destroy end:, ${JSON.stringify(this)}`);
    }
  }

}

export default UFO;
