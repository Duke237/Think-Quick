import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socket';
import { ROUTES } from '../utils/constants';
import { isValidSessionId } from '../utils/helpers';

const JoinGame = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinGame = () => {
    setError('');

    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }

    setLoading(true);

    socketService.connect();

    socketService.joinGame(sessionId, (response) => {
      setLoading(false);

      if (response.success) {
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('isHost', 'false');
        
        // Navigate to player registration
        navigate(`${ROUTES.PLAYER_REGISTER}?session=${sessionId}`);
      } else {
        setError(response.error || 'Failed to join game');
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-bg-secondary rounded-2xl shadow-deep p-8">
        <h1 className="text-4xl font-bold text-cyan-primary text-center mb-8">
          Join Game
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-text-secondary mb-2">Session ID</label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="game_1234567890_abc123"
              className="w-full bg-bg-tertiary text-text-primary px-4 py-3 rounded-xl
                       font-mono text-sm"
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            onClick={handleJoinGame}
            disabled={loading}
            className="w-full bg-gradient-cyan text-bg-primary font-bold py-4 rounded-xl
                     hover:shadow-glow-cyan transition-all disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinGame;