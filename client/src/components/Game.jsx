import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import Clock from './Clock'; // added
import annyang from 'annyang';

const socket = io();

const Game = () => {
  const [game, setGame] = useState(null);

  useEffect(() => {
    socket.on('answerRevealed', (data) => {
      // Update UI with revealed answer
      console.log('Answer revealed:', data);
    });

    socket.on('strikeEvent', (data) => {
      // Update UI with strike event
      console.log('Strike event:', data);
    });

    if (annyang) {
      const commands = {
        'I say *answer': (answer) => {
          // Handle the answer submission
          console.log('User said:', answer);
          // Emit answer to server
          socket.emit('submitAnswer', { answer });
        },
      };
      annyang.addCommands(commands);
      annyang.start();
    }

    return () => {
      socket.off('answerRevealed');
      socket.off('strikeEvent');
      if (annyang) {
        annyang.abort();
      }
    };
  }, []);

  return (
    <div style={{ padding: 20, position: 'relative' }}>
      <h2>Game</h2>
      {/* small inline clock for the host */}
      <div style={{ position: 'absolute', right: 24, top: 80 }}>
        <Clock initialSeconds={20} compact />
      </div>

      <div>
        <strong>Game ID:</strong> {game?._id || 'creating...'}
      </div>

      {/* Game UI */}
    </div>
  );
};

export default Game;