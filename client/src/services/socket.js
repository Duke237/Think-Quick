import { io } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '@utils/constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  /**
   * Connect to Socket.IO server
   */
  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('Socket disconnected manually');
    }
  }

  /**
   * Emit event to server
   */
  emit(event, data, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit(event, data, callback);
  }

  /**
   * Listen to event from server
   */
  on(event, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.on(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  /**
   * Listen to event once
   */
  once(event, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.once(event, callback);
  }

  /**
   * Get socket ID
   */
  getId() {
    return this.socket?.id;
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // ==================== HOST METHODS ====================

  createGame(settings, callback) {
    this.emit(SOCKET_EVENTS.HOST_CREATE_GAME, settings, callback);
  }

  startGame(sessionId, callback) {
    this.emit(SOCKET_EVENTS.HOST_START_GAME, { sessionId }, callback);
  }

  loadQuestion(sessionId, questionId = null, multiplier = null, callback) {
    this.emit(SOCKET_EVENTS.HOST_LOAD_QUESTION, { 
      sessionId, 
      questionId, 
      multiplier 
    }, callback);
  }

  submitAnswer(sessionId, answer, callback) {
    this.emit(SOCKET_EVENTS.HOST_SUBMIT_ANSWER, { 
      sessionId, 
      answer 
    }, callback);
  }

  switchTeam(sessionId, callback) {
    this.emit(SOCKET_EVENTS.HOST_SWITCH_TEAM, { sessionId }, callback);
  }

  endRound(sessionId, callback) {
    this.emit(SOCKET_EVENTS.HOST_END_ROUND, { sessionId }, callback);
  }

  startFastMoney(sessionId, callback) {
    this.emit(SOCKET_EVENTS.HOST_START_FAST_MONEY, { sessionId }, callback);
  }

  submitFastMoneyAnswer(sessionId, playerNumber, questionIndex, answer, callback) {
    this.emit(SOCKET_EVENTS.HOST_SUBMIT_FAST_MONEY, {
      sessionId,
      playerNumber,
      questionIndex,
      answer
    }, callback);
  }

  endGame(sessionId, callback) {
    this.emit(SOCKET_EVENTS.HOST_END_GAME, { sessionId }, callback);
  }

  // ==================== TIMER METHODS ====================

  startTimer(sessionId, duration, callback) {
    this.emit(SOCKET_EVENTS.TIMER_START, { sessionId, duration }, callback);
  }

  stopTimer(sessionId, callback) {
    this.emit(SOCKET_EVENTS.TIMER_STOP, { sessionId }, callback);
  }

  resetTimer(sessionId, duration, callback) {
    this.emit(SOCKET_EVENTS.TIMER_RESET, { sessionId, duration }, callback);
  }

  // ==================== PLAYER METHODS ====================

  joinGame(sessionId, callback) {
    this.emit(SOCKET_EVENTS.PLAYER_JOIN, { sessionId }, callback);
  }

  registerPlayer(sessionId, name, team, callback) {
    this.emit(SOCKET_EVENTS.PLAYER_REGISTER, { 
      sessionId, 
      name, 
      team 
    }, callback);
  }

  playerSubmitAnswer(sessionId, answer, callback) {
    this.emit(SOCKET_EVENTS.PLAYER_SUBMIT_ANSWER, { 
      sessionId, 
      answer 
    }, callback);
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;