/**
 * @module    PCFeatsTab
 * @summary   Renders the Feats tab with learned feats (left) and interactive compendium (right). Checks prerequisites and shows class-specific bonus feats.
 * @exports   PCFeatsTab
 * @reads     pc.feats, pc.classes, pc.bab, pc.str, pc.dex, pc.con, pc.int, pc.wis, pc.cha, pc.skills, pc.level
 * @stateOps  addPCFeat, removePCFeat
 * @depends   React, @core/state.js, @core/data/feats-data.js, @core/ui/components/dialogs.js
 */

import React, { useMemo } from 'react';
import { usePC } from '../../../context/PCContext';
import { showFeatScrollDialog } from '@core/ui/components/dialogs.js';
import { checkPrerequisites } from '@core/rules/RulesFeats.js';
import { CombatFeats } from '@core/data/feats-data.js';
import { LearnedFeatsList } from './LearnedFeatsList.tsx';
import { CompendiumFeatsList } from './CompendiumFeatsList.tsx';


// Re-exported for backwards compatibility
export { checkPrerequisites };

export const PCFeatsTab: React.FC = () => {
  const pc = usePC();
  const hasFighter = useMemo(() => Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'fighter'), [pc.classes]);
  const hasWizard = useMemo(() => Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'wizard'), [pc.classes]);
  const hasMonk = useMemo(() => Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'monk'), [pc.classes]);
  const hasDragonShaman = useMemo(() => Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'dragon_shaman'), [pc.classes]);
  const hasRanger = useMemo(() => Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'ranger'), [pc.classes]);
  const loosePc = pc as any;

  const autoFeats = useMemo(() => typeof loosePc.getAutomaticFeats === 'function' ? loosePc.getAutomaticFeats() : [], [pc.classes, loosePc.rangerCombatStyle]);
  const activeFeats = useMemo(() => {
    if (!Array.isArray(pc?.feats)) return [];
    return pc.feats.map((f: any) => (typeof f === 'string' ? { id: f, option: '' } : f));
  }, [pc?.feats]);
  
  const rangerBonusIds = useMemo(() => [
    'track',
    'endurance',
    'rapid_shot',
    'two_weapon_fighting',
    'manyshot',
    'improved_two_weapon_fighting',
    'improved_precise_shot',
    'greater_two_weapon_fighting'
  ], []);

  const combinedFeats = useMemo(() => {
    const list = activeFeats.map((f: any) => {
      const isRangerBonus = hasRanger && rangerBonusIds.includes(f.id);
      const autoMatch = autoFeats.find((af: any) => af.id === f.id);
      if (autoMatch) {
        return { ...f, isAutomatic: true, source: autoMatch.source };
      }
      if (isRangerBonus) {
        return { ...f, isAutomatic: true, source: 'Ranger (Class)' };
      }
      return { ...f, isAutomatic: false };
    });
    autoFeats.forEach((af: any) => {
      if (!list.some((lf: any) => lf.id === af.id)) {
        list.push({ id: af.id, isAutomatic: true, source: af.source });
      }
    });
    return list;
  }, [activeFeats, autoFeats, hasRanger, rangerBonusIds]);

  const activeClasses = useMemo(() => Array.isArray(pc.classes) ? pc.classes : [], [pc.classes]);
  const totalLevel = useMemo(() => activeClasses.reduce((sum: number, c: any) => sum + (c.level || 0), 0) || 1, [activeClasses]);
  const raceStr = useMemo(() => (pc.race || '').toLowerCase(), [pc.race]);
  const isHuman = useMemo(() => loosePc.isHuman !== undefined ? !!loosePc.isHuman : (raceStr === 'human' || raceStr === 'mensch' || raceStr === ''), [loosePc.isHuman, raceStr]);

  const generalMax = useMemo(() => 1 + Math.floor(totalLevel / 3) + (isHuman ? 1 : 0), [totalLevel, isHuman]);
  
  const fighterMax = useMemo(() => {
    const fighterClass = activeClasses.find((c: any) => c.classType === 'fighter');
    return fighterClass ? 1 + Math.floor(fighterClass.level / 2) : 0;
  }, [activeClasses]);

  const wizardMax = useMemo(() => {
    const wizardClass = activeClasses.find((c: any) => c.classType === 'wizard');
    return wizardClass ? 1 + Math.floor(wizardClass.level / 5) : 0;
  }, [activeClasses]);

  const monkMax = useMemo(() => {
    const monkClass = activeClasses.find((c: any) => c.classType === 'monk');
    return monkClass ? (monkClass.level >= 6 ? 3 : (monkClass.level >= 2 ? 2 : (monkClass.level >= 1 ? 1 : 0))) : 0;
  }, [activeClasses]);

  const dragonShamanMax = useMemo(() => {
    const dsClass = activeClasses.find((c: any) => c.classType === 'dragon_shaman');
    return dsClass ? ((dsClass.level || 0) >= 16 ? 3 : ((dsClass.level || 0) >= 8 ? 2 : ((dsClass.level || 0) >= 2 ? 1 : 0))) : 0;
  }, [activeClasses]);

  const rangerMax = useMemo(() => {
    const rClass = activeClasses.find((c: any) => c.classType === 'ranger');
    if (!rClass) return 0;
    const lvl = rClass.level || 0;
    if (lvl >= 11) return 5;
    if (lvl >= 6) return 4;
    if (lvl >= 3) return 3;
    if (lvl >= 2) return 2;
    if (lvl >= 1) return 1;
    return 0;
  }, [activeClasses]);

  const totalMax = useMemo(() => generalMax + fighterMax + wizardMax + monkMax + dragonShamanMax + rangerMax, [generalMax, fighterMax, wizardMax, monkMax, dragonShamanMax, rangerMax]);

  const { generalFilled, fighterFilled, wizardFilled, monkFilled, dragonShamanFilled, rangerFilled } = useMemo(() => {
    const monkBonusIds = ['improved_unarmed_strike', 'improved_grapple', 'deflect_arrows', 'snatch_arrows', 'stunning_fist', 'improved_trip', 'improved_overrun'];
    let monkFilled = 0;
    let wizardFilled = 0;
    let fighterFilled = 0;
    let dragonShamanFilled = 0;
    let rangerFilled = 0;
    let generalFilled = 0;

    for (const f of combinedFeats) {
      const featDef = CombatFeats.REGISTRY[f.id];
      if (!featDef) continue;
      if (hasRanger && rangerBonusIds.includes(f.id) && rangerFilled < rangerMax) {
        rangerFilled++;
      } else if (dragonShamanMax > 0 && dragonShamanFilled < dragonShamanMax && f.id === 'skill_focus') {
        dragonShamanFilled++;
      } else if (monkMax > 0 && monkFilled < monkMax && monkBonusIds.includes(f.id)) {
        monkFilled++;
      } else if (wizardMax > 0 && wizardFilled < wizardMax && (featDef.category === 'metamagic' || featDef.category === 'item_creation')) {
        wizardFilled++;
      } else if (fighterMax > 0 && fighterFilled < fighterMax && featDef.category === 'combat') {
        fighterFilled++;
      } else if (!f.isAutomatic) {
        generalFilled++;
      }
    }

    return { generalFilled, fighterFilled, wizardFilled, monkFilled, dragonShamanFilled, rangerFilled };
  }, [combinedFeats, monkMax, wizardMax, fighterMax, dragonShamanMax, rangerMax, rangerBonusIds, hasRanger]);

  const selectableMax = useMemo(() => generalMax + fighterMax + wizardMax + monkMax + dragonShamanMax, [generalMax, fighterMax, wizardMax, monkMax, dragonShamanMax]);
  const selectableFilled = useMemo(() => generalFilled + fighterFilled + wizardFilled + monkFilled + dragonShamanFilled, [generalFilled, fighterFilled, wizardFilled, monkFilled, dragonShamanFilled]);
  const isLimitReached = useMemo(() => selectableFilled >= selectableMax, [selectableFilled, selectableMax]);

  const handleFeatRowClick = (feat: any, isLearned: boolean, option?: string, e?: React.MouseEvent) => {
    showFeatScrollDialog(feat, pc, isLearned, option || '', e?.nativeEvent);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', width: '100%', minWidth: 0, overflowX: 'hidden' }}>
      {/* Legend */}
      <div className="feats-legend" style={{ marginBottom: '8px', padding: '5px 8px', background: 'rgba(200, 169, 110, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '2px', fontSize: '8.5px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
        <span style={{ fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)', fontSize: '9px' }}>Legend:</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: hasFighter ? 1 : 0.5 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '6px', border: '1.2px solid #2a6a2a', background: 'rgba(42, 106, 42, 0.1)', borderLeftWidth: '3px' }}></span>
          <span>Fighter Bonus (Combat Category {hasFighter ? 'Active' : 'Inactive'})</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: hasWizard ? 1 : 0.5 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '6px', border: '1.2px solid #2a6a2a', background: 'rgba(42, 106, 42, 0.1)', borderLeftWidth: '3px' }}></span>
          <span>Wizard Bonus (Metamagic/Item Creation {hasWizard ? 'Active' : 'Inactive'})</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: hasMonk ? 1 : 0.5 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '6px', border: '1.2px solid #2a6a2a', background: 'rgba(42, 106, 42, 0.1)', borderLeftWidth: '3px' }}></span>
          <span>Monk Bonus (Monk Feats {hasMonk ? 'Active' : 'Inactive'})</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: hasDragonShaman ? 1 : 0.5 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '6px', border: '1.2px solid #2a6a2a', background: 'rgba(42, 106, 42, 0.1)', borderLeftWidth: '3px' }}></span>
          <span>Dragon Shaman Bonus (Skill Focus {hasDragonShaman ? 'Active' : 'Inactive'})</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: hasRanger ? 1 : 0.5 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '6px', border: '1.2px solid #2a6a2a', background: 'rgba(42, 106, 42, 0.1)', borderLeftWidth: '3px' }}></span>
          <span>Ranger Bonus (Class &amp; Style {hasRanger ? 'Active' : 'Inactive'})</span>
        </span>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="feats-columns-container" style={{ display: 'flex', gap: '10px', flex: 1, minHeight: 0, minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
        {/* Left Column: Learned Feats (40%) */}
        <LearnedFeatsList
          pc={pc}
          combinedFeats={combinedFeats}
          activeFeats={activeFeats}
          totalMax={totalMax}
          generalFilled={generalFilled}
          generalMax={generalMax}
          fighterFilled={fighterFilled}
          fighterMax={fighterMax}
          wizardFilled={wizardFilled}
          wizardMax={wizardMax}
          monkFilled={monkFilled}
          monkMax={monkMax}
          dragonShamanFilled={dragonShamanFilled}
          dragonShamanMax={dragonShamanMax}
          rangerFilled={rangerFilled}
          rangerMax={rangerMax}
          hasFighter={hasFighter}
          hasWizard={hasWizard}
          hasMonk={hasMonk}
          hasDragonShaman={hasDragonShaman}
          hasRanger={hasRanger}
          onFeatClick={handleFeatRowClick}
        />

        {/* Right Column: Compendium (60%) */}
        <CompendiumFeatsList
          pc={pc}
          activeFeats={activeFeats}
          combinedFeats={combinedFeats}
          totalMax={selectableMax}
          selectableFilled={selectableFilled}
          selectableMax={selectableMax}
          isLimitReached={isLimitReached}
          onFeatClick={handleFeatRowClick}
        />
      </div>
    </div>
  );
};
