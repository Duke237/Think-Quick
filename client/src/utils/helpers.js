/**
 * Format time in MM:SS format
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Generate unique ID
 */
export const generateId = (prefix = '') => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Delay/sleep utility
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Clamp a number between min and max
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Get team color
 */
export const getTeamColor = (team) => {
  const colors = {
    A: {
      primary: 'cyan-primary',
      glow: 'cyan-glow',
      bg: 'bg-cyan-primary',
      text: 'text-cyan-primary',
      border: 'border-cyan-primary'
    },
    B: {
      primary: 'orange-primary',
      glow: 'orange-glow',
      bg: 'bg-orange-primary',
      text: 'text-orange-primary',
      border: 'border-orange-primary'
    }
  };
  return colors[team] || colors.A;
};

/**
 * Format score with commas
 */
export const formatScore = (score) => {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Shuffle array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Check if running in development
 */
export const isDev = () => {
  return import.meta.env.MODE === 'development';
};

/**
 * Play sound effect
 */
export const playSound = (soundPath, volume = 1.0) => {
  try {
    const audio = new Audio(soundPath);
    audio.volume = clamp(volume, 0, 1);
    audio.play().catch(err => {
      console.warn('Failed to play sound:', err);
    });
  } catch (error) {
    console.warn('Sound playback error:', error);
  }
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Get error message from error object
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

/**
 * Validate session ID format
 */
export const isValidSessionId = (sessionId) => {
  return /^game_\d+_[a-z0-9]+$/.test(sessionId);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};