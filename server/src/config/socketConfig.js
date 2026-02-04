const { Server } = require('socket.io');

/**
 * Initialize Socket.IO server
 */
const initializeSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  // Middleware for authentication (optional)
  io.use((socket, next) => {
    // You can add authentication here if needed
    // For now, just log the connection
    console.log(`🔐 Socket attempting connection: ${socket.id}`);
    next();
  });

  console.log('✅ Socket.IO server initialized');

  return io;
};

module.exports = { initializeSocketIO };