import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button } from '../../components';
import { playSound } from '../../utils/helpers';

const AnswerComparison = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    sessionId, 
    teamName, 
    answer, 
    correctAnswers = [],
    teamScore,
    roundNumber,
    nextTeam 
  } = location.state || {};

  const [matchedAnswer, setMatchedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    // Check if answer matches any correct answer
    const match = correctAnswers.find(ca => 
      ca.text.toLowerCase().trim() === answer?.toLowerCase().trim()
    );

    if (match) {
      setMatchedAnswer(match);
      setIsCorrect(true);
      setPoints(match.points);
      playSound('/sounds/correct.mp3', 0.7);
    } else {
      setIsCorrect(false);
      playSound('/sounds/wrong.mp3', 0.7);
    }
  }, [answer, correctAnswers]);

  const handleContinue = () => {
    if (nextTeam) {
      // Go to clock page for next team
      navigate('/clock', {
        state: {
          sessionId,
          duration: 20,
          teamName: nextTeam,
          returnPath: '/live/answer-comparison'
        }
      });
    } else {
      // Both teams done, go to next question
      navigate('/live/game', {
        state: {
          sessionId,
          nextQuestion: true
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <Card padding="large" className="max-w-4xl w-full">
        <div className="text-center space-y-8">
          {/* Team Name */}
          <div className="text-3xl font-bold text-cyan-primary">
            {teamName}
          </div>

          {/* Answer Display */}
          <div className="space-y-4">
            <div className="text-text-muted text-lg">Your Answer:</div>
            <div className="text-5xl font-bold text-text-primary bg-bg-tertiary py-6 rounded-xl">
              {answer || 'No answer provided'}
            </div>
          </div>

          {/* Result */}
          {isCorrect ? (
            <div className="space-y-6 animate-scale-in">
              <div className="text-6xl font-bold text-green-500 animate-pulse">
                CORRECT!
              </div>
              <div className="text-4xl font-bold text-cyan-primary">
                +{points} Points
              </div>
              {matchedAnswer && (
                <div className="bg-gradient-cyan text-bg-primary py-4 px-8 rounded-xl inline-block">
                  <div className="text-sm opacity-80">Matched Answer:</div>
                  <div className="text-2xl font-bold">{matchedAnswer.text}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-scale-in">
              <div className="text-6xl font-bold text-red-500 animate-pulse">
                WRONG!
              </div>
              <div className="text-2xl text-text-muted">
                Not on the board
              </div>
            </div>
          )}

          {/* Score Summary */}
          <div className="pt-8 border-t border-bg-tertiary">
            <div className="text-text-muted mb-2">Current Score:</div>
            <div className="text-4xl font-bold text-cyan-primary">
              {teamScore + (isCorrect ? points : 0)}
            </div>
          </div>

          {/* Continue Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleContinue}
          >
            {nextTeam ? `Continue to ${nextTeam}` : 'Next Question'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AnswerComparison;