// ToolboxAid.com
// David Quesenberry

// 10/16/2024
// game.js - Template Game Engine

import { canvasConfig, performanceConfig, fullscreenConfig, playerSelect } from './global.js';
import GameBase from '../scripts/gamebase.js';

import CanvasUtils from '../scripts/canvas.js'; // Required for dynamic canvas operations, used in animate()

import GameUtils from '../scripts/game/gameUtils.js';

import KeyboardInput from '../scripts/input/keyboard.js';

import GameAttract from './gameAttract.js';

const keyboardInput = new KeyboardInput();

class Game extends GameBase {

  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
  }

  async onInitialize() {

    console.log("onInit");

    if (false) {

      console.log("canvasConfig.game", canvasConfig.game);

      console.log("window.fpsShow", window.fpsShow);
      console.log("window.fpsColor", window.fpsColor);
      console.log("window.fpsSize", window.fpsSize);
      console.log("window.fpsX", window.fpsX);
      console.log("window.fpsY", window.fpsY);

      console.log("window.gameAreaWidth", window.gameAreaWidth);
      console.log("window.gameAreaHeight", window.gameAreaHeight);
      console.log("window.gameScaleWindow", window.gameScaleWindow);
      console.log("window.backgroundColor", window.backgroundColor);
      console.log("",);

    }

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

    this.gameAttract = new GameAttract();
  }

  // Example: object.position += object.velocity * deltaTime;
  gameLoop(deltaTime) {
    keyboardInput.update();

    //console.log(this.gameState);

    // Update game state with deltaTime
    switch (this.gameState) {
      case "attract":
        this.displayAttractMode(deltaTime);
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
  displayAttractMode(deltaTime) {
    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Welcome to the `2D` Game!", 145, 170);
    CanvasUtils.ctx.fillText("Press `Enter` to Start", 190, 205);

    this.gameAttract.update(deltaTime, keyboardInput);
    this.gameAttract.draw();

    if (keyboardInput.getkeysPressed().includes('Enter')) {
      this.gameState = "playerSelect";
    }
  }

  displayPlayerSelect(deltaTime) {
    const result = GameUtils.selectNumberOfPlayers(CanvasUtils.ctx, canvasConfig, playerSelect, keyboardInput);
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

    if (keyboardInput.getkeysPressed().includes('Enter') ||
      this.backToAttractCounter++ > this.backToAttract) {
      this.resetGame();
    }
  }

  // Game Logic
  initGame() {
    this.gameInitialized = true;
    this.onetime = true;
    // this.playerLives = [3, 3, 4, 3]; // Reset lives
    this.score = [0, 0, 0, 0]; // Reset score
    this.currentPlayer = 0;

    this.gameState = "initEnemy";
  }

  initializeEnemy() {
    console.log("Initializing Enemy...");
    this.enemyInitialized = true;

    this.gameState = "playGame";
  }

  gamePauseCheck() {
    if (keyboardInput.getkeysPressed().includes('KeyP')) {
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

  playGame() {
    this.gamePauseCheck();

    // Display current player status
    const playerInfo = `Player ${this.currentPlayer + 1} - Lives: ${this.playerLives[this.currentPlayer]} - Score: ${this.score[this.currentPlayer]}`;
    CanvasUtils.drawText(100, 200, playerInfo, 3.5, "white");
    CanvasUtils.drawText(100, 250, "Press `D` for player death", 3.5, "white");
    CanvasUtils.drawText(100, 300, "Press `S` for score", 3.5, "white");
    CanvasUtils.drawText(100, 350, "Press `P` to pause game", 3.5, "white");

    if (keyboardInput.getkeysPressed().includes('KeyS')) {
      this.score[this.currentPlayer] += 100;
      console.log("score");
    }

    // Check if `D` key was just pressed, simulate losing a life
    if (keyboardInput.getkeysPressed().includes('KeyD')) {
      const result = GameUtils.swapPlayer(
        this.playerLives,
        this.currentPlayer,
        this.playerCount,
        (newState) => { this.gameState = newState; }
      );

      // Update the current player and 
      //                                                       lives based on the result from swapPlayer
      this.currentPlayer = result.updatedPlayer;
      this.playerLives = result.updatedLives;
    }
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
