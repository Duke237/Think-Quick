import React from 'react';
import './Splash.css';

const Splash = () => {
  return (
    <div className="background-image">
      <div className="header-buttons">
        <button className="btn"><i className="icon">🏆</i>Points</button>
        <button className="btn"><i className="icon">⏰</i>Clock</button>
        <button className="btn"><i className="icon">🎉</i>Confetti</button>
        <button className="btn"><i className="icon">📊</i>Leaderboard</button>
        <button className="btn game-show">Game Show Poster</button>
      </div>

      <h1 className="title">THINK QUICK</h1>
      <p className="subtitle">It's not just what you know — it's how quick you are!</p>

      <div className="game-stats">
        <div className="stat-box">
          <img src="Images/streak.png" alt="Streak" />
          <span className="label">Streak</span>
          <span className="value">x3</span>
        </div>
        <div className="stat-box">
          <img src="Images/time.png" alt="Time" />
          <span className="label">Time</span>
          <span className="value">25s</span>
        </div>
        <div className="stat-box">
          <img src="Images/points.png" alt="Points" />
          <span className="label">Points</span>
          <span className="value">250</span>
        </div>
        <div className="stat-box">
          <img src="Images/buzzer.png" alt="Buzzers" />
          <span className="label">Buzzers</span>
          <span className="value">Ready</span>
        </div>
      </div>

      <div className="question-area">
        <div className="tag">Survey</div>
        <div className="question">
          Best late-night snack
          <span className="count">34</span>
        </div>
      </div>

      <div className="bottom-tags">
        <div className="tag-item">
          <span>Morning ritual</span>
          <span className="tag-value">Coffee</span>
        </div>
        <div className="tag-item">
          <span>Planet #4</span>
          <span className="tag-value">Mars</span>
        </div>
      </div>

      <div className="footer">
        <button className="coming-soon">
          <i className="icon">▶️</i>
          Coming Soon
        </button>
        <p className="powered-by">Powered by Your Studio • Play Anywhere, Anytime.</p>
      </div>
    </div>
  );
};

export default Splash;