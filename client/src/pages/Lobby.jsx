import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
import { getGameByCode } from '../utils/api';

const socket = io();

const Lobby = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [hostSocketId, setHostSocketId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const local = useRef(null);

  useEffect(() => {
    let mounted = true;
    const stored = localStorage.getItem('thinkquick_player');
    if (stored) local.current = JSON.parse(stored);

    getGameByCode(code.toUpperCase())
      .then((g) => {
        if (!mounted) return;
        setGame(g);
        setPlayers(g.players || []);
        setHostSocketId(g.hostSocketId || null);
      })
      .catch((err) => setError(err.response?.data?.message || 'Game not found'))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [code]);

  useEffect(() => {
    if (!game) return;

    const currentPlayer = local.current;
    const isHost = new URLSearchParams(location.search).get('host') === 'true';

    socket.emit('lobby:connect', {
      gameId: game._id,
      playerId: currentPlayer?.playerId,
      name: currentPlayer?.name,
      isHost: isHost,
    });

    const onLobbyUpdate = (payload) => {
      if (payload.players) setPlayers(payload.players);
      if (payload.hostSocketId) setHostSocketId(payload.hostSocketId);
    };

    const onGameStarted = () => {
      // for now redirect to /game (or implement specific route)
      navigate('/game');
    };

    socket.on('lobbyUpdate', onLobbyUpdate);
    socket.on('gameStarted', onGameStarted);

    return () => {
      socket.off('lobbyUpdate', onLobbyUpdate);
      socket.off('gameStarted', onGameStarted);
    };
  }, [game, location.search, navigate]);

  const myPlayerId = local.current?.playerId;

  const handleChangeTeam = (playerId, team) => {
    socket.emit('lobby:changeTeam', { gameId: game._id, playerId, team });
  };

  const handleStart = () => {
    socket.emit('lobby:start', { gameId: game._id });
  };

  if (loading) return <div className="p-6 text-center">Loading lobby...</div>;
  if (error) return <div className="p-6 text-center text-red-400">{error}</div>;
  if (!game) return <div className="p-6 text-center">Game not found</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[linear-gradient(180deg,var(--bg)_0%,var(--surface)_70%)]">
      <div className="max-w-3xl w-full bg-[rgba(255,255,255,0.03)] p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl text-gold font-extrabold">Lobby</h2>
            <div className="text-sm text-[rgba(255,255,255,0.7)]">Game Code: <span className="font-mono text-lg px-3 py-1 bg-surface/80 rounded">{game.code}</span></div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[rgba(255,255,255,0.6)]">Players: {players.length}</div>
            <div className="mt-2">
              {(hostSocketId === socket.id || new URLSearchParams(location.search).get('host') === 'true') && (
                <div className="flex gap-2">
                  <button onClick={handleStart} className="glass-btn px-4 py-2">Start Game</button>
                  <a href={`/timer/${game.code}`} className="glass-btn px-4 py-2">Timer</a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Team A</h3>
            <ul className="space-y-2">
              {players.filter(p => p.team === 'A').map(p => (
                <li key={p._id} className="p-3 bg-[rgba(0,0,0,0.2)] rounded flex items-center justify-between">
                  <span>{p.name}</span>
                  <div className="flex gap-2 items-center">
                    {(myPlayerId === p._id || new URLSearchParams(location.search).get('host') === 'true') && (
                      <button onClick={() => handleChangeTeam(p._id, 'none')} className="glass-btn px-3 py-1">Remove</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Team B</h3>
            <ul className="space-y-2">
              {players.filter(p => p.team === 'B').map(p => (
                <li key={p._id} className="p-3 bg-[rgba(0,0,0,0.2)] rounded flex items-center justify-between">
                  <span>{p.name}</span>
                  <div className="flex gap-2 items-center">
                    {(myPlayerId === p._id || new URLSearchParams(location.search).get('host') === 'true') && (
                      <button onClick={() => handleChangeTeam(p._id, 'none')} className="glass-btn px-3 py-1">Remove</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Free Players</h3>
          <ul className="space-y-2">
            {players.filter(p => p.team === 'none').map(p => (
              <li key={p._id} className="p-3 bg-[rgba(0,0,0,0.2)] rounded flex items-center justify-between">
                <span>{p.name}</span>
                <div className="flex gap-2">
                  {(myPlayerId === p._id || new URLSearchParams(location.search).get('host') === 'true') && (
                    <>
                      <button onClick={() => handleChangeTeam(p._id, 'A')} className="glass-btn px-3 py-1">Assign A</button>
                      <button onClick={() => handleChangeTeam(p._id, 'B')} className="glass-btn px-3 py-1">Assign B</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 mt-6">
          <Link to="/" className="glass-btn">Back to Landing</Link>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
