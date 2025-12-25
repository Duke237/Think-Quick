import React from 'react';
import { Award } from 'lucide-react';
import AnswerGrid from './AnswerGrid';
import Scoreboard from './Scoreboard';
import Timer from './Timer';
import StrikeDisplay from './StrikeDisplay';
import HostControls from '../host/HostControls';
import { useGameStore } from '../../context/GameContext';

const GameBoard = () => {
  const { game, isHost } = useGameStore();

  if (!game) return null;

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Think-Quick
          </h1>
          <p className="text-xl mt-2" style={{ color: 'var(--text-secondary)' }}>
            Round {game.currentRound} • {game.currentRound}x Multiplier
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Game Code: <span className="font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>
              {game.gameCode}
            </span>
          </p>
        </div>

        <Timer />

        <Scoreboard teams={game.teams} currentTeamIndex={game.currentTeamIndex} />
      </div>

      {/* Question */}
      {game.currentQuestion && (
        <div className="glass rounded-2xl p-8 mb-6 slide-up">
          <h2 className="text-4xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>
            {game.currentQuestion.question}
          </h2>
          <StrikeDisplay strikes={game.strikes} maxStrikes={game.settings.maxStrikes} />
        </div>
      )}

      {/* Answer Grid */}
      {game.currentQuestion && (
        <AnswerGrid 
          answers={game.currentQuestion.answers}
          revealedAnswers={game.revealedAnswers}
        />
      )}

      {/* Host Controls */}
      {isHost && game.status === 'playing' && <HostControls />}

      {/* Round End Modal */}
      {game.status === 'round-end' && <RoundEndModal />}

      {/* Game Over Modal */}
      {game.status === 'game-over' && <GameOverModal />}
    </div>
  );
};