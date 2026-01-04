import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Zap, Crown, Loader2, Play, Copy, Check } from 'lucide-react';
import { gameAPI, playerAPI } from '../services/api';
import socketService from '../services/socket';

const Lobby = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Connect to socket
    socketService.connect();
    socketService.joinGame(code);

    // Check if user is host
    const hostId = localStorage.getItem('hostId');
    setIsHost(!!hostId);

    // Fetch initial game data
    fetchGameData();

    // Listen for player joins
    socketService.on('player-joined', handlePlayerJoined);

    // Listen for game start
    socketService.on('game-started', handleGameStarted);

    return () => {
      socketService.off('player-joined');
      socketService.off('game-started');
      socketService.leaveGame(code);
    };
  }, [code]);

  const fetchGameData = async () => {
    try {
      const [gameResponse, playersResponse] = await Promise.all([
        gameAPI.getGame(code),
        playerAPI.getPlayers(code)
      ]);

      if (gameResponse.data.success) {
        setGame(gameResponse.data.game);
      }

      if (playersResponse.data.success) {
        setPlayers(playersResponse.data.players);
        setTeams(playersResponse.data.teams);
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching game data:', err);
      setError('Failed to load game. Please try again.');
      setLoading(false);
    }
  };

  const handlePlayerJoined = (data) => {
    console.log('👤 Player joined:', data);
    setPlayers(prev => [...prev.filter(p => p.id !== data.player.id), data.player]);
    setTeams(data.teams);
  };

  const handleGameStarted = (data) => {
    console.log('🎮 Game started:', data);
    // Redirect all clients to clock page
    navigate(`/clock/${code}`);
  };

  const handleStartGame = async () => {
    if (players.length < 2) {
      setError('Need at least 2 players to start');
      return;
    }

    setStarting(true);
    setError('');

    try {
      const hostId = localStorage.getItem('hostId');
      const response = await gameAPI.startGame(code, hostId);

      if (response.data.success) {
        console.log('✅ Game starting...');
        // Socket.IO will handle the redirect
      }
    } catch (err) {
      console.error('❌ Error starting game:', err);
      setError(err.response?.data?.error || 'Failed to start game');
      setStarting(false);
    }
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-primary animate-spin mx-auto mb-4" />
          <p className="text-xl text-text-secondary font-semibold">Loading lobby...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-30 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(0, 229, 255, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-cyan-primary/20 blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-orange-primary/20 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-cyan-primary/30 blur-2xl animate-pulse-slow" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-primary/20 to-orange-primary/20 border-4 border-cyan-primary/50 flex items-center justify-center shadow-glow-cyan">
              <Users className="w-16 h-16 text-cyan-primary" strokeWidth={2.5} />
            </div>
          </div>

          <h1 
            className="text-7xl font-black mb-4 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #00E5FF 0%, #5FF5FF 50%, #00B8D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(0, 229, 255, 0.5))'
            }}
          >
            GAME LOBBY
          </h1>

          {/* Game Code Display */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="glass px-8 py-4 rounded-2xl border-2 border-cyan-primary/50">
              <p className="text-text-secondary text-sm font-semibold mb-1">GAME CODE</p>
              <p className="text-5xl font-black font-mono text-cyan-primary tracking-wider">{code}</p>
            </div>
            <button
              onClick={copyGameCode}
              className="p-4 bg-cyan-primary/20 hover:bg-cyan-primary/30 border-2 border-cyan-primary/50 rounded-xl transition-all hover:scale-110"
              title="Copy game code"
            >
              {copied ? (
                <Check className="w-6 h-6 text-cyan-primary" strokeWidth={2.5} />
              ) : (
                <Copy className="w-6 h-6 text-cyan-primary" strokeWidth={2.5} />
              )}
            </button>
          </div>

          <p className="text-xl text-text-secondary font-semibold">
            {isHost ? (
              <span className="flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-yellow-accent" />
                You are the host
              </span>
            ) : (
              'Waiting for host to start...'
            )}
          </p>
        </div>

        {/* Player Count */}
        <div className="glass rounded-2xl p-6 mb-6 max-w-md mx-auto text-center">
          <p className="text-3xl font-black text-cyan-primary">
            {players.length} {players.length === 1 ? 'Player' : 'Players'} Connected
          </p>
          <p className="text-text-muted mt-2">Minimum 2 players required</p>
        </div>

        {/* Teams Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {teams.map(team => (
            <div
              key={team.id}
              className="glass rounded-3xl p-8 border-2"
              style={{ borderColor: team.color + '50' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black" style={{ color: team.color }}>
                  {team.name}
                </h2>
                <div 
                  className="px-4 py-2 rounded-full font-black text-lg"
                  style={{ 
                    background: team.color + '20',
                    color: team.color 
                  }}
                >
                  {team.playerCount || 0} {team.playerCount === 1 ? 'Player' : 'Players'}
                </div>
              </div>

              <div className="space-y-3">
                {team.players && team.players.length > 0 ? (
                  team.players.map(player => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: team.color + '15' }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ background: team.color }}
                      />
                      <span className="text-text-primary font-bold text-lg">
                        {player.name}
                      </span>
                      <span className="text-text-muted text-sm ml-auto">
                        {new Date(player.joinedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-text-muted italic">
                    No players yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl max-w-2xl mx-auto">
            <p className="text-red-400 font-semibold text-center">{error}</p>
          </div>
        )}

        {/* Start Game Button (Host Only) */}
        {isHost && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleStartGame}
              disabled={starting || players.length < 2}
              className="group relative w-full px-12 py-8 bg-gradient-to-r from-cyan-primary to-cyan-dark rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-light to-cyan-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-4">
                {starting ? (
                  <>
                    <Loader2 className="w-10 h-10 text-bg-primary animate-spin" strokeWidth={2.5} />
                    <div className="text-4xl font-black text-bg-primary">STARTING GAME...</div>
                  </>
                ) : (
                  <>
                    <Zap className="w-10 h-10 text-bg-primary" strokeWidth={2.5} />
                    <div className="text-4xl font-black text-bg-primary">START GAME</div>
                    <Play className="w-10 h-10 text-bg-primary ml-auto" strokeWidth={2.5} />
                  </>
                )}
              </div>
            </button>

            {players.length < 2 && (
              <p className="text-center text-text-muted mt-4 font-semibold">
                Waiting for more players to join...
              </p>
            )}
          </div>
        )}

        {/* Instructions for Players */}
        {!isHost && (
          <div className="glass rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-cyan-primary mb-4 text-center">
              How to Play
            </h3>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-cyan-primary mt-1">✓</span>
                <span>Wait for the host to start the game</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-primary mt-1">✓</span>
                <span>Answer tech questions as quickly as possible</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-primary mt-1">✓</span>
                <span>Earn points based on answer frequency</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-primary mt-1">✓</span>
                <span>Work with your team to win!</span>
              </li>
            </ul>
          </div>
        )}

        {/* Share Instructions */}
        <div className="mt-8 glass rounded-2xl p-6 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-orange-primary mb-3 text-center">
            Invite More Players
          </h3>
          <p className="text-text-secondary text-center">
            Share the game code <span className="text-cyan-primary font-mono font-bold text-xl">{code}</span> with friends to join!
          </p>
          <p className="text-text-muted text-center text-sm mt-2">
            Players can join at: <span className="font-mono">{window.location.origin}/register/{code}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lobby;