import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socket';
import { DEFAULT_SETTINGS } from '../../utils/constants';
import { Button, Card, Input } from '../../components';

const LiveSetup = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [teamAPlayers, setTeamAPlayers] = useState(['']);
  const [teamBPlayers, setTeamBPlayers] = useState(['']);
  const [loading, setLoading] = useState(false);

  const addPlayerSlot = (team) => {
    if (team === 'A') {
      setTeamAPlayers([...teamAPlayers, '']);
    } else {
      setTeamBPlayers([...teamBPlayers, '']);
    }
  };

  const updatePlayerName = (team, index, name) => {
    if (team === 'A') {
      const updated = [...teamAPlayers];
      updated[index] = name;
      setTeamAPlayers(updated);
    } else {
      const updated = [...teamBPlayers];
      updated[index] = name;
      setTeamBPlayers(updated);
    }
  };

  const removePlayerSlot = (team, index) => {
    if (team === 'A') {
      setTeamAPlayers(teamAPlayers.filter((_, i) => i !== index));
    } else {
      setTeamBPlayers(teamBPlayers.filter((_, i) => i !== index));
    }
  };

  const handleStartGame = () => {
    const teamA = teamAPlayers.filter(name => name.trim());
    const teamB = teamBPlayers.filter(name => name.trim());

    if (teamA.length === 0 || teamB.length === 0) {
      alert('Please add at least one player to each team');
      return;
    }

    setLoading(true);
    socketService.connect();

    socketService.createGame({ ...settings, isLiveMode: true }, (response) => {
      if (response.success) {
        const sessionId = response.sessionId;
        
        let registeredCount = 0;
        const totalPlayers = teamA.length + teamB.length;

        const checkComplete = () => {
          registeredCount++;
          if (registeredCount === totalPlayers) {
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('isHost', 'true');
            localStorage.setItem('isLiveMode', 'true');
            navigate(`/live/game?session=${sessionId}`);
          }
        };

        teamA.forEach((name) => {
          socketService.registerPlayer(sessionId, name, 'A', checkComplete);
        });

        teamB.forEach((name) => {
          socketService.registerPlayer(sessionId, name, 'B', checkComplete);
        });
      } else {
        setLoading(false);
        alert('Failed to create game: ' + response.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-cyan-primary mb-4">
            Live Game Setup
          </h1>
          <p className="text-text-secondary text-lg">
            Configure your game and add players
          </p>
        </div>

        {/* Settings */}
        <Card title="Game Settings" className="mb-8 animate-scale-in">
          <div className="grid md:grid-cols-3 gap-6">
            <Input
              label="Max Strikes"
              type="number"
              min="1"
              max="5"
              value={settings.MAX_STRIKES}
              onChange={(e) => setSettings({ ...settings, MAX_STRIKES: parseInt(e.target.value) })}
              fullWidth
            />
            <Input
              label="Timer (seconds)"
              type="number"
              min="10"
              max="60"
              value={settings.TIMER_SECONDS}
              onChange={(e) => setSettings({ ...settings, TIMER_SECONDS: parseInt(e.target.value) })}
              fullWidth
            />
            <Input
              label="Fast Money Target"
              type="number"
              min="50"
              max="200"
              value={settings.FAST_MONEY_TARGET}
              onChange={(e) => setSettings({ ...settings, FAST_MONEY_TARGET: parseInt(e.target.value) })}
              fullWidth
            />
          </div>
        </Card>

        {/* Team Setup */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Team A */}
          <Card variant="cyan" padding="large" className="animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cyan-primary">Team A</h2>
              <span className="text-text-muted">{teamAPlayers.filter(n => n.trim()).length} players</span>
            </div>
            <div className="space-y-4">
              {teamAPlayers.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => updatePlayerName('A', index, e.target.value)}
                    placeholder={`Player ${index + 1} name`}
                    fullWidth
                  />
                  {teamAPlayers.length > 1 && (
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => removePlayerSlot('A', index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => addPlayerSlot('A')}
              >
                + Add Player
              </Button>
            </div>
          </Card>

          {/* Team B */}
          <Card variant="orange" padding="large" className="animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-orange-primary">Team B</h2>
              <span className="text-text-muted">{teamBPlayers.filter(n => n.trim()).length} players</span>
            </div>
            <div className="space-y-4">
              {teamBPlayers.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => updatePlayerName('B', index, e.target.value)}
                    placeholder={`Player ${index + 1} name`}
                    fullWidth
                  />
                  {teamBPlayers.length > 1 && (
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => removePlayerSlot('B', index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outlineOrange"
                size="md"
                fullWidth
                onClick={() => addPlayerSlot('B')}
              >
                + Add Player
              </Button>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 animate-fade-in">
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onClick={handleStartGame}
          >
            Start Live Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveSetup;