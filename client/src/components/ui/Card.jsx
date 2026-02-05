const Card = ({
  children,
  title,
  variant = 'default',
  className = '',
  padding = 'normal',
  shadow = true,
  glow = false,
  onClick
}) => {
  const baseStyles = 'bg-bg-secondary rounded-2xl transition-all';
  
  const variants = {
    default: '',
    cyan: 'border-2 border-cyan-primary',
    orange: 'border-2 border-orange-primary',
    gradient: 'bg-gradient-to-br from-bg-secondary to-bg-tertiary',
  };

  const paddings = {
    none: 'p-0',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8',
  };

  const shadowClass = shadow ? 'shadow-deep' : '';
  const glowClass = glow ? (variant === 'orange' ? 'shadow-glow-orange' : 'shadow-glow-cyan') : '';
  const clickableClass = onClick ? 'cursor-pointer hover:scale-105' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${shadowClass} ${glowClass} ${clickableClass} ${className}`}
    >
      {title && (
        <h3 className="text-2xl font-bold text-text-primary mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;