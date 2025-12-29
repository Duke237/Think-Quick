import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Users, Play } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary relative overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large cyan orb */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-30 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(0, 229, 255, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        
        {/* Small floating orbs */}
        <div 
          className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-cyan-primary/20 blur-3xl animate-float"
          style={{ animationDelay: '0s' }}
        />
        <div 
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-orange-primary/20 blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div 
          className="absolute top-2/3 right-1/3 w-48 h-48 rounded-full bg-yellow-accent/20 blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        
        {/* Logo/Brand Section */}
        <div 
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
        >
          {/* Glowing Orb with Icon */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 rounded-full bg-cyan-primary/30 blur-2xl animate-pulse-slow" />
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-cyan-primary/20 to-orange-primary/20 border-4 border-cyan-primary/50 flex items-center justify-center shadow-glow-cyan">
              <Zap className="w-24 h-24 text-cyan-primary animate-glow" strokeWidth={2.5} />
            </div>
          </div>

          {/* App Title */}
          <h1 
            className="text-8xl md:text-9xl font-black mb-4 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #00E5FF 0%, #5FF5FF 50%, #00B8D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(0, 229, 255, 0.5))'
            }}
          >
            THINK QUICK
          </h1>

          <p className="text-2xl md:text-3xl text-text-secondary font-semibold tracking-wide">
            It's not just what you know — it's how{' '}
            <span className="text-orange-primary font-bold">quick</span> you are!
          </p>
        </div>

        {/* Action Buttons */}
        <div 
          className={`flex flex-col md:flex-row gap-6 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Host Game Button */}
          <button
            onClick={() => navigate('/host')}
            className="group relative px-12 py-6 bg-gradient-to-r from-cyan-primary to-cyan-dark rounded-2xl overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-glow-cyan"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-light to-cyan-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <Users className="w-8 h-8 text-bg-primary" strokeWidth={2.5} />
              <div className="text-left">
                <div className="text-2xl font-black text-bg-primary">HOST GAME</div>
                <div className="text-sm text-bg-primary/80 font-semibold">Create a new session</div>
              </div>
            </div>
          </button>

          {/* Join Game Button */}
          <button
            onClick={() => navigate('/join')}
            className="group relative px-12 py-6 glass rounded-2xl border-2 border-cyan-primary/50 overflow-hidden transition-all duration-300 hover:scale-110 hover:border-orange-primary hover:shadow-glow-orange"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-primary to-yellow-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <Play className="w-8 h-8 text-cyan-primary group-hover:text-orange-primary transition-colors" strokeWidth={2.5} />
              <div className="text-left">
                <div className="text-2xl font-black text-text-primary">JOIN GAME</div>
                <div className="text-sm text-text-secondary font-semibold">Enter game code</div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div 
          className={`mt-20 text-center transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-text-muted font-semibold text-lg">
            Powered by Your Studio • Play Anywhere. Anytime.
          </p>
        </div>
      </div>

      {/* Decorative Speed Lines (like Image 2) */}
      <div className="absolute top-1/2 right-0 w-1/2 h-1 bg-gradient-to-r from-transparent via-orange-primary to-transparent opacity-30 blur-sm" />
      <div className="absolute top-1/2 right-0 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-cyan-primary to-transparent opacity-50 translate-y-4" />
    </div>
  );
};

export default LandingPage;