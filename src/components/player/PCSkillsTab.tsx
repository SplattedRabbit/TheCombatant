/**
 * @module    PCSkillsTab
 * @summary   Rendert die D&D 3.5e Fertigkeitsliste (Skills Tab) mit Such- & Filterfunktion, SP-Badge, Rängen und detailliertem Modifikator-Tooltip.
 * @exports   PCSkillsTab
 * @reads     pc.skills, pc.classes, pc.race, pc.feats, pc.conditions, pc.armor
 * @stateOps  updatePCBatch
 * @depends   React, @core/state.js, @core/rules.js, @core/data/skills-data.js, @core/models/helpers/skills/CombatantSkills.js, @core/models/helpers/skills/SkillFeatApplier.js, @core/ui/components/dialogs.js
 * @notHere   Attribute -> PCAttributes.tsx | Ausrüstung -> PCOffenseTab.tsx
 */

import React, { useState, useMemo } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { CombatRules } from '@core/rules.js';
// @ts-ignore
import { SKILLS_REGISTRY } from '@core/data/skills-data.js';
// @ts-ignore
import { calculateSkillModifier } from '@core/models/helpers/skills/CombatantSkills.js';
// @ts-ignore
import { applyFeatSkillBonuses } from '@core/models/helpers/skills/SkillFeatApplier.js';
// @ts-ignore
import { showRollBreakdown } from '@core/ui/components/dialogs.js';

interface PCSkillsTabProps {
  pc: any; // Als any deklariert zur Laufzeit-Kompatibilität mit dynamischen Prototyp-Methoden
}

