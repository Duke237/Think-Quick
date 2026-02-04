import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-bold mb-4 bg-gradient-cyan bg-clip-text text-transparent animate-glow">
            Think Quick
          </h1>
          <p className="text-2xl text-text-secondary">
            Family Feud Style Game Show
          </p>
        </div>

        {/* Game Mode Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Live/Onsite Mode */}
          <button
            onClick={() => navigate('/live/setup')}
            className="bg-gradient-cyan text-bg-primary font-bold text-xl py-12 px-8 rounded-2xl
                     shadow-glow-cyan hover:scale-105 transition-transform group"
          >
            <div className="text-5xl mb-4">TV</div>
            <div className="text-2xl mb-2">Live Game Show</div>
            <div className="text-sm opacity-80 mt-4 text-left">
              <div className="mb-2">Perfect for:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Live events & presentations</li>
                <li>Classrooms & team building</li>
                <li>One host, one screen</li>
                <li>No player devices needed</li>
              </ul>
            </div>
          </button>

          {/* Online Mode */}
          <button
            onClick={() => navigate('/online/mode-select')}
            className="bg-gradient-warm text-bg-primary font-bold text-xl py-12 px-8 rounded-2xl
                     shadow-glow-orange hover:scale-105 transition-transform"
          >
            <div className="text-5xl mb-4">WIFI</div>
            <div className="text-2xl mb-2">Online Multiplayer</div>
            <div className="text-sm opacity-80 mt-4 text-left">
              <div className="mb-2">Perfect for:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Remote team games</li>
                <li>Players on their devices</li>
                <li>Join with session code</li>
                <li>Play from anywhere</li>
              </ul>
            </div>
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 text-text-muted text-center">
          <div>
            <div className="text-4xl mb-2"></div>
            <div className="font-semibold text-text-secondary">Real-Time</div>
            <div className="text-sm">Live gameplay updates</div>
          </div>
          <div>
            <div className="text-4xl mb-2"></div>
            <div className="font-semibold text-text-secondary">Voice Control</div>
            <div className="text-sm">Hands-free timer control</div>
          </div>
          <div>
            <div className="text-4xl mb-2"></div>
            <div className="font-semibold text-text-secondary">Fast Money</div>
            <div className="text-sm">Bonus round included</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;