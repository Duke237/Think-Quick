const gameController = require('../game/GameController');
const timerManager = require('../game/TimerManager');
const events = require('../utils/socketEvents');

/**
 * Main Socket.IO handler
 * Routes socket connections and sets up event listeners
 */
const initializeSocketHandlers = (io) => {
  io.on(events.CONNECTION, (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Determine client type based on first event
    let clientType = null; // 'host' or 'player'
    let sessionId = null;

    // ==================== HOST EVENTS ====================
    
    /**
     * Host creates a new game
     */
    socket.on(events.HOST_CREATE_GAME, async (settings, callback) => {
      try {
        clientType = 'host';
        
        const result = await gameController.createGame(socket.id, settings);
        
        if (result.success) {
          sessionId = result.sessionId;
          
          // Join the game room
          socket.join(sessionId);
          
          console.log(`🎮 Host created game: ${sessionId}`);
          
          // Send confirmation to host
          if (callback) {
            callback({
              success: true,
              sessionId,
              session: result.session
            });
          }
          
          // Broadcast to room (just host for now)
          io.to(sessionId).emit(events.GAME_CREATED, {
            sessionId,
            status: 'waiting'
          });
        } else {
          if (callback) {
            callback({
              success: false,
              error: result.error
            });
          }
        }
      } catch (error) {
        console.error('❌ Error creating game:', error);
        if (callback) {
          callback({
            success: false,
            error: error.message
          });
        }
      }
    });

    /**
     * Host starts the game
     */
    socket.on(events.HOST_START_GAME, async (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        const result = await gameController.startGame(sid);
        
        if (result.success) {
          console.log(`▶️  Game started: ${sid}`);
          
          // Broadcast to all in room
          io.to(sid).emit(events.GAME_STARTED, {
            sessionId: sid,
            status: 'active'
          });
          
          if (callback) {
            callback({ success: true });
          }
        } else {
          if (callback) {
            callback({
              success: false,
              error: result.error
            });
          }
        }
      } catch (error) {
        console.error('❌ Error starting game:', error);
        if (callback) {
          callback({
            success: false,
            error: error.message
          });
        }
      }
    });

    /**
     * Host loads a new question
     */
    socket.on(events.HOST_LOAD_QUESTION, async (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        const result = await gameController.loadQuestion(
          sid,
          data.questionId,
          data.multiplier
        );
        
        if (result.success) {
          console.log(`❓ Question loaded: ${result.question.text}`);
          
          // Broadcast question to all players
          io.to(sid).emit(events.QUESTION_LOADED, {
            question: result.question,
            round: result.round
          });
          
          if (callback) {
            callback({
              success: true,
              question: result.question,
              round: result.round
            });
          }
        } else {
          if (callback) {
            callback({
              success: false,
              error: result.error
            });
          }
        }
      } catch (error) {
        console.error('❌ Error loading question:', error);
        if (callback) {
          callback({
            success: false,
            error: error.message
          });
        }
      }
    });

    /**
     * Host submits an answer
     */
    socket.on(events.HOST_SUBMIT_ANSWER, async (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        const result = await gameController.submitAnswer(
          sid,
          data.answer,
          data.strictMode
        );
        
        if (result.success && result.correct) {
          // Correct answer
          console.log(`✅ Correct: ${result.answer.text} (+${result.answer.points})`);
          
          io.to(sid).emit(events.ANSWER_REVEALED, {
            answer: result.answer,
            scores: result.scores,
            revealedCount: result.revealedCount,
            totalAnswers: result.totalAnswers
          });
          
          io.to(sid).emit(events.SCORE_UPDATE, result.scores);
          
        } else if (!result.correct) {
          // Wrong answer
          console.log(`❌ Wrong answer - Strikes: ${result.strikes}`);
          
          io.to(sid).emit(events.ANSWER_WRONG, {
            submittedAnswer: data.answer,
            strikes: result.strikes,
            maxStrikes: result.maxStrikes
          });
          
          io.to(sid).emit(events.STRIKE_ADDED, {
            strikes: result.strikes,
            maxStrikes: result.maxStrikes,
            strikeOut: result.strikeOut
          });
        }
        
        if (callback) {
          callback(result);
        }
      } catch (error) {
        console.error('❌ Error submitting answer:', error);
        if (callback) {
          callback({
            success: false,
            error: error.message
          });
        }
      }
    });

    /**
     * Host switches team
     */
    socket.on(events.HOST_SWITCH_TEAM, (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        const result = gameController.switchTeam(sid);
        
        if (result.success) {
          console.log(`🔄 Switched to Team ${result.activeTeam}`);
          
          io.to(sid).emit(events.TEAM_SWITCHED, {
            activeTeam: result.activeTeam
          });
          
          if (callback) {
            callback({ success: true, activeTeam: result.activeTeam });
          }
        } else {
          if (callback) {
            callback({ success: false, error: result.error });
          }
        }
      } catch (error) {
        console.error('❌ Error switching team:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    /**
     * Host completes current round
     */
    socket.on(events.HOST_END_ROUND, async (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        const result = await gameController.completeRound(sid);
        
        if (result.success) {
          console.log(`🏁 Round ${result.round.roundNumber} completed`);
          
          io.to(sid).emit(events.ROUND_COMPLETED, {
            round: result.round,
            scores: result.scores
          });
          
          if (callback) {
            callback({ success: true, round: result.round });
          }
        } else {
          if (callback) {
            callback({ success: false, error: result.error });
          }
        }
      } catch (error) {
        console.error('❌ Error ending round:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    /**
     * Host starts Fast Money round
     */
    socket.on(events.HOST_START_FAST_MONEY, async (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        const result = await gameController.startFastMoney(sid);
        
        if (result.success) {
          console.log(`⚡ Fast Money started`);
          
          io.to(sid).emit(events.FAST_MONEY_STARTED, {
            questions: result.questions
          });
          
          if (callback) {
            callback({ success: true, questions: result.questions });
          }
        } else {
          if (callback) {
            callback({ success: false, error: result.error });
          }
        }
      } catch (error) {
        console.error('❌ Error starting Fast Money:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    /**
     * Host submits Fast Money answer
     */
    socket.on(events.HOST_SUBMIT_FAST_MONEY, (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        const result = gameController.submitFastMoneyAnswer(
          sid,
          data.playerNumber,
          data.questionIndex,
          data.answer
        );
        
        if (result.success) {
          io.to(sid).emit(events.FAST_MONEY_ANSWER, {
            playerNumber: data.playerNumber,
            questionIndex: data.questionIndex,
            answer: result.answer
          });
          
          // If all questions answered, calculate results
          if (result.answeredCount === result.totalQuestions) {
            const finalResult = gameController.calculateFastMoneyResults(sid);
            
            io.to(sid).emit(events.FAST_MONEY_RESULTS, finalResult);
          }
          
          if (callback) {
            callback(result);
          }
        } else {
          if (callback) {
            callback({ success: false, error: result.error });
          }
        }
      } catch (error) {
        console.error('❌ Error submitting Fast Money answer:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    /**
     * Host ends the game
     */
    socket.on(events.HOST_END_GAME, async (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        const result = await gameController.endGame(sid);
        
        if (result.success) {
          console.log(`🏆 Game ended - Winner: Team ${result.winner}`);
          
          io.to(sid).emit(events.GAME_ENDED, {
            winner: result.winner,
            finalScores: result.finalScores,
            totalRounds: result.totalRounds
          });
          
          // Clean up timer
          timerManager.cleanup(sid);
          
          if (callback) {
            callback({ success: true, result });
          }
        } else {
          if (callback) {
            callback({ success: false, error: result.error });
          }
        }
      } catch (error) {
        console.error('❌ Error ending game:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    // ==================== TIMER EVENTS ====================
    
    /**
     * Start timer
     */
    socket.on(events.TIMER_START, (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        const duration = data.duration || 20;
        
        const started = timerManager.startTimer(
          sid,
          duration,
          // onTick callback
          (timeRemaining) => {
            io.to(sid).emit(events.TIMER_TICK, {
              timeRemaining,
              duration
            });
          },
          // onComplete callback
          () => {
            io.to(sid).emit(events.TIMER_COMPLETE, {
              sessionId: sid
            });
          }
        );
        
        if (started) {
          io.to(sid).emit(events.TIMER_UPDATE, {
            timeRemaining: duration,
            active: true
          });
        }
        
        if (callback) {
          callback({ success: started });
        }
      } catch (error) {
        console.error('❌ Error starting timer:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    /**
     * Stop timer
     */
    socket.on(events.TIMER_STOP, (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        const stopped = timerManager.stopTimer(sid);
        
        if (stopped) {
          const state = timerManager.getTimerState(sid);
          io.to(sid).emit(events.TIMER_UPDATE, {
            timeRemaining: state.remaining,
            active: false
          });
        }
        
        if (callback) {
          callback({ success: stopped });
        }
      } catch (error) {
        console.error('❌ Error stopping timer:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    /**
     * Reset timer
     */
    socket.on(events.TIMER_RESET, (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        const duration = data.duration;
        const reset = timerManager.resetTimer(sid, duration);
        
        if (reset) {
          const state = timerManager.getTimerState(sid);
          io.to(sid).emit(events.TIMER_UPDATE, {
            timeRemaining: state.remaining,
            active: false
          });
        }
        
        if (callback) {
          callback({ success: reset });
        }
      } catch (error) {
        console.error('❌ Error resetting timer:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    // ==================== PLAYER EVENTS ====================
    
    /**
     * Player joins game
     */
    socket.on(events.PLAYER_JOIN, (data, callback) => {
      try {
        clientType = 'player';
        const sid = data.sessionId;
        
        // Join the game room
        socket.join(sid);
        sessionId = sid;
        
        console.log(`👤 Player socket joined: ${socket.id} → ${sid}`);
        
        if (callback) {
          callback({ success: true, sessionId: sid });
        }
      } catch (error) {
        console.error('❌ Error joining game:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    /**
     * Player registers (name + team)
     */
    socket.on(events.PLAYER_REGISTER, async (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        const result = await gameController.addPlayer(sid, {
          name: data.name,
          team: data.team,
          socketId: socket.id
        });
        
        if (result.success) {
          console.log(`✅ Player registered: ${data.name} (Team ${data.team})`);
          
          // Broadcast to all in room
          io.to(sid).emit(events.PLAYER_JOINED, {
            player: result.player,
            teamCount: result.teamCount
          });
          
          // Send current game state to new player
          const gameState = gameController.getGameState(sid);
          socket.emit(events.GAME_STATE_UPDATE, gameState);
          
          if (callback) {
            callback({
              success: true,
              player: result.player,
              gameState
            });
          }
        } else {
          if (callback) {
            callback({ success: false, error: result.error });
          }
        }
      } catch (error) {
        console.error('❌ Error registering player:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    /**
     * Player submits answer (optional - host usually does this)
     */
    socket.on(events.PLAYER_SUBMIT_ANSWER, async (data, callback) => {
      try {
        const sid = data.sessionId || sessionId;
        // Forward to host's submit handler
        const result = await gameController.submitAnswer(sid, data.answer);
        
        if (callback) {
          callback(result);
        }
      } catch (error) {
        console.error('❌ Error player submitting answer:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    // ==================== DISCONNECT ====================
    
    socket.on(events.DISCONNECT, () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      
      if (sessionId && clientType === 'player') {
        // Remove player and notify others
        const gameState = gameController.getGameState(sessionId);
        if (gameState) {
          io.to(sessionId).emit(events.PLAYER_LEFT, {
            socketId: socket.id
          });
        }
      }
      
      // Clean up
      gameController.handleDisconnect(socket.id);
      
      if (sessionId) {
        timerManager.cleanup(sessionId);
      }
    });
  });
};

module.exports = { initializeSocketHandlers };