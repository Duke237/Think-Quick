import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';

const AnswerSlot = ({ answer, index, isRevealed, onReveal }) => {
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    if (isRevealed && !showReveal) {
      setShowReveal(true);
    }
  }, [isRevealed, showReveal]);

  return (
    <div
      className={`relative bg-bg-tertiary rounded-xl overflow-hidden transition-all duration-500 ${
        showReveal ? 'animate-scale-in' : ''
      }`}
      style={{ minHeight: '80px' }}
    >
      {!isRevealed ? (
        <div className="flex items-center justify-center h-full p-4">
          <div className="text-4xl font-bold text-text-muted">
            {index + 1}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between h-full p-4 bg-gradient-cyan">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-2xl font-bold text-bg-primary">
              {index + 1}
            </div>
            <div className="text-xl font-semibold text-bg-primary uppercase">
              {answer.text}
            </div>
          </div>
          <div className="text-3xl font-bold text-bg-primary">
            {answer.points}
          </div>
        </div>
      )}
    </div>
  );
};

const AnswerBoard = ({ answers = [], revealedAnswers = [], totalPoints = 0 }) => {
  // Create array of 8 slots (typical Family Feud format)
  const maxSlots = 8;
  const slots = Array.from({ length: maxSlots }, (_, i) => {
    if (i < answers.length) {
      const isRevealed = revealedAnswers.some(ra => 
        ra.text.toLowerCase() === answers[i].text.toLowerCase()
      );
      return { ...answers[i], isRevealed };
    }
    return null;
  });

  return (
    <div className="w-full">
      {/* Total Points Display */}
      <Card variant="gradient" padding="normal" className="mb-6">
        <div className="text-center">
          <div className="text-text-muted text-sm mb-1">Total Points Available</div>
          <div className="text-5xl font-bold text-cyan-primary">{totalPoints}</div>
        </div>
      </Card>

      {/* Answer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((slot, index) => (
          <AnswerSlot
            key={index}
            answer={slot}
            index={index}
            isRevealed={slot?.isRevealed || false}
          />
        ))}
      </div>

      {/* Revealed Count */}
      <div className="mt-6 text-center text-text-muted">
        {revealedAnswers.length} of {answers.length} answers revealed
      </div>
    </div>
  );
};

export default AnswerBoard;