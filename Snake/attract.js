// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// attract.js

import CanvasUtils from '../scripts/canvas.js';
import { canvasConfig } from './global.js';

class AttractScreen {
  constructor() {
    this.snake = [
      { x: 100, y: 100 },
      { x: 80, y: 100 },
      { x: 60, y: 100 }
    ];
    this.direction = 'right';
    this.food = this.spawnFood();
    this.tileSize = 20;
    this.autoMoveInterval = 0;
    this.lastMoveTime = 0;
    this.moveDelay = 200; // Adjust speed of attract mode
  }

  update(deltaTime) {
    this.autoMove(deltaTime);
    this.drawAttractMode();
  }

  autoMove(deltaTime) {
    if (Date.now() - this.lastMoveTime < this.moveDelay) {
      return;
    }
    this.lastMoveTime = Date.now();

    // Move snake in the current direction
    const head = { ...this.snake[0] };
    switch (this.direction) {
      case 'up':
        head.y -= this.tileSize;
        break;
      case 'down':
        head.y += this.tileSize;
        break;
      case 'left':
        head.x -= this.tileSize;
        break;
      case 'right':
        head.x += this.tileSize;
        break;
    }

    // Add new head to the snake
    this.snake.unshift(head);

    // Check if snake has eaten food
    if (head.x === this.food.x && head.y === this.food.y) {
      this.food = this.spawnFood(); // Generate new food
    } else {
      this.snake.pop(); // Remove the tail if no food eaten
    }

    // Change direction randomly to make it look dynamic
    if (Math.random() < 0.1) {
      this.changeDirectionRandomly();
    }

    // Check boundaries and reverse direction if hitting the wall
    if (head.x < 0 || head.x >= canvasConfig.width) {
      this.direction = this.direction === 'left' ? 'right' : 'left';
    }
    if (head.y < 0 || head.y >= canvasConfig.height) {
      this.direction = this.direction === 'up' ? 'down' : 'up';
    }
  }

  changeDirectionRandomly() {
    const directions = ['up', 'down', 'left', 'right'];
    // Ensure new direction is not directly opposite of current direction
    const oppositeDirection = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };
    const possibleDirections = directions.filter(
      dir => dir !== oppositeDirection[this.direction]
    );
    this.direction =
      possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
  }

  spawnFood() {
    const cols = canvasConfig.width / this.tileSize;
    const rows = canvasConfig.height / this.tileSize;
    return {
      x: Math.floor(Math.random() * cols) * this.tileSize,
      y: Math.floor(Math.random() * rows) * this.tileSize
    };
  }

  drawAttractMode() {
    // Clear the canvas
    CanvasUtils.ctx.fillStyle = "black";
    CanvasUtils.ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height);

    // Draw Snake
    this.snake.forEach(segment => {
      CanvasUtils.drawRect(segment.x, segment.y, this.tileSize, this.tileSize, 'green');
    });

    // Draw Food
    CanvasUtils.drawRect(this.food.x, this.food.y, this.tileSize, this.tileSize, 'red');

    // Draw Attract Mode Text
    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Welcome to Snake Game", 150, 150);
    CanvasUtils.ctx.fillText("Press `Enter` to Start", 150, 250);
  }
}

export default AttractScreen;
