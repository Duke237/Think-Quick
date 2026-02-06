const gameState = require('./GameState');

class TimerManager {
  constructor() {
    this.activeTimers = new Map(); // sessionId -> interval
  }

  /**
   * Start countdown timer
   */
  startTimer(sessionId, durationSeconds, onTick, onComplete) {
    // Clear existing timer if any
    this.stopTimer(sessionId);

    const session = gameState.getSession(sessionId);
    if (!session) return false;

    let timeRemaining = durationSeconds;
    gameState.updateTimer(sessionId, timeRemaining, true);

    const interval = setInterval(() => {
      timeRemaining--;
      gameState.updateTimer(sessionId, timeRemaining, true);

      // Call tick callback
      if (onTick) {
        onTick(timeRemaining);
      }

      // Timer finished
      if (timeRemaining <= 0) {
        this.stopTimer(sessionId);
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);

    this.activeTimers.set(sessionId, interval);
    console.log(`Timer started: ${durationSeconds}s for session ${sessionId}`);

    return true;
  }

  /**
   * Stop timer
   */
  stopTimer(sessionId) {
    const interval = this.activeTimers.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.activeTimers.delete(sessionId);
      
      const session = gameState.getSession(sessionId);
      if (session) {
        gameState.updateTimer(sessionId, session.timerRemaining, false);
      }

      console.log(`Timer stopped for session ${sessionId}`);
      return true;
    }
    return false;
  }

  /**
   * Reset timer
   */
  resetTimer(sessionId, durationSeconds = null) {
    this.stopTimer(sessionId);

    const session = gameState.getSession(sessionId);
    if (!session) return false;

    const duration = durationSeconds || session.settings.timerSeconds;
    gameState.updateTimer(sessionId, duration, false);

    console.log(`Timer reset to ${duration}s for session ${sessionId}`);
    return true;
  }

  /**
   * Pause timer
   */
  pauseTimer(sessionId) {
    return this.stopTimer(sessionId);
  }

  /**
   * Resume timer
   */
  resumeTimer(sessionId, onTick, onComplete) {
    const session = gameState.getSession(sessionId);
    if (!session) return false;

    return this.startTimer(sessionId, session.timerRemaining, onTick, onComplete);
  }

  /**
   * Get timer state
   */
  getTimerState(sessionId) {
    const session = gameState.getSession(sessionId);
    if (!session) return null;

    return {
      remaining: session.timerRemaining,
      active: session.timerActive,
      isRunning: this.activeTimers.has(sessionId)
    };
  }

  /**
   * Clean up timer for a specific session
   */
  cleanup(sessionId) {
    this.stopTimer(sessionId);
    console.log(`Timer cleaned up for session ${sessionId}`);
  }

  /**
   * Clean up all timers
   */
  cleanupAll() {
    this.activeTimers.forEach((interval, sessionId) => {
      clearInterval(interval);
      console.log(`Cleaned up timer for session ${sessionId}`);
    });
    this.activeTimers.clear();
    console.log('All timers cleaned up');
  }
}

// Singleton instance
const timerManager = new TimerManager();

module.exports = timerManager;