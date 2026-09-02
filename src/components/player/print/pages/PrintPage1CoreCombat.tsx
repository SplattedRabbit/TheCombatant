/**
 * @module    PrintPage1CoreCombat
 * @summary   Page 1 of the Printable D&D 3.5e Character Sheet (Core, Attributes, AC, Saves, BAB, Weapons).
 */

import React from 'react';
import { CLASSES_LIST } from '../../wizard/constants';
import { extractStatValue, getStatMod, formatMod } from '../../attributeHelper';

interface PrintPageProps {
  pc: any;
}

export const PrintPage1CoreCombat: React.FC<PrintPageProps> = ({ pc }) => {
  // Extract attribute scores and modifiers canonically
  const strVal = extractStatValue(pc.str, 10);
  const dexVal = extractStatValue(pc.dex, 10);
  const conVal = extractStatValue(pc.con, 10);
  const intVal = extractStatValue(pc.int, 10);
  const wisVal = extractStatValue(pc.wis, 10);
  const chaVal = extractStatValue(pc.cha, 10);

  const strMod = getStatMod(pc.str);
  const dexMod = getStatMod(pc.dex);
  const conMod = getStatMod(pc.con);
  const intMod = getStatMod(pc.int);
  const wisMod = getStatMod(pc.wis);
  const chaMod = getStatMod(pc.cha);

  const str = { val: strVal, mod: formatMod(strMod) };
  const dex = { val: dexVal, mod: formatMod(dexMod) };
  const con = { val: conVal, mod: formatMod(conMod) };
  const int = { val: intVal, mod: formatMod(intMod) };
  const wis = { val: wisVal, mod: formatMod(wisMod) };
  const cha = { val: chaVal, mod: formatMod(chaMod) };

  // Format Class & Level
  const classSummary = (pc.classes || [])
    .map((c: any) => {
      const matched = CLASSES_LIST.find(x => x.key === c.classType);
      const name = matched ? matched.name : c.classType;
      return `${name} ${c.level}`;
    })
    .join(' / ') || 'Adventurer 1';

  // Total character level
  const totalLevel = (pc.classes || []).reduce((sum: number, c: any) => sum + (c.level || 0), 0) || 1;

  // AC stats
  const totalAC = extractStatValue(pc.ac, 10);
  const touchAC = extractStatValue(pc.acTouch, 10);
  const flatFootedAC = extractStatValue(pc.acFlat, 10);
  const hpTotal = pc.maxHP || pc.maxHp || pc.hp || 10;

  // Canonical Saving Throws (Fortitude: za, Reflex: ref, Will: wil)
  const getSave = (type: 'za' | 'ref' | 'wil', attrMod: number) => {
    const saveStat = type === 'za' ? pc.za : type === 'ref' ? pc.ref : pc.wil;
    const baseStat = type === 'za' ? pc.baseZa : type === 'ref' ? pc.baseRef : pc.baseWil;
    
    const totalVal = extractStatValue(saveStat, 0);
    const baseVal = extractStatValue(baseStat, 0);
    const miscVal = totalVal - (baseVal + attrMod);
    
    return {
      total: formatMod(totalVal),
      base: formatMod(baseVal),
      attr: formatMod(attrMod),
      misc: miscVal !== 0 ? formatMod(miscVal) : '0',
    };
  };

  const fort = getSave('za', conMod);
  const ref = getSave('ref', dexMod);
  const will = getSave('wil', wisMod);

  // BAB & Grapple
  const bab = extractStatValue(pc.bab, 0);
  const babDisplay = formatMod(bab);
  const sizeMod = 0; // standard medium size mod = 0
  const grappleTotal = bab + strMod + sizeMod;
  const grappleDisplay = formatMod(grappleTotal);

  // Initiative
  const hasImprovedInit = Array.isArray(pc.feats) && pc.feats.some((f: any) => f.id === 'improved_initiative');
  const initMod = dexMod + (parseInt(pc.iniMisc) || 0) + (hasImprovedInit ? 4 : 0);
  const initDisplay = formatMod(initMod);

  // Weapons (pad to 4 blocks)
  const rawWeapons = (pc.weapons || []).slice(0, 4);
  const weapons = [...rawWeapons];
  while (weapons.length < 4) {
    weapons.push({ name: '', isPlaceholder: true });
  }

  return (
    <div className="dnd-page">
      <div className="dnd-page-border" />

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 className="dnd-header-title">DUNGEONS &amp; DRAGONS</h1>
          <div className="dnd-header-subtitle">v.3.5 Character Record Sheet • Page 1: Core &amp; Combat</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontFamily: 'var(--font-dnd-title)', fontSize: '9pt', fontWeight: 'bold', color: 'var(--dnd-red)' }}>
            THE COMBATANT
          </span>
        </div>
      </div>

      {/* Top Character Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr', gap: '4px', marginBottom: '8px' }}>
        <div className="dnd-box">
          <div className="dnd-label">Character Name</div>
          <div className="dnd-value" style={{ fontSize: '11pt', fontWeight: 'bold' }}>{pc.name || 'Unknown Adventurer'}</div>
        </div>
        <div className="dnd-box">
          <div className="dnd-label">Class &amp; Level</div>
          <div className="dnd-value">{classSummary}</div>
        </div>
        <div className="dnd-box">
          <div className="dnd-label">Player</div>
          <div className="dnd-value">{pc.playerName || 'Player'}</div>
        </div>
        <div className="dnd-box">
          <div className="dnd-label">Total Level</div>
          <div className="dnd-value-large" style={{ fontSize: '11pt' }}>{totalLevel}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr 1fr 1fr', gap: '4px', marginBottom: '10px' }}>
        <div className="dnd-box">
          <div className="dnd-label">Race</div>
          <div className="dnd-value" style={{ textTransform: 'capitalize' }}>{pc.race || 'Human'}</div>
        </div>
        <div className="dnd-box">
          <div className="dnd-label">Alignment</div>
          <div className="dnd-value">{pc.alignment || 'Neutral'}</div>
        </div>
        <div className="dnd-box">
          <div className="dnd-label">Deity</div>
          <div className="dnd-value">{pc.deity || '—'}</div>
        </div>
        <div className="dnd-box">
          <div className="dnd-label">Size / Gender</div>
          <div className="dnd-value">{pc.size || 'Medium'} / {pc.gender || '—'}</div>
        </div>
        <div className="dnd-box">
          <div className="dnd-label">Age / Height</div>
          <div className="dnd-value">{pc.age || '—'} / {pc.height || '—'}</div>
        </div>
        <div className="dnd-box">
          <div className="dnd-label">Eyes / Hair</div>
          <div className="dnd-value">{pc.eyes || '—'} / {pc.hair || '—'}</div>
        </div>
      </div>

      {/* Main Column 1 & Column 2 Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: '10px', flex: 1 }}>
        
        {/* Left Column: Attributes, Saves, HP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Ability Scores */}
          <div>
            <div className="dnd-section-banner">Ability Scores</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {[
                { name: 'STR', ...str },
                { name: 'DEX', ...dex },
                { name: 'CON', ...con },
                { name: 'INT', ...int },
                { name: 'WIS', ...wis },
                { name: 'CHA', ...cha },
              ].map((s) => (
                <div key={s.name} className="dnd-stat-box" style={{ width: '100%' }}>
                  <span className="dnd-stat-name">{s.name}</span>
                  <div className="dnd-stat-modifier-oval">{s.mod}</div>
                  <span className="dnd-stat-score">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hit Points & Speed */}
          <div className="dnd-box" style={{ padding: '6px' }}>
            <div className="dnd-section-banner" style={{ margin: '-6px -6px 6px -6px' }}>Hit Points &amp; Movement</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '4px' }}>
              <div style={{ textAlign: 'center', border: '0.75pt solid var(--dnd-black)', padding: '3px', borderRadius: '2px' }}>
                <div className="dnd-label">Total HP</div>
                <div className="dnd-value-large" style={{ color: 'var(--dnd-red)' }}>{hpTotal}</div>
              </div>
              <div style={{ textAlign: 'center', border: '0.75pt solid var(--dnd-black)', padding: '3px', borderRadius: '2px' }}>
                <div className="dnd-label">Current Wounds</div>
                <div style={{ height: '18px' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <div className="dnd-box" style={{ textAlign: 'center' }}>
                <div className="dnd-label">Speed</div>
                <div className="dnd-value">{pc.speed || '30 ft.'}</div>
              </div>
              <div className="dnd-box" style={{ textAlign: 'center' }}>
                <div className="dnd-label">Initiative</div>
                <div className="dnd-value" style={{ fontWeight: 'bold' }}>{initDisplay}</div>
              </div>
            </div>
          </div>

          {/* Saving Throws */}
          <div>
            <div className="dnd-section-banner">Saving Throws</div>
            <table className="dnd-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Save</th>
                  <th>Total</th>
                  <th>Base</th>
                  <th>Attr</th>
                  <th>Misc</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Fortitude</strong> <span style={{ fontSize: '5.5pt', color: 'var(--dnd-gray-med)' }}>(CON)</span></td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{fort.total}</td>
                  <td style={{ textAlign: 'center' }}>{fort.base}</td>
                  <td style={{ textAlign: 'center' }}>{fort.attr}</td>
                  <td style={{ textAlign: 'center' }}>{fort.misc}</td>
                </tr>
                <tr>
                  <td><strong>Reflex</strong> <span style={{ fontSize: '5.5pt', color: 'var(--dnd-gray-med)' }}>(DEX)</span></td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{ref.total}</td>
                  <td style={{ textAlign: 'center' }}>{ref.base}</td>
                  <td style={{ textAlign: 'center' }}>{ref.attr}</td>
                  <td style={{ textAlign: 'center' }}>{ref.misc}</td>
                </tr>
                <tr>
                  <td><strong>Will</strong> <span style={{ fontSize: '5.5pt', color: 'var(--dnd-gray-med)' }}>(WIS)</span></td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{will.total}</td>
                  <td style={{ textAlign: 'center' }}>{will.base}</td>
                  <td style={{ textAlign: 'center' }}>{will.attr}</td>
                  <td style={{ textAlign: 'center' }}>{will.misc}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Base Attack & Grapple */}
          <div className="dnd-box" style={{ padding: '6px' }}>
            <div className="dnd-section-banner" style={{ margin: '-6px -6px 6px -6px' }}>Attack &amp; Combat Modifiers</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="dnd-label">Base Attack Bonus</div>
                <div className="dnd-value-large" style={{ fontSize: '11pt' }}>{babDisplay}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="dnd-label">Grapple Modifier</div>
                <div className="dnd-value-large" style={{ fontSize: '11pt' }}>{grappleDisplay}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Armor Class & Weapons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Armor Class Wappen & Breakdown */}
          <div>
            <div className="dnd-section-banner">Armor Class (AC)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: '6px', marginBottom: '4px' }}>
              <div className="dnd-shield-box">
                <div className="dnd-label">Total AC</div>
                <div className="dnd-value-large" style={{ fontSize: '16pt', color: 'var(--dnd-red)' }}>{totalAC}</div>
              </div>
              <div className="dnd-box" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="dnd-label">Touch AC</div>
                <div className="dnd-value-large" style={{ fontSize: '13pt' }}>{touchAC}</div>
              </div>
              <div className="dnd-box" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="dnd-label">Flat-Footed AC</div>
                <div className="dnd-value-large" style={{ fontSize: '13pt' }}>{flatFootedAC}</div>
              </div>
            </div>

            <div style={{ fontSize: '6.5pt', color: 'var(--dnd-gray-med)', textAlign: 'center', border: '0.5pt solid var(--dnd-gray-med)', padding: '2px', borderRadius: '2px' }}>
              AC = 10 + Armor + Shield + Dex ({dex.mod}) + Size ({sizeMod}) + Natural + Deflection + Misc
            </div>
          </div>

          {/* Weapons & Attacks Matrix */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="dnd-section-banner">Weapons &amp; Attacks</div>

            {weapons.map((w, idx) => {
              const attackBonus = w.isPlaceholder ? '' : (w.attackBonus || babDisplay);
              const damage = w.isPlaceholder ? '' : (w.damage || '1d8');
              const crit = w.isPlaceholder ? '' : (w.critThreat || '20/x2');
              const range = w.isPlaceholder ? '' : (w.range || 'Melee');
              const type = w.isPlaceholder ? '' : (w.damageType || 'Slashing');

              return (
                <div
                  key={idx}
                  className="dnd-box"
                  style={{
                    padding: '4px 6px',
                    background: w.isPlaceholder ? 'rgba(0,0,0,0.01)' : '#ffffff',
                    border: '1pt solid var(--dnd-black)',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '4px', marginBottom: '2px' }}>
                    <div>
                      <div className="dnd-label">Weapon / Attack</div>
                      <div className="dnd-value" style={{ fontWeight: 'bold' }}>{w.name || '—'}</div>
                    </div>
                    <div>
                      <div className="dnd-label">Attack Bonus</div>
                      <div className="dnd-value" style={{ fontWeight: 'bold', color: 'var(--dnd-red)' }}>{attackBonus}</div>
                    </div>
                    <div>
                      <div className="dnd-label">Damage</div>
                      <div className="dnd-value">{damage}</div>
                    </div>
                    <div>
                      <div className="dnd-label">Critical</div>
                      <div className="dnd-value">{crit}</div>
                    </div>
                    <div>
                      <div className="dnd-label">Range / Type</div>
                      <div className="dnd-value" style={{ fontSize: '7pt' }}>{range} {type ? `(${type})` : ''}</div>
                    </div>
                  </div>

                  {/* Ammunition & Notes row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5pt dashed var(--dnd-gray-med)', paddingTop: '2px', marginTop: '2px' }}>
                    <div style={{ fontSize: '6.5pt', color: 'var(--dnd-gray-dark)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong>Notes:</strong> {w.notes || (w.isPlaceholder ? '—' : 'Equipped')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span style={{ fontSize: '5.5pt', textTransform: 'uppercase', color: 'var(--dnd-gray-med)' }}>Ammo:</span>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <div key={num} className="dnd-checkbox" />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Page Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5pt solid var(--dnd-gray-med)', paddingTop: '4px', marginTop: '6px', fontSize: '6.5pt', color: 'var(--dnd-gray-med)' }}>
        <span>The Combatant • D&amp;D 3.5e Automated Campaign Companion</span>
        <span>Character: {pc.name || 'Unknown'} • Page 1 of 4</span>
      </div>
    </div>
  );
};
