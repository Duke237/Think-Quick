import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socket';
import { Button, Card, Input } from '../../components';

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
        navigate(`/online/lobby?session=${sessionId}`);
      } else {
        setError(response.error || 'Failed to register');
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-cyan-primary mb-4">
            Player Registration
          </h1>
          <p className="text-text-secondary text-lg">
            Join your team and get ready to play
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-6 animate-scale-in">
            {error}
          </div>
        )}

        <Card padding="large" className="mb-6">
          <div className="space-y-6">
            <Input
              label="Your Name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              fullWidth
            />

            <div>
              <label className="block text-text-secondary mb-3 font-medium">
                Select Team
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedTeam('A')}
                  className={`py-4 rounded-xl font-bold transition-all ${
                    selectedTeam === 'A'
                      ? 'bg-gradient-cyan text-bg-primary shadow-glow-cyan scale-105'
                      : 'bg-bg-tertiary text-text-muted hover:text-cyan-primary hover:bg-bg-tertiary/80'
                  }`}
                >
                  Team A
                </button>
                <button
                  onClick={() => setSelectedTeam('B')}
                  className={`py-4 rounded-xl font-bold transition-all ${
                    selectedTeam === 'B'
                      ? 'bg-gradient-warm text-bg-primary shadow-glow-orange scale-105'
                      : 'bg-bg-tertiary text-text-muted hover:text-orange-primary hover:bg-bg-tertiary/80'
                  }`}
                >
                  Team B
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Button
          variant={selectedTeam === 'A' ? 'primary' : 'secondary'}
          size="lg"
          fullWidth
          loading={loading}
          disabled={!playerName.trim()}
          onClick={handleRegister}
        >
          Join Game
        </Button>

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