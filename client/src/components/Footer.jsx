import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <button className="coming-soon">
        <i className="icon">▶️</i>
        Coming Soon
      </button>
      <p className="powered-by">Powered by Your Studio • Play Anywhere, Anytime.</p>
    </footer>
  );
};

export default Footer;