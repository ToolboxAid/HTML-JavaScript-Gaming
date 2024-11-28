// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// game.js - asteroids

import { canvasConfig, playerSelect} from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';
import KeyboardInput from '../scripts/keyboard.js';
import Functions from '../scripts/functions.js'

import Ship from './ship.js';

import GameAttract from './gameAttract.js';

class Game {

  static gameAttract = null;

  constructor() {
    this.keyboardInput = new KeyboardInput();

    this.ships = [];

    this.currentPlayer = 0;
    this.playerLives = null; // Player 1 - Player 4 lives
    this.score = null; // Player 1 - Player 4 scores

    // Game State Variables
    this.gameState = "initAttract";

    this.backToAttract = 180;
    this.backToAttractCounter = 0;
  }

  gameLoop(deltaTime) {

    console.log(this.gameState);

    this.keyboardInput.update();

    switch (this.gameState) {
      case "initAttract":
        Game.gameAttract = new GameAttract();
        this.gameState = "attract";
        break;

      case "attract":
        this.displayGameAttract(deltaTime);
        break;

      case "playerSelect":
        this.displayPlayerSelect(deltaTime);
        break;

      case "initGame":
        this.initializeGame();
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

  displayGameAttract(deltaTime) {
    Game.gameAttract.update(deltaTime);
    Game.gameAttract.draw();

    if (this.keyboardInput.getkeysPressed().includes('Enter')) {
      this.gameState = "playerSelect";
    }
  }

  displayPlayerSelect(deltaTime) {
    Game.gameAttract.update(deltaTime);
    Game.gameAttract.draw(false);    
    const result = Functions.selectNumberOfPlayers(CanvasUtils.ctx, canvasConfig, playerSelect, this.keyboardInput);
    if (result) {
        this.playerCount = result.playerCount;
        this.playerLives = result.playerLives;
        this.gameState = "initGame";
    }  
  }

  initializeGame() {
    for (let i = 0; i <= 3; i++) {
      this.ships[i] = new Ship();
    }

    this.score = [0, 0, 0, 0]; // Reset score
    this.currentPlayer = 0;

    this.gameState = "playGame";
  }

  drawLivesScores() {
    // Display scores and lives
    CanvasUtils.drawText(20, 220, `Lives: ${this.playerLives}`, 2, "white");
    CanvasUtils.drawText(20, 250, `Score: ${this.score}`, 2, "white");
  }

  playGame(deltaTime) {
    this.gamePauseCheck();

    this.ships[this.currentPlayer].update(deltaTime, this.keyboardInput);
    this.score[this.currentPlayer] += this.ships[this.currentPlayer].getValue();

    if (this.ships[this.currentPlayer].isDead()) {
      this.ships[this.currentPlayer].setIsAlive();
const result = Functions.swapPlayer(
  this.playerLives,
  this.currentPlayer,
  this.playerCount,
  (newState) => { this.gameState = newState; }
);

// Update the current player and 
// lives based on the result from swapPlayer
this.currentPlayer = result.updatedPlayer;
this.playerLives = result.updatedLives;
      this.ships[this.currentPlayer].reset();
    }
    this.ships[this.currentPlayer].draw();

    this.drawLivesScores();
  }

  pauseGame() {
    this.gamePauseCheck();
    CanvasUtils.drawText(150, 200, "Game Paused.", 3.5, "white");
    CanvasUtils.drawText(150, 250, "Press `P` to unpause game", 3.5, "white");
  }

  gamePauseCheck() {
    this.ships[this.currentPlayer].draw();

    if (this.keyboardInput.getkeysPressed().includes('KeyP')) {
      this.gameState = this.gameState === "playGame" ? "pauseGame" : "playGame";
    }
  }

  pauseGame() {
    this.gamePauseCheck();
    CanvasUtils.drawText(150, 200, "Game Paused.", 3.5, "white");
    CanvasUtils.drawText(150, 250, "Press `P` to unpause game", 3.5, "white");
  }

  gamePauseCheck() {
    this.ships[this.currentPlayer].draw();

    if (this.keyboardInput.getkeysPressed().includes('KeyP')) {
      this.gameState = this.gameState === "playGame" ? "pauseGame" : "playGame";
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

  resetGame() {
    this.gameState = "initAttract";
    this.backToAttractCounter = 0;
  }
}

export default Game;

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
