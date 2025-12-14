import React, { useEffect, useRef, useState } from 'react';
import '../styles/Clock.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

/*
 Minimal, premium game-show clock:
 - Fullscreen, centered circular clock only (no extra text)
 - Voice start: "start" | "go" | "begin"
 - Single fallback Start button shown only if voice unsupported or denied
 - Smooth animation (requestAnimationFrame), ticking sound per second, buzzer at end
 - Proper cleanup for RAF and SpeechRecognition
*/

export default function Clock({ initialSeconds = 25, onExpire } = {}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [progress, setProgress] = useState(0); // 0..1 elapsed fraction
  const [running, setRunning] = useState(false);
  const [showFallback, setShowFallback] = useState(false); // show fallback Start button

  const durationRef = useRef(initialSeconds * 1000);
  const startRef = useRef(null); // RAF start timestamp
  const rafRef = useRef(null);
  const lastTickRef = useRef(null);
  const audioCtxRef = useRef(null);
  const recRef = useRef(null);
  const allowedToListenRef = useRef(true);
  const lastRenderRef = useRef(0);

  // sync props
  useEffect(() => {
    durationRef.current = initialSeconds * 1000;
    setSecondsLeft(initialSeconds);
    setProgress(0);
  }, [initialSeconds]);

  // create single AudioContext
  useEffect(() => {
    try { audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { audioCtxRef.current = null; }
    return () => {
      try { if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    };
  }, []);

  // tick sound (short)
  function tickSound() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 1200;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.005);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      setTimeout(()=>{ try { o.stop(); } catch(e){} }, 90);
    } catch (e) {}
  }

  // buzzer at end
  function buzzerSound() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(160, ctx.currentTime);
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.02);
      o.start();
      o.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
      setTimeout(()=>{ try { o.stop(); } catch(e){} }, 700);
    } catch (e) {}
  }

  // RAF loop (throttled UI updates)
  function rafLoop(now) {
    if (!startRef.current) startRef.current = now;
    const elapsed = now - startRef.current;
    const t = Math.min(elapsed / durationRef.current, 1);
    const remainingMs = Math.max(durationRef.current - elapsed, 0);
    const remainingS = Math.ceil(remainingMs / 1000);

    // throttle UI updates (~30 fps)
    if (now - lastRenderRef.current > 33) {
      setProgress(t);
      setSecondsLeft(remainingS);
      lastRenderRef.current = now;
    }

    // new second tick detection
    if (lastTickRef.current == null) lastTickRef.current = remainingS;
    if (remainingS !== lastTickRef.current) {
      lastTickRef.current = remainingS;
      if (remainingS > 0) tickSound();
    }

    if (t >= 1) {
      // finish
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
      lastTickRef.current = null;
      setRunning(false);
      setProgress(1);
      setSecondsLeft(0);
      buzzerSound();
      onExpire?.();
      // resume voice listening after finish if allowed
      tryStartRecognition();
      return;
    }
    rafRef.current = requestAnimationFrame(rafLoop);
  }

  function startTimer(secs = null) {
    if (running) return;
    if (secs != null && Number.isFinite(secs) && secs > 0) {
      durationRef.current = secs * 1000;
      setSecondsLeft(secs);
    } else {
      durationRef.current = initialSeconds * 1000;
      setSecondsLeft(Math.ceil(durationRef.current / 1000));
    }
    setRunning(true);
    lastTickRef.current = null;
    // stop recognition during run to avoid double triggers
    stopRecognition();
    // small immediate tick for feedback
    tickSound();
    // start RAF
    stopRAF();
    rafRef.current = requestAnimationFrame(rafLoop);
  }

  function stopRAF() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startRef.current = null;
    lastTickRef.current = null;
  }

  // Speech recognition (start on mount)
  function tryStartRecognition() {
    if (!SpeechRecognition) {
      setShowFallback(true);
      return;
    }
    if (recRef.current) {
      try { recRef.current.start(); return; } catch (e) { /* fallthrough */ }
    }
    let rec;
    try {
      rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
    } catch (e) {
      setShowFallback(true);
      return;
    }

    rec.onresult = (e) => {
      const phrase = (e.results[0][0].transcript || '').toLowerCase();
      if (/(\bstart\b|\bgo\b|\bbegin\b)/.test(phrase)) {
        // voice detected -> start timer
        startTimer();
        setShowFallback(false);
      } else {
        // allow numeric start like "30"
        const m = phrase.match(/\d+/);
        if (m) {
          const val = Number(m[0]);
          if (Number.isFinite(val) && val > 0) startTimer(val);
        }
      }
    };

    rec.onerror = (ev) => {
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        // permission denied -> show fallback and stop trying
        setShowFallback(true);
        allowedToListenRef.current = false;
        try { rec.stop(); } catch (e) {}
      } else {
        // transient errors: show fallback but keep trying
        setShowFallback(true);
      }
    };

    rec.onend = () => {
      // auto-restart listening unless permission denied or timer is running
      if (allowedToListenRef.current && !running) {
        try { rec.start(); } catch (e) { setShowFallback(true); }
      }
    };

    try {
      rec.start();
      recRef.current = rec;
      setShowFallback(false);
    } catch (e) {
      setShowFallback(true);
    }
  }

  function stopRecognition() {
    allowedToListenRef.current = true; // keep ability to restart later
    if (recRef.current) {
      try { recRef.current.onresult = null; recRef.current.onend = null; recRef.current.onerror = null; recRef.current.stop(); } catch (e) {}
      // keep recRef.current so we can restart
    }
  }

  // start recognizer on mount
  useEffect(() => {
    tryStartRecognition();
    return () => {
      // cleanup
      stopRAF();
      try { if (recRef.current) { recRef.current.onresult = null; recRef.current.onend = null; recRef.current.onerror = null; recRef.current.stop(); } } catch (e) {}
      recRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // compute ring dashoffset (decreasing as time passes)
  const size = 480;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * progress;

  return (
    <div className="hq-minimal-wrapper">
      <div className="hq-minimal-clock" role="timer" aria-live="polite" aria-atomic="true">
        <svg className="hq-minimal-svg" viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" aria-hidden>
          <defs>
            <filter id="soft" x="-40%" y="-40%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <linearGradient id="ringBlue" x1="0" x2="1">
              <stop offset="0%" stopColor="#02B3FA" />
              <stop offset="100%" stopColor="#02B3FA" />
            </linearGradient>
          </defs>

          {/* outer subtle ring base */}
          <circle cx={size/2} cy={size/2} r={radius} strokeWidth={stroke} stroke="rgba(2,179,250,0.06)" fill="none" />

          {/* animated glowing ring (stroke-dashoffset increases with progress) */}
          <circle
            cx={size/2} cy={size/2} r={radius}
            strokeWidth={stroke}
            stroke="url(#ringBlue)"
            strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashoffset,
              filter: 'url(#soft)',
              transition: 'stroke-dashoffset 120ms linear'
            }}
            transform={`rotate(-90 ${size/2} ${size/2})`}
          />

          {/* inner flat dark circle (no gradient, minimal) */}
          <circle cx={size/2} cy={size/2} r={radius - stroke - 8} fill="#010830" stroke="rgba(255,255,255,0.02)" />
        </svg>

        {/* only visible content: time value */}
        <div className="hq-minimal-center">
          <div className="hq-minimal-time">{String(secondsLeft).padStart(2, '0')}</div>

          {/* fallback start button ONLY shown when needed and only when not running */}
          {showFallback && !running && (
            <button
              className="hq-fallback-btn"
              aria-label="Start fallback"
              onClick={() => startTimer()}
            >
              Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
}