import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SoundManager from './components/common/SoundManager';

import LandingPage from "./pages/LandingPage";
import OnlineModeSelect from "./pages/Online/OnlineModeSelect";
import HostSetup from "./pages/Online/HostSetup";
import JoinGame from "./pages/Online/JoinGame";
import PlayerRegistration from "./pages/Online/PlayerRegistration";
import Lobby from "./pages/Online/Lobby";
import LiveSetup from "./pages/Live/LiveSetup";
import LiveGameBoard from "./pages/Live/LiveGameBoard";
import TimerQuestionsPage from "./pages/Live/TimerQuestionsPage";
import AnswerInputPage from "./pages/Live/AnswerInputPage";
import ClockPage from "./pages/ClockPage";

function App() {
  return (
    <SoundManager autoLoad={true}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/online/mode-select" element={<OnlineModeSelect />} />
          <Route path="/online/host/setup" element={<HostSetup />} />
          <Route path="/online/player/join" element={<JoinGame />} />
          <Route path="/online/player/register" element={<PlayerRegistration />} />
          <Route path="/online/lobby" element={<Lobby />} />
          <Route path="/live/setup" element={<LiveSetup />} />
          <Route path="/live/game" element={<LiveGameBoard />} />
          <Route path="/live/timer-questions" element={<TimerQuestionsPage />} />
          <Route path="/live/answer-input" element={<AnswerInputPage />} />
          <Route path="/clock" element={<ClockPage />} />
        </Routes>
      </Router>
    </SoundManager>
  );
}

export default App;