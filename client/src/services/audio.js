class AudioService {
  constructor() {
    this.sounds = new Map();
    this.volume = 1.0;
    this.isMuted = false;
  }

  /**
   * Preload a sound
   */
  preload(name, path) {
    if (!this.sounds.has(name)) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    }
  }

  /**
   * Play a sound
   */
  play(name, volume = null) {
    if (this.isMuted) return;

    const audio = this.sounds.get(name);
    if (audio) {
      audio.volume = volume !== null ? volume : this.volume;
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.warn(`Failed to play sound "${name}":`, err);
      });
    } else {
      console.warn(`Sound "${name}" not found. Did you preload it?`);
    }
  }

  /**
   * Play a sound from path (without preloading)
   */
  playPath(path, volume = null) {
    if (this.isMuted) return;

    try {
      const audio = new Audio(path);
      audio.volume = volume !== null ? volume : this.volume;
      audio.play().catch(err => {
        console.warn(`Failed to play sound from path "${path}":`, err);
      });
    } catch (err) {
      console.warn('Sound playback error:', err);
    }
  }

  /**
   * Set global volume (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Mute all sounds
   */
  mute() {
    this.isMuted = true;
  }

  /**
   * Unmute all sounds
   */
  unmute() {
    this.isMuted = false;
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Preload common game sounds
   */
  preloadGameSounds() {
    this.preload('correct', '/sounds/correct.mp3');
    this.preload('wrong', '/sounds/wrong.mp3');
    this.preload('strike', '/sounds/strike.mp3');
    this.preload('timerStart', '/sounds/timer-start.mp3');
    this.preload('timerEnd', '/sounds/timer-end.mp3');
    this.preload('roundStart', '/sounds/round-start.mp3');
    this.preload('victory', '/sounds/victory.mp3');
    this.preload('reveal', '/sounds/reveal.mp3');
    
    console.log('Game sounds preloaded');
  }

  /**
   * Stop all sounds
   */
  stopAll() {
    this.sounds.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}

// Singleton instance
const audioService = new AudioService();

export default audioService;