import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Splash from './components/Splash';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Admin from './components/Admin';
import Game from './components/Game';
import Clock from './components/Clock'; // added
import './styles/App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <nav style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12 }}>
          <Link to="/">Home</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/game">Game</Link>
          <Link to="/clock">Clock</Link>
          <Link to="/splash">Splash</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/game" element={<Game />} />
          <Route path="/clock" element={<Clock />} />  {/* new route */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;