import { Server } from 'socket.io';
import { handleGameEvents } from '../services/socket.service.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST']
    }
  });

  // Namespace per game code
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join-game', (gameCode) => {
      socket.join(gameCode);
      console.log(`👤 Socket ${socket.id} joined game: ${gameCode}`);
      
      // Set up game-specific event handlers
      handleGameEvents(io, socket, gameCode);
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};