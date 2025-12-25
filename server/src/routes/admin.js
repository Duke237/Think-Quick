const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');

// Questions management
router.post('/questions', ctrl.addQuestion);
router.get('/questions', ctrl.listQuestions);
router.get('/questions/:id', ctrl.getQuestion);
router.put('/questions/:id', ctrl.updateQuestion);
router.delete('/questions/:id', ctrl.deleteQuestion);

module.exports = router;