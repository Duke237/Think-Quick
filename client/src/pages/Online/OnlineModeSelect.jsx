import { useNavigate } from 'react-router-dom';

const OnlineModeSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-5xl font-bold text-cyan-primary text-center mb-12">
          Online Multiplayer Mode
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Host Game */}
          <button
            onClick={() => navigate('/online/host/setup')}
            className="bg-gradient-cyan text-bg-primary font-bold text-xl py-12 px-8 rounded-2xl
                     shadow-glow-cyan hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-4">HOST</div>
            <div className="text-2xl mb-4">Host Game</div>
            <div className="text-sm opacity-80">
              Create a new game session and invite players
            </div>
          </button>

          {/* Join Game */}
          <button
            onClick={() => navigate('/online/player/join')}
            className="bg-gradient-warm text-bg-primary font-bold text-xl py-12 px-8 rounded-2xl
                     shadow-glow-orange hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-4">PLAYER</div>
            <div className="text-2xl mb-4">Join Game</div>
            <div className="text-sm opacity-80">
              Enter a session code to join an existing game
            </div>
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-8 w-full text-text-muted hover:text-text-primary transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OnlineModeSelect;