import Card from '../ui/Card';  // Changed from { Card }

const QuestionDisplay = ({ 
  question, 
  roundNumber = 1, 
  multiplier = 1,
  category = 'General'
}) => {
  if (!question) {
    return (
      <Card padding="large" className="text-center">
        <div className="text-text-muted text-xl">
          Waiting for question...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Round Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-text-muted">Round {roundNumber}</span>
          <span className="text-text-muted">|</span>
          <span className="text-cyan-primary">{category}</span>
        </div>
        {multiplier > 1 && (
          <div className="bg-orange-primary text-bg-primary px-4 py-2 rounded-lg font-bold">
            {multiplier}x MULTIPLIER
          </div>
        )}
      </div>

      {/* Question */}
      <Card variant="cyan" glow padding="large">
        <div className="text-center">
          <div className="text-3xl md:text-5xl font-bold text-text-primary leading-tight">
            {question}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuestionDisplay;