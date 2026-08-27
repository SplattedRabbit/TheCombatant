/**
 * @module    PrestigeSpellLinkSection
 * @summary   Dropdown selectors for linking spellcaster progression in Mystic Theurge and Arcane Trickster prestige classes.
 */

import React from 'react';
import { CLASSES_LIST } from '../constants';

export interface PrestigeSpellLinkSectionProps {
  currentConfig: any;
  currentDraft: any;
  currentLevelIndex: number;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
}

export const PrestigeSpellLinkSection: React.FC<PrestigeSpellLinkSectionProps> = ({
  currentConfig,
  currentDraft,
  currentLevelIndex,
  updateLevelConfig,
}) => {
  if (!currentDraft) return null;

  if (currentConfig.classType === 'mystic_theurge') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: '10px',
          padding: '10px',
          border: '1px solid var(--pb)',
          borderRadius: '4px',
          background: 'rgba(200, 169, 110, 0.05)',
        }}
      >
        <strong style={{ fontSize: '11px', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>
          ✦ Mystic Theurge Spell Linking
        </strong>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '10px', fontWeight: 'bold' }}>Arcane Class (+1 Caster Level)</label>
          <select
            value={currentConfig.prestigeSpellLinks?.mystic_theurge?.arcane || ''}
            onChange={(e) => {
              const links = { ...currentConfig.prestigeSpellLinks?.mystic_theurge, arcane: e.target.value };
              updateLevelConfig(currentLevelIndex, 'prestigeSpellLinks', {
                ...currentConfig.prestigeSpellLinks,
                mystic_theurge: links,
              });
            }}
            className="cinput"
            style={{ width: '100%', fontSize: '11.5px', height: '28px', padding: '0 4px' }}
          >
            <option value="" disabled>
              -- Select Arcane Class --
            </option>
            {currentDraft.classes
              .filter((cl: any) => ['wizard', 'sorcerer', 'bard'].includes(cl.classType))
              .map((cl: any) => (
                <option key={cl.classType} value={cl.classType}>
                  {CLASSES_LIST.find((x) => x.key === cl.classType)?.name || cl.classType} (Lvl {cl.level})
                </option>
              ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
          <label style={{ fontSize: '10px', fontWeight: 'bold' }}>Divine Class (+1 Caster Level)</label>
          <select
            value={currentConfig.prestigeSpellLinks?.mystic_theurge?.divine || ''}
            onChange={(e) => {
              const links = { ...currentConfig.prestigeSpellLinks?.mystic_theurge, divine: e.target.value };
              updateLevelConfig(currentLevelIndex, 'prestigeSpellLinks', {
                ...currentConfig.prestigeSpellLinks,
                mystic_theurge: links,
              });
            }}
            className="cinput"
            style={{ width: '100%', fontSize: '11.5px', height: '28px', padding: '0 4px' }}
          >
            <option value="" disabled>
              -- Select Divine Class --
            </option>
            {currentDraft.classes
              .filter((cl: any) => ['cleric', 'druid', 'paladin', 'ranger'].includes(cl.classType))
              .map((cl: any) => (
                <option key={cl.classType} value={cl.classType}>
                  {CLASSES_LIST.find((x) => x.key === cl.classType)?.name || cl.classType} (Lvl {cl.level})
                </option>
              ))}
          </select>
        </div>
      </div>
    );
  }

  if (currentConfig.classType === 'arcane_trickster') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: '10px',
          padding: '10px',
          border: '1px solid var(--pb)',
          borderRadius: '4px',
          background: 'rgba(200, 169, 110, 0.05)',
        }}
      >
        <strong style={{ fontSize: '11px', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>
          ✦ Arcane Trickster Spell Linking
        </strong>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '10px', fontWeight: 'bold' }}>Arcane Class (+1 Caster Level)</label>
          <select
            value={currentConfig.prestigeSpellLinks?.arcane_trickster || ''}
            onChange={(e) => {
              updateLevelConfig(currentLevelIndex, 'prestigeSpellLinks', {
                ...currentConfig.prestigeSpellLinks,
                arcane_trickster: e.target.value,
              });
            }}
            className="cinput"
            style={{ width: '100%', fontSize: '11.5px', height: '28px', padding: '0 4px' }}
          >
            <option value="" disabled>
              -- Select Arcane Class --
            </option>
            {currentDraft.classes
              .filter((cl: any) => ['wizard', 'sorcerer', 'bard'].includes(cl.classType))
              .map((cl: any) => (
                <option key={cl.classType} value={cl.classType}>
                  {CLASSES_LIST.find((x) => x.key === cl.classType)?.name || cl.classType} (Lvl {cl.level})
                </option>
              ))}
          </select>
        </div>
      </div>
    );
  }

  return null;
};
