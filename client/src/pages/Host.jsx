import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createGame } from '../utils/api';

const Host = () => {
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await createGame();
      setGame(data);
    } catch (err) {
      setError('Failed to create game. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[linear-gradient(180deg,var(--bg)_0%,var(--surface)_70%)]">
      <div className="container max-w-2xl mx-auto text-center">
        <h2 className="text-4xl text-gold font-extrabold mb-4">Host a Game</h2>
        <p className="text-lg text-[rgba(255,255,255,0.8)] mb-6">Create a new game session and share the code with players to join.</p>

        {!game && (
          <div className="space-y-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="glass-btn inline-flex items-center justify-center px-6 py-3 text-lg font-bold"
            >
              {loading ? 'Creating...' : 'Create New Game'}
            </button>
            <Link to="/" className="glass-btn">Back to Landing</Link>
            {error && <div className="text-red-400 mt-2">{error}</div>}
          </div>
        )}

        {game && (
          <div className="mt-8 bg-[rgba(255,255,255,0.03)] p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl text-electric font-semibold mb-4">Game Created</h3>
            <p className="text-sm text-[rgba(255,255,255,0.7)] mb-3">Share this code with players to join:</p>
            <div className="flex items-center justify-center space-x-3">
              <div className="px-6 py-4 rounded-md bg-surface/80 text-2xl font-mono tracking-widest">{game.code}</div>
              <button
                onClick={() => navigator.clipboard?.writeText(game.code)}
                className="glass-btn px-3 py-2"
              >
                Copy
              </button>
            </div>

            <div className="mt-6">
              <Link to="/" className="glass-btn mr-3">Back to Landing</Link>
              <Link to={`/lobby/${game.code}?host=true`} onClick={() => localStorage.setItem(`thinkquick_host_${game.code}`, 'true')} className="glass-btn mr-3">Go to Lobby</Link>
              <button
                onClick={() => window.location.reload()}
                className="glass-btn"
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Host;
