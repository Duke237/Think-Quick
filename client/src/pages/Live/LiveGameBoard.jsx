import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import socketService from '../../services/socket';
import { SOCKET_EVENTS } from '../../utils/constants';
import audioService from '../../services/audio';
import { 
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
  const [roundNumber, setRoundNumber] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [teamAnswers, setTeamAnswers] = useState({ A: null, B: null });
  const [answeredTeams, setAnsweredTeams] = useState({ A: false, B: false });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get('session') || localStorage.getItem('sessionId');
    
    if (!sid) {
      navigate('/live/setup');
      return;
    }

    setSessionId(sid);
    socketService.connect();
    
    // Only load question if we don't have one
    if (!currentQuestion) {
      loadNewQuestion(sid);
    }

    // Socket listeners
    socketService.on(SOCKET_EVENTS.ANSWER_REVEALED, handleAnswerRevealed);
    socketService.on(SOCKET_EVENTS.SCORE_UPDATE, handleScoreUpdate);

    return () => {
      socketService.off(SOCKET_EVENTS.ANSWER_REVEALED);
      socketService.off(SOCKET_EVENTS.SCORE_UPDATE);
    };
  }, [navigate]);

  // Check if returning from timer with answer
  useEffect(() => {
    if (location.state?.fromTimer && location.state?.teamAnswer && location.state?.team) {
      const { team, teamAnswer } = location.state;
      console.log(`Received answer from Team ${team}:`, teamAnswer);
      
      // Save the answer
      setTeamAnswers(prev => ({ ...prev, [team]: teamAnswer }));
      setAnsweredTeams(prev => ({ ...prev, [team]: true }));
      
      // Process the answer if we have a current question
      if (currentQuestion) {
        handleTeamAnswerReceived(team, teamAnswer);
      }
      
      // Clear the location state to prevent re-processing
      window.history.replaceState({}, document.title);
    }
  }, [location.state, currentQuestion]);

  const loadNewQuestion = (sid) => {
    setLoading(true);
    socketService.loadQuestion(sid, null, multiplier, (response) => {
      if (response.success) {
        console.log('Question loaded:', response.question);
        setCurrentQuestion(response.question);
        setRoundNumber(response.round.roundNumber);
        setMultiplier(response.round.multiplier);
        setRevealedAnswers([]);
        setTeamAnswers({ A: null, B: null });
        setAnsweredTeams({ A: false, B: false });
        setStrikes(0);
        setLoading(false);
      } else {
        console.error('Failed to load question:', response.error);
        setLoading(false);
      }
    });
  };

  const handleAnswerRevealed = (data) => {
    setRevealedAnswers(prev => [...prev, data.answer]);
    audioService.play('reveal', 0.6);
  };

  const handleScoreUpdate = (data) => {
    setTeamAScore(data.teamA);
    setTeamBScore(data.teamB);
  };

  const handleStartTeamA = () => {
    if (!currentQuestion) {
      alert('No question loaded yet!');
      return;
    }

    navigate('/clock', {
      state: {
        sessionId,
        duration: 20,
        teamName: 'Team A',
        returnPath: '/live/team-input',
        team: 'A',
        question: currentQuestion
      }
    });
  };

  const handleStartTeamB = () => {
    if (!currentQuestion) {
      alert('No question loaded yet!');
      return;
    }

    navigate('/clock', {
      state: {
        sessionId,
        duration: 20,
        teamName: 'Team B',
        returnPath: '/live/team-input',
        team: 'B',
        question: currentQuestion
      }
    });
  };

  const handleTeamAnswerReceived = (team, answer) => {
    console.log(`Processing answer from Team ${team}:`, answer);
    
    // Safety check
    if (!currentQuestion || !currentQuestion.answers) {
      console.error('No current question or answers available');
      alert('Error: No question loaded. Returning to game board.');
      return;
    }

    // Check answer against database
    const matched = currentQuestion.answers.find(a => 
      a.text.toLowerCase().trim() === answer.toLowerCase().trim()
    );

    if (matched) {
      console.log('Answer matched:', matched);
      const points = matched.frequency * multiplier;
      
      // Reveal answer and award points via socket
      socketService.submitAnswer(sessionId, answer, (response) => {
        if (response.correct) {
          audioService.play('correct', 0.7);
          
          // Update local score
          if (team === 'A') {
            setTeamAScore(prev => prev + points);
          } else {
            setTeamBScore(prev => prev + points);
          }
        }
      });
    } else {
      console.log('Wrong answer');
      audioService.play('wrong', 0.7);
      setStrikes(prev => {
        const newStrikes = prev + 1;
        if (newStrikes >= 3) {
          audioService.play('strike', 0.8);
        }
        return newStrikes;
      });
    }
  };

  const handleNextQuestion = () => {
    if (!sessionId) return;
    
    const nextRound = roundNumber + 1;
    const nextMultiplier = nextRound <= 3 ? nextRound : 3;
    setMultiplier(nextMultiplier);
    
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

  const bothTeamsAnswered = answeredTeams.A && answeredTeams.B;

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
        {currentQuestion && (
          <QuestionDisplay
            question={currentQuestion.text}
            roundNumber={roundNumber}
            multiplier={multiplier}
            category={currentQuestion.category}
          />
        )}

        <div className="grid grid-cols-2 gap-6 mt-8">
          {/* Team A Section */}
          <Card variant="cyan" padding="large">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-cyan-primary">Team A</h3>
              <div className="text-5xl font-bold text-cyan-primary">
                {teamAScore}
              </div>
              {!answeredTeams.A && !answeredTeams.B && (
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
              {answeredTeams.A && !answeredTeams.B && (
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
        {currentQuestion && (
          <div className="mt-8">
            <AnswerBoard
              answers={currentQuestion.answers || []}
              revealedAnswers={revealedAnswers}
              totalPoints={100}
            />
          </div>
        )}

        {/* Strikes */}
        <div className="mt-8 flex justify-center">
          <StrikeIndicator strikes={strikes} maxStrikes={3} size="large" />
        </div>

        {/* Scores */}
        <div className="mt-8">
          <ScoreDisplay
            teamAScore={teamAScore}
            teamBScore={teamBScore}
            teamAName="Team A"
            teamBName="Team B"
            size="medium"
            showDifference
          />
        </div>

        {/* Next Question Button */}
        {bothTeamsAnswered && (
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