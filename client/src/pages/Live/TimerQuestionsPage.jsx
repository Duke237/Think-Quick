import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components';
import audioService from '../../services/audio';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

const TimerQuestionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    sessionId, 
    team, 
    questions = [], 
    duration = 20,
    teamAAnswers = []
  } = location.state || {};

  console.log('========================================');
  console.log('TIMER PAGE - Questions received:');
  console.log('========================================');
  console.log('Questions:', questions);
  console.log('Questions length:', questions.length);
  console.log('Questions[0]:', questions[0]);
  console.log('Questions[0].answers:', questions[0]?.answers);

  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [micStatus, setMicStatus] = useState('checking');

  // Circle properties for timer
  const radius = 200;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeRemaining / duration) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Define handleStart BEFORE using it in useVoiceRecognition
  function handleStart() {
    if (!isActive && timeRemaining > 0) {
      setIsActive(true);
      audioService.play('timerStart', 0.5);
    }
  }

  // Voice recognition
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition({
    start: ['start', 'go', 'begin'],
    startHandler: handleStart
  });

  // Check microphone permission
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setMicStatus('granted');
        console.log('Microphone access granted');
      })
      .catch((err) => {
        setMicStatus('denied');
        console.error('Microphone access denied:', err);
      });
  }, []);

  // Auto-start listening
  useEffect(() => {
    if (micStatus === 'granted') {
      startListening();
    }
    return () => stopListening();
  }, [micStatus, startListening, stopListening]);

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

  const handleTimeUp = () => {
  setIsActive(false);
  audioService.play('timerEnd', 0.8);
  stopListening();
  
  // Navigate to answer input page
  setTimeout(() => {
    navigate('/live/answer-input', {
      state: {
        sessionId,
        team,
        questions,
        teamAAnswers: location.state?.teamAAnswers || [] // Pass through
      }
    });
  }, 2000);
};

  const getColor = () => {
    if (timeRemaining <= 5) return '#ef4444'; // red
    if (timeRemaining <= 10) return '#f59e0b'; // orange
    return team === 'A' ? '#00E5FF' : '#FF9F1C'; // cyan or orange
  };

  const handleManualStart = () => {
    handleStart();
  };

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Side - Timer */}
          <div className="flex flex-col items-center justify-center">
            <h1 className={`text-5xl font-bold mb-8 ${
              team === 'A' ? 'text-cyan-primary' : 'text-orange-primary'
            }`}>
              Team {team}
            </h1>

            {/* Circular Timer */}
            <div className="relative">
              <svg className="transform -rotate-90" width="500" height="500">
                <circle
                  cx="250"
                  cy="250"
                  r={radius}
                  stroke="#1A2942"
                  strokeWidth="20"
                  fill="none"
                />
                <circle
                  cx="250"
                  cy="250"
                  r={radius}
                  stroke={getColor()}
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
                    filter: `drop-shadow(0 0 20px ${getColor()})`
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="text-9xl font-bold font-mono transition-colors duration-300"
                  style={{ color: getColor() }}
                >
                  {timeRemaining}
                </div>
              </div>
            </div>

            {/* Voice Indicator and Manual Start */}
            <div className="mt-8 text-center space-y-4">
              {/* Microphone Status */}
              {micStatus === 'denied' && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-xl mb-4">
                  Microphone access denied! Please enable it in your browser settings.
                </div>
              )}

              {isListening && !isActive && (
                <>
                  <div className="text-red-400 font-semibold text-xl animate-pulse">
                    Listening... Say "START" or "GO"
                  </div>
                  <div className="text-text-muted text-sm">
                    Last heard: {transcript || 'Nothing yet'}
                  </div>
                </>
              )}
              
              {isActive && (
                <div className="text-cyan-primary font-semibold text-xl">
                  Answer the questions!
                </div>
              )}
              
              {/* Manual Start Button */}
              {!isActive && (
                <button
                  onClick={handleManualStart}
                  className="px-12 py-6 bg-gradient-cyan text-bg-primary text-2xl font-bold rounded-2xl 
                           hover:shadow-glow-cyan transition-all"
                >
                  CLICK TO START
                </button>
              )}
            </div>
          </div>

          {/* Right Side - Questions */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-text-primary mb-6">
              Questions
            </h2>
            
            {questions.map((question, index) => (
              <Card key={index} padding="normal" variant="gradient">
                <div className="flex items-start gap-4">
                  <div className={`text-3xl font-bold ${
                    team === 'A' ? 'text-cyan-primary' : 'text-orange-primary'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 text-xl text-text-primary">
                    {question.text}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerQuestionsPage;