import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../context/GameContext';
import { gameAPI } from '../services/api';
import GameBoard from '../components/game/GameBoard';

const Game = () => {
  const { gameCode } = useParams();
  const { setGame, setGameCode } = useGameStore();
  const socket = useSocket(gameCode);

  useEffect(() => {
    setGameCode(gameCode);
    
    // Fetch initial game state
    gameAPI.getGame(gameCode)
      .then(({ data }) => setGame(data.game))
      .catch(console.error);
  }, [gameCode]);

  return <GameBoard />;
};

export default Game;

export { AnswerGrid, Scoreboard, Timer, StrikeDisplay, HostControls };