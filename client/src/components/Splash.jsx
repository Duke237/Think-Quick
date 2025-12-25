import React from 'react';

const Splash = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_30%_20%,var(--primary)_0%,transparent_20%),radial-gradient(circle_at_80%_80%,var(--electric)_0%,transparent_25%),linear-gradient(180deg,var(--bg)_0%,var(--surface)_60%,var(--bg)_100%)]">
      <div className="container max-w-6xl mx-auto">
        <div className="hero-panel">
          {/* decorative blurred spots */}
          <div className="glow-spot" style={{ width: 360, height: 360, background: 'radial-gradient(circle, rgba(2,179,250,0.36), transparent)', top: -80, left: -120 }} />
          <div className="glow-spot" style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(252,199,62,0.20), transparent)', bottom: -80, right: -140 }} />

          <div className="panel-inner">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-3">
                <button className="glass-btn">🏆 Points</button>
                <button className="glass-btn">⏰ Clock</button>
                <button className="glass-btn">🎉 Confetti</button>
              </div>

              <div className="flex items-center gap-4">
                <button className="bg-gold text-black px-4 py-2 rounded-full shadow-md">Game Show Poster</button>

                <div className="progress-ring">
                  <div className="text-white text-sm">10</div>
                </div>
              </div>
            </div>

            <header className="text-center mb-8">
              <h1 className="text-6xl text-gold font-extrabold tracking-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)]">THINK QUICK</h1>
              <p className="mt-3 text-lg text-coral">It's not just what you know — it's how quick you are!</p>
            </header>

            <div className="relative grid grid-cols-12 gap-6 items-center">
              <div className="col-span-4">
                <div className="card">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-primary font-semibold">Streak</div>
                      <div className="mt-2 text-2xl text-white font-bold">x3</div>
                    </div>
                    <div className="bg-primary text-black rounded-full px-3 py-2">34</div>
                  </div>
                </div>

                <div className="mt-4 card">
                  <div className="text-sm text-primary">Points</div>
                  <div className="mt-2 text-2xl font-bold">250</div>
                </div>
              </div>

              <div className="col-span-4 flex justify-center">
                <div className="timer-circle">25</div>
              </div>

              <div className="col-span-4">
                <div className="card">
                  <div className="text-sm text-primary">Time</div>
                  <div className="mt-2 text-2xl font-bold">25s</div>
                </div>

                <div className="mt-4 card">
                  <div className="text-sm text-primary">Buzzers</div>
                  <div className="mt-2 text-2xl font-bold">Ready</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex gap-3">
                <div className="tag bg-gold text-black px-3 py-1 rounded-md">Survey</div>
                <div className="text-white">Best late-night snack <span className="ml-2 bg-white text-black px-2 py-0.5 rounded">34</span></div>
              </div>

              <div>
                <button className="coming-soon">▶️ Coming Soon</button>
              </div>
            </div>

            <footer className="mt-8 text-center text-sm text-[rgba(255,255,255,0.65)]">
              Powered by Your Studio • Play Anywhere, Anytime.
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Splash;