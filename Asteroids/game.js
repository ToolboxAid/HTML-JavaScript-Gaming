// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// game.js - asteroids

import { canvasConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';
import KeyboardInput from '../scripts/keyboard.js';
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
    const maxPlayers = 4;
    const lives = 3;

    Game.gameAttract.update(deltaTime);
    Game.gameAttract.draw(false);

    const optionBaseY = 350;
    const optionSpacing = 50;
    for (let i = 1; i <= maxPlayers; i++) {
      CanvasUtils.ctx.fillText(`Press \`${i}\` for ${i} Player${i > 1 ? "s" : ""}`,
        canvasConfig.width / 2 - 200, optionBaseY + (i - 1) * optionSpacing);
    }

    // Loop through potential player counts
    for (let i = 1; i <= maxPlayers; i++) {
      if (this.keyboardInput.getkeysPressed().includes(`Digit${i}`)) {
        this.playerCount = i;
        this.playerLives = Array.from({ length: maxPlayers }, (_, index) => (index < i ? lives : 0)); // Assign lives dynamically
        this.gameState = "initGame";
        console.log(`Players: ${i}`);
        break; // Exit the loop once the matching key is found
      }
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

    this.ships[this.currentPlayer].update(deltaTime, this.keyboardInput);
    this.score[this.currentPlayer] += this.ships[this.currentPlayer].getValue();
    if (this.ships[this.currentPlayer].isDead()) {
      this.ships[this.currentPlayer].setIsAlive();
      this.swapPlayer();
      this.ships[this.currentPlayer].reset();
    }
    this.ships[this.currentPlayer].draw();

    this.drawLivesScores();
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
