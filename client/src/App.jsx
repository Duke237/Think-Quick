import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Landing
import LandingPage from "./pages/LandingPage";

// Online Mode
import OnlineModeSelect from "./pages/Online/OnlineModeSelect";
import HostSetup from "./pages/Online/HostSetup";
import JoinGame from "./pages/Online/JoinGame";
import PlayerRegistration from "./pages/Online/PlayerRegistration";
import Lobby from "./pages/Online/Lobby";

// Live Mode
import LiveSetup from "./pages/Live/LiveSetup";
import LiveGameBoard from "./pages/Live/LiveGameBoard";

// Shared
import ClockPage from "./pages/ClockPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Online Mode Routes */}
        <Route path="/online/mode-select" element={<OnlineModeSelect />} />
        <Route path="/online/host/setup" element={<HostSetup />} />
        <Route path="/online/player/join" element={<JoinGame />} />
        <Route path="/online/player/register" element={<PlayerRegistration />} />
        <Route path="/online/lobby" element={<Lobby />} />

        {/* Live Mode Routes */}
        <Route path="/live/setup" element={<LiveSetup />} />
        <Route path="/live/game" element={<LiveGameBoard />} />

        {/* Utility */}
        <Route path="/clock" element={<ClockPage />} />
      </Routes>
    </Router>
  );
}

export default App;