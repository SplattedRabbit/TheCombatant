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
import { SpellTemplateBar } from './SpellTemplateBar';
import { PreparedSlotRow } from './PreparedSlotRow';

import { useDialog } from '../../../context/DialogContext.tsx';

interface PCSpellPreparationProps {
  pc: any;
}

export const PCSpellPreparation: React.FC<PCSpellPreparationProps> = ({ pc }) => {
  const { showCastSuccess } = useDialog();
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
          showCastSuccess(pc, spell, castPrep.spellKey, castPrep.metamagic || [], () => {});
        } else {
          const METAMAGIC_COSTS: Record<string, number> = { extend_spell: 1, empower_spell: 2, maximize_spell: 3, quicken_spell: 4 };
          const metamagicNames: Record<string, string> = { extend_spell: 'Extended', empower_spell: 'Empowered', maximize_spell: 'Maximized', quicken_spell: 'Quickened' };
          const appliedMeta = castPrep.metamagic.map((mId: string) => metamagicNames[mId] || mId);
          const metaSuffix = appliedMeta.length > 0 ? ` (${appliedMeta.join(', ')})` : '';

          const metamagicAdjustment = castPrep.metamagic.reduce((sum: number, fId: string) => sum + (METAMAGIC_COSTS[fId] || 0), 0);
          const finalLevel = spell.level + metamagicAdjustment;

          showCustomAlert(
            "Spell Cast! ✨",
            `<div style="font-family:var(--font-body); font-size:10px; text-align:left; color:var(--ink); line-height:1.35;">
              <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:var(--font-title); color: var(--red); font-size: 11px;">
                ${pc.name} casts prepared spell: ${spell.name || spell.nameEn}${metaSuffix}!
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
      <div style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', marginBottom: '5px', fontWeight: 'bold' }}>
        🌅 Daily Spell Slots (Prepared Spells)
      </div>

      {/* Spell Templates Management UI */}
      <SpellTemplateBar
        templates={templates}
        selectedTemplate={selectedTemplate}
        onLoadTemplate={handleLoadTemplate}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onClearPrepared={handleClearPrepared}
      />

      {/* Slots List per Level */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '250px', overflowY: 'auto', paddingRight: '2px' }} className="pc-scroll-spellbook">
        {levelsToRender.map(lvl => {
          const max = pc.spellSlots?.[lvl]?.max || 0;
          if (max === 0) return null;

          const hasSpecSlotAtLvl = hasSpecSlot && lvl >= 1;
          const specSchoolName = hasSpecSlotAtLvl ? getSchoolLabel(wizardSpecialization) : '';

          const isCleric = pc.classes && pc.classes.some((c: any) => c.classType === 'cleric');
          const hasDomainSlotAtLvl = isCleric && lvl >= 1;

          // Get prepared spells at this level
          const preps = (pc.preparedSpells || []).map((p: any) => {
            const spell = findSpell(pc, p.spellKey);
            if (!spell) return null;
            const adjustedLevel = SpellSlotCalculator.getAdjustedSpellLevel(spell, p.metamagic, pc);
            return { ...p, spell, adjustedLevel };
          }).filter((p: any) => p && p.adjustedLevel === lvl);

          const specPreps = preps.filter((p: any) => p.isSpecialist);
          const domainPreps = preps.filter((p: any) => p.isDomain);
          const regPreps = preps.filter((p: any) => !p.isSpecialist && !p.isDomain);

          const numSpecSlots = hasSpecSlotAtLvl ? 1 : 0;
          const numDomainSlots = hasDomainSlotAtLvl ? 1 : 0;
          const numRegSlots = Math.max(0, max - numSpecSlots - numDomainSlots);

          const slotsListHtml = [];

          // Render regular slots
          for (let i = 0; i < numRegSlots; i++) {
            slotsListHtml.push(
              <PreparedSlotRow
                key={`reg_${i}`}
                prep={regPreps[i]}
                slotType="regular"
                pc={pc}
                onCast={handleCastPrepared}
                onUnprepare={handleUnprepare}
                onPrepareClick={handleShowPlaceholderAlert}
              />
            );
          }

          // Render specialist slot if wizard has specialization
          if (hasSpecSlotAtLvl) {
            slotsListHtml.push(
              <PreparedSlotRow
                key="spec"
                prep={specPreps[0]}
                slotType="specialist"
                pc={pc}
                specSchoolName={specSchoolName}
                onCast={handleCastPrepared}
                onUnprepare={handleUnprepare}
                onPrepareClick={handleShowPlaceholderAlert}
              />
            );
          }

          // Render cleric domain slot
          if (hasDomainSlotAtLvl) {
            slotsListHtml.push(
              <PreparedSlotRow
                key="domain"
                prep={domainPreps[0]}
                slotType="domain"
                pc={pc}
                onCast={handleCastPrepared}
                onUnprepare={handleUnprepare}
                onPrepareClick={handleShowPlaceholderAlert}
              />
            );
          }

          // If there are extra prepared spells, render them too
          const extraRegPreps = regPreps.slice(numRegSlots);
          extraRegPreps.forEach((p: any, extraIdx: number) => {
            slotsListHtml.push(
              <PreparedSlotRow
                key={`extra_${extraIdx}`}
                prep={p}
                slotType="extra"
                pc={pc}
                onCast={handleCastPrepared}
                onUnprepare={handleUnprepare}
                onPrepareClick={handleShowPlaceholderAlert}
              />
            );
          });

          return (
            <div key={lvl} style={{ marginBottom: '2px' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--inkl)', borderBottom: '0.5px dashed rgba(200, 169, 110, 0.3)', paddingBottom: '1px', fontWeight: 'bold', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
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
