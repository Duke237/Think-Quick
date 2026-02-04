import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socket';
import { DEFAULT_SETTINGS } from '../../utils/constants';

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
    // Filter out empty names
    const teamA = teamAPlayers.filter(name => name.trim());
    const teamB = teamBPlayers.filter(name => name.trim());

    if (teamA.length === 0 || teamB.length === 0) {
      alert('Please add at least one player to each team');
      return;
    }

    setLoading(true);
    socketService.connect();

    // Create game with live mode flag
    socketService.createGame({ ...settings, isLiveMode: true }, (response) => {
      if (response.success) {
        const sessionId = response.sessionId;
        
        // Register all players automatically
        let registeredCount = 0;
        const totalPlayers = teamA.length + teamB.length;

        // Register Team A players
        teamA.forEach((name) => {
          socketService.registerPlayer(sessionId, name, 'A', (res) => {
            registeredCount++;
            if (registeredCount === totalPlayers) {
              // All players registered, start game
              localStorage.setItem('sessionId', sessionId);
              localStorage.setItem('isHost', 'true');
              localStorage.setItem('isLiveMode', 'true');
              navigate(`/live/game?session=${sessionId}`);
            }
          });
        });

        // Register Team B players
        teamB.forEach((name) => {
          socketService.registerPlayer(sessionId, name, 'B', (res) => {
            registeredCount++;
            if (registeredCount === totalPlayers) {
              // All players registered, start game
              localStorage.setItem('sessionId', sessionId);
              localStorage.setItem('isHost', 'true');
              localStorage.setItem('isLiveMode', 'true');
              navigate(`/live/game?session=${sessionId}`);
            }
          });
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
        <h1 className="text-5xl font-bold text-cyan-primary text-center mb-12">
          Live Game Setup
        </h1>

        {/* Settings */}
        <div className="bg-bg-secondary rounded-2xl shadow-deep p-8 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Game Settings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-text-secondary mb-2">Max Strikes</label>
              <input
                type="number"
                min="1"
                max="5"
                value={settings.MAX_STRIKES}
                onChange={(e) => setSettings({ ...settings, MAX_STRIKES: parseInt(e.target.value) })}
                className="w-full bg-bg-tertiary text-text-primary px-4 py-3 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-2">Timer (seconds)</label>
              <input
                type="number"
                min="10"
                max="60"
                value={settings.TIMER_SECONDS}
                onChange={(e) => setSettings({ ...settings, TIMER_SECONDS: parseInt(e.target.value) })}
                className="w-full bg-bg-tertiary text-text-primary px-4 py-3 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Team Setup */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Team A */}
          <div className="bg-bg-secondary rounded-2xl shadow-deep p-8 border-2 border-cyan-primary">
            <h2 className="text-2xl font-bold text-cyan-primary mb-6">Team A</h2>
            <div className="space-y-4">
              {teamAPlayers.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updatePlayerName('A', index, e.target.value)}
                    placeholder={`Player ${index + 1} name`}
                    className="flex-1 bg-bg-tertiary text-text-primary px-4 py-3 rounded-xl"
                  />
                  {teamAPlayers.length > 1 && (
                    <button
                      onClick={() => removePlayerSlot('A', index)}
                      className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addPlayerSlot('A')}
                className="w-full py-3 border-2 border-cyan-primary text-cyan-primary rounded-xl
                         hover:bg-cyan-primary hover:text-bg-primary transition-all"
              >
                Add Player
              </button>
            </div>
          </div>

          {/* Team B */}
          <div className="bg-bg-secondary rounded-2xl shadow-deep p-8 border-2 border-orange-primary">
            <h2 className="text-2xl font-bold text-orange-primary mb-6">Team B</h2>
            <div className="space-y-4">
              {teamBPlayers.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updatePlayerName('B', index, e.target.value)}
                    placeholder={`Player ${index + 1} name`}
                    className="flex-1 bg-bg-tertiary text-text-primary px-4 py-3 rounded-xl"
                  />
                  {teamBPlayers.length > 1 && (
                    <button
                      onClick={() => removePlayerSlot('B', index)}
                      className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addPlayerSlot('B')}
                className="w-full py-3 border-2 border-orange-primary text-orange-primary rounded-xl
                         hover:bg-orange-primary hover:text-bg-primary transition-all"
              >
                Add Player
              </button>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-4 bg-bg-secondary text-text-muted rounded-xl hover:text-text-primary"
          >
            Back
          </button>
          <button
            onClick={handleStartGame}
            disabled={loading}
            className="flex-1 py-4 bg-gradient-cyan text-bg-primary font-bold rounded-xl
                     shadow-glow-cyan hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? 'Starting Game...' : 'Start Live Game'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveSetup;