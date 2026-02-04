import { io } from 'socket.io-client';

// Direct imports instead of alias
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Copy SOCKET_EVENTS here or import from constants with relative path
const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  HOST_CREATE_GAME: 'host:create-game',
  HOST_START_GAME: 'host:start-game',
  HOST_LOAD_QUESTION: 'host:load-question',
  HOST_SUBMIT_ANSWER: 'host:submit-answer',
  HOST_SWITCH_TEAM: 'host:switch-team',
  HOST_END_ROUND: 'host:end-round',
  HOST_START_FAST_MONEY: 'host:start-fast-money',
  HOST_SUBMIT_FAST_MONEY: 'host:submit-fast-money',
  HOST_END_GAME: 'host:end-game',
  TIMER_START: 'timer:start',
  TIMER_STOP: 'timer:stop',
  TIMER_RESET: 'timer:reset',
  PLAYER_JOIN: 'player:join',
  PLAYER_REGISTER: 'player:register',
  PLAYER_SUBMIT_ANSWER: 'player:submit-answer',
  GAME_CREATED: 'game:created',
  GAME_STARTED: 'game:started',
  GAME_STATE_UPDATE: 'game:state-update',
  QUESTION_LOADED: 'game:question-loaded',
  ANSWER_REVEALED: 'game:answer-revealed',
  ANSWER_WRONG: 'game:answer-wrong',
  STRIKE_ADDED: 'game:strike-added',
  TEAM_SWITCHED: 'game:team-switched',
  ROUND_COMPLETED: 'game:round-completed',
  SCORE_UPDATE: 'game:score-update',
  GAME_ENDED: 'game:ended',
  PLAYER_JOINED: 'player:joined',
  PLAYER_LEFT: 'player:left',
  TIMER_TICK: 'timer:tick',
  TIMER_COMPLETE: 'timer:complete',
  TIMER_UPDATE: 'timer:update',
  FAST_MONEY_STARTED: 'fast-money:started',
  FAST_MONEY_ANSWER: 'fast-money:answer',
  FAST_MONEY_RESULTS: 'fast-money:results',
  ERROR: 'error',
  GAME_ERROR: 'game:error'
};

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

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

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('Socket disconnected manually');
    }
  }

  emit(event, data, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit(event, data, callback);
  }

  on(event, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  once(event, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.once(event, callback);
  }

  getId() {
    return this.socket?.id;
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Host methods
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

  // Timer methods
  startTimer(sessionId, duration, callback) {
    this.emit(SOCKET_EVENTS.TIMER_START, { sessionId, duration }, callback);
  }

  stopTimer(sessionId, callback) {
    this.emit(SOCKET_EVENTS.TIMER_STOP, { sessionId }, callback);
  }

  resetTimer(sessionId, duration, callback) {
    this.emit(SOCKET_EVENTS.TIMER_RESET, { sessionId, duration }, callback);
  }

  // Player methods
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

const socketService = new SocketService();

export default socketService;