/**
 * @module    BaseCard
 * @summary   Wiederverwendbare Karten-Komponente (Card) im D&D Fantasy Design mit goldenem Header.
 * @exports   BaseCard
 * @reads     keine
 * @stateOps  keine
 * @depends   React
 * @notHere   Spezifische Card-Inhalte -> PCAttributes.tsx / PCHealthGlobe.tsx
 */

import React, { ReactNode } from 'react';

interface BaseCardProps {
  title?: ReactNode;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  headerRight?: ReactNode;
}

export const BaseCard: React.FC<BaseCardProps> = ({
  title,
  children,
  style,
  className = '',
  headerRight,
}) => {
  return (
    <div className={`panel ${className}`} style={{ minWidth: 0, boxSizing: 'border-box', ...style }}>
      {title && (
        <div className="phdr">
          <h2>{title}</h2>
          {headerRight && <div style={{ display: 'flex', alignItems: 'center' }}>{headerRight}</div>}
        </div>
      )}
      <div className="pbody" style={{ minWidth: 0, boxSizing: 'border-box' }}>
        {children}
      </div>
    </div>
  );
};
