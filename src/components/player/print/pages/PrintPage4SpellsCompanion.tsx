import React from 'react';
import { CombatSpells } from '@core/spells.js';
import { CompanionRules } from '@core/rules/CompanionRules.js';
import { FamiliarRules } from '@core/rules/FamiliarRules.js';
import { getStatMod, formatMod } from '../../attributeHelper';

interface PrintPageProps {
  pc: any;
}

/**
 * Formats a long spell description into a concise 1-line Effect Summary
 * suited for the print budget of Page 4 (max ~85 characters).
 */
export function formatSpellSummary(rawDesc?: string, maxLen = 85): string {
  if (!rawDesc || rawDesc === '—') return '—';
  const clean = String(rawDesc).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (!clean) return '—';

  // Extract first complete sentence if available
  const firstSentenceMatch = clean.match(/^([^.!?]+[.!?])/);
  const firstSentence = firstSentenceMatch ? firstSentenceMatch[1].trim() : clean;

  if (firstSentence.length <= maxLen) {
    return firstSentence;
  }

  // Truncate cleanly at word boundary
  const truncated = clean.substring(0, maxLen - 1);
  const lastSpace = truncated.lastIndexOf(' ');
  return ((lastSpace > 40 ? truncated.substring(0, lastSpace) : truncated).trim()) + '…';
}

