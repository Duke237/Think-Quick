import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getGameByCode } from '../utils/api';

const socket = io();

const GamePage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [question, setQuestion] = useState(null);
  const [revealed, setRevealed] = useState([]);
  const [scores, setScores] = useState([0, 0]);
  const [strikes, setStrikes] = useState([0, 0]);

  const audioCorrectRef = useRef(null);
  const audioWrongRef = useRef(null);

  useEffect(() => {
    getGameByCode(code.toUpperCase())
      .then((g) => {
        setGame(g);
        setScores([g.teams?.[0]?.score || 0, g.teams?.[1]?.score || 0]);
        setRevealed(g.revealedAnswers || []);
      })
      .catch(() => navigate('/join'));
  }, [code, navigate]);

  useEffect(() => {
    if (!game) return;

    socket.emit('lobby:connect', { gameId: game._id });

    const onStartRound = (payload) => {
      setQuestion({ questionId: payload.questionId, text: payload.text });
      setRevealed([]);
    };

    const onReveal = (payload) => {
      setRevealed((r) => [...r, { text: payload.text, points: payload.points }]);
    };

    const onUpdateScores = (payload) => {
      if (payload.teams) setScores(payload.teams.map((t) => t.score));
    };

    const onStrike = (payload) => {
      if (payload.teamIndex != null) {
        setStrikes((s) => s.map((v, i) => (i === payload.teamIndex ? payload.strikes : v)));
      }
    };

    const onPlaySound = (payload) => {
      if (payload.type === 'correct') audioCorrectRef.current?.play();
      if (payload.type === 'wrong') audioWrongRef.current?.play();
    };

    socket.on('startRound', onStartRound);
    socket.on('revealAnswer', onReveal);
    socket.on('updateScores', onUpdateScores);
    socket.on('strike', onStrike);
    socket.on('playSound', onPlaySound);

    return () => {
      socket.off('startRound', onStartRound);
      socket.off('revealAnswer', onReveal);
      socket.off('updateScores', onUpdateScores);
      socket.off('strike', onStrike);
      socket.off('playSound', onPlaySound);
    };
  }, [game]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xl text-[rgba(255,255,255,0.8)]">Game Code: <span className="font-mono px-3 py-1 bg-surface/80 rounded">{code}</span></div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-sm text-[rgba(255,255,255,0.6)]">Team A</div>
              <div className="text-2xl text-gold font-bold">{scores[0] ?? 0}</div>
              <div className="text-xl text-[rgba(255,255,255,0.6)]">{'X'.repeat(strikes[0] || 0)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-[rgba(255,255,255,0.6)]">Team B</div>
              <div className="text-2xl text-electric font-bold">{scores[1] ?? 0}</div>
              <div className="text-xl text-[rgba(255,255,255,0.6)]">{'X'.repeat(strikes[1] || 0)}</div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-primary font-semibold">Question</div>
          <div className="mt-3 text-2xl">{question ? question.text : 'Waiting for the host to start the round...'}</div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Answers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(8)].map((_, i) => {
                const r = revealed[i];
                return (
                  <div key={i} className="p-4 bg-[rgba(0,0,0,0.2)] rounded flex items-center justify-between">
                    <div className="text-lg">{r ? r.text : '—'}</div>
                    <div className="text-primary font-semibold">{r ? r.points : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioCorrectRef} src="/sounds/correct.mp3" />
      <audio ref={audioWrongRef} src="/sounds/wrong.mp3" />
    </div>
  );
};

export default GamePage;
