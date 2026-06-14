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
    <div className={`panel ${className}`} style={style}>
      {title && (
        <div className="phdr">
          <h2>{title}</h2>
          {headerRight && <div style={{ display: 'flex', alignItems: 'center' }}>{headerRight}</div>}
        </div>
      )}
      <div className="pbody">
        {children}
      </div>
    </div>
  );
};
