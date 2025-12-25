import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { joinGame } from '../utils/api';

const Join = () => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!code.trim() || !name.trim()) return setError('Please enter a code and your name');
    setLoading(true);
    try {
      const data = await joinGame({ code: code.trim().toUpperCase(), name: name.trim() });
      // persist player info for lobby socket
      localStorage.setItem('thinkquick_player', JSON.stringify({ playerId: data.playerId, name: data.player.name, code: data.code }));
      // navigate to lobby by code
      navigate(`/lobby/${data.code}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[linear-gradient(180deg,var(--bg)_0%,var(--surface)_70%)]">
      <div className="container max-w-md mx-auto text-center">
        <h2 className="text-4xl text-gold font-extrabold mb-4">Join a Game</h2>
        <form onSubmit={handleJoin} className="space-y-4">
          <input
            className="w-full p-3 rounded-md bg-surface/60 text-center uppercase text-xl font-mono tracking-widest"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="GAME CODE"
            maxLength={6}
          />
          <input
            className="w-full p-3 rounded-md bg-surface/60"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <div className="flex justify-center gap-4">
            <button disabled={loading} className="glass-btn px-6 py-3">
              {loading ? 'Joining...' : 'Join Game'}
            </button>
            <Link to="/" className="glass-btn px-4 py-3">Back</Link>
          </div>
          {error && <div className="text-red-400 mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Join;
