/**
 * @module    SpellFilterControls
 * @summary   Search and filter bar (level pills, school dropdown) for StepSpells.
 */

import React from 'react';

export interface SpellFilterControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  levelFilter: string;
  onLevelFilterChange: (lvl: string) => void;
  chosenCount: number;
  availableLevels: number[];
  schoolFilter: string;
  onSchoolFilterChange: (school: string) => void;
}

export const SpellFilterControls: React.FC<SpellFilterControlsProps> = ({
  searchQuery,
  onSearchChange,
  levelFilter,
  onLevelFilterChange,
  chosenCount,
  availableLevels,
  schoolFilter,
  onSchoolFilterChange,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <input
        type="text"
        placeholder="Search spells by name or keyword..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="cinput"
        style={{ width: '100%', height: '28px', padding: '0 8px', fontSize: '11.5px', boxSizing: 'border-box' }}
      />

      {/* Level Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: 'var(--inkm)', fontWeight: 'bold' }}>Level:</span>
        <button
          type="button"
          onClick={() => onLevelFilterChange('all')}
          style={{
            padding: '2px 7px',
            borderRadius: '10px',
            fontSize: '10.5px',
            border: levelFilter === 'all' ? '1px solid var(--red)' : '1px solid var(--pb)',
            background: levelFilter === 'all' ? 'var(--red)' : 'rgba(200, 169, 110, 0.1)',
            color: levelFilter === 'all' ? '#fff' : 'var(--ink)',
            cursor: 'pointer',
            fontWeight: levelFilter === 'all' ? 'bold' : 'normal',
          }}
        >
          All
        </button>

        {chosenCount > 0 && (
          <button
            type="button"
            onClick={() => onLevelFilterChange('selected')}
            style={{
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '10.5px',
              border: levelFilter === 'selected' ? '1.5px solid var(--red)' : '1px solid #2e7d32',
              background: levelFilter === 'selected' ? 'var(--red)' : 'rgba(46, 125, 50, 0.12)',
              color: levelFilter === 'selected' ? '#fff' : '#1b5e20',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            title="Show only selected spells"
          >
            ✓ Selected ({chosenCount})
          </button>
        )}
        {availableLevels.map(lvl => (
          <button
            key={lvl}
            type="button"
            onClick={() => onLevelFilterChange(String(lvl))}
            style={{
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '10.5px',
              border: levelFilter === String(lvl) ? '1px solid var(--red)' : '1px solid var(--pb)',
              background: levelFilter === String(lvl) ? 'var(--red)' : 'rgba(200, 169, 110, 0.1)',
              color: levelFilter === String(lvl) ? '#fff' : 'var(--ink)',
              cursor: 'pointer',
              fontWeight: levelFilter === String(lvl) ? 'bold' : 'normal',
            }}
          >
            {lvl === 0 ? '0 (Cantrips)' : `Lvl ${lvl}`}
          </button>
        ))}

        <span style={{ fontSize: '10px', color: 'var(--inkm)', fontWeight: 'bold', marginLeft: '6px' }}>School:</span>
        <select
          value={schoolFilter}
          onChange={(e) => onSchoolFilterChange(e.target.value)}
          className="cinput"
          style={{ height: '22px', fontSize: '10px', padding: '0 4px', borderRadius: '4px', maxWidth: '110px' }}
        >
          <option value="all">All Schools</option>
          <option value="abj">Abjuration</option>
          <option value="con">Conjuration</option>
          <option value="div">Divination</option>
          <option value="enc">Enchantment</option>
          <option value="evo">Evocation</option>
          <option value="ill">Illusion</option>
          <option value="nec">Necromancy</option>
          <option value="tra">Transmutation</option>
          <option value="univ">Universal</option>
        </select>
      </div>
    </div>
  );
};
