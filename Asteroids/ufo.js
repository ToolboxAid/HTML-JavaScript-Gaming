// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// ufo.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';
import Functions from '../scripts/functions.js';
class UFO extends ObjectVector {
  // // // // Define a simple vector map for a ufo, typically a small line or dot
  // // // //static vectorMap = [[-30, 5], [30, 5], [20, 15], [-20, 15], [-30, 5], [-20, -5],
  // // // //[-10, -5], [-10, -10], [-5, -15], [5, -15], [10, -10], [10, -5], [-10, -5],
  // // // //[20, -5], [30, 5]];
  // // // static vectorMap = [[-22.5, 5], [22.5, 5], [15, 15], [-15, 15], [-22.5, 5], [-15, -5],
  // // // [-7.5, -5], [-7.5, -10], [-3.75, -15], [3.75, -15], [7.5, -10], [7.5, -5], [-7.5, -5],
  // // // [15, -5], [22.5, 5]];
  // // static vectorMap = [
  // //   [-11.25, 2.5], [11.25, 2.5], [7.5, 7.5], [-7.5, 7.5], [-11.25, 2.5], [-7.5, -2.5],
  // //   [-3.75, -2.5], [-3.75, -5], [-1.875, -7.5], [1.875, -7.5], [3.75, -5], [3.75, -2.5], [-3.75, -2.5],
  // //   [7.5, -2.5], [11.25, 2.5]  ];
  // static vectorMap = [
  //   [-14.0625, 3.125], [14.0625, 3.125], [9.375, 9.375], [-9.375, 9.375], [-14.0625, 3.125], [-9.375, -3.125],
  //   [-4.6875, -3.125], [-4.6875, -6.25], [-2.34375, -9.375], [2.34375, -9.375], [4.6875, -6.25], [4.6875, -3.125], [-4.6875, -3.125],
  //   [9.375, -3.125], [14.0625, 3.125]
  // ];
  static vectorMap = [
    [-14, 3], [14, 3], [9, 9], [-9, 9], [-14, 3], [-9, -3],
    [-5, -3], [-5, -6], [-2, -9], [2, -9], [5, -6], [5, -3], [-5, -3],
    [9, -3], [14, 3]
  ];


  static speed = 100;

  constructor() {
    let x = 500;
    let y = 500;

    let angle = 0;
    if (Functions.randomBoolean()) {
      angle = 180;
      x = canvasConfig.width/2;
    }

    let velocityX = Math.cos(angle) * UFO.speed;
    let velocityY = Math.sin(angle) * UFO.speed;

    // const position = Functions.calculateOrbitalPosition(
    //   canvasConfig.width / 2, canvasConfig.height / 2, angle, distance);


    // Initialize the parent class with the ufo vector map and velocity
    super(x, y, UFO.vectorMap, velocityX, velocityY);

    this.direction = 0;
    this.directionCnt = 0;
    this.directionDelay = 0;
  }

  update(deltaTime) {
    // Update path 
    if (this.directionCnt++ > this.directionDelay) {
      this.directionDelay = Functions.randomGenerator(300, 400);
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
