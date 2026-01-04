import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { gameAPI } from '../services/api';
import socketService from '../services/socket';
import { useVoiceControl } from '../hooks/useVoiceControl';

const ClockPage = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const [timer, setTimer] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Voice control
  const handleVoiceCommand = (command) => {
    console.log('🎤 Processing command:', command);
    
    if (command.includes('start') || command.includes('go') || command.includes('begin')) {
      handleStart();
    } else if (command.includes('stop') || command.includes('pause') || command.includes('halt')) {
      handleStop();
    } else if (command.includes('reset') || command.includes('restart')) {
      handleReset();
    }
  };

  const { isListening, isSupported, transcript, toggleListening } = useVoiceControl(handleVoiceCommand);

  useEffect(() => {
    // Connect socket
    socketService.connect();
    socketService.joinGame(code);

    // Listen for timer events
    socketService.on('timer-started', () => {
      setIsRunning(true);
    });

    socketService.on('timer-stopped', () => {
      setIsRunning(false);
    });

    socketService.on('timer-reset', (data) => {
      setTimer(data.timer.value);
      setIsRunning(false);
    });

    socketService.on('timer-ended', () => {
      navigate(`/board/${code}`);
    });

    return () => {
      socketService.off('timer-started');
      socketService.off('timer-stopped');
      socketService.off('timer-reset');
      socketService.off('timer-ended');
    };
  }, [code, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          const newValue = prev - 1;
          
          // Play tick sound
          if (newValue <= 10 && newValue > 0 && soundEnabled) {
            playTickSound();
          }
          
          // Timer ended
          if (newValue === 0) {
            setIsRunning(false);
            if (soundEnabled) {
              playEndSound();
            }
            handleTimerEnd();
            return 0;
          }
          
          return newValue;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timer, soundEnabled]);

  const handleStart = async () => {
    try {
      await gameAPI.startTimer(code);
      setIsRunning(true);
      if (soundEnabled) playStartSound();
    } catch (error) {
      console.error('❌ Error starting timer:', error);
    }
  };

  const handleStop = async () => {
    try {
      await gameAPI.stopTimer(code);
      setIsRunning(false);
    } catch (error) {
      console.error('❌ Error stopping timer:', error);
    }
  };

  const handleReset = async () => {
    try {
      const response = await gameAPI.resetTimer(code);
      setTimer(response.data.timer.value);
      setIsRunning(false);
    } catch (error) {
      console.error('❌ Error resetting timer:', error);
    }
  };

  const handleTimerEnd = async () => {
    try {
      await gameAPI.timerEnded(code);
      // Socket will handle redirect
    } catch (error) {
      console.error('❌ Error ending timer:', error);
    }
  };

  // Sound effects using Web Audio API
  const playSound = (frequency, duration, type = 'sine') => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playStartSound = () => playSound(800, 0.2);
  const playTickSound = () => playSound(600, 0.1);
  const playEndSound = () => {
    playSound(400, 0.3);
    setTimeout(() => playSound(300, 0.5), 300);
  };

  // Calculate circle progress
  const circumference = 2 * Math.PI * 140;
  const progress = ((25 - timer) / 25) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary relative overflow-hidden flex items-center justify-center">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000 ${
            timer <= 10 ? 'w-[800px] h-[800px]' : 'w-[600px] h-[600px]'
          }`}
          style={{
            background: timer <= 10 
              ? 'radial-gradient(circle, rgba(255, 59, 59, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(0, 229, 255, 0.4) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: timer <= 10 ? 'pulse 0.5s ease-in-out infinite' : 'pulse-slow 3s ease-in-out infinite'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        
        {/* Timer Circle */}
        <div className="relative inline-block mb-12">
          {/* Outer glow ring */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              timer <= 10 ? 'animate-pulse' : ''
            }`}
            style={{
              boxShadow: timer <= 10 
                ? '0 0 60px rgba(255, 59, 59, 0.8), 0 0 100px rgba(255, 59, 59, 0.6)'
                : '0 0 60px rgba(0, 229, 255, 0.6), 0 0 100px rgba(0, 229, 255, 0.4)'
            }}
          />

          {/* SVG Circle */}
          <svg className="w-96 h-96 transform -rotate-90" viewBox="0 0 320 320">
            {/* Background circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="20"
            />
            
            {/* Progress circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke={timer <= 10 ? '#FF3B3B' : '#00E5FF'}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              style={{
                transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
                filter: `drop-shadow(0 0 ${timer <= 10 ? '20px' : '10px'} ${timer <= 10 ? '#FF3B3B' : '#00E5FF'})`
              }}
            />
          </svg>

          {/* Timer Number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className={`font-digital transition-all duration-300 ${
                timer <= 10 ? 'text-red-400' : 'text-cyan-400'
              }`}
              style={{
                fontSize: '8rem',
                textShadow: timer <= 10 
                  ? '0 0 40px rgba(255, 59, 59, 0.8)'
                  : '0 0 40px rgba(0, 229, 255, 0.6)'
              }}
            >
              {timer}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={handleStart}
            disabled={isRunning || timer === 0}
            className="p-6 bg-cyan-primary/20 hover:bg-cyan-primary/30 border-2 border-cyan-primary rounded-2xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Play className="w-10 h-10 text-cyan-primary" strokeWidth={2.5} />
          </button>

          <button
            onClick={handleStop}
            disabled={!isRunning}
            className="p-6 bg-orange-primary/20 hover:bg-orange-primary/30 border-2 border-orange-primary rounded-2xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Pause className="w-10 h-10 text-orange-primary" strokeWidth={2.5} />
          </button>

          <button
            onClick={handleReset}
            disabled={isRunning}
            className="p-6 bg-yellow-accent/20 hover:bg-yellow-accent/30 border-2 border-yellow-accent rounded-2xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <RotateCcw className="w-10 h-10 text-yellow-accent" strokeWidth={2.5} />
          </button>
        </div>

        {/* Voice Control */}
        {isSupported && (
          <div className="mb-8">
            <button
              onClick={toggleListening}
              className={`px-8 py-4 rounded-2xl border-2 font-bold text-lg transition-all hover:scale-105 ${
                isListening
                  ? 'bg-green-500 border-green-400 text-white animate-pulse'
                  : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                {isListening ? (
                  <>
                    <Mic className="w-6 h-6" strokeWidth={2.5} />
                    <span>LISTENING...</span>
                  </>
                ) : (
                  <>
                    <MicOff className="w-6 h-6" strokeWidth={2.5} />
                    <span>ENABLE VOICE CONTROL</span>
                  </>
                )}
              </div>
            </button>

            {transcript && (
              <div className="mt-4 px-6 py-3 bg-cyan-primary/20 border-2 border-cyan-primary/50 rounded-xl">
                <p className="text-cyan-primary font-bold">
                  Heard: "{transcript}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-xl transition-all"
        >
          {soundEnabled ? (
            <Volume2 className="w-6 h-6 text-white" />
          ) : (
            <VolumeX className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Instructions */}
        <div className="mt-12 glass rounded-2xl p-6 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-cyan-primary mb-4">Voice Commands</h3>
          <div className="grid grid-cols-3 gap-4 text-text-secondary">
            <div>
              <p className="text-cyan-primary font-bold mb-2">"START" / "GO"</p>
              <p className="text-sm">Begin countdown</p>
            </div>
            <div>
              <p className="text-orange-primary font-bold mb-2">"STOP" / "PAUSE"</p>
              <p className="text-sm">Pause timer</p>
            </div>
            <div>
              <p className="text-yellow-accent font-bold mb-2">"RESET"</p>
              <p className="text-sm">Reset to 25s</p>
            </div>
          </div>
        </div>

        {/* Game Code */}
        <div className="mt-6 text-text-muted font-mono">
          Game: {code}
        </div>
      </div>
    </div>
  );
};

export default ClockPage;