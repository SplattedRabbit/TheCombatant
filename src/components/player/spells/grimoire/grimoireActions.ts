/**
 * @module    grimoireActions
 * @summary   Encapsulated actions for casting, slot tracking, preparation, and template management.
 */

import { CombatState } from '@core/state.js';
import { findSpell } from '@core/ui/components/player/PCSpellbookTab.js';
import {
  showCustomAlert,
  showCustomConfirm,
  showCustomPrompt,
  showPrepareSpellDialog,
  showCastSpontaneousSpellDialog,
} from '@core/ui/components/dialogs.js';
import { showCastSuccessDialog } from '@core/ui/components/player/PCBuffsDialog.js';

export const METAMAGIC_COSTS: Record<string, number> = {
  extend_spell: 1,
  empower_spell: 2,
  maximize_spell: 3,
  quicken_spell: 4,
};

/**
 * Handles clicking a slot bubble to spend or restore a slot.
 */
export function handleSlotBubbleToggle(pc: any, lvl: number, bubbleIdx: number) {
  const currentUsed = pc.spellSlots?.[lvl]?.used || 0;
  const newUsed = bubbleIdx <= currentUsed ? bubbleIdx - 1 : bubbleIdx;
  CombatState.updatePCSpellSlotsUsed(lvl, newUsed);
}

/**
 * Casts a prepared spell, expending the matching slot and marking it as used.
 */
export function castPreparedSpell(pc: any, prepId: string) {
  let castPrep: any = null;
  CombatState.updatePCBatch((freshPc: any) => {
    const p = freshPc.preparedSpells?.find((s: any) => s.id === prepId);
    if (p && !p.isUsed) {
      p.isUsed = true;
      castPrep = JSON.parse(JSON.stringify(p));

      const spell = findSpell(freshPc, p.spellKey);
      if (spell) {
        const metamagicAdjustment = (p.metamagic || []).reduce(
          (sum: number, fId: string) => sum + (METAMAGIC_COSTS[fId] || 0),
          0
        );
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
        showCustomAlert(
          'Spell Cast! ✨',
          `<div style="font-family:var(--font-body); font-size:10px; text-align:left; color:var(--ink); line-height:1.35;">
            <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:var(--font-title); color: var(--red); font-size: 11px;">
              ${pc.name} casts: ${spell.name || spell.nameEn}!
            </div>
            • <strong>School:</strong> ${spell.school}<br>
            • <strong>Level:</strong> Level ${spell.level}<br>
            • <strong>Range:</strong> ${spell.range || 'Touch'}<br>
            • <strong>Saving Throw:</strong> ${spell.savingThrow || 'None'}<br>
          </div>`
        );
      }
    }
  }
}

/**
 * Restores an expended prepared spell (undo cast).
 */
export function restorePreparedSpell(prepId: string, lvl: number) {
  CombatState.updatePCBatch((freshPc: any) => {
    const p = freshPc.preparedSpells?.find((s: any) => s.id === prepId);
    if (p && p.isUsed) {
      p.isUsed = false;
      if (freshPc.spellSlots?.[lvl] && freshPc.spellSlots[lvl].used > 0) {
        freshPc.spellSlots[lvl].used = Math.max(0, freshPc.spellSlots[lvl].used - 1);
      }
    }
  });
}

/**
 * Removes a spell from prepared slots.
 */
export function unprepareSpell(prepId: string) {
  CombatState.updatePCBatch((freshPc: any) => {
    const prep = freshPc.preparedSpells?.find((s: any) => s.id === prepId);
    if (prep) {
      if (prep.isUsed) {
        const spell = findSpell(freshPc, prep.spellKey);
        if (spell && freshPc.spellSlots?.[spell.level]) {
          freshPc.spellSlots[spell.level].used = Math.max(0, (freshPc.spellSlots[spell.level].used || 0) - 1);
        }
      }
      freshPc.preparedSpells = freshPc.preparedSpells.filter((s: any) => s.id !== prepId);
    }
  });
}

/**
 * Casts a spontaneous spell using slot choice modal.
 */
export function castSpontaneousSpell(pc: any, spellKey: string) {
  showCastSpontaneousSpellDialog(pc, spellKey, () => {});
}

/**
 * Opens inline dialog to prepare a spell into a slot.
 */
export function openPrepareSlotDialog(pc: any, defaultLevel?: number, onOpenCompendium?: () => void) {
  const learned = Array.isArray(pc.learnedSpells) ? pc.learnedSpells : [];
  if (learned.length === 0) {
    showCustomConfirm(
      'Empty Spellbook',
      'You have not learned any spells yet. Would you like to open the Compendium to add spells to your spellbook?',
      () => onOpenCompendium?.()
    );
    return;
  }

  let candidateKey = learned[0];
  if (defaultLevel !== undefined) {
    const match = learned.find((k: string) => {
      const sp = findSpell(pc, k);
      return sp && sp.level === defaultLevel;
    });
    if (match) candidateKey = match;
  }

  showPrepareSpellDialog(pc, candidateKey, () => {});
}

/**
 * Template management actions.
 */
export function saveCurrentTemplate(pc: any) {
  const preps = pc.preparedSpells || [];
  if (preps.length === 0) {
    showCustomAlert('No Spells', 'Prepare spells first to save them as a template.');
    return;
  }

  showCustomPrompt(
    'Save Template 💾',
    'Please enter a name for your spell template:',
    'e.g. Combat Setup',
    (name: string) => {
      if (!name) return;
      CombatState.updatePCBatch((freshPc: any) => {
        if (!freshPc.spellTemplates) freshPc.spellTemplates = {};
        freshPc.spellTemplates[name] = JSON.parse(JSON.stringify(freshPc.preparedSpells));
      });
      showCustomAlert('Saved', `Template "${name}" has been saved.`, 'OK', '✨');
    }
  );
}

export function loadTemplate(name: string) {
  if (!name) return;
  CombatState.updatePCBatch((freshPc: any) => {
    const template = freshPc.spellTemplates?.[name];
    if (template) {
      freshPc.preparedSpells = JSON.parse(JSON.stringify(template));
      for (let lvl = 0; lvl <= 9; lvl++) {
        if (freshPc.spellSlots?.[lvl]) {
          freshPc.spellSlots[lvl].used = 0;
        }
      }
    }
  });
}

export function deleteTemplate(name: string) {
  showCustomConfirm('Delete Template?', `Delete template "${name}"?`, () => {
    CombatState.updatePCBatch((freshPc: any) => {
      if (freshPc.spellTemplates?.[name]) {
        delete freshPc.spellTemplates[name];
      }
    });
  });
}
