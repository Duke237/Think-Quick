const Scoreboard = ({ teams, currentTeamIndex }) => {
  return (
    <div className="flex gap-4">
      {teams.map((team, idx) => (
        <div
          key={team.id}
          className={`px-8 py-6 rounded-2xl transition-all duration-300 ${
            idx === currentTeamIndex ? 'pulse-glow scale-105' : ''
          }`}
          style={{
            background: idx === currentTeamIndex 
              ? `linear-gradient(135deg, ${team.color}, ${team.color}dd)`
              : 'var(--glass-bg)',
            border: `2px solid ${idx === currentTeamIndex ? 'var(--accent-glow)' : team.color}`
          }}
        >
          <div className="text-white font-bold text-xl mb-2">{team.name}</div>
          <div className="text-white text-4xl font-bold">{team.score}</div>
        </div>
      ))}
    </div>
  );
};