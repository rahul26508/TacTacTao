class TacTacTao {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0 };
        this.gameMode = 'human'; // 'human' or 'computer'
        this.winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        this.initializeGame();
    }

    initializeGame() {
        this.playerSelection = document.getElementById('playerSelection');
        this.gameScreen = document.getElementById('gameScreen');
        this.cells = document.querySelectorAll('.cell');
        this.statusDisplay = document.getElementById('status');
        this.resetBtn = document.getElementById('resetBtn');
        this.resetScoreBtn = document.getElementById('resetScoreBtn');
        this.changeModeBtn = document.getElementById('changeModeBtn');
        this.playerOText = document.getElementById('playerOText');
        this.winAnimation = document.getElementById('winAnimation');
        
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.resetScoreBtn.addEventListener('click', () => this.resetScore());
        this.changeModeBtn.addEventListener('click', () => this.changeMode());
        
        // Initialize sound effects
        this.soundEffects = new SoundEffects();
    }

    selectMode(mode) {
        this.gameMode = mode;
        this.playerSelection.style.display = 'none';
        this.gameScreen.style.display = 'block';
        
        if (mode === 'computer') {
            this.playerOText.textContent = 'Computer O';
        } else {
            this.playerOText.textContent = 'Player O';
        }
        
        this.resetGame();
    }

    changeMode() {
        this.gameScreen.style.display = 'none';
        this.playerSelection.style.display = 'flex';
        this.resetScore();
    }

    handleCellClick(index) {
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }

        this.makeMove(index);
        
        // If playing against computer and it's computer's turn
        if (this.gameMode === 'computer' && this.gameActive && this.currentPlayer === 'O') {
            setTimeout(() => this.makeComputerMove(), 800);
        }
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.animateMove(index);
        this.soundEffects.playMoveSound();
        
        if (this.checkWinner()) {
            this.handleWin();
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            this.switchPlayer();
        }
    }

    makeComputerMove() {
        if (!this.gameActive) return;
        
        this.statusDisplay.innerHTML = 'Computer is thinking<span class="thinking">...</span>';
        
        setTimeout(() => {
            const bestMove = this.getBestMove();
            this.makeMove(bestMove);
        }, 1000);
    }

    getBestMove() {
        // Simple AI strategy: Try to win, block opponent, take center, take corners, take sides
        const opponent = 'X';
        
        // 1. Check if computer can win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // 2. Block opponent from winning
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = opponent;
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // 3. Take center if available
        if (this.board[4] === '') return 4;
        
        // 4. Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // 5. Take any available side
        const sides = [1, 3, 5, 7];
        const availableSides = sides.filter(i => this.board[i] === '');
        if (availableSides.length > 0) {
            return availableSides[Math.floor(Math.random() * availableSides.length)];
        }
        
        // 6. Take any available cell
        const availableCells = this.board.map((cell, index) => cell === '' ? index : -1).filter(i => i !== -1);
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    animateMove(index) {
        const cell = this.cells[index];
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        cell.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    checkWinner() {
        return this.winningCombos.some(combo => {
            const [a, b, c] = combo;
            return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    handleWin() {
        this.gameActive = false;
        this.scores[this.currentPlayer]++;
        this.updateScore();
        
        const winningCombo = this.winningCombos.find(combo => {
            const [a, b, c] = combo;
            return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
        });

        this.highlightWinningCells(winningCombo);
        this.showWinAnimation();
        this.soundEffects.playWinSound();
        
        setTimeout(() => {
            if (this.gameMode === 'computer' && this.currentPlayer === 'O') {
                this.statusDisplay.textContent = 'Computer Wins! 🤖';
            } else {
                this.statusDisplay.textContent = `Player ${this.currentPlayer} Wins! 🎉`;
            }
        }, 500);
    }

    handleDraw() {
        this.gameActive = false;
        this.statusDisplay.textContent = "It's a Draw! 🤝";
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }

    highlightWinningCells(combo) {
        combo.forEach(index => {
            this.cells[index].classList.add('winning');
        });
    }

    showWinAnimation() {
        this.winAnimation.style.display = 'block';
        
        // Create additional confetti
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = this.getRandomColor();
            this.winAnimation.appendChild(confetti);
        }

        setTimeout(() => {
            this.winAnimation.style.display = 'none';
            this.winAnimation.innerHTML = `
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
            `;
        }, 3000);
    }

    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#ffd700', '#9b59b6', '#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateDisplay() {
        if (this.gameMode === 'computer' && this.currentPlayer === 'O' && this.gameActive) {
            this.statusDisplay.innerHTML = 'Computer is thinking<span class="thinking">...</span>';
        } else {
            this.statusDisplay.textContent = `Player ${this.currentPlayer}'s Turn`;
        }
    }

    updateScore() {
        document.getElementById('scoreX').textContent = this.scores.X;
        document.getElementById('scoreO').textContent = this.scores.O;
    }

    resetGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning');
        });
        
        this.updateDisplay();
    }

    resetScore() {
        this.scores = { X: 0, O: 0 };
        this.updateScore();
        this.resetGame();
    }
}

// Sound Effects Class
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playSound(frequency, duration) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playMoveSound() {
        this.playSound(800, 0.1);
    }

    playWinSound() {
        this.playSound(1000, 0.3);
        setTimeout(() => this.playSound(1200, 0.3), 100);
        setTimeout(() => this.playSound(1500, 0.3), 200);
    }
}

// Add ripple effect styles
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the game when the page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new TacTacTao();
});

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        document.getElementById('resetBtn').click();
    }
});

// Add touch support for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = Math.abs(touchEndX - touchStartX);
    const deltaY = Math.abs(touchEndY - touchStartY);
    
    if (deltaX < 10 && deltaY < 10) {
        // It's a tap
        const cell = e.target.closest('.cell');
        if (cell) {
            cell.click();
        }
    }
});
