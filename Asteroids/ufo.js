// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// ufo.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';
import Functions from '../scripts/functions.js';

class UFO extends ObjectVector {
  static vectorMap = [
    [-14, 3], [14, 3], [9, 9], [-9, 9], [-14, 3], [-9, -3],
    [-5, -3], [-5, -6], [-2, -9], [2, -9], [5, -6], [5, -3], [-5, -3],
    [9, -3], [14, 3]
  ];

  static speed = 100;
  static offset = 50;

  constructor() {
    let x = canvasConfig.width + UFO.offset;
    let y = Functions.randomRange((UFO.offset * 2), canvasConfig.height - (UFO.offset * 2), true);

    let angle = 180;// left
    const dir = Functions.randomBoolean();
    if (dir) {// 0 is left , 1 is right.
      angle = 0;//right
      x = -UFO.offset;
    }

    const velocity = Functions.getVectorDirection(angle);

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
    const boundariesHit = this.checkGameBounds(this.height );

    if (!this.isDead()) {
      if (boundariesHit.includes('left') || boundariesHit.includes('right')) {
        console.log(boundariesHit);
        this.setIsDead();
        console.log("ufo dead");
      }
    }
  }

  changeDirections() {
    this.directionCnt = 0;
    this.getDelay();
    console.log("directionDelay", this.directionDelay);

    if (this.velocityX) {
      this.velocityY = this.velocityX;
    } else {
      this.velocityY = this.velocityX;
    }
  }

  getDelay() {
    this.directionDelay = Functions.randomRange(100, 200);
    return this.directionDelay;
  }

}

export default UFO;
