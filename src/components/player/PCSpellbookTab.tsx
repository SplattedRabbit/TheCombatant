/**
 * @module    PCSpellbookTab
 * @summary   Renders the left column of the spells tab: spell slots, ASF warnings and the spell library with prepare/cast actions.
 * @exports   PCSpellbookTab
 * @reads     pc.learnedSpells, pc.spellSlots, pc.classes, pc.preparedSpells, pc.wizardSpecialization, pc.customSpells
 * @stateOps  updatePCSpellSlotsUsed, updatePCBatch
 * @depends   React, @core/state.js, @core/spells.js, @core/rules/SpellSlotCalculator.js, @core/ui/components/dialogs.js
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { CombatSpells } from '@core/spells.js';
import {
  showCustomConfirm,
  showPrepareSpellDialog,
  showCastSpontaneousSpellDialog,
  showNewDayTemplateDialog,
  showSpellDetailsDialog,
} from '@core/ui/components/dialogs.js';

interface PCSpellbookTabProps {
  pc: any;
}

export const findSpell = (pc: any, key: string) => {
  if (CombatSpells.REGISTRY?.[key]) {
    return CombatSpells.REGISTRY[key];
  }
  if (Array.isArray(pc.customSpells)) {
    const found = pc.customSpells.find((s: any) => s.id === key || s.nameDe === key || s.nameEn === key);
    if (found) return found;
  }
  return null;
};

export const PCSpellbookTab: React.FC<PCSpellbookTabProps> = ({ pc }) => {
  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const activeCasters = hasClasses ? pc.classes.filter((c: any) => [
    'cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger',
    'duskblade', 'beguiler'
  ].includes(c.classType)) : [];
  
  const hasPrepared = activeCasters.some((c: any) => ['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'duskblade'].includes(c.classType));
  const hasSpontaneous = activeCasters.some((c: any) => ['sorcerer', 'bard', 'beguiler'].includes(c.classType));
  const hasCantrips = !hasClasses || pc.classes.some((c: any) => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid'].includes(c.classType));

  const minLvl = hasCantrips ? 0 : 1;
  let maxLvl = 9;
  if (activeCasters.length === 1 && ['paladin', 'ranger'].includes(activeCasters[0].classType)) {
    maxLvl = 4;
  }
  if (activeCasters.length === 1 && activeCasters[0].classType === 'bard') {
    maxLvl = 6;
  }
  if (activeCasters.length === 1 && ['duskblade', 'beguiler'].includes(activeCasters[0].classType)) {
    maxLvl = 5;
  }

  const levelsToRender = [];
  for (let i = minLvl; i <= maxLvl; i++) levelsToRender.push(i);

  // Calculate Arcane Spell Failure (ASF)
  let totalASF = 0;
  const isWizardOrSorcerer = hasClasses && pc.classes.some((c: any) => c.classType === 'wizard' || c.classType === 'sorcerer');
  const isBard = hasClasses && pc.classes.some((c: any) => c.classType === 'bard');

  if (isWizardOrSorcerer || isBard) {
    const equippedArmor = typeof pc.getEquippedArmor === 'function' 
      ? pc.getEquippedArmor() 
      : (Array.isArray(pc.armors) ? pc.armors.find((a: any) => a.isEquipped && !a.isShield) : null);
    const equippedShield = typeof pc.getEquippedShield === 'function' 
      ? pc.getEquippedShield() 
      : (Array.isArray(pc.armors) ? pc.armors.find((a: any) => a.isEquipped && a.isShield) : null);

    if (isWizardOrSorcerer) {
      if (equippedArmor) totalASF += equippedArmor.spellFailure ?? 0;
      if (equippedShield) totalASF += equippedShield.spellFailure ?? 0;
    } else if (isBard) {
      if (equippedArmor && (equippedArmor.speedCategory === 'medium' || equippedArmor.speedCategory === 'heavy')) {
        totalASF += equippedArmor.spellFailure ?? 0;
      }
      if (equippedShield) {
        totalASF += equippedShield.spellFailure ?? 0;
      }
    }
  }

  const handleSpellBubbleClick = (lvl: number, idx: number) => {
    const currentUsed = pc.spellSlots?.[lvl]?.used || 0;
    const newUsed = idx <= currentUsed ? idx - 1 : idx;
    CombatState.updatePCSpellSlotsUsed(lvl, newUsed);
  };

  const handleRemoveSpell = (key: string) => {
    CombatState.updatePCBatch((freshPc: any) => {
      if (Array.isArray(freshPc.learnedSpells)) {
        freshPc.learnedSpells = freshPc.learnedSpells.filter((k: string) => k !== key);
      }
    });
  };

  const handlePrepareSpell = (key: string) => {
    showPrepareSpellDialog(pc, key, () => {});
  };

  const handleCastSpontaneous = (key: string) => {
    showCastSpontaneousSpellDialog(pc, key, () => {});
  };

  const handleSpellDetails = (spell: any, key: string) => {
    showSpellDetailsDialog(spell, key, pc);
  };

  const handleNewDayReset = () => {
    const performNewDayReset = (templateChoice = 'keep') => {
      CombatState.updatePCBatch((freshPc: any) => {
        if (templateChoice === 'empty') {
          freshPc.preparedSpells = [];
        } else if (templateChoice !== 'keep') {
          for (let lvl = 0; lvl <= 9; lvl++) {
            if (freshPc.spellSlots?.[lvl]) {
              freshPc.spellSlots[lvl].used = 0;
            }
          }
          const template = freshPc.spellTemplates?.[templateChoice];
          if (template) {
            freshPc.preparedSpells = JSON.parse(JSON.stringify(template));
          }
        } else {
          // Keep spells, but clear used status
          if (Array.isArray(freshPc.preparedSpells)) {
            freshPc.preparedSpells.forEach((p: any) => {
              p.isUsed = false;
            });
          }
        }

        // Reset all slot bubble usages
        for (let lvl = 0; lvl <= 9; lvl++) {
          if (freshPc.spellSlots?.[lvl]) {
            freshPc.spellSlots[lvl].used = 0;
          }
        }
      });

      CombatState.resetDailyResources();
    };

    if (hasPrepared) {
      showNewDayTemplateDialog(pc, pc.spellTemplates || {}, (choice: string) => {
        performNewDayReset(choice);
      });
    } else {
      showCustomConfirm(
        "A new day! 🌅",
        "Do you want to restore all expended spell slots and daily class abilities and start a new day?",
        () => { performNewDayReset('keep'); }
      );
    }
  };

  const learnedSpells = Array.isArray(pc.learnedSpells) ? pc.learnedSpells : [];
  const sortedSpells = learnedSpells.map((key: string) => {
    const spell = findSpell(pc, key);
    return spell ? { ...spell, id: key } : null;
  }).filter(Boolean) as any[];

  sortedSpells.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    const nameA = a.nameEn || a.nameDe || '';
    const nameB = b.nameEn || b.nameDe || '';
    return nameA.localeCompare(nameB);
  });

  const groupedSpells: Record<number, any[]> = {};
  sortedSpells.forEach(s => {
    if (!groupedSpells[s.level]) groupedSpells[s.level] = [];
    groupedSpells[s.level].push(s);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {totalASF > 0 && (
        <div style={{ background: 'rgba(139, 26, 26, 0.08)', border: '0.5px solid var(--red)', borderRadius: '3px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--red)', fontWeight: 'bold' }}>
          <span>⚠️ Arcane Spell Failure: {totalASF}% chance of failure for arcane spells</span>
        </div>
      )}

      {/* Unified Spell Slots Grid */}
      <div style={{ background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 6px' }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', marginBottom: '3px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🔮 Spell Slots &amp; Daily Allowances</span>
          <button
            onClick={handleNewDayReset}
            className="btn btn-new-day"
            style={{ fontSize: '7.5px', padding: '1px 4px', height: '14px', lineHeight: 1, fontWeight: 'bold', fontFamily: 'var(--font-title)' }}
          >
            🌅 Daily Reset
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
          {levelsToRender.map(spellLvl => {
            const max = pc.spellSlots?.[spellLvl]?.max || 0;
            const used = pc.spellSlots?.[spellLvl]?.used || 0;
            
            const bubbles = [];
            for (let i = 1; i <= max; i++) {
              const spent = i <= used;
              bubbles.push(
                <span
                  key={i}
                  onClick={() => handleSpellBubbleClick(spellLvl, i)}
                  className={`spell-bubble use-icon use-icon-spell ${spent ? 'used' : ''}`}
                  style={{ cursor: 'pointer', opacity: spent ? 0.4 : 1, filter: spent ? 'grayscale(80%)' : undefined }}
                  title={spent ? 'Used (Release)' : 'Available (Expend)'}
                >
                  🔮
                </span>
              );
            }

            const isCleric = hasClasses && pc.classes.some((c: any) => c.classType === 'cleric');
            const hasDomainSlot = isCleric && spellLvl >= 1;

            return (
              <div key={spellLvl} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9px', lineHeight: 1 }}>
                <span style={{ fontWeight: 600, minWidth: '40px' }} title={hasDomainSlot ? 'Includes 1 Domain Spell Slot' : undefined}>
                  Level {spellLvl}{hasDomainSlot ? <span style={{ color: '#8b1a1a', fontSize: '7.5px', marginLeft: '1px' }}>+D</span> : ''}:
                </span>
                <input
                  type="number"
                  value={max}
                  readOnly={!!hasClasses}
                  onChange={(e) => !hasClasses && CombatState.updatePCSpellSlotsMax(spellLvl, parseInt(e.target.value) || 0)}
                  className="cinput max-slots-inp"
                  style={{ width: '16px', fontSize: '8px', padding: 0, textAlign: 'center', height: '12px', borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none', marginRight: '1px', ...(hasClasses ? { background: 'rgba(0,0,0,0.04)', color: 'var(--inkl)', cursor: 'not-allowed' } : {}) }}
                  tabIndex={hasClasses ? -1 : undefined}
                />
                <div style={{ display: 'flex', gap: '1px', flexWrap: 'nowrap' }}>
                  {bubbles.length > 0 ? bubbles : <span style={{ fontSize: '8px', color: 'var(--inkl)' }}>✕</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Area B: Known Spells Library */}
      <div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', marginBottom: '5px', fontWeight: 'bold' }}>
          📖 Spell Library (Learned Spells)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto', paddingRight: '2px' }}>
          {learnedSpells.length === 0 ? (
            <div style={{ fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '35px 10px', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
              Your spellbook is empty.<br />
              <span style={{ fontSize: '8px', marginTop: '3px', display: 'block' }}>Switch to the <strong>Spell Compendium</strong> to add spells!</span>
            </div>
          ) : (
            Object.keys(groupedSpells).map(lvlKey => {
              const lvl = parseInt(lvlKey);
              const levelSpells = groupedSpells[lvl];

              return (
                <div key={lvl} style={{ marginBottom: '2px' }}>
                  <div style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--inkl)', borderBottom: '0.5px dashed rgba(200, 169, 110, 0.4)', paddingBottom: '1px', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.5px' }}>
                    Level {lvl}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5px' }}>
                    {levelSpells.map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.3)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '3px 5px', fontSize: '9px' }}>
                        <span
                          onClick={() => handleSpellDetails(s, s.id)}
                          style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--red)', fontFamily: 'var(--font-body)', fontSize: '10px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '4px' }}
                          title={`${s.nameEn || s.nameDe} (${s.school})`}
                        >
                          📜 {s.nameEn || s.nameDe} <span style={{ fontSize: '8px', fontWeight: 'normal', color: 'var(--inkl)', fontStyle: 'italic' }}>({s.school})</span>
                        </span>
                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                          {hasPrepared && (
                            <button
                              onClick={() => handlePrepareSpell(s.id)}
                              className="btn"
                              style={{ fontSize: '8px', padding: '1px 5px', cursor: 'pointer', borderRadius: '2.5px', borderColor: 'var(--pb)', color: 'var(--ink)', fontWeight: 'bold' }}
                            >
                              Prepare
                            </button>
                          )}
                          {hasSpontaneous && (
                            <button
                              onClick={() => handleCastSpontaneous(s.id)}
                              className="btn"
                              style={{ fontSize: '8px', padding: '1px 5px', cursor: 'pointer', borderRadius: '2.5px', background: 'rgba(139,26,26,0.1)', borderColor: 'var(--red)', color: 'var(--red)', fontWeight: 'bold' }}
                            >
                              Cast
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveSpell(s.id)}
                            className="btn"
                            style={{ fontSize: '8px', padding: '1px 4px', borderColor: 'transparent', color: 'var(--inkl)', cursor: 'pointer' }}
                            title="Remove from spellbook"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
