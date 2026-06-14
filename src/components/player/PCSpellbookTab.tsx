/**
 * @module    PCSpellbookTab
 * @summary   Rendert die linke Spalte des Zauberreiters: Zauberslots, ASF-Warnungen und die Zauberbibliothek mit Vorbereiten/Wirken Aktionen.
 * @exports   PCSpellbookTab
 * @reads     pc.learnedSpells, pc.spellSlots, pc.classes, pc.preparedSpells, pc.wizardSpecialization, pc.customSpells
 * @stateOps  updatePCSpellSlotsUsed, updatePCBatch
 * @depends   React, @core/state.js, @core/spells.js, @core/rules/SpellSlotCalculator.js, @core/ui/components/dialogs.js, @core/ui/components/player/ClassFeaturesRegistry.js
 */

import React from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { CombatSpells } from '@core/spells.js';
// @ts-ignore
import { CLASS_FEATURE_REGISTRY } from '@core/ui/components/player/ClassFeaturesRegistry.js';
// @ts-ignore
import { showCustomConfirm, showCustomAlert, showPrepareSpellDialog, showCastSpontaneousSpellDialog, showNewDayTemplateDialog } from '@core/ui/components/dialogs.js';
// @ts-ignore
import { showSpellDetailsDialog } from '@core/ui/components/player/PCSpellDialogs.js';

interface PCSpellbookTabProps {
  pc: any;
}

export const findSpell = (pc: any, key: string) => {
  if (CombatSpells.REGISTRY?.[key]) {
    return CombatSpells.REGISTRY[key];
  }
  if (Array.isArray(pc.customSpells)) {
    const found = pc.customSpells.find((s: any) => s.id === key || s.nameDe === key);
    if (found) return found;
  }
  return null;
};

