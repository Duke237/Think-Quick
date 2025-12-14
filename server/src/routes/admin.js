const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');

router.post('/questions', ctrl.addQuestion);

module.exports = router;