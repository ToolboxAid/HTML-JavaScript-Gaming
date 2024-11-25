// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// ufo.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';
import Functions from '../scripts/functions.js';
class UFO extends ObjectVector {

  // Define a simple vector map for a ufo, typically a small line or dot
  static vectorMap = [[-30, 5], [30, 5], [20, 15], [-20, 15], [-30, 5], [-20, -5],
  [-10, -5], [-10, -10], [-5, -15], [5, -15], [10, -10], [10, -5], [-10, -5],
  [20, -5], [30, 5]];

  static speed = 10;

  constructor(x, y, angle = 0) {
    // Calculate velocity based on angle and speed
    const velocityX = Math.cos(angle) * UFO.speed;
    const velocityY = Math.sin(angle) * UFO.speed;

    // Initialize the parent class with the ufo vector map and velocity
    super(x, y, UFO.vectorMap, velocityX + 100, velocityY);

    this.direction = 0;
    this.directionCnt = 0;
    this.directionDelay = 0;
  }

  update(deltaTime) {
    // Update path 
    if (this.directionCnt++ > this.directionDelay) {
      this.directionDelay = Functions.randomGenerator(100, 300);
      // console.log(Functions.randomGenerator(0, 3) );
      console.log(this.directionDelay);
    }

    // Update super position based on velocity
    super.update(deltaTime);

    // If the ufo exceeds bounds, mark it for removal
    if (this.isOutOfBounds()) {
      this.setIsDead();
      console.log("ufo dead");
    }

    // Remove the ufo if it goes off-screen
    this.wrapAround();
  }
}

export default UFO;
