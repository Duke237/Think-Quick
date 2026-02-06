import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Card
} from '../../components';

const LiveGameBoard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId, setSessionId] = useState(null);
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
  const [teamAnswers, setTeamAnswers] = useState({ A: null, B: null });
  const [currentPhase, setCurrentPhase] = useState('question'); // question, teamA, teamB, reveal

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
    loadNewQuestion(sid);

    // Socket listeners
    socketService.on(SOCKET_EVENTS.ANSWER_REVEALED, handleAnswerRevealed);
    socketService.on(SOCKET_EVENTS.SCORE_UPDATE, handleScoreUpdate);

    return () => {
      socketService.off(SOCKET_EVENTS.ANSWER_REVEALED);
      socketService.off(SOCKET_EVENTS.SCORE_UPDATE);
    };
  }, [navigate]);

  // Check if returning from timer or answer input
  useEffect(() => {
    if (location.state?.fromTimer && location.state?.teamAnswer) {
      handleTeamAnswerReceived(location.state.team, location.state.teamAnswer);
    }
  }, [location.state]);

  const loadNewQuestion = (sid) => {
    socketService.loadQuestion(sid, null, multiplier, (response) => {
      if (response.success) {
        setCurrentQuestion(response.question);
        setRoundNumber(response.round.roundNumber);
        setMultiplier(response.round.multiplier);
        setRevealedAnswers([]);
        setTeamAnswers({ A: null, B: null });
        setStrikes(0);
        setCurrentPhase('question');
        setLoading(false);
      }
    });
  };

  const handleAnswerRevealed = (data) => {
    setRevealedAnswers(prev => [...prev, data.answer]);
  };

  const handleScoreUpdate = (data) => {
    setTeamAScore(data.teamA);
    setTeamBScore(data.teamB);
  };

  const handleStartTeamA = () => {
    setCurrentPhase('teamA');
    navigate('/clock', {
      state: {
        sessionId,
        duration: 20,
        teamName: 'Team A',
        returnPath: '/live/team-input',
        team: 'A'
      }
    });
  };

  const handleStartTeamB = () => {
    setCurrentPhase('teamB');
    navigate('/clock', {
      state: {
        sessionId,
        duration: 20,
        teamName: 'Team B',
        returnPath: '/live/team-input',
        team: 'B'
      }
    });
  };

  const handleTeamAnswerReceived = (team, answer) => {
    setTeamAnswers(prev => ({ ...prev, [team]: answer }));
    
    // Check answer against database
    const matched = currentQuestion.answers.find(a => 
      a.text.toLowerCase().trim() === answer.toLowerCase().trim()
    );

    if (matched) {
      // Reveal answer and award points
      socketService.submitAnswer(sessionId, answer, (response) => {
        if (response.correct) {
          const points = matched.frequency * multiplier;
          if (team === 'A') {
            setTeamAScore(prev => prev + points);
          } else {
            setTeamBScore(prev => prev + points);
          }
        }
      });
    } else {
      // Wrong answer - add strike
      setStrikes(prev => prev + 1);
    }

    // If both teams answered, move to reveal phase
    if ((team === 'A' && teamAnswers.B) || (team === 'B' && teamAnswers.A)) {
      setCurrentPhase('reveal');
    }
  };

  const handleNextQuestion = () => {
    loadNewQuestion(sessionId);
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

        {/* Question Display */}
        <QuestionDisplay
          question={currentQuestion?.text}
          roundNumber={roundNumber}
          multiplier={multiplier}
          category={currentQuestion?.category}
        />

        <div className="grid grid-cols-2 gap-6 mt-8">
          {/* Team A Section */}
          <Card variant="cyan" padding="large">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-cyan-primary">Team A</h3>
              <div className="text-5xl font-bold text-cyan-primary">
                {teamAScore}
              </div>
              {currentPhase === 'question' && !teamAnswers.A && (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleStartTeamA}
                >
                  Start Team A Timer
                </Button>
              )}
              {teamAnswers.A && (
                <div className="bg-bg-tertiary p-4 rounded-xl">
                  <div className="text-text-muted text-sm mb-2">Answer:</div>
                  <div className="text-xl font-semibold text-text-primary">
                    {teamAnswers.A}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Team B Section */}
          <Card variant="orange" padding="large">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-orange-primary">Team B</h3>
              <div className="text-5xl font-bold text-orange-primary">
                {teamBScore}
              </div>
              {currentPhase === 'question' && teamAnswers.A && !teamAnswers.B && (
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={handleStartTeamB}
                >
                  Start Team B Timer
                </Button>
              )}
              {teamAnswers.B && (
                <div className="bg-bg-tertiary p-4 rounded-xl">
                  <div className="text-text-muted text-sm mb-2">Answer:</div>
                  <div className="text-xl font-semibold text-text-primary">
                    {teamAnswers.B}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Answer Board */}
        <div className="mt-8">
          <AnswerBoard
            answers={currentQuestion?.answers || []}
            revealedAnswers={revealedAnswers}
            totalPoints={100}
          />
        </div>

        {/* Strikes */}
        <div className="mt-8 flex justify-center">
          <StrikeIndicator strikes={strikes} maxStrikes={3} size="large" />
        </div>

        {/* Next Question Button */}
        {currentPhase === 'reveal' && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleNextQuestion}
            >
              Next Question
            </Button>
          </div>
        )}
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