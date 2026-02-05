import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const baseStyles = 'bg-bg-tertiary text-text-primary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-primary transition-all';
  const errorStyles = error ? 'border-2 border-red-500 focus:ring-red-500' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-text-secondary mb-2 font-medium">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`${baseStyles} ${errorStyles} ${widthClass} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-text-muted text-sm mt-2">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;