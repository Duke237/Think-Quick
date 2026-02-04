const express = require('express');
const router = express.Router();
const {
  getRandomQuestion,
  getFastMoneyQuestions,
  getQuestionById,
  getQuestionsByCategory,
  getQuestionsByDifficulty,
  searchQuestions,
  getAllCategories
} = require('../utils/questionHelpers');

/**
 * @route   GET /api/questions/random
 * @desc    Get a random question
 * @access  Public
 */
router.get('/random', async (req, res) => {
  try {
    const { exclude, isFastMoney } = req.query;
    
    const excludeIds = exclude ? exclude.split(',') : [];
    const fastMoney = isFastMoney === 'true';

    const question = await getRandomQuestion(excludeIds, fastMoney);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'No questions available'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error getting random question:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/questions/fast-money
 * @desc    Get Fast Money questions
 * @access  Public
 */
router.get('/fast-money', async (req, res) => {
  try {
    const { count = 5 } = req.query;

    const questions = await getFastMoneyQuestions(parseInt(count));

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error getting Fast Money questions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/questions/:questionId
 * @desc    Get question by ID
 * @access  Public
 */
router.get('/:questionId', async (req, res) => {
  try {
    const question = await getQuestionById(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error getting question:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/questions/category/:category
 * @desc    Get questions by category
 * @access  Public
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const questions = await getQuestionsByCategory(
      req.params.category,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error getting questions by category:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/questions/difficulty/:difficulty
 * @desc    Get questions by difficulty
 * @access  Public
 */
router.get('/difficulty/:difficulty', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const questions = await getQuestionsByDifficulty(
      req.params.difficulty,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error getting questions by difficulty:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/questions/search/:term
 * @desc    Search questions
 * @access  Public
 */
router.get('/search/:term', async (req, res) => {
  try {
    const questions = await searchQuestions(req.params.term);

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error searching questions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/questions/categories/list
 * @desc    Get all categories
 * @access  Public
 */
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await getAllCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;