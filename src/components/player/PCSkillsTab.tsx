/**
 * @module    PCSkillsTab
 * @summary   Renders the D&D 3.5e skill list (Skills Tab) with search & filter functionality, SP badge, ranks and detailed modifier tooltip.
 *            Modularized with dedicated sub-components: SkillFilterBar, SkillsLegend, SkillRow, and SkillTricksSubPanel.
 * @exports   PCSkillsTab
 * @reads     pc.skills, pc.classes, pc.race, pc.feats, pc.conditions, pc.armor
 * @stateOps  updatePCBatch
 */

import React, { useState, useMemo } from 'react';
import { CombatState } from '@core/state.js';
import { CombatRules } from '@core/rules.js';
import { SKILLS_REGISTRY } from '@core/data/skills-data.js';
import { calculateSkillModifier } from '@core/models/helpers/skills/CombatantSkills.js';
import { applyFeatSkillBonuses } from '@core/models/helpers/skills/SkillFeatApplier.js';
import { showRollBreakdown, showCustomAlert } from '@core/ui/components/dialogs.js';
import { formatMod, getStatMod } from './attributeHelper';
import { SkillFilterBar } from './skills/SkillFilterBar';
import { SkillsLegend } from './skills/SkillsLegend';
import { SkillRow } from './skills/SkillRow';
import { SkillTricksSubPanel } from './skills/SkillTricksSubPanel';

export function getSkillRanks(pc: any, key: string): number {
  return pc?.skills && pc.skills[key] ? parseFloat(pc.skills[key].ranks) || 0 : 0;
}

export function getSkillMisc(pc: any, key: string): number {
  return pc?.skills && pc.skills[key] ? parseInt(pc.skills[key].misc, 10) || 0 : 0;
}

export function getArmorCheckPenalty(pc: any): number {
  let acp = 0;
  if (Array.isArray(pc?.armors)) {
    pc.armors.forEach((a: any) => {
      if (a.isEquipped) {
        acp += parseInt(a.checkPenaltyOverride, 10) || parseInt(a.checkPenalty, 10) || 0;
      }
    });
  }
  return acp;
}

export function getSkillMod(pc: any, key: string): number {
  if (typeof pc?.getSkillModifier === 'function') {
    return pc.getSkillModifier(key);
  }
  return calculateSkillModifier(pc, key);
}

export interface PCSkillsTabProps {
  pc: any;
}

