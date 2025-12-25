import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { getGameByCode } from '../utils/api';

const socket = io();

function formatTime(s) {
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

const Timer = () => {
  const { code } = useParams();
  const [game, setGame] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState(20);
  const [isHost, setIsHost] = useState(false);
  const warningPlayed = useRef(false);

  const audioWarn = useRef(null);
  const audioFinal = useRef(null);

  useEffect(() => {
    const storedHost = localStorage.getItem(`thinkquick_host_${code}`);
    setIsHost(!!storedHost);

    getGameByCode(code.toUpperCase())
      .then((g) => {
        setGame(g);
        setDuration(g.timer?.duration || 20);
        setRemaining(g.timer?.remaining || (g.timer?.duration || 20));
        setRunning(!!g.timer?.running);
      })
      .catch(() => {
        // redirect to join or show message
      });
  }, [code]);

  useEffect(() => {
    const onTimerUpdate = (payload) => {
      if (!payload) return;
      const r = payload.remaining;
      setRemaining(r);
      setRunning(r > 0);
      if (r <= 5 && r > 0 && !warningPlayed.current) {
        warningPlayed.current = true;
        audioWarn.current?.play();
      }
      if (r <= 0) {
        audioFinal.current?.play();
      }
    };

    const onTimerPaused = (payload) => {
      setRunning(false);
    };

    const onTimerReset = (payload) => {
      setDuration(payload.duration);
      setRemaining(payload.remaining);
      setRunning(false);
      warningPlayed.current = false;
    };

    socket.on('timer:update', onTimerUpdate);
    socket.on('timer:paused', onTimerPaused);
    socket.on('timer:reset', onTimerReset);
    socket.on('timer:finished', () => { setRunning(false); setRemaining(0); audioFinal.current?.play(); });

    return () => {
      socket.off('timer:update', onTimerUpdate);
      socket.off('timer:paused', onTimerPaused);
      socket.off('timer:reset', onTimerReset);
      socket.off('timer:finished');
    };
  }, []);

  const emitStart = () => {
    if (!game) return;
    warningPlayed.current = false;
    socket.emit('timer:start', { gameId: game._id, duration: Number(duration) });
  };

  const emitPause = () => {
    if (!game) return;
    socket.emit('timer:pause', { gameId: game._id });
  };

  const emitReset = () => {
    if (!game) return;
    warningPlayed.current = false;
    socket.emit('timer:reset', { gameId: game._id, duration: Number(duration) });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[linear-gradient(180deg,var(--bg)_0%,var(--surface)_70%)]">
      <div className="text-center">
        <div className="text-6xl md:text-9xl font-mono tracking-widest mb-6">{formatTime(Math.max(0, remaining))}</div>
        <div className="mb-6">
          <label className="text-sm mr-2">Duration (seconds):</label>
          <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-32 p-2 rounded bg-surface/60" />
        </div>
        <div className="flex items-center justify-center gap-4">
          {isHost ? (
            <>
              <button onClick={emitStart} className="glass-btn px-6 py-3">Start</button>
              <button onClick={emitPause} className="glass-btn px-6 py-3">Pause</button>
              <button onClick={emitReset} className="glass-btn px-6 py-3">Reset</button>
            </>
          ) : (
            <div className="text-sm text-[rgba(255,255,255,0.7)]">Waiting for host controls…</div>
          )}
        </div>
      </div>

      <audio ref={audioWarn} src="/sounds/warn.mp3" />
      <audio ref={audioFinal} src="/sounds/final.mp3" />
    </div>
  );
};

export default Timer;
