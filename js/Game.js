import Board from './Board.js';
import AudioManager from './AudioManager.js';
import UI from './UI.js';

export default class Game {
    constructor() {
        this.board = new Board();
        this.audio = new AudioManager();
        this.ui = new UI(this);

        this.currentPlayer = 1;
        this.player1Name = 'Joueur 1';
        this.player2Name = 'Joueur 2';
        this.scores = [0, 0];
        this.gameOver = false;
        this.statusText = 'Tour du joueur 1';
        this.statusColor = 'red';

        this.ui.resetButton.disabled = true;
        this.ui.drawBoard();
    }

    startGame() {
        this.player1Name = this.ui.player1Input.value.trim() || 'Joueur 1';
        this.player2Name = this.ui.player2Input.value.trim() || 'Joueur 2';
        this.scores = [0, 0];
        this.statusText = `Tour de ${this.player1Name}`;
        this.statusColor = 'red';
        this.ui.playerSetup.classList.add('hidden');
        this.ui.container.classList.remove('hidden');
        this.reset();
    }

    reset() {
        this.board.reset();
        this.currentPlayer = 1;
        this.gameOver = false;
        this.ui.hoverCol = null;
        this.ui.animating = false;
        this.statusText = `Tour de ${this.player1Name}`;
        this.statusColor = 'red';
        this.ui.resetButton.disabled = true;
        this.ui.drawBoard();
    }

    handleDrop(col) {
        if (this.gameOver || this.ui.animating) return;
        const row = this.board.dropPiece(col, this.currentPlayer);
        if (row === null) return;

        this.ui.hoverCol = null;
        this.ui.animating = true;
        this.ui.animateDrop(col, row, this.currentPlayer, () => {
            this.audio.playDropSound();
            const win = this.board.checkWin(row, col, this.currentPlayer);
            if (win) {
                this.gameOver = true;
                this.board.winningCells = win;
                this.ui.resetButton.disabled = false;
                this.audio.playWinSound();
                const winnerName = this.currentPlayer === 1 ? this.player1Name : this.player2Name;
                this.statusText = `${winnerName} a gagné !`;
                this.statusColor = this.currentPlayer === 1 ? 'red' : 'yellow';
                this.scores[this.currentPlayer - 1]++;
            } else if (this.board.board.every(r => r.every(c => c !== 0))) {
                this.gameOver = true;
                this.ui.resetButton.disabled = false;
                this.audio.playDrawSound();
                this.statusText = 'Match nul !';
                this.statusColor = 'green';
            } else {
                this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                this.ui.hoverCol = this.board.board[0][col] === 0 ? col : null;
                const currentName = this.currentPlayer === 1 ? this.player1Name : this.player2Name;
                this.statusText = `Tour de ${currentName}`;
                this.statusColor = this.currentPlayer === 1 ? 'red' : 'yellow';
            }
            this.ui.animating = false;
            this.ui.drawBoard();
        });
    }
}
