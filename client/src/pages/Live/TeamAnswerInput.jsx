import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Input } from '../../components';

const TeamAnswerInput = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, team, teamName } = location.state || {};
  
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      // Navigate back to game board with answer
      navigate('/live/game', {
        state: {
          sessionId,
          fromTimer: true,
          team,
          teamAnswer: answer.trim()
        },
        replace: true // Use replace to avoid back button issues
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <Card padding="large" className="max-w-2xl w-full">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-cyan-primary">
            {teamName || `Team ${team}`}
          </h1>
          
          <div className="text-text-secondary text-xl">
            Enter your answer:
          </div>

          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here..."
            fullWidth
            className="text-2xl text-center"
            autoFocus
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            disabled={!answer.trim()}
          >
            Submit Answer
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TeamAnswerInput;