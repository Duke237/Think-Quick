import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SoundManager from './components/common/SoundManager';

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
import TeamAnswerInput from "./pages/Live/TeamAnswerInput";
import AnswerComparison from "./pages/Live/AnswerComparison";

// Shared
import ClockPage from "./pages/ClockPage";

function App() {
  return (
    <SoundManager autoLoad={true}>
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
        <Route path="/live/team-input" element={<TeamAnswerInput />} />
        <Route path="/live/answer-comparison" element={<AnswerComparison />} />

        {/* Utility */}
        <Route path="/clock" element={<ClockPage />} />
      </Routes>
    </Router>
    </SoundManager>
  );
}

export default App;