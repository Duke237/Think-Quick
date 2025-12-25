import GameSession from '../models/GameSession.js';
import Question from '../models/Question.js';

export const handleGameEvents = (io, socket, gameCode) => {
  
  // Start timer
  socket.on('start-timer', async () => {
    try {
      const game = await GameSession.findOne({ gameCode });
      game.timer.isRunning = true;
      await game.save();
      
      io.to(gameCode).emit('timer-started', { timer: game.timer });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Stop timer
  socket.on('stop-timer', async () => {
    try {
      const game = await GameSession.findOne({ gameCode });
      game.timer.isRunning = false;
      await game.save();
      
      io.to(gameCode).emit('timer-stopped', { timer: game.timer });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Submit answer
  socket.on('submit-answer', async ({ answer, teamId }) => {
    try {
      const game = await GameSession.findOne({ gameCode })
        .populate('currentQuestion');
      
      if (!game || !game.currentQuestion) {
        throw new Error('No active question');
      }

      const normalizedAnswer = answer.toLowerCase().trim();
      const matchedAnswer = game.currentQuestion.answers.find(
        ans => !game.revealedAnswers.some(ra => ra.text === ans.text) &&
               ans.text.toLowerCase().includes(normalizedAnswer)
      );

      if (matchedAnswer) {
        // Correct answer
        game.revealedAnswers.push({
          text: matchedAnswer.text,
          frequency: matchedAnswer.frequency
        });
        
        const points = matchedAnswer.frequency * game.getRoundMultiplier();
        game.awardPoints(teamId, matchedAnswer.frequency);
        
        await game.save();
        
        io.to(gameCode).emit('answer-revealed', {
          answer: matchedAnswer,
          points,
          teamId,
          game: await game.populate('currentQuestion')
        });
        
        // Check if all answers revealed
        if (game.revealedAnswers.length === game.currentQuestion.answers.length) {
          setTimeout(() => {
            io.to(gameCode).emit('round-complete', { game });
          }, 2000);
        }
      } else {
        // Wrong answer
        game.strikes += 1;
        await game.save();
        
        io.to(gameCode).emit('answer-incorrect', {
          strikes: game.strikes,
          maxStrikes: game.settings.maxStrikes
        });

        // Check if max strikes reached
        if (game.strikes >= game.settings.maxStrikes) {
          game.currentTeamIndex = (game.currentTeamIndex + 1) % game.teams.length;
          game.strikes = 0;
          await game.save();
          
          io.to(gameCode).emit('team-switched', {
            currentTeam: game.teams[game.currentTeamIndex]
          });
        }
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Next round
  socket.on('next-round', async () => {
    try {
      const game = await GameSession.findOne({ gameCode });
      
      if (game.currentRound >= 3) {
        game.status = 'game-over';
        await game.save();
        io.to(gameCode).emit('game-over', { game });
        return;
      }

      game.currentRound += 1;
      game.strikes = 0;
      game.revealedAnswers = [];
      game.timer.value = game.settings.roundDuration;
      
      // Get new question
      const question = await Question.aggregate([
        { $match: { isActive: true } },
        { $sample: { size: 1 } }
      ]);
      
      game.currentQuestion = question[0]._id;
      game.status = 'playing';
      await game.save();
      
      const populatedGame = await game.populate('currentQuestion');
      io.to(gameCode).emit('round-started', { game: populatedGame });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Switch team
  socket.on('switch-team', async () => {
    try {
      const game = await GameSession.findOne({ gameCode });
      game.currentTeamIndex = (game.currentTeamIndex + 1) % game.teams.length;
      game.strikes = 0;
      await game.save();
      
      io.to(gameCode).emit('team-switched', {
        currentTeam: game.teams[game.currentTeamIndex]
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // End round
  socket.on('end-round', async () => {
    try {
      const game = await GameSession.findOne({ gameCode });
      game.status = 'round-end';
      await game.save();
      
      io.to(gameCode).emit('round-ended', { game });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
};