import React from 'react';

const Header = () => {
  return (
    <header className="flex items-center justify-between py-6">
      <h1 className="text-2xl font-bold text-gold">Think Quick</h1>
      <nav className="flex gap-3">
        <button className="glass-btn">Points</button>
        <button className="glass-btn">Clock</button>
        <button className="glass-btn">Confetti</button>
        <button className="glass-btn">Leaderboard</button>
      </nav>
    </header>
  );
};

export default Header;