/**
 * @module    CombatantInput
 * @summary   Text/Number input component for DM screen table cells with blur and Enter commit synchronization.
 */

import React, { useState, useEffect } from 'react';

export interface CombatantInputProps {
  value: any;
  onChange: (val: string) => void;
  className?: string;
  type?: string;
  style?: React.CSSProperties;
  title?: string;
  placeholder?: string;
}

export const CombatantInput: React.FC<CombatantInputProps> = ({
  value,
  onChange,
  className,
  type = 'text',
  style,
  title,
  placeholder,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value);
    }
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type={type}
      value={localValue ?? ''}
      onChange={(e) => setLocalValue(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
      style={style}
      title={title}
      placeholder={placeholder}
    />
  );
};
