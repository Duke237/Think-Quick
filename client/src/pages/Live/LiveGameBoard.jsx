import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import socketService from '../../services/socket';
import audioService from '../../services/audio';
import { 
  ScoreDisplay, 
  LoadingSpinner,
  Modal,
  Button,
  Card
} from '../../components';

const LiveGameBoard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Game State
  const [questions, setQuestions] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [teamAAnswers, setTeamAAnswers] = useState([]);
  const [teamBAnswers, setTeamBAnswers] = useState([]);
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [gamePhase, setGamePhase] = useState('setup'); 
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get('session') || localStorage.getItem('sessionId');
    
    if (!sid) {
      navigate('/live/setup');
      return;
    }

    setSessionId(sid);
    socketService.connect();
    
    // Check if we already have questions in localStorage
    const storedQuestions = localStorage.getItem(`questions_${sid}`);
    if (storedQuestions) {
      const parsedQuestions = JSON.parse(storedQuestions);
      console.log('Loaded questions from localStorage:', parsedQuestions);
      setQuestions(parsedQuestions);
      setLoading(false);
    } else {
      // Load new questions
      loadQuestions(sid);
    }
  }, [navigate]);

  // Handle return from answer input
  useEffect(() => {
    if (location.state?.answersComplete) {
      const { team, answers } = location.state;
      
      console.log(`=== Processing Team ${team} answers ===`);
      console.log('Questions in state:', questions);
      
      if (team === 'A') {
        const scoredAnswers = calculateScoreForAnswers(answers);
        setTeamAAnswers(scoredAnswers);
        
        const totalScore = scoredAnswers.reduce((sum, ans) => sum + (ans.points || 0), 0);
        setTeamAScore(totalScore);
        setGamePhase('teamB-timer');
      } else if (team === 'B') {
        const scoredAnswers = calculateScoreForAnswers(answers, teamAAnswers);
        setTeamBAnswers(scoredAnswers);
        
        const totalScore = scoredAnswers.reduce((sum, ans) => sum + (ans.points || 0), 0);
        setTeamBScore(totalScore);
        setGamePhase('results');
        setShowResults(true);
      }
      
      // Clear location state
      navigate(location.pathname + location.search, { replace: true });
    }
  }, [location.state?.answersComplete]);

  const loadQuestions = async (sid) => {
    setLoading(true);
    const loadedQuestions = [];
    const usedIds = new Set();

    const loadOneQuestion = () => {
      return new Promise((resolve) => {
        socketService.loadQuestion(sid, null, 1, (response) => {
          resolve(response);
        });
      });
    };

    // Load 5 unique questions
    let attempts = 0;
    while (loadedQuestions.length < 5 && attempts < 30) {
      attempts++;
      const response = await loadOneQuestion();
      
      if (response.success && response.question) {
        const question = response.question;
        
        if (!usedIds.has(question.questionId)) {
          loadedQuestions.push(question);
          usedIds.add(question.questionId);
          console.log(`✅ Loaded Q${loadedQuestions.length}: ${question.text} (${question.answers?.length} answers)`);
        }
      }
    }

    console.log('=== All Questions Loaded ===');
    loadedQuestions.forEach((q, i) => {
      console.log(`Q${i + 1}: ${q.text}`);
      console.log(`  Answers:`, q.answers?.map(a => `${a.text} (${a.frequency})`));
    });

    // Store in localStorage so Team B uses same questions
    localStorage.setItem(`questions_${sid}`, JSON.stringify(loadedQuestions));
    
    setQuestions(loadedQuestions);
    setLoading(false);
  };

  const calculateScoreForAnswers = (answers, opponentAnswers = []) => {
    console.log('=== Calculating Scores ===');
    console.log('Questions available:', questions.length);
    
    return answers.map((answer, index) => {
      const question = questions[index];
      
      if (!question) {
        console.log(`❌ Q${index + 1}: No question at index ${index}`);
        return { ...answer, matchedAnswer: null, points: 0, isDuplicate: false };
      }

      if (!answer.answer || answer.answer.trim() === '') {
        console.log(`Q${index + 1}: No answer given`);
        return { ...answer, matchedAnswer: null, points: 0, isDuplicate: false };
      }

      const playerAnswer = answer.answer.toLowerCase().trim();
      console.log(`Q${index + 1}: "${question.text}"`);
      console.log(`  Player: "${playerAnswer}"`);
      console.log(`  Survey answers:`, question.answers?.map(a => a.text));

      // Check duplicate (Team B only)
      if (opponentAnswers.length > 0) {
        const duplicate = opponentAnswers.find(
          oa => oa.answer && oa.answer.toLowerCase().trim() === playerAnswer
        );
        
        if (duplicate) {
          console.log(`  ❌ DUPLICATE!`);
          audioService.play('wrong', 0.7);
          return { ...answer, matchedAnswer: null, points: 0, isDuplicate: true };
        }
      }

      if (!question.answers || question.answers.length === 0) {
        console.log(`  ❌ No survey answers in database`);
        return { ...answer, matchedAnswer: null, points: 0, isDuplicate: false };
      }

      // Find exact match (case-insensitive)
      const matched = question.answers.find(surveyAnswer => {
        const surveyText = surveyAnswer.text.toLowerCase().trim();
        return surveyText === playerAnswer;
      });

      if (matched) {
        console.log(`  ✅ MATCH! Survey: "${matched.text}", Points: ${matched.frequency}`);
        audioService.play('correct', 0.6);
        return {
          ...answer,
          matchedAnswer: matched.text,
          points: matched.frequency,
          isDuplicate: false
        };
      } else {
        console.log(`  ❌ NO MATCH`);
        audioService.play('wrong', 0.5);
        return { ...answer, matchedAnswer: null, points: 0, isDuplicate: false };
      }
    });
  };

  const handleStartTeamA = () => {
    console.log('=== Starting Team A ===');
    console.log('Questions:', questions);
    
    // Store questions in localStorage before navigating
    localStorage.setItem(`questions_${sessionId}`, JSON.stringify(questions));
    
    navigate('/live/timer-questions', {
      state: {
        sessionId,
        team: 'A',
        questions,
        duration: 20
      }
    });
  };

  const handleStartTeamB = () => {
    console.log('=== Starting Team B with SAME questions ===');
    console.log('Questions:', questions);
    
    navigate('/live/timer-questions', {
      state: {
        sessionId,
        team: 'B',
        questions, // Same questions as Team A
        duration: 25,
        teamAAnswers
      }
    });
  };

  const handlePlayAgain = () => {
    // Clear old questions
    localStorage.removeItem(`questions_${sessionId}`);
    
    // Reset state
    setCurrentRound(currentRound + 1);
    setTeamAAnswers([]);
    setTeamBAnswers([]);
    setTeamAScore(0);
    setTeamBScore(0);
    setGamePhase('setup');
    setShowResults(false);
    
    // Load new questions
    loadQuestions(sessionId);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading questions..." />;
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Card padding="large">
          <div className="text-center space-y-4">
            <div className="text-2xl text-red-400">No questions loaded!</div>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-cyan-primary mb-4">
            Think Quick
          </h1>
          <p className="text-text-secondary text-xl">Round {currentRound}</p>
        </div>

        {gamePhase === 'setup' && (
          <Card padding="large" className="text-center">
            <div className="space-y-8">
              <div className="text-3xl font-bold text-text-primary">
                Ready to Start Round {currentRound}?
              </div>
              
              <div className="bg-bg-tertiary p-6 rounded-xl text-left">
                <div className="text-cyan-primary font-semibold mb-4">Questions for this round:</div>
                {questions.map((q, i) => (
                  <div key={i} className="mb-3">
                    <div className="font-semibold text-text-primary">{i + 1}. {q.text}</div>
                    <div className="text-sm text-text-muted ml-4">
                      Top: {q.answers?.[0]?.text} ({q.answers?.[0]?.frequency} pts)
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="primary" size="xl" fullWidth onClick={handleStartTeamA}>
                Start Team A
              </Button>
            </div>
          </Card>
        )}

        {gamePhase === 'teamB-timer' && (
          <div className="space-y-8">
            <Card variant="cyan" padding="large">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-cyan-primary mb-4">Team A Complete!</h2>
                <div className="text-6xl font-bold text-cyan-primary mb-6">{teamAScore} Points</div>
              </div>
            </Card>

            <Card padding="large" className="text-center">
              <div className="space-y-6">
                <div className="text-2xl font-bold text-text-primary">Team B's Turn</div>
                <div className="bg-yellow-500/20 border-2 border-yellow-500 text-yellow-300 p-4 rounded-xl">
                  <p className="font-semibold">Same questions - Don't duplicate Team A's answers!</p>
                </div>
                <Button variant="secondary" size="xl" fullWidth onClick={handleStartTeamB}>
                  Start Team B
                </Button>
              </div>
            </Card>
          </div>
        )}

        <Modal
          isOpen={showResults}
          onClose={() => {}}
          title={`Round ${currentRound} Results`}
          size="large"
          closeOnBackdrop={false}
          showCloseButton={false}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card variant="cyan" padding="large">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-cyan-primary mb-2">Team A</h3>
                  <div className="text-6xl font-bold text-cyan-primary">{teamAScore}</div>
                </div>
              </Card>
              <Card variant="orange" padding="large">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-orange-primary mb-2">Team B</h3>
                  <div className="text-6xl font-bold text-orange-primary">{teamBScore}</div>
                </div>
              </Card>
            </div>

            <div className="text-center py-6 bg-gradient-cyan rounded-2xl">
              <div className="text-4xl font-bold text-bg-primary">
                {teamAScore > teamBScore ? 'Team A Wins!' :
                 teamBScore > teamAScore ? 'Team B Wins!' : 'Tie!'}
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" size="lg" fullWidth onClick={() => navigate('/')}>
                End Game
              </Button>
              <Button variant="primary" size="lg" fullWidth onClick={handlePlayAgain}>
                Next Round
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default LiveGameBoard;