// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js - Template Game Engine

import { canvasConfig, performanceConfig, fullscreenConfig, playerSelect } from './global.js';
import GameBase from '../scripts/gamebase.js';

import CanvasUtils from '../scripts/canvas.js';
import GameUtils from '../scripts/game/gameUtils.js';

import KeyboardInput from '../scripts/input/keyboard.js';
import Frog from './frog.js';

import AttractMode from './attractMode.js';
import Level from './level.js';

class Game extends GameBase {

  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
    this.frog = new Frog(
      CanvasUtils.getConfigWidth() / 2,    // Center X
      CanvasUtils.getCanvasHeight() - 48,  // Bottom Y
      './assets/images/frog_sprite_60w_70h_3f.png',  // Sprite path
      4                                    // Pixel size
  );

    this.attractMode = new AttractMode();
  //this.level = new Level();
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

  // Display 
  displayAttractMode() {
    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    CanvasUtils.ctx.fillText("Welcome to Frogger!", 250, 200);
    CanvasUtils.ctx.fillText("Press `Enter` to Start", 250, 300);

    if (this.keyboardInput.getkeysPressed().includes('Enter') ||
      this.keyboardInput.getkeysPressed().includes('NumpadEnter')) {
      this.gameState = "playerSelect";
    }

    this.attractMode.update();
    this.attractMode.draw(CanvasUtils.ctx);
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

  playGame1() {
    this.gamePauseCheck();

    // Display current player status
    const playerInfo = `OLD - Player ${this.currentPlayer + 1} - Lives: ${this.playerLives[this.currentPlayer]} - Score: ${this.score[this.currentPlayer]}`;
    CanvasUtils.drawText(100, 200, playerInfo, 3.5, "white");
    CanvasUtils.drawText(100, 250, "Press `D` for player death", 3.5, "white");
    CanvasUtils.drawText(100, 300, "Press `S` for score", 3.5, "white");
    CanvasUtils.drawText(100, 350, "Press `P` to pause game", 3.5, "white");

    if (this.keyboardInput.getkeysPressed().includes('KeyS')) {
      this.score[this.currentPlayer] += 100;
      console.log("score", this.score[this.currentPlayer]);
    }

    // // Check if `D` key was just pressed, simulate losing a life
    // if (this.keyboardInput.getkeysPressed().includes('KeyD')) {
    //   const result = GameUtils.swapPlayer(
    //     this.playerLives,
    //     this.currentPlayer,
    //     this.playerCount,
    //     (newState) => { this.gameState = newState; }
    //   );

    //   // Update the current player and 
    //   //                                                       lives based on the result from swapPlayer
    //   this.currentPlayer = result.updatedPlayer;
    //   this.playerLives = result.updatedLives;
    // }
  }

  playGame(deltaTime) {
    this.gamePauseCheck();

    // Draw game info
    const playerInfo = `New Player ${this.currentPlayer + 1} - Lives: ${this.playerLives[this.currentPlayer]} - Score: ${this.score[this.currentPlayer]}`;
    CanvasUtils.drawText(10, 20, playerInfo, 2, "white");


    // Update and draw frog
    if (this.frog) {
        // Handle keyboard input for frog movement
        if (this.keyboardInput.getkeysPressed().includes('ArrowUp')) {
            this.frog.move('up');
        } else if (this.keyboardInput.getkeysPressed().includes('ArrowDown')) {
            this.frog.move('down');
        } else if (this.keyboardInput.getkeysPressed().includes('ArrowLeft')) {
            this.frog.move('left');
        } else if (this.keyboardInput.getkeysPressed().includes('ArrowRight')) {
            this.frog.move('right');
        }

        // Update frog state
        this.frog.update(deltaTime);

        // Draw frog
        this.frog.draw();

        // Check for frog death (temporary for testing)
        if (this.keyboardInput.getkeysPressed().includes('KeyD')) {
            this.frog.loseLife();
            if (!this.frog.isAlive()) {
                const result = GameUtils.swapPlayer(
                    this.playerLives,
                    this.currentPlayer,
                    this.playerCount,
                    (newState) => { this.gameState = newState; }
                );
                this.currentPlayer = result.updatedPlayer;
                this.playerLives = result.updatedLives;
            }
        }
    }
}

  resetGame() {
    if (this.frog) {
      this.frog.destroy();
      this.frog = null;
  }

    this.gameState = "attract";
    this.gameInitialized = false;
    this.enemyInitialized = false;
    this.backToAttractCounter = 0;
  }

}

export default Game;

const game = new Game();
