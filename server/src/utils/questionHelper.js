const Question = require('../models/Question');

/**
 * Get a random question from database
 */
const getRandomQuestion = async (excludeIds = [], isFastMoney = false) => {
  try {
    const filter = {
      questionId: { $nin: excludeIds },
      isFastMoney
    };

    const count = await Question.countDocuments(filter);
    if (count === 0) {
      return null;
    }

    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(filter).skip(random);

    return question;
  } catch (error) {
    console.error('Error getting random question:', error);
    throw error;
  }
};

/**
 * Get multiple random questions for Fast Money
 */
const getFastMoneyQuestions = async (count = 5) => {
  try {
    const questions = await Question.find({ isFastMoney: true }).limit(count);
    
    // Shuffle the questions
    return questions.sort(() => Math.random() - 0.5).slice(0, count);
  } catch (error) {
    console.error('Error getting Fast Money questions:', error);
    throw error;
  }
};

/**
 * Get question by ID
 */
const getQuestionById = async (questionId) => {
  try {
    return await Question.findOne({ questionId });
  } catch (error) {
    console.error('Error getting question by ID:', error);
    throw error;
  }
};

/**
 * Get questions by category
 */
const getQuestionsByCategory = async (category, limit = 10) => {
  try {
    return await Question.find({ category }).limit(limit);
  } catch (error) {
    console.error('Error getting questions by category:', error);
    throw error;
  }
};

/**
 * Get questions by difficulty
 */
const getQuestionsByDifficulty = async (difficulty, limit = 10) => {
  try {
    return await Question.find({ difficulty }).limit(limit);
  } catch (error) {
    console.error('Error getting questions by difficulty:', error);
    throw error;
  }
};

/**
 * Search questions by text
 */
const searchQuestions = async (searchTerm) => {
  try {
    return await Question.find({
      text: { $regex: searchTerm, $options: 'i' }
    });
  } catch (error) {
    console.error('Error searching questions:', error);
    throw error;
  }
};

/**
 * Get all categories
 */
const getAllCategories = async () => {
  try {
    const categories = await Question.distinct('category');
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

/**
 * Reset all revealed answers for a question
 */
const resetQuestionReveals = async (questionId) => {
  try {
    const question = await Question.findOne({ questionId });
    if (question) {
      question.answers.forEach(answer => {
        answer.revealed = false;
      });
      await question.save();
    }
    return question;
  } catch (error) {
    console.error('Error resetting question reveals:', error);
    throw error;
  }
};

module.exports = {
  getRandomQuestion,
  getFastMoneyQuestions,
  getQuestionById,
  getQuestionsByCategory,
  getQuestionsByDifficulty,
  searchQuestions,
  getAllCategories,
  resetQuestionReveals
};