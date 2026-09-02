/**
 * @module    PrintPage4SpellsCompanion
 * @summary   Page 4 of the Printable D&D 3.5e Character Sheet (Spellcasting Matrix, Prepared Spells, Companion/Familiar).
 */

import React from 'react';
import { CombatSpells } from '@core/spells.js';

interface PrintPageProps {
  pc: any;
}

export const PrintPage4SpellsCompanion: React.FC<PrintPageProps> = ({ pc }) => {
  // Companion / Familiar
  const hasCompanion = pc.companionType && pc.companionType !== 'none';
  const hasFamiliar = pc.familiarType && pc.familiarType !== 'none';
  const petName = hasCompanion ? (pc.companionName || `${pc.companionType} (Animal Companion)`) : (hasFamiliar ? (pc.familiarName || `${pc.familiarType} (Familiar)`) : 'None');
  const petType = hasCompanion ? pc.companionType : (hasFamiliar ? pc.familiarType : '—');

  // Spells per day and DCs
  const spellStats = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
    const dc = typeof pc.getSpellDC === 'function' ? pc.getSpellDC(lvl) : (10 + lvl + (typeof pc.getAttributeMod === 'function' ? pc.getAttributeMod('int') : 0));
    const perDay = pc.spellsPerDay?.[lvl] ?? (lvl === 0 ? 4 : (lvl === 1 ? 3 : '—'));
    return { lvl, dc, perDay };
  });

  // Extract prepared / known spells
  const preparedSpells: any[] = [];

  if (Array.isArray(pc.spellbook)) {
    pc.spellbook.forEach((sp: any) => {
      preparedSpells.push({
        level: sp.level ?? 1,
        name: sp.nameEn || sp.nameDe || sp.name || sp.key,
        school: sp.school || 'Universal',
        range: sp.range || 'Close',
        duration: sp.duration || 'Instant',
        save: sp.save || 'None',
        desc: sp.shortDesc || sp.desc || '—',
      });
    });
  }

  if (pc.learnedSpells) {
    const learnedKeys = Array.isArray(pc.learnedSpells) ? pc.learnedSpells : Object.keys(pc.learnedSpells);
    learnedKeys.forEach((key: string) => {
      const regSpell = CombatSpells.REGISTRY?.[key];
      if (regSpell) {
        preparedSpells.push({
          level: regSpell.level ?? 1,
          name: regSpell.nameEn || regSpell.nameDe || regSpell.name || key,
          school: regSpell.school || 'Universal',
          range: regSpell.range || 'Close',
          duration: regSpell.duration || 'Instant',
          save: regSpell.save || 'None',
          desc: regSpell.shortDesc || regSpell.desc || '—',
        });
      }
    });
  }

  if (pc.spells && typeof pc.spells === 'object') {
    Object.entries(pc.spells).forEach(([key, sp]: [string, any]) => {
      preparedSpells.push({
        level: sp.level ?? 1,
        name: sp.nameEn || sp.nameDe || sp.name || key,
        school: sp.school || 'Universal',
        range: sp.range || 'Close',
        duration: sp.duration || 'Instant',
        save: sp.save || 'None',
        desc: sp.shortDesc || sp.desc || '—',
      });
    });
  }

  // Sort spells by level then name
  preparedSpells.sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name));

  // Pad prepared spells list for clean printable lines
  const displaySpells = [...preparedSpells.slice(0, 16)];
  while (displaySpells.length < 12) {
    displaySpells.push({ isPlaceholder: true, level: '—', name: '', school: '', range: '', duration: '', save: '', desc: '' });
  }

  return (
    <div className="dnd-page">
      <div className="dnd-page-border" />

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 className="dnd-header-title">SPELLBOOK &amp; COMPANION</h1>
          <div className="dnd-header-subtitle">v.3.5 Character Record Sheet • Page 4: Magic &amp; Animal Companion</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '7.5pt' }}>
          <strong>Character:</strong> {pc.name || 'Unknown'}
        </div>
      </div>

      {/* Spellcasting Summary Table (Levels 0 to 9) */}
      <div style={{ marginBottom: '8px' }}>
        <div className="dnd-section-banner">Spells per Day &amp; Spell Save DCs</div>
        <table className="dnd-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Spell Level</th>
              <th>0</th>
              <th>1st</th>
              <th>2nd</th>
              <th>3rd</th>
              <th>4th</th>
              <th>5th</th>
              <th>6th</th>
              <th>7th</th>
              <th>8th</th>
              <th>9th</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Spell Save DC</strong></td>
              {spellStats.map((s) => (
                <td key={s.lvl} style={{ textAlign: 'center', fontWeight: 'bold' }}>{s.dc}</td>
              ))}
            </tr>
            <tr>
              <td><strong>Spells per Day</strong></td>
              {spellStats.map((s) => (
                <td key={s.lvl} style={{ textAlign: 'center' }}>{s.perDay}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Prepared / Known Spells List */}
      <div style={{ marginBottom: '10px' }}>
        <div className="dnd-section-banner">
          <span>Prepared &amp; Known Spells</span>
          <span style={{ fontSize: '5.5pt', fontWeight: 'normal', textTransform: 'none' }}>
            □ = Slot Cast / Expended
          </span>
        </div>
        <table className="dnd-table">
          <thead>
            <tr>
              <th style={{ width: '20px' }}>Cast</th>
              <th style={{ width: '24px' }}>Lvl</th>
              <th style={{ textAlign: 'left', width: '130px' }}>Spell Name</th>
              <th style={{ width: '70px' }}>School</th>
              <th style={{ width: '50px' }}>Range</th>
              <th style={{ width: '50px' }}>Save / SR</th>
              <th style={{ textAlign: 'left' }}>Effect Summary</th>
            </tr>
          </thead>
          <tbody>
            {displaySpells.map((sp, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: 'center' }}>
                  {!sp.isPlaceholder && <span className="dnd-checkbox" />}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{sp.level}</td>
                <td style={{ fontWeight: sp.isPlaceholder ? 'normal' : 'bold' }}>{sp.name}</td>
                <td style={{ textAlign: 'center', fontSize: '6.5pt' }}>{sp.school}</td>
                <td style={{ textAlign: 'center', fontSize: '6.5pt' }}>{sp.range}</td>
                <td style={{ textAlign: 'center', fontSize: '6.5pt' }}>{sp.save}</td>
                <td style={{ fontSize: '7pt', color: 'var(--dnd-gray-dark)' }}>{sp.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Animal Companion / Familiar Section */}
      <div style={{ borderTop: '1.5pt solid var(--dnd-black)', paddingTop: '6px' }}>
        <div className="dnd-section-banner">Animal Companion / Familiar / Special Mount</div>
        
        {hasCompanion || hasFamiliar ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '6px' }}>
            
            {/* Core Companion Stats */}
            <div className="dnd-box" style={{ padding: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <div>
                  <div className="dnd-label">Creature Name &amp; Species</div>
                  <strong style={{ fontSize: '8.5pt', color: 'var(--dnd-red)' }}>{petName}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="dnd-label">Type</div>
                  <div className="dnd-value" style={{ textTransform: 'capitalize' }}>{petType}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center', marginTop: '4px' }}>
                <div>
                  <div className="dnd-label">Hit Dice</div>
                  <div className="dnd-value">{pc.companion?.hd || '3d8+6'}</div>
                </div>
                <div>
                  <div className="dnd-label">HP</div>
                  <div className="dnd-value" style={{ fontWeight: 'bold' }}>{pc.companion?.hp || '20'}</div>
                </div>
                <div>
                  <div className="dnd-label">Speed</div>
                  <div className="dnd-value">{pc.companion?.speed || '50 ft.'}</div>
                </div>
                <div>
                  <div className="dnd-label">Initiative</div>
                  <div className="dnd-value">{pc.companion?.init || '+2'}</div>
                </div>
              </div>
            </div>

            {/* Companion AC & Attacks */}
            <div className="dnd-box" style={{ padding: '4px' }}>
              <div className="dnd-label">Armor Class &amp; Saves</div>
              <div style={{ fontSize: '7.5pt', marginTop: '2px' }}>
                AC: <strong>{pc.companion?.ac || '14'}</strong> (Touch 12, Flat-Footed 12)
              </div>
              <div style={{ fontSize: '6.5pt', color: 'var(--dnd-gray-dark)', marginTop: '2px' }}>
                Fort: <strong>+5</strong> • Ref: <strong>+5</strong> • Will: <strong>+1</strong>
              </div>
              <div style={{ borderTop: '0.5pt dashed var(--dnd-gray-med)', marginTop: '3px', paddingTop: '2px' }}>
                <div className="dnd-label">Attack &amp; Damage</div>
                <div style={{ fontSize: '7pt', fontWeight: 'bold' }}>
                  {pc.companion?.attack || 'Bite +3 melee (1d6+1 plus Trip)'}
                </div>
              </div>
            </div>

            {/* Companion Special Qualities & Tricks */}
            <div className="dnd-box" style={{ padding: '4px' }}>
              <div className="dnd-label">Special Abilities &amp; Tricks</div>
              <div style={{ fontSize: '6.5pt', color: 'var(--dnd-gray-dark)', lineHeight: 1.2, marginTop: '2px' }}>
                • Link, Share Spells, Scent, Low-Light Vision.<br />
                • <strong>Tricks:</strong> Attack, Come, Defend, Down, Guard, Heel, Fetch.
              </div>
            </div>

          </div>
        ) : (
          <div className="dnd-box" style={{ padding: '10px', textAlign: 'center', color: 'var(--dnd-gray-med)', fontStyle: 'italic', fontSize: '7.5pt' }}>
            No Animal Companion, Familiar, or Special Mount active for this character.
          </div>
        )}
      </div>

      {/* Page Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5pt solid var(--dnd-gray-med)', paddingTop: '4px', marginTop: '6px', fontSize: '6.5pt', color: 'var(--dnd-gray-med)' }}>
        <span>The Combatant • D&amp;D 3.5e Automated Campaign Companion</span>
        <span>Character: {pc.name || 'Unknown'} • Page 4 of 4</span>
      </div>
    </div>
  );
};
