/**
 * @module    UnifiedFeatureCard
 * @summary   Individual feature item card in the unified features list.
 */

import React from 'react';
import { UnifiedFeature } from './helpers/featureRegistry';

interface UnifiedFeatureCardProps {
  feature: UnifiedFeature;
  isSelected: boolean;
  onSelect: () => void;
}

export const UnifiedFeatureCard: React.FC<UnifiedFeatureCardProps> = ({
  feature,
  isSelected,
  onSelect,
}) => {
  const isSpecialistSchool = feature.id === 'wizard_specialization';

  const getCategoryColor = (cat: string) => {
    if (isSpecialistSchool) {
      return { 
        bg: 'rgba(139, 26, 26, 0.08)', 
        border: 'rgba(139, 26, 26, 0.35)', 
        text: 'var(--red)', 
        icon: '🏛️' 
      };
    }
    switch (cat) {
      case 'combat': return { bg: 'rgba(139, 26, 26, 0.1)', border: '#8b1a1a', text: '#8b1a1a', icon: '⚔️' };
      case 'daily': return { bg: 'rgba(197, 137, 24, 0.12)', border: '#b8860b', text: '#7d5f1a', icon: '⏳' };
      case 'aura': return { bg: 'rgba(46, 125, 50, 0.1)', border: '#2e7d32', text: '#1b5e20', icon: '✨' };
      case 'spell-like': return { bg: 'rgba(92, 53, 140, 0.1)', border: '#6a329f', text: '#4a154b', icon: '🔮' };
      default: return { bg: 'rgba(0, 0, 0, 0.04)', border: 'var(--pb)', text: 'var(--inkm)', icon: '🛡️' };
    }
  };

  const styleConfig = getCategoryColor(feature.category);

  return (
    <div
      onClick={onSelect}
      style={{
        background: isSpecialistSchool
          ? isSelected
            ? 'rgba(200, 169, 110, 0.32)'
            : 'linear-gradient(90deg, rgba(200, 169, 110, 0.22) 0%, rgba(200, 169, 110, 0.10) 100%)'
          : isSelected
          ? 'rgba(200, 169, 110, 0.28)'
          : 'rgba(200, 169, 110, 0.08)',
        border: isSelected
          ? '1px solid var(--red)'
          : isSpecialistSchool
          ? '0.5px solid rgba(139, 26, 26, 0.35)'
          : '0.5px solid rgba(200, 169, 110, 0.45)',
        borderLeft: isSpecialistSchool
          ? isSelected
            ? '3.5px solid var(--red)'
            : '3.5px solid rgba(139, 26, 26, 0.65)'
          : isSelected
          ? '1px solid var(--red)'
          : '0.5px solid rgba(200, 169, 110, 0.45)',
        boxShadow: isSelected
          ? '0 1px 4px rgba(139, 26, 26, 0.2)'
          : isSpecialistSchool
          ? '0 1px 3px rgba(0, 0, 0, 0.06)'
          : 'none',
        borderRadius: '3px',
        padding: '5px 8px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        transition: 'all 0.12s ease',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = isSpecialistSchool
            ? 'rgba(200, 169, 110, 0.26)'
            : 'rgba(200, 169, 110, 0.16)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = isSpecialistSchool
            ? 'linear-gradient(90deg, rgba(200, 169, 110, 0.22) 0%, rgba(200, 169, 110, 0.10) 100%)'
            : 'rgba(200, 169, 110, 0.08)';
        }
      }}
    >
      {/* Top Header: Title, Source Badge, and Category Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
          <span style={{ fontSize: '10px' }}>{styleConfig.icon}</span>
          <strong
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '10.5px',
              color: isSelected ? 'var(--red)' : 'var(--ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {feature.name}
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {/* Source Badge */}
          <span
            style={{
              fontSize: '7.5px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              background: 'rgba(200, 169, 110, 0.15)',
              border: '0.5px solid rgba(200, 169, 110, 0.35)',
              padding: '1px 4px',
              borderRadius: '2px',
              color: 'var(--inkm)',
            }}
            title={feature.stackInfo || feature.source}
          >
            {feature.source}
          </span>

          {/* Type Badge */}
          <span
            style={{
              fontSize: '7px',
              fontWeight: 'bold',
              background: styleConfig.bg,
              border: `0.5px solid ${styleConfig.border}`,
              padding: '1px 4px',
              borderRadius: '2px',
              color: styleConfig.text,
            }}
          >
            {feature.typeLabel}
          </span>
        </div>
      </div>

      {/* Summary Line */}
      <div
        style={{
          fontSize: '8.5px',
          color: 'var(--inkm)',
          lineHeight: 1.3,
          paddingLeft: '15px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {feature.summary}
      </div>
    </div>
  );
};
