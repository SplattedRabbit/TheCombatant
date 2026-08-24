/**
 * @module    PCSkillsTab
 * @summary   Renders the D&D 3.5e skill list (Skills Tab) with search & filter functionality, SP badge, ranks and detailed modifier tooltip.
 * @exports   PCSkillsTab
 * @reads     pc.skills, pc.classes, pc.race, pc.feats, pc.conditions, pc.armor
 * @stateOps  updatePCBatch
 * @depends   React, @core/state.js, @core/rules.js, @core/data/skills-data.js, @core/models/helpers/skills/CombatantSkills.js, @core/models/helpers/skills/SkillFeatApplier.js, @core/ui/components/dialogs.js
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
import { showRollBreakdown, showCustomAlert } from '@core/ui/components/dialogs.js';
// @ts-ignore
import { SKILL_TRICKS_REGISTRY } from '@core/data/skillTricks-data.js';
import { SkillTrickDetailsDialog } from '../dialogs/SkillTrickDetailsDialog';
import { formatMod, getStatMod } from './attributeHelper';

function getSkillRanks(pc: any, key: string): number {
  return (pc?.skills && pc.skills[key]) ? parseFloat(pc.skills[key].ranks) || 0 : 0;
}

function getSkillMisc(pc: any, key: string): number {
  return (pc?.skills && pc.skills[key]) ? parseInt(pc.skills[key].misc, 10) || 0 : 0;
}

function getArmorCheckPenalty(pc: any): number {
  let acp = 0;
  if (Array.isArray(pc?.armors)) {
    pc.armors.forEach((a: any) => {
      if (a.isEquipped) {
        acp += (parseInt(a.checkPenaltyOverride, 10) || parseInt(a.checkPenalty, 10) || 0);
      }
    });
  }
  return acp;
}

function getSkillMod(pc: any, key: string): number {
  if (typeof pc?.getSkillModifier === 'function') {
    return pc.getSkillModifier(key);
  }
  return calculateSkillModifier(pc, key);
}

interface PCSkillsTabProps {
  pc: any;
}

export const PCSkillsTab: React.FC<PCSkillsTabProps> = ({ pc }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'class' | 'trained'>('all');
  const [tricksSearchQuery, setTricksSearchQuery] = useState('');
  const [tricksFilterCategory, setTricksFilterCategory] = useState<string>('all');
  const [selectedTrick, setSelectedTrick] = useState<any>(null);
  const [focusedRanksKey, setFocusedRanksKey] = useState<string | null>(null);
  const [focusedRanksVal, setFocusedRanksVal] = useState<string>('');
  const [focusedMiscKey, setFocusedMiscKey] = useState<string | null>(null);
  const [focusedMiscVal, setFocusedMiscVal] = useState<string>('');

  if (!pc) return null;

  // Calculate SP points
  const spentSP = CombatRules.calculateSpentSkillPoints(pc);
  const totalSP = CombatRules.calculateTotalSkillPoints(pc);
  const isOverspent = spentSP > totalSP;
  const badgeBg = isOverspent ? 'rgba(139, 26, 26, 0.15)' : 'rgba(139, 26, 26, 0.08)';
  const badgeBorderColor = isOverspent ? 'var(--red)' : 'var(--pb)';

  // Generate tooltip for breakdown
  const getSkillTooltip = (key: string, totalMod: number, ranks: number, attrMod: number, misc: number, skill: any) => {
    const lines = [`Total Modifier: ${formatMod(totalMod)}`];
    lines.push(`• Ranks: ${ranks}`);
    lines.push(`• ${skill.abl.toUpperCase()}-Mod: ${formatMod(attrMod)}`);
    
    if (misc !== 0) {
      lines.push(`• Misc (base value): ${formatMod(misc)}`);
    }

    // Feat bonuses
    const featBonus = applyFeatSkillBonuses(pc, key, skill);
    if (featBonus > 0) {
      lines.push(`• Feat bonuses: ${formatMod(featBonus)}`);
    }

    // Racial bonuses
    const race = (pc.race || 'human').toLowerCase();
    let racialBonus = 0;
    if (race === 'dwarf' && key === 'craft') racialBonus = 2;
    else if (race === 'elf' && ['listen', 'search', 'spot'].includes(key)) racialBonus = 2;
    else if (race === 'gnome' && ['listen', 'craft'].includes(key)) racialBonus = 2;
    else if (race === 'halfling' && ['climb', 'jump', 'move_silently', 'listen'].includes(key)) racialBonus = 2;
    else if (race === 'deep_halfling' && ['listen', 'appraise', 'craft', 'search'].includes(key)) racialBonus = 2;
    else if (race === 'half_elf') {
      if (['listen', 'search', 'spot'].includes(key)) racialBonus = 1;
      if (['diplomacy', 'gather_information'].includes(key)) racialBonus = 2;
    }
    if (racialBonus > 0) {
      lines.push(`• Racial bonus: ${formatMod(racialBonus)}`);
    }

    // Synergy effects
    let synergy = 0;
    if (key === 'balance' && getSkillRanks(pc, 'tumble') >= 5) synergy += 2;
    if (key === 'escape_artist' && getSkillRanks(pc, 'tumble') >= 5) synergy += 2;
    if (key === 'diplomacy' && getSkillRanks(pc, 'bluff') >= 5) synergy += 2;
    if (key === 'disguise' && getSkillRanks(pc, 'bluff') >= 5) synergy += 2;
    if (key === 'intimidate' && getSkillRanks(pc, 'bluff') >= 5) synergy += 2;
    if (key === 'use_magic_device') {
      if (getSkillRanks(pc, 'spellcraft') >= 5) synergy += 2;
      if (getSkillRanks(pc, 'decipher_script') >= 5) synergy += 2;
    }
    if (synergy > 0) {
      lines.push(`• Synergy: ${formatMod(synergy)}`);
    }

    // Armor check penalty (ACP)
    if (skill.hasACP) {
      const acp = getArmorCheckPenalty(pc);
      if (acp !== 0) {
        const penaltyVal = key === 'swim' ? -2 * acp : -acp;
        lines.push(`• Armor Check Penalty (ACP): ${formatMod(penaltyVal)}`);
      }
    }

    // Conditions
    const hasShaken = (pc.conditions || []).some((c: any) => c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd'));
    if (hasShaken) {
      lines.push(`• Condition (Shaken): -2`);
    }

    return lines.join('\n');
  };

  // Roll skill
  const handleRollSkill = (key: string, skill: any, ranks: number, attrMod: number, misc: number, e: React.MouseEvent) => {
    const breakdown = [
      { label: `Ranks`, value: ranks },
      { label: `${skill.abl.toUpperCase()}-Mod`, value: attrMod }
    ];

    const featBonus = applyFeatSkillBonuses(pc, key, skill);
    if (featBonus > 0) {
      breakdown.push({ label: 'Feat bonuses', value: featBonus });
    }

    const race = (pc.race || 'human').toLowerCase();
    let racialBonus = 0;
    if (race === 'dwarf' && key === 'craft') racialBonus = 2;
    else if (race === 'elf' && ['listen', 'search', 'spot'].includes(key)) racialBonus = 2;
    else if (race === 'gnome' && ['listen', 'craft'].includes(key)) racialBonus = 2;
    else if (race === 'halfling' && ['climb', 'jump', 'move_silently', 'listen'].includes(key)) racialBonus = 2;
    else if (race === 'deep_halfling' && ['listen', 'appraise', 'craft', 'search'].includes(key)) racialBonus = 2;
    else if (race === 'half_elf') {
      if (['listen', 'search', 'spot'].includes(key)) racialBonus = 1;
      if (['diplomacy', 'gather_information'].includes(key)) racialBonus = 2;
    }
    if (racialBonus > 0) {
      breakdown.push({ label: 'Racial bonus', value: racialBonus });
    }

    if (misc !== 0) {
      breakdown.push({ label: 'Misc bonuses', value: misc });
    }

    // Synergies
    if (key === 'balance' && getSkillRanks(pc, 'tumble') >= 5) breakdown.push({ label: 'Synergy (Tumble)', value: 2 });
    if (key === 'escape_artist' && getSkillRanks(pc, 'tumble') >= 5) breakdown.push({ label: 'Synergy (Tumble)', value: 2 });
    if (key === 'diplomacy' && getSkillRanks(pc, 'bluff') >= 5) breakdown.push({ label: 'Synergy (Bluff)', value: 2 });
    if (key === 'disguise' && getSkillRanks(pc, 'bluff') >= 5) breakdown.push({ label: 'Synergy (Bluff)', value: 2 });
    if (key === 'intimidate' && getSkillRanks(pc, 'bluff') >= 5) breakdown.push({ label: 'Synergy (Bluff)', value: 2 });
    if (key === 'use_magic_device') {
      if (getSkillRanks(pc, 'spellcraft') >= 5) breakdown.push({ label: 'Synergy (Spellcraft)', value: 2 });
      if (getSkillRanks(pc, 'decipher_script') >= 5) breakdown.push({ label: 'Synergy (Decipher Script)', value: 2 });
    }

    // ACP
    if (skill.hasACP) {
      const acp = getArmorCheckPenalty(pc);
      if (acp !== 0) {
        const penaltyVal = key === 'swim' ? -2 * acp : -acp;
        breakdown.push({ label: 'Armor Check Penalty (ACP)', value: penaltyVal });
      }
    }

    // Conditions
    const hasShaken = (pc.conditions || []).some((c: any) => c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd'));
    if (hasShaken) {
      breakdown.push({ label: 'Condition (Shaken)', value: -2 });
    }

    showRollBreakdown(`Skill check: ${skill.nameEn || skill.nameDe}`, '1d20', breakdown, e.nativeEvent);
  };

  const handleRanksChange = (key: string, val: string) => {
    let num = parseFloat(val);
    if (isNaN(num) || num < 0) num = 0;
    num = Math.floor(num); // No half ranks allowed

    const ranks = getSkillRanks(pc, key);
    const isClass = CombatRules.isClassSkill(key, pc);

    if (num > ranks) {
      const spentSP = CombatRules.calculateSpentSkillPoints(pc);
      const totalSP = CombatRules.calculateTotalSkillPoints(pc);
      const freeSP = totalSP - spentSP;
      const cost = (num - ranks) * (isClass ? 1 : 2);

      if (freeSP < cost) {
        if (!isClass && freeSP === 1) {
          showCustomAlert(
            "Aktion nicht möglich",
            "Es ist nicht möglich, einen einzelnen verbleibenden Skillpunkt für eine klassenfremde Fertigkeit auszugeben. Sie benötigen mindestens 2 freie Skillpunkte, da klassenfremde Fertigkeiten 2 Skillpunkte pro Rang kosten.",
            "OK",
            "📝"
          );
        } else {
          showCustomAlert(
            "Nicht genügend Skillpunkte",
            `Sie haben nicht genügend freie Skillpunkte (${freeSP} vorhanden, ${cost} benötigt).`,
            "OK",
            "📝"
          );
        }
        return;
      }
    }

    const maxRanks = CombatRules.getPCMaxRanks(key, pc);
    const maxAllowed = Math.floor(maxRanks);
    if (num > maxAllowed) num = maxAllowed;

    CombatState.updatePCBatch((freshPC: any) => {
      if (!freshPC.skills) freshPC.skills = {};
      if (!freshPC.skills[key]) freshPC.skills[key] = { ranks: 0, misc: 0 };
      freshPC.skills[key].ranks = num;
    });
  };

  const handleMiscChange = (key: string, val: string) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 0;

    CombatState.updatePCBatch((freshPC: any) => {
      if (!freshPC.skills) freshPC.skills = {};
      if (!freshPC.skills[key]) freshPC.skills[key] = { ranks: 0, misc: 0 };
      freshPC.skills[key].misc = num;
    });
  };

  // Filter & sort skills list
  const filteredSkillKeys = useMemo(() => {
    return Object.keys(SKILLS_REGISTRY).filter(key => {
      const skill = SKILLS_REGISTRY[key];
      const q = searchQuery.toLowerCase().trim();
      const name = skill.nameEn || skill.nameDe;
      const matchesQuery = name.toLowerCase().includes(q) || key.includes(q);

      let matchesFilter = true;
      if (filterType === 'class') {
        matchesFilter = CombatRules.isClassSkill(key, pc);
      } else if (filterType === 'trained') {
        matchesFilter = getSkillRanks(pc, key) > 0;
      }

      return matchesQuery && matchesFilter;
    }).sort((a, b) => {
      const nameA = SKILLS_REGISTRY[a].nameEn || SKILLS_REGISTRY[a].nameDe;
      const nameB = SKILLS_REGISTRY[b].nameEn || SKILLS_REGISTRY[b].nameDe;
      return nameA.localeCompare(nameB);
    });
  }, [searchQuery, filterType, pc]);

  const learnedTricks = pc.skillTricks || [];
  const maxTricksLimit = CombatRules.getMaxSkillTricksLimit(pc);

  const filteredTricks = useMemo(() => {
    return Object.values(SKILL_TRICKS_REGISTRY).filter((trick: any) => {
      const q = tricksSearchQuery.toLowerCase().trim();
      const matchesQuery = trick.nameDe.toLowerCase().includes(q) || trick.nameEn.toLowerCase().includes(q) || trick.key.includes(q);
      const matchesCategory = tricksFilterCategory === 'all' || trick.category === tricksFilterCategory;
      return matchesQuery && matchesCategory;
    }).sort((a: any, b: any) => (a.nameEn || a.nameDe).localeCompare(b.nameEn || b.nameDe));
  }, [tricksSearchQuery, tricksFilterCategory]);

  return (
    <div className="panel" id="pcSkillsPanel" style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <div className="phdr">
        <h2>📜 Skills &amp; Skill Tricks</h2>
      </div>

      <div className="pbody" style={{ minWidth: 0, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '10px', width: '100%', minWidth: 0, boxSizing: 'border-box', minHeight: '380px' }}>
          {/* Left Column: Skills (60%) */}
          <div style={{ flex: '6 1 0%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', borderRight: '0.5px solid var(--pb)', paddingRight: '8px', boxSizing: 'border-box' }}>
            <h3 style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', color: 'var(--red)', borderBottom: '1px solid var(--pb)', paddingBottom: '2px', margin: '0 0 4px 0', fontWeight: 'bold', textAlign: 'center' }}>
              📔 Skills
            </h3>

            {/* Search & Filter Controls */}
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginBottom: '4px', background: 'rgba(0,0,0,0.02)', padding: '3px', borderRadius: '2px', border: '0.5px solid var(--pb)', minWidth: 0 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skill..."
                style={{ flex: 1, fontSize: '8.5px', height: '18px', padding: '0 4px', minWidth: 0 }}
                className="cinput"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
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
                  flexShrink: 0
                }}
                title={`Spent Skill Points (SP): ${spentSP} of ${totalSP} consumed`}
              >
                {spentSP}/{totalSP} SP
              </span>
            </div>

            {/* Legend */}
            <div className="skills-legend" style={{ marginBottom: '4px', padding: '4px 6px', background: 'rgba(200, 169, 110, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '2px', fontSize: '7.5px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '8px' }}>Legend:</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5px' }}>
                <span style={{ fontSize: '6px', fontWeight: 'bold', color: '#1a5c1a', background: 'rgba(26,92,26,0.08)', padding: '0.5px 2px', borderRadius: '1px' }}>C</span>
                <span>Class Skill</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5px' }}>
                <span style={{ fontSize: '6px', color: '#7c5c1d', background: 'rgba(200,169,110,0.08)', padding: '0.5px 2px', borderRadius: '1px' }}>CC</span>
                <span>Cross-Class</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5px' }}>
                <span style={{ fontSize: '6px', color: 'var(--red)', background: 'rgba(139,26,26,0.08)', padding: '0.5px 2px', borderRadius: '1px', fontWeight: 'bold' }}>Trained</span>
                <span>Trained Only</span>
              </span>
            </div>

            {/* Skills list */}
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '360px', overflowY: 'auto', paddingRight: '2px', minWidth: 0 }} className="pc-scroll-skills">
              {filteredSkillKeys.length > 0 ? (
                filteredSkillKeys.map(key => {
                  const skill = SKILLS_REGISTRY[key];
                  const isClass = CombatRules.isClassSkill(key, pc);
                  const ranks = getSkillRanks(pc, key);
                  const misc = getSkillMisc(pc, key);
                  const maxRanks = CombatRules.getPCMaxRanks(key, pc);
                  const ranksExceeded = ranks > maxRanks;
                  const totalMod = getSkillMod(pc, key);
                  const attrMod = getStatMod((pc as any)[skill.abl]);
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
                      {/* Left: Dice Roll & Info */}
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
                          title={isTrainedOnlyDisabled ? 'Trained Only (cannot be used untrained)' : `Roll skill check for ${skill.nameEn || skill.nameDe}`}
                        >
                          🎲 <span style={{ borderBottom: '0.5px dashed rgba(139, 26, 26, 0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>{skill.nameEn || skill.nameDe}</span>
                        </button>
                        <span style={{ fontSize: '6.5px', color: 'var(--inkl)', flexShrink: 0 }}>({skill.abl.toUpperCase()})</span>
                        {isClass ? (
                          <span style={{ fontSize: '5.5px', fontWeight: 'bold', color: '#1a5c1a', background: 'rgba(26,92,26,0.08)', padding: '0.5px 2px', borderRadius: '1px', flexShrink: 0 }} title={`Class Skill (Max Ranks: ${maxRanks})`}>C</span>
                        ) : (
                          <span style={{ fontSize: '5.5px', color: '#7c5c1d', background: 'rgba(200,169,110,0.08)', padding: '0.5px 2px', borderRadius: '1px', flexShrink: 0 }} title={`Cross-Class (Max Ranks: ${maxRanks})`}>CC</span>
                        )}
                        {skill.trainedOnly && ranks === 0 && (
                          <span style={{ fontSize: '5.5px', color: 'var(--red)', background: 'rgba(139,26,26,0.08)', padding: '0.5px 2px', borderRadius: '1px', flexShrink: 0, fontWeight: 'bold' }} title="Trained Only">Trained</span>
                        )}
                      </div>

                      {/* Center: Total Modifier */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 0.5, justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '6px', color: 'var(--inkl)' }}>Total:</span>
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

                      {/* Right: Inputs */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, flex: 1.3, justifyContent: 'flex-end' }}>
                        {/* Ranks */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                          <span style={{ fontSize: '6px', color: 'var(--inkl)' }}>Ranks:</span>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max={Math.floor(maxRanks)}
                            value={focusedRanksKey === key ? focusedRanksVal : ranks}
                            onFocus={() => {
                              setFocusedRanksKey(key);
                              setFocusedRanksVal(ranks === 0 ? '' : String(ranks));
                            }}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFocusedRanksVal(val);
                              if (val !== '') {
                                handleRanksChange(key, val);
                              }
                            }}
                            onBlur={() => {
                              if (focusedRanksVal === '' || isNaN(parseFloat(focusedRanksVal))) {
                                handleRanksChange(key, '0');
                              }
                              setFocusedRanksKey(null);
                              setFocusedRanksVal('');
                            }}
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
                            title={`Acquired Ranks (Max allowed: ${Math.floor(maxRanks)})`}
                          />
                        </div>

                        {/* Attribute (Readonly) */}
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

                        {/* Misc */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                          <span style={{ fontSize: '6px', color: 'var(--inkl)' }}>Misc:</span>
                          <input
                            type="number"
                            value={focusedMiscKey === key ? focusedMiscVal : misc}
                            onFocus={() => {
                              setFocusedMiscKey(key);
                              setFocusedMiscVal(misc === 0 ? '' : String(misc));
                            }}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFocusedMiscVal(val);
                              if (val !== '' && val !== '-') {
                                handleMiscChange(key, val);
                              }
                            }}
                            onBlur={() => {
                              if (focusedMiscVal === '' || focusedMiscVal === '-' || isNaN(parseInt(focusedMiscVal))) {
                                handleMiscChange(key, '0');
                              }
                              setFocusedMiscKey(null);
                              setFocusedMiscVal('');
                            }}
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
                            title="Other modifiers (e.g. racial bonuses, equipment)"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: '8.5px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '25px 0' }}>
                  No skills found.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Skill Tricks (40%) */}
          <div style={{ flex: '4 1 0%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', boxSizing: 'border-box' }}>
            <h3 style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', color: 'var(--red)', borderBottom: '1px solid var(--pb)', paddingBottom: '2px', margin: '0 0 4px 0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🎭 Skill Tricks</span>
              <span style={{ fontSize: '8px', fontWeight: 'bold', background: 'rgba(200, 169, 110, 0.15)', color: '#7c5a2b', border: '0.5px solid var(--pb)', padding: '1px 4px', borderRadius: '1.5px' }}>
                {learnedTricks.length} / {maxTricksLimit}
              </span>
            </h3>

            {/* Learned Tricks Box */}
            <div style={{ background: 'rgba(0,0,0,0.01)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '5px', minHeight: '48px', boxSizing: 'border-box', minWidth: 0 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '7.5px', color: 'var(--inkm)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Learned Tricks
              </h4>
              {learnedTricks.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {learnedTricks.map((t: any) => {
                    const trickId = typeof t === 'object' ? t.id : t;
                    const isBonus = typeof t === 'object' ? !!t.isBonus : false;
                    const trickDef = SKILL_TRICKS_REGISTRY[trickId];
                    if (!trickDef) return null;

                    return (
                      <div
                        key={trickId}
                        style={{
                          background: 'rgba(50, 115, 55, 0.06)',
                          border: '0.5px solid rgba(50, 115, 55, 0.35)',
                          borderLeft: '2.5px solid #2e7d32',
                          borderRadius: '2px',
                          padding: '2px 5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '8px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedTrick({ ...trickDef, isLearned: true, isBonus })}
                      >
                        <span style={{ fontWeight: 'bold', color: '#245e28' }}>
                          {trickDef.nameEn || trickDef.nameDe}
                        </span>
                        {isBonus && (
                          <span style={{ fontSize: '6.5px', color: '#2e7d32', fontWeight: 'bold' }}>
                            (Bonus)
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            CombatState.removePCSkillTrick(trickId);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#245e28',
                            fontSize: '8px',
                            padding: '0 2px',
                            lineHeight: 1
                          }}
                          title="Remove Skill Trick"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>
                  No skill tricks learned yet.
                </div>
              )}
            </div>

            {/* Filter Tabs & Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', margin: '4px 0 2px 0' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {(['all', 'interaction', 'movement', 'manipulation', 'mental'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTricksFilterCategory(cat)}
                    style={{
                      flex: 1,
                      fontSize: '7.5px',
                      fontFamily: "'IM Fell English SC', serif",
                      padding: '2px 0',
                      border: tricksFilterCategory === cat ? '1px solid var(--red)' : '0.5px solid var(--pb)',
                      background: tricksFilterCategory === cat ? 'var(--red)' : 'transparent',
                      color: tricksFilterCategory === cat ? '#fff' : 'var(--inkm)',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={tricksSearchQuery}
                onChange={(e) => setTricksSearchQuery(e.target.value)}
                placeholder="Search trick..."
                className="cinput"
                style={{ fontSize: '8px', height: '18px', padding: '0 4px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Trick Compendium List */}
            <div
              style={{
                flex: 1,
                minHeight: '140px',
                maxHeight: '220px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                border: '0.5px dashed rgba(200, 169, 110, 0.3)',
                borderRadius: '2px',
                padding: '4px',
                boxSizing: 'border-box'
              }}
              className="pc-scroll-skills"
            >
              {filteredTricks.map((trick: any) => {
                const isLearned = learnedTricks.some((lt: any) => (typeof lt === 'object' ? lt.id === trick.key : lt === trick.key));
                const isBonus = learnedTricks.some((lt: any) => typeof lt === 'object' && lt.id === trick.key && lt.isBonus);
                const { met } = CombatRules.checkSkillTrickPrerequisites(trick.key, pc);
                const spentSP = CombatRules.calculateSpentSkillPoints(pc);
                const totalSP = CombatRules.calculateTotalSkillPoints(pc);
                const freeSkillPoints = Math.max(0, totalSP - spentSP);
                const hasEnoughSP = freeSkillPoints >= 2;

                // 4-state color scheme:
                // 1. Ausgegraut: Nicht verfügbar (!met)
                // 2. Leichtes Rot: Verfügbar aber nicht genügend Skillpunkte frei (met && !hasEnoughSP)
                // 3. Gelb: Verfügbar und genügend Skillpunkte (met && hasEnoughSP)
                // 4. Grün: Gelernt (isLearned)
                let borderStyle = '0.5px dashed rgba(140, 130, 120, 0.35)';
                let borderLeftStyle = '2.5px solid rgba(140, 130, 120, 0.4)';
                let bgStyle = 'rgba(0, 0, 0, 0.015)';
                let titleColor = 'var(--inkl)';
                let opacityVal = 0.48;

                if (isLearned) {
                  borderStyle = '0.5px solid rgba(50, 115, 55, 0.35)';
                  borderLeftStyle = '3.5px solid #2e7d32';
                  bgStyle = 'rgba(50, 115, 55, 0.06)';
                  titleColor = '#245e28';
                  opacityVal = 1;
                } else if (met) {
                  if (hasEnoughSP) {
                    borderStyle = '0.5px solid rgba(184, 134, 11, 0.4)';
                    borderLeftStyle = '3px solid #b8860b';
                    bgStyle = 'rgba(212, 175, 55, 0.07)';
                    titleColor = '#7d5f1a';
                    opacityVal = 1;
                  } else {
                    borderStyle = '0.5px solid rgba(139, 26, 26, 0.35)';
                    borderLeftStyle = '3px solid var(--red)';
                    bgStyle = 'rgba(139, 26, 26, 0.04)';
                    titleColor = 'var(--red)';
                    opacityVal = 0.9;
                  }
                }

                return (
                  <div
                    key={trick.key}
                    onClick={() => {
                      setSelectedTrick({ ...trick, isLearned, isBonus });
                    }}
                    style={{
                      padding: '3.5px 6px',
                      border: borderStyle,
                      borderLeft: borderLeftStyle,
                      background: bgStyle,
                      boxShadow: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: opacityVal,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                      <span style={{ fontSize: '8.5px', fontWeight: met || isLearned ? 'bold' : '600', color: titleColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {trick.nameEn || trick.nameDe}
                      </span>
                      <span style={{ fontSize: '6.5px', color: met || isLearned ? 'var(--inkm)' : 'var(--inkl)' }}>
                        {trick.category.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                      {isLearned ? (
                        <span style={{ fontSize: '7px', color: '#245e28', fontWeight: 'bold', background: 'rgba(50, 115, 55, 0.12)', border: '0.5px solid rgba(50, 115, 55, 0.35)', padding: '1px 3px', borderRadius: '1.5px' }}>✓ Learned</span>
                      ) : met ? (
                        hasEnoughSP ? (
                          <span style={{ fontSize: '7px', color: '#7d5f1a', fontWeight: 'bold', background: 'rgba(212, 175, 55, 0.15)', border: '0.5px solid rgba(184, 134, 11, 0.4)', padding: '1px 3px', borderRadius: '1.5px' }}>Available</span>
                        ) : (
                          <span style={{ fontSize: '7px', color: 'var(--red)', fontWeight: 'bold', background: 'rgba(139, 26, 26, 0.08)', border: '0.5px solid rgba(139, 26, 26, 0.25)', padding: '1px 3px', borderRadius: '1.5px' }}>Need 2 SP</span>
                        )
                      ) : (
                        <span style={{ fontSize: '7px', color: '#7a7065', fontWeight: 'bold', background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.12)', padding: '1px 3px', borderRadius: '1.5px' }}>🔒 Locked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Details Popup */}
      {selectedTrick && (
        <SkillTrickDetailsDialog
          trick={selectedTrick}
          pc={pc}
          isLearned={selectedTrick.isLearned}
          isBonus={selectedTrick.isBonus}
          onClose={() => setSelectedTrick(null)}
        />
      )}
    </div>
  );
};
