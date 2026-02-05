import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../../services/api';  // Changed from ../services/api
import socketService from '../../services/socket';  // Changed from ../services/socket
import { SOCKET_EVENTS } from '../../utils/constants';  // Changed from ../utils/constants
import { Button, Card } from '../../components';  // Add component imports

const Lobby = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Get session ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get('session') || localStorage.getItem('sessionId');
    const host = localStorage.getItem('isHost') === 'true';
    
    if (sid) {
      setSessionId(sid);
      setIsHost(host);
      loadGameData(sid);
    }

    // Connect socket
    socketService.connect();

    // Listen for player updates
    socketService.on(SOCKET_EVENTS.PLAYER_JOINED, (data) => {
      setPlayers(prev => [...prev, data.player]);
    });

    socketService.on(SOCKET_EVENTS.PLAYER_LEFT, (data) => {
      setPlayers(prev => prev.filter(p => p.socketId !== data.socketId));
    });

    socketService.on(SOCKET_EVENTS.GAME_STARTED, () => {
      setGameStatus('active');
      // Navigate to game screen (will be created in Phase 10)
      if (isHost) {
        navigate(`/online/host/game?session=${sid}`);
      } else {
        navigate(`/online/player/game?session=${sid}`);
      }
    });

    return () => {
      socketService.off(SOCKET_EVENTS.PLAYER_JOINED);
      socketService.off(SOCKET_EVENTS.PLAYER_LEFT);
      socketService.off(SOCKET_EVENTS.GAME_STARTED);
    };
  }, [isHost, navigate]);

  const loadGameData = async (sid) => {
    try {
      const response = await gameAPI.getPlayers(sid);
      if (response.success) {
        setPlayers(response.data.players || []);
      }
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  };

  const handleStartGame = () => {
    if (isHost && sessionId) {
      socketService.startGame(sessionId, (response) => {
        if (response.success) {
          console.log('Game started!');
        } else {
          console.error('Failed to start game:', response.error);
        }
      });
    }
  };

  const handleCopySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    // Could add a toast notification here
    alert('Session ID copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-4xl w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-primary mb-4">
            Game Lobby
          </h1>
          <div className="flex items-center justify-center gap-4">
            <p className="text-text-secondary">
              Session ID: <span className="text-cyan-primary font-mono">{sessionId}</span>
            </p>
            {isHost && (
              <Button size="sm" variant="outline" onClick={handleCopySessionId}>
                Copy ID
              </Button>
            )}
          </div>
          <p className="text-text-muted mt-2">
            Status: <span className="text-yellow-accent capitalize">{gameStatus}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Team A */}
          <Card variant="cyan" padding="large">
            <h3 className="text-cyan-primary font-bold text-xl mb-4">Team A</h3>
            <div className="space-y-2">
              {players.filter(p => p.team === 'A').length === 0 ? (
                <p className="text-text-muted italic">No players yet</p>
              ) : (
                players.filter(p => p.team === 'A').map(player => (
                  <div key={player.id} className="bg-bg-tertiary px-4 py-2 rounded-lg text-text-secondary">
                    {player.name}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Team B */}
          <Card variant="orange" padding="large">
            <h3 className="text-orange-primary font-bold text-xl mb-4">Team B</h3>
            <div className="space-y-2">
              {players.filter(p => p.team === 'B').length === 0 ? (
                <p className="text-text-muted italic">No players yet</p>
              ) : (
                players.filter(p => p.team === 'B').map(player => (
                  <div key={player.id} className="bg-bg-tertiary px-4 py-2 rounded-lg text-text-secondary">
                    {player.name}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Player Count Summary */}
        <Card padding="normal" className="mb-6">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-3xl font-bold text-cyan-primary">
                {players.filter(p => p.team === 'A').length}
              </div>
              <div className="text-text-muted text-sm">Team A</div>
            </div>
            <div className="text-text-muted text-3xl">vs</div>
            <div>
              <div className="text-3xl font-bold text-orange-primary">
                {players.filter(p => p.team === 'B').length}
              </div>
              <div className="text-text-muted text-sm">Team B</div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        {isHost ? (
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => navigate('/online/mode-select')}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={players.length === 0}
              onClick={handleStartGame}
            >
              Start Game
            </Button>
          </div>
        ) : (
          <Card padding="normal" className="text-center">
            <p className="text-text-secondary">
              Waiting for host to start the game...
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-cyan-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-cyan-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-cyan-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Lobby;