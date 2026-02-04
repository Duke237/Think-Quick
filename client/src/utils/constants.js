// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Game Constants
export const GAME_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed'
};

export const TEAM = {
  A: 'A',
  B: 'B'
};

export const TEAM_COLORS = {
  A: {
    primary: '#00E5FF',
    glow: '#00D9FF',
    gradient: 'from-cyan-primary to-cyan-dark'
  },
  B: {
    primary: '#FF9F1C',
    glow: '#FFB347',
    gradient: 'from-orange-primary to-yellow-accent'
  }
};

export const DEFAULT_SETTINGS = {
  MAX_STRIKES: 3,
  TIMER_SECONDS: 20,
  ROUND_MULTIPLIERS: [1, 2, 3],
  FAST_MONEY_TARGET: 100,
  FAST_MONEY_BONUS: 500
};

// Socket Events (matching server)
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Host Events
  HOST_CREATE_GAME: 'host:create-game',
  HOST_START_GAME: 'host:start-game',
  HOST_LOAD_QUESTION: 'host:load-question',
  HOST_SUBMIT_ANSWER: 'host:submit-answer',
  HOST_SWITCH_TEAM: 'host:switch-team',
  HOST_END_ROUND: 'host:end-round',
  HOST_START_FAST_MONEY: 'host:start-fast-money',
  HOST_SUBMIT_FAST_MONEY: 'host:submit-fast-money',
  HOST_END_GAME: 'host:end-game',
  
  // Timer Events
  TIMER_START: 'timer:start',
  TIMER_STOP: 'timer:stop',
  TIMER_RESET: 'timer:reset',
  
  // Player Events
  PLAYER_JOIN: 'player:join',
  PLAYER_REGISTER: 'player:register',
  PLAYER_SUBMIT_ANSWER: 'player:submit-answer',
  
  // Broadcast Events
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
  
  // Timer Broadcasts
  TIMER_TICK: 'timer:tick',
  TIMER_COMPLETE: 'timer:complete',
  TIMER_UPDATE: 'timer:update',
  
  // Fast Money
  FAST_MONEY_STARTED: 'fast-money:started',
  FAST_MONEY_ANSWER: 'fast-money:answer',
  FAST_MONEY_RESULTS: 'fast-money:results',
  
  // Error
  ERROR: 'error',
  GAME_ERROR: 'game:error'
};

// Routes
export const ROUTES = {
  HOME: '/',
  HOST_SETUP: '/host/setup',
  HOST_GAME: '/host/game',
  PLAYER_JOIN: '/player/join',
  PLAYER_REGISTER: '/player/register',
  PLAYER_GAME: '/player/game',
  LOBBY: '/lobby',
  CLOCK: '/clock',
  ADMIN: '/admin'
};

// Audio Files (we'll add these later)
export const SOUNDS = {
  CORRECT: '/sounds/correct.mp3',
  WRONG: '/sounds/wrong.mp3',
  STRIKE: '/sounds/strike.mp3',
  TIMER: '/sounds/timer.mp3',
  ROUND_START: '/sounds/round-start.mp3',
  VICTORY: '/sounds/victory.mp3'
};

// Animation Durations (ms)
export const ANIMATION = {
  ANSWER_REVEAL: 500,
  SCORE_UPDATE: 800,
  STRIKE_APPEAR: 300,
  CARD_FLIP: 400
};

// Voice Commands
export const VOICE_COMMANDS = {
  START: ['start', 'begin', 'go'],
  STOP: ['stop', 'pause', 'halt'],
  RESET: ['reset', 'restart', 'clear']
};