export default class Board {
    constructor(rows = 6, cols = 7) {
        this.ROWS = rows;
        this.COLS = cols;
        this.reset();
    }

    reset() {
        this.board = Array(this.ROWS)
            .fill()
            .map(() => Array(this.COLS).fill(0));
        this.lastMoves = [null, null];
        this.winningCells = [];
    }

    dropPiece(col, player) {
        for (let row = this.ROWS - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                this.board[row][col] = player;
                this.lastMoves[player - 1] = [row, col];
                return row;
            }
        }
        return null;
    }

    checkWin(row, col, player) {
        const directions = [
            [[0, 1], [0, -1]],
            [[1, 0], [-1, 0]],
            [[1, 1], [-1, -1]],
            [[1, -1], [-1, 1]],
        ];

        for (const direction of directions) {
            const cells = [[row, col]];
            for (const [dx, dy] of direction) {
                let r = row + dx;
                let c = col + dy;
                while (
                    r >= 0 &&
                    r < this.ROWS &&
                    c >= 0 &&
                    c < this.COLS &&
                    this.board[r][c] === player
                ) {
                    cells.push([r, c]);
                    r += dx;
                    c += dy;
                }
            }
            if (cells.length >= 4) return cells;
        }
        return null;
    }
}
