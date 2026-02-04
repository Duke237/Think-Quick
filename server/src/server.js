const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const { initializeSocketIO } = require('./config/socketConfig');
const { initializeSocketHandlers } = require('./sockets/socketHandlers');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(server);

// ==================== MIDDLEWARE ====================

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging (Development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ==================== ROUTES ====================

// Import routes
const adminRoutes = require('./routes/admin.routes');
const questionRoutes = require('./routes/question.routes');
const gameRoutes = require('./routes/game.routes');
const playerRoutes = require('./routes/player.routes');
const healthRoutes = require('./routes/health.routes');

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Think Quick API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      admin: '/api/admin',
      questions: '/api/questions',
      games: '/api/games',
      players: '/api/players'
    },
    documentation: 'https://github.com/Duke237/Think-Quick'
  });
});

// Mount routes
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/players', playerRoutes);

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// ==================== SOCKET.IO SETUP ====================

// Initialize socket handlers
initializeSocketHandlers(io);

// Make io accessible to routes (optional)
app.set('io', io);

// ==================== SERVER STARTUP ====================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    server.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('🎮  THINK QUICK SERVER');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`🚀  Server running on port: ${PORT}`);
      console.log(`🌍  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡  HTTP Server: http://localhost:${PORT}`);
      console.log(`🔌  Socket.IO: ws://localhost:${PORT}`);
      console.log(`💾  Database: ${process.env.USE_IN_MEMORY === 'true' ? 'In-Memory' : 'MongoDB'}`);
      console.log(`🎯  Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('📋  Available Endpoints:');
      console.log(`   GET  http://localhost:${PORT}/`);
      console.log(`   GET  http://localhost:${PORT}/api/health`);
      console.log(`   GET  http://localhost:${PORT}/api/questions/random`);
      console.log(`   GET  http://localhost:${PORT}/api/admin/questions`);
      console.log(`   POST http://localhost:${PORT}/api/admin/questions`);
      console.log('');
      console.log('✅  Server ready to accept connections!');
      console.log('');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ==================== GRACEFUL SHUTDOWN ====================

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close server
  server.close(() => {
    console.log('✅ HTTP server closed');
  });

  // Close Socket.IO
  io.close(() => {
    console.log('✅ Socket.IO server closed');
  });

  // Close database connection
  const mongoose = require('mongoose');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');

  console.log('👋 Graceful shutdown complete');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Start the server
startServer();

// Export for testing
module.exports = { app, server, io };