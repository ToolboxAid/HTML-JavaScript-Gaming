// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// game.js - Snack

import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js';
import GameBase from '../scripts/gamebase.js';

import CanvasUtils from '../scripts/canvas.js';
import KeyboardInput from '../scripts/input/keyboard.js';

import AttractScreen from './attract.js';
import CollisionUtils from '../scripts/physics/collisionUtils.js';

class SnakeHead {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
  }
}

class Game extends GameBase {
  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
  }

  async onInitialize() {

    console.log("onInit");
    this.keyboardInput = new KeyboardInput();
    this.gameState = "attract";
    this.snake = [];
    this.direction = 'right';
    this.food = {};
    this.score = 0;
    this.gameInitialized = false;
    this.tileSize = 20;
    this.gameSpeed = 100;
    this.lastMoveTime = 0;

    // Initialize AttractScreen
    this.attractScreen = new AttractScreen();

    this.snakeHead = new SnakeHead();
    this.snakeHead.width = this.tileSize;
    this.snakeHead.height = this.tileSize;

    this.snakeSegment = new SnakeHead();
    this.snakeSegment.width = this.tileSize;
    this.snakeSegment.height = this.tileSize;
  }

  gameLoop(deltaTime) {
    this.keyboardInput.update();

    switch (this.gameState) {
      case "attract":
        this.displayAttractMode();
        break;
      case "initGame":
        if (!this.gameInitialized) {
          this.initGame();
        }
        break;
      case "playGame":
        if (Date.now() - this.lastMoveTime > this.gameSpeed) {
          this.playGame();
          this.lastMoveTime = Date.now();
        } else {
          this.drawGame();
        }
        break;
      case "gameOver":
        this.displayGameOver();
        break;
    }
  }

  displayAttractMode(deltaTime) {
    // Update AttractScreen
    this.attractScreen.update(deltaTime);

    // Check for player input to start the game
    if (this.keyboardInput.getkeysPressed().includes('Enter')) {
      this.resetGame();
      this.gameState = "initGame";
    }
  }

  initGame() {
    // Initialize Snake
    this.snake = [{ x: 100, y: 100 }, { x: 80, y: 100 }, { x: 60, y: 100 }, { x: 40, y: 100 }, { x: 20, y: 100 }, { x: 0, y: 100 }];
    this.direction = 'right';
    this.spawnFood();
    this.score = 0;
    this.gameInitialized = true;
    this.gameState = "playGame";
  }

  playGame() {
    this.handleInput();
    this.moveSnake();
    this.checkCollision();
    this.drawGame();
  }

  handleInput() {
    const KeyDown = this.keyboardInput.getKeysDown();
    if (KeyDown.includes('ArrowUp') && this.direction !== 'down') {
      this.direction = 'up';
    } else if (KeyDown.includes('ArrowDown') && this.direction !== 'up') {
      this.direction = 'down';
    } else if (KeyDown.includes('ArrowLeft') && this.direction !== 'right') {
      this.direction = 'left';
    } else if (KeyDown.includes('ArrowRight') && this.direction !== 'left') {
      this.direction = 'right';
    }
  }

  moveSnake() {
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

    this.snake.unshift(head);

    // Check if the snake ate the food
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.spawnFood();
    } else {
      this.snake.pop(); // Remove the tail
    }
  }

  checkCollision() {
    // Check collision with walls
    this.snakeHead.x = this.snake[0].x;
    this.snakeHead.y = this.snake[0].y;
    if (CollisionUtils.checkGameAtBounds(this.snakeHead)) {// required to pass object with x, y, width, height
      this.gameState = "gameOver";
      console.log("gameOver bounds", this.snakeHead, CollisionUtils.checkGameAtBoundsSides(this.snakeHead));
    }

    // Check collision with self
    this.snake.slice(1).forEach(segment => {
      this.snakeSegment.x = segment.x;
      this.snakeSegment.y = segment.y;
      if (CollisionUtils.isCollidingWith(this.snakeHead, this.snakeSegment)) {
        this.gameState = "gameOver";
        console.log("gameOver self", this.snakeHead, CollisionUtils.checkGameAtBoundsSides(this.snakeHead));
      }
    });
  }

  drawGame() {
    // Draw Snake
    this.snake.forEach(segment => {
      CanvasUtils.drawRect(segment.x, segment.y, this.tileSize, this.tileSize, 'green');
    });

    // Draw Food
    CanvasUtils.drawRect(this.food.x, this.food.y, this.tileSize, this.tileSize, 'red');

    // Draw Score
    CanvasUtils.ctx.fillStyle = 'white';
    CanvasUtils.ctx.font = "20px Arial";
    CanvasUtils.ctx.fillText(`Score: ${this.score}`, 10, 20);
  }

  spawnFood() {
    const cols = canvasConfig.width / this.tileSize;
    const rows = canvasConfig.height / this.tileSize;

    this.food = {
      x: Math.floor(Math.random() * cols) * this.tileSize,
      y: Math.floor(Math.random() * rows) * this.tileSize
    };
  }

  displayGameOver() {
    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Game Over!", 200, 150);
    CanvasUtils.ctx.fillText(`Score: ${this.score}`, 220, 200);
    CanvasUtils.ctx.fillText("Press `Enter` to Restart", 150, 250);

    if (this.keyboardInput.getkeysPressed().includes('Enter')) {
      this.resetGame();
    }
  }

  resetGame() {
    this.gameInitialized = false;
    this.gameState = "attract";
  }
}

// Export the Game class
export default Game;

const game = new Game();


