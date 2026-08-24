/**
 * @module    PCSpellPreparation
 * @summary   Renders the right column of the spells tab: list of prepared spells per level, slot assignment, specialist slots (Wizard) and spell template management.
 * @exports   PCSpellPreparation
 * @reads     pc.preparedSpells, pc.spellSlots, pc.classes, pc.wizardSpecialization, pc.spellTemplates, pc.name
 * @stateOps  castPreparedSpell, unprepareSpell, applyPCSpellTemplate, savePCSpellTemplate, deletePCSpellTemplate, clearPreparedSpells
 * @depends   React, @core/state.js, @core/rules/SpellSlotCalculator.js, @core/ui/components/dialogs.js, src/components/player/PCSpellbookTab
 */

import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { SpellSlotCalculator } from '@core/rules/SpellSlotCalculator.js';
import { getSchoolLabel } from '@core/spells.js';
import { showCustomConfirm, showCustomAlert, showCustomPrompt } from '@core/ui/components/dialogs.js';
import { findSpell } from './PCSpellbookTab';

const showCastSuccessDialog = (...args: any[]) =>
  (window as any).__REACT_DIALOG_BRIDGE__?.showCastSuccessDialog?.(...args);
const showSpellDetailsDialog = (...args: any[]) =>
  (window as any).__REACT_DIALOG_BRIDGE__?.showSpellDetailsDialog?.(...args);

interface PCSpellPreparationProps {
  pc: any;
}

