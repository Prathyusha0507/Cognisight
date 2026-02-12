import React from 'react';
import './Button.css';

export const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}, ref) => {
  const baseClass = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  
  return (
    <button
      ref={ref}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
