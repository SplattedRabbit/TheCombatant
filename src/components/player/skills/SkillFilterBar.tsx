/**
 * @module    SkillFilterBar
 * @summary   Filter controls for skills search input, category dropdown, and SP badge.
 */

import React from 'react';

export interface SkillFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterType: 'all' | 'class' | 'trained';
  onFilterChange: (val: 'all' | 'class' | 'trained') => void;
  spentSP: number;
  totalSP: number;
}

export const SkillFilterBar: React.FC<SkillFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  spentSP,
  totalSP,
}) => {
  const isOverspent = spentSP > totalSP;
  const badgeBg = isOverspent ? 'rgba(139, 26, 26, 0.15)' : 'rgba(139, 26, 26, 0.08)';
  const badgeBorderColor = isOverspent ? 'var(--red)' : 'var(--pb)';

  return (
    <div
      style={{
        display: 'flex',
        gap: '3px',
        alignItems: 'center',
        marginBottom: '4px',
        background: 'rgba(0,0,0,0.02)',
        padding: '3px',
        borderRadius: '2px',
        border: '0.5px solid var(--pb)',
        minWidth: 0,
      }}
    >
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search skill..."
        style={{ flex: 1, fontSize: '8.5px', height: '18px', padding: '0 4px', minWidth: 0 }}
        className="cinput"
      />
      <select
        value={filterType}
        onChange={(e) => onFilterChange(e.target.value as any)}
        className="cinput"
        style={{ width: '75px', fontSize: '8px', height: '18px', padding: 0, outline: 'none', cursor: 'pointer', flexShrink: 0 }}
      >
        <option value="all">All Skills</option>
        <option value="class">Class Skills</option>
        <option value="trained">With Ranks</option>
      </select>

      <span
        style={{
          fontSize: '8px',
          fontWeight: 'bold',
          background: badgeBg,
          color: 'var(--red)',
          border: `0.5px solid ${badgeBorderColor}`,
          padding: '2px 5px',
          borderRadius: '1.5px',
          whiteSpace: 'nowrap',
          height: '18px',
          display: 'inline-flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
        title={`Spent Skill Points (SP): ${spentSP} of ${totalSP} consumed`}
      >
        {spentSP}/{totalSP} SP
      </span>
    </div>
  );
};
