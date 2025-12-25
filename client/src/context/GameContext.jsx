import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // Game state
  game: null,
  gameCode: null,
  isHost: false,
  
  // UI state
  timer: 30,
  timerRunning: false,
  voiceEnabled: false,
  feedback: { show: false, type: '', message: '' },
  
  // Actions
  setGame: (game) => set({ game }),
  setGameCode: (gameCode) => set({ gameCode }),
  setIsHost: (isHost) => set({ isHost }),
  
  setTimer: (timer) => set({ timer }),
  setTimerRunning: (running) => set({ timerRunning: running }),
  setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
  
  showFeedback: (type, message) => {
    set({ feedback: { show: true, type, message } });
    setTimeout(() => {
      set({ feedback: { show: false, type: '', message: '' } });
    }, 3000);
  },
  
  updateGameState: (updates) => set((state) => ({
    game: { ...state.game, ...updates }
  })),
  
  reset: () => set({
    game: null,
    gameCode: null,
    isHost: false,
    timer: 30,
    timerRunning: false,
    voiceEnabled: false,
    feedback: { show: false, type: '', message: '' }
  })
}));