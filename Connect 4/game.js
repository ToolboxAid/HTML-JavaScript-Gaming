
// ToolboxAid.com
// David Quesenberry
// Game.js - Connect 4 Implementation
// 11/15/2024

import { canvasConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import KeyboardInput from '../scripts/keyboard.js';

class Game {
  constructor() {

    // Canvas needs to know the current directory to game.js for dynamic imports
    const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    window.canvasPath = currentDir;

    this.keyboardInput = new KeyboardInput();

    // Game State Variables
    this.gameState = "attract"; // Possible states: attract, playerSelect, playGame, gameOver
    this.currentPlayer = 1; // Player 1 (Red) and Player 2 (Yellow)
    this.playerSymbols = ['R', 'Y']; // 'R' for Red, 'Y' for Yellow
    this.board = this.createBoard(); // 7 columns x 6 rows
    this.attractDropInterval = 60; // Frame count between drops in attract mode
    this.attractCounter = 0;
  }

  createBoard() {
    // 7 columns and 6 rows, filled with null initially
    return Array.from({ length: 7 }, () => Array(6).fill(null));
  }

  resetBoard() {
    this.board = this.createBoard();
  }

  gameLoop(deltaTime) {
    this.keyboardInput.update();
    switch (this.gameState) {
      case "attract":
        this.displayAttractMode();
        break;
      case "playerSelect":
        this.displayPlayerSelect();
        break;
      case "playGame":
        this.playGame();
        break;
      case "gameOver":
        this.displayGameOver();
        break;
    }
  }

  displayAttractMode() {
    CanvasUtils.drawText(200, 50, "Welcome to Connect 4!", 4, "white");
    CanvasUtils.drawText(200, 100, "Press Enter to Start", 3, "white");

    if (this.keyboardInput.getKeyJustPressed().includes('Enter')) {
      this.resetBoard();
      this.gameState = "playGame";
    } else {
      // Attract mode logic
      if (this.attractCounter++ >= this.attractDropInterval) {
        this.randomDropInAttractMode();
        this.attractCounter = 0;
      }
    }

    this.renderBoard();
  }

  randomDropInAttractMode() {
    const column = Math.floor(Math.random() * 7); // Random column from 0 to 6
    const symbol = this.playerSymbols[this.currentPlayer - 1];
    this.dropChip(column, symbol);
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1; // Alternate players
  }

  displayPlayerSelect() {
    
    CanvasUtils.drawText(200, 50, "Select Player Mode", 4, "white");
    CanvasUtils.drawText(200, 100, "Press Enter to Start", 3, "white");

    if (this.keyboardInput.getKeyJustPressed().includes('Enter')) {
      this.resetBoard();
      this.gameState = "playGame";
    }
  }

  playGame() {
    this.renderBoard();
    CanvasUtils.drawText(20, 20, `Player ${this.currentPlayer}'s Turn`, 3, "white");

    for (let i = 0; i < 7; i++) {
      if (this.keyboardInput.getKeyJustPressed().includes(`Digit${i + 1}`)) {
        const column = i;
        const symbol = this.playerSymbols[this.currentPlayer - 1];
        if (this.dropChip(column, symbol)) {
          if (this.checkWin(symbol)) {
            this.gameState = "gameOver";
          } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
          }
        }
      }
    }
  }

  dropChip(column, symbol) {
    for (let row = 5; row >= 0; row--) {
      if (!this.board[column][row]) {
        this.board[column][row] = symbol;
        return true;
      }
    }
    return false; // Column is full
  }

  checkWin(symbol) {
    // Check horizontal, vertical, diagonal
    return this.checkHorizontal(symbol) || this.checkVertical(symbol) || this.checkDiagonal(symbol);
  }

  checkHorizontal(symbol) {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.board[col][row] === symbol && this.board[col + 1][row] === symbol &&
          this.board[col + 2][row] === symbol && this.board[col + 3][row] === symbol) {
          return true;
        }
      }
    }
    return false;
  }

  checkVertical(symbol) {
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 3; row++) {
        if (this.board[col][row] === symbol && this.board[col][row + 1] === symbol &&
          this.board[col][row + 2] === symbol && this.board[col][row + 3] === symbol) {
          return true;
        }
      }
    }
    return false;
  }

  checkDiagonal(symbol) {
    // Check diagonals (both / and \)
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 3; row++) {
        if ((this.board[col][row] === symbol && this.board[col + 1][row + 1] === symbol &&
          this.board[col + 2][row + 2] === symbol && this.board[col + 3][row + 3] === symbol) ||
          (this.board[col][row + 3] === symbol && this.board[col + 1][row + 2] === symbol &&
            this.board[col + 2][row + 1] === symbol && this.board[col + 3][row] === symbol)) {
          return true;
        }
      }
    }
    return false;
  }

  renderBoard() {
    
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 6; row++) {
        const x = col * 100 + 50;
        const y = row * 100 + 50;
        const symbol = this.board[col][row];
        CanvasUtils.drawCircle(x, y, 40, symbol === 'R' ? "red" : symbol === 'Y' ? "yellow" : "black");
      }
    }
  }

  displayGameOver() {
    CanvasUtils.drawText(200, 200, "Game Over", 4, "red");
    CanvasUtils.drawText(200, 250, "Press Enter to Restart", 3, "white");

    if (this.keyboardInput.getKeyJustPressed().includes('Enter')) {
      this.resetBoard();
      this.gameState = "attract";
    }
  }
}

export default Game;

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
