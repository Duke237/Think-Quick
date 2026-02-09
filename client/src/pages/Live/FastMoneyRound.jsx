import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Input } from '../../components';
import audioService from '../../services/audio';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

const FastMoneyRound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    sessionId, 
    team, 
    questions = [], 
    duration = 20, 
    teamAAnswers = [] 
  } = location.state || {};

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Voice recognition for timer control
  const { isListening, startListening, stopListening } = useVoiceRecognition({
    start: ['start', 'go', 'begin'],
    startHandler: handleStart
  });

  // Timer countdown
  useEffect(() => {
    let interval;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  // Auto-start voice recognition
  useEffect(() => {
    startListening();
    return () => stopListening();
  }, []);

  function handleStart() {
    if (!isActive && timeRemaining > 0) {
      setIsActive(true);
      audioService.play('timerStart', 0.5);
    }
  }

  const handleTimeUp = useCallback(() => {
    setIsActive(false);
    audioService.play('timerEnd', 0.8);
    
    // Auto-navigate back after 2 seconds
    setTimeout(() => {
      navigate('/live/game', {
        state: {
          sessionId,
          fastMoneyComplete: true,
          team,
          answers
        },
        replace: true
      });
    }, 2000);
  }, [navigate, sessionId, team, answers]);

  const checkDuplicate = (answer) => {
    if (team === 'B' && teamAAnswers.length > 0) {
      const duplicate = teamAAnswers.some(
        ta => ta.answer.toLowerCase().trim() === answer.toLowerCase().trim()
      );
      return duplicate;
    }
    return false;
  };

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return;

    const duplicate = checkDuplicate(currentAnswer);
    
    if (duplicate) {
      // Buzzer sound and flash warning
      audioService.play('wrong', 0.8);
      setIsDuplicate(true);
      setTimeout(() => setIsDuplicate(false), 1000);
      return; // Don't submit, let them try again
    }

    // Find matching answer and calculate points
    const question = questions[currentQuestionIndex];
    const matched = question.answers?.find(a =>
      a.text.toLowerCase().trim() === currentAnswer.toLowerCase().trim()
    );

    const answerData = {
      questionIndex: currentQuestionIndex,
      answer: currentAnswer,
      points: matched ? matched.frequency : 0,
      isDuplicate: false
    };

    setAnswers([...answers, answerData]);
    setCurrentAnswer('');

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered
      setIsActive(false);
      handleTimeUp();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Card padding="large">
          <div className="text-center space-y-4">
            <div className="text-2xl text-red-400">Error: No questions loaded</div>
            <Button onClick={() => navigate('/live/game')}>
              Back to Game
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-5xl font-bold mb-4 ${
            team === 'A' ? 'text-cyan-primary' : 'text-orange-primary'
          }`}>
            Team {team} - Fast Money
          </h1>
          
          {/* Timer */}
          <div className={`text-8xl font-bold font-mono ${
            timeRemaining <= 5 ? 'text-red-500 animate-pulse' : 'text-cyan-primary'
          }`}>
            {timeRemaining}s
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-4 bg-bg-tertiary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-cyan transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-text-muted mt-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Current Question */}
        <Card padding="large" className="mb-8">
          <div className="text-center space-y-6">
            <div className="text-3xl font-bold text-text-primary">
              {currentQuestion?.text}
            </div>

            {/* Answer Input */}
            <div className={`transition-all ${isDuplicate ? 'animate-shake' : ''}`}>
              <Input
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Your answer..."
                fullWidth
                className={`text-2xl text-center ${
                  isDuplicate ? 'border-4 border-red-500' : ''
                }`}
                autoFocus
                disabled={!isActive || timeRemaining === 0}
              />
            </div>

            {isDuplicate && (
              <div className="bg-red-500/20 border-2 border-red-500 text-red-300 p-4 rounded-xl animate-pulse">
                <div className="text-2xl font-bold">DUPLICATE ANSWER!</div>
                <div>Team A already said that. Try again!</div>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim() || !isActive || timeRemaining === 0}
            >
              Submit Answer
            </Button>
          </div>
        </Card>

        {/* Answers Given */}
        <Card padding="normal">
          <div className="text-text-muted mb-2">Answers Given:</div>
          <div className="space-y-2">
            {answers.map((ans, index) => (
              <div key={index} className="bg-bg-tertiary p-3 rounded-lg flex justify-between">
                <span className="text-text-primary">Q{ans.questionIndex + 1}: {ans.answer}</span>
                <span className="text-cyan-primary font-semibold">{ans.points} pts</span>
              </div>
            ))}
            {answers.length === 0 && (
              <div className="text-text-muted italic text-center py-4">
                No answers yet
              </div>
            )}
          </div>
        </Card>

        {/* Start Button */}
        {!isActive && timeRemaining === duration && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card padding="large" className="max-w-md">
              <div className="text-center space-y-6">
                <div className="text-3xl font-bold text-text-primary">
                  Ready?
                </div>
                <div className="text-text-secondary">
                  {isListening ? (
                    <span className="text-red-400">Say "START" or click the button</span>
                  ) : (
                    'Click the button to begin'
                  )}
                </div>
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={handleStart}
                >
                  START
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FastMoneyRound;