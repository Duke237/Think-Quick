import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import socketService from '../services/socket';
import { SOCKET_EVENTS, ROUTES } from '../utils/constants';

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
    
    if (sid) {
      setSessionId(sid);
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
      // Navigate to game screen
      if (isHost) {
        navigate(ROUTES.HOST_GAME);
      } else {
        navigate(ROUTES.PLAYER_GAME);
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

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-bg-secondary rounded-2xl shadow-deep p-8">
        <h1 className="text-4xl font-bold text-cyan-primary text-center mb-8">
          Game Lobby
        </h1>

        <div className="mb-6">
          <p className="text-text-secondary text-center">
            Session ID: <span className="text-cyan-primary font-mono">{sessionId}</span>
          </p>
          <p className="text-text-muted text-center mt-2">
            Status: <span className="text-yellow-accent">{gameStatus}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-bg-tertiary rounded-xl p-6">
            <h3 className="text-cyan-primary font-bold mb-4">Team A</h3>
            <div className="space-y-2">
              {players.filter(p => p.team === 'A').map(player => (
                <div key={player.id} className="text-text-secondary">
                  {player.name}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bg-tertiary rounded-xl p-6">
            <h3 className="text-orange-primary font-bold mb-4">Team B</h3>
            <div className="space-y-2">
              {players.filter(p => p.team === 'B').map(player => (
                <div key={player.id} className="text-text-secondary">
                  {player.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {isHost && (
          <button
            onClick={handleStartGame}
            disabled={players.length === 0}
            className="w-full bg-gradient-cyan text-bg-primary font-bold py-4 rounded-xl
                     hover:shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  );
};

export default Lobby;