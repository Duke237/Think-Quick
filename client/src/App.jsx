import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Host from './pages/Host';
import Game from './pages/Game';
import Results from './pages/Results';
import './styles/globals.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host" element={<Host />} />
        <Route path="/game/:gameCode" element={<Game />} />
        <Route path="/results/:gameCode" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;