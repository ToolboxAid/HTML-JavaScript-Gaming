// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js - Template Game Engine

import { canvasConfig, performanceConfig, fullscreenConfig, playerSelect } from './global.js';
import GameBase from '../scripts/gamebase.js';

import CanvasUtils from '../scripts/canvas.js';
import GameUtils from '../scripts/game/gameUtils.js';

import KeyboardInput from '../scripts/input/keyboard.js';
import RandomUtils from '../scripts/math/randomUtils.js';

class Game extends GameBase {

  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
  }

  async onInitialize() {

    console.log("onInit");

    this.playerSelect = playerSelect;

    this.keyboardInput = new KeyboardInput();

    // Game State Variables
    this.gameState = "attract"; // Possible states: attract, playerSelect, initGame, initEnemy, playGame, gameOver
    this.playerCount = 1;
    this.currentPlayer = 0;
    this.playerLives = null; // Player 1 - Player 4 lives
    this.score = null; // Player 1 - Player 4 scores
    this.gameInitialized = false;
    this.enemyInitialized = false;
    this.onetime = true;

    this.backToAttract = 600;
    this.backToAttractCounter = 0;
  }

  // Example: object.position += object.velocity * deltaTime;
  gameLoop(deltaTime) {
    this.keyboardInput.update();

    console.log(this.gameState);

    // Update game state with deltaTime
    switch (this.gameState) {
      case "attract":
        this.displayAttractMode();
        break;

      case "playerSelect":
        this.displayPlayerSelect();
        break;

      case "initGame":
        this.initGame();
        break;

      case "initEnemy":
        if (!this.enemyInitialized) {
          this.initializeEnemy();
        }
        break;

      case "playGame":
        this.playGame();
        break;

      case "pauseGame":
        this.pauseGame();
        break;

      case "gameOver":
        this.displayGameOver();
        break;
    }
  }

  // Display 
  displayAttractMode() {
    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Welcome to the Game!", 250, 200);
    CanvasUtils.ctx.fillText("Press `Enter` to Start", 250, 300);

    if (this.keyboardInput.getkeysPressed().includes('Enter') ||
      this.keyboardInput.getkeysPressed().includes('NumpadEnter')) {
      this.gameState = "playerSelect";
    }
  }

  displayPlayerSelect(deltaTime) {
    const gameController = null; // no controller instance - for clarity
    const result = GameUtils.selectNumberOfPlayers(CanvasUtils.ctx, canvasConfig, this.playerSelect, this.keyboardInput, gameController);
    if (result) {
      this.playerCount = result.playerCount;
      this.playerLives = result.playerLives;
      this.gameState = "initGame";
    }
  }

  displayGameOver() {
    CanvasUtils.ctx.fillStyle = "red";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Game Over", 300, 200);
    CanvasUtils.ctx.fillText("Press `Enter` to Restart", 250, 300);

    if (this.keyboardInput.getkeysPressed().includes('Enter') ||
      this.keyboardInput.getkeysPressed().includes('NumpadEnter') ||
      this.backToAttractCounter++ > this.backToAttract) {
      this.resetGame();
    }
  }

  // Game Logic 
  initGame() {
    this.gameInitialized = true;
    this.onetime = true;
    this.score = [0, 0, 0, 0]; // Reset score
    this.currentPlayer = 0;
    this.playerWidth = [150, 150, 150, 150]; // Reset size
    this.gameState = "initEnemy";
  }

  initializeEnemy() {
    console.log("Initializing Enemy...");
    this.enemyInitialized = true;

    this.gameState = "playGame";
  }

  gamePauseCheck() {
    if (this.keyboardInput.getkeysPressed().includes('KeyP')) {
      if (this.gameState === "playGame") {
        this.gameState = "pauseGame";
      } else if (this.gameState === "pauseGame") {
        this.gameState = "playGame";
      }
    }
  }

  pauseGame() {
    this.gamePauseCheck();
    CanvasUtils.drawText(150, 200, "Game Paused.", 3.5, "white");
    CanvasUtils.drawText(150, 250, "Press `P` to unpause game", 3.5, "white");
  }

  static playerX = canvasConfig.width / 2;

  static enemyX = canvasConfig.width / 2;
  static enemyY = canvasConfig.height + 1;
  static enemySize = 150;
  playGame() {
    this.gamePauseCheck();

    // Enemy code
    const enemySpeed = 5 + (this.score[this.currentPlayer] * 0.25)
    Game.enemyY += enemySpeed;
    CanvasUtils.drawRect(Game.enemyX, Game.enemyY, Game.enemySize, Game.enemySize, "red");

    // Player code
    if (this.keyboardInput.getKeysDown().includes('ArrowRight')) {
      Game.playerX += 5;
    }
    if (Game.playerX > canvasConfig.width - this.playerWidth[this.currentPlayer]) {
      Game.playerX = canvasConfig.width - this.playerWidth[this.currentPlayer];
    }

    if (this.keyboardInput.getKeysDown().includes('ArrowLeft')) {
      Game.playerX -= 5;
      if (Game.playerX < 0) {
        Game.playerX = 0;
      }
    }

    CanvasUtils.drawRect(Game.playerX,
      canvasConfig.height - 60,
      this.playerWidth[this.currentPlayer], 30, "yellow");

    // Boundry detection
    if (Game.enemyY > canvasConfig.height) {
      Game.enemyX = RandomUtils.randomInt(0, canvasConfig.width - Game.enemySize);
      Game.enemyY = -Game.enemySize;
      this.score[this.currentPlayer] += 1;
      this.playerWidth[this.currentPlayer] += 10

      // Collision detection
    } else if (Game.enemyY + Game.enemySize > canvasConfig.height - 60 &&
      Game.enemyX + Game.enemySize > Game.playerX &&
      Game.enemyX < Game.playerX + this.playerWidth[this.currentPlayer]) {
      const result = GameUtils.swapPlayer(
        this.playerLives,
        this.currentPlayer,
        this.playerCount,
        (newState) => { this.gameState = newState; }
      );

      // Update the current player and 
      // lives based on the result from swapPlayer
      this.currentPlayer = result.updatedPlayer;
      this.playerLives = result.updatedLives;
      console.log(`Player ${this.currentPlayer + 1} lost a life!`);
      Game.enemyX = RandomUtils.randomInt(0, canvasConfig.width - Game.enemySize);
      Game.enemyY = -Game.enemySize;
    }

    // draw score and lives
    CanvasUtils.drawText(50, 50, `Score ${this.score[0]} Lives ${this.playerLives[0]}`, 3.5, "white");
    CanvasUtils.drawText(650, 50, `Score ${this.score[1]} Lives ${this.playerLives[1]}`, 3.5, "white");
  }

  resetGame() {
    this.gameState = "attract";
    this.gameInitialized = false;
    this.enemyInitialized = false;
    this.backToAttractCounter = 0;
  }

}

export default Game;

const game = new Game();
