// ToolboxAid.com
// David Quesenberry

// 10/16/2024
// game.js - Template Game Engine

import { canvasConfig } from './global.js'; // Import canvasConfig for canvas-related configurations
import CanvasUtils from '../scripts/canvas.js'; // Required for dynamic canvas operations, used in animate()
import Fullscreen from '../scripts/fullscreen.js'; // Required for fullscreen control, used elsewhere

import KeyboardInput from '../scripts/keyboard.js';

class Game {

    constructor(){
     this.keyboardInput = new KeyboardInput();

    // Game State Variables
    this.gameState = "attract"; // Possible states: attract, playerSelect, initGame, initEnemy, playGame, gameOver
    this.playerCount = 1;
    this.currentPlayer = 1;
    this.playerLives = [3, 3]; // Player 1 and Player 2 lives
    this.score = [0, 0]; // Player 1 and Player 2 scores
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

    if (this.keyboardInput.getkeysPressed().includes('Digit1')) {
      this.playerCount = 1;
      this.gameState = "initGame";
      console.log("Players: 1");
    } else if (this.keyboardInput.getkeysPressed().includes('Digit2')) {
      this.playerCount = 2;
      this.gameState = "initGame";
      console.log("Players: 2");
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
    this.playerLives = [3, 3]; // Reset lives
    this.score = [0, 0]; // Reset score
    this.currentPlayer = 1;

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
    CanvasUtils.drawText( 150, 200, "Game Paused.", 3.5, "white");
    CanvasUtils.drawText( 150, 250, "Press `P` to unpause game", 3.5, "white");
  }

  playGame() {
    this.gamePauseCheck();
    
    // Display current player status
    const playerInfo = `Player ${this.currentPlayer} - Lives: ${this.playerLives[this.currentPlayer - 1]} - Score: ${this.score[this.currentPlayer - 1]}`;
    CanvasUtils.drawText( 100, 200, playerInfo, 3.5, "white");
    CanvasUtils.drawText( 100, 250, "Press `D` for player death", 3.5, "white");
    CanvasUtils.drawText( 100, 300, "Press `S` for score", 3.5, "white");
    CanvasUtils.drawText( 100, 350, "Press `P` to pause game", 3.5, "white");

    if (this.keyboardInput.getkeysPressed().includes('KeyS')) {
        this.score[this.currentPlayer - 1] += 100;
        console.log("score");
    }

    // Check if `D`` key was just pressed, simulate losing a life
    if (this.keyboardInput.getkeysPressed().includes('KeyD')) {
      this.swapPlayer();
    }
}

swapPlayer(){
  this.playerLives[this.currentPlayer - 1] -= 1; // Decrease current player's life
  console.log(`Player ${this.currentPlayer} lost a life!`);

  // Check if current player is out of lives
  if (this.playerLives[this.currentPlayer - 1] <= 0) {
      console.log(`Player ${this.currentPlayer} is out of lives.`);

      // If only one player (single-player mode)
      if (this.playerCount === 1) {
          // End game if the single player is out of lives
          console.log("Player 1 is out of lives. Game Over!");
          this.gameState = "gameOver";
          return;
      }

      // If two players (multiplayer mode), check if both are out of lives
      if (this.playerCount === 2) {
          if (this.playerLives[0] <= 0 && this.playerLives[1] <= 0) {
              console.log("Both players are out of lives. Game Over!");
              this.gameState = "gameOver";
              return;
          }

          // Swap to the other player if the current one is out of lives
          this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
          console.log(`Swapping to Player ${this.currentPlayer}.`);
      }
  } else {
      // If current player still has lives left, swap only in two-player mode
      if (this.playerCount === 2) {
          this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
          console.log(`Swapping to Player ${this.currentPlayer}.`);
      }
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

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
