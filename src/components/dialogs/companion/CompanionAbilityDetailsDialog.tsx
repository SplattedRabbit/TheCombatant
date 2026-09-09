/**
 * @module    CompanionAbilityDetailsDialog
 * @summary   Ancient parchment dialog displaying full D&D 3.5e RAW rules and mechanics for Animal Companion and Familiar abilities.
 */

import React from 'react';

export interface CompanionAbilityData {
  name: string;
  type: string;
  minLevel?: string;
  summary: string;
  rawRules: string;
  source: string;
}

interface CompanionAbilityDetailsDialogProps {
  ability: CompanionAbilityData;
  onClose: () => void;
}

export const CompanionAbilityDetailsDialog: React.FC<CompanionAbilityDetailsDialogProps> = ({
  ability,
  onClose,
}) => {
  return (
    <div
      className="dialog-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        className="ancient-parchment"
        style={{
          background: '#f4e8c1',
          border: '2px solid #8b1a1a',
          padding: '16px 20px',
          borderRadius: '4px',
          boxShadow: 'inset 0 0 35px rgba(139, 26, 26, 0.2), 0 10px 30px rgba(0,0,0,0.6)',
          fontFamily: 'var(--font-body)',
          color: '#1a0f00',
          lineHeight: 1.45,
          textAlign: 'left',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #8b1a1a', paddingBottom: '6px', marginBottom: '10px' }}>
          <h3
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '15px',
              color: '#8b1a1a',
              margin: 0,
              letterSpacing: '0.8px',
              fontWeight: 'bold',
            }}
          >
            ✦ {ability.name}
          </h3>
          <button
            onClick={onClose}
            className="btn"
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              lineHeight: 1,
              background: 'rgba(139, 26, 26, 0.1)',
              color: '#8b1a1a',
              border: '1px solid #8b1a1a',
              borderRadius: '2px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>

        {/* Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px 12px',
            fontSize: '9.5px',
            borderBottom: '0.5px dashed rgba(139, 26, 26, 0.35)',
            paddingBottom: '8px',
            marginBottom: '10px',
            fontWeight: 'bold',
          }}
        >
          <div>
            <span style={{ color: '#666' }}>Type:</span>{' '}
            <span style={{ color: '#8b1a1a' }}>{ability.type}</span>
          </div>
          <div>
            <span style={{ color: '#666' }}>Source:</span>{' '}
            <span>{ability.source}</span>
          </div>
          {ability.minLevel && (
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#666' }}>Requires:</span>{' '}
              <span style={{ color: '#8b1a1a' }}>{ability.minLevel}</span>
            </div>
          )}
        </div>

        {/* Summary Card */}
        {ability.summary && (
          <div
            style={{
              background: 'rgba(139, 26, 26, 0.06)',
              borderLeft: '3px solid #8b1a1a',
              padding: '6px 10px',
              fontSize: '10.5px',
              marginBottom: '12px',
              fontWeight: 'bold',
              color: '#4a1515',
            }}
          >
            {ability.summary}
          </div>
        )}

        {/* RAW Rules Text */}
        <div style={{ fontSize: '10px', whiteSpace: 'pre-line', lineHeight: 1.5, color: '#2a1a08' }}>
          <div style={{ fontWeight: 'bold', color: '#8b1a1a', fontFamily: 'var(--font-title)', fontSize: '11px', marginBottom: '4px' }}>
            📜 Official D&amp;D 3.5e RAW Rules:
          </div>
          {ability.rawRules}
        </div>

        {/* Footer Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid rgba(139, 26, 26, 0.25)', paddingTop: '10px' }}>
          <button
            onClick={onClose}
            className="btn btn-p"
            style={{ fontSize: '10px', padding: '5px 16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Understood ✓
          </button>
        </div>
      </div>
    </div>
  );
};
