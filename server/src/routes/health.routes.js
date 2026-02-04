const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  const healthCheck = {
    success: true,
    uptime: process.uptime(),
    timestamp: Date.now(),
    service: 'Think Quick API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  res.json(healthCheck);
});

/**
 * @route   GET /api/health/db
 * @desc    Database health check
 * @access  Public
 */
router.get('/db', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    success: dbState === 1,
    database: {
      state: states[dbState],
      name: mongoose.connection.name,
      host: mongoose.connection.host
    }
  });
});

/**
 * @route   GET /api/health/system
 * @desc    System information
 * @access  Public
 */
router.get('/system', (req, res) => {
  res.json({
    success: true,
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
      },
      uptime: Math.floor(process.uptime()) + ' seconds',
      pid: process.pid
    }
  });
});

module.exports = router;