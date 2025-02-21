// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// bullet.js

import ObjectVector from '../scripts/objectVector.js';
import AngleUtils from '../scripts/math/angleUtils.js';

class Bullet extends ObjectVector {

  // Define a simple vector map for a bullet, typically a small line or dot
  static vectorMap = [[-2, 0], [2, 0.5], [2, -0.5]];
  static speed = 350;
  static lifespan = 1.75; // Time in seconds before the bullet disappears

  constructor(x, y, angle) {
    // Create the bullet at the calculated position based on the nose of the ship
    const angleInRadians = angle * (Math.PI / 180);

    // Calculate the nose offset in world space (taking into account ship's rotation)
    const noseX = Math.cos(angleInRadians) * 12;  // Rotate the x-component of the nose vector
    const noseY = Math.sin(angleInRadians) * 12;  // Rotate   he y-component of the nose vector

    // Bullet position is the ship's position plus the rotated nose offset
    const bulletX = x + noseX;
    const bulletY = y + noseY;

    // Calculate velocity based on angle and speed
    const velocityX = Math.cos(angleInRadians) * Bullet.speed; 
    const velocityY = Math.sin(angleInRadians) * Bullet.speed;

    // Initialize the parent class with the bullet vector map and velocity
    super(bulletX, bulletY, Bullet.vectorMap, velocityX, velocityY);
    this.rotationAngle = angle;//AngleUtils.toDegrees(angle);
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

    this.checkWrapAround();
  }

}

export default Bullet;
