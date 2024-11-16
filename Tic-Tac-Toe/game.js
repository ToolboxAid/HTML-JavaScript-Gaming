// ToolboxAid.com
// David Quesenberry
// game.js
// 11/14/2024

import { canvasConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';
import KeyboardInput from '../scripts/keyboard.js';
import AttractMode from './attractMode.js';

class Game {

  constructor(canvas, ctx) {
    this.ctx = ctx;
    this.canvas = canvas;

    // Canvas needs to know the current directory to game.js for dynamic imports
    const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    window.canvasPath = currentDir;

    this.keyboardInput = new KeyboardInput();
    this.gameState = "attract";
    this.playerCount = 1;
    this.currentPlayer = 1;
    this.board = Array(9).fill(null); // Representing 3x3 grid with 9 cells
    this.winner = null;
    this.movesMade = 0;
    this.gameInitialized = false;
    this.backToAttract = 600;
    this.backToAttractCounter = 0;

    // Initialize Attract Mode
    this.attractMode = new AttractMode(this.board);
  }

  gameLoop(deltaTime) {
    this.keyboardInput.update();
    switch (this.gameState) {
      case "attract":
        this.displayAttractMode(deltaTime);
        break;
      case "initGame":
        if (!this.gameInitialized) {
          this.initializeGame();
        }
        break;
      case "playGame":
        this.playGame();
        break;
      case "gameOver":
        this.displayGameOver();
        break;
    }
  }

  displayAttractMode(deltaTime) {
    this.drawGrid();
    this.drawBoard();

    // Run AttractMode to randomly place X and O
    this.attractMode.update(deltaTime);

    // Display attract text
    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";
    const gridSize = canvasConfig.width / 3;
    CanvasUtils.ctx.fillText("Welcome to Tic-Tac-Toe", 150, gridSize - 10);
    CanvasUtils.ctx.fillText("Press `Enter` to Start", 150, gridSize * 2 - 10);

    if (this.keyboardInput.getKeyJustPressed().includes('Enter')) {
      this.resetGame();
      this.gameState = "initGame";
    }
  }

  initializeGame() {
    // Clear the board
    for (let i = 0; i < this.board.length; i++) {
      this.board[i] = null;
    }
    this.currentPlayer = 1;
    this.winner = null;
    this.movesMade = 0;
    this.gameInitialized = true;
    this.gameState = "playGame";
  }

  drawGrid() {
    const lineWidth = 3;
    const gridSize = canvasConfig.width / 3;

    for (let i = 1; i < 3; i++) {
      // Vertical
      const start1 = { x: i * gridSize, y: 0 };
      const end1 = { x: i * gridSize, y: canvasConfig.height };
      CanvasUtils.drawLineFromPoints(start1, end1, lineWidth, "green");

      // Horizontal
      const start2 = { x: 0, y: i * gridSize };
      const end2 = { x: canvasConfig.width, y: i * gridSize };
      CanvasUtils.drawLineFromPoints(start2, end2, lineWidth, "green");
    }

    // Draw numbers in each cell for player assistance

    for (let i = 0; i < 9; i++) {
      const x = (i % 3) * gridSize + 10;
      const y = Math.floor(i / 3) * gridSize + gridSize / 4;
      CanvasUtils.drawText(x, y - 40, (i + 1).toString(), 4, 'white')
    }
  }

  drawBoard() {
    const gridSize = canvasConfig.width / 3;
    CanvasUtils.ctx.font = "50px Arial";

    for (let i = 0; i < 9; i++) {
      const x = (i % 3) * gridSize + 45;
      const y = Math.floor(i / 3) * gridSize + 40;
      if (this.board[i] === "X") {
        CanvasUtils.drawText(x, y, "X", 22, "red");
      } else if (this.board[i] === "O") {
        CanvasUtils.drawText(x, y, "O", 22, "blue");
      }
    }
  }

  playGame() {
    this.drawGrid();
    this.drawBoard();

    const keyPressed = this.keyboardInput.getKeyJustPressed();
    for (let i = 1; i <= 9; i++) {
      if (keyPressed.includes(`Digit${i}`) && !this.board[i - 1] && !this.winner) {
        this.board[i - 1] = this.currentPlayer === 1 ? "X" : "O";
        this.movesMade++;
        this.checkWinner();
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
      }
    }

    if (this.winner) {
      this.gameState = "gameOver";
    } else if (this.movesMade === 9) {
      this.winner = "Draw";
      this.gameState = "gameOver";
    }
  }

  checkWinner() {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    winPatterns.forEach(pattern => {
      const [a, b, c] = pattern;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.winner = this.board[a];
      }
    });
  }

  displayGameOver() {
    this.drawGrid();
    this.drawBoard();

    CanvasUtils.ctx.fillStyle = "white";
    CanvasUtils.ctx.font = "30px Arial";

    if (this.winner === "Draw") {
      CanvasUtils.ctx.fillText("It's a Draw!", 225, 200);
    } else {
      const winner = this.winner;
      CanvasUtils.ctx.fillText("Player `"+ winner +"` Wins!", 200, 200);
    }

    CanvasUtils.ctx.fillText("Press `Enter` to Restart", 150, 400);
    if (this.keyboardInput.getKeyJustPressed().includes('Enter')) {
      this.resetGame();
    }
  }

  resetGame() {
    this.gameInitialized = false;
    this.winner = null;
    this.gameState = "attract";
    this.attractMode.reset();
  }

}

// Export the Game class
export default Game;

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
