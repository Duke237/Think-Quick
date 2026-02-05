import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socket';
import { DEFAULT_SETTINGS } from '../../utils/constants';
import { Button, Card, Input } from '../../components';

const HostSetup = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  const handleCreateGame = () => {
    setLoading(true);
    socketService.connect();
    
    socketService.createGame(settings, (response) => {
      setLoading(false);
      
      if (response.success) {
        const sessionId = response.sessionId;
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('isHost', 'true');
        localStorage.setItem('isLiveMode', 'false');
        
        navigate(`/online/lobby?session=${sessionId}`);
      } else {
        alert('Failed to create game: ' + response.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-2xl w-full animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-cyan-primary mb-4">
            Host Setup
          </h1>
          <p className="text-text-secondary text-lg">
            Configure your online game settings
          </p>
        </div>

        <Card title="Game Settings" padding="large" className="mb-8">
          <div className="space-y-6">
            <Input
              label="Max Strikes"
              type="number"
              min="1"
              max="5"
              value={settings.MAX_STRIKES}
              onChange={(e) => setSettings({ ...settings, MAX_STRIKES: parseInt(e.target.value) })}
              helperText="Number of wrong answers allowed per round"
              fullWidth
            />

            <Input
              label="Timer Duration (seconds)"
              type="number"
              min="10"
              max="60"
              value={settings.TIMER_SECONDS}
              onChange={(e) => setSettings({ ...settings, TIMER_SECONDS: parseInt(e.target.value) })}
              helperText="Time limit for answering each question"
              fullWidth
            />

            <Input
              label="Fast Money Target"
              type="number"
              min="50"
              max="200"
              value={settings.FAST_MONEY_TARGET}
              onChange={(e) => setSettings({ ...settings, FAST_MONEY_TARGET: parseInt(e.target.value) })}
              helperText="Points needed to win the bonus in Fast Money round"
              fullWidth
            />

            <Input
              label="Fast Money Bonus"
              type="number"
              min="100"
              max="1000"
              step="100"
              value={settings.FAST_MONEY_BONUS}
              onChange={(e) => setSettings({ ...settings, FAST_MONEY_BONUS: parseInt(e.target.value) })}
              helperText="Bonus points awarded for reaching the Fast Money target"
              fullWidth
            />
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => navigate('/online/mode-select')}
          >
            Back
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onClick={handleCreateGame}
          >
            Create Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HostSetup;