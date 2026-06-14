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
    <div
      className={`pnl ${className}`}
      style={{
        border: '0.5px solid var(--pb)',
        borderRadius: '4px',
        background: 'rgba(200, 169, 110, 0.02)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {title && (
        <div
          className="phdr"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '0.5px solid var(--pb)',
            padding: '6px 10px',
            background: 'rgba(139, 26, 26, 0.04)',
          }}
        >
          <h2
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '11px',
              color: 'var(--red)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </h2>
          {headerRight && <div style={{ display: 'flex', alignItems: 'center' }}>{headerRight}</div>}
        </div>
      )}
      <div
        className="pbody"
        style={{
          padding: '8px 10px',
        }}
      >
        {children}
      </div>
    </div>
  );
};