export const PCSpellPreparation: React.FC<PCSpellPreparationProps> = ({ pc }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const activeCasters = hasClasses ? pc.classes.filter((c: any) => [
    'cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger',
    'duskblade', 'beguiler'
  ].includes(c.classType)) : [];
  const hasPrepared = activeCasters.some((c: any) => ['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'duskblade'].includes(c.classType));

  if (!hasPrepared) {
    return (
      <div style={{ fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '35px 10px', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
        🌅 Spontaneous spellcasters do not prepare spells.
      </div>
    );
  }

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

  const isWizard = pc.classes && pc.classes.some((c: any) => c.classType === 'wizard');
  const wizardSpecialization = pc.wizardSpecialization || 'none';
  const hasSpecSlot = isWizard && wizardSpecialization !== 'none';

  const handleCastPrepared = (id: string) => {
    let castPrep: any = null;
    CombatState.updatePCBatch((freshPc: any) => {
      const p = freshPc.preparedSpells?.find((s: any) => s.id === id);
      if (p && !p.isUsed) {
        p.isUsed = true;
        castPrep = JSON.parse(JSON.stringify(p));

        // Deduct slot bubble usage
        const spell = findSpell(freshPc, p.spellKey);
        if (spell) {
          const METAMAGIC_COSTS: Record<string, number> = { extend_spell: 1, empower_spell: 2, maximize_spell: 3, quicken_spell: 4 };
          const metamagicAdjustment = p.metamagic.reduce((sum: number, fId: string) => sum + (METAMAGIC_COSTS[fId] || 0), 0);
          const finalLevel = spell.level + metamagicAdjustment;
          if (freshPc.spellSlots?.[finalLevel]) {
            freshPc.spellSlots[finalLevel].used = Math.min(
              freshPc.spellSlots[finalLevel].max || 0,
              (freshPc.spellSlots[finalLevel].used || 0) + 1
            );
          }
        }
      }
    });

    if (castPrep) {
      const spell = findSpell(pc, castPrep.spellKey);
      if (spell) {
        if (spell.effects && spell.effects.length > 0) {
          showCastSuccessDialog(pc, spell, castPrep.spellKey, castPrep.metamagic || [], () => {});
        } else {
          const METAMAGIC_COSTS: Record<string, number> = { extend_spell: 1, empower_spell: 2, maximize_spell: 3, quicken_spell: 4 };
          const metamagicNames: Record<string, string> = { extend_spell: 'Extended', empower_spell: 'Empowered', maximize_spell: 'Maximized', quicken_spell: 'Quickened' };
          const appliedMeta = castPrep.metamagic.map((mId: string) => metamagicNames[mId] || mId);
          const metaSuffix = appliedMeta.length > 0 ? ` (${appliedMeta.join(', ')})` : '';

          const metamagicAdjustment = castPrep.metamagic.reduce((sum: number, fId: string) => sum + (METAMAGIC_COSTS[fId] || 0), 0);
          const finalLevel = spell.level + metamagicAdjustment;

          showCustomAlert(
            "Spell Cast! ✨",
            `<div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.35;">
              <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
                ${pc.name} casts prepared spell: ${spell.nameEn || spell.nameDe}${metaSuffix}!
              </div>
              • <strong>School:</strong> ${spell.school}<br>
              • <strong>Effective Level:</strong> Level ${finalLevel} (Base ${spell.level})<br>
              • <strong>Casting Time:</strong> ${spell.castingTime || '1 standard action'}<br>
              • <strong>Range:</strong> ${spell.range || 'Touch'}<br>
              • <strong>Saving Throw:</strong> ${spell.savingThrow || 'None'}<br><br>
              <div style="font-size: 8.5px; font-style: italic; background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); padding: 4px; border-radius: 2px; line-height: 1.25;">
                ${spell.description}
              </div>
            </div>`,
            "Done!",
            ""
          );
        }
      }
    }
  };

  const handleUnprepare = (id: string) => {
    CombatState.updatePCBatch((freshPc: any) => {
      const prep = freshPc.preparedSpells?.find((s: any) => s.id === id);
      if (prep) {
        if (prep.isUsed) {
          const spell = findSpell(freshPc, prep.spellKey);
          if (spell) {
            const METAMAGIC_COSTS: Record<string, number> = { extend_spell: 1, empower_spell: 2, maximize_spell: 3, quicken_spell: 4 };
            const metamagicLevelAdjustment = prep.metamagic.reduce((sum: number, fId: string) => sum + (METAMAGIC_COSTS[fId] || 0), 0);
            const adjustedLevel = spell.level + metamagicLevelAdjustment;
            if (freshPc.spellSlots?.[adjustedLevel]) {
              freshPc.spellSlots[adjustedLevel].used = Math.max(0, (freshPc.spellSlots[adjustedLevel].used || 0) - 1);
            }
          }
        }
        freshPc.preparedSpells = freshPc.preparedSpells.filter((s: any) => s.id !== id);
      }
    });
  };

  const handleSaveTemplate = () => {
    const preps = pc.preparedSpells || [];
    if (preps.length === 0) {
      showCustomAlert("No Spells", "Prepare spells first to save them as a template.");
      return;
    }

    showCustomPrompt("Save Template 💾", "Please enter a name for your spell template:", "e.g. Standard Combat", (name: string) => {
      if (!name) return;
      const exists = pc.spellTemplates?.[name];
      const saveAction = () => {
        CombatState.updatePCBatch((freshPc: any) => {
          if (!freshPc.spellTemplates) freshPc.spellTemplates = {};
          freshPc.spellTemplates[name] = JSON.parse(JSON.stringify(freshPc.preparedSpells));
        });
        showCustomAlert("Saved", `The template "${name}" has been successfully saved.`, "Great", "✨");
      };

      if (exists) {
        showCustomConfirm("Overwrite Template?", `A template named "${name}" already exists. Do you want to overwrite it?`, () => {
          saveAction();
        });
      } else {
        saveAction();
      }
    });
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplate) {
      showCustomAlert("No Selection", "Please select a template from the dropdown first to delete.");
      return;
    }

    showCustomConfirm("Delete Template?", `Do you really want to permanently delete the template "${selectedTemplate}"?`, () => {
      CombatState.updatePCBatch((freshPc: any) => {
        if (freshPc.spellTemplates) {
          delete freshPc.spellTemplates[selectedTemplate];
        }
      });
      setSelectedTemplate('');
    });
  };

  const handleLoadTemplate = (name: string) => {
    if (!name) return;
    setSelectedTemplate(name);
    CombatState.updatePCBatch((freshPc: any) => {
      const template = freshPc.spellTemplates?.[name];
      if (template) {
        freshPc.preparedSpells = JSON.parse(JSON.stringify(template));
        // Reset slot bubble usages
        for (let lvl = 0; lvl <= 9; lvl++) {
          if (freshPc.spellSlots?.[lvl]) {
            freshPc.spellSlots[lvl].used = 0;
          }
        }
      }
    });
  };

  const handleClearPrepared = () => {
    const preps = pc.preparedSpells || [];
    if (preps.length === 0) return;

    showCustomConfirm("Clear Slots?", "Do you want to remove all prepared spells from your slots?", () => {
      CombatState.clearPreparedSpells();
    });
  };

  const handleShowPlaceholderAlert = () => {
    showCustomAlert("Prepare Spells", "Click on the <strong>[Prepare]</strong> button of the desired spell in your <strong>Spell Library</strong> on the left to configure it.");
  };

  const templates = pc.spellTemplates || {};

  return (
    <div style={{ background: 'rgba(200, 169, 110, 0.04)', border: '0.5px solid rgba(200, 169, 110, 0.3)', borderRadius: '2px', padding: '4px 6px' }}>
      <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', marginBottom: '5px', fontWeight: 'bold' }}>
        🌅 Daily Spell Slots (Prepared Spells)
      </div>

      {/* Spell Templates Management UI */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(200, 169, 110, 0.06)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderRadius: '2px', padding: '3px 5px', marginBottom: '6px' }}>
        <span style={{ fontSize: '8.5px', color: 'var(--inkl)', fontWeight: 'bold' }}>Templates:</span>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <select
            value={selectedTemplate}
            onChange={(e) => handleLoadTemplate(e.target.value)}
            className="cinput select-spell-template"
            style={{ fontSize: '8px', padding: '1px 3px', height: '16px', maxWidth: '95px', borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none', background: 'white', color: 'var(--ink)' }}
          >
            <option value="">-- Load --</option>
            {Object.keys(templates).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button
            onClick={handleSaveTemplate}
            className="btn"
            style={{ fontSize: '8px', padding: '1px 4px', height: '16px', lineHeight: 1, fontWeight: 'bold', borderColor: 'var(--pb)' }}
            title="Save current set as template"
          >
            💾 Save
          </button>
          <button
            onClick={handleDeleteTemplate}
            className="btn"
            style={{ fontSize: '8px', padding: '1px 3px', height: '16px', lineHeight: 1, borderColor: 'transparent', color: 'var(--inkl)' }}
            title="Delete selected template"
          >
            ✕
          </button>
          <button
            onClick={handleClearPrepared}
            className="btn"
            style={{ fontSize: '8px', padding: '1px 4px', height: '16px', lineHeight: 1, borderColor: 'var(--red)', background: 'rgba(139,26,26,0.05)', color: 'var(--red)', fontWeight: 'bold' }}
            title="Remove all prepared spells"
          >
            🧹 Clear
          </button>
        </div>
      </div>

      {/* Slots List per Level */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '250px', overflowY: 'auto', paddingRight: '2px' }} className="pc-scroll-spellbook">
        {levelsToRender.map(lvl => {
          const max = pc.spellSlots?.[lvl]?.max || 0;
          if (max === 0) return null;

          const hasSpecSlotAtLvl = hasSpecSlot && lvl >= 1;
          const specSchoolName = hasSpecSlotAtLvl ? getSchoolLabel(wizardSpecialization) : '';

          // Get prepared spells at this level
          const preps = (pc.preparedSpells || []).map((p: any) => {
            const spell = findSpell(pc, p.spellKey);
            if (!spell) return null;
            const adjustedLevel = SpellSlotCalculator.getAdjustedSpellLevel(spell, p.metamagic);
            return { ...p, spell, adjustedLevel };
          }).filter((p: any) => p && p.adjustedLevel === lvl);

          const specPreps = preps.filter((p: any) => p.isSpecialist);
          const regPreps = preps.filter((p: any) => !p.isSpecialist);

          const numSpecSlots = hasSpecSlotAtLvl ? 1 : 0;
          const numRegSlots = Math.max(0, max - numSpecSlots);

          const slotsListHtml = [];

          // Render regular slots
          for (let i = 0; i < numRegSlots; i++) {
            const p = regPreps[i];
            if (p) {
              slotsListHtml.push(
                <div key={`reg_${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: p.isUsed ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.45)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '2px 4px', fontSize: '9px', opacity: p.isUsed ? 0.65 : 1 }}>
                  <span
                    onClick={() => showSpellDetailsDialog(p.spell, p.spellKey, pc)}
                    style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--red)', fontFamily: "'Crimson Text', serif", fontSize: '9.5px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '4px' }}
                  >
                    📜 {p.spell.nameEn || p.spell.nameDe} {p.metamagic.length > 0 && <span style={{ fontSize: '8px', color: 'var(--red)', fontWeight: 'bold' }}>[M]</span>}
                  </span>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                    {p.isUsed ? (
                      <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', padding: '1px 3px' }}>Expended</span>
                    ) : (
                      <button
                        onClick={() => handleCastPrepared(p.id)}
                        className="btn"
                        style={{ fontSize: '8px', padding: '1px 3px', cursor: 'pointer', borderRadius: '2px', background: 'rgba(139,26,26,0.1)', borderColor: 'var(--red)', color: 'var(--red)', fontWeight: 'bold' }}
                      >
                        Cast
                      </button>
                    )}
                    <button
                      onClick={() => handleUnprepare(p.id)}
                      className="btn"
                      style={{ fontSize: '8px', padding: '1px 3px', borderColor: 'transparent', color: 'var(--inkl)', cursor: 'pointer' }}
                      title="Clear slot"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            } else {
              slotsListHtml.push(
                <div key={`reg_empty_${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px', padding: '2px 4px', fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic' }}>
                  <span>Empty Slot</span>
                  <button
                    onClick={handleShowPlaceholderAlert}
                    className="btn"
                    style={{ fontSize: '7px', padding: '0.5px 4px', borderColor: 'var(--pb)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer' }}
                  >
                    ➕ Prepare
                  </button>
                </div>
              );
            }
          }

          // Render specialist slot if wizard has specialization
          if (hasSpecSlotAtLvl) {
            const p = specPreps[0];
            if (p) {
              slotsListHtml.push(
                <div key="spec" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: p.isUsed ? 'rgba(0,0,0,0.04)' : 'rgba(200, 169, 110, 0.05)', border: '0.5px solid #c8a96e', borderRadius: '2px', padding: '2px 4px', fontSize: '9px', opacity: p.isUsed ? 0.65 : 1 }}>
                  <span
                    onClick={() => showSpellDetailsDialog(p.spell, p.spellKey, pc)}
                    style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--red)', fontFamily: "'Crimson Text', serif", fontSize: '9.5px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '4px' }}
                  >
                    ⭐ 📜 {p.spell.nameEn || p.spell.nameDe} {p.metamagic.length > 0 && <span style={{ fontSize: '8px', color: 'var(--red)', fontWeight: 'bold' }}>[M]</span>}
                  </span>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                    {p.isUsed ? (
                      <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', padding: '1px 3px' }}>Expended</span>
                    ) : (
                      <button
                        onClick={() => handleCastPrepared(p.id)}
                        className="btn"
                        style={{ fontSize: '8px', padding: '1px 3px', cursor: 'pointer', borderRadius: '2px', background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)', borderColor: 'var(--red)', color: 'white', fontWeight: 'bold' }}
                      >
                        Cast
                      </button>
                    )}
                    <button
                      onClick={() => handleUnprepare(p.id)}
                      className="btn"
                      style={{ fontSize: '8px', padding: '1px 3px', borderColor: 'transparent', color: 'var(--inkl)', cursor: 'pointer' }}
                      title="Clear slot"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            } else {
              slotsListHtml.push(
                <div key="spec_empty" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(200, 169, 110, 0.03)', border: '0.5px dashed #c8a96e', borderRadius: '2px', padding: '2px 4px', fontSize: '9px', color: '#9a7a2e', fontStyle: 'italic' }}>
                  <span>⭐ Specialist Slot ({specSchoolName})</span>
                  <button
                    onClick={handleShowPlaceholderAlert}
                    className="btn"
                    style={{ fontSize: '7px', padding: '0.5px 4px', border: '0.5px solid #c8a96e', background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)', color: 'white', cursor: 'pointer' }}
                  >
                    ➕ Prepare
                  </button>
                </div>
              );
            }
          }

          // If there are extra prepared spells, render them too
          const extraRegPreps = regPreps.slice(numRegSlots);
          extraRegPreps.forEach((p: any, extraIdx: number) => {
            slotsListHtml.push(
              <div key={`extra_${extraIdx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: p.isUsed ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.45)', border: '0.5px solid var(--red)', borderRadius: '2px', padding: '2px 4px', fontSize: '9px', opacity: p.isUsed ? 0.65 : 1 }}>
                <span
                  onClick={() => showSpellDetailsDialog(p.spell, p.spellKey, pc)}
                  style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--red)', fontFamily: "'Crimson Text', serif", fontSize: '9.5px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '4px' }}
                >
                  ⚠️ 📜 {p.spell.nameEn || p.spell.nameDe} {p.metamagic.length > 0 && <span style={{ fontSize: '8px', color: 'var(--red)', fontWeight: 'bold' }}>[M]</span>}
                </span>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                  {p.isUsed ? (
                    <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', padding: '1px 3px' }}>Expended</span>
                  ) : (
                    <button
                      onClick={() => handleCastPrepared(p.id)}
                      className="btn"
                      style={{ fontSize: '8px', padding: '1px 3px', cursor: 'pointer', borderRadius: '2px', background: 'rgba(139,26,26,0.1)', borderColor: 'var(--red)', color: 'var(--red)', fontWeight: 'bold' }}
                    >
                      Cast
                    </button>
                  )}
                  <button
                    onClick={() => handleUnprepare(p.id)}
                    className="btn"
                    style={{ fontSize: '8px', padding: '1px 3px', borderColor: 'transparent', color: 'var(--inkl)', cursor: 'pointer' }}
                    title="Clear slot"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          });

          return (
            <div key={lvl} style={{ marginBottom: '2px' }}>
              <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--inkl)', borderBottom: '0.5px dashed rgba(200, 169, 110, 0.3)', paddingBottom: '1px', fontWeight: 'bold', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Level {lvl} Slots</span>
                <span style={{ fontSize: '8px', fontWeight: 'normal' }}>Prepared: {preps.length} / {max}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {slotsListHtml}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
