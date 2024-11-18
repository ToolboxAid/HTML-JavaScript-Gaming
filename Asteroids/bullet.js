// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/15/2024
// bullet.js

import CanvasUtils from '../scripts/canvas.js';
import { canvasConfig } from './global.js';
import ObjectDynamic from '../scripts/objectDynamic.js';

/**
 * Represents a bullet in the game that extends ObjectDynamic for movement handling.
 */
class Bullet extends ObjectDynamic {
  /**
   * Creates an instance of Bullet.
   * @param {number} x - The initial X position of the bullet.
   * @param {number} y - The initial Y position of the bullet.
   * @param {number} angle - The angle in radians at which the bullet is fired.
   */
  constructor(x, y, angle) {
    const bulletWidth = 4; // Width of the bullet (for collision detection purposes)
    const bulletHeight = 4; // Height of the bullet (for collision detection purposes)
    
    // Initialize velocity based on angle and speed
    const speed = 300;
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    // Call the ObjectDynamic constructor
    super(x, y, bulletWidth, bulletHeight, velocityX, velocityY);

    // Additional bullet-specific properties
    this.lifetime = 60; // Frames until bullet is destroyed
  }

  /**
   * Updates the bullet's position and lifetime.
   * @param {number} deltaTime - The time elapsed since the last update, in seconds.
   */
  update(deltaTime) {
    super.update(deltaTime); // Update position using ObjectDynamic's update method
    this.lifetime -= 1; // Decrease lifetime
  }

  /**
   * Draws the bullet on the canvas.
   */
  draw() {
    CanvasUtils.ctx.fillStyle = 'white';
    CanvasUtils.ctx.beginPath();
    CanvasUtils.ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 2, 0, Math.PI * 2);
    CanvasUtils.ctx.fill();
  }

  /**
   * Checks if the bullet is out of bounds or has exceeded its lifetime.
   * @returns {boolean} - True if the bullet should be destroyed, false otherwise.
   */
  isOutOfBounds() {
    return (
      this.lifetime <= 0 ||
      this.x < 0 || this.x > canvasConfig.width ||
      this.y < 0 || this.y > canvasConfig.height
    );
  }

  /**
   * Checks for collision with an asteroid.
   * @param {ObjectDynamic} asteroid - The asteroid object to check collision against.
   * @returns {boolean} - True if the bullet collides with the asteroid, false otherwise.
   */
  collidesWith(asteroid) {
    // Calculate the distance between the bullet and the asteroid center points
    const dx = this.getCenterPoint().x - asteroid.getCenterPoint().x;
    const dy = this.getCenterPoint().y - asteroid.getCenterPoint().y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if the distance is less than the asteroid's radius (collision detected)
    return distance < asteroid.width / 2;
  }
}

export default Bullet;
