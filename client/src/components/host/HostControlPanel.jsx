import { useState } from 'react';
import Button from '../ui/Button';  
import Input from '../ui/Input';    
import StrikeIndicator from '../common/StrikeIndicator';  

const HostControlPanel = ({
  onSubmitAnswer,
  onAddStrike,
  onSwitchTeam,
  onNextQuestion,
  onEndRound,
  onStartTimer,
  onStopTimer,
  onResetTimer,
  strikes = 0,
  maxStrikes = 3,
  activeTeam = 'A',
  timerActive = false,
  loading = false
}) => {
  const [answer, setAnswer] = useState('');

  const handleSubmitAnswer = () => {
    if (answer.trim()) {
      onSubmitAnswer(answer.trim());
      setAnswer('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  return (
    <div className="bg-bg-secondary rounded-2xl p-6 space-y-6">
      <h3 className="text-2xl font-bold text-cyan-primary">Host Controls</h3>

      {/* Answer Input */}
      <div>
        <label className="block text-text-secondary mb-2 font-semibold">
          Submit Answer
        </label>
        <div className="flex gap-2">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type answer here..."
            fullWidth
          />
          <Button
            variant="primary"
            onClick={handleSubmitAnswer}
            disabled={!answer.trim() || loading}
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Timer Controls */}
      <div>
        <label className="block text-text-secondary mb-2 font-semibold">
          Timer
        </label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={timerActive ? 'ghost' : 'primary'}
            size="md"
            onClick={onStartTimer}
            disabled={timerActive}
          >
            Start
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={onStopTimer}
            disabled={!timerActive}
          >
            Stop
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={onResetTimer}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Strike Controls */}
      <div>
        <label className="block text-text-secondary mb-2 font-semibold">
          Strikes
        </label>
        <div className="flex items-center justify-between">
          <StrikeIndicator 
            strikes={strikes} 
            maxStrikes={maxStrikes}
            size="small"
            showLabel={false}
          />
          <Button
            variant="danger"
            size="md"
            onClick={onAddStrike}
            disabled={strikes >= maxStrikes}
          >
            Add Strike
          </Button>
        </div>
      </div>

      {/* Team Controls */}
      <div>
        <label className="block text-text-secondary mb-2 font-semibold">
          Active Team: <span className={activeTeam === 'A' ? 'text-cyan-primary' : 'text-orange-primary'}>
            Team {activeTeam}
          </span>
        </label>
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={onSwitchTeam}
        >
          Switch to Team {activeTeam === 'A' ? 'B' : 'A'}
        </Button>
      </div>

      {/* Round Controls */}
      <div className="pt-4 border-t border-bg-tertiary space-y-2">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={onNextQuestion}
        >
          Next Question
        </Button>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={onEndRound}
        >
          End Round
        </Button>
      </div>
    </div>
  );
};

export default HostControlPanel;