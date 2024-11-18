// ToolboxAid.com
// David Quesenberry
// asteroids
// 11/15/2024
// playerShip.js

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
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Screen wrap
    this.wrapAround();

    // Shoot bullets
    if (keyboardInput.getKeyJustPressed().includes('Space') 
        && this.bullets.length < this.maxBullets) {
      this.shootBullet();
    }

    // Update bullets
    this.bullets = this.bullets.filter(bullet => !bullet.isOutOfBounds());
    this.bullets.forEach(bullet => bullet.update(deltaTime));
  }

  shootBullet() {
    const bullet = new Bullet(this.position.x, this.position.y, this.angle);
    this.bullets.push(bullet);
  }

  draw() {
    // Draw the ship
    CanvasUtils.ctx.save();
    CanvasUtils.ctx.translate(this.position.x, this.position.y);
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

  wrapAround() {
    // Screen wrapping logic
    if (this.position.x > canvasConfig.width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = canvasConfig.width;
    if (this.position.y > canvasConfig.height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = canvasConfig.height;
  }

  collidesWith(asteroid) {
    const dx = this.position.x - asteroid.position.x;
    const dy = this.position.y - asteroid.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < asteroid.size / 2 + 10; // Collision radius
  }
}

export default PlayerShip;