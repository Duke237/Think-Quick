require('dotenv').config();
const express = require('express');
const http = require('http');
const { connectDB } = require('./config/db');
const gameRoutes = require('./routes/game');
const adminRoutes = require('./routes/admin');
const seedRun = require('./seeds/seed');

const app = express();

// middleware
app.use(express.json());
app.use('/api/admin', adminRoutes);

// routes
app.use('/api/games', gameRoutes);

// create server + socket
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || '*' } });
app.locals.io = io; // expose io to controllers via req.app.locals.io

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('revealAnswer', (data) => {
    socket.broadcast.emit('answerRevealed', data);
  });

  socket.on('strike', (data) => {
    socket.broadcast.emit('strikeEvent', data);
  });

  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

// connect + optional auto-seed (in-memory)
(async () => {
  await connectDB();
  if (process.env.USE_IN_MEMORY === 'true') {
    const Question = require('./models/Question');
    const count = await Question.countDocuments();
    if (!count) {
      console.log('Auto-seeding in-memory DB with tech questions...');
      await seedRun(true);
    }
  }
})();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});