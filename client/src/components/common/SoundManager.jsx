import { useEffect } from 'react';
import audioService from '../../services/audio';

const SoundManager = ({ children, autoLoad = true }) => {
  useEffect(() => {
    if (autoLoad) {
      audioService.preloadGameSounds();
    }

    return () => {
      audioService.stopAll();
    };
  }, [autoLoad]);

  return <>{children}</>;
};

export default SoundManager;