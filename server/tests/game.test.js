const gameController = require('../src/game/GameController');
const Question = require('../src/models/Question');

describe('Game Controller', () => {
  describe('createGame', () => {
    it('should create a new game session', async () => {
      const result = await gameController.createGame('host123');

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.session.status).toBe('waiting');
    });

    it('should create game with custom settings', async () => {
      const settings = {
        maxStrikes: 5,
        timerSeconds: 30
      };

      const result = await gameController.createGame('host456', settings);

      expect(result.success).toBe(true);
      expect(result.session.settings.maxStrikes).toBe(5);
      expect(result.session.settings.timerSeconds).toBe(30);
    });
  });

  describe('addPlayer', () => {
    it('should add a player to the game', async () => {
      const game = await gameController.createGame('host789');
      
      const result = await gameController.addPlayer(game.sessionId, {
        name: 'Player 1',
        team: 'A',
        socketId: 'socket123'
      });

      expect(result.success).toBe(true);
      expect(result.player.name).toBe('Player 1');
      expect(result.player.team).toBe('A');
    });

    it('should fail to add player to non-existent game', async () => {
      const result = await gameController.addPlayer('fake-session', {
        name: 'Player 1',
        team: 'A',
        socketId: 'socket123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('loadQuestion', () => {
    beforeEach(async () => {
      // Seed a test question
      await Question.create({
        questionId: 'TEST_001',
        text: 'Test Question',
        category: 'Test',
        answers: [
          { text: 'Answer 1', frequency: 50 },
          { text: 'Answer 2', frequency: 30 },
          { text: 'Answer 3', frequency: 20 }
        ]
      });
    });

    it('should load a question for the game', async () => {
      const game = await gameController.createGame('host999');
      await gameController.startGame(game.sessionId);

      const result = await gameController.loadQuestion(game.sessionId);

      expect(result.success).toBe(true);
      expect(result.question).toBeDefined();
      expect(result.round).toBeDefined();
    });
  });

  describe('submitAnswer', () => {
    beforeEach(async () => {
      await Question.create({
        questionId: 'TEST_002',
        text: 'Name a programming language',
        category: 'Tech',
        answers: [
          { text: 'JavaScript', frequency: 40 },
          { text: 'Python', frequency: 35 },
          { text: 'Java', frequency: 25 }
        ]
      });
    });

    it('should accept correct answer', async () => {
      const game = await gameController.createGame('host111');
      await gameController.startGame(game.sessionId);
      await gameController.loadQuestion(game.sessionId, 'TEST_002');

      const result = await gameController.submitAnswer(
        game.sessionId,
        'JavaScript'
      );

      expect(result.success).toBe(true);
      expect(result.correct).toBe(true);
      expect(result.answer.points).toBe(40);
    });

    it('should reject wrong answer and add strike', async () => {
      const game = await gameController.createGame('host222');
      await gameController.startGame(game.sessionId);
      await gameController.loadQuestion(game.sessionId, 'TEST_002');

      const result = await gameController.submitAnswer(
        game.sessionId,
        'Ruby'
      );

      expect(result.success).toBe(false);
      expect(result.correct).toBe(false);
      expect(result.strikes).toBe(1);
    });
  });
});