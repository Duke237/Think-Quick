const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { validateQuestionData } = require('../utils/questionValidator');

/**
 * @route   GET /api/admin/questions
 * @desc    Get all questions
 * @access  Public (should be protected in production)
 */
router.get('/questions', async (req, res) => {
  try {
    const { category, difficulty, isFastMoney, limit = 50, page = 1 } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (isFastMoney !== undefined) filter.isFastMoney = isFastMoney === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await Question.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(filter);

    res.json({
      success: true,
      data: questions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/questions/:questionId
 * @desc    Get a single question by questionId
 * @access  Public
 */
router.get('/questions/:questionId', async (req, res) => {
  try {
    const question = await Question.findOne({ questionId: req.params.questionId });

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
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/questions
 * @desc    Create a new question
 * @access  Admin
 */
router.post('/questions', async (req, res) => {
  try {
    const questionData = req.body;

    // Validate question data
    const validation = validateQuestionData(questionData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    // Check if questionId already exists
    const existingQuestion = await Question.findOne({ 
      questionId: questionData.questionId 
    });

    if (existingQuestion) {
      return res.status(409).json({
        success: false,
        error: 'Question ID already exists'
      });
    }

    // Create question
    const question = new Question(questionData);
    await question.save();

    console.log(`✅ Question created: ${question.questionId}`);

    res.status(201).json({
      success: true,
      data: question,
      message: 'Question created successfully'
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/questions/:questionId
 * @desc    Update a question
 * @access  Admin
 */
router.put('/questions/:questionId', async (req, res) => {
  try {
    const questionData = req.body;

    // Validate question data
    const validation = validateQuestionData(questionData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const question = await Question.findOneAndUpdate(
      { questionId: req.params.questionId },
      questionData,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    console.log(`✅ Question updated: ${question.questionId}`);

    res.json({
      success: true,
      data: question,
      message: 'Question updated successfully'
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/questions/:questionId
 * @desc    Delete a question
 * @access  Admin
 */
router.delete('/questions/:questionId', async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({ 
      questionId: req.params.questionId 
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    console.log(`🗑️  Question deleted: ${question.questionId}`);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/categories
 * @desc    Get all unique categories
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Question.distinct('category');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get question statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const total = await Question.countDocuments();
    const byCategory = await Question.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    const byDifficulty = await Question.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);
    const fastMoneyCount = await Question.countDocuments({ isFastMoney: true });

    res.json({
      success: true,
      data: {
        total,
        byCategory: byCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byDifficulty: byDifficulty.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        fastMoney: fastMoneyCount
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/questions/bulk
 * @desc    Bulk create questions
 * @access  Admin
 */
router.post('/questions/bulk', async (req, res) => {
  try {
    const questions = req.body.questions;

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        error: 'Expected array of questions'
      });
    }

    // Validate all questions
    const errors = [];
    questions.forEach((q, index) => {
      const validation = validateQuestionData(q);
      if (!validation.isValid) {
        errors.push({
          index,
          questionId: q.questionId,
          errors: validation.errors
        });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    // Insert all questions
    const inserted = await Question.insertMany(questions);

    console.log(`✅ Bulk created ${inserted.length} questions`);

    res.status(201).json({
      success: true,
      data: inserted,
      count: inserted.length,
      message: `${inserted.length} questions created successfully`
    });
  } catch (error) {
    console.error('Error bulk creating questions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;