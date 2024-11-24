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
    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Select Player Mode", 250, 300);
    CanvasUtils.ctx.fillText("Press `1` for Single Player", 250, 350);
    CanvasUtils.ctx.fillText("Press `2` for Two Players", 250, 400);
    CanvasUtils.ctx.fillText("Press `3` for Three Players", 250, 450);
    CanvasUtils.ctx.fillText("Press `4` for Four Players", 250, 500);

    Game.gameAttract.update(deltaTime);
    Game.gameAttract.draw(false);
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

  initializeGame() {
    for (let i = 0; i <= 3; i++) {
      this.ships[i] = new Ship();
      this.ships[i].init();
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

    const asteroidValue = this.ships[this.currentPlayer].update(deltaTime, this.keyboardInput);
    this.score[this.currentPlayer] += asteroidValue;
    this.ships[this.currentPlayer].draw();

    this.drawLivesScores();

    // Check if `D`` key was just pressed, simulate losing a life
    if (this.keyboardInput.getkeysPressed().includes('KeyD')) {
      this.swapPlayer();
      this.ships[this.currentPlayer].reset();
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
