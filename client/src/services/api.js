import axios from 'axios';

// Use direct value instead of alias import for now
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Rest of the file stays the same...

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== QUESTION API ====================

export const questionAPI = {
  getRandom: (excludeIds = [], isFastMoney = false) => {
    const params = new URLSearchParams();
    if (excludeIds.length > 0) params.append('exclude', excludeIds.join(','));
    if (isFastMoney) params.append('isFastMoney', 'true');
    return api.get(`/api/questions/random?${params}`);
  },

  getFastMoney: (count = 5) => {
    return api.get(`/api/questions/fast-money?count=${count}`);
  },

  getById: (questionId) => {
    return api.get(`/api/questions/${questionId}`);
  },

  getByCategory: (category, limit = 10) => {
    return api.get(`/api/questions/category/${category}?limit=${limit}`);
  },

  search: (term) => {
    return api.get(`/api/questions/search/${term}`);
  },

  getCategories: () => {
    return api.get('/api/questions/categories/list');
  }
};

// ==================== GAME API ====================

export const gameAPI = {
  getAll: (status = null, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    return api.get(`/api/games?${params}`);
  },

  getById: (sessionId) => {
    return api.get(`/api/games/${sessionId}`);
  },

  getState: (sessionId) => {
    return api.get(`/api/games/${sessionId}/state`);
  },

  getPlayers: (sessionId) => {
    return api.get(`/api/games/${sessionId}/players`);
  },

  getRounds: (sessionId) => {
    return api.get(`/api/games/${sessionId}/rounds`);
  },

  delete: (sessionId) => {
    return api.delete(`/api/games/${sessionId}`);
  },

  getStats: () => {
    return api.get('/api/games/stats/summary');
  }
};

// ==================== PLAYER API ====================

export const playerAPI = {
  getStats: (playerId) => {
    return api.get(`/api/players/stats/${playerId}`);
  },

  getLeaderboard: () => {
    return api.get('/api/players/leaderboard');
  }
};

// ==================== ADMIN API ====================

export const adminAPI = {
  getAllQuestions: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/api/admin/questions?${params}`);
  },

  getQuestion: (questionId) => {
    return api.get(`/api/admin/questions/${questionId}`);
  },

  createQuestion: (questionData) => {
    return api.post('/api/admin/questions', questionData);
  },

  updateQuestion: (questionId, questionData) => {
    return api.put(`/api/admin/questions/${questionId}`, questionData);
  },

  deleteQuestion: (questionId) => {
    return api.delete(`/api/admin/questions/${questionId}`);
  },

  bulkCreateQuestions: (questions) => {
    return api.post('/api/admin/questions/bulk', { questions });
  },

  getCategories: () => {
    return api.get('/api/admin/categories');
  },

  getStats: () => {
    return api.get('/api/admin/stats');
  }
};

// ==================== HEALTH API ====================

export const healthAPI = {
  check: () => api.get('/api/health'),
  checkDB: () => api.get('/api/health/db'),
  checkSystem: () => api.get('/api/health/system')
};

export default api;