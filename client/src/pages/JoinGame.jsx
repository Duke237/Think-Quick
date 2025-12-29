import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Loader2, ArrowRight } from 'lucide-react';

const JoinGame = () => {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    const code = gameCode.trim().toUpperCase();
    
    if (!code) {
      setError('Please enter a game code');
      return;
    }

    if (code.length !== 6) {
      setError('Game code must be 6 characters');
      return;
    }

    // Redirect to registration page
    navigate(`/register/${code}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

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
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-orange-primary/30 blur-2xl animate-pulse-slow" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-orange-primary/20 to-yellow-accent/20 border-4 border-orange-primary/50 flex items-center justify-center shadow-glow-orange">
              <Play className="w-16 h-16 text-orange-primary" strokeWidth={2.5} />
            </div>
          </div>

          <h1 
            className="text-7xl font-black mb-4 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #FF9F1C 0%, #F5B942 50%, #FFC107 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(255, 159, 28, 0.5))'
            }}
          >
            JOIN GAME
          </h1>

          <p className="text-2xl text-text-secondary font-semibold">
            Enter the 6-character game code
          </p>
        </div>

        {/* Input Form */}
        <div className="glass rounded-3xl p-10 max-w-xl w-full shadow-deep">
          <div className="mb-6">
            <label className="block text-text-primary font-bold text-xl mb-3">
              Game Code
            </label>
            <input
              type="text"
              value={gameCode}
              onChange={(e) => {
                setGameCode(e.target.value.toUpperCase());
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-8 py-6 bg-bg-secondary/80 backdrop-blur-xl border-2 border-orange-primary/30 rounded-xl text-text-primary placeholder-text-muted text-3xl font-mono font-black text-center focus:outline-none focus:border-orange-primary transition-colors uppercase"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl">
              <p className="text-red-400 font-semibold text-center">{error}</p>
            </div>
          )}

          {/* Join Button */}
          <button
            onClick={handleJoin}
            disabled={!gameCode.trim()}
            className="group relative w-full px-12 py-6 bg-gradient-to-r from-orange-primary to-yellow-accent rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glow-orange disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-accent to-orange-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-4">
              <Play className="w-8 h-8 text-bg-primary" strokeWidth={2.5} />
              <div className="text-2xl font-black text-bg-primary">CONTINUE</div>
              <ArrowRight className="w-8 h-8 text-bg-primary ml-auto" strokeWidth={2.5} />
            </div>
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-orange-primary/10 rounded-xl border border-orange-primary/30">
            <p className="text-text-secondary text-center text-sm">
              Get the game code from your host to join the session
            </p>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mt-8 text-text-muted hover:text-orange-primary font-semibold transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default JoinGame;