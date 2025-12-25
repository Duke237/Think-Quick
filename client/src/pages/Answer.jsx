import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getGameByCode, submitAnswer } from '../utils/api';

const socket = io();

const Answer = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [player, setPlayer] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [enabled, setEnabled] = useState(false); // enabled when round active and not submitted

  const audioCorrectRef = useRef(null);
  const audioWrongRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('thinkquick_player');
    if (!stored) return navigate('/join');
    const me = JSON.parse(stored);
    if (!me || me.code?.toUpperCase() !== code.toUpperCase()) return navigate('/join');
    setPlayer(me);

    getGameByCode(code.toUpperCase())
      .then((g) => setGame(g))
      .catch(() => navigate('/join'));
  }, [code, navigate]);

  useEffect(() => {
    if (!game || !player) return;

    socket.emit('lobby:connect', { gameId: game._id, playerId: player.playerId });

    const onStartRound = () => {
      setEnabled(true);
      setMsg(null);
    };

    const onReveal = (payload) => {
      // if the revealed answer matches our last submitted text show result
      if (!payload || !payload.text) return;
      if (payload.text.trim().toLowerCase() === (input || '').trim().toLowerCase()) {
        setMsg({ type: 'correct', text: `Correct! +${payload.points}` });
        audioCorrectRef.current?.play();
      }
    };

    const onStrike = (payload) => {
      if (payload.teamIndex != null) {
        // if we are on that team, show message
        const myTeamIndex = computeMyTeamIndex(game, player.playerId);
        if (myTeamIndex === payload.teamIndex) {
          setMsg({ type: 'wrong', text: `Strike ${payload.strikes}` });
          audioWrongRef.current?.play();
        }
      }
    };

    const onLobbyUpdate = (payload) => {
      // update local game players list so team changes are reflected
      if (payload.players) setGame((g) => ({ ...g, players: payload.players }));
    };

    socket.on('startRound', onStartRound);
    socket.on('revealAnswer', onReveal);
    socket.on('strike', onStrike);
    socket.on('lobbyUpdate', onLobbyUpdate);

    return () => {
      socket.off('startRound', onStartRound);
      socket.off('revealAnswer', onReveal);
      socket.off('strike', onStrike);
      socket.off('lobbyUpdate', onLobbyUpdate);
    };
  }, [game, player, input]);

  function computeMyTeamIndex(g, playerId) {
    if (!g || !g.players) return null;
    const p = g.players.find((x) => String(x._id) === String(playerId));
    if (!p) return null;
    return p.team === 'A' ? 0 : p.team === 'B' ? 1 : null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!input.trim()) return;
    const myTeamIndex = computeMyTeamIndex(game, player.playerId);
    if (myTeamIndex == null) return setMsg({ type: 'error', text: 'You are not assigned to a team' });

    setLoading(true);
    setEnabled(false);
    try {
      const res = await submitAnswer({ gameId: game._id, teamIndex: myTeamIndex, answer: input.trim() });
      // server will emit reveal/strike etc, but use response too
      if (res.correct) {
        setMsg({ type: 'correct', text: `Correct! +${res.points}` });
        audioCorrectRef.current?.play();
      } else {
        setMsg({ type: 'wrong', text: `Wrong! Strikes: ${res.strikes}` });
        audioWrongRef.current?.play();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Submission failed' });
    } finally {
      setLoading(false);
    }
  };

  // disable input if not round phase
  useEffect(() => {
    if (!game) return;
    setEnabled(game.phase === 'round');
  }, [game]);

  if (!player) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-[rgba(255,255,255,0.03)] p-6 rounded-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gold font-bold">Answer</h2>
            <div className="text-sm text-[rgba(255,255,255,0.7)]">Game: <span className="font-mono">{code}</span></div>
            <div className="text-sm text-[rgba(255,255,255,0.6)]">Player: {player.name}</div>
          </div>
          <div className="text-right">
            <div className="text-sm">Team: {(() => {
              const p = game?.players?.find(x => String(x._id) === String(player.playerId));
              return p ? (p.team === 'A' ? 'A' : p.team === 'B' ? 'B' : 'Unassigned') : '...';
            })()}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full p-4 rounded-md text-2xl bg-surface/60 min-h-[120px] resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={enabled ? 'Type your answer...' : 'Waiting for the host to start the round'}
            disabled={!enabled || loading}
          />

          <div className="flex items-center gap-4">
            <button disabled={!enabled || loading} className="glass-btn px-6 py-3">
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>
            <button type="button" onClick={() => { setInput(''); setMsg(null); }} className="glass-btn px-4 py-2">Clear</button>
            <button type="button" onClick={() => navigate(`/lobby/${code}`)} className="glass-btn px-4 py-2">Back to Lobby</button>
          </div>

          {msg && (
            <div className={`mt-3 p-3 rounded ${msg.type === 'correct' ? 'bg-green-900 text-green-300' : msg.type === 'wrong' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>{msg.text}</div>
          )}
        </form>
      </div>

      <audio ref={audioCorrectRef} src="/sounds/correct.mp3" />
      <audio ref={audioWrongRef} src="/sounds/wrong.mp3" />
    </div>
  );
};

export default Answer;
