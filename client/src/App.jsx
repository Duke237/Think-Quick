import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Splash from './components/Splash';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Admin from './components/Admin';
import Game from './components/Game';
import Clock from './components/Clock'; // added
import Host from './pages/Host';
import Join from './pages/Join';
import WaitingRoom from './pages/WaitingRoom';
import Lobby from './pages/Lobby';
import GamePage from './pages/GamePage';
import Answer from './pages/Answer';
import Timer from './pages/Timer';
import HostControl from './pages/HostControl';
import FastMoney from './pages/FastMoney';
import './styles/App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <nav className="flex justify-center gap-6 mt-3 text-sm text-[rgba(255,255,255,0.7)]">
          <Link to="/">Landing</Link>
          <Link to="/splash">Splash</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/game">Game</Link>
          <Link to="/clock">Clock</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/host" element={<Host />} />
          <Route path="/join" element={<Join />} />
          <Route path="/lobby/:code" element={<Lobby />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/game" element={<Game />} />
          <Route path="/game/:code" element={<GamePage />} />
          <Route path="/answer/:code" element={<Answer />} />
          <Route path="/timer/:code" element={<Timer />} />
          <Route path="/host-control/:code" element={<HostControl />} />
          <Route path="/fast-money/:code" element={<FastMoney />} />
          <Route path="/clock" element={<Clock />} />
          <Route path="/home" element={<Home />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;