export const PrintPage4SpellsCompanion: React.FC<PrintPageProps> = ({ pc }) => {
  // Companion / Familiar Detection & Live Data Resolution
  const hasCompanion = pc.companionType && pc.companionType !== 'none';
  const hasFamiliar = pc.familiarType && pc.familiarType !== 'none';

  const effectiveDruidLvl = CompanionRules.calculateEffectiveDruidLevel(pc);
  const companionBase = hasCompanion ? CompanionRules.getCompanionBaseStats(pc.companionType, effectiveDruidLvl) : null;
  const familiarBase = hasFamiliar ? FamiliarRules.getFamiliarBaseStats(pc.familiarType) : null;

  const petName = hasCompanion 
    ? (pc.companionName || companionBase?.name || `${pc.companionType} (Animal Companion)`)
    : (hasFamiliar ? (pc.familiarName || familiarBase?.name || `${pc.familiarType} (Familiar)`) : 'None');

  const petType = hasCompanion 
    ? (companionBase?.name && companionBase.name.toLowerCase() !== pc.companionType.toLowerCase() ? `${companionBase.name} (${pc.companionType})` : (companionBase?.name || pc.companionType)) 
    : (hasFamiliar ? (familiarBase?.name && familiarBase.name.toLowerCase() !== pc.familiarType.toLowerCase() ? `${familiarBase.name} (${pc.familiarType})` : (familiarBase?.name || pc.familiarType)) : '—');
  const petHD = hasCompanion ? (companionBase?.hd || `${effectiveDruidLvl} HD`) : (hasFamiliar ? `${(pc.classes || []).reduce((s: number, c: any) => s + (c.level || 0), 0)} HD` : '—');
  const petHP = hasCompanion ? (pc.companionHP || pc.companionMaxHP || companionBase?.maxHP || '—') : (hasFamiliar ? (pc.familiarHP || Math.floor((pc.maxHP || 10) / 2)) : '—');
  const petSpeed = hasCompanion ? (companionBase?.speed || '40 ft.') : (hasFamiliar ? (familiarBase?.speed || '30 ft.') : '—');
  const petInit = hasCompanion ? (companionBase?.init !== undefined ? formatMod(companionBase.init) : '+2') : (hasFamiliar ? (familiarBase?.init !== undefined ? formatMod(familiarBase.init) : '+2') : '—');
  const petAC = hasCompanion ? (companionBase?.ac || '14') : (hasFamiliar ? (familiarBase?.ac || '14') : '—');
  const petAttack = hasCompanion ? (companionBase?.attack || companionBase?.attacks?.[0]?.name || 'Natural Attack') : (hasFamiliar ? (familiarBase?.attack || familiarBase?.attacks?.[0]?.name || 'Natural Attack') : '—');
  const petSpecial = hasCompanion 
    ? (companionBase?.specialQualities || 'Link, Share Spells, Scent, Low-Light Vision.')
    : (hasFamiliar ? (familiarBase?.specialQualities || 'Alertness, Improved Evasion, Share Spells, Empathic Link.') : '—');

  // Determine Primary Spellcasting Attribute (WIS, CHA, or INT)
  const isWisCaster = (pc.classes || []).some((c: any) => ['cleric', 'druid', 'ranger'].includes(c.classType));
  const isChaCaster = (pc.classes || []).some((c: any) => ['sorcerer', 'bard', 'paladin', 'favored_soul'].includes(c.classType));
  const casterMod = isWisCaster ? getStatMod(pc.wis) : (isChaCaster ? getStatMod(pc.cha) : getStatMod(pc.int));

  // Spells per day and DCs
  const spellStats = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
    const dc = typeof pc.getSpellDC === 'function' ? pc.getSpellDC(lvl) : (10 + lvl + casterMod);
    const maxSlots = pc.spellSlots?.[lvl]?.max;
    const legacyPerDay = pc.spellsPerDay?.[lvl];
    const perDay = maxSlots !== undefined ? (maxSlots > 0 ? maxSlots : '—') : (legacyPerDay !== undefined ? legacyPerDay : '—');
    return { lvl, dc, perDay };
  });

  // Extract prepared / known spells
  const preparedSpells: any[] = [];
  const addedKeys = new Set<string>();

  // 1. Prepared spells directly from combatant
  if (Array.isArray(pc.preparedSpells)) {
    pc.preparedSpells.forEach((sp: any) => {
      if (!sp) return;
      const key = sp.key || sp.name;
      const reg = key ? (CombatSpells.REGISTRY?.[key] || (typeof CombatSpells.getSpellDetails === 'function' ? CombatSpells.getSpellDetails(key) : null)) : null;
      preparedSpells.push({
        level: sp.level ?? reg?.level ?? 1,
        name: sp.name || reg?.nameEn || reg?.nameDe || key || 'Prepared Spell',
        school: reg?.school || sp.school || 'Universal',
        range: reg?.range || sp.range || 'Close',
        duration: reg?.duration || sp.duration || 'Instant',
        save: reg?.save || sp.save || 'None',
        desc: formatSpellSummary(reg?.shortDesc || reg?.description || reg?.desc || sp.desc || sp.notes || '—'),
        isUsed: !!sp.isUsed,
      });
      if (key) addedKeys.add(key);
    });
  }

  // 2. Spellbook spells
  if (Array.isArray(pc.spellbook)) {
    pc.spellbook.forEach((sp: any) => {
      if (!sp) return;
      const key = sp.key || sp.nameEn || sp.name;
      if (key && !addedKeys.has(key)) {
        preparedSpells.push({
          level: sp.level ?? 1,
          name: sp.nameEn || sp.nameDe || sp.name || key || 'Spellbook Spell',
          school: sp.school || 'Universal',
          range: sp.range || 'Close',
          duration: sp.duration || 'Instant',
          save: sp.save || 'None',
          desc: formatSpellSummary(sp.shortDesc || sp.description || sp.desc || '—'),
          isUsed: false,
        });
        addedKeys.add(key);
      }
    });
  }

  // 3. Learned spells registry keys
  if (pc.learnedSpells) {
    const learnedKeys = Array.isArray(pc.learnedSpells) ? pc.learnedSpells : Object.keys(pc.learnedSpells);
    learnedKeys.forEach((key: string) => {
      if (key && !addedKeys.has(key)) {
        const regSpell = CombatSpells.REGISTRY?.[key] || (typeof CombatSpells.getSpellDetails === 'function' ? CombatSpells.getSpellDetails(key) : null);
        preparedSpells.push({
          level: regSpell?.level ?? 1,
          name: regSpell?.nameEn || regSpell?.nameDe || regSpell?.name || key || 'Learned Spell',
          school: regSpell?.school || 'Universal',
          range: regSpell?.range || 'Close',
          duration: regSpell?.duration || 'Instant',
          save: regSpell?.save || 'None',
          desc: formatSpellSummary(regSpell?.shortDesc || regSpell?.description || regSpell?.desc || '—'),
          isUsed: false,
        });
        addedKeys.add(key);
      }
    });
  }

  // Sort spells by level then name safely
  preparedSpells.sort((a, b) => ((parseInt(a.level) || 0) - (parseInt(b.level) || 0)) || (a.name || '').localeCompare(b.name || ''));

  // Pad prepared spells list for clean printable lines
  const displaySpells = [...preparedSpells.slice(0, 16)];
  while (displaySpells.length < 12) {
    displaySpells.push({ isPlaceholder: true, level: '—', name: '', school: '', range: '', duration: '', save: '', desc: '' });
  }

  return (
    <div className="dnd-page">
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
                  {!sp.isPlaceholder && <span className={`dnd-checkbox ${sp.isUsed ? 'dnd-checkbox-checked' : ''}`}>{sp.isUsed ? '✓' : ''}</span>}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{sp.level}</td>
                <td style={{ fontWeight: sp.isPlaceholder ? 'normal' : 'bold' }}>{sp.name}</td>
                <td style={{ textAlign: 'center', fontSize: '6.5pt' }}>{sp.school}</td>
                <td style={{ textAlign: 'center', fontSize: '6.5pt' }}>{sp.range}</td>
                <td style={{ textAlign: 'center', fontSize: '6.5pt' }}>{sp.save}</td>
                <td style={{ fontSize: '6.5pt', color: 'var(--dnd-gray-dark)', lineHeight: 1.15, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sp.desc}>{sp.desc}</td>
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
                  <div className="dnd-value">{petHD}</div>
                </div>
                <div>
                  <div className="dnd-label">HP</div>
                  <div className="dnd-value" style={{ fontWeight: 'bold' }}>{petHP}</div>
                </div>
                <div>
                  <div className="dnd-label">Speed</div>
                  <div className="dnd-value">{petSpeed}</div>
                </div>
                <div>
                  <div className="dnd-label">Initiative</div>
                  <div className="dnd-value">{petInit}</div>
                </div>
              </div>
            </div>

            {/* Companion AC & Attacks */}
            <div className="dnd-box" style={{ padding: '4px' }}>
              <div className="dnd-label">Armor Class &amp; Saves</div>
              <div style={{ fontSize: '7.5pt', marginTop: '2px' }}>
                AC: <strong>{petAC}</strong>
              </div>
              <div style={{ borderTop: '0.5pt dashed var(--dnd-gray-med)', marginTop: '3px', paddingTop: '2px' }}>
                <div className="dnd-label">Attack &amp; Damage</div>
                <div style={{ fontSize: '7pt', fontWeight: 'bold' }}>
                  {petAttack}
                </div>
              </div>
            </div>

            {/* Companion Special Qualities & Tricks */}
            <div className="dnd-box" style={{ padding: '4px' }}>
              <div className="dnd-label">Special Abilities &amp; Qualities</div>
              <div style={{ fontSize: '6.5pt', color: 'var(--dnd-gray-dark)', lineHeight: 1.2, marginTop: '2px' }}>
                {petSpecial}
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
