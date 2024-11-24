// ToolboxAid.com
// David Quesenberry

// 10/16/2024
// game.js - Template Game Engine

import { canvasConfig } from './global.js'; // Import canvasConfig for canvas-related configurations
import CanvasUtils from '../scripts/canvas.js'; // Required for dynamic canvas operations, used in animate()
import Fullscreen from '../scripts/fullscreen.js'; // Required for fullscreen control, used elsewhere

import KeyboardInput from '../scripts/keyboard.js';

class Game {

  constructor() {
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
        this.initializeGame();
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

  // Display Functions
  displayAttractMode() {
    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Welcome to the Game!", 250, 200);
    CanvasUtils.ctx.fillText("Press `Enter` to Start", 250, 300);

    if (this.keyboardInput.getkeysPressed().includes('Enter')) {
      this.gameState = "playerSelect";
    }
  }

  displayPlayerSelect() {
    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Select Player Mode", 250, 200);
    CanvasUtils.ctx.fillText("Press `1` for Single Player", 250, 250);
    CanvasUtils.ctx.fillText("Press `2` for Two Players", 250, 300);
    CanvasUtils.ctx.fillText("Press `3` for Three Players", 250, 350);
    CanvasUtils.ctx.fillText("Press `4` for Four Players", 250, 400);
    const lives = 3;
    if (this.keyboardInput.getkeysPressed().includes('Digit1')) {
      this.playerCount = 1;
      this.playerLives = [lives, 0, 0, 0]; // Reset lives
      this.gameState = "initGame";
      console.log("Players: 1");
    } else if (this.keyboardInput.getkeysPressed().includes('Digit2')) {
      this.playerCount = 2;
      this.playerLives = [lives, lives, 0, 0]; // Reset lives
      this.gameState = "initGame";
      console.log("Players: 2");
    } else if (this.keyboardInput.getkeysPressed().includes('Digit3')) {
      this.playerCount = 3;
      this.playerLives = [lives, lives, lives, 0]; // Reset lives
      this.gameState = "initGame";
      console.log("Players: 3");
    } else if (this.keyboardInput.getkeysPressed().includes('Digit4')) {
      this.playerCount = 4;
      this.playerLives = [lives, lives, lives, lives]; // Reset lives
      this.gameState = "initGame";
      console.log("Players: 4");
    }
  }

  displayGameOver() {
    CanvasUtils.ctx.fillStyle = "red";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Game Over", 300, 200);
    CanvasUtils.ctx.fillText("Press `Enter` to Restart", 250, 300);

    if (this.keyboardInput.getkeysPressed().includes('Enter') ||
      this.backToAttractCounter++ > this.backToAttract) {
      this.resetGame();
    }
  }

  // Game Logic Functions
  initializeGame() {
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

  playGame() {
    this.gamePauseCheck();

    // Display current player status
    const playerInfo = `Player ${this.currentPlayer + 1} - Lives: ${this.playerLives[this.currentPlayer]} - Score: ${this.score[this.currentPlayer]}`;
    CanvasUtils.drawText(100, 200, playerInfo, 3.5, "white");
    CanvasUtils.drawText(100, 250, "Press `D` for player death", 3.5, "white");
    CanvasUtils.drawText(100, 300, "Press `S` for score", 3.5, "white");
    CanvasUtils.drawText(100, 350, "Press `P` to pause game", 3.5, "white");

    if (this.keyboardInput.getkeysPressed().includes('KeyS')) {
      this.score[this.currentPlayer] += 100;
      console.log("score");
    }

    // Check if `D`` key was just pressed, simulate losing a life
    if (this.keyboardInput.getkeysPressed().includes('KeyD')) {
      this.swapPlayer();
    }
  }

  swapPlayer() {
    // Decrease the current player's life
    this.playerLives[this.currentPlayer] -= 1;
    console.log(`Player ${this.currentPlayer + 1} lost a life!`);

    // Check if the current player is out of lives
    if (this.playerLives[this.currentPlayer] <= 0) {
      console.log(`Player ${this.currentPlayer + 1} is out of lives.`);

      // Check if all players are out of lives
      const allOut = this.playerLives.every(lives => lives <= 0);
      if (allOut) {
        console.log("All players are out of lives. Game Over!");
        this.gameState = "gameOver";
        return;
      }
    }

    // Find the next player with lives left
    let nextPlayer = this.currentPlayer;
    do {
      nextPlayer = (nextPlayer + 1) % this.playerCount; // Cycle to the next player
    } while (this.playerLives[nextPlayer] <= 0);

    // Set the next player as the current player
    this.currentPlayer = nextPlayer;
    console.log(`Swapping to Player ${this.currentPlayer + 1}.`);
  }

  resetGame() {
    this.gameState = "attract";
    this.gameInitialized = false;
    this.enemyInitialized = false;
    this.backToAttractCounter = 0;
  }

}

export default Game;

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