export const PCSkillsTab: React.FC<PCSkillsTabProps> = ({ pc }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'class' | 'trained'>('all');
  const [focusedRanksKey, setFocusedRanksKey] = useState<string | null>(null);
  const [focusedRanksVal, setFocusedRanksVal] = useState<string>('');
  const [focusedMiscKey, setFocusedMiscKey] = useState<string | null>(null);
  const [focusedMiscVal, setFocusedMiscVal] = useState<string>('');

  if (!pc) return null;

  // Calculate SP points
  const spentSP = CombatRules.calculateSpentSkillPoints(pc);
  const totalSP = CombatRules.calculateTotalSkillPoints(pc);

  // Generate tooltip for breakdown
  const getSkillTooltip = (
    key: string,
    totalMod: number,
    ranks: number,
    attrMod: number,
    misc: number,
    skill: any,
  ) => {
    const lines = [`Total Modifier: ${formatMod(totalMod)}`];
    lines.push(`• Ranks: ${ranks}`);
    lines.push(`• ${skill.abl.toUpperCase()}-Mod: ${formatMod(attrMod)}`);

    if (misc !== 0) {
      lines.push(`• Misc (base value): ${formatMod(misc)}`);
    }

    const featBonus = applyFeatSkillBonuses(pc, key, skill);
    if (featBonus > 0) {
      lines.push(`• Feat bonuses: ${formatMod(featBonus)}`);
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
      lines.push(`• Racial bonus: ${formatMod(racialBonus)}`);
    }

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

    if (skill.hasACP) {
      const acp = getArmorCheckPenalty(pc);
      if (acp !== 0) {
        const penaltyVal = key === 'swim' ? -2 * acp : -acp;
        lines.push(`• Armor Check Penalty (ACP): ${formatMod(penaltyVal)}`);
      }
    }

    const hasShaken = (pc.conditions || []).some(
      (c: any) =>
        c === 'Erschüttet' ||
        (c && c.n === 'Erschüttet') ||
        c === 'Schüttelnd' ||
        (c && c.n === 'Schüttelnd'),
    );
    if (hasShaken) {
      lines.push(`• Condition (Shaken): -2`);
    }

    return lines.join('\n');
  };

  // Roll skill
  const handleRollSkill = (
    key: string,
    skill: any,
    ranks: number,
    attrMod: number,
    misc: number,
    e: React.MouseEvent,
  ) => {
    const breakdown = [
      { label: `Ranks`, value: ranks },
      { label: `${skill.abl.toUpperCase()}-Mod`, value: attrMod },
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

    if (key === 'balance' && getSkillRanks(pc, 'tumble') >= 5) breakdown.push({ label: 'Synergy (Tumble)', value: 2 });
    if (key === 'escape_artist' && getSkillRanks(pc, 'tumble') >= 5) breakdown.push({ label: 'Synergy (Tumble)', value: 2 });
    if (key === 'diplomacy' && getSkillRanks(pc, 'bluff') >= 5) breakdown.push({ label: 'Synergy (Bluff)', value: 2 });
    if (key === 'disguise' && getSkillRanks(pc, 'bluff') >= 5) breakdown.push({ label: 'Synergy (Bluff)', value: 2 });
    if (key === 'intimidate' && getSkillRanks(pc, 'bluff') >= 5) breakdown.push({ label: 'Synergy (Bluff)', value: 2 });
    if (key === 'use_magic_device') {
      if (getSkillRanks(pc, 'spellcraft') >= 5) breakdown.push({ label: 'Synergy (Spellcraft)', value: 2 });
      if (getSkillRanks(pc, 'decipher_script') >= 5) breakdown.push({ label: 'Synergy (Decipher Script)', value: 2 });
    }

    if (skill.hasACP) {
      const acp = getArmorCheckPenalty(pc);
      if (acp !== 0) {
        const penaltyVal = key === 'swim' ? -2 * acp : -acp;
        breakdown.push({ label: 'Armor Check Penalty (ACP)', value: penaltyVal });
      }
    }

    const hasShaken = (pc.conditions || []).some(
      (c: any) =>
        c === 'Erschüttet' ||
        (c && c.n === 'Erschüttet') ||
        c === 'Schüttelnd' ||
        (c && c.n === 'Schüttelnd'),
    );
    if (hasShaken) {
      breakdown.push({ label: 'Condition (Shaken)', value: -2 });
    }

    showRollBreakdown(`Skill check: ${skill.nameEn || skill.nameDe}`, '1d20', breakdown, e.nativeEvent);
  };

  const handleRanksChange = (key: string, val: string) => {
    let num = parseFloat(val);
    if (isNaN(num) || num < 0) num = 0;
    num = Math.floor(num);

    const ranks = getSkillRanks(pc, key);
    const isClass = CombatRules.isClassSkill(key, pc);

    if (num > ranks) {
      const freeSP = totalSP - spentSP;
      const cost = (num - ranks) * (isClass ? 1 : 2);

      if (freeSP < cost) {
        if (!isClass && freeSP === 1) {
          showCustomAlert(
            'Aktion nicht möglich',
            'Es ist nicht möglich, einen einzelnen verbleibenden Skillpunkt für eine klassenfremde Fertigkeit auszugeben. Sie benötigen mindestens 2 freie Skillpunkte, da klassenfremde Fertigkeiten 2 Skillpunkte pro Rang kosten.',
            'OK',
            '📝',
          );
        } else {
          showCustomAlert(
            'Nicht genügend Skillpunkte',
            `Sie haben nicht genügend freie Skillpunkte (${freeSP} vorhanden, ${cost} benötigt).`,
            'OK',
            '📝',
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
      const oldRanks = parseFloat(freshPC.skills[key].ranks) || 0;
      const rankDiff = num - oldRanks;
      freshPC.skills[key].ranks = num;
      if (freshPC.skills[key].spent !== undefined) {
        const costDiff = rankDiff * (isClass ? 1 : 2);
        freshPC.skills[key].spent = Math.max(0, (parseFloat(freshPC.skills[key].spent) || 0) + costDiff);
      }
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
    return Object.keys(SKILLS_REGISTRY)
      .filter((key) => {
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
      })
      .sort((a, b) => {
        const nameA = SKILLS_REGISTRY[a].nameEn || SKILLS_REGISTRY[a].nameDe;
        const nameB = SKILLS_REGISTRY[b].nameEn || SKILLS_REGISTRY[b].nameDe;
        return nameA.localeCompare(nameB);
      });
  }, [searchQuery, filterType, pc]);

  return (
    <div className="panel" id="pcSkillsPanel" style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <div className="phdr">
        <h2>📜 Skills &amp; Skill Tricks</h2>
      </div>

      <div className="pbody" style={{ minWidth: 0, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '10px', width: '100%', minWidth: 0, boxSizing: 'border-box', minHeight: '380px' }}>
          {/* Left Column: Skills (60%) */}
          <div style={{ flex: '6 1 0%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', borderRight: '0.5px solid var(--pb)', paddingRight: '8px', boxSizing: 'border-box' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '11px', color: 'var(--red)', borderBottom: '1px solid var(--pb)', paddingBottom: '2px', margin: '0 0 4px 0', fontWeight: 'bold', textAlign: 'center' }}>
              📔 Skills
            </h3>

            {/* Search & Filter Controls */}
            <SkillFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterType={filterType}
              onFilterChange={setFilterType}
              spentSP={spentSP}
              totalSP={totalSP}
            />

            {/* Legend */}
            <SkillsLegend />

            {/* Skills list */}
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '360px', overflowY: 'auto', paddingRight: '2px', minWidth: 0 }} className="pc-scroll-skills">
              {filteredSkillKeys.length > 0 ? (
                filteredSkillKeys.map((key) => {
                  const skill = SKILLS_REGISTRY[key];
                  const isClass = CombatRules.isClassSkill(key, pc);
                  const ranks = getSkillRanks(pc, key);
                  const misc = getSkillMisc(pc, key);
                  const maxRanks = CombatRules.getPCMaxRanks(key, pc);
                  const totalMod = getSkillMod(pc, key);
                  const attrMod = getStatMod((pc as any)[skill.abl]);
                  const isTrainedOnlyDisabled = skill.trainedOnly && ranks === 0;
                  const hasSkillExtras = totalMod !== ranks + attrMod + misc;
                  const tooltipText = getSkillTooltip(key, totalMod, ranks, attrMod, misc, skill);

                  return (
                    <SkillRow
                      key={key}
                      skillKey={key}
                      skill={skill}
                      pc={pc}
                      isClass={isClass}
                      ranks={ranks}
                      misc={misc}
                      maxRanks={maxRanks}
                      totalMod={totalMod}
                      attrMod={attrMod}
                      isTrainedOnlyDisabled={isTrainedOnlyDisabled}
                      hasSkillExtras={hasSkillExtras}
                      tooltipText={tooltipText}
                      focusedRanksKey={focusedRanksKey}
                      focusedRanksVal={focusedRanksVal}
                      onFocusRanks={(k, r) => {
                        setFocusedRanksKey(k);
                        setFocusedRanksVal(r === 0 ? '' : String(r));
                      }}
                      onChangeRanksVal={setFocusedRanksVal}
                      onBlurRanks={(k) => {
                        if (focusedRanksVal === '' || isNaN(parseFloat(focusedRanksVal))) {
                          handleRanksChange(k, '0');
                        } else {
                          handleRanksChange(k, focusedRanksVal);
                        }
                        setFocusedRanksKey(null);
                        setFocusedRanksVal('');
                      }}
                      focusedMiscKey={focusedMiscKey}
                      focusedMiscVal={focusedMiscVal}
                      onFocusMisc={(k, m) => {
                        setFocusedMiscKey(k);
                        setFocusedMiscVal(m === 0 ? '' : String(m));
                      }}
                      onChangeMiscVal={setFocusedMiscVal}
                      onBlurMisc={(k) => {
                        if (focusedMiscVal === '' || focusedMiscVal === '-' || isNaN(parseInt(focusedMiscVal, 10))) {
                          handleMiscChange(k, '0');
                        } else {
                          handleMiscChange(k, focusedMiscVal);
                        }
                        setFocusedMiscKey(null);
                        setFocusedMiscVal('');
                      }}
                      onRollSkill={handleRollSkill}
                      onRanksChange={handleRanksChange}
                    />
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
          <SkillTricksSubPanel pc={pc} />
        </div>
      </div>
    </div>
  );
};
