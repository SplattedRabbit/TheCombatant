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

interface PCSkillsTabProps {
  pc: any; // Declared as any for runtime compatibility with dynamic prototype methods
}

export const PCSkillsTab: React.FC<PCSkillsTabProps> = ({ pc }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'class' | 'trained'>('all');
  const [tricksSearchQuery, setTricksSearchQuery] = useState('');
  const [tricksFilterCategory, setTricksFilterCategory] = useState<string>('all');
  const [selectedTrick, setSelectedTrick] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'skills' | 'tricks'>('skills');

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
      const score = stat ? (typeof stat.getValue === 'function' ? stat.getValue() : stat) : 10;
      return Math.floor((score - 10) / 2);
    };
    
    patched.getArmorCheckPenalty = () => {
      let acp = 0;
      if (Array.isArray(patched.armors)) {
        patched.armors.forEach((a: any) => {
          if (a.isEquipped) {
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

  // Calculate SP points
  const spentSP = CombatRules.calculateSpentSkillPoints(patchedPC);
  const totalSP = CombatRules.calculateTotalSkillPoints(patchedPC);
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
    const featBonus = applyFeatSkillBonuses(patchedPC, key, skill);
    if (featBonus > 0) {
      lines.push(`• Feat bonuses: ${formatMod(featBonus)}`);
    }

    // Racial bonuses
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
      lines.push(`• Racial bonus: ${formatMod(racialBonus)}`);
    }

    // Synergy effects
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
      lines.push(`• Synergy: ${formatMod(synergy)}`);
    }

    // Armor check penalty (ACP)
    if (skill.hasACP) {
      const acp = patchedPC.getArmorCheckPenalty();
      if (acp !== 0) {
        const penaltyVal = key === 'swim' ? -2 * acp : -acp;
        lines.push(`• Armor Check Penalty (ACP): ${formatMod(penaltyVal)}`);
      }
    }

    // Conditions
    const hasShaken = patchedPC.conditions.some((c: any) => c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd'));
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

    const featBonus = applyFeatSkillBonuses(patchedPC, key, skill);
    if (featBonus > 0) {
      breakdown.push({ label: 'Feat bonuses', value: featBonus });
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
      breakdown.push({ label: 'Racial bonus', value: racialBonus });
    }

    if (misc !== 0) {
      breakdown.push({ label: 'Misc bonuses', value: misc });
    }

    // Synergies
    if (key === 'balance' && patchedPC.getSkillRanks('tumble') >= 5) breakdown.push({ label: 'Synergy (Tumble)', value: 2 });
    if (key === 'escape_artist' && patchedPC.getSkillRanks('tumble') >= 5) breakdown.push({ label: 'Synergy (Tumble)', value: 2 });
    if (key === 'diplomacy' && patchedPC.getSkillRanks('bluff') >= 5) breakdown.push({ label: 'Synergy (Bluff)', value: 2 });
    if (key === 'disguise' && patchedPC.getSkillRanks('bluff') >= 5) breakdown.push({ label: 'Synergy (Bluff)', value: 2 });
    if (key === 'intimidate' && patchedPC.getSkillRanks('bluff') >= 5) breakdown.push({ label: 'Synergy (Bluff)', value: 2 });
    if (key === 'use_magic_device') {
      if (patchedPC.getSkillRanks('spellcraft') >= 5) breakdown.push({ label: 'Synergy (Spellcraft)', value: 2 });
      if (patchedPC.getSkillRanks('decipher_script') >= 5) breakdown.push({ label: 'Synergy (Decipher Script)', value: 2 });
    }

    // ACP
    if (skill.hasACP) {
      const acp = patchedPC.getArmorCheckPenalty();
      if (acp !== 0) {
        const penaltyVal = key === 'swim' ? -2 * acp : -acp;
        breakdown.push({ label: 'Armor Check Penalty (ACP)', value: penaltyVal });
      }
    }

    // Conditions
    const hasShaken = patchedPC.conditions.some((c: any) => c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd'));
    if (hasShaken) {
      breakdown.push({ label: 'Condition (Shaken)', value: -2 });
    }

    showRollBreakdown(`Skill check: ${skill.nameEn || skill.nameDe}`, '1d20', breakdown, e.nativeEvent);
  };

  const handleRanksChange = (key: string, val: string) => {
    let num = parseFloat(val);
    if (isNaN(num) || num < 0) num = 0;
    num = Math.floor(num); // No half ranks allowed

    const ranks = patchedPC.getSkillRanks(key);
    const isClass = CombatRules.isClassSkill(key, patchedPC);

    if (num > ranks) {
      const spentSP = CombatRules.calculateSpentSkillPoints(patchedPC);
      const totalSP = CombatRules.calculateTotalSkillPoints(patchedPC);
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

    const maxRanks = CombatRules.getPCMaxRanks(key, patchedPC);
    const maxAllowed = Math.floor(maxRanks);
    if (num > maxAllowed) num = maxAllowed;

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

  // Filter & sort skills list
  const filteredSkillKeys = useMemo(() => {
    return Object.keys(SKILLS_REGISTRY).filter(key => {
      const skill = SKILLS_REGISTRY[key];
      const q = searchQuery.toLowerCase().trim();
      const name = skill.nameEn || skill.nameDe;
      const matchesQuery = name.toLowerCase().includes(q) || key.includes(q);

      let matchesFilter = true;
      if (filterType === 'class') {
        matchesFilter = CombatRules.isClassSkill(key, patchedPC);
      } else if (filterType === 'trained') {
        matchesFilter = patchedPC.getSkillRanks(key) > 0;
      }

      return matchesQuery && matchesFilter;
    }).sort((a, b) => {
      const nameA = SKILLS_REGISTRY[a].nameEn || SKILLS_REGISTRY[a].nameDe;
      const nameB = SKILLS_REGISTRY[b].nameEn || SKILLS_REGISTRY[b].nameDe;
      return nameA.localeCompare(nameB);
    });
  }, [searchQuery, filterType, patchedPC]);

  const learnedTricks = patchedPC.skillTricks || [];
  const maxTricksLimit = CombatRules.getMaxSkillTricksLimit(patchedPC);

  const filteredTricks = useMemo(() => {
    return Object.values(SKILL_TRICKS_REGISTRY).filter((trick: any) => {
      const q = tricksSearchQuery.toLowerCase().trim();
      const matchesQuery = trick.nameDe.toLowerCase().includes(q) || trick.nameEn.toLowerCase().includes(q) || trick.key.includes(q);
      const matchesCategory = tricksFilterCategory === 'all' || trick.category === tricksFilterCategory;
      return matchesQuery && matchesCategory;
    }).sort((a: any, b: any) => a.nameDe.localeCompare(b.nameDe));
  }, [tricksSearchQuery, tricksFilterCategory]);

  return (
    <div className="panel" id="pcSkillsPanel" style={{ width: '100%' }}>
      {/* Sub-Tab Navigation Bar */}
      <div className="panel-tab-bar">
        <button
          onClick={() => setActiveSubTab('skills')}
          className={`sub-tab-btn ${activeSubTab === 'skills' ? 'active' : ''}`}
        >
          📔 Skills
        </button>
        <button
          onClick={() => setActiveSubTab('tricks')}
          className={`sub-tab-btn ${activeSubTab === 'tricks' ? 'active' : ''}`}
        >
          🎭 Skill Tricks ({learnedTricks.length} / {maxTricksLimit})
        </button>
      </div>

      {/* Sub-Tab Content */}
      <div className="pbody" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {activeSubTab === 'skills' ? (
        /* Tab 1: Skills List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginBottom: '5px', background: 'rgba(0,0,0,0.02)', padding: '3px', borderRadius: '2px', border: '0.5px solid var(--pb)' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill..."
              style={{ flex: 1, fontSize: '8px', height: '16px', padding: '0 4px' }}
              className="cinput"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="cinput"
              style={{ width: '75px', fontSize: '7.5px', height: '16px', padding: 0, outline: 'none', cursor: 'pointer' }}
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
                height: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                boxSizing: 'border-box'
              }}
              title={`Spent Skill Points (SP): ${spentSP} of ${totalSP} consumed`}
            >
              {spentSP}/{totalSP} SP
            </span>
          </div>

          {/* Legend */}
          <div className="skills-legend" style={{ marginBottom: '5px', padding: '4px 6px', background: 'rgba(200, 169, 110, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '2px', fontSize: '7.5px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
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
      ) : (
        /* Tab 2: Skill Tricks Panel */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--pb)', paddingBottom: '4px' }}>
            <h3 style={{ margin: 0, fontFamily: "'IM Fell English SC', serif", fontSize: '11px', color: '#8b1a1a', letterSpacing: '0.3px' }}>
              Skill Tricks
            </h3>
            <span style={{ fontSize: '7.5px', fontWeight: 'bold', background: 'rgba(25, 118, 210, 0.08)', color: '#1976d2', border: '0.5px solid #1976d2', padding: '1px 4px', borderRadius: '1.5px' }}>
              Tricks: {learnedTricks.length} / {maxTricksLimit}
            </span>
          </div>

          {/* Learned Tricks List */}
          <div style={{ background: 'rgba(0,0,0,0.01)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '6px', minHeight: '60px' }}>
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
                      onClick={() => {
                        setSelectedTrick({ ...trickDef, isLearned: true, isBonus });
                      }}
                      style={{
                        fontSize: '7.5px',
                        padding: '2px 5px',
                        borderRadius: '1.5px',
                        border: isBonus ? '0.5px solid #2a6a2a' : '0.5px solid var(--pb)',
                        background: isBonus ? 'rgba(42, 106, 42, 0.05)' : 'white',
                        color: isBonus ? '#2a6a2a' : 'var(--ink)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title={`${trickDef.nameEn || trickDef.nameDe} (${isBonus ? 'Bonus Trick' : 'Cost: 2 SP'}). Click for details.`}
                    >
                      🎭 {trickDef.nameEn || trickDef.nameDe} {isBonus && <span style={{ fontSize: '6px', color: '#2a6a2a' }}>★</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>No skill tricks learned.</div>
            )}
          </div>

          {/* Compendium (Available Tricks) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Filter tricks..."
                value={tricksSearchQuery}
                onChange={(e) => setTricksSearchQuery(e.target.value)}
                style={{ flex: 1, fontSize: '8px', height: '15px', padding: '0 3px' }}
                className="cinput"
              />
              <select
                value={tricksFilterCategory}
                onChange={(e) => setTricksFilterCategory(e.target.value)}
                className="cinput"
                style={{ width: '80px', fontSize: '7.5px', height: '15px', padding: 0 }}
              >
                <option value="all">All Categories</option>
                <option value="interaction">Interaction</option>
                <option value="manipulation">Manipulation</option>
                <option value="mental">Mental</option>
                <option value="movement">Movement</option>
              </select>
            </div>

            {/* Scrollable compendium tricks */}
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', paddingRight: '2px' }} className="pc-scroll-skills">
              {filteredTricks.map((trick: any) => {
                const isLearned = learnedTricks.some((lt: any) => (typeof lt === 'object' ? lt.id === trick.key : lt === trick.key));
                const isBonus = learnedTricks.some((lt: any) => typeof lt === 'object' && lt.id === trick.key && lt.isBonus);
                const { met } = CombatRules.checkSkillTrickPrerequisites(trick.key, patchedPC);
                
                return (
                  <div
                    key={trick.key}
                    onClick={() => {
                      setSelectedTrick({ ...trick, isLearned, isBonus });
                    }}
                    style={{
                      padding: '3px 4px',
                      border: isLearned ? '0.5px solid #1976d2' : '0.5px solid rgba(200, 169, 110, 0.25)',
                      background: isLearned ? 'rgba(25,118,210,0.03)' : (met ? 'rgba(42, 106, 42, 0.02)' : 'transparent'),
                      borderRadius: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: isLearned ? 1 : (met ? 0.9 : 0.6)
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                      <span style={{ fontSize: '8px', fontWeight: 'bold', color: isLearned ? '#1976d2' : 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {trick.nameEn || trick.nameDe}
                      </span>
                      <span style={{ fontSize: '6px', color: 'var(--inkl)' }}>
                        {trick.category.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                      {isLearned ? (
                        <span style={{ fontSize: '7px', color: '#1976d2', fontWeight: 'bold' }}>Learned</span>
                      ) : (
                        <span style={{ fontSize: '7px', color: met ? '#2a6a2a' : '#8b1a1a', fontWeight: 'bold' }}>
                          {met ? 'Met' : '🔒 Locked'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Details Popup */}
      {selectedTrick && (
        <SkillTrickDetailsDialog
          trick={selectedTrick}
          pc={patchedPC}
          isLearned={selectedTrick.isLearned}
          isBonus={selectedTrick.isBonus}
          onClose={() => setSelectedTrick(null)}
        />
      )}
    </div>
  );
};
