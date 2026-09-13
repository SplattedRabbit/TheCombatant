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
import { calculateSkillModifier, getSkillModifierBreakdown } from '@core/models/helpers/skills/CombatantSkills.js';
import { showRollBreakdown, showCustomAlert } from '@core/ui/components/dialogs.js';

import { formatMod, getStatMod } from '../attributeHelper';
import { SkillFilterBar } from './SkillFilterBar';
import { SkillsLegend } from './SkillsLegend';
import { SkillRow } from './SkillRow';
import { SkillTricksSubPanel } from './SkillTricksSubPanel';

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

import { usePC } from '../../../context/PCContext';

export const PCSkillsTab: React.FC = () => {
  const pc = usePC();
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
  ) => {
    const breakdown = getSkillModifierBreakdown(pc, key);
    const lines = [`Total Modifier: ${formatMod(totalMod)}`];
    breakdown.forEach((item: { label: string; value: number }) => {
      lines.push(`• ${item.label}: ${formatMod(item.value)}`);
    });
    return lines.join('\n');
  };

  // Roll skill
  const handleRollSkill = (
    key: string,
    skill: any,
    _ranks: number,
    _attrMod: number,
    _misc: number,
    e: React.MouseEvent,
  ) => {
    const breakdown = getSkillModifierBreakdown(pc, key);
    showRollBreakdown(`Skill check: ${skill.nameEn || skill.name || skill.nameDe || ''}`, '1d20', breakdown, e.nativeEvent);
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
            'Action Not Allowed',
            'It is not possible to spend a single remaining skill point on a cross-class skill. You need at least 2 available skill points, as cross-class skills cost 2 points per rank.',
            'OK',
            '📝',
          );
        } else {
          showCustomAlert(
            'Not Enough Skill Points',
            `You do not have enough available skill points (${freeSP} available, ${cost} required).`,
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
        const name = skill.nameEn || skill.name || skill.nameDe || '';
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
        const nameA = SKILLS_REGISTRY[a].nameEn || SKILLS_REGISTRY[a].name || SKILLS_REGISTRY[a].nameDe || '';
        const nameB = SKILLS_REGISTRY[b].nameEn || SKILLS_REGISTRY[b].name || SKILLS_REGISTRY[b].nameDe || '';
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
                  const tooltipText = getSkillTooltip(key, totalMod);

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
