
// ToolboxAid.com
// David Quesenberry
// asteroids
// 11/15/2024
// asteroid.js


import CanvasUtils from '../scripts/canvas.js';
import { canvasConfig } from './global.js';

import ObjectVector from '../scripts/objectVector.js';

class Asteroid extends ObjectVector {
  constructor(size = 40, livingFrames, dyingFrames) {
    // Initialize position randomly on the canvas
    const x = Math.random() * canvasConfig.width;
    const y = Math.random() * canvasConfig.height;

    // Random velocity
    const velocityX = (Math.random() - 0.5) * 2;
    const velocityY = (Math.random() - 0.5) * 2;

    // Call ObjectKillable constructor
    super(x, y, livingFrames, dyingFrames, velocityX, velocityY);

    // Asteroid-specific properties
    this.size = size;
    this.key = Math.random().toString(36).substring(2);

    // Set asteroid dimensions based on size
    this.width = this.size;
    this.height = this.size;
  }

  update(deltaTime, incFrame = true) {
    // Update position using ObjectDynamic's method
    super.update(deltaTime, incFrame);

    // Screen wrap for the asteroid
    this.wrapAround();
  }

  draw() {
    const ctx = CanvasUtils.ctx;
    // Draw the asteroid based on its current life state
    if (this.isAlive()) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.isDying()) {
      // Use ObjectKillable's frame drawing for the dying animation
      super.draw(ctx);
    }
  }


  collidesWith(bullet) {
    // Collision detection using ObjectDynamic's boundary collision method
    if (this.isAlive()) {
      const dx = this.x - bullet.position.x;
      const dy = this.y - bullet.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < this.size / 2;
    }
    return false;
  }

  // Override processCollisionWith to handle asteroid-specific logic
  processCollisionWith(object) {
    const collided = super.processCollisionWith(object);
    if (collided && this.isAlive()) {
      this.setHit(); // Transition to dying state if a collision is detected
    }
    return collided;
  }
}

export default Asteroid;
