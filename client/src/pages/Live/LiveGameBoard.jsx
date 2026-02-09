import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import socketService from '../../services/socket';
import { SOCKET_EVENTS } from '../../utils/constants';
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
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);
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
    
    // Load 5 random questions
    loadQuestions(sid);
  }, [navigate]);

  // Handle return from answer input
  useEffect(() => {
    if (location.state?.answersComplete) {
      const { team, answers } = location.state;
      
      console.log(`Received answers from Team ${team}:`, answers);
      console.log('Questions:', questions);
      
      if (team === 'A') {
        // Calculate Team A scores
        const scoredAnswers = calculateScoreForAnswers(answers);
        setTeamAAnswers(scoredAnswers);
        
        const totalScore = scoredAnswers.reduce((sum, ans) => sum + (ans.points || 0), 0);
        setTeamAScore(totalScore);
        
        console.log('Team A scored answers:', scoredAnswers);
        console.log('Team A total score:', totalScore);
        
        setGamePhase('teamB-timer');
      } else if (team === 'B') {
        // Calculate Team B scores with duplicate checking
        const scoredAnswers = calculateScoreForAnswers(answers, teamAAnswers);
        setTeamBAnswers(scoredAnswers);
        
        const totalScore = scoredAnswers.reduce((sum, ans) => sum + (ans.points || 0), 0);
        setTeamBScore(totalScore);
        
        console.log('Team B scored answers:', scoredAnswers);
        console.log('Team B total score:', totalScore);
        
        setGamePhase('results');
        setShowResults(true);
      }
      
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, teamAAnswers, questions]);

  const loadQuestions = (sid) => {
    setLoading(true);
    
    // We'll collect 5 unique questions
    const loadedQuestions = [];
    let attempts = 0;
    const maxAttempts = 20;

    const loadNext = () => {
      if (loadedQuestions.length >= 5 || attempts >= maxAttempts) {
        console.log('Loaded questions:', loadedQuestions);
        setQuestions(loadedQuestions);
        setUsedQuestionIds(loadedQuestions.map(q => q.questionId));
        setLoading(false);
        return;
      }

      attempts++;
      socketService.loadQuestion(sid, null, 1, (response) => {
        if (response.success && response.question) {
          const question = response.question;
          
          // Check if we already have this question
          const isDuplicate = loadedQuestions.some(q => q.questionId === question.questionId);
          const isUsed = usedQuestionIds.includes(question.questionId);
          
          if (!isDuplicate && !isUsed) {
            loadedQuestions.push(question);
            console.log(`Loaded question ${loadedQuestions.length}:`, question.text);
          }
        }
        
        loadNext();
      });
    };

    loadNext();
  };

  const calculateScoreForAnswers = (answers, opponentAnswers = []) => {
    console.log('Calculating scores for answers:', answers);
    
    return answers.map((answer, index) => {
      const question = questions[index];
      
      if (!question || !answer.answer || answer.answer.trim() === '') {
        return {
          ...answer,
          matchedAnswer: null,
          points: 0,
          isDuplicate: false
        };
      }

      const playerAnswer = answer.answer.toLowerCase().trim();
      console.log(`Q${index + 1}: Player answered "${playerAnswer}"`);

      // Check for duplicate (Team B only)
      if (opponentAnswers.length > 0) {
        const duplicate = opponentAnswers.find(
          oa => oa.answer && oa.answer.toLowerCase().trim() === playerAnswer
        );
        
        if (duplicate) {
          console.log(`  -> DUPLICATE of Team A's answer`);
          audioService.play('wrong', 0.7);
          return {
            ...answer,
            matchedAnswer: null,
            points: 0,
            isDuplicate: true
          };
        }
      }

      // Find matching answer in database
      if (!question.answers || question.answers.length === 0) {
        console.log('  -> No survey answers available');
        return {
          ...answer,
          matchedAnswer: null,
          points: 0,
          isDuplicate: false
        };
      }

      const matched = question.answers.find(surveyAnswer => {
        const surveyText = surveyAnswer.text.toLowerCase().trim();
        return surveyText === playerAnswer;
      });

      if (matched) {
        console.log(`  -> MATCH! Survey answer: "${matched.text}", Points: ${matched.frequency}`);
        audioService.play('correct', 0.6);
        return {
          ...answer,
          matchedAnswer: matched.text,
          points: matched.frequency,
          isDuplicate: false
        };
      } else {
        console.log(`  -> NO MATCH in survey`);
        audioService.play('wrong', 0.5);
        return {
          ...answer,
          matchedAnswer: null,
          points: 0,
          isDuplicate: false
        };
      }
    });
  };

  const handleStartTeamA = () => {
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
    navigate('/live/timer-questions', {
      state: {
        sessionId,
        team: 'B',
        questions,
        duration: 25
      }
    });
  };

  const handlePlayAgain = () => {
    // Load new questions for next round
    setCurrentRound(currentRound + 1);
    setTeamAAnswers([]);
    setTeamBAnswers([]);
    setGamePhase('setup');
    setShowResults(false);
    loadQuestions(sessionId);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading questions..." />;
  }

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-cyan-primary mb-4">
            Think Quick
          </h1>
          <p className="text-text-secondary text-xl">
            Round {currentRound}
          </p>
        </div>

        {/* Game Setup */}
        {gamePhase === 'setup' && (
          <Card padding="large" className="text-center">
            <div className="space-y-8">
              <div className="text-3xl font-bold text-text-primary">
                Ready to Start Round {currentRound}?
              </div>
              <div className="text-text-secondary text-lg space-y-2">
                <p>Each team will answer {questions.length} questions</p>
                <p>Team A gets 20 seconds</p>
                <p>Team B gets 25 seconds (but cannot duplicate Team A's answers)</p>
              </div>
              
              {/* Show Questions Preview */}
              <div className="bg-bg-tertiary p-6 rounded-xl text-left">
                <div className="text-cyan-primary font-semibold mb-4">Questions for this round:</div>
                {questions.map((q, i) => (
                  <div key={i} className="text-text-secondary mb-2">
                    {i + 1}. {q.text}
                  </div>
                ))}
              </div>

              <Button
                variant="primary"
                size="xl"
                fullWidth
                onClick={handleStartTeamA}
              >
                Start Team A
              </Button>
            </div>
          </Card>
        )}

        {/* Waiting for Team B */}
        {gamePhase === 'teamB-timer' && (
          <div className="space-y-8">
            <Card variant="cyan" padding="large">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-cyan-primary">Team A Complete!</h2>
                <div className="text-6xl font-bold text-cyan-primary">
                  {teamAScore} Points
                </div>
                
                {/* Show Team A's answers with survey comparison */}
                <div className="mt-6 bg-bg-tertiary p-4 rounded-xl">
                  <div className="text-text-muted mb-4">Team A's Answers:</div>
                  {teamAAnswers.map((ans, i) => (
                    <div key={i} className="mb-4 pb-4 border-b border-bg-secondary last:border-b-0">
                      <div className="text-text-muted text-sm mb-2">Q{i + 1}: {questions[i]?.text}</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-text-muted mb-1">Player Answer:</div>
                          <div className="text-text-primary font-semibold">{ans.answer || 'No answer'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-text-muted mb-1">Survey Answer:</div>
                          <div className={`font-semibold ${ans.matchedAnswer ? 'text-green-400' : 'text-red-400'}`}>
                            {ans.matchedAnswer || 'Not in survey'}
                          </div>
                        </div>
                      </div>
                      <div className="text-cyan-primary font-bold mt-2 text-right">
                        {ans.points || 0} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card padding="large" className="text-center">
              <div className="space-y-6">
                <div className="text-2xl font-bold text-text-primary">
                  Team B's Turn
                </div>
                <div className="text-text-secondary">
                  You have 25 seconds to answer {questions.length} questions
                </div>
                <div className="bg-yellow-500/20 border-2 border-yellow-500 text-yellow-300 p-4 rounded-xl">
                  <p className="font-semibold">Important:</p>
                  <p>Do not duplicate Team A's answers!</p>
                </div>
                <Button
                  variant="secondary"
                  size="xl"
                  fullWidth
                  onClick={handleStartTeamB}
                >
                  Start Team B
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Results Modal */}
        <Modal
          isOpen={showResults}
          onClose={() => {}}
          title={`Round ${currentRound} Results`}
          size="large"
          closeOnBackdrop={false}
          showCloseButton={false}
        >
          <div className="space-y-8">
            {/* Scores */}
            <div className="grid grid-cols-2 gap-6">
              <Card variant="cyan" padding="large">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-cyan-primary mb-4">Team A</h3>
                  <div className="text-6xl font-bold text-cyan-primary mb-4">
                    {teamAScore}
                  </div>
                  <div className="text-text-muted">Points</div>
                </div>
              </Card>

              <Card variant="orange" padding="large">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-orange-primary mb-4">Team B</h3>
                  <div className="text-6xl font-bold text-orange-primary mb-4">
                    {teamBScore}
                  </div>
                  <div className="text-text-muted">Points</div>
                </div>
              </Card>
            </div>

            {/* Winner */}
            <div className="text-center py-8 bg-gradient-cyan rounded-2xl">
              <div className="text-5xl font-bold text-bg-primary">
                {teamAScore > teamBScore ? 'Team A Wins This Round!' :
                 teamBScore > teamAScore ? 'Team B Wins This Round!' :
                 'It\'s a Tie!'}
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text-primary text-center">
                Question Breakdown
              </h3>
              
              {questions.map((question, index) => (
                <Card key={index} padding="normal" variant="gradient">
                  <div className="space-y-3">
                    <div className="font-semibold text-cyan-primary">
                      Q{index + 1}: {question.text}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Team A Answer */}
                      <div className="bg-bg-tertiary p-3 rounded-lg">
                        <div className="text-text-muted text-sm mb-2">Team A:</div>
                        <div className="mb-2">
                          <div className="text-xs text-text-muted">Player:</div>
                          <div className="font-semibold text-text-primary">
                            {teamAAnswers[index]?.answer || 'No answer'}
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="text-xs text-text-muted">Survey:</div>
                          <div className={`font-semibold ${
                            teamAAnswers[index]?.matchedAnswer ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {teamAAnswers[index]?.matchedAnswer || 'Not in survey'}
                          </div>
                        </div>
                        <div className="text-cyan-primary text-sm font-bold">
                          {teamAAnswers[index]?.points || 0} points
                        </div>
                      </div>

                      {/* Team B Answer */}
                      <div className="bg-bg-tertiary p-3 rounded-lg">
                        <div className="text-text-muted text-sm mb-2">Team B:</div>
                        <div className="mb-2">
                          <div className="text-xs text-text-muted">Player:</div>
                          <div className="font-semibold text-text-primary">
                            {teamBAnswers[index]?.answer || 'No answer'}
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="text-xs text-text-muted">Survey:</div>
                          <div className={`font-semibold ${
                            teamBAnswers[index]?.isDuplicate ? 'text-yellow-400' :
                            teamBAnswers[index]?.matchedAnswer ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {teamBAnswers[index]?.isDuplicate ? 'DUPLICATE!' :
                             teamBAnswers[index]?.matchedAnswer || 'Not in survey'}
                          </div>
                        </div>
                        <div className={`text-sm font-bold ${
                          teamBAnswers[index]?.isDuplicate ? 'text-red-400' : 'text-orange-primary'
                        }`}>
                          {teamBAnswers[index]?.points || 0} points
                        </div>
                      </div>
                    </div>

                    {/* Top 3 Survey Answers */}
                    <div className="text-sm text-text-muted pt-2 border-t border-bg-tertiary">
                      <div className="font-semibold mb-1">Top Survey Answers:</div>
                      {question.answers?.slice(0, 3).map((ans, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{idx + 1}. {ans.text}</span>
                          <span className="text-cyan-primary">{ans.frequency} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={() => navigate('/')}
              >
                End Game
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handlePlayAgain}
              >
                Next Round (New Questions)
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default LiveGameBoard;