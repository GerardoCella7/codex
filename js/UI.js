export default class UI {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resetButton = document.getElementById('resetButton');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.container = document.querySelector('.container');
        this.playerSetup = document.getElementById('playerSetup');
        this.player1Input = document.getElementById('player1Input');
        this.player2Input = document.getElementById('player2Input');
        this.startButton = document.getElementById('startButton');

        this.CELL_SIZE = 80;
        this.PADDING = 10;
        this.hoverCol = null;
        this.animating = false;

        this.calculateOffsets();
        this.addEvents();
    }

    addEvents() {
        this.canvas.addEventListener('click', e => this.handleClick(e));
        this.canvas.addEventListener('mousemove', e => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.hoverCol = null;
            this.drawBoard();
        });
        this.resetButton.addEventListener('click', () => this.game.reset());
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        this.startButton.addEventListener('click', () => this.game.startGame());
        this.container.classList.add('hidden');
    }

    calculateOffsets() {
        const boardWidth = this.game.board.COLS * this.CELL_SIZE + (this.game.board.COLS + 1) * this.PADDING;
        const boardHeight = this.game.board.ROWS * this.CELL_SIZE + (this.game.board.ROWS + 1) * this.PADDING;
        this.offsetX = (this.canvas.width - boardWidth) / 2;
        this.offsetY = (this.canvas.height - boardHeight) / 2;
    }

    getCellX(col) {
        return this.offsetX + this.PADDING + col * (this.CELL_SIZE + this.PADDING);
    }

    getCellY(row) {
        return this.offsetY + this.PADDING + row * (this.CELL_SIZE + this.PADDING);
    }

    drawStatus() {
        const boardHeight = this.game.board.ROWS * this.CELL_SIZE + (this.game.board.ROWS + 1) * this.PADDING;
        const y = this.offsetY + boardHeight + 40;
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.font = '40px Arial';
        this.ctx.shadowColor = 'white';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.fillStyle = this.game.statusColor;
        this.ctx.fillText(this.game.statusText, this.canvas.width / 2, y);
        this.ctx.restore();
    }

    drawScore() {
        this.ctx.save();
        this.ctx.font = '25px Arial';
        this.ctx.textBaseline = 'bottom';
        this.ctx.shadowColor = 'white';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = 'red';
        this.ctx.fillText(`${this.game.player1Name}: ${this.game.scores[0]}`, 20, this.canvas.height - 10);

        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillText(`${this.game.player2Name}: ${this.game.scores[1]}`, this.canvas.width - 20, this.canvas.height - 10);
        this.ctx.restore();
    }

    drawBoard() {
        const board = this.game.board.board;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let row = 0; row < this.game.board.ROWS; row++) {
            for (let col = 0; col < this.game.board.COLS; col++) {
                const x = this.getCellX(col);
                const y = this.getCellY(row);

                this.ctx.beginPath();
                this.ctx.arc(x + this.CELL_SIZE / 2, y + this.CELL_SIZE / 2, this.CELL_SIZE / 2 - 5, 0, Math.PI * 2);
                if (board[row][col] === 0) {
                    this.ctx.fillStyle = 'white';
                } else if (board[row][col] === 1) {
                    this.ctx.fillStyle = 'red';
                } else {
                    this.ctx.fillStyle = 'yellow';
                }
                this.ctx.fill();
                this.ctx.stroke();

                const isLastMove = (this.game.board.lastMoves[0] && this.game.board.lastMoves[0][0] === row && this.game.board.lastMoves[0][1] === col) ||
                    (this.game.board.lastMoves[1] && this.game.board.lastMoves[1][0] === row && this.game.board.lastMoves[1][1] === col);
                if (isLastMove) {
                    this.ctx.lineWidth = 5;
                    this.ctx.strokeStyle = 'black';
                    this.ctx.beginPath();
                    this.ctx.arc(x + this.CELL_SIZE / 2, y + this.CELL_SIZE / 2, this.CELL_SIZE / 2 - 3, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeStyle = 'black';
                }

                if (this.game.board.winningCells.some(([r, c]) => r === row && c === col)) {
                    this.ctx.lineWidth = 5;
                    this.ctx.strokeStyle = 'lime';
                    this.ctx.beginPath();
                    this.ctx.arc(x + this.CELL_SIZE / 2, y + this.CELL_SIZE / 2, this.CELL_SIZE / 2 - 3, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeStyle = 'black';
                }
            }
        }

        if (this.hoverCol !== null) {
            const x = this.getCellX(this.hoverCol) + this.CELL_SIZE / 2;
            const y = this.offsetY + this.PADDING - this.CELL_SIZE / 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.CELL_SIZE / 2 - 5, 0, Math.PI * 2);
            this.ctx.fillStyle = this.game.currentPlayer === 1 ? 'red' : 'yellow';
            this.ctx.fill();
            this.ctx.stroke();
        }

        this.drawStatus();
        this.drawScore();
    }

    handleClick(e) {
        if (this.game.gameOver || this.animating) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.offsetX - this.PADDING;
        const col = Math.floor(x / (this.CELL_SIZE + this.PADDING));
        const maxX = this.game.board.COLS * (this.CELL_SIZE + this.PADDING) - this.PADDING;
        if (x >= 0 && x <= maxX && col >= 0 && col < this.game.board.COLS) {
            this.game.handleDrop(col);
        }
    }

    handleMouseMove(e) {
        if (this.game.gameOver || this.animating) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.getCellX(0);
        const col = Math.floor(x / (this.CELL_SIZE + this.PADDING));
        const maxX = this.game.board.COLS * (this.CELL_SIZE + this.PADDING) - this.PADDING;
        if (
            x >= 0 &&
            x <= maxX &&
            col >= 0 &&
            col < this.game.board.COLS &&
            this.game.board.board[0][col] === 0
        ) {
            this.hoverCol = col;
        } else {
            this.hoverCol = null;
        }
        this.drawBoard();
    }

    animateDrop(col, targetRow, player, done) {
        let y = this.offsetY + this.PADDING - this.CELL_SIZE / 2;
        const finalY = this.getCellY(targetRow) + this.CELL_SIZE / 2;
        const x = this.getCellX(col) + this.CELL_SIZE / 2;
        const step = () => {
            this.drawBoard();
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.CELL_SIZE / 2 - 5, 0, Math.PI * 2);
            this.ctx.fillStyle = player === 1 ? 'red' : 'yellow';
            this.ctx.fill();
            this.ctx.stroke();
            if (y < finalY) {
                y += 20;
                if (y > finalY) y = finalY;
                requestAnimationFrame(step);
            } else {
                done();
            }
        };
        requestAnimationFrame(step);
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            this.darkModeToggle.textContent = '☀️';
            this.darkModeToggle.title = 'Mode clair';
        } else {
            this.darkModeToggle.textContent = '🌙';
            this.darkModeToggle.title = 'Mode sombre';
        }
    }
}
