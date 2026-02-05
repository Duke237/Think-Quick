import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Title */}
        <div className="text-center mb-16 animate-fade-in">
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
          <Card
            variant="cyan"
            glow
            padding="large"
            className="cursor-pointer hover:scale-105 transition-transform animate-scale-in"
            onClick={() => navigate('/live/setup')}
          >
            <div className="text-center">
              <div className="text-6xl mb-6 text-cyan-primary">DISPLAY</div>
              <h2 className="text-3xl font-bold text-cyan-primary mb-4">Live Game Show</h2>
              <p className="text-text-secondary mb-6">
                Perfect for live events, classrooms, and presentations
              </p>
              <div className="text-left space-y-2 text-text-muted">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-primary">CHECK</span>
                  <span>One host, one screen</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-primary">CHECK</span>
                  <span>No player devices needed</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-primary">CHECK</span>
                  <span>TV/projector friendly</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-primary">CHECK</span>
                  <span>Manual answer input</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Online Mode */}
          <Card
            variant="orange"
            glow
            padding="large"
            className="cursor-pointer hover:scale-105 transition-transform animate-scale-in"
            onClick={() => navigate('/online/mode-select')}
          >
            <div className="text-center">
              <div className="text-6xl mb-6 text-orange-primary">NETWORK</div>
              <h2 className="text-3xl font-bold text-orange-primary mb-4">Online Multiplayer</h2>
              <p className="text-text-secondary mb-6">
                Perfect for remote teams and distributed gameplay
              </p>
              <div className="text-left space-y-2 text-text-muted">
                <div className="flex items-start gap-2">
                  <span className="text-orange-primary">CHECK</span>
                  <span>Players on their devices</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-primary">CHECK</span>
                  <span>Join with session code</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-primary">CHECK</span>
                  <span>Play from anywhere</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-primary">CHECK</span>
                  <span>Real-time sync</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 text-center animate-fade-in">
          <div className="text-text-muted">
            <div className="text-5xl mb-3 text-cyan-primary"></div>
            <div className="font-semibold text-text-secondary mb-2">Real-Time</div>
            <div className="text-sm">Live gameplay updates</div>
          </div>
          <div className="text-text-muted">
            <div className="text-5xl mb-3 text-cyan-primary"></div>
            <div className="font-semibold text-text-secondary mb-2">Voice Control</div>
            <div className="text-sm">Hands-free timer control</div>
          </div>
          <div className="text-text-muted">
            <div className="text-5xl mb-3 text-cyan-primary"></div>
            <div className="font-semibold text-text-secondary mb-2">Fast Money</div>
            <div className="text-sm">Bonus round included</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;