export const PCSkillsTab: React.FC<PCSkillsTabProps> = ({ pc }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'class' | 'trained'>('all');

  // Format Mod helper
  const formatMod = (val: number) => (val >= 0 ? `+${val}` : `${val}`);

  // ---------------------------------------------------------------------------
  // Dynamic Method Patching for Snapshot compatibility
  // ---------------------------------------------------------------------------
  const patchedPC: any = useMemo(() => {
    if (!pc) return null;
    const patched = { ...pc };
    
    patched.getSkillRanks = (key: string) => {
      return (patched.skills && patched.skills[key]) ? parseFloat((patched.skills[key] as any).ranks) || 0 : 0;
    };
    
    patched.getSkillMisc = (key: string) => {
      return (patched.skills && patched.skills[key]) ? parseInt((patched.skills[key] as any).misc) || 0 : 0;
    };
    
    patched.getAttributeMod = (abl: string) => {
      const stat = (patched as any)[abl];
      const score = stat ? stat.total : 10;
      return Math.floor((score - 10) / 2);
    };
    
    patched.getArmorCheckPenalty = () => {
      let acp = 0;
      if (Array.isArray(patched.armor)) {
        patched.armor.forEach((a: any) => {
          if (a.equipped) {
            acp += (parseInt(a.checkPenaltyOverride) || parseInt(a.checkPenalty) || 0);
          }
        });
      }
      return acp;
    };
    
    patched.getSkillModifier = (key: string) => {
      return calculateSkillModifier(patched, key);
    };

    return patched;
  }, [pc]);

  if (!patchedPC) return null;

  // SP-Punkte berechnen
  const spentSP = CombatRules.calculateSpentSkillPoints(patchedPC);
  const totalSP = CombatRules.calculateTotalSkillPoints(patchedPC);
  const isOverspent = spentSP > totalSP;
  const badgeBg = isOverspent ? 'rgba(139, 26, 26, 0.15)' : 'rgba(139, 26, 26, 0.08)';
  const badgeBorderColor = isOverspent ? 'var(--red)' : 'var(--pb)';

  // Tooltip für Aufschlüsselung erzeugen
  const getSkillTooltip = (key: string, totalMod: number, ranks: number, attrMod: number, misc: number, skill: any) => {
    const lines = [`Gesamtmodifikator: ${formatMod(totalMod)}`];
    lines.push(`• Ränge: ${ranks}`);
    lines.push(`• ${skill.abl.toUpperCase()}-Mod: ${formatMod(attrMod)}`);
    
    if (misc !== 0) {
      lines.push(`• Sonstiges (Eigenwert): ${formatMod(misc)}`);
    }

    // Talent-Boni
    const featBonus = applyFeatSkillBonuses(patchedPC, key, skill);
    if (featBonus > 0) {
      lines.push(`• Talentboni: ${formatMod(featBonus)}`);
    }

    // Volksboni
    const race = (patchedPC.race || 'human').toLowerCase();
    let racialBonus = 0;
    if (race === 'dwarf' && key === 'craft') racialBonus = 2;
    else if (race === 'elf' && ['listen', 'search', 'spot'].includes(key)) racialBonus = 2;
    else if (race === 'gnome' && ['listen', 'craft'].includes(key)) racialBonus = 2;
    else if (race === 'halfling' && ['climb', 'jump', 'move_silently', 'listen'].includes(key)) racialBonus = 2;
    else if (race === 'half_elf') {
      if (['listen', 'search', 'spot'].includes(key)) racialBonus = 1;
      if (['diplomacy', 'gather_information'].includes(key)) racialBonus = 2;
    }
    if (racialBonus > 0) {
      lines.push(`• Volksbonus: ${formatMod(racialBonus)}`);
    }

    // Synergie-Effekt
    let synergy = 0;
    if (key === 'balance' && patchedPC.getSkillRanks('tumble') >= 5) synergy += 2;
    if (key === 'escape_artist' && patchedPC.getSkillRanks('tumble') >= 5) synergy += 2;
    if (key === 'diplomacy' && patchedPC.getSkillRanks('bluff') >= 5) synergy += 2;
    if (key === 'disguise' && patchedPC.getSkillRanks('bluff') >= 5) synergy += 2;
    if (key === 'intimidate' && patchedPC.getSkillRanks('bluff') >= 5) synergy += 2;
    if (key === 'use_magic_device') {
      if (patchedPC.getSkillRanks('spellcraft') >= 5) synergy += 2;
      if (patchedPC.getSkillRanks('decipher_script') >= 5) synergy += 2;
    }
    if (synergy > 0) {
      lines.push(`• Synergie: ${formatMod(synergy)}`);
    }

    // Rüstungsmalus (ACP)
    if (skill.hasACP) {
      const acp = patchedPC.getArmorCheckPenalty();
      if (acp !== 0) {
        const penaltyVal = key === 'swim' ? -2 * acp : -acp;
        lines.push(`• Rüstungsmalus (ACP): ${formatMod(penaltyVal)}`);
      }
    }

    // Conditions (Zustände)
    const hasShaken = patchedPC.conditions.some((c: any) => c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd'));
    if (hasShaken) {
      lines.push(`• Zustand (Erschüttet): -2`);
    }

    return lines.join('\n');
  };

  // Würfeln
  const handleRollSkill = (key: string, skill: any, ranks: number, attrMod: number, misc: number, e: React.MouseEvent) => {
    const breakdown = [
      { label: `Ränge`, value: ranks },
      { label: `${skill.abl.toUpperCase()}-Mod`, value: attrMod }
    ];

    const featBonus = applyFeatSkillBonuses(patchedPC, key, skill);
    if (featBonus > 0) {
      breakdown.push({ label: 'Talentboni', value: featBonus });
    }

    const race = (patchedPC.race || 'human').toLowerCase();
    let racialBonus = 0;
    if (race === 'dwarf' && key === 'craft') racialBonus = 2;
    else if (race === 'elf' && ['listen', 'search', 'spot'].includes(key)) racialBonus = 2;
    else if (race === 'gnome' && ['listen', 'craft'].includes(key)) racialBonus = 2;
    else if (race === 'halfling' && ['climb', 'jump', 'move_silently', 'listen'].includes(key)) racialBonus = 2;
    else if (race === 'half_elf') {
      if (['listen', 'search', 'spot'].includes(key)) racialBonus = 1;
      if (['diplomacy', 'gather_information'].includes(key)) racialBonus = 2;
    }
    if (racialBonus > 0) {
      breakdown.push({ label: 'Volksbonus', value: racialBonus });
    }

    if (misc !== 0) {
      breakdown.push({ label: 'Sonstige Boni', value: misc });
    }

    // Synergien
    if (key === 'balance' && patchedPC.getSkillRanks('tumble') >= 5) breakdown.push({ label: 'Synergie (Akrobatik)', value: 2 });
    if (key === 'escape_artist' && patchedPC.getSkillRanks('tumble') >= 5) breakdown.push({ label: 'Synergie (Akrobatik)', value: 2 });
    if (key === 'diplomacy' && patchedPC.getSkillRanks('bluff') >= 5) breakdown.push({ label: 'Synergie (Bluffen)', value: 2 });
    if (key === 'disguise' && patchedPC.getSkillRanks('bluff') >= 5) breakdown.push({ label: 'Synergie (Bluffen)', value: 2 });
    if (key === 'intimidate' && patchedPC.getSkillRanks('bluff') >= 5) breakdown.push({ label: 'Synergie (Bluffen)', value: 2 });
    if (key === 'use_magic_device') {
      if (patchedPC.getSkillRanks('spellcraft') >= 5) breakdown.push({ label: 'Synergie (Zauberkunde)', value: 2 });
      if (patchedPC.getSkillRanks('decipher_script') >= 5) breakdown.push({ label: 'Synergie (Schriftzeichen)', value: 2 });
    }

    // ACP
    if (skill.hasACP) {
      const acp = patchedPC.getArmorCheckPenalty();
      if (acp !== 0) {
        const penaltyVal = key === 'swim' ? -2 * acp : -acp;
        breakdown.push({ label: 'Rüstungsmalus (ACP)', value: penaltyVal });
      }
    }

    // Conditions
    const hasShaken = patchedPC.conditions.some((c: any) => c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd'));
    if (hasShaken) {
      breakdown.push({ label: 'Zustand (Erschüttet)', value: -2 });
    }

    showRollBreakdown(`Fertigkeitswurf: ${skill.nameDe}`, '1W20', breakdown, e.nativeEvent);
  };

  const handleRanksChange = (key: string, val: string) => {
    let num = parseFloat(val);
    if (isNaN(num) || num < 0) num = 0;
    const maxRanks = CombatRules.getPCMaxRanks(key, patchedPC);
    if (num > maxRanks) num = maxRanks;

    CombatState.updatePCBatch((freshPC: any) => {
      if (!freshPC.skills) freshPC.skills = {};
      if (!freshPC.skills[key]) freshPC.skills[key] = { ranks: 0, misc: 0 };
      freshPC.skills[key].ranks = num;
    });
  };

  const handleMiscChange = (key: string, val: string) => {
    let num = parseInt(val);
    if (isNaN(num)) num = 0;

    CombatState.updatePCBatch((freshPC: any) => {
      if (!freshPC.skills) freshPC.skills = {};
      if (!freshPC.skills[key]) freshPC.skills[key] = { ranks: 0, misc: 0 };
      freshPC.skills[key].misc = num;
    });
  };

  // Liste der gefilterten & sortierten Skills
  const filteredSkillKeys = useMemo(() => {
    return Object.keys(SKILLS_REGISTRY).filter(key => {
      const skill = SKILLS_REGISTRY[key];
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = skill.nameDe.toLowerCase().includes(q) || key.includes(q);

      let matchesFilter = true;
      if (filterType === 'class') {
        matchesFilter = CombatRules.isClassSkill(key, patchedPC);
      } else if (filterType === 'trained') {
        matchesFilter = patchedPC.getSkillRanks(key) > 0;
      }

      return matchesQuery && matchesFilter;
    }).sort((a, b) => SKILLS_REGISTRY[a].nameDe.localeCompare(SKILLS_REGISTRY[b].nameDe));
  }, [searchQuery, filterType, patchedPC]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      
      {/* Such- & Filtersteuerung */}
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginBottom: '5px', background: 'rgba(0,0,0,0.02)', padding: '3px', borderRadius: '2px', border: '0.5px solid var(--pb)' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Fertigkeit suchen..."
          style={{ flex: 1, fontSize: '8px', height: '16px', padding: '0 4px' }}
          className="cinput"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="cinput"
          style={{ width: '75px', fontSize: '7.5px', height: '16px', padding: 0, outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">Alle Skills</option>
          <option value="class">Klassen-Skills</option>
          <option value="trained">Mit Rängen</option>
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
            height: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}
          title={`Verteilte Skillpunkte (SP): ${spentSP} von ${totalSP} verbraucht`}
        >
          {spentSP}/{totalSP} SP
        </span>
      </div>

      {/* Legende */}
      <div className="skills-legend" style={{ marginBottom: '5px', padding: '4px 6px', background: 'rgba(200, 169, 110, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '2px', fontSize: '7.5px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 'bold', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '8px' }}>Legende:</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5px' }}>
          <span style={{ fontSize: '6px', fontWeight: 'bold', color: '#1a5c1a', background: 'rgba(26,92,26,0.08)', padding: '0.5px 2px', borderRadius: '1px' }}>K</span>
          <span>Klassenfertigkeit</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5px' }}>
          <span style={{ fontSize: '6px', color: '#7c5c1d', background: 'rgba(200,169,110,0.08)', padding: '0.5px 2px', borderRadius: '1px' }}>KÜ</span>
          <span>Klassenübergreifend</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5px' }}>
          <span style={{ fontSize: '6px', color: 'var(--red)', background: 'rgba(139,26,26,0.08)', padding: '0.5px 2px', borderRadius: '1px', fontWeight: 'bold' }}>Geübt</span>
          <span>Trained Only (ungeübt nicht nutzbar)</span>
        </span>
      </div>

      {/* Fertigkeitsliste */}
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '380px', overflowY: 'auto', paddingRight: '2px' }} className="pc-scroll-skills">
        {filteredSkillKeys.length > 0 ? (
          filteredSkillKeys.map(key => {
            const skill = SKILLS_REGISTRY[key];
            const isClass = CombatRules.isClassSkill(key, patchedPC);
            const ranks = patchedPC.getSkillRanks(key);
            const misc = patchedPC.getSkillMisc(key);
            const maxRanks = CombatRules.getPCMaxRanks(key, patchedPC);
            const ranksExceeded = ranks > maxRanks;
            const totalMod = patchedPC.getSkillModifier(key);
            const attrMod = patchedPC.getAttributeMod(skill.abl);
            const isTrainedOnlyDisabled = skill.trainedOnly && ranks === 0;

            const hasSkillExtras = totalMod !== (ranks + attrMod + misc);

            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '3px 4px',
                  borderBottom: '0.5px solid rgba(200, 169, 110, 0.15)',
                  fontSize: '8px',
                  opacity: isTrainedOnlyDisabled ? 0.5 : 1
                }}
              >
                {/* Links: Dice Roll & Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3.5px', flex: 1.2, minWidth: 0 }}>
                  <button
                    disabled={isTrainedOnlyDisabled}
                    onClick={(e) => handleRollSkill(key, skill, ranks, attrMod, misc, e)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: '0 2px',
                      cursor: isTrainedOnlyDisabled ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      fontFamily: "'Crimson Text', serif",
                      fontSize: '9.5px',
                      fontWeight: 'bold',
                      color: 'var(--red)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2.5px',
                      opacity: isTrainedOnlyDisabled ? 0.4 : 1
                    }}
                    title={isTrainedOnlyDisabled ? 'Geübt (ungeübt nicht nutzbar)' : `Fertigkeitswurf für ${skill.nameDe} ausführen`}
                  >
                    🎲 <span style={{ borderBottom: '0.5px dashed rgba(139, 26, 26, 0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>{skill.nameDe}</span>
                  </button>
                  <span style={{ fontSize: '6.5px', color: 'var(--inkl)', flexShrink: 0 }}>({skill.abl.toUpperCase()})</span>
                  {isClass ? (
                    <span style={{ fontSize: '5.5px', fontWeight: 'bold', color: '#1a5c1a', background: 'rgba(26,92,26,0.08)', padding: '0.5px 2px', borderRadius: '1px', flexShrink: 0 }} title={`Klassenfertigkeit (Max. Ränge: ${maxRanks})`}>K</span>
                  ) : (
                    <span style={{ fontSize: '5.5px', color: '#7c5c1d', background: 'rgba(200,169,110,0.08)', padding: '0.5px 2px', borderRadius: '1px', flexShrink: 0 }} title={`Klassenübergreifend (Max. Ränge: ${maxRanks})`}>KÜ</span>
                  )}
                  {skill.trainedOnly && ranks === 0 && (
                    <span style={{ fontSize: '5.5px', color: 'var(--red)', background: 'rgba(139,26,26,0.08)', padding: '0.5px 2px', borderRadius: '1px', flexShrink: 0, fontWeight: 'bold' }} title="Trained Only">Geübt</span>
                  )}
                </div>

                {/* Mitte: Gesamtmodifikator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 0.5, justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '6px', color: 'var(--inkl)' }}>Gesamt:</span>
                  <span
                    style={{
                      fontWeight: 'bold',
                      color: 'var(--red)',
                      fontSize: '9px',
                      minWidth: '16px',
                      textAlign: 'left',
                      textDecoration: hasSkillExtras ? 'underline dotted var(--red)' : 'none',
                      cursor: 'help'
                    }}
                    title={getSkillTooltip(key, totalMod, ranks, attrMod, misc, skill)}
                  >
                    {formatMod(totalMod)}{hasSkillExtras ? ' *' : ''}
                  </span>
                </div>

                {/* Rechts: Eingaben */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, flex: 1.3, justifyContent: 'flex-end' }}>
                  {/* Ränge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                    <span style={{ fontSize: '6px', color: 'var(--inkl)' }}>Ränge:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={maxRanks}
                      value={ranks}
                      onChange={(e) => handleRanksChange(key, e.target.value)}
                      style={{
                        width: '22px',
                        fontSize: '8px',
                        height: '11px',
                        padding: 0,
                        textAlign: 'center',
                        borderRadius: '1px',
                        border: '0.5px solid var(--pb)',
                        outline: 'none',
                        background: ranksExceeded ? 'rgba(139, 26, 26, 0.08)' : 'white',
                        color: ranksExceeded ? 'var(--red)' : 'var(--ink)',
                        fontWeight: ranksExceeded ? 'bold' : 'normal',
                        borderColor: ranksExceeded ? 'var(--red)' : 'var(--pb)'
                      }}
                      title={`Erworbene Ränge (Max. erlaubt: ${maxRanks})`}
                    />
                  </div>

                  {/* Attribut (Readonly) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                    <span style={{ fontSize: '6px', color: 'var(--inkl)' }}>Attr:</span>
                    <input
                      type="text"
                      value={formatMod(attrMod)}
                      readOnly
                      style={{
                        width: '18px',
                        fontSize: '8px',
                        height: '11px',
                        padding: 0,
                        textAlign: 'center',
                        borderRadius: '1px',
                        border: '0.5px solid var(--pb)',
                        background: 'rgba(0,0,0,0.04)',
                        color: 'var(--inkm)',
                        cursor: 'not-allowed',
                        outline: 'none'
                      }}
                      tabIndex={-1}
                    />
                  </div>

                  {/* Sonstiges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                    <span style={{ fontSize: '6px', color: 'var(--inkl)' }}>Sonst:</span>
                    <input
                      type="number"
                      value={misc}
                      onChange={(e) => handleMiscChange(key, e.target.value)}
                      style={{
                        width: '16px',
                        fontSize: '8px',
                        height: '11px',
                        padding: 0,
                        textAlign: 'center',
                        borderRadius: '1px',
                        border: '0.5px solid var(--pb)',
                        outline: 'none'
                      }}
                      title="Sonstige Modifikatoren (z.B. Volksboni, Ausrüstung)"
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ fontSize: '8.5px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '25px 0' }}>
            Keine Fertigkeiten gefunden.
          </div>
        )}
      </div>
      
    </div>
  );
};
