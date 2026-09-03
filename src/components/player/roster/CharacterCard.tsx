/**
 * @module    CharacterCard
 * @summary   Card item representation for a PC in CharacterRosterDialog with HP stats, class info, and action buttons.
 */

import React from 'react';
import type { CharacterSummary } from '../../../types/character.ts';

interface CharacterCardProps {
  char: CharacterSummary;
  isActive: boolean;
  isActionInProgress: boolean;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

const getRaceDisplayName = (raceKey?: string) => {
  if (!raceKey) return '';
  const raceMap: Record<string, string> = {
    human: 'Human',
    elf: 'Elf',
    wood_elf: 'Wood Elf',
    wild_elf: 'Wild Elf',
    drow: 'Drow',
    dwarf: 'Dwarf',
    gnome: 'Gnome',
    halfling: 'Halfling',
    deep_halfling: 'Deep Halfling',
    half_elf: 'Half-Elf',
    half_orc: 'Half-Orc',
    tiefling: 'Tiefling',
    anima_construct: 'Anima-Construct',
  };
  return raceMap[raceKey.toLowerCase()] || raceKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export const CharacterCard: React.FC<CharacterCardProps> = ({
  char,
  isActive,
  isActionInProgress,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div
      style={{
        background: isActive ? 'linear-gradient(135deg, #fbf2db, #f7e8c3)' : '#ffffff',
        border: isActive ? '1.5px solid #065f46' : '1px solid var(--pb, #c8a96e)',
        borderRadius: '6px',
        padding: '12px',
        boxShadow: isActive ? '0 3px 10px rgba(6, 95, 70, 0.15)' : '0 2px 5px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '8px',
        position: 'relative',
      }}
    >
      {/* Active Badge */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            background: '#065f46',
            color: '#ffffff',
            fontSize: '8.5px',
            fontFamily: 'var(--font-title)',
            padding: '1px 6px',
            borderRadius: '10px',
            fontWeight: 'bold',
          }}
        >
          ⭐ Active
        </div>
      )}

      <div>
        {/* Name & Race */}
        <div
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'var(--red, #8b1a1a)',
            paddingRight: isActive ? '45px' : '0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={char.name}
        >
          {char.name}
        </div>

        {/* Class Summary & Level */}
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-body)',
            color: 'var(--ink, #2c2214)',
            marginTop: '2px',
          }}
        >
          Level {char.level} {char.race ? `(${getRaceDisplayName(char.race)})` : ''}
        </div>

        {char.classSummary && (
          <div
            style={{
              fontSize: '10px',
              color: 'var(--inkm, #665c49)',
              fontStyle: 'italic',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {char.classSummary}
          </div>
        )}

        {/* HP Stats */}
        <div
          style={{
            marginTop: '6px',
            fontSize: '10.5px',
            color: '#854d0e',
            fontWeight: 'bold',
            fontFamily: 'var(--font-body)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>❤️</span>
          <span>
            {char.hp.current} / {char.hp.max} HP
          </span>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          borderTop: '0.5px solid rgba(200, 169, 110, 0.4)',
          paddingTop: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => onSelect(char.id)}
          disabled={isActionInProgress || isActive}
          className="btn btn-p"
          style={{
            flex: 1,
            padding: '3px 6px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-title)',
            background: isActive ? '#065f46' : 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
            border: '1px solid #8b6914',
            color: '#ffffff',
            borderRadius: '3px',
            cursor: isActive ? 'default' : 'pointer',
            opacity: isActive ? 0.9 : 1,
          }}
        >
          {isActive ? '✓ Selected' : '⚡ Load'}
        </button>

        <button
          type="button"
          onClick={() => onDuplicate(char.id)}
          disabled={isActionInProgress}
          className="btn"
          style={{
            padding: '3px 6px',
            fontSize: '10px',
            background: 'rgba(200, 169, 110, 0.2)',
            border: '1px solid var(--pb)',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
          title="Duplicate Character"
        >
          📑
        </button>

        <button
          type="button"
          onClick={() => onDelete(char.id, char.name)}
          disabled={isActionInProgress}
          className="btn"
          style={{
            padding: '3px 6px',
            fontSize: '10px',
            background: 'rgba(139, 26, 26, 0.1)',
            borderColor: 'rgba(139, 26, 26, 0.3)',
            color: 'var(--red)',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
          title="Delete Character"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
