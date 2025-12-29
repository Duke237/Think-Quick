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
  getGame: (gameCode) => api.get(`/games/${gameCode}`)
};

export const playerAPI = {
  registerPlayer: (gameCode, name, teamId) => 
    api.post(`/players/${gameCode}`, { name, teamId }),
  getPlayers: (gameCode) => api.get(`/players/${gameCode}`)
};

export default api;