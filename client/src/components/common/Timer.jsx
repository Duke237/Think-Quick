import { useState, useEffect } from 'react';
import { formatTime } from '../../utils/helpers';

const Timer = ({
  initialTime = 20,
  isActive = false,
  onComplete,
  onTick,
  size = 'large',
  showProgress = true,
  variant = 'cyan'
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  useEffect(() => {
    setTimeRemaining(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        
        if (onTick) onTick(newTime);
        
        if (newTime <= 0) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onComplete, onTick]);

  const percentage = (timeRemaining / initialTime) * 100;
  const isLowTime = timeRemaining <= 5;
  
  const sizes = {
    small: 'text-4xl',
    medium: 'text-6xl',
    large: 'text-8xl',
    xlarge: 'text-9xl'
  };

  const colors = {
    cyan: isLowTime ? 'text-red-500 animate-pulse' : 'text-cyan-primary',
    orange: isLowTime ? 'text-red-500 animate-pulse' : 'text-orange-primary',
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`font-bold font-mono ${sizes[size]} ${colors[variant]} transition-colors`}>
        {formatTime(timeRemaining)}
      </div>
      
      {showProgress && (
        <div className="w-full max-w-md h-3 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isLowTime ? 'bg-red-500' : variant === 'cyan' ? 'bg-cyan-primary' : 'bg-orange-primary'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Timer;