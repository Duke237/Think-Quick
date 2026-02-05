import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components';

const OnlineModeSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-4xl w-full animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-cyan-primary mb-4">
            Online Multiplayer Mode
          </h1>
          <p className="text-text-secondary text-lg">
            Choose how you want to participate
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Host Game */}
          <Card
            variant="cyan"
            glow
            padding="large"
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/online/host/setup')}
          >
            <div className="text-center">
              <div className="text-6xl mb-6 text-cyan-primary">DESKTOP</div>
              <h2 className="text-3xl font-bold text-cyan-primary mb-4">Host Game</h2>
              <p className="text-text-secondary mb-6">
                Create a new game session and manage the game
              </p>
              <div className="text-left space-y-2 text-text-muted">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-primary">CHECK</span>
                  <span>Control game flow</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-primary">CHECK</span>
                  <span>Generate session code</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-primary">CHECK</span>
                  <span>Manage questions & scoring</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Join Game */}
          <Card
            variant="orange"
            glow
            padding="large"
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/online/player/join')}
          >
            <div className="text-center">
              <div className="text-6xl mb-6 text-orange-primary">SMARTPHONE</div>
              <h2 className="text-3xl font-bold text-orange-primary mb-4">Join Game</h2>
              <p className="text-text-secondary mb-6">
                Enter a session code to join an existing game
              </p>
              <div className="text-left space-y-2 text-text-muted">
                <div className="flex items-start gap-2">
                  <span className="text-orange-primary">CHECK</span>
                  <span>Play from your device</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-primary">CHECK</span>
                  <span>Answer questions</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-primary">CHECK</span>
                  <span>See live scores</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default OnlineModeSelect;