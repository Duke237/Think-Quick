import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Users, Zap, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { playerAPI, gameAPI } from '../services/api';

const PlayerRegistration = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const [playerName, setPlayerName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [gameExists, setGameExists] = useState(false);
  const [teams, setTeams] = useState([
    { id: 1, name: 'Team Alpha', color: '#00E5FF', gradient: 'from-cyan-400 to-blue-500' },
    { id: 2, name: 'Team Beta', color: '#FF9F1C', gradient: 'from-orange-500 to-pink-500' }
  ]);

  useEffect(() => {
    // Verify game exists
    const verifyGame = async () => {
      try {
        const response = await gameAPI.getGame(code);
        if (response.data.success) {
          setGameExists(true);
          // Update teams from game data if available
          if (response.data.game.teams) {
            setTeams(response.data.game.teams.map(team => ({
              ...team,
              gradient: team.id === 1 ? 'from-cyan-400 to-blue-500' : 'from-orange-500 to-pink-500'
            })));
          }
        }
      } catch (err) {
        setError('Game not found. Please check the game code.');
        console.error('❌ Game verification error:', err);
      } finally {
        setVerifying(false);
      }
    };

    if (code) {
      verifyGame();
    }
  }, [code]);

  const handleRegister = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (playerName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await playerAPI.registerPlayer(
        code.toUpperCase(),
        playerName.trim(),
        selectedTeam
      );

      if (response.data.success) {
        const { player } = response.data;
        console.log('✅ Player registered:', player);

        // Store player data in localStorage
        localStorage.setItem('playerId', player.id);
        localStorage.setItem('playerName', player.name);
        localStorage.setItem('teamId', player.teamId.toString());
        localStorage.setItem('gameCode', code.toUpperCase());

        // Redirect to lobby
        navigate(`/lobby/${code.toUpperCase()}`);
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to register. Please try again.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleRegister();
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-primary animate-spin mx-auto mb-4" />
          <p className="text-xl text-text-secondary font-semibold">Verifying game code...</p>
        </div>
      </div>
    );
  }

  if (!gameExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary flex items-center justify-center px-6">
        <div className="glass rounded-3xl p-12 max-w-lg text-center">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-text-primary mb-4">GAME NOT FOUND</h2>
          <p className="text-xl text-text-secondary mb-8">
            The game code <span className="text-cyan-primary font-mono font-bold">{code}</span> doesn't exist or has expired.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-cyan-primary to-cyan-dark rounded-xl text-bg-primary font-bold text-lg hover:scale-105 transition-transform"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary relative overflow-hidden">
      
      {/* Animated Background Orbs */}
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-cyan-primary/30 blur-2xl animate-pulse-slow" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-primary/20 to-orange-primary/20 border-4 border-cyan-primary/50 flex items-center justify-center shadow-glow-cyan">
              <User className="w-16 h-16 text-cyan-primary" strokeWidth={2.5} />
            </div>
          </div>

          <h1 
            className="text-6xl md:text-7xl font-black mb-4 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #00E5FF 0%, #5FF5FF 50%, #00B8D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(0, 229, 255, 0.5))'
            }}
          >
            JOIN GAME
          </h1>

          <p className="text-xl text-text-secondary font-semibold mb-2">
            Game Code: <span className="text-cyan-primary font-mono font-black text-3xl">{code}</span>
          </p>
        </div>

        {/* Registration Form */}
        <div className="glass rounded-3xl p-10 max-w-2xl w-full shadow-deep">
          
          {/* Player Name Input */}
          <div className="mb-8">
            <label className="block text-text-primary font-bold text-xl mb-3">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full px-6 py-4 bg-bg-secondary/80 backdrop-blur-xl border-2 border-cyan-primary/30 rounded-xl text-text-primary placeholder-text-muted text-lg font-semibold focus:outline-none focus:border-cyan-primary transition-colors"
              disabled={loading}
            />
          </div>

          {/* Team Selection */}
          <div className="mb-8">
            <label className="block text-text-primary font-bold text-xl mb-4">
              Select Your Team
            </label>
            <div className="grid grid-cols-2 gap-4">
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  disabled={loading}
                  className={`group relative p-6 rounded-2xl border-4 transition-all duration-300 ${
                    selectedTeam === team.id
                      ? 'border-white scale-105 shadow-glow-cyan'
                      : 'border-transparent hover:border-white/30'
                  }`}
                  style={{
                    background: selectedTeam === team.id 
                      ? `linear-gradient(135deg, ${team.color}aa, ${team.color}66)` 
                      : `linear-gradient(135deg, ${team.color}33, ${team.color}11)`
                  }}
                >
                  <Users className="w-12 h-12 text-white mx-auto mb-3" strokeWidth={2.5} />
                  <div className="text-2xl font-black text-white">{team.name}</div>
                  {selectedTeam === team.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <span className="text-bg-primary text-sm font-black">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl">
              <p className="text-red-400 font-semibold text-center">{error}</p>
            </div>
          )}

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={loading || !playerName.trim()}
            className="group relative w-full px-12 py-6 bg-gradient-to-r from-cyan-primary to-cyan-dark rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-light to-cyan-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-4">
              {loading ? (
                <>
                  <Loader2 className="w-8 h-8 text-bg-primary animate-spin" strokeWidth={2.5} />
                  <div className="text-2xl font-black text-bg-primary">JOINING...</div>
                </>
              ) : (
                <>
                  <Zap className="w-8 h-8 text-bg-primary" strokeWidth={2.5} />
                  <div className="text-2xl font-black text-bg-primary">JOIN LOBBY</div>
                  <ArrowRight className="w-8 h-8 text-bg-primary ml-auto" strokeWidth={2.5} />
                </>
              )}
            </div>
          </button>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-cyan-primary/10 rounded-xl border border-cyan-primary/30">
            <p className="text-text-secondary text-center">
              <span className="text-cyan-primary font-bold">No account needed!</span> Just enter your name and pick a team.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mt-8 text-text-muted hover:text-cyan-primary font-semibold transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default PlayerRegistration;