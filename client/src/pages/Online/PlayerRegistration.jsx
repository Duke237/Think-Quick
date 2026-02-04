import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socket';

const PlayerRegistration = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get('session');
    
    if (sid) {
      setSessionId(sid);
    } else {
      setError('No session ID provided');
    }
  }, []);

  const handleRegister = () => {
    setError('');

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!sessionId) {
      setError('Invalid session ID');
      return;
    }

    setLoading(true);

    socketService.registerPlayer(sessionId, playerName, selectedTeam, (response) => {
      setLoading(false);

      if (response.success) {
        localStorage.setItem('playerId', response.player.id);
        localStorage.setItem('playerName', playerName);
        localStorage.setItem('playerTeam', selectedTeam);
        navigate(`/lobby?session=${sessionId}`);
      } else {
        setError(response.error || 'Failed to register');
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-bg-secondary rounded-2xl shadow-deep p-8">
        <h1 className="text-4xl font-bold text-cyan-primary text-center mb-8">
          Player Registration
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-text-secondary mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-bg-tertiary text-text-primary px-4 py-3 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-cyan-primary"
            />
          </div>

          <div>
            <label className="block text-text-secondary mb-2">Select Team</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedTeam('A')}
                className={`py-4 rounded-xl font-bold transition-all ${
                  selectedTeam === 'A'
                    ? 'bg-gradient-cyan text-bg-primary shadow-glow-cyan'
                    : 'bg-bg-tertiary text-text-muted hover:text-cyan-primary'
                }`}
              >
                Team A
              </button>
              <button
                onClick={() => setSelectedTeam('B')}
                className={`py-4 rounded-xl font-bold transition-all ${
                  selectedTeam === 'B'
                    ? 'bg-gradient-warm text-bg-primary shadow-glow-orange'
                    : 'bg-bg-tertiary text-text-muted hover:text-orange-primary'
                }`}
              >
                Team B
              </button>
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading || !playerName.trim()}
            className="w-full bg-gradient-cyan text-bg-primary font-bold py-4 rounded-xl
                     hover:shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Join Game'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-text-muted text-sm">
            Session: <span className="text-cyan-primary font-mono">{sessionId}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlayerRegistration;