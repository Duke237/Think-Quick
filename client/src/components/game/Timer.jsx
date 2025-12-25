import { Play, Pause, RotateCcw, Mic, MicOff } from 'lucide-react';
import socketService from '../../services/socket';

const Timer = () => {
  const { timer, timerRunning, voiceEnabled, setVoiceEnabled } = useGameStore();

  const startTimer = () => socketService.emit('start-timer');
  const stopTimer = () => socketService.emit('stop-timer');
  const resetTimer = () => {
    socketService.emit('stop-timer');
    useGameStore.setState({ timer: 30 });
  };

  const toggleVoice = () => {
    // Voice control logic here
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div className="flex items-center gap-4">
      <div 
        className={`text-7xl font-bold transition-colors ${
          timer <= 10 ? 'pulse-glow' : ''
        }`}
        style={{ 
          color: timer <= 10 ? 'var(--danger)' : 'var(--text-primary)' 
        }}
      >
        {timer}s
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={timerRunning ? stopTimer : startTimer}
          className="p-3 glass rounded-xl hover:bg-white/20 transition-all"
        >
          {timerRunning ? 
            <Pause className="w-7 h-7" style={{ color: 'var(--text-primary)' }} /> : 
            <Play className="w-7 h-7" style={{ color: 'var(--text-primary)' }} />
          }
        </button>
        <button
          onClick={resetTimer}
          className="p-3 glass rounded-xl hover:bg-white/20 transition-all"
        >
          <RotateCcw className="w-7 h-7" style={{ color: 'var(--text-primary)' }} />
        </button>
        <button
          onClick={toggleVoice}
          className={`p-3 rounded-xl transition-all ${
            voiceEnabled ? 'pulse-glow' : 'glass hover:bg-white/20'
          }`}
          style={{
            background: voiceEnabled ? 'var(--success)' : undefined
          }}
        >
          {voiceEnabled ? 
            <Mic className="w-7 h-7" style={{ color: 'var(--text-primary)' }} /> : 
            <MicOff className="w-7 h-7" style={{ color: 'var(--text-primary)' }} />
          }
        </button>
      </div>
    </div>
  );
};