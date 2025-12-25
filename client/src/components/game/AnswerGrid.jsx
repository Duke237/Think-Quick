const AnswerGrid = ({ answers, revealedAnswers }) => {
  const isRevealed = (answerText) => {
    return revealedAnswers.some(ra => ra.text === answerText);
  };

  return (
    <div className="glass rounded-2xl p-8 mb-6">
      <div className="grid grid-cols-2 gap-4">
        {answers.map((answer, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-xl border-2 transition-all duration-500 ${
              isRevealed(answer.text)
                ? 'slide-up'
                : ''
            }`}
            style={{
              background: isRevealed(answer.text) 
                ? 'var(--success)' 
                : 'var(--glass-bg)',
              borderColor: isRevealed(answer.text)
                ? 'var(--success)'
                : 'rgba(0, 229, 255, 0.2)',
              transform: isRevealed(answer.text) ? 'scale(1.02)' : 'scale(1)'
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold" style={{ 
                color: isRevealed(answer.text) ? 'var(--bg-primary)' : 'var(--text-primary)' 
              }}>
                {idx + 1}
              </span>
              <span className="text-xl font-bold" style={{ 
                color: isRevealed(answer.text) ? 'var(--bg-primary)' : 'var(--text-primary)' 
              }}>
                {isRevealed(answer.text) ? answer.text : '???'}
              </span>
              <span className="text-2xl font-bold" style={{ 
                color: isRevealed(answer.text) ? 'var(--bg-primary)' : 'var(--text-secondary)' 
              }}>
                {isRevealed(answer.text) ? answer.frequency : '??'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
