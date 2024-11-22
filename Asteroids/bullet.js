// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// bullet.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';

class Bullet extends ObjectVector {

  // Define a simple vector map for a bullet, typically a small line or dot
  static vectorMap = [[-1, 0], [1, 0.5], [1, -0.5]];
  static speed = 350;
  static lifespan = 1.75; // Time in seconds before the bullet disappears

  constructor(x, y, angle) {
    // Calculate velocity based on angle and speed
    const velocityX = Math.cos(angle) * Bullet.speed;
    const velocityY = Math.sin(angle) * Bullet.speed;

    // Initialize the parent class with the bullet vector map and velocity
    super(x, y, Bullet.vectorMap, velocityX, velocityY);

    this.timeAlive = 0; // Time the bullet has existed
  }

  update(deltaTime) {
    // Update position based on velocity
    super.update(deltaTime);

    // Track how long the bullet has been alive
    this.timeAlive += deltaTime;

    // If the bullet exceeds its lifespan, mark it for removal
    if (this.timeAlive > Bullet.lifespan) {
      this.setIsDead();
    }

    // Remove the bullet if it goes off-screen
    this.wrapAround();
  }
}

export default Bullet;
