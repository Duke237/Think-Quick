import { X } from 'lucide-react';

const StrikeDisplay = ({ strikes, maxStrikes }) => {
  return (
    <div className="flex justify-center gap-6">
      {[...Array(maxStrikes)].map((_, i) => (
        <div
          key={i}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold border-4 transition-all duration-300 ${
            i < strikes ? 'scale-110' : ''
          }`}
          style={{
            background: i < strikes ? 'var(--danger)' : 'var(--glass-bg)',
            borderColor: i < strikes ? 'var(--danger)' : 'rgba(255, 59, 59, 0.3)',
            color: 'var(--text-primary)'
          }}
        >
          <X className="w-10 h-10" />
        </div>
      ))}
    </div>
  );
};