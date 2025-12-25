import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getGameByCode } from '../utils/api';
import axios from 'axios';

const socket = io();
const API_BASE_URL = 'http://localhost:5000/api';

const FastMoney = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [myIndex, setMyIndex] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [locked, setLocked] = useState([]);
  const [timer, setTimer] = useState(10);
  const intervalRef = useRef(null);
  const [status, setStatus] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    getGameByCode(code.toUpperCase())
      .then((g) => {
        setGame(g);
        // determine player's index using localStorage
        const stored = localStorage.getItem('thinkquick_player');
        if (stored) {
          const p = JSON.parse(stored);
          const idx = g.players?.findIndex(x => String(x._id) === String(p.playerId));
          if (idx >= 0) setMyIndex(idx);
        }
        // fetch questions
        return axios.get(`${API_BASE_URL}/games/${g._id}/fast-money/questions`);
      })
      .then((r) => {
        setQuestions(r.data.questions || []);
        setAnswers(new Array(5).fill(''));
        setLocked(new Array(5).fill(false));
      })
      .catch(() => navigate('/join'));
  }, [code, navigate]);

  useEffect(() => {
    // socket listeners
    socket.on('fastMoney:playerSubmitted', ({ playerIndex, total }) => {
      setStatus(`Player ${playerIndex + 1} submitted (${total} pts)`);
    });
    socket.on('fastMoney:complete', ({ fastMoney, grand, winnerTeamIndex }) => {
      setResults({ fastMoney, grand, winnerTeamIndex });
      setStatus('Fast Money complete');
    });

    return () => {
      socket.off('fastMoney:playerSubmitted');
      socket.off('fastMoney:complete');
    };
  }, []);

  useEffect(() => {
    // per-question timer
    if (questions.length === 0) return;
    startTimer();
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, questions]);

  function startTimer() {
    clearInterval(intervalRef.current);
    setTimer(10);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          // lock current
          handleLockCurrent();
          // advance
          setTimeout(() => setCurrent((c) => Math.min(4, c + 1)), 400);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function handleLockCurrent() {
    setLocked((prev) => {
      const copy = [...prev];
      copy[current] = true;
      return copy;
    });
  }

  function handleAnswerChange(i, v) {
    setAnswers((a) => {
      const copy = [...a];
      copy[i] = v;
      return copy;
    });
  }

  async function handleSubmitAll() {
    if (myIndex == null) return setStatus('You are not one of the two players for Fast Money');
    // ensure all locked or answered
    const payload = answers.map((ans, i) => ({ questionId: questions[i].questionId, answer: ans || '' }));
    setSubmitted(true);
    setStatus('Submitting...');
    try {
      const res = await axios.post(`${API_BASE_URL}/games/${game._id}/fast-money/submit`, { playerIndex: myIndex, answers: payload });
      setStatus('Submitted. Waiting for other player...');
      // refresh game state
      const g = await axios.get(`${API_BASE_URL}/games/${game._id}`);
      setGame(g.data);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Submission failed');
      setSubmitted(false);
    }
  }

  if (!game) return <div className="p-6 text-center">Loading fast money...</div>;

  if (game.players?.length < 2) return <div className="p-6 text-center">Waiting for two players to be assigned for Fast Money.</div>;

  if (myIndex == null) return <div className="p-6 text-center">You are not one of the two Fast Money players. Ask the host to pick you.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-[rgba(255,255,255,0.03)] p-6 rounded-xl">
        <h2 className="text-2xl text-gold font-bold mb-2">Fast Money — Player {myIndex + 1}</h2>
        <div className="text-sm mb-4">Answer 5 questions quickly. Each question has a timer (10s). Your answers will be locked when time expires or when you navigate forward.</div>

        <div className="mb-4">
          <div className="text-sm text-[rgba(255,255,255,0.6)]">Question {current + 1} / 5</div>
          <div className="text-xl font-semibold mt-2">{questions[current]?.text}</div>
          <div className="mt-2">Time: <span className="font-mono">{timer}s</span></div>
          <textarea
            className="w-full p-3 mt-3 rounded bg-surface/60"
            value={answers[current]}
            onChange={(e) => handleAnswerChange(current, e.target.value)}
            disabled={locked[current] || submitted}
            placeholder={locked[current] ? 'Locked' : 'Type your answer...'}
            rows={3}
          />
          <div className="flex gap-2 mt-3">
            <button disabled={locked[current] || submitted} onClick={() => { handleLockCurrent(); setCurrent((c) => Math.min(4, c + 1)); }} className="glass-btn">Lock & Next</button>
            <button disabled={submitted} onClick={() => { setCurrent((c) => Math.max(0, c - 1)); }} className="glass-btn">Back</button>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm mb-2">Progress:</div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`px-3 py-1 rounded ${locked[i] ? 'bg-green-800' : 'bg-[rgba(0,0,0,0.2)]'}`}>Q{i + 1}</div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button disabled={submitted} onClick={handleSubmitAll} className="glass-btn px-6 py-3">Submit All Answers</button>
          <div className="mt-3 text-sm">{status}</div>
        </div>

        {results && (
          <div className="mt-6 bg-[rgba(255,255,255,0.03)] p-4 rounded">
            <h4 className="font-semibold">Results</h4>
            <div className="mt-2">Player 1: {results.fastMoney?.[0]?.total ?? 0}</div>
            <div>Player 2: {results.fastMoney?.[1]?.total ?? 0}</div>
            <div className="mt-2">Grand awarded: {results.grand}</div>
            <div className="font-bold mt-2">Winner Team Index: {results.winnerTeamIndex}</div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FastMoney;