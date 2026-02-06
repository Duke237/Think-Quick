import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { playSound } from '../utils/helpers';

const ClockPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, duration = 20, teamName, returnPath } = location.state || {};

  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Circle properties
  const radius = 200;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeRemaining / duration) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();
        
        console.log('Voice command:', command);
        
        if (command.includes('start') || command.includes('go') || command.includes('begin')) {
          handleStart();
        } else if (command.includes('stop') || command.includes('pause')) {
          handleStop();
        } else if (command.includes('reset')) {
          handleReset();
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Start voice recognition
  const startListening = () => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
        console.log('Voice recognition started');
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  // Stop voice recognition
  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      console.log('Voice recognition stopped');
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Timer countdown
  useEffect(() => {
    let interval = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            handleTimerComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    stopListening();
    
    // Play timer end sound
    playSound('/sounds/timer-end.mp3', 0.7);
    
    // Auto-redirect after 1 second
    setTimeout(() => {
      if (returnPath) {
        navigate(returnPath, { 
          state: { 
            sessionId, 
            teamName, 
            timerCompleted: true 
          } 
        });
      } else {
        navigate(-1);
      }
    }, 1000);
  }, [navigate, returnPath, sessionId, teamName]);

  const handleStart = () => {
    if (!isActive && timeRemaining > 0) {
      setIsActive(true);
      playSound('/sounds/timer-start.mp3', 0.5);
    }
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeRemaining(duration);
  };

  // Color based on time remaining
  const getColor = () => {
    if (timeRemaining <= 5) return '#ef4444'; // red
    if (timeRemaining <= 10) return '#f59e0b'; // orange
    return '#00E5FF'; // cyan
  };

  // Auto-start listening on mount
  useEffect(() => {
    startListening();
    return () => stopListening();
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8 relative">
      {/* Team Name */}
      {teamName && (
        <div className="absolute top-8 text-4xl font-bold text-cyan-primary">
          {teamName}
        </div>
      )}

      {/* Circular Timer */}
      <div className="relative">
        {/* SVG Circle */}
        <svg className="transform -rotate-90" width="500" height="500">
          {/* Background circle */}
          <circle
            cx="250"
            cy="250"
            r={radius}
            stroke="#1A2942"
            strokeWidth="20"
            fill="none"
          />
          {/* Progress circle */}
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

        {/* Timer Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="text-9xl font-bold font-mono transition-colors duration-300"
            style={{ color: getColor() }}
          >
            {timeRemaining.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Pulse animation when active */}
        {isActive && (
          <div 
            className="absolute inset-0 rounded-full animate-ping"
            style={{ 
              background: `radial-gradient(circle, ${getColor()}20 0%, transparent 70%)` 
            }}
          />
        )}
      </div>

      {/* Voice Control Indicator */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <button
          onClick={toggleListening}
          className={`relative p-6 rounded-full transition-all ${
            isListening 
              ? 'bg-red-500 shadow-glow-orange animate-pulse' 
              : 'bg-bg-tertiary hover:bg-bg-secondary'
          }`}
        >
          <svg 
            className="w-12 h-12 text-text-primary" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" 
              clipRule="evenodd" 
            />
          </svg>
          {isListening && (
            <div className="absolute -inset-2 border-4 border-red-500 rounded-full animate-ping" />
          )}
        </button>
        
        <div className="text-text-secondary text-lg">
          {isListening ? (
            <span className="text-red-400 font-semibold">Listening... Say "START", "STOP", or "RESET"</span>
          ) : (
            <span>Click microphone to enable voice control</span>
          )}
        </div>
      </div>

      {/* Manual Controls (backup) */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleStart}
          disabled={isActive || timeRemaining === 0}
          className="px-8 py-4 bg-gradient-cyan text-bg-primary font-bold rounded-xl 
                   hover:shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          START
        </button>
        <button
          onClick={handleStop}
          disabled={!isActive}
          className="px-8 py-4 bg-red-500 text-white font-bold rounded-xl 
                   hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          STOP
        </button>
        <button
          onClick={handleReset}
          className="px-8 py-4 bg-bg-tertiary text-text-primary font-bold rounded-xl 
                   hover:bg-bg-secondary transition-all"
        >
          RESET
        </button>
      </div>

      {/* Status Text */}
      <div className="mt-8 text-center">
        <div className="text-text-muted text-lg">
          {isActive ? 'Timer Running...' : timeRemaining === 0 ? 'Time\'s Up!' : 'Ready'}
        </div>
      </div>
    </div>
  );
};

export default ClockPage;