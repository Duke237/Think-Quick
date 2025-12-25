import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getGame } from '../utils/api';
import io from 'socket.io-client';

const socket = io();

const WaitingRoom = () => {
  const { id } = useParams();
  const location = useLocation();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getGame(id)
      .then((g) => {
        if (mounted) setGame(g);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));

    const handlePlayerJoined = (payload) => {
      if (payload.gameId === id) {
        setGame((prev) => ({ ...prev, players: [...(prev?.players || []), payload.player] }));
      }
    };

    socket.on('playerJoined', handlePlayerJoined);
    return () => {
      mounted = false;
      socket.off('playerJoined', handlePlayerJoined);
    };
  }, [id]);

  if (loading) return <div className="p-6 text-center">Loading game...</div>;
  if (!game) return <div className="p-6 text-center">Game not found</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-[rgba(255,255,255,0.03)] p-6 rounded-xl">
        <h2 className="text-3xl text-gold font-extrabold mb-2">Waiting Room</h2>
        <p className="mb-4 text-sm text-[rgba(255,255,255,0.7)]">Game Code: <span className="font-mono text-lg px-3 py-1 bg-surface/80 rounded">{game.code}</span></p>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Players ({(game.players || []).length})</h3>
          <ul className="space-y-2">
            {(game.players || []).map((p) => (
              <li key={p.playerId} className="p-3 bg-[rgba(0,0,0,0.2)] rounded flex items-center justify-between">
                <span>{p.name}</span>
                <small className="text-xs text-[rgba(255,255,255,0.6)]">{new Date(p.joinedAt).toLocaleTimeString()}</small>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Link to="/" className="glass-btn">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;