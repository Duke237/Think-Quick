import GameSession from '../models/GameSession.js';

export const registerPlayer = async (req, res) => {
  try {
    const { gameCode } = req.params;
    const { name, teamId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Player name is required' });
    }

    if (!teamId || ![1, 2].includes(teamId)) {
      return res.status(400).json({ error: 'Valid team ID is required (1 or 2)' });
    }

    const game = await GameSession.findOne({ gameCode });
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'lobby') {
      return res.status(400).json({ error: 'Game has already started' });
    }

    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newPlayer = {
      id: playerId,
      name: name.trim(),
      teamId,
      joinedAt: new Date()
    };

    game.players.push(newPlayer);
    await game.save();

    console.log(`✅ Player registered: ${name} (${playerId}) joined ${game.teams.find(t => t.id === teamId).name}`);

    const io = req.app.get('io');
    io.to(gameCode).emit('player-joined', {
      player: newPlayer,
      totalPlayers: game.players.length,
      teams: game.teams.map(team => ({
        ...team.toObject(),
        playerCount: game.players.filter(p => p.teamId === team.id).length
      }))
    });

    res.status(201).json({ 
      success: true,
      player: newPlayer,
      game: {
        gameCode: game.gameCode,
        status: game.status,
        totalPlayers: game.players.length
      }
    });
  } catch (error) {
    console.error('❌ Register player error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPlayers = async (req, res) => {
  try {
    const { gameCode } = req.params;
    
    const game = await GameSession.findOne({ gameCode });
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ 
      success: true,
      players: game.players,
      teams: game.teams.map(team => ({
        ...team.toObject(),
        playerCount: game.players.filter(p => p.teamId === team.id).length,
        players: game.players.filter(p => p.teamId === team.id)
      }))
    });
  } catch (error) {
    console.error('❌ Get players error:', error);
    res.status(500).json({ error: error.message });
  }
};