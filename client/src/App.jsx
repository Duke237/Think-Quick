import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HostSetup from './pages/HostSetup';
import JoinGame from './pages/JoinGame';
import PlayerRegistration from './pages/PlayerRegistration';
import Lobby from './pages/Lobby';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/host" element={<HostSetup />} />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/register/:code" element={<PlayerRegistration />} />
        <Route path="/lobby/:code" element={<Lobby />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;