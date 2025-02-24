// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// game.js - asteroids

import { canvasConfig, performanceConfig, fullscreenConfig, playerSelect } from './global.js';
import GameBase from '../scripts/gamebase.js';

import CanvasUtils from '../scripts/canvas.js';
import KeyboardInput from '../scripts/input/keyboard.js';
import GameUtils from '../scripts/game/gameUtils.js';

import Ship from './ship.js';

import GameAttract from './gameAttract.js';

class Game extends GameBase {

  static gameAttract = null;

  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
  }

  async onInitialize() {

    console.log("onInit");
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

    console.log(`this.gameState: '${this.gameState}'`);

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
        this.initGame();
        break;

      case "flashScore":
        this.flashScore(deltaTime);
        break;
        
      case "safeSpawn":
        this.safeSpawn(deltaTime);
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
    const result = GameUtils.selectNumberOfPlayers(CanvasUtils.ctx, canvasConfig, playerSelect, this.keyboardInput);
    if (result) {
      this.playerCount = result.playerCount;
      this.playerLives = result.playerLives;
      this.gameState = "initGame";
    }
  }

  initGame() {
    for (let i = 0; i <= 3; i++) {
      this.ships[i] = new Ship();
    }

    this.score = [0, 0, 0, 0]; // Reset score
    this.currentPlayer = 0;

    //this.gameState = "playGame";
    this.gameState = "flashScore";
  }

  flashScore(){
    this.gameState = "safeSpawn";
  }


  safeSpawn(deltaTime) {
    const safe = this.ships[this.currentPlayer].safeSpawn(deltaTime);
    if (safe) {
      this.gameState = "playGame";
    }
    this.ships[this.currentPlayer].safeDraw();

    this.drawLivesScores();

    console.log("============================safeSpawn");
  }

  drawLivesScores() {
    // Display scores and lives
    CanvasUtils.drawText(20, 220, `Lives: ${this.playerLives}`, 2, "white");
    CanvasUtils.drawText(20, 250, `Score: ${this.score}`, 2, "white");
  }

  playGame(deltaTime) {
    this.gamePauseCheck();

    this.ships[this.currentPlayer].update(deltaTime, this.keyboardInput);
    //TODO: fix score
    //this.score[this.currentPlayer] += this.ships[this.currentPlayer].getValue();

    if (this.ships[this.currentPlayer].isDead()) {
      this.ships[this.currentPlayer].setIsAlive();
      console.log("----------pre", this.gameState);
      const result = GameUtils.swapPlayer(
        this.playerLives,
        this.currentPlayer,
        this.playerCount,
        (newState) => { this.gameState = newState; }
      );
      if (this.gameState === "playGame") {
        this.gameState = "flashScore";
      }
      console.log("----------post", this.gameState, result);
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

const game = new Game();
