import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socket';
import { SOCKET_EVENTS } from '../../utils/constants';
import { 
  Timer, 
  ScoreDisplay, 
  StrikeIndicator,
  LoadingSpinner,
  Modal,
  Button,
  QuestionDisplay,
  AnswerBoard,
  HostControlPanel
} from '../../components';

const LiveGameBoard = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState([]);
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [activeTeam, setActiveTeam] = useState('A');
  const [roundNumber, setRoundNumber] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [timerActive, setTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(20);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get('session') || localStorage.getItem('sessionId');
    
    if (!sid) {
      navigate('/live/setup');
      return;
    }

    setSessionId(sid);
    socketService.connect();
    
    // Load first question
    socketService.loadQuestion(sid, null, 1, (response) => {
      if (response.success) {
        setCurrentQuestion(response.question);
        setRoundNumber(response.round.roundNumber);
        setMultiplier(response.round.multiplier);
        setLoading(false);
      }
    });

    // Socket listeners
    socketService.on(SOCKET_EVENTS.ANSWER_REVEALED, handleAnswerRevealed);
    socketService.on(SOCKET_EVENTS.ANSWER_WRONG, handleWrongAnswer);
    socketService.on(SOCKET_EVENTS.SCORE_UPDATE, handleScoreUpdate);
    socketService.on(SOCKET_EVENTS.STRIKE_ADDED, handleStrikeAdded);
    socketService.on(SOCKET_EVENTS.TEAM_SWITCHED, handleTeamSwitched);
    socketService.on(SOCKET_EVENTS.TIMER_TICK, handleTimerTick);
    socketService.on(SOCKET_EVENTS.TIMER_UPDATE, handleTimerUpdate);

    return () => {
      socketService.off(SOCKET_EVENTS.ANSWER_REVEALED);
      socketService.off(SOCKET_EVENTS.ANSWER_WRONG);
      socketService.off(SOCKET_EVENTS.SCORE_UPDATE);
      socketService.off(SOCKET_EVENTS.STRIKE_ADDED);
      socketService.off(SOCKET_EVENTS.TEAM_SWITCHED);
      socketService.off(SOCKET_EVENTS.TIMER_TICK);
      socketService.off(SOCKET_EVENTS.TIMER_UPDATE);
    };
  }, [navigate]);

  const handleAnswerRevealed = (data) => {
    setRevealedAnswers(prev => [...prev, data.answer]);
  };

  const handleWrongAnswer = (data) => {
    console.log('Wrong answer:', data.submittedAnswer);
  };

  const handleScoreUpdate = (data) => {
    setTeamAScore(data.teamA);
    setTeamBScore(data.teamB);
  };

  const handleStrikeAdded = (data) => {
    setStrikes(data.strikes);
  };

  const handleTeamSwitched = (data) => {
    setActiveTeam(data.activeTeam);
  };

  const handleTimerTick = (data) => {
    setTimerRemaining(data.timeRemaining);
  };

  const handleTimerUpdate = (data) => {
    setTimerRemaining(data.timeRemaining);
    setTimerActive(data.active);
  };

  const handleSubmitAnswer = (answer) => {
    socketService.submitAnswer(sessionId, answer, (response) => {
      if (response.correct) {
        console.log('Correct answer!');
      } else {
        console.log('Wrong answer!');
      }
    });
  };

  const handleAddStrike = () => {
    setStrikes(prev => Math.min(prev + 1, 3));
  };

  const handleSwitchTeam = () => {
    socketService.switchTeam(sessionId, (response) => {
      if (response.success) {
        setActiveTeam(response.activeTeam);
      }
    });
  };

  const handleNextQuestion = () => {
    setRevealedAnswers([]);
    setStrikes(0);
    
    const nextRound = roundNumber + 1;
    const nextMultiplier = nextRound <= 3 ? nextRound : 3;
    
    socketService.loadQuestion(sessionId, null, nextMultiplier, (response) => {
      if (response.success) {
        setCurrentQuestion(response.question);
        setRoundNumber(response.round.roundNumber);
        setMultiplier(response.round.multiplier);
      }
    });
  };

  const handleEndRound = () => {
    socketService.endRound(sessionId, (response) => {
      if (response.success) {
        handleNextQuestion();
      }
    });
  };

  const handleStartTimer = () => {
    socketService.startTimer(sessionId, 20);
  };

  const handleStopTimer = () => {
    socketService.stopTimer(sessionId);
  };

  const handleResetTimer = () => {
    socketService.resetTimer(sessionId, 20);
  };

  const handleEndGame = () => {
    socketService.endGame(sessionId, (response) => {
      if (response.success) {
        setShowEndModal(true);
      }
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading game..." />;
  }

  const teamAPlayers = gameState?.players?.filter(p => p.team === 'A') || [];
  const teamBPlayers = gameState?.players?.filter(p => p.team === 'B') || [];

  return (
    <div className="min-h-screen bg-bg-primary p-4">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-3xl font-bold text-cyan-primary">
            Think Quick - Live Game
          </div>
          <Button variant="danger" onClick={handleEndGame}>
            End Game
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Game Area */}
          <div className="col-span-9 space-y-6">
            {/* Question */}
            <QuestionDisplay
              question={currentQuestion?.text}
              roundNumber={roundNumber}
              multiplier={multiplier}
              category={currentQuestion?.category}
            />

            {/* Timer */}
            <div className="flex justify-center">
              <Timer
                initialTime={timerRemaining}
                isActive={timerActive}
                size="large"
                variant="cyan"
              />
            </div>

            {/* Answer Board */}
            <AnswerBoard
              answers={currentQuestion?.answers || []}
              revealedAnswers={revealedAnswers}
              totalPoints={100}
            />

            {/* Strikes */}
            <div className="flex justify-center">
              <StrikeIndicator
                strikes={strikes}
                maxStrikes={3}
                size="large"
              />
            </div>

            {/* Scores */}
            <ScoreDisplay
              teamAScore={teamAScore}
              teamBScore={teamBScore}
              teamAName="Team A"
              teamBName="Team B"
              size="large"
              showDifference
            />
          </div>

          {/* Host Control Panel */}
          <div className="col-span-3">
            <HostControlPanel
              onSubmitAnswer={handleSubmitAnswer}
              onAddStrike={handleAddStrike}
              onSwitchTeam={handleSwitchTeam}
              onNextQuestion={handleNextQuestion}
              onEndRound={handleEndRound}
              onStartTimer={handleStartTimer}
              onStopTimer={handleStopTimer}
              onResetTimer={handleResetTimer}
              strikes={strikes}
              maxStrikes={3}
              activeTeam={activeTeam}
              timerActive={timerActive}
            />
          </div>
        </div>
      </div>

      {/* End Game Modal */}
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="Game Ended"
        size="medium"
      >
        <div className="text-center space-y-6">
          <div className="text-5xl font-bold text-cyan-primary">
            {teamAScore > teamBScore ? 'Team A Wins!' : 
             teamBScore > teamAScore ? 'Team B Wins!' : 
             'It\'s a Tie!'}
          </div>
          <ScoreDisplay
            teamAScore={teamAScore}
            teamBScore={teamBScore}
            size="large"
          />
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LiveGameBoard;