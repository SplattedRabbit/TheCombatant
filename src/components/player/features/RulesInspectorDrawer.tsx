/**
 * @module    RulesInspectorDrawer
 * @summary   Parchment-styled rules inspector showing formatted official D&D 3.5e RAW rules text on demand.
 */

import React from 'react';
import { UnifiedFeature } from './helpers/featureRegistry';

interface RulesInspectorDrawerProps {
  feature: UnifiedFeature | null;
  onConfigureSpecialization?: () => void;
}

export const RulesInspectorDrawer: React.FC<RulesInspectorDrawerProps> = ({ feature, onConfigureSpecialization }) => {
  if (!feature) {
    return (
      <div
        style={{
          background: 'rgba(200, 169, 110, 0.05)',
          border: '0.5px dashed var(--pb)',
          borderRadius: '4px',
          padding: '24px 16px',
          textAlign: 'center',
          color: 'var(--inkl)',
          fontSize: '9.5px',
          fontStyle: 'italic',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          minHeight: '200px',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '20px', opacity: 0.6 }}>📜</span>
        <div>
          <strong style={{ display: 'block', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontSize: '11px', marginBottom: '4px', fontStyle: 'normal' }}>
            Rules Inspector
          </strong>
          Select any feature on the left to inspect its complete official RAW rules, action economy, and stacking calculations.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(244, 232, 193, 0.55) 0%, rgba(232, 213, 160, 0.65) 100%)',
        border: '1px solid var(--pb)',
        boxShadow: 'inset 0 0 16px rgba(200, 169, 110, 0.2), 0 2px 8px rgba(0, 0, 0, 0.12)',
        borderRadius: '4px',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxSizing: 'border-box',
        position: 'sticky',
        top: '8px',
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: '0.5px solid var(--pb)', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
          <div>
            <span style={{ fontSize: '7.5px', textTransform: 'uppercase', color: 'var(--inkl)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              RAW Rules Inspector
            </span>
            <h4
              style={{
                margin: '2px 0 0 0',
                fontFamily: 'var(--font-title)',
                fontSize: '13px',
                color: 'var(--red)',
                lineHeight: 1.2,
              }}
            >
              {feature.name}
            </h4>
          </div>

          <span
            style={{
              fontSize: '7.5px',
              fontWeight: 'bold',
              background: 'rgba(139, 26, 26, 0.08)',
              border: '0.5px solid var(--red)',
              color: 'var(--red)',
              padding: '1px 5px',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            {feature.source}
          </span>
        </div>
      </div>

      {/* Action button for Wizard Specialization */}
      {onConfigureSpecialization && feature.id === 'wizard_specialization' && (
        <button
          type="button"
          onClick={onConfigureSpecialization}
          className="btn btn-p"
          style={{
            width: '100%',
            padding: '5px 10px',
            fontSize: '10px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-title)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <span>⚙️</span> Configure Specialization & Prohibited Schools
        </button>
      )}

      {/* Mechanics Metadata Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          background: 'rgba(200, 169, 110, 0.12)',
          border: '0.5px solid var(--pb)',
          borderRadius: '3px',
          padding: '6px 8px',
          fontSize: '8.5px',
        }}
      >
        <div>
          <strong style={{ color: 'var(--inkm)' }}>Action:</strong>{' '}
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{feature.actionType || 'Passive'}</span>
        </div>
        <div>
          <strong style={{ color: 'var(--inkm)' }}>Type:</strong>{' '}
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{feature.typeLabel || feature.category}</span>
        </div>
        {feature.range && (
          <div>
            <strong style={{ color: 'var(--inkm)' }}>Range:</strong>{' '}
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{feature.range}</span>
          </div>
        )}
        {feature.duration && (
          <div>
            <strong style={{ color: 'var(--inkm)' }}>Duration:</strong>{' '}
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{feature.duration}</span>
          </div>
        )}
        {feature.saveThrow && (
          <div style={{ gridColumn: 'span 2' }}>
            <strong style={{ color: 'var(--inkm)' }}>Save:</strong>{' '}
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{feature.saveThrow}</span>
          </div>
        )}
      </div>

      {/* Stacking / Source breakdown (if merged) */}
      {feature.stackInfo && (
        <div
          style={{
            fontSize: '8px',
            background: 'rgba(46, 125, 50, 0.08)',
            border: '0.5px solid rgba(46, 125, 50, 0.3)',
            borderRadius: '3px',
            padding: '4px 6px',
            color: '#1b5e20',
          }}
        >
          <strong>Stacking Sources:</strong> {feature.stackInfo}
        </div>
      )}

      {/* RAW Rules Text Content */}
      <div
        style={{
          fontSize: '9px',
          lineHeight: 1.45,
          color: 'var(--ink)',
          fontFamily: 'var(--font-body)',
          whiteSpace: 'pre-line',
          maxHeight: '340px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
        className="pc-scroll-features"
      >
        {feature.rawRules}
      </div>
    </div>
  );
};
