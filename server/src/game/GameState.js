/**
 * In-memory game state manager
 * Manages active game sessions before they're persisted to DB
 */

class GameState {
  constructor() {
    this.activeSessions = new Map(); // sessionId -> session data
    this.playerSockets = new Map();  // socketId -> sessionId
    this.hostSockets = new Map();    // socketId -> sessionId
  }

  /**
   * Create a new game session
   */
  createSession(sessionId, hostSocketId, settings = {}) {
    const session = {
      sessionId,
      hostSocketId,
      players: [],
      rounds: [],
      currentRound: 0,
      teamAScore: 0,
      teamBScore: 0,
      status: 'waiting', // waiting, active, paused, completed
      gameMode: 'standard', // standard, fastMoney
      settings: {
        maxStrikes: settings.maxStrikes || 3,
        timerSeconds: settings.timerSeconds || 20,
        roundMultipliers: settings.roundMultipliers || [1, 2, 3]
      },
      currentQuestion: null,
      revealedAnswers: [],
      strikes: 0,
      activeTeam: 'A',
      timerActive: false,
      timerRemaining: settings.timerSeconds || 20,
      createdAt: new Date()
    };

    this.activeSessions.set(sessionId, session);
    this.hostSockets.set(hostSocketId, sessionId);

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get session by host socket
   */
  getSessionByHost(hostSocketId) {
    const sessionId = this.hostSockets.get(hostSocketId);
    return sessionId ? this.getSession(sessionId) : null;
  }

  /**
   * Get session by player socket
   */
  getSessionByPlayer(playerSocketId) {
    const sessionId = this.playerSockets.get(playerSocketId);
    return sessionId ? this.getSession(sessionId) : null;
  }

  /**
   * Add player to session
   */
  addPlayer(sessionId, player) {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const newPlayer = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: player.name,
      team: player.team,
      socketId: player.socketId,
      isActive: true,
      joinedAt: new Date()
    };

    session.players.push(newPlayer);
    this.playerSockets.set(player.socketId, sessionId);

    return newPlayer;
  }

  /**
   * Remove player from session
   */
  removePlayer(sessionId, socketId) {
    const session = this.getSession(sessionId);
    if (!session) return false;

    const playerIndex = session.players.findIndex(p => p.socketId === socketId);
    if (playerIndex > -1) {
      session.players.splice(playerIndex, 1);
      this.playerSockets.delete(socketId);
      return true;
    }
    return false;
  }

  /**
   * Get players by team
   */
  getTeamPlayers(sessionId, team) {
    const session = this.getSession(sessionId);
    if (!session) return [];
    return session.players.filter(p => p.team === team && p.isActive);
  }

  /**
   * Start a new round
   */
  startRound(sessionId, question, multiplier = 1) {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const roundNumber = session.currentRound + 1;
    
    const newRound = {
      roundNumber,
      questionId: question.questionId,
      multiplier,
      teamAScore: 0,
      teamBScore: 0,
      strikes: 0,
      activeTeam: session.activeTeam,
      revealedAnswers: [],
      status: 'active',
      startedAt: new Date()
    };

    session.rounds.push(newRound);
    session.currentRound = roundNumber;
    session.currentQuestion = question;
    session.revealedAnswers = [];
    session.strikes = 0;
    session.timerRemaining = session.settings.timerSeconds;

    return newRound;
  }

  /**
   * Get current round
   */
  getCurrentRound(sessionId) {
    const session = this.getSession(sessionId);
    if (!session || session.currentRound === 0) return null;
    return session.rounds[session.currentRound - 1];
  }

  /**
   * Reveal an answer
   */
  revealAnswer(sessionId, answer, points) {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const revealedAnswer = {
      text: answer.text,
      points: points,
      revealedAt: new Date()
    };

    session.revealedAnswers.push(revealedAnswer);

    // Update round data
    const currentRound = this.getCurrentRound(sessionId);
    if (currentRound) {
      currentRound.revealedAnswers.push(revealedAnswer);
    }

    return revealedAnswer;
  }

  /**
   * Add strike
   */
  addStrike(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return null;

    session.strikes++;

    const currentRound = this.getCurrentRound(sessionId);
    if (currentRound) {
      currentRound.strikes = session.strikes;
    }

    return session.strikes;
  }

  /**
   * Award points to team
   */
  awardPoints(sessionId, team, points) {
    const session = this.getSession(sessionId);
    if (!session) return null;

    if (team === 'A') {
      session.teamAScore += points;
    } else if (team === 'B') {
      session.teamBScore += points;
    }

    // Update round score
    const currentRound = this.getCurrentRound(sessionId);
    if (currentRound) {
      if (team === 'A') {
        currentRound.teamAScore += points;
      } else {
        currentRound.teamBScore += points;
      }
    }

    return {
      teamAScore: session.teamAScore,
      teamBScore: session.teamBScore
    };
  }

  /**
   * Switch active team
   */
  switchTeam(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return null;

    session.activeTeam = session.activeTeam === 'A' ? 'B' : 'A';
    return session.activeTeam;
  }

  /**
   * Complete current round
   */
  completeRound(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const currentRound = this.getCurrentRound(sessionId);
    if (currentRound) {
      currentRound.status = 'completed';
      currentRound.completedAt = new Date();
    }

    return currentRound;
  }

  /**
   * Set game status
   */
  setStatus(sessionId, status) {
    const session = this.getSession(sessionId);
    if (!session) return null;

    session.status = status;
    return session.status;
  }

  /**
   * Update timer
   */
  updateTimer(sessionId, timeRemaining, isActive) {
    const session = this.getSession(sessionId);
    if (!session) return null;

    session.timerRemaining = timeRemaining;
    session.timerActive = isActive;

    return {
      timeRemaining,
      isActive
    };
  }

  /**
   * Get all sessions
   */
  getAllSessions() {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Delete session
   */
  deleteSession(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return false;

    // Clean up socket mappings
    this.hostSockets.delete(session.hostSocketId);
    session.players.forEach(player => {
      this.playerSockets.delete(player.socketId);
    });

    this.activeSessions.delete(sessionId);
    return true;
  }

  /**
   * Clean up disconnected socket
   */
  cleanupSocket(socketId) {
    // Check if it's a host
    const hostSessionId = this.hostSockets.get(socketId);
    if (hostSessionId) {
      this.hostSockets.delete(socketId);
      // Optionally pause or end the game
      const session = this.getSession(hostSessionId);
      if (session) {
        session.status = 'paused';
      }
    }

    // Check if it's a player
    const playerSessionId = this.playerSockets.get(socketId);
    if (playerSessionId) {
      this.removePlayer(playerSessionId, socketId);
    }
  }
}

// Singleton instance
const gameState = new GameState();

module.exports = gameState;