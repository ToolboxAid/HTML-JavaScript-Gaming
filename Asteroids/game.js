// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// game.js - asteroids

import { canvasConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';
import KeyboardInput from '../scripts/keyboard.js';
import Asteroid from './asteroid.js';
import Bullet from './bullet.js';
import Ship from './ship.js';

import AttractMode from './attractMode.js';

class Game {

  static attractMode = null;

  constructor() {
    this.keyboardInput = new KeyboardInput();

    // Game State Variables
    this.gameState = "initAttract";
    this.playerLives = 3;
    this.score = 0;
    this.gameInitialized = false;
    this.asteroids = new Map();
    this.bullets = [];
    this.spawnAsteroidsCount = 5;
    this.spawnRate = 0.001; //0.5; // Asteroid spawn rate

    this.backToAttract = 60;
    this.backToAttractCounter = 0;
  }

  gameLoop(deltaTime) {

    this.keyboardInput.update();

    switch (this.gameState) {
      case "initAttract":
        Game.attractMode = new AttractMode();
        this.gameState = "attract";
        break;

      case "attract":
        this.displayAttractMode(deltaTime);
        break;

      case "initGame":
        if (!this.gameInitialized) {
          this.initializeGame();
        }
        break;

      case "playGame":
        this.playGame(deltaTime);
        break;

      case "pauseGame":
        this.pauseGame();
        break;

      case "gameOver":
        this.displayGameOver();
        break;
    }
  }

  displayAttractMode(deltaTime) {
    console.log("Attract Game...");
    Game.attractMode.update(deltaTime);
    Game.attractMode.draw();

    if (this.keyboardInput.getKeysJustPressed().includes('Enter')) {
      this.gameState = "initGame";
    }
  }

  displayGameOver() {
    CanvasUtils.ctx.fillStyle = "red";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Game Over", 300, 200);
    CanvasUtils.ctx.fillText("Press `Enter` to Restart", 250, 300);

    if (this.keyboardInput.getKeysJustPressed().includes('Enter') ||
      this.backToAttractCounter++ > this.backToAttract) {
      this.resetGame();
    }
  }

  initializeGame() {
    console.log("Initializing Game...");
    this.gameInitialized = true;
    this.playerLives = 3;
    this.score = 0;
    this.asteroids.clear();
    this.bullets = [];

    for (let i = 0; i < this.spawnAsteroidsCount; i++) {
      this.spawnAsteroid();
    }

    this.gameState = "playGame";
  }

  pauseGame() {
    this.gamePauseCheck();
    CanvasUtils.drawText(150, 200, "Game Paused.", 3.5, "white");
    CanvasUtils.drawText(150, 250, "Press `P` to unpause game", 3.5, "white");
  }

  gamePauseCheck() {
    if (this.keyboardInput.getKeysJustPressed().includes('KeyP')) {
      this.gameState = this.gameState === "playGame" ? "pauseGame" : "playGame";
    }
  }

  playGame(deltaTime) {
    this.gamePauseCheck();

    // Player movement and actions
    this.updateAsteroids(deltaTime);
    this.updateBullets(deltaTime);

    this.checkCollisions();

    // Draw all game objects
    this.bullets.forEach(bullet => bullet.draw());
    this.asteroids.forEach(asteroid => asteroid.draw());

    // Display score and lives
    CanvasUtils.drawText(20, 20, `Lives: ${this.playerLives}`, 2, "white");
    CanvasUtils.drawText(20, 50, `Score: ${this.score}`, 2, "white");

    if (this.playerLives <= 0) {
      this.gameState = "gameOver";
    }
  }

  updateBullets(deltaTime) {
    this.bullets = this.bullets.filter(bullet => !bullet.isOutOfBounds());
    this.bullets.forEach(bullet => bullet.update(deltaTime));
  }

  updateAsteroids(deltaTime) {
    this.asteroids.forEach((asteroid, key) => {
      asteroid.update(deltaTime);
      if (asteroid.isOutOfBounds()) {
        this.asteroids.delete(key);
      }
    });

    // Spawn new asteroids based on spawn rate
    if (Math.random() < this.spawnRate) {
      this.spawnAsteroid();
    }
  }

  spawnAsteroid() {
    const asteroid = new Asteroid(40, "livingFrames", "dyingFrames");
    this.asteroids.set(asteroid.key, asteroid);
  }

  checkCollisions() {
    // Bullet-Asteroid collisions
    this.bullets.forEach((bullet, bulletIndex) => {
      this.asteroids.forEach((asteroid, asteroidKey) => {
        if (bullet.collidesWith(asteroid)) {
          this.score += 100;
          this.bullets.splice(bulletIndex, 1);
          this.asteroids.delete(asteroidKey);
        }
      });
    });

    // // Player-Asteroid collisions
    // this.asteroids.forEach(asteroid => {
    //   if (this.playerShip.collidesWith(asteroid)) {
    //     this.playerLives -= 1;
    //     this.asteroids.delete(asteroid.key);
    //   }
    // });
  }

  resetGame() {
    console.log("Resetting Game...");
    this.gameState = "initAttract";
    this.gameInitialized = false;
    this.backToAttractCounter = 0;
  }
}

export default Game;

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
