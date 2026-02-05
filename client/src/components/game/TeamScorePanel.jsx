import { formatScore } from '../../utils/helpers';

const TeamScorePanel = ({ 
  teamAScore = 0, 
  teamBScore = 0,
  teamAName = 'Team A',
  teamBName = 'Team B',
  activeTeam = null,
  teamAPlayers = [],
  teamBPlayers = []
}) => {
  const TeamCard = ({ team, score, name, players, isActive }) => {
    const color = team === 'A' ? 'cyan' : 'orange';
    const colorClass = team === 'A' ? 'text-cyan-primary' : 'text-orange-primary';
    const bgClass = team === 'A' ? 'bg-cyan-primary' : 'bg-orange-primary';
    const borderClass = team === 'A' ? 'border-cyan-primary' : 'border-orange-primary';
    const glowClass = team === 'A' ? 'shadow-glow-cyan' : 'shadow-glow-orange';

    return (
      <div className={`
        bg-bg-secondary rounded-2xl p-6 border-2 ${borderClass} 
        transition-all duration-300
        ${isActive ? `${glowClass} scale-105` : 'opacity-75'}
      `}>
        {/* Team Name */}
        <div className={`text-center mb-4 ${colorClass} font-bold text-2xl`}>
          {name}
          {isActive && (
            <div className="text-sm text-text-muted mt-1">ACTIVE</div>
          )}
        </div>

        {/* Score */}
        <div className={`text-center mb-4 ${colorClass} text-6xl font-bold font-mono`}>
          {formatScore(score)}
        </div>

        {/* Players */}
        {players.length > 0 && (
          <div className="mt-4 pt-4 border-t border-bg-tertiary">
            <div className="text-text-muted text-sm mb-2">Players:</div>
            <div className="space-y-1">
              {players.map((player, index) => (
                <div key={index} className="text-text-secondary text-sm">
                  {player.name || player}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <TeamCard 
        team="A" 
        score={teamAScore} 
        name={teamAName}
        players={teamAPlayers}
        isActive={activeTeam === 'A'}
      />
      <TeamCard 
        team="B" 
        score={teamBScore} 
        name={teamBName}
        players={teamBPlayers}
        isActive={activeTeam === 'B'}
      />
    </div>
  );
};

export default TeamScorePanel;