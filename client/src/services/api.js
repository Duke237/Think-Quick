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
  addPlayer: (gameCode, name, teamId) => 
    api.post(`/games/${gameCode}/players`, { name, teamId }),
  startGame: (gameCode) => api.post(`/games/${gameCode}/start`)
};

export const questionAPI = {
  getQuestions: () => api.get('/questions'),
  createQuestion: (data) => api.post('/questions', data)
};

export default api;