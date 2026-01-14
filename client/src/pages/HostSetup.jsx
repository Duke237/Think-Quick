import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Loader2, Users, ArrowRight } from 'lucide-react';
import { gameAPI } from '../services/api';

const HostSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    setLoading(true);
    setError('');

    try {
      // Generate a unique host ID
      const hostId = `host_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Call backend to create game
      const response = await gameAPI.createGame(hostId);
      
      if (response.data.success) {
        const { gameCode } = response.data.game;
        console.log('✅ Game created:', gameCode);
        
        // Store host ID in localStorage
        localStorage.setItem('hostId', hostId);
        localStorage.setItem('gameCode', gameCode);
        
        // Redirect to lobby
        navigate(`/lobby/${gameCode}`);
      }
    } catch (err) {
      console.error('❌ Error creating game:', err);
      setError(err.response?.data?.error || 'Failed to create game. Please try again.');
      setLoading(false);
    }
  };

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
        
        {/* Logo */}
        <div className="text-center mb-12">
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
            HOST SETUP
          </h1>

          <p className="text-2xl text-text-secondary font-semibold">
            Create a new game session
          </p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl p-12 max-w-2xl w-full shadow-deep">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Ready to start?
            </h2>
            <p className="text-xl text-text-secondary">
              Click the button below to generate a unique game code and create your session
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl">
              <p className="text-red-400 font-semibold text-center">{error}</p>
            </div>
          )}

          {/* Create Game Button */}
          <button
            onClick={handleCreateGame}
            disabled={loading}
            className="group relative w-full px-12 py-8 bg-gradient-to-r from-cyan-primary to-cyan-dark rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-light to-cyan-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-4">
              {loading ? (
                <>
                  <Loader2 className="w-10 h-10 text-bg-primary animate-spin" strokeWidth={2.5} />
                  <div className="text-left">
                    <div className="text-3xl font-black text-bg-primary">CREATING GAME...</div>
                    <div className="text-lg text-bg-primary/80 font-semibold">Please wait</div>
                  </div>
                </>
              ) : (
                <>
                  <Zap className="w-10 h-10 text-bg-primary" strokeWidth={2.5} />
                  <div className="text-left">
                    <div className="text-3xl font-black text-bg-primary">CREATE GAME</div>
                    <div className="text-lg text-bg-primary/80 font-semibold">Generate game code & start session</div>
                  </div>
                  <ArrowRight className="w-8 h-8 text-bg-primary ml-auto" strokeWidth={2.5} />
                </>
              )}
            </div>
          </button>

          {/* Info Section */}
          <div className="mt-8 p-6 bg-cyan-primary/10 rounded-xl border border-cyan-primary/30">
            <h3 className="text-xl font-bold text-cyan-primary mb-3">What happens next?</h3>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-cyan-primary mt-1">✓</span>
                <span>A unique 6-character game code will be generated</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-primary mt-1">✓</span>
                <span>You'll be redirected to the lobby</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-primary mt-1">✓</span>
                <span>Players can join using your game code</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-primary mt-1">✓</span>
                <span>You'll have full control over the game flow!!</span>
              </li>
            </ul>
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

export default HostSetup;