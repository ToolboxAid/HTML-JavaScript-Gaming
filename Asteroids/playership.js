// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// playerShip.js - asteroids

import CanvasUtils from '../scripts/canvas.js';
import { canvasConfig } from './global.js';
import Bullet from './bullet.js';

class PlayerShip {
  constructor() {
    this.position = { x: canvasConfig.width / 2, y: canvasConfig.height / 2 };
    this.velocity = { x: 0, y: 0 };
    this.angle = 0;
    this.rotationSpeed = 0.1;
    this.thrust = 0.05;
    this.friction = 0.99;
    this.bullets = [];
    this.maxBullets = 5;
  }

  update(keyboardInput, deltaTime) {
    // Rotate the ship
    if (keyboardInput.isKeyDown('ArrowLeft')) {
      this.angle -= this.rotationSpeed;
    }
    if (keyboardInput.isKeyDown('ArrowRight')) {
      this.angle += this.rotationSpeed;
    }

    // Apply thrust
    if (keyboardInput.isKeyDown('ArrowUp')) {
      this.velocity.x += Math.cos(this.angle) * this.thrust;
      this.velocity.y += Math.sin(this.angle) * this.thrust;
    }

    // Update position
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.X += this.velocity.x;
    this.Y += this.velocity.y;

    // Screen wrap
    this.wrapAround();

    // Shoot bullets
    if (keyboardInput.getKeysJustPressed().includes('Space') 
        && this.bullets.length < this.maxBullets) {
      this.shootBullet();
    }

    // Update bullets
    this.bullets = this.bullets.filter(bullet => !bullet.isOutOfBounds());
    this.bullets.forEach(bullet => bullet.update(deltaTime));
  }

  shootBullet() {
    const bullet = new Bullet(this.X, this.Y, this.angle);
    this.bullets.push(bullet);
  }

  draw() {
    // Draw the ship
    CanvasUtils.ctx.save();
    CanvasUtils.ctx.translate(this.X, this.Y);
    CanvasUtils.ctx.rotate(this.angle);
    CanvasUtils.ctx.strokeStyle = 'white';
    CanvasUtils.ctx.beginPath();
    CanvasUtils.ctx.moveTo(10, 0);
    CanvasUtils.ctx.lineTo(-10, -7);
    CanvasUtils.ctx.lineTo(-10, 7);
    CanvasUtils.ctx.closePath();
    CanvasUtils.ctx.stroke();
    CanvasUtils.ctx.restore();

    // Draw bullets
    this.bullets.forEach(bullet => bullet.draw());
  }

  collidesWith(asteroid) {
    const dx = this.X - asteroid.position.x;
    const dy = this.Y - asteroid.positionY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < asteroid.size / 2 + 10; // Collision radius
  }
}

export default PlayerShip;
