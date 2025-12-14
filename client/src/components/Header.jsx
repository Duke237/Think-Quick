import React from 'react';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <h1 className="logo">Think Quick</h1>
      <nav className="navigation">
        <button className="nav-button">Points</button>
        <button className="nav-button">Clock</button>
        <button className="nav-button">Confetti</button>
        <button className="nav-button">Leaderboard</button>
        <button className="nav-button game-show">Game Show Poster</button>
      </nav>
    </header>
  );
};

export default Header;