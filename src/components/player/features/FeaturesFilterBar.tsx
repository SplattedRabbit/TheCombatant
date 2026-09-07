/**
 * @module    FeaturesFilterBar
 * @summary   Filter pills and search input for filtering character features.
 */

import React from 'react';

export type FeatureCategoryFilter = 'all' | 'combat' | 'daily' | 'passive' | 'aura' | 'spell-like';

interface FeaturesFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: FeatureCategoryFilter;
  onFilterChange: (cat: FeatureCategoryFilter) => void;
  counts: Record<FeatureCategoryFilter, number>;
}

export const FeaturesFilterBar: React.FC<FeaturesFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const filterOptions: { key: FeatureCategoryFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: '📜' },
    { key: 'combat', label: 'Combat / Active', icon: '⚔️' },
    { key: 'daily', label: 'Daily Resources', icon: '⏳' },
    { key: 'passive', label: 'Passives', icon: '🛡️' },
    { key: 'aura', label: 'Auras', icon: '✨' },
    { key: 'spell-like', label: 'Spell-like', icon: '🔮' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Search Input and Filter Pills Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '320px' }}>
          <input
            type="text"
            placeholder="🔍 Search features, auras, mechanics..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="cinput"
            style={{
              width: '100%',
              height: '24px',
              fontSize: '10px',
              padding: '2px 22px 2px 6px',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '5px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '10px',
                color: 'var(--inkl)',
                padding: 0,
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', alignItems: 'center' }}>
          {filterOptions.map((opt) => {
            const count = counts[opt.key] || 0;
            if (opt.key !== 'all' && count === 0) return null;
            const isSelected = activeFilter === opt.key;

            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onFilterChange(opt.key)}
                className={`btn ${isSelected ? 'btn-p' : ''}`}
                style={{
                  fontSize: '8.5px',
                  padding: '2px 6px',
                  lineHeight: 1.2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  borderRadius: '2px',
                  background: isSelected ? undefined : 'rgba(200, 169, 110, 0.08)',
                  borderColor: isSelected ? 'var(--red)' : 'var(--pb)',
                }}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
                <span style={{ fontSize: '7px', opacity: 0.8 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
