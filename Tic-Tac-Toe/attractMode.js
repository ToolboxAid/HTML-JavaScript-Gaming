// ToolboxAid.com
// David Quesenberry
// AttractMode.js
// 11/14/2024

export default class AttractMode {
    constructor(board) {
        this.board = board;
        this.currentPlayer = 'X';
        this.moveInterval = 1; // Time between moves in milliseconds
        this.elapsedTime = 0;
        this.maxMoves = 9;
        this.movesMade = 0;
    }

    update(deltaTime) {
        this.elapsedTime += deltaTime;

        if (this.elapsedTime >= this.moveInterval && this.movesMade < this.maxMoves) {
            this.makeRandomMove();
            this.elapsedTime = 0;
            this.movesMade++;
        }
        // If maximum moves have been reached, reset the board
        if (this.elapsedTime >= this.moveInterval && this.movesMade >= this.maxMoves) {
            this.reset();
        }
    }

    makeRandomMove() {
        // Find all empty cells
        const emptyCells = this.board
            .map((value, index) => (value === null ? index : null))
            .filter((value) => value !== null);

        // If there are no empty cells left, do nothing
        if (emptyCells.length === 0) return;

        // Select a random empty cell
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const cellIndex = emptyCells[randomIndex];

        // Place X or O based on the current player
        this.board[cellIndex] = this.currentPlayer;

        // Switch players
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    reset() {
        // Clear the board
        for (let i = 0; i < this.board.length; i++) {
            this.board[i] = null;
        }

        // Reset player to 'X'
        this.currentPlayer = 'X';

        this.moveInterval = 1; // Time between moves in milliseconds

        // Reset elapsed time, moves made, and max moves
        this.elapsedTime = 0;
        this.movesMade = 0;
    }
}
