// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// bullet.js

import ObjectVector from '../scripts/objectVector.js';

class Bullet extends ObjectVector {

  // Play your game normally: game.html
  // Enable debug mode: game.html?bullet
  static DEBUG = new URLSearchParams(window.location.search).has('bullet');

  // Define a simple vector map for a bullet, typically a small line or dot
  static getVectorMap() { return [[-4, 0], [4, 1], [4, -1]] };
  static speed = 350;
  static lifespan = 1.75; // Time in seconds before the bullet disappears

  constructor(x, y, angleInDegrees) {
    // Create the bullet at the calculated position based on the nose of the ship
    const angleInRadians = angleInDegrees * (Math.PI / 180);

    // Calculate the nose offset in world space (taking into account ship's rotation)
    const noseDistance = 15; // Distance from ship center to nose
    const noseX = Math.cos(angleInRadians) * noseDistance;  // Rotate the x-component of the nose vector
    const noseY = Math.sin(angleInRadians) * noseDistance;  // Rotate the y-component of the nose vector

    // Bullet position is the ship's position plus the rotated nose offset
    const bulletX = x + noseX;
    const bulletY = y + noseY;

    // Calculate velocity based on angle and speed
    const velocityX = Math.cos(angleInRadians) * Bullet.speed;
    const velocityY = Math.sin(angleInRadians) * Bullet.speed;

    // Initialize the parent class with the bullet vector map and velocity
    super(bulletX, bulletY, Bullet.getVectorMap(), velocityX, velocityY);
    this.rotationAngle = angleInDegrees;
    this.timeAlive = 0; // Time the bullet has existed

    if (Bullet.DEBUG) {
      console.log(`bullet construct ${JSON.stringify(this)}`);
    }
  }

  update(deltaTime) {
    // Update position based on velocity
    if (this.isAlive()) {
      super.update(deltaTime);
      this.checkWrapAround();
    }

    // Track how long the bullet has been alive
    this.timeAlive += deltaTime;

    // If the bullet exceeds its lifespan, mark it for removal
    if (this.timeAlive > Bullet.lifespan) {
      this.setIsDead();
      if (Bullet.DEBUG) {
        console.log(`bullet dead ${JSON.stringify(this)}`);
      }
    }

  }

  /** Destroys the bullet and cleans up resources.
 * @returns {boolean} True if cleanup was successful
 */
  destroy() {
    try {
      if (Bullet.DEBUG) {
        console.log(`bullet destroy ${JSON.stringify(this)}`);
      }

      // Call parent destroy first
      const parentDestroyed = super.destroy();
      if (!parentDestroyed) {
        return false;
      }

      // Validate object state before destruction
      if (this.timeAlive === null) {
        return false; // Already destroyed
      }

      // Cleanup bullet-specific properties
      this.timeAlive = null;
      this.rotationAngle = null;

      return true; // Successful cleanup

    } catch (error) {
      console.error('Error during Bullet destruction:', error);
      return false;
    }
  }

}

export default Bullet;
