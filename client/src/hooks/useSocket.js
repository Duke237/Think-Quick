import { useEffect } from 'react';
import socketService from '../services/socket';
import { useGameStore } from '../context/GameContext';

export const useSocket = (gameCode) => {
  const { setGame, updateGameState, showFeedback } = useGameStore();

  useEffect(() => {
    if (!gameCode) return;

    const socket = socketService.connect();
    socketService.joinGame(gameCode);

    // Timer events
    socketService.on('timer-started', ({ timer }) => {
      useGameStore.setState({ timer: timer.value, timerRunning: true });
    });

    socketService.on('timer-stopped', ({ timer }) => {
      useGameStore.setState({ timer: timer.value, timerRunning: false });
    });

    // Answer events
    socketService.on('answer-revealed', ({ answer, points, teamId, game }) => {
      setGame(game);
      showFeedback('success', `Correct! +${points} points`);
    });

    socketService.on('answer-incorrect', ({ strikes, maxStrikes }) => {
      updateGameState({ strikes });
      showFeedback('error', `Strike! ${strikes}/${maxStrikes}`);
    });

    // Round events
    socketService.on('round-complete', ({ game }) => {
      setGame(game);
      showFeedback('info', 'Round Complete!');
    });

    socketService.on('round-started', ({ game }) => {
      setGame(game);
      showFeedback('success', `Round ${game.currentRound} Started!`);
    });

    socketService.on('round-ended', ({ game }) => {
      setGame(game);
    });

    // Team events
    socketService.on('team-switched', ({ currentTeam }) => {
      updateGameState({ currentTeam });
      showFeedback('info', `${currentTeam.name}'s turn`);
    });

    // Game events
    socketService.on('game-over', ({ game }) => {
      setGame(game);
      showFeedback('success', 'Game Over!');
    });

    socketService.on('error', ({ message }) => {
      showFeedback('error', message);
    });

    return () => {
      socketService.disconnect();
    };
  }, [gameCode]);

  return socketService;
};