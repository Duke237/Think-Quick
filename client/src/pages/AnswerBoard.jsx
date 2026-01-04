import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Zap, Trophy, ArrowRight, Loader2, Crown } from 'lucide-react';
import { gameAPI } from '../services/api';
import socketService from '../services/socket';

const AnswerBoard = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const [game, setGame] = useState(null);
  const [question, setQuestion] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState([]);
  const [strikes, setStrikes] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Check if user is host
    const hostId = localStorage.getItem('hostId');
    setIsHost(!!hostId);

    // Connect socket
    socketService.connect();
    socketService.joinGame(code);

    // Fetch initial data
    fetchGameData();

    // Socket listeners
    socketService.on('question-loaded', handleQuestionLoaded);
    socketService.on('answer-correct', handleAnswerCorrect);
    socketService.on('answer-wrong', handleAnswerWrong);
    socketService.on('team-switched', handleTeamSwitched);
    socketService.on('round-complete', handleRoundComplete);
    socketService.on('next-round', handleNextRound);
    socketService.on('game-over', handleGameOver);

    return () => {
      socketService.off('question-loaded');
      socketService.off('answer-correct');
      socketService.off('answer-wrong');
      socketService.off('team-switched');
      socketService.off('round-complete');
      socketService.off('next-round');
      socketService.off('game-over');
    };
  }, [code]);

  const fetchGameData = async () => {
    try {
      const response = await gameAPI.getGame(code);
      if (response.data.success) {
        const gameData = response.data.game;
        setGame(gameData);
        setStrikes(gameData.strikes || 0);
        setRevealedAnswers(gameData.revealedAnswers || []);

        // Load question if not exists
        if (!gameData.currentQuestion) {
          await gameAPI.loadQuestion(code);
        } else {
          setQuestion(gameData.currentQuestion);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching game:', error);
      setLoading(false);
    }
  };

  const handleQuestionLoaded = (data) => {
    console.log('📝 Question loaded:', data.question);
    setQuestion(data.question);
    setRevealedAnswers([]);
    setStrikes(0);
  };

  const handleAnswerCorrect = (data) => {
    console.log('✅ Correct answer:', data);
    setRevealedAnswers(data.revealedAnswers);
    setGame(prev => ({ ...prev, teams: data.teams }));
    setShowConfetti(true);
    playCorrectSound();
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleAnswerWrong = (data) => {
    console.log('❌ Wrong answer:', data);
    setStrikes(data.strikes);
    playWrongSound();
  };

  const handleTeamSwitched = (data) => {
    console.log('🔄 Team switched:', data);
    setGame(prev => ({ ...prev, currentTeam: data.currentTeam }));
    setStrikes(0);
  };

  const handleRoundComplete = () => {
    console.log('🎉 Round complete!');
    // Show completion message briefly before allowing next
  };

  const handleNextRound = (data) => {
    console.log('➡️ Next round:', data);
    navigate(`/clock/${code}`);
  };

  const handleGameOver = () => {
    console.log('🏁 Game over!');
    navigate(`/results/${code}`);
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || submitting) return;

    setSubmitting(true);

    try {
      const currentTeam = game.teams[game.currentTeamIndex || 0];
      await gameAPI.submitAnswer(code, currentAnswer, currentTeam.id);
      setCurrentAnswer('');
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    try {
      await gameAPI.nextQuestion(code);
    } catch (error) {
      console.error('❌ Error loading next question:', error);
    }
  };

  // Sound effects
  const playSound = (frequency, duration) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  };

  const playCorrectSound = () => {
    playSound(800, 0.3);
    setTimeout(() => playSound(1000, 0.2), 100);
  };

  const playWrongSound = () => {
    playSound(200, 0.4);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-cyan-primary animate-spin" />
      </div>
    );
  }

  const isRevealed = (answerText) => {
    return revealedAnswers.some(ra => ra.text === answerText);
  };

  const currentTeam = game?.teams[game.currentTeamIndex || 0];
  const allAnswersRevealed = question && revealedAnswers.length >= question.answers.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary p-6 relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-orange-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: ['#00E5FF', '#FF9F1C', '#F5B942', '#4DFF88'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-[1800px] mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase">
              THINK QUICK
            </h1>
            <p className="text-xl text-cyan-300 font-bold mt-2">
              Round {game?.currentRound} • <span className="text-orange-400">x{game?.currentRound} Multiplier</span>
            </p>
          </div>

          {/* Scoreboard */}
          <div className="flex gap-4">
            {game?.teams.map((team, idx) => (
              <div
                key={team.id}
                className={`px-8 py-6 rounded-2xl backdrop-blur-xl border-2 transition-all ${
                  idx === (game.currentTeamIndex || 0)
                    ? 'scale-105 shadow-glow-cyan'
                    : ''
                }`}
                style={{
                  background: idx === (game.currentTeamIndex || 0)
                    ? `linear-gradient(135deg, ${team.color}40, ${team.color}20)`
                    : 'rgba(10, 22, 40, 0.4)',
                  borderColor: team.color + '60'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-6 h-6" style={{ color: team.color }} />
                  <span className="text-xl font-bold" style={{ color: team.color }}>{team.name}</span>
                </div>
                <div className="text-5xl font-black font-digital" style={{ color: team.color }}>
                  {team.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question */}
        {question && (
          <div className="glass rounded-3xl p-10 mb-6 shadow-deep">
            <div className="flex items-center justify-between mb-6">
              <span className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-bold text-sm uppercase">
                {question.category}
              </span>
              <span className={`px-6 py-2 rounded-full text-white font-bold text-sm uppercase ${
                question.difficulty === 'easy' ? 'bg-green-500' :
                question.difficulty === 'medium' ? 'bg-orange-500' :
                question.difficulty === 'hard' ? 'bg-red-500' : 'bg-purple-500'
              }`}>
                {question.difficulty}
              </span>
            </div>

            <h2 className="text-5xl font-bold text-center text-cyan-100 mb-8 uppercase">
              {question.question}
            </h2>

            {/* Strikes */}
            <div className="flex justify-center gap-6">
              {[...Array(game?.settings.maxStrikes || 3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all ${
                    i < strikes
                      ? 'bg-red-500 border-red-400 scale-110 shadow-lg'
                      : 'bg-red-500/20 border-red-500/30'
                  }`}
                >
                  <X className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answer Grid */}
        {question && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {question.answers.map((answer, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border-2 transition-all duration-500 ${
                  isRevealed(answer.text)
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-green-400 scale-[1.02] shadow-glow-cyan'
                    : 'bg-cyan-500/10 backdrop-blur-xl border-cyan-500/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-3xl font-black ${isRevealed(answer.text) ? 'text-white' : 'text-cyan-400'}`}>
                    {idx + 1}
                  </span>
                  <span className={`text-2xl font-bold uppercase ${isRevealed(answer.text) ? 'text-white' : 'text-cyan-100'}`}>
                    {isRevealed(answer.text) ? answer.text : '???'}
                  </span>
                  <span className={`text-3xl font-black font-digital ${isReve