// Logique du jeu Puissance 4.
// Ce script gère l'affichage du plateau sur un canvas et les interactions utilisateur.

class Puissance4 {
    constructor() {
        // Références aux éléments de la page
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resetButton = document.getElementById('resetButton');
        this.statusDisplay = document.getElementById('status');
        this.darkModeToggle = document.getElementById('darkModeToggle');

        // Paramètres du plateau
        this.ROWS = 6;
        this.COLS = 7;
        this.CELL_SIZE = 80; // dimension d'une case
        this.PADDING = 10;   // espace entre les cases

        // État du jeu
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
        this.currentPlayer = 1;
        this.gameOver = false;
        this.hoverCol = null;

        // Calcul des décalages pour centrer la grille dans le canvas
        this.calculateOffsets();

        this.init();
    }

    // Calcule les marges pour centrer la grille
    calculateOffsets() {
        const boardWidth = this.COLS * this.CELL_SIZE + (this.COLS + 1) * this.PADDING;
        const boardHeight = this.ROWS * this.CELL_SIZE + (this.ROWS + 1) * this.PADDING;
        this.offsetX = (this.canvas.width - boardWidth) / 2;
        this.offsetY = (this.canvas.height - boardHeight) / 2;
    }

    // Initialise les écouteurs et dessine le plateau vide
    init() {
        this.drawBoard();
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => { this.hoverCol = null; this.drawBoard(); });
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    }

    // Dessine le plateau et les pions dans le canvas
    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                const x = this.offsetX + this.PADDING + col * (this.CELL_SIZE + this.PADDING);
                const y = this.offsetY + this.PADDING + row * (this.CELL_SIZE + this.PADDING);

                // Cercle représentant l'emplacement du pion
                this.ctx.beginPath();
                this.ctx.arc(
                    x + this.CELL_SIZE / 2,
                    y + this.CELL_SIZE / 2,
                    this.CELL_SIZE / 2 - 5,
                    0,
                    Math.PI * 2
                );

                // Couleur selon le joueur
                if (this.board[row][col] === 0) {
                    this.ctx.fillStyle = 'white';
                } else if (this.board[row][col] === 1) {
                    this.ctx.fillStyle = 'red';
                } else {
                    this.ctx.fillStyle = 'yellow';
                }

                this.ctx.fill();
                this.ctx.stroke();
            }
        }

        if (this.hoverCol !== null) {
            const x =
                this.offsetX +
                this.PADDING +
                this.hoverCol * (this.CELL_SIZE + this.PADDING) +
                this.CELL_SIZE / 2;
            const y = this.offsetY + this.PADDING - this.CELL_SIZE / 2;

            this.ctx.beginPath();
            this.ctx.arc(
                x,
                y,
                this.CELL_SIZE / 2 - 5,
                0,
                Math.PI * 2
            );
            this.ctx.fillStyle = this.currentPlayer === 1 ? 'red' : 'yellow';
            this.ctx.fill();
            this.ctx.stroke();
        }
    }

    // Gère le clic sur le plateau pour insérer un pion
    handleClick(e) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.offsetX - this.PADDING;
        const col = Math.floor(x / (this.CELL_SIZE + this.PADDING));
        const maxX = this.COLS * (this.CELL_SIZE + this.PADDING) - this.PADDING;

        if (x >= 0 && x <= maxX && col >= 0 && col < this.COLS) {
            this.dropPiece(col);
        }
    }

    // Affiche un pion temporaire lors du survol d'une colonne disponible
    handleMouseMove(e) {
        if (this.gameOver) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.offsetX - this.PADDING;
        const col = Math.floor(x / (this.CELL_SIZE + this.PADDING));
        const maxX = this.COLS * (this.CELL_SIZE + this.PADDING) - this.PADDING;

        if (
            x >= 0 &&
            x <= maxX &&
            col >= 0 &&
            col < this.COLS &&
            this.board[0][col] === 0
        ) {
            this.hoverCol = col;
        } else {
            this.hoverCol = null;
        }

        this.drawBoard();
    }

    // Place un pion dans la colonne choisie
    dropPiece(col) {
        for (let row = this.ROWS - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                this.board[row][col] = this.currentPlayer;

                if (this.checkWin(row, col)) {
                    this.gameOver = true;
                    this.hoverCol = null;
                    this.drawBoard();
                    this.statusDisplay.textContent = `Joueur ${this.currentPlayer} a gagné !`;
                } else {
                    // Passage au joueur suivant
                    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                    // Met à jour la position du jeton de survol : l’afficher
                    // seulement si la colonne n’est pas pleine après le coup.
                    this.hoverCol = this.board[0][col] === 0 ? col : null;
                    this.statusDisplay.textContent = `Tour du joueur ${this.currentPlayer}`;
                    this.drawBoard();
                }
                return;
            }
        }
    }

    // Vérifie si un joueur a gagné après le dernier coup joué
    checkWin(row, col) {
        const directions = [
            [[0, 1], [0, -1]], // horizontal
            [[1, 0], [-1, 0]], // vertical
            [[1, 1], [-1, -1]], // diagonale /
            [[1, -1], [-1, 1]] // diagonale \ 
        ];

        for (const direction of directions) {
            let count = 1;

            for (const [dx, dy] of direction) {
                let r = row + dx;
                let c = col + dy;

                while (
                    r >= 0 && r < this.ROWS &&
                    c >= 0 && c < this.COLS &&
                    this.board[r][c] === this.currentPlayer
                ) {
                    count++;
                    r += dx;
                    c += dy;
                }
            }

            if (count >= 4) return true;
        }

        return false;
    }

    // Réinitialise le plateau pour une nouvelle partie
    resetGame() {
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
        this.currentPlayer = 1;
        this.gameOver = false;
        this.hoverCol = null;
        this.statusDisplay.textContent = `Tour du joueur ${this.currentPlayer}`;
        this.drawBoard();
    }

    // Active ou désactive le mode sombre
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            this.darkModeToggle.textContent = 'Mode clair';
        } else {
            this.darkModeToggle.textContent = 'Mode sombre';
        }
    }
}

// Démarre le jeu une fois la page chargée
window.onload = () => {
    new Puissance4();
};
