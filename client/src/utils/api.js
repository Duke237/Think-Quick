import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust the base URL as needed

export const fetchStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export const submitScore = async (scoreData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/scores`, scoreData);
    return response.data;
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
};

export const createGame = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/games`, {});
    return response.data;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

export const joinGame = async ({ code, name }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/games/join`, { code, name });
    return response.data;
  } catch (error) {
    console.error('Error joining game:', error);
    throw error;
  }
};

export const getGameByCode = async (code) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/games/code/${code}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching game by code:', error);
    throw error;
  }
};

export const getGame = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/games/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching game:', error);
    throw error;
  }
};

export const submitAnswer = async ({ gameId, teamIndex, answer }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/games/${gameId}/answer`, { teamIndex, answer });
    return response.data;
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
};

export const startTimer = async ({ gameId, duration }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/games/${gameId}/timer/start`, { duration });
    return response.data;
  } catch (error) {
    console.error('Error starting timer:', error);
    throw error;
  }
};

export const pauseTimer = async ({ gameId }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/games/${gameId}/timer/pause`);
    return response.data;
  } catch (error) {
    console.error('Error pausing timer:', error);
    throw error;
  }
};

export const resetTimer = async ({ gameId, duration }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/games/${gameId}/timer/reset`, { duration });
    return response.data;
  } catch (error) {
    console.error('Error resetting timer:', error);
    throw error;
  }
};

export const getTimer = async ({ gameId }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/games/${gameId}/timer`);
    return response.data;
  } catch (error) {
    console.error('Error fetching timer status:', error);
    throw error;
  }
};