import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const gameAPI = {
  createGame: (hostId) => api.post('/games', { hostId }),
  getGame: (gameCode) => api.get(`/games/${gameCode}`),
  startGame: (gameCode, hostId) => api.post(`/games/${gameCode}/start`, { hostId }),
  
  // Timer controls
  startTimer: (gameCode) => api.post(`/games/${gameCode}/timer/start`),
  stopTimer: (gameCode) => api.post(`/games/${gameCode}/timer/stop`),
  resetTimer: (gameCode) => api.post(`/games/${gameCode}/timer/reset`),
  timerEnded: (gameCode) => api.post(`/games/${gameCode}/timer/ended`),
  
  // Board controls
  loadQuestion: (gameCode) => api.post(`/games/${gameCode}/question/load`),
  submitAnswer: (gameCode, answer, teamId) => api.post(`/games/${gameCode}/answer/submit`, { answer, teamId }),
  nextQuestion: (gameCode) => api.post(`/games/${gameCode}/next`)
};

export const playerAPI = {
  registerPlayer: (gameCode, name, teamId) => 
    api.post(`/players/${gameCode}`, { name, teamId }),
  getPlayers: (gameCode) => api.get(`/players/${gameCode}`)
};

export const questionAPI = {
  seedQuestions: () => api.post('/questions/seed')
};

export default api;