import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { getGameByCode } from '../utils/api';

const socket = io();

const HostControl = () => {
  const { code } = useParams();
  const [game, setGame] = useState(null);
  const [revealText, setRevealText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGameByCode(code.toUpperCase())
      .then((g) => setGame(g))
      .catch(() => {});

    socket.on('lobbyUpdate', (payload) => {
      if (payload.players) setGame((g) => ({ ...g, players: payload.players }));
    });
    socket.on('revealAnswer', () => {});
    socket.on('strike', () => {});
    socket.on('turn:changed', (p) => setGame((g) => ({ ...g, currentTurnTeam: p.team })));

    return () => {
      socket.off('lobbyUpdate');
      socket.off('revealAnswer');
      socket.off('strike');
      socket.off('turn:changed');
    };
  }, [code]);

  const emitAddStrike = (team) => {
    if (!game) return;
    socket.emit('host:addStrike', { gameId: game._id, team });
  };

  const emitPass = () => {
    if (!game) return;
    socket.emit('host:pass', { gameId: game._id });
  };

  const emitReveal = () => {
    if (!game || !revealText.trim()) return;
    socket.emit('host:reveal', { gameId: game._id, text: revealText.trim() });
    setRevealText('');
  };

  if (!game) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen p-6 flex items-start justify-center">
      <div className="max-w-3xl w-full bg-[rgba(255,255,255,0.03)] p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl text-gold font-bold">Host Control - {code}</h2>
          <div className="text-sm">Current Turn: <strong>{game.currentTurnTeam || 'None'}</strong></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded bg-[rgba(0,0,0,0.2)]">
            <h3 className="font-semibold mb-2">Strikes</h3>
            <div className="flex gap-2">
              <button onClick={() => emitAddStrike('A')} className="glass-btn px-3 py-2">Add Strike A</button>
              <button onClick={() => emitAddStrike('B')} className="glass-btn px-3 py-2">Add Strike B</button>
            </div>
            <div className="mt-3">Team A strikes: {game.teams?.[0]?.strikes || 0}</div>
            <div>Team B strikes: {game.teams?.[1]?.strikes || 0}</div>
          </div>

          <div className="p-4 rounded bg-[rgba(0,0,0,0.2)]">
            <h3 className="font-semibold mb-2">Turn</h3>
            <div className="flex gap-2">
              <button onClick={emitPass} className="glass-btn px-3 py-2">Pass Turn</button>
            </div>
          </div>

          <div className="p-4 rounded bg-[rgba(0,0,0,0.2)]">
            <h3 className="font-semibold mb-2">Reveal</h3>
            <input value={revealText} onChange={(e) => setRevealText(e.target.value)} placeholder="Answer text to reveal" className="w-full p-2 rounded bg-surface/60 mb-2" />
            <div className="flex gap-2">
              <button onClick={emitReveal} className="glass-btn px-3 py-2">Reveal</button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold">Players</h4>
          <ul className="mt-2 space-y-2">
            {game.players?.map(p => (
              <li key={p._id} className="p-2 bg-[rgba(0,0,0,0.2)] rounded flex items-center justify-between">
                <span>{p.name}</span>
                <span className="text-sm text-[rgba(255,255,255,0.6)]">Team: {p.team}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HostControl;