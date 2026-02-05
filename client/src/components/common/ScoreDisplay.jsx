import { formatScore } from '../../utils/helpers';

const ScoreDisplay = ({
  teamAScore = 0,
  teamBScore = 0,
  teamAName = 'Team A',
  teamBName = 'Team B',
  size = 'medium',
  showDifference = false,
  layout = 'horizontal'
}) => {
  const sizes = {
    small: { score: 'text-3xl', label: 'text-sm' },
    medium: { score: 'text-5xl', label: 'text-base' },
    large: { score: 'text-7xl', label: 'text-xl' },
    xlarge: { score: 'text-9xl', label: 'text-2xl' }
  };

  const difference = Math.abs(teamAScore - teamBScore);
  const leader = teamAScore > teamBScore ? 'A' : teamBScore > teamAScore ? 'B' : null;

  const ScoreCard = ({ team, score, name, color }) => (
    <div className={`flex flex-col items-center justify-center p-6 bg-bg-secondary rounded-2xl 
                    border-2 border-${color}-primary ${leader === team ? 'shadow-glow-' + color : ''}`}>
      <div className={`text-${color}-primary ${sizes[size].label} font-semibold mb-2`}>
        {name}
      </div>
      <div className={`text-${color}-primary ${sizes[size].score} font-bold font-mono`}>
        {formatScore(score)}
      </div>
      {leader === team && showDifference && difference > 0 && (
        <div className={`text-${color}-primary ${sizes[size].label} mt-2`}>
          +{formatScore(difference)}
        </div>
      )}
    </div>
  );

  if (layout === 'vertical') {
    return (
      <div className="flex flex-col gap-6">
        <ScoreCard team="A" score={teamAScore} name={teamAName} color="cyan" />
        <ScoreCard team="B" score={teamBScore} name={teamBName} color="orange" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <ScoreCard team="A" score={teamAScore} name={teamAName} color="cyan" />
      <ScoreCard team="B" score={teamBScore} name={teamBName} color="orange" />
    </div>
  );
};

export default ScoreDisplay;