export const PCSpellbookTab: React.FC<PCSpellbookTabProps> = ({ pc }) => {
  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const activeCasters = hasClasses ? pc.classes.filter((c: any) => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger'].includes(c.classType)) : [];
  
  const hasPrepared = activeCasters.some((c: any) => ['wizard', 'cleric', 'druid', 'paladin', 'ranger'].includes(c.classType));
  const hasSpontaneous = activeCasters.some((c: any) => ['sorcerer', 'bard'].includes(c.classType));
  const hasCantrips = !hasClasses || pc.classes.some((c: any) => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid'].includes(c.classType));

  const minLvl = hasCantrips ? 0 : 1;
  let maxLvl = 9;
  if (activeCasters.length === 1 && ['paladin', 'ranger'].includes(activeCasters[0].classType)) {
    maxLvl = 4;
  }
  if (activeCasters.length === 1 && activeCasters[0].classType === 'bard') {
    maxLvl = 6;
  }

  const levelsToRender = [];
  for (let i = minLvl; i <= maxLvl; i++) levelsToRender.push(i);

  // Calculate Arcane Spell Failure (ASF)
  let totalASF = 0;
  const isWizardOrSorcerer = hasClasses && pc.classes.some((c: any) => c.classType === 'wizard' || c.classType === 'sorcerer');
  const isBard = hasClasses && pc.classes.some((c: any) => c.classType === 'bard');

  if (isWizardOrSorcerer || isBard) {
    const equippedArmor = typeof pc.getEquippedArmor === 'function' ? pc.getEquippedArmor() : null;
    const equippedShield = typeof pc.getEquippedShield === 'function' ? pc.getEquippedShield() : null;

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
          // applyPCSpellTemplate is handled via state mutations, but since we are in a batch, we can load it:
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

      // Run daily feature updates
      const activeComponents = CLASS_FEATURE_REGISTRY.filter((comp: any) => comp.isEligible(pc));
      activeComponents.forEach((comp: any) => {
        const clsInfo = pc.classes ? pc.classes.find((c: any) => c.classType === comp.classKey) : null;
        const level = clsInfo ? clsInfo.level : 1;
        comp.onNewDay(pc, level);
      });

      CombatState.resetDailyResources();
    };

    if (hasPrepared) {
      showNewDayTemplateDialog(pc, pc.spellTemplates || {}, (choice: string) => {
        performNewDayReset(choice);
      });
    } else {
      showCustomConfirm(
        "Ein neuer Tag! 🌅",
        "Möchtest du alle verbrauchten Zauberslots und täglichen Klassenfähigkeiten wiederherstellen und einen neuen Tag beginnen?",
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
    return (a.nameDe || '').localeCompare(b.nameDe || '');
  });

  const groupedSpells: Record<number, any[]> = {};
  sortedSpells.forEach(s => {
    if (!groupedSpells[s.level]) groupedSpells[s.level] = [];
    groupedSpells[s.level].push(s);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {totalASF > 0 && (
        <div style={{ background: 'rgba(139, 26, 26, 0.08)', border: '0.5px solid var(--red)', borderRadius: '3px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold' }}>
          <span>⚠️ Rüstungs-Zauberpatzer: {totalASF}% Chance auf Fehlschlag bei arkanen Zaubern</span>
        </div>
      )}

      {/* Unified Spell Slots Grid */}
      <div style={{ background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 6px' }}>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', marginBottom: '3px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🔮 Zauberslots &amp; Tageskontingente</span>
          <button
            onClick={handleNewDayReset}
            className="btn btn-new-day"
            style={{ fontSize: '7.5px', padding: '1px 4px', height: '14px', lineHeight: 1, fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif" }}
          >
            🌅 Tagesreset
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
                  title={spent ? 'Benutzt (Freigeben)' : 'Verfügbar (Verbrauchen)'}
                >
                  🔮
                </span>
              );
            }

            return (
              <div key={spellLvl} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9px', lineHeight: 1 }}>
                <span style={{ fontWeight: 600, minWidth: '35px' }}>Grad {spellLvl}:</span>
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
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', marginBottom: '5px', fontWeight: 'bold' }}>
          📖 Zauberbibliothek (Gelernte Zauber)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto', paddingRight: '2px' }}>
          {learnedSpells.length === 0 ? (
            <div style={{ fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '35px 10px', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
              Dein Zauberbuch ist noch leer.<br />
              <span style={{ fontSize: '8px', marginTop: '3px', display: 'block' }}>Wechsle zum <strong>Zauberkompendium</strong>, um Zauber hinzuzufügen!</span>
            </div>
          ) : (
            Object.keys(groupedSpells).map(lvlKey => {
              const lvl = parseInt(lvlKey);
              const levelSpells = groupedSpells[lvl];

              return (
                <div key={lvl} style={{ marginBottom: '2px' }}>
                  <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--inkl)', borderBottom: '0.5px dashed rgba(200, 169, 110, 0.4)', paddingBottom: '1px', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.5px' }}>
                    Grad {lvl}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5px' }}>
                    {levelSpells.map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.3)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '3px 5px', fontSize: '9px' }}>
                        <span
                          onClick={() => handleSpellDetails(s, s.id)}
                          style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--red)', fontFamily: "'Crimson Text', serif", fontSize: '10px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '4px' }}
                          title={`${s.nameDe} (${s.school})`}
                        >
                          📜 {s.nameDe} <span style={{ fontSize: '8px', fontWeight: 'normal', color: 'var(--inkl)', fontStyle: 'italic' }}>({s.school})</span>
                        </span>
                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                          {hasPrepared && (
                            <button
                              onClick={() => handlePrepareSpell(s.id)}
                              className="btn"
                              style={{ fontSize: '8px', padding: '1px 5px', cursor: 'pointer', borderRadius: '2.5px', borderColor: 'var(--pb)', color: 'var(--ink)', fontWeight: 'bold' }}
                            >
                              Vorbereiten
                            </button>
                          )}
                          {hasSpontaneous && (
                            <button
                              onClick={() => handleCastSpontaneous(s.id)}
                              className="btn"
                              style={{ fontSize: '8px', padding: '1px 5px', cursor: 'pointer', borderRadius: '2.5px', background: 'rgba(139,26,26,0.1)', borderColor: 'var(--red)', color: 'var(--red)', fontWeight: 'bold' }}
                            >
                              Wirken
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveSpell(s.id)}
                            className="btn"
                            style={{ fontSize: '8px', padding: '1px 4px', borderColor: 'transparent', color: 'var(--inkl)', cursor: 'pointer' }}
                            title="Aus Zauberbuch entfernen"
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
