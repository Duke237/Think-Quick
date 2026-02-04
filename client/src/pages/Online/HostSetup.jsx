import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socket';
import { ROUTES, DEFAULT_SETTINGS } from '../utils/constants';
import { generateId } from '../utils/helpers';

const HostSetup = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  const handleCreateGame = () => {
    setLoading(true);
    
    socketService.connect();
    
    socketService.createGame(settings, (response) => {
      setLoading(false);
      
      if (response.success) {
        const sessionId = response.sessionId;
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('isHost', 'true');
        
        // Navigate to lobby
        navigate(`${ROUTES.LOBBY}?session=${sessionId}`);
      } else {
        alert('Failed to create game: ' + response.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-bg-secondary rounded-2xl shadow-deep p-8">
        <h1 className="text-4xl font-bold text-cyan-primary text-center mb-8">
          Host Setup
        </h1>

        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-text-secondary mb-2">Max Strikes</label>
            <input
              type="number"
              min="1"
              max="5"
              value={settings.MAX_STRIKES}
              onChange={(e) => setSettings({ ...settings, MAX_STRIKES: parseInt(e.target.value) })}
              className="w-full bg-bg-tertiary text-text-primary px-4 py-3 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-text-secondary mb-2">Timer (seconds)</label>
            <input
              type="number"
              min="10"
              max="60"
              value={settings.TIMER_SECONDS}
              onChange={(e) => setSettings({ ...settings, TIMER_SECONDS: parseInt(e.target.value) })}
              className="w-full bg-bg-tertiary text-text-primary px-4 py-3 rounded-xl"
            />
          </div>
        </div>

        <button
          onClick={handleCreateGame}
          disabled={loading}
          className="w-full bg-gradient-cyan text-bg-primary font-bold py-4 rounded-xl
                   hover:shadow-glow-cyan transition-all disabled:opacity-50"
        >
          {loading ? 'Creating Game...' : 'Create Game'}
        </button>
      </div>
    </div>
  );
};

export default HostSetup;