require('dotenv').config();
const express = require('express');
const http = require('http');
const { connectDB } = require('./config/db');
const gameRoutes = require('./routes/game.routes');
const adminRoutes = require('./routes/player.routes');
const seedRun = require('./seeds/seed');
const Game = require('./models/GameSession');

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

  // lobby: a player (or host) connected to the lobby
  socket.on('lobby:connect', async (payload) => {
    try {
      const { gameId, playerId, name, isHost } = payload;
      const game = await Game.findById(gameId);
      if (!game) return socket.emit('error', { message: 'Game not found' });

      socket.join(`game_${game._id}`);

      if (isHost) {
        game.hostSocketId = socket.id;
      }

      // if playerId provided, update the player's socketId
      if (playerId) {
        const p = game.players.id(playerId);
        if (p) {
          p.socketId = socket.id;
        }
      } else if (name) {
        // attacker: add transient player record
        game.players.push({ name: name.slice(0, 30), joinedAt: new Date(), socketId: socket.id });
      }

      await game.save();

      const players = game.players.map((p) => ({ _id: p._id, name: p.name, team: p.team, joinedAt: p.joinedAt }));
      io.to(`game_${game._id}`).emit('lobbyUpdate', { players, hostSocketId: game.hostSocketId });
    } catch (e) {
      console.error('lobby:connect error', e);
    }
  });

  socket.on('lobby:changeTeam', async (payload) => {
    try {
      const { gameId, playerId, team } = payload;
      const game = await Game.findById(gameId);
      if (!game) return;
      const p = game.players.id(playerId);
      if (!p) return;
      p.team = team;
      await game.save();
      const players = game.players.map((p) => ({ _id: p._id, name: p.name, team: p.team, joinedAt: p.joinedAt }));
      io.to(`game_${game._id}`).emit('lobbyUpdate', { players, hostSocketId: game.hostSocketId });
    } catch (e) {
      console.error('lobby:changeTeam error', e);
    }
  });

  socket.on('lobby:start', async (payload) => {
    try {
      const { gameId } = payload;
      const game = await Game.findById(gameId);
      if (!game) return;
      game.status = 'active';
      await game.save();
      io.to(`game_${game._id}`).emit('gameStarted', { gameId: game._id });
    } catch (e) {
      console.error('lobby:start error', e);
    }
  });

  // timer control via socket (host triggers)
  socket.on('timer:start', async (payload) => {
    try {
      const { gameId, duration } = payload;
      // call controller utility
      const gc = require('./controllers/game.controller');
      if (gc && gc.timerStart) {
        // emulate an express-like call (we just call the internal start function)
        const g = await Game.findById(gameId);
        if (g) {
          g.timer.duration = duration || g.timer.duration || 20;
          g.timer.remaining = g.timer.duration;
          g.timer.running = true;
          await g.save();
          gc.startTimerInternal(io, g._id.toString(), g.timer.duration);
        }
      }
    } catch (e) {
      console.error('timer:start error', e);
    }
  });

  // host control socket events
  socket.on('host:addStrike', async (payload) => {
    try {
      const { gameId, team } = payload;
      const gc = require('./controllers/game.controller');
      if (gc && gc.addStrike) {
        // emulate req/res
        await gc.addStrike({ params: { gameId }, body: { team } }, { json: () => {}, status: () => ({ json: () => {} }) });
      }
    } catch (e) {
      console.error('host:addStrike error', e);
    }
  });

  socket.on('host:pass', async (payload) => {
    try {
      const { gameId } = payload;
      const gc = require('./controllers/game.controller');
      if (gc && gc.passTurn) {
        await gc.passTurn({ params: { gameId } }, { json: () => {}, status: () => ({ json: () => {} }) });
      }
    } catch (e) {
      console.error('host:pass error', e);
    }
  });

  socket.on('host:reveal', async (payload) => {
    try {
      const { gameId, text } = payload;
      const gc = require('./controllers/game.controller');
      if (gc && gc.revealAnswerManual) {
        await gc.revealAnswerManual({ params: { gameId }, body: { text } }, { json: () => {}, status: () => ({ json: () => {} }) });
      }
    } catch (e) {
      console.error('host:reveal error', e);
    }
  });

  socket.on('timer:pause', async (payload) => {
    try {
      const { gameId } = payload;
      const gc = require('./controllers/game.controller');
      if (gc && gc.timerPause) {
        // call timerPause by emulating req/res
        await gc.timerPause({ params: { gameId } }, { json: () => {}, status: () => ({ json: () => {} }) });
      }
    } catch (e) {
      console.error('timer:pause error', e);
    }
  });

  socket.on('timer:reset', async (payload) => {
    try {
      const { gameId, duration } = payload;
      const gc = require('./controllers/game.controller');
      if (gc && gc.timerReset) {
        await gc.timerReset({ params: { gameId }, body: { duration } }, { json: () => {}, status: () => ({ json: () => {} }) });
      }
    } catch (e) {
      console.error('timer:reset error', e);
    }
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