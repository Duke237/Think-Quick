import { Server } from 'socket.io';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join-game', (gameCode) => {
      socket.join(gameCode);
      console.log(`👤 Socket ${socket.id} joined game: ${gameCode}`);
    });

    socket.on('leave-game', (gameCode) => {
      socket.leave(gameCode);
      console.log(`👋 Socket ${socket.id} left game: ${gameCode}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};