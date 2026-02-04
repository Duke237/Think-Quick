/**
 * Socket.IO Event Constants
 * Centralized event names for type safety and consistency
 */

module.exports = {
  // Connection Events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Host Events (sent by host)
  HOST_CREATE_GAME: 'host:create-game',
  HOST_START_GAME: 'host:start-game',
  HOST_LOAD_QUESTION: 'host:load-question',
  HOST_SUBMIT_ANSWER: 'host:submit-answer',
  HOST_ADD_STRIKE: 'host:add-strike',
  HOST_SWITCH_TEAM: 'host:switch-team',
  HOST_NEXT_ROUND: 'host:next-round',
  HOST_END_ROUND: 'host:end-round',
  HOST_START_FAST_MONEY: 'host:start-fast-money',
  HOST_SUBMIT_FAST_MONEY: 'host:submit-fast-money',
  HOST_END_GAME: 'host:end-game',
  
  // Timer Events (host controls)
  TIMER_START: 'timer:start',
  TIMER_STOP: 'timer:stop',
  TIMER_RESET: 'timer:reset',
  TIMER_PAUSE: 'timer:pause',
  TIMER_RESUME: 'timer:resume',
  
  // Player Events (sent by players)
  PLAYER_JOIN: 'player:join',
  PLAYER_REGISTER: 'player:register',
  PLAYER_SUBMIT_ANSWER: 'player:submit-answer',
  PLAYER_READY: 'player:ready',
  
  // Broadcast Events (sent to all clients)
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
  
  // Player Broadcast Events
  PLAYER_JOINED: 'player:joined',
  PLAYER_LEFT: 'player:left',
  PLAYERS_UPDATE: 'players:update',
  
  // Timer Broadcast Events
  TIMER_TICK: 'timer:tick',
  TIMER_COMPLETE: 'timer:complete',
  TIMER_UPDATE: 'timer:update',
  
  // Fast Money Events
  FAST_MONEY_STARTED: 'fast-money:started',
  FAST_MONEY_QUESTION: 'fast-money:question',
  FAST_MONEY_ANSWER: 'fast-money:answer',
  FAST_MONEY_RESULTS: 'fast-money:results',
  
  // Error Events
  ERROR: 'error',
  GAME_ERROR: 'game:error'
};