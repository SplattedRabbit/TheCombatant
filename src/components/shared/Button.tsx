/**
 * @module    Button
 * @summary   Wiederverwendbare React-Button-Komponente für D&D-Aktionen im Fantasy-Design.
 * @exports   Button
 * @reads     keine
 * @stateOps  keine
 * @depends   React
 * @notHere   Spezifische Action-Handler -> PCHeader.tsx / PCSkillsTab.tsx
 */

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}) => {
  // Map variant to existing project classes, adding enhancements
  let variantClass = 'btn';
  if (variant === 'primary') variantClass = 'btn btn-p';
  if (variant === 'danger') variantClass = 'xbtn xbtn-dmg';
  if (variant === 'success') variantClass = 'xbtn xbtn-heal';
  if (variant === 'ghost') variantClass = 'xbtn';

  const sizeStyle = size === 'sm' ? {
    fontSize: '7.5px',
    height: '18px',
    padding: '0 6px',
    lineHeight: '16px'
  } : size === 'lg' ? {
    fontSize: '11px',
    height: '28px',
    padding: '0 16px',
  } : {};

  return (
    <button
      className={`${variantClass} ${className}`}
      style={sizeStyle}
      {...props}
    >
      {children}
    </button>
  );
};
