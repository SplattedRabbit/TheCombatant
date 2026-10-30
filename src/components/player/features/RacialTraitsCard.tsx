import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import { RACIAL_TRAITS_DATA } from './racialTraitsData';

interface RacialTraitsCardProps {
  pc: any;
}

export const RacialTraitsCard: React.FC<RacialTraitsCardProps> = ({ pc }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const race = (pc.race || 'human').toLowerCase();
  const raceNames: Record<string, string> = {
    human: 'Human',
    elf: 'Elf',
    dwarf: 'Dwarf',
    gnome: 'Gnome',
    halfling: 'Halfling',
    deep_halfling: 'Deep Halfling',
    half_elf: 'Half-Elf',
    half_orc: 'Half-Orc',
    tiefling: 'Tiefling',
    lizardfolk: 'Lizardfolk',
    anima_construct: 'Anima Construct'
  };
  const raceName = raceNames[race] || 'Human';

  const craftRanks = typeof pc.getSkillRanks === 'function' ? pc.getSkillRanks('craft') : 0;
  const intMod = typeof pc.getAttributeMod === 'function' ? pc.getAttributeMod('int') : 0;
  const totalMod = craftRanks + intMod;

  const repairAbilityIdx = Array.isArray(pc.dailyAbilities) 
    ? pc.dailyAbilities.findIndex((ab: any) => ab.name === 'Manuelle Reparatur' || ab.name === 'Manual Repair') 
    : -1;
  const repairAbility = repairAbilityIdx >= 0 ? pc.dailyAbilities[repairAbilityIdx] : null;
  const usedSlots = repairAbility ? repairAbility.used : 0;
  const maxSlots = repairAbility ? repairAbility.max : 4;

  const handleRepair = (dc: number, healDice: '1d4' | '1d8') => {
    if (repairAbility && usedSlots >= maxSlots) {
      showCustomAlert('Fehler', 'Alle täglichen Reparaturen für heute sind bereits verbraucht.', 'OK', '❌');
      return;
    }

    if (repairAbilityIdx >= 0) {
      CombatState.updatePCDailyAbilityUsed(repairAbilityIdx, 1);
    }

    const modSign = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
    const resultMsg = `<div style="text-align:center; font-size:11px; line-height:1.5;">
      <div style="font-size:20px; font-weight:bold; color:var(--red); margin-bottom:6px;">1d20 ${modSign} vs DC ${dc}</div>
      <div><strong>Handwerks-Wurf (Craft):</strong> 1d20 ${modSign} (am Tisch auswürfeln)</div>
      <div><strong>Schwierigkeitsgrad:</strong> DC ${dc}</div>
      <div style="margin-top:8px;"><strong>Bei Erfolg:</strong> Heilt <strong>${healDice} HP</strong> (am Tisch auswürfeln und manuell im Bogen eintragen).</div>
      <div style="margin-top:8px; font-size:9.5px; color:var(--inkm); font-style:italic;">
        Dauer: 1 Stunde Arbeit mit Handwerkswerkzeug. 1 Reparatur verbraucht (${usedSlots + 1} / ${maxSlots}).
      </div>
    </div>`;

    showCustomAlert('Manuelle Reparatur (Living Construct) 🛠️', resultMsg, 'Verstanden', '🛠️');
  };

  const renderTraitList = () => {
    const traits = RACIAL_TRAITS_DATA[race];
    if (!traits) return null;
    const conScore = pc.con?.total || pc.con?.base || 10;
    const placeholders: Record<string, string> = { holdBreathRounds: String(conScore * 4) };
    return (
      <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: 'var(--font-body)', lineHeight: 1.3, color: 'var(--inkm)' }}>
        {traits.map(trait => (
          <li key={trait.title}>
            <strong>{trait.title}:</strong>{' '}
            {trait.text.replace(/\{(\w+)\}/g, (_, key) => placeholders[key] ?? '')}
          </li>
        ))}
      </ul>
    );
  };

  const getRacialTraitsContent = () => {
    if (race === 'anima_construct') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {renderTraitList()}

          <div style={{ borderTop: '0.5px dashed rgba(200, 169, 110, 0.4)', paddingTop: '8px', marginTop: '4px' }}>
            <strong style={{ fontSize: '10px', display: 'block', marginBottom: '6px', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>
              🛠️ Manual Repair (Living Construct)
            </strong>
            <p style={{ margin: '0 0 8px 0', fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', lineHeight: 1.25 }}>
              Requires artisan tools and 1 hour of labor. Perform a Craft check.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '10px' }}>
              <span>Daily Repairs:</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {Array.from({ length: maxSlots }).map((_, idx) => (
                  <span key={idx} style={{ fontSize: '12px', opacity: idx < usedSlots ? 1 : 0.25 }}>
                    {idx < usedSlots ? '⬛' : '⬜'}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '9px', color: 'var(--inkl)' }}>
                ({usedSlots} / {maxSlots} used)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-p"
                disabled={usedSlots >= maxSlots}
                onClick={() => handleRepair(15, '1d4')}
                style={{ fontSize: '9.5px', padding: '4px 10px', cursor: 'pointer' }}
              >
                Minor Repair (DC 15)
              </button>
              <button
                type="button"
                className="btn btn-p"
                disabled={usedSlots >= maxSlots}
                onClick={() => handleRepair(20, '1d8')}
                style={{ fontSize: '9.5px', padding: '4px 10px', cursor: 'pointer' }}
              >
                Major Repair (DC 20)
              </button>
            </div>
          </div>
        </div>
      );
    }
    return renderTraitList();
  };

  return (
    <div className={`class-card ${isExpanded ? 'expanded' : ''}`} style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div 
        className="class-card-hdr" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-title)', fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', cursor: 'pointer', userSelect: 'none' }}
      >
        <span>🧬 Racial Traits: {raceName}</span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', transition: 'transform 0.2s ease' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="class-card-body" style={{ display: 'flex', flexDirection: 'column', padding: '6px 8px', gap: '3.5px', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)' }}>
          {getRacialTraitsContent()}
        </div>
      )}
    </div>
  );
};
