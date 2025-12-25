import { Check, Users, ArrowRightCircle } from 'lucide-react';
import { useState } from 'react';
import socketService from '../../services/socket';

const HostControls = () => {
  const [answer, setAnswer] = useState('');
  const { game } = useGameStore();

  const submitAnswer = () => {
    if (!answer.trim()) return;
    const currentTeam = game.teams[game.currentTeamIndex];
    socketService.emit('submit-answer', { 
      answer: answer.trim(), 
      teamId: currentTeam.id 
    });
    setAnswer('');
  };

  const switchTeam = () => socketService.emit('switch-team');
  const endRound = () => socketService.emit('end-round');

  return (
    <div className="glass rounded-2xl p-6 slide-up">
      <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Host Controls
      </h3>
      <div className="flex gap-4">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
          placeholder="Enter player's answer..."
          className="flex-1 px-6 py-4 rounded-xl text-lg font-medium outline-none transition-all"
          style={{
            background: 'var(--glass-bg)',
            border: '2px solid rgba(0, 229, 255, 0.3)',
            color: 'var(--text-primary)'
          }}
        />
        <button
          onClick={submitAnswer}
          className="px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all hover:scale-105"
          style={{ background: 'var(--success)' }}
        >
          <Check className="w-6 h-6" />
          Submit
        </button>
        <button
          onClick={switchTeam}
          className="px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all hover:scale-105"
          style={{ background: 'var(--orange)' }}
        >
          <Users className="w-6 h-6" />
          Switch
        </button>
        <button
          onClick={endRound}
          className="px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all hover:scale-105"
          style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
        >
          <ArrowRightCircle className="w-6 h-6" />
          End Round
        </button>
      </div>
    </div>
  );
};