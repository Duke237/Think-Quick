import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Clock from './Clock';
import annyang from 'annyang';

const socket = io();

const Game = () => {
  const [game, setGame] = useState(null);

  useEffect(() => {
    socket.on('answerRevealed', (data) => console.log('Answer revealed:', data));
    socket.on('strikeEvent', (data) => console.log('Strike event:', data));

    if (annyang) {
      const commands = {
        'I say *answer': (answer) => {
          socket.emit('submitAnswer', { answer });
        },
      };
      annyang.addCommands(commands);
      annyang.start();
    }

    return () => {
      socket.off('answerRevealed');
      socket.off('strikeEvent');
      if (annyang) annyang.abort();
    };
  }, []);

  return (
    <div className="relative p-6">
      <h2 className="text-2xl text-gold font-bold">Game</h2>

      <div className="absolute right-6 top-20">
        <Clock initialSeconds={20} compact />
      </div>

      <div className="mt-6">
        <strong className="text-[rgba(255,255,255,0.85)]">Game ID:</strong>
        <span className="ml-2 text-white">{game?._id || 'creating...'}</span>
      </div>

      <div className="mt-8 card">
        {/* Placeholder for game content */}
        <div className="text-primary font-semibold">Question</div>
        <div className="mt-3 text-lg">What is the capital of France?</div>
      </div>
    </div>
  );
};

export default Game;