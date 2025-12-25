import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_20%_30%,var(--primary)_6%,transparent_20%),radial-gradient(circle_at_85%_80%,var(--electric)_6%,transparent_25%),linear-gradient(180deg,var(--bg)_0%,var(--surface)_60%,var(--bg)_100%)]">
      <section className="container max-w-4xl mx-auto">
        <div className="hero-panel">
          <div className="panel-inner text-center">
            <h1 className="text-6xl md:text-7xl text-gold font-extrabold mb-4 tracking-tight">FAMILY FEUD — THINK QUICK</h1>
            <p className="text-lg md:text-xl text-coral mb-8">Fast, fun, family-friendly trivia. Host the show or join a game.</p>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <Link to="/host" className="w-64 md:w-72 text-center py-6 rounded-2xl bg-gradient-to-br from-primary to-electric text-black font-bold text-lg shadow-2xl transform hover:scale-105 transition-transform">
                Host Game
              </Link>

              <Link to="/join" className="w-64 md:w-72 text-center py-6 rounded-2xl bg-gradient-to-br from-gold to-neon text-black font-bold text-lg shadow-2xl transform hover:scale-105 transition-transform">
                Join Game
              </Link>
            </div>

            <div className="mt-8 flex justify-center gap-4 text-sm text-[rgba(255,255,255,0.7)]">
              <div className="px-3 py-2 rounded-full bg-[rgba(255,255,255,0.02)]">TV-style scoreboards</div>
              <div className="px-3 py-2 rounded-full bg-[rgba(255,255,255,0.02)]">Live buzzer support</div>
            </div>

            <p className="mt-6 text-xs text-[rgba(255,255,255,0.6)]">No backend required yet — these buttons navigate to placeholders.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
