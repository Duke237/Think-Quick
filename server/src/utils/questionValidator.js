/**
 * Validates question data structure
 */
const validateQuestionData = (questionData) => {
  const errors = [];

  // Check required fields
  if (!questionData.questionId) {
    errors.push('questionId is required');
  }
  if (!questionData.text || questionData.text.trim().length === 0) {
    errors.push('Question text is required');
  }
  if (!questionData.answers || !Array.isArray(questionData.answers)) {
    errors.push('Answers array is required');
  }

  // Validate answers
  if (questionData.answers) {
    if (questionData.answers.length < 3) {
      errors.push('Question must have at least 3 answers');
    }
    if (questionData.answers.length > 10) {
      errors.push('Question cannot have more than 10 answers');
    }

    // Check answer structure
    questionData.answers.forEach((answer, index) => {
      if (!answer.text || answer.text.trim().length === 0) {
        errors.push(`Answer ${index + 1}: text is required`);
      }
      if (typeof answer.frequency !== 'number') {
        errors.push(`Answer ${index + 1}: frequency must be a number`);
      }
      if (answer.frequency < 0 || answer.frequency > 100) {
        errors.push(`Answer ${index + 1}: frequency must be between 0 and 100`);
      }
    });

    // Check total frequency
    const totalFrequency = questionData.answers.reduce(
      (sum, answer) => sum + (answer.frequency || 0), 
      0
    );
    
    if (Math.abs(totalFrequency - 100) > 5) {
      errors.push(
        `Total answer frequencies must sum to ~100 (current: ${totalFrequency})`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Normalizes answer text for comparison
 */
const normalizeAnswer = (answer) => {
  if (!answer) return '';
  
  return answer
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Normalize whitespace
};

/**
 * Checks if a submitted answer matches a correct answer
 */
const isAnswerMatch = (submittedAnswer, correctAnswer, strictMode = false) => {
  const normalized1 = normalizeAnswer(submittedAnswer);
  const normalized2 = normalizeAnswer(correctAnswer);

  if (strictMode) {
    return normalized1 === normalized2;
  }

  // Fuzzy matching - check if either contains the other
  return normalized1.includes(normalized2) || normalized2.includes(normalized1);
};

/**
 * Finds matching answer in question's answer list
 */
const findMatchingAnswer = (submittedAnswer, questionAnswers, strictMode = false) => {
  return questionAnswers.find(answer => 
    isAnswerMatch(submittedAnswer, answer.text, strictMode)
  );
};

/**
 * Calculates points for an answer based on frequency and multiplier
 */
const calculatePoints = (frequency, multiplier = 1) => {
  return frequency * multiplier;
};

/**
 * Validates Fast Money round answers
 */
const validateFastMoneyAnswers = (answers) => {
  const errors = [];

  if (!Array.isArray(answers) || answers.length !== 5) {
    errors.push('Fast Money requires exactly 5 answers');
  }

  const totalPoints = answers.reduce((sum, answer) => {
    return sum + (answer.points || 0);
  }, 0);

  return {
    isValid: errors.length === 0,
    errors,
    totalPoints
  };
};

module.exports = {
  validateQuestionData,
  normalizeAnswer,
  isAnswerMatch,
  findMatchingAnswer,
  calculatePoints,
  validateFastMoneyAnswers
};