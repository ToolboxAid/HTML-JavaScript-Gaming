// Board.js
class Board {
    constructor() {
        this.grid = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
    }

    // Check if a move is valid
    isValidMove(row, col) {
        return this.grid[row][col] === null;
    }

    // Make a move on the board
    makeMove(row, col, symbol) {
        if (this.isValidMove(row, col)) {
            this.grid[row][col] = symbol;
            return true;
        }
        return false;
    }

    // Check for a win
    checkWin(symbol) {
        // Check rows, columns, and diagonals
        for (let i = 0; i < 3; i++) {
            if (this.grid[i][0] === symbol && this.grid[i][1] === symbol && this.grid[i][2] === symbol) return true;
            if (this.grid[0][i] === symbol && this.grid[1][i] === symbol && this.grid[2][i] === symbol) return true;
        }
        if (this.grid[0][0] === symbol && this.grid[1][1] === symbol && this.grid[2][2] === symbol) return true;
        if (this.grid[0][2] === symbol && this.grid[1][1] === symbol && this.grid[2][0] === symbol) return true;

        return false;
    }

    // Check for a draw
    checkDraw() {
        for (let row of this.grid) {
            for (let cell of row) {
                if (cell === null) return false;
            }
        }
        return true;
    }

    // Reset the board
    reset() {
        this.grid = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
    }
}

export default Board;
