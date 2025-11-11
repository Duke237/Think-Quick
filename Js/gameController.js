class GameController {
    constructor() {
        this.score = 0;
        this.streak = 0;
        this.timeLeft = 25;
        this.timer = null;
        this.updateUI();
    }

    async startGame() {
        try {
            const response = await fetch('/api/game/state');
            const gameState = await response.json();
            this.displayQuestion(gameState.question);
            this.startTimer();
        } catch (error) {
            console.error('Failed to start game:', error);
        }
    }

    displayQuestion(question) {
        document.getElementById('questionType').textContent = question.type;
        document.getElementById('questionText').textContent = question.question;
        this.updateUI();
    }

    startTimer() {
        this.timeLeft = 25;
        this.updateTimer();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.endRound();
            }
        }, 1000);
    }

    updateUI() {
        document.getElementById('points').textContent = this.score;
        document.getElementById('streak').textContent = `x${this.streak}`;
        document.getElementById('timer').textContent = `${this.timeLeft}s`;
    }

    updateTimer() {
        const timerEl = document.getElementById('timer');
        timerEl.textContent = `${this.timeLeft}s`;
        
        if (this.timeLeft <= 5) {
            timerEl.classList.add('warning');
        }
    }

    endRound() {
        clearInterval(this.timer);
        // Add end round logic
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
    window.gameController.startGame();
});