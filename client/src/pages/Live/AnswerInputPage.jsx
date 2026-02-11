import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Input } from '../../components';
import audioService from '../../services/audio';

const AnswerInputPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, team, questions = [], teamAAnswers = [] } = location.state || {};

  console.log('========================================');
  console.log('ANSWER INPUT PAGE - Questions received:');
  console.log('========================================');
  console.log('Questions:', questions);
  console.log('Questions length:', questions.length);
  console.log('Questions[0]:', questions[0]);
  console.log('Questions[0].answers:', questions[0]?.answers);
  
  // Rest of component...
  const [answers, setAnswers] = useState(
    questions.map(() => ({ answer: '', points: 0 }))
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = { answer: value, points: 0 };
    setAnswers(newAnswers);
    setDuplicateWarning(null); // Clear warning when typing
  };

  const checkDuplicate = (answer) => {
    if (team === 'B' && teamAAnswers.length > 0) {
      const answerLower = answer.toLowerCase().trim();
      return teamAAnswers.some(
        ta => ta.answer && ta.answer.toLowerCase().trim() === answerLower
      );
    }
    return false;
  };

  const handleNext = () => {
    const currentAnswer = answers[currentQuestionIndex].answer;

    if (!currentAnswer.trim()) {
      alert('Please enter an answer');
      return;
    }

    // Check for duplicate (Team B only)
    if (checkDuplicate(currentAnswer)) {
      audioService.play('wrong', 0.8);
      setDuplicateWarning(currentQuestionIndex);
      alert(`DUPLICATE! Team A already said "${currentAnswer}". Please try a different answer.`);
      return;
    }

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setDuplicateWarning(null);
    }
  };

  const handleSubmit = () => {
    // Check if all answers are filled
    const unanswered = answers.findIndex(a => !a.answer.trim());
    if (unanswered !== -1) {
      alert(`Please answer question ${unanswered + 1}`);
      setCurrentQuestionIndex(unanswered);
      return;
    }

    // Navigate back to game board with answers
    navigate('/live/game', {
      state: {
        sessionId,
        answersComplete: true,
        team,
        answers
      },
      replace: true
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-5xl font-bold mb-4 ${
            team === 'A' ? 'text-cyan-primary' : 'text-orange-primary'
          }`}>
            Team {team} - Enter Answers
          </h1>
          <p className="text-text-secondary text-xl">
            Host: Type in the answers that Team {team} gave
          </p>
          {team === 'B' && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-500 text-yellow-300 p-3 rounded-xl">
              Warning: Do not duplicate Team A's answers!
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-text-muted mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{answers.filter(a => a.answer.trim()).length}/{questions.length} answered</span>
          </div>
          <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-cyan transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <Card padding="large">
          <div className="space-y-6">
            {/* Current Question */}
            <div className={`p-6 rounded-xl ${
              duplicateWarning === currentQuestionIndex 
                ? 'bg-red-500/20 border-2 border-red-500 animate-shake' 
                : 'bg-bg-tertiary'
            }`}>
              <label className="text-text-secondary font-semibold text-lg block mb-4">
                Q{currentQuestionIndex + 1}: {questions[currentQuestionIndex]?.text}
              </label>
              <Input
                value={answers[currentQuestionIndex]?.answer || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Team ${team}'s answer...`}
                fullWidth
                className="text-2xl"
                autoFocus
              />
              {duplicateWarning === currentQuestionIndex && (
                <div className="text-red-400 font-semibold mt-2 animate-pulse">
                  DUPLICATE! Try a different answer.
                </div>
              )}
            </div>

            {/* Show Team A's answers (Team B only) */}
            {team === 'B' && teamAAnswers.length > 0 && (
              <div className="bg-bg-tertiary p-4 rounded-xl">
                <div className="text-text-muted text-sm mb-2">Team A's Answers (Don't duplicate):</div>
                <div className="grid grid-cols-5 gap-2">
                  {teamAAnswers.map((ans, i) => (
                    <div 
                      key={i} 
                      className={`text-center p-2 rounded ${
                        i === currentQuestionIndex ? 'bg-yellow-500/30' : 'bg-bg-secondary'
                      }`}
                    >
                      <div className="text-xs text-text-muted">Q{i + 1}</div>
                      <div className="text-sm text-cyan-primary font-semibold truncate">
                        {ans.answer || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                variant={team === 'A' ? 'primary' : 'secondary'}
                size="lg"
                onClick={handleNext}
                className="flex-1"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Submit All' : 'Next'}
              </Button>
            </div>

            {/* All Answers Preview */}
            <div className="mt-6 pt-6 border-t border-bg-tertiary">
              <div className="text-text-muted text-sm mb-3">All Answers:</div>
              <div className="grid grid-cols-5 gap-2">
                {answers.map((ans, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`p-2 rounded text-center transition-all ${
                      i === currentQuestionIndex 
                        ? 'bg-cyan-primary text-bg-primary' 
                        : ans.answer.trim() 
                          ? 'bg-bg-tertiary text-text-primary' 
                          : 'bg-bg-secondary text-text-muted'
                    }`}
                  >
                    <div className="text-xs mb-1">Q{i + 1}</div>
                    <div className="text-sm font-semibold truncate">
                      {ans.answer || '?'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnswerInputPage;