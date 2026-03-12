// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// bullet.js

import ObjectVector from '../../engine/objects/objectVector.js';

class Bullet extends ObjectVector {

  // Play your game normally: game.html
  // Enable debug mode: game.html?bullet
  static DEBUG = new URLSearchParams(window.location.search).has('bullet');

  // Define a simple vector map for a bullet, typically a small line or dot
  static getVectorMap() { return [[-4, 0], [4, 1], [4, -1]] };
  static speed = 350;
  static lifespan = 1.75; // Time in seconds before the bullet disappears

  constructor(configOrX, y, angleInDegrees) {
    const config = typeof configOrX === 'object' && configOrX !== null
      ? configOrX
      : { x: configOrX, y, angleInDegrees };

    const bulletX = config.x;
    const bulletY = config.y;
    const bulletAngle = config.angleInDegrees;
    const angleInRadians = bulletAngle * (Math.PI / 180);

    const inheritedVelocityX = Number.isFinite(config.inheritedVelocityX) ? config.inheritedVelocityX : 0;
    const inheritedVelocityY = Number.isFinite(config.inheritedVelocityY) ? config.inheritedVelocityY : 0;

    const velocityX = Math.cos(angleInRadians) * Bullet.speed;
    const velocityY = Math.sin(angleInRadians) * Bullet.speed;

    super(
      bulletX,
      bulletY,
      Bullet.getVectorMap(),
      velocityX + inheritedVelocityX,
      velocityY + inheritedVelocityY
    );
    this.rotationAngle = bulletAngle;
    this.timeAlive = 0; // Time the bullet has existed
    this.ownerId = config.ownerId ?? null;
    this.ownerType = config.ownerType ?? null;
    this.team = config.team ?? null;

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
      this.ownerId = null;
      this.ownerType = null;
      this.team = null;

      return true; // Successful cleanup

    } catch (error) {
      console.error('Error during Bullet destruction:', error);
      return false;
    }
  }

}

export default Bullet;
