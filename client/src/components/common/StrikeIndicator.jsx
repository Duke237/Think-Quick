const StrikeIndicator = ({
  strikes = 0,
  maxStrikes = 3,
  size = 'medium',
  showLabel = true
}) => {
  const sizes = {
    small: 'text-3xl',
    medium: 'text-5xl',
    large: 'text-7xl'
  };

  const strikeArray = Array.from({ length: maxStrikes }, (_, i) => i < strikes);

  return (
    <div className="flex flex-col items-center gap-4">
      {showLabel && (
        <div className="text-text-secondary font-semibold text-lg">
          Strikes
        </div>
      )}
      <div className="flex gap-4">
        {strikeArray.map((isActive, index) => (
          <div
            key={index}
            className={`${sizes[size]} font-bold transition-all ${
              isActive
                ? 'text-red-500 animate-pulse scale-110'
                : 'text-bg-tertiary'
            }`}
          >
            X
          </div>
        ))}
      </div>
      {strikes >= maxStrikes && (
        <div className="text-red-500 font-bold text-2xl animate-pulse">
          STRIKE OUT
        </div>
      )}
    </div>
  );
};

export default StrikeIndicator;