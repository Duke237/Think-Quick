import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socket';
import { Button, Card, Input } from '../../components';
import { isValidSessionId } from '../../utils/helpers';

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

    // Basic format validation
    if (!sessionId.includes('game_')) {
      setError('Invalid session ID format');
      return;
    }

    setLoading(true);
    socketService.connect();

    socketService.joinGame(sessionId, (response) => {
      setLoading(false);

      if (response.success) {
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('isHost', 'false');
        localStorage.setItem('isLiveMode', 'false');
        
        navigate(`/online/player/register?session=${sessionId}`);
      } else {
        setError(response.error || 'Failed to join game. Please check the session ID.');
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinGame();
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-orange-primary mb-4">
            Join Game
          </h1>
          <p className="text-text-secondary text-lg">
            Enter the session code provided by the host
          </p>
        </div>

        <Card padding="large">
          <div className="space-y-6">
            <Input
              label="Session ID"
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="game_1234567890_abc123"
              error={error}
              helperText={!error ? "Get this code from your game host" : undefined}
              fullWidth
              className="font-mono text-sm"
            />

            <div className="bg-bg-tertiary p-4 rounded-xl">
              <p className="text-text-muted text-sm mb-2">Session ID Format:</p>
              <code className="text-cyan-primary text-xs">game_[timestamp]_[code]</code>
            </div>
          </div>
        </Card>

        <div className="flex gap-4 mt-8">
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => navigate('/online/mode-select')}
          >
            Back
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            loading={loading}
            onClick={handleJoinGame}
            disabled={!sessionId.trim()}
          >
            Join Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinGame;